import 'dotenv/config';
import type { DiscogsReleaseResponse, DiscogsMasterResponse, LookupResult } from './types';

const API_BASE_URL = 'https://api.discogs.com';

export class DiscogsApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DiscogsApiError';
  }
}

/**
 * Fetches release data from the Discogs API.
 * @param releaseId The ID of the Discogs release.
 * @param discogsToken Your Discogs personal access token. If not provided, it will try to use the DISCOGS_TOKEN environment variable.
 * @returns A promise that resolves with the formatted release data.
 */
export async function lookupRelease(releaseId: string, discogsToken?: string): Promise<LookupResult> {
  const token = discogsToken || process.env.DISCOGS_TOKEN;

  if (!token) {
    throw new DiscogsApiError('Discogs token is not configured. Please provide it as an argument or set the DISCOGS_TOKEN environment variable.');
  }

  const headers = {
    'Authorization': `Discogs token=${token}`,
    'User-Agent': 'DiscogsLookupScript/1.0'
  };

  // 1. Fetch the specific release data
  const releaseResponse = await fetch(`${API_BASE_URL}/releases/${releaseId}`, { headers });

  if (!releaseResponse.ok) {
    if (releaseResponse.status === 404) {
      throw new DiscogsApiError(`Release with ID "${releaseId}" not found.`);
    }
    const errorText = await releaseResponse.text();
    throw new DiscogsApiError(`Failed to fetch release data. Status: ${releaseResponse.status} - ${errorText}`);
  }

  const release: DiscogsReleaseResponse = await releaseResponse.json();
  const { master_id } = release;

  let masterYear: number;

  if (master_id) {
    // 2. If a master ID exists, fetch the master release data to get the original year
    const masterResponse = await fetch(`${API_BASE_URL}/masters/${master_id}`, { headers });

    if (!masterResponse.ok) {
       const errorText = await masterResponse.text();
      throw new DiscogsApiError(`Failed to fetch master release data for master_id ${master_id}. Status: ${masterResponse.status} - ${errorText}`);
    }

    const master: DiscogsMasterResponse = await masterResponse.json();
    masterYear = master.year;
  } else {
    // 3. If no master_id, this is the original release, so use its year.
    masterYear = release.year;
  }

  // 4. Combine and format the data
  return {
    artist: release.artists?.map(a => a.name).join(', ') || 'Unknown Artist',
    title: release.title,
    tracks: release.tracklist?.map(track => ({ position: track.position, title: track.title })) || [],
    masterYear: masterYear,
    releaseYear: release.year,
    discogsUrl: `https://www.discogs.com/release/${releaseId}`,
  };
};