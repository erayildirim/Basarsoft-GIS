import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    fetchAll,
    addGeometry,
    updateGeometry,
    deleteGeometry,
    getErrorMessage
} from './api/api';

import PointMap from './components/map/PointMap';
import Header from './components/layout/Header';
import InfiniteScrollSidebar from './components/layout/InfiniteScrollSidebar';
import SearchComponent from './components/search/SearchComponent';
import SuccessNotification from './components/common/SuccessNotification';
import { ManualPointModal, ManualLineModal, ManualPolygonModal } from './components/forms/ManualEntryModals';
import COLORS from './components/common/COLORS';
import './App.css';

function App() {
    const mapRef = useRef();

    const [selectedType, setSelectedType] = useState('point');
    const [points, setPoints] = useState([]);
    const [lines, setLines] = useState([]);
    const [polygons, setPolygons] = useState([]);
    const [, setLoading] = useState({ point: true, line: true, polygon: true });
    const [selectedId, setSelectedId] = useState(null);
    const [error, setError] = useState(null);

    const [showSearch, setShowSearch] = useState(false);
    const [showManualEntry, setShowManualEntry] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [focusRequest, setFocusRequest] = useState(null);

    const titleMap = { point: 'Points', line: 'Lines', polygon: 'Polygons' };
    const iconMap = { point: '📍', line: '📏', polygon: '⬛' };

    const fetchers = {
        point: fetchAll.point,
        line: fetchAll.line,
        polygon: fetchAll.polygon
    };

    const setters = {
        point: setPoints,
        line: setLines,
        polygon: setPolygons
    };

    const fetchAllGeometries = async type => {
        setLoading(prev => ({ ...prev, [type]: true }));
        try {
            const { data } = await fetchers[type]();
            setters[type](data);
            setError(null);
        } catch (err) {
            console.error(`Error fetching ${type}:`, err);
            setError(`Failed to load ${type}s`);
        } finally {
            setLoading(prev => ({ ...prev, [type]: false }));
        }
    };

    useEffect(() => {
        ['point', 'line', 'polygon'].forEach(type => fetchAllGeometries(type));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // load once on mount

    const handleAdd = async (name, wkt) => {
        try {
            console.log(`Adding ${selectedType}:`, { name, wkt });
            await addGeometry[selectedType](name, wkt);
            await fetchAllGeometries(selectedType);

            setRefreshTrigger(prev => prev + 1);

            showSuccessMessage(`${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} "${name}" added successfully!`);
        } catch (err) {
            console.error(`Add ${selectedType} error:`, err);
            // Re-throw so the map popup stays open and shows the server's message.
            throw err;
        }
    };

    const handleUpdate = async (id, name, wkt, featureType) => {
        try {
            const actualType = featureType || selectedType;
            console.log(`Updating ${actualType}:`, { id, name, wkt, actualType });

            if (!id) {
                throw new Error('ID is required for update');
            }

            await updateGeometry[actualType](id, name, wkt);
            await fetchAllGeometries(actualType);

            setRefreshTrigger(prev => prev + 1);

            showSuccessMessage(`${actualType.charAt(0).toUpperCase() + actualType.slice(1)} "${name}" updated successfully!`);
        } catch (err) {
            console.error(`Update ${featureType || selectedType} error:`, err);
            // Re-throw so the edit popup stays open and shows the server's message.
            throw err;
        }
    };

    const handleDelete = async (id, featureType) => {
        const typeToDelete = featureType || selectedType;
        if (window.confirm(`Are you sure you want to delete this ${typeToDelete}?`)) {
            try {
                console.log(`Deleting ${typeToDelete} with ID:`, id);

                const response = await deleteGeometry[typeToDelete](id);
                console.log(`Delete response:`, response.data);

                setters[typeToDelete](prev => prev.filter(i => i.id !== id));

                if (selectedId === id) setSelectedId(null);

                await fetchAllGeometries(typeToDelete);

                setRefreshTrigger(prev => prev + 1);

                setError(null);

                showSuccessMessage(`${typeToDelete.charAt(0).toUpperCase() + typeToDelete.slice(1)} #${id} deleted successfully.`);

                console.log(`Successfully deleted ${typeToDelete} #${id}`);

            } catch (err) {
                console.error(`Delete ${typeToDelete} error:`, err);

                if (err.response?.status === 200 || err.response?.data?.success) {
                    console.log(`Delete was actually successful despite error response`);

                    setters[typeToDelete](prev => prev.filter(i => i.id !== id));
                    if (selectedId === id) setSelectedId(null);
                    await fetchAllGeometries(typeToDelete);
                    setRefreshTrigger(prev => prev + 1);
                    setError(null);
                } else {
                    setError(`Failed to delete ${typeToDelete}: ${getErrorMessage(err)}`);
                }
            }
        }
    };

    const handleView = id => {
        if (mapRef.current?.focusOnFeature) {
            mapRef.current.focusOnFeature(selectedType, id);
            setSelectedId(id);
        }
    };

    const handleSearchResultSelect = (result) => {
        console.log('Search result selected:', result);

        setSelectedType(result.type);
        setSelectedId(result.id);
        // Focus after the re-render: switching type clears the map selection first.
        setFocusRequest({ type: result.type, id: result.id });

        setShowSearch(false);
    };

    useEffect(() => {
        if (focusRequest && mapRef.current?.focusOnFeature) {
            mapRef.current.focusOnFeature(focusRequest.type, focusRequest.id);
        }
    }, [focusRequest]);

    const handleManualEntrySuccess = () => {
        console.log('Manual entry successful, refreshing data...');

        fetchAllGeometries(selectedType);

        setRefreshTrigger(prev => prev + 1);

        showSuccessMessage(`Manual ${selectedType} entry completed successfully!`);

        setShowManualEntry(null);
    };

    const handleOpenManualEntry = (type) => {
        setSelectedType(type);
        setShowManualEntry(type);
    };

    const showSuccessMessage = (message) => {
        setSuccessMessage(message);
        setShowSuccess(true);
    };

    const hideSuccessMessage = () => {
        setShowSuccess(false);
        setSuccessMessage('');
    };

    const itemsForList = useMemo(() => {
        return selectedType === 'point' ? points :
            selectedType === 'line' ? lines : polygons;
    }, [selectedType, points, lines, polygons]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                setShowSearch(true);
            }

            if (e.key === 'Escape' && showSearch) {
                setShowSearch(false);
            }

            // Don't hijack number keys while the user is typing (e.g. a name like "Route 2").
            const tag = e.target?.tagName;
            const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable;

            if (!showSearch && !showManualEntry && !isTyping && !e.ctrlKey && !e.metaKey && !e.altKey) {
                if (e.key === '1') setSelectedType('point');
                if (e.key === '2') setSelectedType('line');
                if (e.key === '3') setSelectedType('polygon');
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showSearch, showManualEntry]);

    return (
        <div className="app-layout" style={{ backgroundColor: COLORS.background }}>
            <div className="app-map">
                <PointMap
                    ref={mapRef}
                    points={points}
                    lines={lines}
                    polygons={polygons}
                    onAdd={handleAdd}
                    onUpdate={handleUpdate}
                    selectedType={selectedType}
                />

                {showSearch && (
                    <SearchComponent
                        onResultSelect={handleSearchResultSelect}
                        onClose={() => setShowSearch(false)}
                    />
                )}

                {!showSearch && (
                    <button
                        className="search-toggle"
                        onClick={() => setShowSearch(true)}
                        style={{
                            position: 'absolute',
                            top: 20,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 999,
                            padding: '12px 24px',
                            backgroundColor: 'white',
                            border: `2px solid ${COLORS.primary}`,
                            borderRadius: 25,
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 600,
                            color: COLORS.primary,
                            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}
                        title="Search (Ctrl+F)"
                    >
                        🔍 Search
                    </button>
                )}
            </div>

            <div className="app-sidebar" style={{
                backgroundColor: COLORS.cardBg,
                boxShadow: `-4px 0 24px ${COLORS.shadow}`
            }}>
                <Header
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    setSelectedId={setSelectedId}
                    error={error}
                    titleMap={titleMap}
                    iconMap={iconMap}
                    itemCount={itemsForList.length}
                    onOpenSearch={() => setShowSearch(true)}
                    onOpenManualEntry={handleOpenManualEntry}
                />

                <InfiniteScrollSidebar
                    selectedType={selectedType}
                    selectedId={selectedId}
                    setSelectedId={setSelectedId}
                    handleView={handleView}
                    handleDelete={handleDelete}
                    iconMap={iconMap}
                    titleMap={titleMap}
                    refreshTrigger={refreshTrigger}
                />

                <div style={{
                    padding: '16px 24px',
                    borderTop: `1px solid ${COLORS.border}`,
                    backgroundColor: COLORS.cardBg,
                    fontSize: '14px',
                    color: COLORS.textSecondary,
                    textAlign: 'center',
                    fontWeight: 500
                }}>
                    📌 Tip: Use Ctrl+F to search, 1/2/3 to switch types
                </div>
            </div>

            <ManualPointModal
                isOpen={showManualEntry === 'point'}
                onClose={() => setShowManualEntry(null)}
                onSuccess={handleManualEntrySuccess}
            />

            <ManualLineModal
                isOpen={showManualEntry === 'line'}
                onClose={() => setShowManualEntry(null)}
                onSuccess={handleManualEntrySuccess}
            />

            <ManualPolygonModal
                isOpen={showManualEntry === 'polygon'}
                onClose={() => setShowManualEntry(null)}
                onSuccess={handleManualEntrySuccess}
            />

            <SuccessNotification
                message={successMessage}
                isVisible={showSuccess}
                onClose={hideSuccessMessage}
                duration={4000}
            />
        </div>
    );
}

export default App;