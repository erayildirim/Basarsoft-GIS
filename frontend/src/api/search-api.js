import axios from 'axios';

const API_BASE = 'https://localhost:7268/api';

export const searchGeometries = async (searchTerm, geometryType = null, maxResults = 20) => {
    try {
        const params = new URLSearchParams();
        params.append('searchTerm', searchTerm);
        if (geometryType) params.append('geometryType', geometryType);
        params.append('maxResults', maxResults.toString());

        const response = await axios.get(`${API_BASE}/search?${params.toString()}`);
        return response;
    } catch (error) {
        console.error('Search API error:', error);
        throw error;
    }
};

export const fetchPagedGeometries = {
    points: async (page = 1, pageSize = 10, searchTerm = null) => {
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('pageSize', pageSize.toString());
            if (searchTerm) params.append('searchTerm', searchTerm);

            return await axios.get(`${API_BASE}/point/paged?${params.toString()}`);
        } catch (error) {
            console.error('Fetch paged points error:', error);
            throw error;
        }
    },

    lines: async (page = 1, pageSize = 10, searchTerm = null) => {
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('pageSize', pageSize.toString());
            if (searchTerm) params.append('searchTerm', searchTerm);

            return await axios.get(`${API_BASE}/line/paged?${params.toString()}`);
        } catch (error) {
            console.error('Fetch paged lines error:', error);
            throw error;
        }
    },

    polygons: async (page = 1, pageSize = 10, searchTerm = null) => {
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('pageSize', pageSize.toString());
            if (searchTerm) params.append('searchTerm', searchTerm);

            return await axios.get(`${API_BASE}/polygon/paged?${params.toString()}`);
        } catch (error) {
            console.error('Fetch paged polygons error:', error);
            throw error;
        }
    }
};

export const addManualGeometry = {
    point: async (name, latitude, longitude) => {
        try {
            return await axios.post(`${API_BASE}/point/manual`, {
                name,
                latitude,
                longitude
            });
        } catch (error) {
            console.error('Add manual point error:', error);
            throw error;
        }
    },

    line: async (name, startLatitude, startLongitude, endLatitude, endLongitude) => {
        try {
            return await axios.post(`${API_BASE}/line/manual`, {
                name,
                startLatitude,
                startLongitude,
                endLatitude,
                endLongitude
            });
        } catch (error) {
            console.error('Add manual line error:', error);
            throw error;
        }
    },

    polygon: async (name, coordinates) => {
        try {
            return await axios.post(`${API_BASE}/polygon/manual`, {
                name,
                coordinates: coordinates.map(coord => ({
                    latitude: coord.lat,
                    longitude: coord.lng
                }))
            });
        } catch (error) {
            console.error('Add manual polygon error:', error);
            throw error;
        }
    }
};