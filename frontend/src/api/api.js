import axios from 'axios';

// In production the React build is served by the .NET API itself, so a relative URL works.
// During development `npm start` proxies /api to the backend (see "proxy" in package.json).
// Set REACT_APP_API_URL to point the UI at a backend hosted somewhere else.
export const API_BASE = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '') + '/api';

/**
 * Extracts a human readable message from an axios error. The API returns either
 * { message }, a plain string, or an ASP.NET validation ProblemDetails object.
 */
export const getErrorMessage = (error, fallback = 'Something went wrong') => {
    const data = error?.response?.data;
    if (typeof data === 'string' && data.trim()) return data;
    if (data?.message) return data.message;
    if (data?.errors) {
        const first = Object.values(data.errors).flat()[0];
        if (first) return first;
    }
    if (data?.title) return data.title;
    if (error?.request && !error?.response) return 'Cannot reach the server. Is the API running?';
    return error?.message || fallback;
};

axios.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);

        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error message:', error.message);
        }

        return Promise.reject(error);
    }
);

const createRequest = (method, url, data = null) => {
    const config = {
        method,
        url: `${API_BASE}${url}`,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (data) {
        config.data = data;
    }

    return axios(config);
};

export const fetchAll = {
    point: () => createRequest('GET', '/point'),
    line: () => createRequest('GET', '/line'),
    polygon: () => createRequest('GET', '/polygon')
};

export const addGeometry = {
    point: (name, wkt) => {
        console.log('Adding point:', { name, wkt });
        return createRequest('POST', '/point', { name, wkt });
    },
    line: (name, wkt) => {
        console.log('Adding line:', { name, wkt });
        return createRequest('POST', '/line', { name, wkt });
    },
    polygon: (name, wkt) => {
        console.log('Adding polygon:', { name, wkt });
        return createRequest('POST', '/polygon', { name, wkt });
    },
};

export const updateGeometry = {
    point: (id, name, wkt) => {
        console.log('Updating point:', { id, name, wkt });
        return createRequest('PUT', `/point/${id}`, { name, wkt });
    },
    line: (id, name, wkt) => {
        console.log('Updating line:', { id, name, wkt });
        return createRequest('PUT', `/line/${id}`, { name, wkt });
    },
    polygon: (id, name, wkt) => {
        console.log('Updating polygon:', { id, name, wkt });
        return createRequest('PUT', `/polygon/${id}`, { name, wkt });
    },
};

export const deleteGeometry = {
    point: (id) => {
        console.log('Deleting point:', id);
        return createRequest('DELETE', `/point/${id}`);
    },
    line: (id) => {
        console.log('Deleting line:', id);
        return createRequest('DELETE', `/line/${id}`);
    },
    polygon: (id) => {
        console.log('Deleting polygon:', id);
        return createRequest('DELETE', `/polygon/${id}`);
    },
};