import React from 'react';
import COLORS from './COLORS';

const LoadingSpinner = () => (
    <div style={{
        display: 'inline-block',
        width: 40,
        height: 40,
        border: '3px solid #f3f4f6',
        borderTop: `3px solid ${COLORS.primary}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    }} />
);

export default LoadingSpinner;
