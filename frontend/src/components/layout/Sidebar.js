import React from 'react';
import COLORS from '../common/COLORS';
import LoadingSpinner from '../common/LoadingSpinner';

const Sidebar = ({
    itemsForList,
    selectedType,
    loading,
    selectedId,
    setSelectedId,
    handleView,
    handleDelete,
    iconMap,
    titleMap
}) => {
    return (
        <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            backgroundColor: COLORS.background
        }}>
            {loading[selectedType] ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: COLORS.textSecondary
                }}>
                    <LoadingSpinner />
                    <p style={{ marginTop: 16, fontSize: '16px' }}>
                        Loading {titleMap[selectedType].toLowerCase()}...
                    </p>
                </div>
            ) : itemsForList.length === 0 ? (
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
                        Use the map controls to add your first {selectedType}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {itemsForList.map(item => {
                        const isSelected = selectedId === item.id;
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
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Sidebar;