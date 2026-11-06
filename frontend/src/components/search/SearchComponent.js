import React, { useState, useEffect, useRef, useMemo } from 'react';
import { searchGeometries } from '../../api/search-api';
import COLORS from '../common/COLORS';

const SearchComponent = ({ onResultSelect, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [geometryFilter, setGeometryFilter] = useState('all');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const searchRef = useRef(null);
    const resultsRef = useRef(null);

    const debouncedSearch = useMemo(() => debounce(async (term, filter) => {
            if (term.trim().length < 2) {
                setResults([]);
                setShowResults(false);
                return;
            }

            setLoading(true);
            try {
                const response = await searchGeometries(term, filter === 'all' ? null : filter);
                setResults(response.data || []);
                setShowResults(true);
                setSelectedIndex(-1);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300), []);

    useEffect(() => {
        if (searchTerm.trim()) {
            debouncedSearch(searchTerm, geometryFilter);
        } else {
            setResults([]);
            setShowResults(false);
        }
    }, [searchTerm, geometryFilter, debouncedSearch]);

    const handleKeyDown = (e) => {
        if (!showResults || results.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < results.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && results[selectedIndex]) {
                    handleResultClick(results[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowResults(false);
                setSelectedIndex(-1);
                break;
            default:
                break;
        }
    };

    const handleResultClick = (result) => {
        setSearchTerm(result.name);
        setShowResults(false);
        setSelectedIndex(-1);
        onResultSelect(result);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setResults([]);
        setShowResults(false);
        setSelectedIndex(-1);
        searchRef.current?.focus();
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (resultsRef.current && !resultsRef.current.contains(event.target) &&
                searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div style={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            width: '100%',
            maxWidth: 600,
            padding: '0 20px'
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                border: `2px solid ${COLORS.primary}`,
                overflow: 'hidden'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: showResults && results.length > 0 ? `1px solid ${COLORS.border}` : 'none'
                }}>
                    <div style={{
                        fontSize: '20px',
                        marginRight: 12,
                        color: COLORS.primary
                    }}>
                        🔍
                    </div>

                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="Search for points, lines or polygons..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            fontSize: '16px',
                            padding: '8px 0',
                            color: COLORS.text,
                            backgroundColor: 'transparent'
                        }}
                        autoFocus
                    />

                    <select
                        value={geometryFilter}
                        onChange={(e) => setGeometryFilter(e.target.value)}
                        style={{
                            marginLeft: 12,
                            marginRight: 8,
                            padding: '6px 12px',
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: 8,
                            fontSize: '14px',
                            backgroundColor: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">🌍 All</option>
                        <option value="point">📍 Points</option>
                        <option value="line">📏 Lines</option>
                        <option value="polygon">⬛ Polygons</option>
                    </select>

                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            style={{
                                marginLeft: 8,
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                border: 'none',
                                backgroundColor: COLORS.background,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px'
                            }}
                            title="Clear"
                        >
                            ✕
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        style={{
                            marginLeft: 8,
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            border: 'none',
                            backgroundColor: COLORS.danger,
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px'
                        }}
                        title="Close"
                    >
                        ✕
                    </button>
                </div>

                {loading && (
                    <div style={{
                        padding: '16px',
                        textAlign: 'center',
                        color: COLORS.textSecondary,
                        fontSize: '14px'
                    }}>
                        🔄 Searching...
                    </div>
                )}

                {showResults && !loading && (
                    <div ref={resultsRef} style={{
                        maxHeight: 400,
                        overflowY: 'auto'
                    }}>
                        {results.length === 0 ? (
                            <div style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: COLORS.textSecondary,
                                fontSize: '14px'
                            }}>
                                No results found for "{searchTerm}"
                            </div>
                        ) : (
                            <>
                                <div style={{
                                    padding: '8px 16px',
                                    fontSize: '12px',
                                    color: COLORS.textSecondary,
                                    backgroundColor: COLORS.background,
                                    borderBottom: `1px solid ${COLORS.border}`
                                }}>
                                    {results.length} results found
                                </div>

                                {results.map((result, index) => (
                                    <div
                                        key={`${result.type}-${result.id}`}
                                        onClick={() => handleResultClick(result)}
                                        style={{
                                            padding: '12px 16px',
                                            cursor: 'pointer',
                                            borderBottom: index < results.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                                            backgroundColor: index === selectedIndex ? '#eff6ff' : 'transparent',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12
                                        }}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                    >
                                        <div style={{
                                            fontSize: '18px'
                                        }}>
                                            {result.type === 'point' && '📍'}
                                            {result.type === 'line' && '📏'}
                                            {result.type === 'polygon' && '⬛'}
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontWeight: 600,
                                                color: COLORS.text,
                                                fontSize: '14px'
                                            }}>
                                                {result.name}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: COLORS.textSecondary,
                                                marginTop: 2
                                            }}>
                                                {result.type === 'point' && 'Point'}
                                                {result.type === 'line' && 'Line'}
                                                {result.type === 'polygon' && 'Polygon'}
                                                {' #'}{result.id}
                                                {result.centerX != null && result.centerY != null && (
                                                    <span style={{ marginLeft: 8 }}>
                                                        📌 {result.centerX.toFixed(6)}, {result.centerY.toFixed(6)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{
                                            padding: '4px 8px',
                                            borderRadius: 12,
                                            backgroundColor: index === selectedIndex ? COLORS.primary : COLORS.background,
                                            color: index === selectedIndex ? 'white' : COLORS.textSecondary,
                                            fontSize: '12px',
                                            fontWeight: 600
                                        }}>
                                            👁️ View
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export default SearchComponent;