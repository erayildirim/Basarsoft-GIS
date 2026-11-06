import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import WKT from 'ol/format/WKT';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Style, Stroke, Fill, Circle as CircleStyle, Text } from 'ol/style';
import Select from 'ol/interaction/Select';
import Modify from 'ol/interaction/Modify';
import Draw from 'ol/interaction/Draw';
import { click } from 'ol/events/condition';
import Overlay from 'ol/Overlay';
import MultiPoint from 'ol/geom/MultiPoint';

const COLORS = {
    point: '#3b82f6',
    pointHover: '#2563eb',
    line: '#10b981',
    lineHover: '#059669',
    polygon: '#8b5cf6',
    polygonHover: '#7c3aed',
    selected: '#ef4444',
    selectedHover: '#dc2626',
    text: '#1f2937',
    white: '#ffffff',
    shadow: 'rgba(0, 0, 0, 0.15)'
};

const styleFunction = feature => {
    const geom = feature.getGeometry();
    const type = geom.getType();
    const name = feature.get('name') || '';

    if (type === 'Point') {
        return new Style({
            image: new CircleStyle({
                radius: 8,
                fill: new Fill({ color: COLORS.point }),
                stroke: new Stroke({ color: COLORS.white, width: 2 })
            }),
            text: new Text({
                text: name,
                offsetY: -20,
                font: 'bold 13px system-ui, -apple-system, sans-serif',
                fill: new Fill({ color: COLORS.text }),
                stroke: new Stroke({ color: COLORS.white, width: 3 }),
                textAlign: 'center'
            })
        });
    } else if (type === 'LineString') {
        return new Style({
            stroke: new Stroke({ color: COLORS.line, width: 4, lineCap: 'round', lineJoin: 'round' }),
            text: new Text({
                text: name,
                placement: 'line',
                font: 'bold 13px system-ui, -apple-system, sans-serif',
                fill: new Fill({ color: COLORS.text }),
                stroke: new Stroke({ color: COLORS.white, width: 3 }),
                overflow: true
            })
        });
    } else if (type === 'Polygon') {
        return [
            new Style({
                stroke: new Stroke({ color: COLORS.polygon, width: 3 }),
                fill: new Fill({ color: COLORS.polygon + '33' }),
                text: new Text({
                    text: name,
                    overflow: true,
                    font: 'bold 13px system-ui, -apple-system, sans-serif',
                    fill: new Fill({ color: COLORS.text }),
                    stroke: new Stroke({ color: COLORS.white, width: 3 })
                })
            }),
            new Style({
                image: new CircleStyle({
                    radius: 5,
                    fill: new Fill({ color: COLORS.polygon }),
                    stroke: new Stroke({ color: COLORS.white, width: 2 })
                }),
                geometry: feature => {
                    const coords = feature.getGeometry().getCoordinates()[0];
                    return new MultiPoint(coords);
                }
            })
        ];
    }
};

const selectedStyleFunction = feature => {
    const geom = feature.getGeometry();
    const type = geom.getType();
    const name = feature.get('name') || '';

    if (type === 'Point') {
        return new Style({
            image: new CircleStyle({
                radius: 10,
                fill: new Fill({ color: COLORS.selected }),
                stroke: new Stroke({ color: COLORS.white, width: 3 })
            }),
            text: new Text({
                text: name,
                offsetY: -24,
                font: 'bold 14px system-ui, -apple-system, sans-serif',
                fill: new Fill({ color: COLORS.selected }),
                stroke: new Stroke({ color: COLORS.white, width: 3 }),
                textAlign: 'center'
            })
        });
    } else if (type === 'LineString') {
        return new Style({
            stroke: new Stroke({ color: COLORS.selected, width: 5, lineCap: 'round', lineJoin: 'round' }),
            text: new Text({
                text: name,
                placement: 'line',
                font: 'bold 14px system-ui, -apple-system, sans-serif',
                fill: new Fill({ color: COLORS.selected }),
                stroke: new Stroke({ color: COLORS.white, width: 3 }),
                overflow: true
            })
        });
    } else if (type === 'Polygon') {
        return [
            new Style({
                stroke: new Stroke({ color: COLORS.selected, width: 4 }),
                fill: new Fill({ color: COLORS.selected + '33' }),
                text: new Text({
                    text: name,
                    overflow: true,
                    font: 'bold 14px system-ui, -apple-system, sans-serif',
                    fill: new Fill({ color: COLORS.selected }),
                    stroke: new Stroke({ color: COLORS.white, width: 3 })
                })
            }),
            new Style({
                image: new CircleStyle({
                    radius: 6,
                    fill: new Fill({ color: COLORS.selected }),
                    stroke: new Stroke({ color: COLORS.white, width: 2 })
                }),
                geometry: feature => {
                    const coords = feature.getGeometry().getCoordinates()[0];
                    return new MultiPoint(coords);
                }
            })
        ];
    }
};

const convertGeometryToWKT = (geometry) => {
    try {
        const wktFormat = new WKT();
        const clonedGeom = geometry.clone();
        clonedGeom.transform('EPSG:3857', 'EPSG:4326');
        const wkt = wktFormat.writeGeometry(clonedGeom);
        console.log('Converted to WKT:', wkt);
        return wkt;
    } catch (error) {
        console.error('WKT conversion error:', error);
        throw new Error('Geometry could not be converted to WKT format: ' + error.message);
    }
};

const PointMap = forwardRef(({ points = [], lines = [], polygons = [], onAdd, onUpdate, selectedType }, ref) => {
    const mapRef = useRef(null);
    const map = useRef(null);
    const vectorSource = useRef(null);
    const select = useRef(null);
    const modify = useRef(null);
    const draw = useRef(null);
    const addOverlay = useRef(null);
    const editOverlay = useRef(null);
    const addPopupRef = useRef(null);
    const editPopupRef = useRef(null);

    const [showAddPopup, setShowAddPopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [popupName, setPopupName] = useState('');
    const [error, setError] = useState('');
    const [newFeature, setNewFeature] = useState(null);
    const [editingFeature, setEditingFeature] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        console.log('POPUP STATE CHANGE:', {
            showAddPopup,
            showEditPopup,
            isDrawing,
            hasNewFeature: !!newFeature,
            hasEditingFeature: !!editingFeature,
            editingFeatureId: editingFeature?.get('id')
        });
    }, [showAddPopup, showEditPopup, isDrawing, newFeature, editingFeature]);

    useEffect(() => {
        if (!map.current) {
            vectorSource.current = new VectorSource();
            const vectorLayer = new VectorLayer({
                source: vectorSource.current,
                style: styleFunction
            });

            map.current = new Map({
                target: mapRef.current,
                layers: [
                    new TileLayer({ source: new OSM() }),
                    vectorLayer
                ],
                view: new View({
                    center: fromLonLat([35.0, 39.0]),
                    zoom: 6
                })
            });

            addOverlay.current = new Overlay({
                element: addPopupRef.current,
                positioning: 'bottom-center',
                offset: [0, -15],
                stopEvent: true
            });
            editOverlay.current = new Overlay({
                element: editPopupRef.current,
                positioning: 'bottom-center',
                offset: [0, -15],
                stopEvent: true
            });
            map.current.addOverlay(addOverlay.current);
            map.current.addOverlay(editOverlay.current);

            select.current = new Select({
                condition: click,
                style: selectedStyleFunction
            });
            modify.current = new Modify({
                features: select.current.getFeatures(),
                style: selectedStyleFunction,
                pixelTolerance: 10
            });
            map.current.addInteraction(select.current);
            map.current.addInteraction(modify.current);

            select.current.on('select', e => {
                if (showAddPopup || isDrawing) {
                    e.selected.forEach(feat => {
                        select.current.getFeatures().remove(feat);
                    });
                    return;
                }

                if (e.selected.length > 0) {
                    const feat = e.selected[0];

                    if (!feat.get('id')) {
                        select.current.getFeatures().clear();
                        return;
                    }

                    setShowAddPopup(false);
                    setNewFeature(null);
                    addOverlay.current.setPosition(undefined);

                    setEditingFeature(feat);
                    setPopupName(feat.get('name') || '');
                    setError('');

                    const geom = feat.getGeometry();
                    let coord;
                    if (geom.getType() === 'Point') {
                        coord = geom.getCoordinates();
                    } else if (geom.getType() === 'LineString') {
                        const coords = geom.getCoordinates();
                        coord = coords[Math.floor(coords.length / 2)];
                    } else {
                        coord = geom.getInteriorPoint().getCoordinates();
                    }
                    editOverlay.current.setPosition(coord);
                    setShowEditPopup(true);
                } else {
                    cancelEdit();
                }
            });

            modify.current.on('modifyend', () => {
                if (editingFeature) {
                    const geom = editingFeature.getGeometry();
                    let coord;
                    if (geom.getType() === 'Point') {
                        coord = geom.getCoordinates();
                    } else if (geom.getType() === 'LineString') {
                        const coords = geom.getCoordinates();
                        coord = coords[Math.floor(coords.length / 2)];
                    } else {
                        coord = geom.getInteriorPoint().getCoordinates();
                    }
                    editOverlay.current.setPosition(coord);
                }
            });
        }
    }, []);

    useEffect(() => {
        if (!vectorSource.current) return;
        vectorSource.current.clear();
        const wktFormat = new WKT();

        const addFeatures = (items, type) => {
            items.forEach(item => {
                try {
                    console.log(`Loading ${type}:`, item);
                    const feat = wktFormat.readFeature(item.wkt, {
                        dataProjection: 'EPSG:4326',
                        featureProjection: 'EPSG:3857'
                    });
                    feat.set('id', item.id);
                    feat.set('name', item.name);
                    feat.set('type', type);
                    feat.set('featureType', type);
                    feat.set('originalData', item);
                    vectorSource.current.addFeature(feat);
                    console.log(`Successfully loaded ${type} with ID ${item.id}`);
                } catch (err) {
                    console.error(`${type} WKT parse error for item ${item.id}:`, err, 'WKT:', item.wkt);
                }
            });
        };

        console.log('Loading features - Points:', points.length, 'Lines:', lines.length, 'Polygons:', polygons.length);
        addFeatures(points, 'point');
        addFeatures(lines, 'line');
        addFeatures(polygons, 'polygon');

        console.log('Total features loaded:', vectorSource.current.getFeatures().length);
    }, [points, lines, polygons]);

    useEffect(() => {
        if (select.current) {
            select.current.getFeatures().clear();
            cancelEdit();
            closeAddPopup();

            if (isDrawing) {
                cancelDrawing();
            }
        }
    }, [selectedType]);

    useImperativeHandle(ref, () => ({
        focusOnFeature: (type, id) => {
            const feat = vectorSource.current
                .getFeatures()
                .find(f => f.get('type') === type && f.get('id') === id);
            if (feat) {
                select.current.getFeatures().clear();
                select.current.getFeatures().push(feat);
                const extent = feat.getGeometry().getExtent();
                map.current.getView().fit(extent, {
                    padding: [100, 100, 100, 100],
                    duration: 1000,
                    maxZoom: feat.getGeometry().getType() === 'Point' ? 16 : 15
                });
            }
        }
    }));

    const getDrawType = type => {
        switch (type) {
            case 'point': return 'Point';
            case 'line': return 'LineString';
            case 'polygon': return 'Polygon';
            default: return 'Point';
        }
    };

    const startDrawing = () => {
        if (isDrawing) return;

        setShowAddPopup(false);
        setShowEditPopup(false);
        setNewFeature(null);
        setEditingFeature(null);
        setIsDrawing(true);
        setError('');
        setPopupName('');

        select.current.getFeatures().clear();

        addOverlay.current.setPosition(undefined);
        editOverlay.current.setPosition(undefined);

        map.current.removeInteraction(select.current);
        map.current.removeInteraction(modify.current);

        draw.current = new Draw({
            source: vectorSource.current,
            type: getDrawType(selectedType),
            style: styleFunction
        });
        map.current.addInteraction(draw.current);

        draw.current.on('drawend', e => {
            const feat = e.feature;
            setIsDrawing(false);
            map.current.removeInteraction(draw.current);

            cancelEdit();

            vectorSource.current.removeFeature(feat);
            setNewFeature(feat);

            const geom = feat.getGeometry();
            let coord;
            if (geom.getType() === 'Point') {
                coord = geom.getCoordinates();
            } else if (geom.getType() === 'LineString') {
                const coords = geom.getCoordinates();
                coord = coords[coords.length - 1];
            } else {
                coord = geom.getInteriorPoint().getCoordinates();
            }

            setShowEditPopup(false);
            addOverlay.current.setPosition(coord);
            setShowAddPopup(true);

            map.current.addInteraction(select.current);
            map.current.addInteraction(modify.current);
            select.current.getFeatures().clear();
        });
    };

    const cancelDrawing = () => {
        if (draw.current) {
            map.current.removeInteraction(draw.current);
            draw.current = null;
        }
        setIsDrawing(false);

        setShowAddPopup(false);
        setNewFeature(null);
        setError('');
        setPopupName('');

        map.current.addInteraction(select.current);
        map.current.addInteraction(modify.current);
    };

    const cancelEdit = () => {
        setShowEditPopup(false);
        setEditingFeature(null);
        setPopupName('');
        setError('');
        select.current.getFeatures().clear();
        editOverlay.current.setPosition(undefined);

        setShowAddPopup(false);
        setNewFeature(null);
    };

    const closeAddPopup = () => {
        setShowAddPopup(false);
        setNewFeature(null);
        setPopupName('');
        setError('');
        addOverlay.current.setPosition(undefined);

        setShowEditPopup(false);
        setEditingFeature(null);
    };

    const handleAddFeature = async e => {
        e.preventDefault();
        if (!popupName.trim()) {
            setError('Please enter a name');
            return;
        }
        if (!newFeature) {
            setError('Feature to be added not found');
            return;
        }
        try {
            setError('');
            const wktGeom = convertGeometryToWKT(newFeature.getGeometry());
            console.log('Adding feature:', { name: popupName.trim(), wkt: wktGeom, type: selectedType });

            await onAdd(popupName.trim(), wktGeom);

            closeAddPopup();
            setNewFeature(null);
            setError('');
            setPopupName('');

        } catch (err) {
            console.error('Add error:', err);
            const errorMessage = err.response?.data?.message ||
                err.response?.data ||
                err.message ||
                'Feature could not be added';
            setError(errorMessage);
        }
    };

    const handleUpdateFeature = async e => {
        e.preventDefault();
        if (!popupName.trim()) {
            setError('Please enter a name');
            return;
        }
        if (!editingFeature) {
            setError('Feature to be updated not found');
            return;
        }
        try {
            setError('');
            const wktGeom = convertGeometryToWKT(editingFeature.getGeometry());
            const id = editingFeature.get('id');
            const featureType = editingFeature.get('type') || editingFeature.get('featureType');

            console.log('Updating feature:', { id, featureType, name: popupName.trim(), wkt: wktGeom });

            if (!id) {
                setError('Feature ID not found');
                return;
            }

            if (!featureType) {
                setError('Feature type not found');
                return;
            }

            await onUpdate(id, popupName.trim(), wktGeom, featureType);
            cancelEdit();
        } catch (err) {
            console.error('Update error:', err);
            const errorMessage = err.response?.data?.message ||
                err.response?.data ||
                err.message ||
                'Feature could not be updated';
            setError(errorMessage);
        }
    };

    const getFeatureType = (feature) => {
        return feature?.get('type') || feature?.get('featureType') || selectedType;
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

            {process.env.NODE_ENV === 'development' && (
                <div style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: 6,
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    zIndex: 1001
                }}>
                    🐛 ADD: {showAddPopup ? '✅' : '❌'} |
                    EDIT: {showEditPopup ? '✅' : '❌'} |
                    DRAW: {isDrawing ? '✅' : '❌'}
                </div>
            )}

            <div style={{
                position: 'absolute',
                top: 20,
                left: 20,
                zIndex: 1000,
                backgroundColor: '#ffffff',
                padding: 16,
                borderRadius: 12,
                boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                minWidth: 200
            }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: COLORS.text }}>
                    Map Controls
                </h3>
                <button
                    onClick={isDrawing ? cancelDrawing : startDrawing}
                    style={{
                        padding: '10px 16px',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        width: '100%',
                        backgroundColor: isDrawing ? COLORS.danger : COLORS.point,
                        color: 'white',
                        transition: 'all 0.2s'
                    }}
                >
                    {isDrawing
                        ? '❌ Cancel Drawing'
                        : selectedType === 'point' ? '📍 Add New Point'
                            : selectedType === 'line' ? '📏 Add New Line'
                                : '⬛ Add New Polygon'}
                </button>
                {isDrawing && (
                    <div style={{
                        marginTop: 12,
                        padding: 12,
                        backgroundColor: '#fef3c7',
                        borderRadius: 8,
                        fontSize: '13px',
                        color: '#92400e'
                    }}>
                        {selectedType === 'point' && '👆 Click on the map to add a point'}
                        {selectedType === 'line' && '👆 Click 2 points on the map to create a line'}
                        {selectedType === 'polygon' && '👆 Draw multiple lines on the map to create a polygon'}
                    </div>
                )}
            </div>

            <div
                ref={addPopupRef}
                style={{
                    display: showAddPopup ? 'block' : 'none',
                    position: 'absolute',
                    backgroundColor: '#ffffff',
                    padding: 20,
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    minWidth: 280,
                    border: '3px solid #10b981'
                }}
                onClick={e => e.stopPropagation()}
            >
                <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '18px',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    {selectedType === 'point' && '📍'}
                    {selectedType === 'line' && '📏'}
                    {selectedType === 'polygon' && '⬛'}
                    ➕ NEW {selectedType === 'point' ? 'POINT' : selectedType === 'line' ? 'LINE' : 'POLYGON'} ADD
                </h3>
                <form onSubmit={handleAddFeature}>
                    <input
                        type="text"
                        value={popupName}
                        onChange={e => setPopupName(e.target.value)}
                        placeholder="Name"
                        style={{
                            width: '100%',
                            padding: '12px',
                            marginBottom: 12,
                            borderRadius: 8,
                            border: '2px solid #e5e7eb',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                        autoFocus
                    />
                    {error && (
                        <div style={{
                            color: '#dc2626',
                            marginBottom: 12,
                            fontSize: '14px',
                            backgroundColor: '#fee',
                            padding: '8px 12px',
                            borderRadius: 6
                        }}>
                            ⚠️ {error}
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type="submit" style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            borderRadius: 8,
                            backgroundColor: '#10b981',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}>
                            ✓ Add
                        </button>
                        <button type="button" onClick={closeAddPopup} style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            borderRadius: 8,
                            backgroundColor: '#f3f4f6',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            <div
                ref={editPopupRef}
                style={{
                    display: showEditPopup ? 'block' : 'none',
                    position: 'absolute',
                    backgroundColor: '#ffffff',
                    padding: 20,
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    minWidth: 280,
                    border: '3px solid #f59e0b'
                }}
                onClick={e => e.stopPropagation()}
            >
                <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '18px',
                    color: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    {getFeatureType(editingFeature) === 'point' && '📍'}
                    {getFeatureType(editingFeature) === 'line' && '📏'}
                    {getFeatureType(editingFeature) === 'polygon' && '⬛'}
                    ✏️ {getFeatureType(editingFeature) === 'point' ? 'POINT' :
                        getFeatureType(editingFeature) === 'line' ? 'LINE' : 'POLYGON'} EDIT
                    {editingFeature && (
                        <span style={{
                            fontSize: '14px',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: 12
                        }}>
                            ID: {editingFeature.get('id')}
                        </span>
                    )}
                </h3>
                <form onSubmit={handleUpdateFeature}>
                    <input
                        type="text"
                        value={popupName}
                        onChange={e => setPopupName(e.target.value)}
                        placeholder="Name"
                        style={{
                            width: '100%',
                            padding: '12px',
                            marginBottom: 12,
                            borderRadius: 8,
                            border: '2px solid #e5e7eb',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                        autoFocus
                    />
                    {error && (
                        <div style={{
                            color: '#dc2626',
                            marginBottom: 12,
                            fontSize: '14px',
                            backgroundColor: '#fee',
                            padding: '8px 12px',
                            borderRadius: 6
                        }}>
                            ⚠️ {error}
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type="submit" style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            borderRadius: 8,
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}>
                            ✓ Save
                        </button>
                        <button type="button" onClick={cancelEdit} style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            borderRadius: 8,
                            backgroundColor: '#f3f4f6',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                input:focus {
                    border-color: ${COLORS.point} !important;
                }
                button:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }
            `}</style>
        </div>
    );
});

PointMap.displayName = 'PointMap';
export default PointMap;