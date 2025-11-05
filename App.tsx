import React, { useState } from 'react';
import { lookupRelease, DiscogsApiError } from './services/discogsService';
import type { ReleaseData } from './types';

function App() {
  const [releaseId, setReleaseId] = useState('');
  const [releaseData, setReleaseData] = useState<ReleaseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!releaseId.trim()) {
      setError('Please enter a Release ID.');
      return;
    }
    setLoading(true);
    setError(null);
    setReleaseData(null);
    try {
      const data = await lookupRelease(releaseId);
      setReleaseData(data);
    } catch (err) {
      if (err instanceof DiscogsApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Discogs Item Lookup</h1>
        <p>Find information about music releases from Discogs.</p>
      </header>
      <main>
        <form onSubmit={handleSearch} className="search-form" aria-label="Search form">
          <input
            type="text"
            value={releaseId}
            onChange={(e) => setReleaseId(e.target.value)}
            placeholder="Enter Discogs Release ID (e.g., 249504)"
            aria-label="Discogs Release ID"
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <div className="error-message" role="alert">{error}</div>}
        
        {releaseData && (
          <article className="release-info" aria-labelledby="release-title">
            <h2 id="release-title">{releaseData.artist} - {releaseData.title}</h2>
            <div className="release-details">
              <p><strong>Release Year:</strong> {releaseData.releaseYear}</p>
              <p><strong>Original Master Year:</strong> {releaseData.masterYear}</p>
              <p><a href={releaseData.discogsUrl} target="_blank" rel="noopener noreferrer">View on Discogs</a></p>
            </div>
            <h3>Tracklist</h3>
            <ol className="tracklist">
              {releaseData.tracks.map((track) => (
                <li key={track.position}>
                  <span>{track.position}</span> {track.title}
                </li>
              ))}
            </ol>
          </article>
        )}
      </main>
      <footer>
        <p>Powered by the <a href="https://www.discogs.com/developers" target="_blank" rel="noopener noreferrer">Discogs API</a></p>
      </footer>
    </div>
  );
}

export default App;
