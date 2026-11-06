import React, { useState } from 'react';
import { addManualGeometry } from '../../api/search-api';
import COLORS from '../common/COLORS';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: 20
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 24,
                width: '100%',
                maxWidth: 500,
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                border: `3px solid ${COLORS.primary}`
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24,
                    paddingBottom: 16,
                    borderBottom: `2px solid ${COLORS.border}`
                }}>
                    <h2 style={{
                        margin: 0,
                        color: COLORS.text,
                        fontSize: '24px',
                        fontWeight: 700
                    }}>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            border: 'none',
                            backgroundColor: COLORS.danger,
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export const ManualPointModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        latitude: '',
        longitude: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError('Name field is required');
            return;
        }

        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);

        if (isNaN(lat) || isNaN(lng)) {
            setError('Coordinates must be valid numbers');
            return;
        }

        if (lat < -90 || lat > 90) {
            setError('Latitude must be between -90 and 90');
            return;
        }

        if (lng < -180 || lng > 180) {
            setError('Longitude must be between -180 and 180');
            return;
        }

        setLoading(true);
        try {
            await addManualGeometry.point(formData.name.trim(), lat, lng);
            setFormData({ name: '', latitude: '', longitude: '' });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Error occurred while adding point');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ name: '', latitude: '', longitude: '' });
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="📍 Add Point Manually">
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                    <label style={{
                        display: 'block',
                        marginBottom: 8,
                        fontWeight: 600,
                        color: COLORS.text
                    }}>
                        Point Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g: Mausoleum of Ataturk"
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: `2px solid ${COLORS.border}`,
                            borderRadius: 8,
                            fontSize: '16px',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                        required
                    />
                </div>

                <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                    <div style={{ flex: 1 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: 600,
                            color: COLORS.text
                        }}>
                            Latitude *
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={formData.latitude}
                            onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                            placeholder="39.925533"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: `2px solid ${COLORS.border}`,
                                borderRadius: 8,
                                fontSize: '16px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                            required
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: 600,
                            color: COLORS.text
                        }}>
                            Longitude *
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={formData.longitude}
                            onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                            placeholder="32.866287"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: `2px solid ${COLORS.border}`,
                                borderRadius: 8,
                                fontSize: '16px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fee',
                        color: '#c53030',
                        padding: '12px',
                        borderRadius: 8,
                        marginBottom: 20,
                        fontSize: '14px'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        type="button"
                        onClick={handleClose}
                        style={{
                            flex: 1,
                            padding: '12px 24px',
                            border: `2px solid ${COLORS.border}`,
                            borderRadius: 8,
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 600
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: 8,
                            backgroundColor: loading ? COLORS.border : COLORS.primary,
                            color: 'white',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: 600
                        }}
                    >
                        {loading ? '⏳ Adding...' : '✓ Add Point'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export const ManualLineModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        startLatitude: '',
        startLongitude: '',
        endLatitude: '',
        endLongitude: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validateCoordinates = (lat, lng, name) => {
        if (isNaN(lat) || isNaN(lng)) {
            throw new Error(`${name} coordinates must be valid numbers`);
        }
        if (lat < -90 || lat > 90) {
            throw new Error(`${name} latitude must be between -90 and 90`);
        }
        if (lng < -180 || lng > 180) {
            throw new Error(`${name} longitude must be between -180 and 180`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError('Name field is required');
            return;
        }

        try {
            const startLat = parseFloat(formData.startLatitude);
            const startLng = parseFloat(formData.startLongitude);
            const endLat = parseFloat(formData.endLatitude);
            const endLng = parseFloat(formData.endLongitude);

            validateCoordinates(startLat, startLng, 'Start point');
            validateCoordinates(endLat, endLng, 'End point');

            setLoading(true);
            await addManualGeometry.line(formData.name.trim(), startLat, startLng, endLat, endLng);
            setFormData({ name: '', startLatitude: '', startLongitude: '', endLatitude: '', endLongitude: '' });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Error occurred while adding line');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ name: '', startLatitude: '', startLongitude: '', endLatitude: '', endLongitude: '' });
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="📏 Add Line Manually">
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                    <label style={{
                        display: 'block',
                        marginBottom: 8,
                        fontWeight: 600,
                        color: COLORS.text
                    }}>
                        Line Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g: Ankara-Istanbul Road"
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: `2px solid ${COLORS.border}`,
                            borderRadius: 8,
                            fontSize: '16px',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                        required
                    />
                </div>

                <div style={{ marginBottom: 20 }}>
                    <h4 style={{ color: COLORS.text, marginBottom: 12 }}>🚀 Start Point</h4>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 8,
                                fontWeight: 600,
                                color: COLORS.text
                            }}>
                                Latitude *
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={formData.startLatitude}
                                onChange={(e) => setFormData(prev => ({ ...prev, startLatitude: e.target.value }))}
                                placeholder="39.925533"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: `2px solid ${COLORS.border}`,
                                    borderRadius: 8,
                                    fontSize: '16px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                required
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 8,
                                fontWeight: 600,
                                color: COLORS.text
                            }}>
                                Longitude *
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={formData.startLongitude}
                                onChange={(e) => setFormData(prev => ({ ...prev, startLongitude: e.target.value }))}
                                placeholder="32.866287"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: `2px solid ${COLORS.border}`,
                                    borderRadius: 8,
                                    fontSize: '16px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <h4 style={{ color: COLORS.text, marginBottom: 12 }}>🏁 End Point</h4>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 8,
                                fontWeight: 600,
                                color: COLORS.text
                            }}>
                                Latitude *
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={formData.endLatitude}
                                onChange={(e) => setFormData(prev => ({ ...prev, endLatitude: e.target.value }))}
                                placeholder="41.008238"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: `2px solid ${COLORS.border}`,
                                    borderRadius: 8,
                                    fontSize: '16px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                required
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 8,
                                fontWeight: 600,
                                color: COLORS.text
                            }}>
                                Longitude *
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={formData.endLongitude}
                                onChange={(e) => setFormData(prev => ({ ...prev, endLongitude: e.target.value }))}
                                placeholder="28.978359"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: `2px solid ${COLORS.border}`,
                                    borderRadius: 8,
                                    fontSize: '16px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                required
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fee',
                        color: '#c53030',
                        padding: '12px',
                        borderRadius: 8,
                        marginBottom: 20,
                        fontSize: '14px'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        type="button"
                        onClick={handleClose}
                        style={{
                            flex: 1,
                            padding: '12px 24px',
                            border: `2px solid ${COLORS.border}`,
                            borderRadius: 8,
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 600
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: 8,
                            backgroundColor: loading ? COLORS.border : COLORS.line,
                            color: 'white',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: 600
                        }}
                    >
                        {loading ? '⏳ Adding...' : '✓ Add Line'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export const ManualPolygonModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        cornerCount: 3,
        coordinates: [
            { lat: '', lng: '' },
            { lat: '', lng: '' },
            { lat: '', lng: '' }
        ]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCornerCountChange = (count) => {
        const newCount = Math.max(3, Math.min(10, count));
        const newCoordinates = [...formData.coordinates];

        if (newCount > newCoordinates.length) {
            for (let i = newCoordinates.length; i < newCount; i++) {
                newCoordinates.push({ lat: '', lng: '' });
            }
        } else if (newCount < newCoordinates.length) {
            newCoordinates.splice(newCount);
        }

        setFormData(prev => ({
            ...prev,
            cornerCount: newCount,
            coordinates: newCoordinates
        }));
    };

    const handleCoordinateChange = (index, field, value) => {
        const newCoordinates = [...formData.coordinates];
        newCoordinates[index] = { ...newCoordinates[index], [field]: value };
        setFormData(prev => ({ ...prev, coordinates: newCoordinates }));
    };

    const validateCoordinates = (coords) => {
        for (let i = 0; i < coords.length; i++) {
            const lat = parseFloat(coords[i].lat);
            const lng = parseFloat(coords[i].lng);

            if (isNaN(lat) || isNaN(lng)) {
                throw new Error(`${i + 1}. corner coordinates must be valid numbers`);
            }
            if (lat < -90 || lat > 90) {
                throw new Error(`${i + 1}. corner latitude must be between -90 and 90`);
            }
            if (lng < -180 || lng > 180) {
                throw new Error(`${i + 1}. corner longitude must be between -180 and 180`);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError('Name field is required');
            return;
        }

        try {
            validateCoordinates(formData.coordinates);

            setLoading(true);
            await addManualGeometry.polygon(formData.name.trim(), formData.coordinates);

            setFormData({
                name: '',
                cornerCount: 3,
                coordinates: [
                    { lat: '', lng: '' },
                    { lat: '', lng: '' },
                    { lat: '', lng: '' }
                ]
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Error occurred while adding polygon');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            cornerCount: 3,
            coordinates: [
                { lat: '', lng: '' },
                { lat: '', lng: '' },
                { lat: '', lng: '' }
            ]
        });
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="⬛ Add Polygon Manually">
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                    <label style={{
                        display: 'block',
                        marginBottom: 8,
                        fontWeight: 600,
                        color: COLORS.text
                    }}>
                        Polygon Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g: Pentagon Area"
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: `2px solid ${COLORS.border}`,
                            borderRadius: 8,
                            fontSize: '16px',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                        required
                    />
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label style={{
                        display: 'block',
                        marginBottom: 8,
                        fontWeight: 600,
                        color: COLORS.text
                    }}>
                        Number of Corners (3-10)
                    </label>
                    <input
                        type="number"
                        min="3"
                        max="10"
                        value={formData.cornerCount}
                        onChange={(e) => handleCornerCountChange(parseInt(e.target.value) || 3)}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: `2px solid ${COLORS.border}`,
                            borderRadius: 8,
                            fontSize: '16px',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <div style={{ marginBottom: 20 }}>
                    <h4 style={{ color: COLORS.text, marginBottom: 12 }}>📍 Corner Coordinates</h4>
                    {formData.coordinates.map((coord, index) => (
                        <div key={index} style={{ marginBottom: 12 }}>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: COLORS.textSecondary,
                                marginBottom: 8
                            }}>
                                {index + 1}. Corner
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="Latitude"
                                    value={coord.lat}
                                    onChange={(e) => handleCoordinateChange(index, 'lat', e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '10px 12px',
                                        border: `1px solid ${COLORS.border}`,
                                        borderRadius: 6,
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                    required
                                />
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="Longitude"
                                    value={coord.lng}
                                    onChange={(e) => handleCoordinateChange(index, 'lng', e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '10px 12px',
                                        border: `1px solid ${COLORS.border}`,
                                        borderRadius: 6,
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                    required
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fee',
                        color: '#c53030',
                        padding: '12px',
                        borderRadius: 8,
                        marginBottom: 20,
                        fontSize: '14px'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        type="button"
                        onClick={handleClose}
                        style={{
                            flex: 1,
                            padding: '12px 24px',
                            border: `2px solid ${COLORS.border}`,
                            borderRadius: 8,
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 600
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: 8,
                            backgroundColor: loading ? COLORS.border : COLORS.polygon,
                            color: 'white',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: 600
                        }}
                    >
                        {loading ? '⏳ Adding...' : '✓ Add Polygon'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};