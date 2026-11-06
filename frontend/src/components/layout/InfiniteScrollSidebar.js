// src/components/layout/InfiniteScrollSidebar.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchPagedGeometries } from '../../api/search-api';
import COLORS from '../common/COLORS';
import LoadingSpinner from '../common/LoadingSpinner';

const InfiniteScrollSidebar = ({
    selectedType,
    selectedId,
    setSelectedId,
    handleView,
    handleDelete,
    iconMap,
    titleMap,
    refreshTrigger
}) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [error, setError] = useState(null);

    const observerRef = useRef();
    const pageSize = 15; // Items per page

    useEffect(() => {
        console.log(`🔄 Resetting infinite scroll data for type: ${selectedType}, trigger: ${refreshTrigger}`);
        setItems([]);
        setPage(1);
        setHasMore(true);
        setError(null);
        loadInitialData();
    }, [selectedType, refreshTrigger]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const response = await fetchPagedGeometries[selectedType + 's'](1, pageSize);
            const pagedData = response.data;

            console.log(`📄 Loaded page 1 for ${selectedType}:`, pagedData);

            setItems(pagedData.data || []);
            setHasMore(pagedData.hasNextPage);
            setPage(2);
            setError(null);
        } catch (err) {
            console.error(`Error loading initial ${selectedType} data:`, err);
            setError(`Failed to load ${selectedType}s`);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreData = useCallback(async () => {
        if (loading || !hasMore) return;

        console.log(`📄 Loading page ${page} for ${selectedType}`);
        setLoading(true);

        try {
            const response = await fetchPagedGeometries[selectedType + 's'](page, pageSize);
            const pagedData = response.data;

            console.log(`📄 Loaded page ${page} for ${selectedType}:`, pagedData.data.length, 'items');

            setItems(prev => [...prev, ...pagedData.data]);
            setHasMore(pagedData.hasNextPage);
            setPage(prev => prev + 1);
            setError(null);
        } catch (err) {
            console.error(`Error loading more ${selectedType} data:`, err);
            setError(`Failed to load more ${selectedType}s`);
        } finally {
            setLoading(false);
        }
    }, [selectedType, page, loading, hasMore]);

    const lastItemRef = useCallback(node => {
        if (loading) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                console.log('🔽 Reached end, loading more...');
                loadMoreData();
            }
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        if (node) observerRef.current.observe(node);
    }, [loading, hasMore, loadMoreData]);

    return (
        <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            backgroundColor: COLORS.background
        }}>
            {error && (
                <div style={{
                    backgroundColor: '#fee',
                    color: '#c53030',
                    padding: '12px',
                    borderRadius: 8,
                    marginBottom: 16,
                    fontSize: '14px',
                    textAlign: 'center'
                }}>
                    ⚠️ {error}
                    <button
                        onClick={loadInitialData}
                        style={{
                            marginLeft: 8,
                            padding: '4px 8px',
                            background: '#c53030',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        Yeniden Dene
                    </button>
                </div>
            )}

            {items.length === 0 && !loading ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: COLORS.textSecondary
                }}>
                    <div style={{ fontSize: '64px', marginBottom: 20, opacity: 0.3 }}>
                        {iconMap[selectedType]}
                    </div>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: 500, color: COLORS.text }}>
                        No {titleMap[selectedType].toLowerCase()} yet
                    </p>
                    <p style={{ margin: '12px 0 0 0', fontSize: '14px' }}>
                        Use the map controls or manual entry to add your first {selectedType}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {items.map((item, index) => {
                        const isSelected = selectedId === item.id;
                        const isLast = index === items.length - 1;
                        let coordsDisplay = null;

                        if (selectedType === 'point') {
                            const match = item.wkt.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/);
                            if (match) {
                                const lon = parseFloat(match[1]).toFixed(6);
                                const lat = parseFloat(match[2]).toFixed(6);
                                coordsDisplay = (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        marginTop: 8,
                                        fontSize: '13px',
                                        color: COLORS.textSecondary,
                                        fontFamily: 'monospace',
                                        backgroundColor: COLORS.background,
                                        padding: '8px 12px',
                                        borderRadius: 8,
                                        border: `1px solid ${COLORS.border}`
                                    }}>
                                        <span>📌</span>
                                        <span>{lon}, {lat}</span>
                                    </div>
                                );
                            }
                        }

                        return (
                            <div
                                key={item.id}
                                ref={isLast ? lastItemRef : null}
                                className="fade-in"
                                style={{
                                    padding: 20,
                                    backgroundColor: isSelected ? '#eff6ff' : COLORS.cardBg,
                                    borderRadius: 12,
                                    boxShadow: isSelected
                                        ? `0 8px 24px ${COLORS.shadow}`
                                        : `0 2px 8px ${COLORS.shadow}`,
                                    border: isSelected ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                                }}
                                onClick={() => setSelectedId(isSelected ? null : item.id)}
                                onMouseEnter={e => {
                                    if (!isSelected) {
                                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                                        e.currentTarget.style.boxShadow = `0 8px 20px ${COLORS.shadowHover}`;
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!isSelected) {
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                        e.currentTarget.style.boxShadow = `0 2px 8px ${COLORS.shadow}`;
                                    }
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: coordsDisplay ? 0 : 12
                                }}>
                                    <h3 style={{
                                        margin: 0,
                                        color: COLORS.text,
                                        fontSize: '18px',
                                        fontWeight: 600,
                                        flex: 1,
                                        wordBreak: 'break-word'
                                    }}>
                                        {item.name}
                                    </h3>
                                    <span style={{
                                        backgroundColor: isSelected ? COLORS.primary : COLORS.background,
                                        color: isSelected ? 'white' : COLORS.textSecondary,
                                        padding: '4px 10px',
                                        borderRadius: 16,
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        marginLeft: 12
                                    }}>
                                        #{item.id}
                                    </span>
                                </div>

                                {coordsDisplay}

                                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                                    <button
                                        type="button"
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleView(item.id);
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '10px 16px',
                                            backgroundColor: COLORS.primary,
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 8,
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        👁️ View
                                    </button>
                                    <button
                                        type="button"
                                        onClick={e => {
                                            e.stopPropagation();
                                            console.log(`🗑️ Delete button clicked for ${selectedType} #${item.id}`);
                                            handleDelete(item.id, selectedType);
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '10px 16px',
                                            backgroundColor: COLORS.danger,
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 8,
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.backgroundColor = COLORS.dangerHover;
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.backgroundColor = COLORS.danger;
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                        title={`Delete ${selectedType} "${item.name}"`}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Loading indicator at bottom */}
                    {loading && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            padding: '20px',
                            color: COLORS.textSecondary
                        }}>
                            <LoadingSpinner />
                            <span style={{ marginLeft: 12 }}>Loading more...</span>
                        </div>
                    )}

                    {/* End of results indicator */}
                    {!hasMore && items.length > 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '20px',
                            color: COLORS.textSecondary,
                            fontSize: '14px',
                            fontWeight: 500
                        }}>
                            🎉 All {titleMap[selectedType].toLowerCase()} loaded! ({items.length} total)
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InfiniteScrollSidebar;