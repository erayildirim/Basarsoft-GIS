import React, { useState, useEffect } from 'react';

const SuccessNotification = ({ message, isVisible, onClose, duration = 3000 }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isVisible && message) {
            setShow(true);

            const timer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible, message, duration]);

    const handleClose = () => {
        setShow(false);
        setTimeout(() => {
            onClose && onClose();
        }, 300);
    };

    if (!isVisible || !message) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            backgroundColor: '#10b981',
            color: 'white',
            padding: '16px 24px',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transform: show ? 'translateX(0) scale(1)' : 'translateX(100%) scale(0.8)',
            opacity: show ? 1 : 0,
            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            minWidth: 280,
            maxWidth: 400
        }}>
            <div style={{ fontSize: '24px' }}>✅</div>
            <div style={{ flex: 1 }}>
                <div style={{
                    fontWeight: 600,
                    fontSize: '16px',
                    marginBottom: 4
                }}>
                    Success!
                </div>
                <div style={{
                    fontSize: '14px',
                    opacity: 0.9
                }}>
                    {message}
                </div>
            </div>
            <button
                onClick={handleClose}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '20px',
                    padding: 4,
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    opacity: 0.7
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.opacity = '0.7';
                }}
                title="Close"
            >
                ✕
            </button>
        </div>
    );
};

export default SuccessNotification;