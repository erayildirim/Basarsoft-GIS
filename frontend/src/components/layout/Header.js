import React from 'react';
import COLORS from '../common/COLORS';

const TAB_STYLE = {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    color: COLORS.textSecondary
};

const ACTIVE_TAB_STYLE = {
    backgroundColor: COLORS.primary,
    color: 'white',
    transform: 'translateY(-1px)',
    boxShadow: `0 4px 12px ${COLORS.shadow}`
};

const Header = ({
    selectedType,
    setSelectedType,
    setSelectedId,
    error,
    titleMap,
    iconMap,
    itemCount,
    onOpenSearch,
    onOpenManualEntry
}) => {
    return (
        <div style={{
            padding: '24px',
            borderBottom: `1px solid ${COLORS.border}`,
            backgroundColor: COLORS.cardBg
        }}>
            {error && (
                <div style={{
                    backgroundColor: '#fee',
                    color: '#c53030',
                    padding: '8px 12px',
                    borderRadius: 8,
                    marginBottom: 16,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Type Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {Object.entries(titleMap).map(([key, title]) => (
                    <button
                        key={key}
                        style={{
                            ...TAB_STYLE,
                            ...(selectedType === key ? ACTIVE_TAB_STYLE : {})
                        }}
                        onClick={() => {
                            setSelectedType(key);
                            setSelectedId(null);
                        }}
                        onMouseEnter={e => {
                            if (selectedType !== key) {
                                e.currentTarget.style.backgroundColor = '#e5e7eb';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }
                        }}
                        onMouseLeave={e => {
                            if (selectedType !== key) {
                                e.currentTarget.style.backgroundColor = '#f3f4f6';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }
                        }}
                        title={`Switch to ${title} (${key === 'point' ? '1' : key === 'line' ? '2' : '3'})`}
                    >
                        {iconMap[key]} {title}
                    </button>
                ))}
            </div>

            {/* Header Info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{
                    margin: 0,
                    color: COLORS.text,
                    fontSize: '24px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                }}>
                    {iconMap[selectedType]} {titleMap[selectedType]}
                </h2>
                <span style={{
                    backgroundColor: COLORS.primary,
                    color: 'white',
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: '14px',
                    fontWeight: 600
                }}>
                    {itemCount}
                </span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Search Button */}
                <button
                    onClick={onOpenSearch}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: `2px solid ${COLORS.primary}`,
                        borderRadius: 10,
                        backgroundColor: 'white',
                        color: COLORS.primary,
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = COLORS.primary;
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = `0 6px 20px ${COLORS.shadow}`;
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.color = COLORS.primary;
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                    title="Search all geometries (Ctrl+F)"
                >
                    🔍 Search All
                </button>

                {/* Manual Entry Button */}
                <button
                    onClick={() => onOpenManualEntry(selectedType)}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: 'none',
                        borderRadius: 10,
                        backgroundColor: selectedType === 'point' ? '#10b981' :
                            selectedType === 'line' ? '#3b82f6' : '#8b5cf6',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                    title={`Manually enter ${selectedType} with coordinates`}
                >
                    ✏️ Add {selectedType === 'point' ? 'Point' :
                        selectedType === 'line' ? 'Line' : 'Polygon'} Manually
                </button>

                {/* Feature Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 8,
                    marginTop: 8
                }}>
                    <button
                        onClick={() => onOpenManualEntry('point')}
                        disabled={selectedType === 'point'}
                        style={{
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: 8,
                            backgroundColor: selectedType === 'point' ? COLORS.border : '#10b981',
                            color: selectedType === 'point' ? COLORS.textSecondary : 'white',
                            cursor: selectedType === 'point' ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            transition: 'all 0.2s ease'
                        }}
                        title="Add point manually"
                    >
                        📍 Point
                    </button>

                    <button
                        onClick={() => onOpenManualEntry('line')}
                        disabled={selectedType === 'line'}
                        style={{
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: 8,
                            backgroundColor: selectedType === 'line' ? COLORS.border : '#3b82f6',
                            color: selectedType === 'line' ? COLORS.textSecondary : 'white',
                            cursor: selectedType === 'line' ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            transition: 'all 0.2s ease'
                        }}
                        title="Add line manually"
                    >
                        📏 Line
                    </button>

                    <button
                        onClick={() => onOpenManualEntry('polygon')}
                        disabled={selectedType === 'polygon'}
                        style={{
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: 8,
                            backgroundColor: selectedType === 'polygon' ? COLORS.border : '#8b5cf6',
                            color: selectedType === 'polygon' ? COLORS.textSecondary : 'white',
                            cursor: selectedType === 'polygon' ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            transition: 'all 0.2s ease'
                        }}
                        title="Add polygon manually"
                    >
                        ⬛ Polygon
                    </button>
                </div>
            </div>

            {/* Help Text */}
            <div style={{
                marginTop: 16,
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
                fontSize: '12px',
                color: COLORS.textSecondary,
                lineHeight: 1.4
            }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: COLORS.text }}>
                    💡 Guide;
                </div>
                • Ctrl+F: Search<br />
                • 1/2/3: Change Type<br />
                • You can draw on the map or add manually<br />
                • Scroll: Load more points
            </div>
        </div>
    );
};

export default Header;