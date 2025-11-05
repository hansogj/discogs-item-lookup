import React from 'react';

const Loader: React.FC = () => (
    <div style={styles.loaderContainer} aria-label="Loading">
        <div style={styles.spinner}></div>
    </div>
);

const styles: { [key: string]: React.CSSProperties } = {
    loaderContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid var(--border-color)',
        borderTop: '4px solid var(--primary-color)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
};

export default Loader;
