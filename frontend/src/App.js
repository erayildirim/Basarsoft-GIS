import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import PointMap from './components/PointMap';

function App() {
    const API_URL = 'https://localhost:7268/api/point';

    // liste ve form state’leri
    const [points, setPoints] = useState([]);
    const [name, setName] = useState('');
    const [lon, setLon] = useState('');
    const [lat, setLat] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // API’den çek
    const fetchPoints = () => {
        axios.get(API_URL)
            .then(({ data }) => setPoints(data))
            .catch(console.error);
    };

    useEffect(fetchPoints, []);

    // form temizle
    const resetForm = () => {
        setName(''); setLon(''); setLat('');
        setIsEditing(false); setEditingId(null);
    };

    // ekle/güncelle
    const handleSubmit = e => {
        e.preventDefault();
        const wkt = `POINT(${lon} ${lat})`;
        const payload = { name, wkt };

        const request = isEditing
            ? axios.put(`${API_URL}/${editingId}`, payload)
            : axios.post(API_URL, payload);

        request
            .then(() => {
                resetForm();
                fetchPoints();            // listeyi yenile
            })
            .catch(console.error);
    };

    // düzenleme moduna al
    const handleEdit = pt => {
        const coords = pt.wkt
            .slice(6, -1)       
            .split(' ');         
        setName(pt.name);
        setLon(coords[0]);
        setLat(coords[1]);
        setIsEditing(true);
        setEditingId(pt.id);
    };

    // sil ve listeyi anında güncelle
    const handleDelete = id => {
        axios.delete(`${API_URL}/${id}`)
            .then(() => {
                setPoints(prev => prev.filter(p => p.id !== id));
            })
            .catch(console.error);
    };

    const wktList = useMemo(() => points.map(p => p.wkt), [points]);

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {/* Harita */}
            <div style={{ flex: 2 }}>
                <PointMap wktFeatures={wktList} />
            </div>

            {/* Sağ panel */}
            <div style={{
                flex: 1,
                padding: 16,
                borderLeft: '1px solid #ccc',
                overflowY: 'auto'
            }}>
                <h2>{isEditing ? 'Edit Point' : 'Add New Point'}</h2>
                <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
                    <div>
                        <label>Name:</label><br />
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            style={{ width: '100%', marginBottom: 8 }}
                        />
                    </div>
                    <div>
                        <label>Longitude:</label><br />
                        <input
                            type="number"
                            value={lon}
                            onChange={e => setLon(e.target.value)}
                            required
                            style={{ width: '100%', marginBottom: 8 }}
                        />
                    </div>
                    <div>
                        <label>Latitude:</label><br />
                        <input
                            type="number"
                            value={lat}
                            onChange={e => setLat(e.target.value)}
                            required
                            style={{ width: '100%', marginBottom: 8 }}
                        />
                    </div>
                    <button type="submit">{isEditing ? 'Update' : 'Add'}</button>
                    {isEditing && (
                        <button
                            type="button"
                            onClick={resetForm}
                            style={{ marginLeft: 8 }}
                        >
                            Cancel
                        </button>
                    )}
                </form>

                <h2>Point List</h2>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {points.map(pt => (
                        <li key={pt.id} style={{ marginBottom: 16 }}>
                            <strong>{pt.name}</strong><br />
                            <small>{pt.wkt}</small><br />
                            <button type="button" onClick={() => handleEdit(pt)}>
                                Edit
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDelete(pt.id)}
                                style={{ marginLeft: 8 }}
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default App;
