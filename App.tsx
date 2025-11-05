import React, { useState, useCallback } from 'react';
import { lookupRelease } from './services/discogsService';
import type { ReleaseData } from './types';
import ResultCard from './components/ResultCard';
import Loader from './components/Loader';
import { SearchIcon } from './components/icons';

const App: React.FC = () => {
    const [releaseId, setReleaseId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ReleaseData | null>(null);

    const handleSearch = useCallback(async () => {
        if (!releaseId.trim()) {
            setError('Please enter a Release ID.');
            return;
        }
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const data = await lookupRelease(releaseId);
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    }, [releaseId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch();
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>Discogs Item Lookup</h1>
                <p style={styles.subtitle}>Find information about any music release.</p>
            </header>
            
            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    type="text"
                    value={releaseId}
                    onChange={(e) => setReleaseId(e.target.value)}
                    placeholder="Enter Discogs Release ID (e.g., 249504)"
                    style={styles.input}
                    aria-label="Discogs Release ID"
                    disabled={loading}
                />
                <button type="submit" style={styles.button} disabled={loading} aria-label="Search">
                    {loading ? '...' : <SearchIcon />}
                </button>
            </form>

            <main style={styles.main}>
                {loading && <Loader />}
                {error && <p style={styles.error}>{error}</p>}
                {result && <ResultCard data={result} />}
            </main>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    header: {
        textAlign: 'center',
    },
    title: {
        fontSize: '2.5rem',
        margin: '0',
        color: 'var(--primary-color)',
    },
    subtitle: {
        fontSize: '1.1rem',
        margin: '8px 0 0',
        color: 'var(--text-secondary-color)',
    },
    form: {
        display: 'flex',
        gap: '8px',
    },
    input: {
        flex: 1,
        padding: '12px 16px',
        fontSize: '1rem',
        backgroundColor: 'var(--surface-color)',
        color: 'var(--text-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        outline: 'none',
    },
    button: {
        padding: '12px',
        backgroundColor: 'var(--primary-color)',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'background-color 0.2s',
    },
    main: {
        marginTop: '16px',
    },
    error: {
        color: 'var(--error-color)',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        padding: '12px',
        borderRadius: '8px',
        textAlign: 'center',
    },
};

export default App;
