import React from 'react';
import type { ReleaseData } from '../types';
import { ExternalLinkIcon } from './icons';

interface ResultCardProps {
    data: ReleaseData;
}

const ResultCard: React.FC<ResultCardProps> = ({ data }) => {
    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>{data.title}</h2>
                    <p style={styles.artist}>{data.artist}</p>
                </div>
                <a href={data.discogsUrl} target="_blank" rel="noopener noreferrer" style={styles.link} aria-label="View on Discogs">
                    <ExternalLinkIcon />
                </a>
            </div>

            <div style={styles.details}>
                <span>Release Year: <strong>{data.releaseYear}</strong></span>
                <span>Master Year: <strong>{data.masterYear}</strong></span>
            </div>

            {data.tracks && data.tracks.length > 0 && (
                <div>
                    <h3 style={styles.tracklistHeader}>Tracklist</h3>
                    <ol style={styles.tracklist}>
                        {data.tracks.map((track) => (
                            <li key={`${track.position}-${track.title}`} style={styles.trackItem}>
                                <span style={styles.trackPosition}>{track.position}</span>
                                <span>{track.title}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
};


const styles: { [key: string]: React.CSSProperties } = {
    card: {
        backgroundColor: 'var(--surface-color)',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        animation: 'fadeIn 0.5s ease-in-out',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '16px',
    },
    title: {
        margin: 0,
        fontSize: '1.75rem',
        color: 'var(--text-color)',
    },
    artist: {
        margin: '4px 0 0',
        fontSize: '1.1rem',
        color: 'var(--text-secondary-color)',
    },
    link: {
        color: 'var(--text-secondary-color)',
        textDecoration: 'none',
        padding: '4px',
    },
    details: {
        display: 'flex',
        gap: '24px',
        color: 'var(--text-secondary-color)',
        fontSize: '0.9rem',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border-color)',
    },
    tracklistHeader: {
        margin: '0 0 12px 0',
        fontSize: '1.2rem',
        color: 'var(--text-color)',
    },
    tracklist: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    trackItem: {
        display: 'flex',
        gap: '12px',
        color: 'var(--text-secondary-color)',
    },
    trackPosition: {
        minWidth: '30px',
        textAlign: 'right',
        fontVariantNumeric: 'tabular-nums',
        color: 'var(--text-color)',
    },
};

export default ResultCard;
