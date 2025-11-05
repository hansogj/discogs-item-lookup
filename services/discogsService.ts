import type { DiscogsReleaseResponse, DiscogsMasterResponse, ReleaseData } from '../types';

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
 * @returns A promise that resolves with the formatted release data.
 */
export async function lookupRelease(releaseId: string): Promise<ReleaseData> {
  const sanitizedReleaseId = releaseId.replace(/\D/g, '');

  if (!sanitizedReleaseId) {
    throw new DiscogsApiError(`Invalid Release ID format: "${releaseId}". Please provide a valid numeric ID.`);
  }
  
  // The original code used DISCOGS_TOKEN, so we'll use that from the environment.
  const token = process.env.DISCOGS_TOKEN;

  if (!token) {
    throw new DiscogsApiError('Discogs token is not configured in the environment variables.');
  }

  const headers = {
    'Authorization': `Discogs token=${token}`,
    'User-Agent': 'DiscogsItemLookupWebApp/1.0'
  };

  const releaseResponse = await fetch(`${API_BASE_URL}/releases/${sanitizedReleaseId}`, { headers });

  if (!releaseResponse.ok) {
    if (releaseResponse.status === 404) {
      throw new DiscogsApiError(`Release with ID "${sanitizedReleaseId}" not found.`);
    }
    const errorText = await releaseResponse.text();
    throw new DiscogsApiError(`Failed to fetch release data. Status: ${releaseResponse.status} - ${errorText}`);
  }

  const release: DiscogsReleaseResponse = await releaseResponse.json();
  const { master_id } = release;

  let masterYear: number;

  if (master_id) {
    const masterResponse = await fetch(`${API_BASE_URL}/masters/${master_id}`, { headers });

    if (!masterResponse.ok) {
       const errorText = await masterResponse.text();
      throw new DiscogsApiError(`Failed to fetch master release data for master_id ${master_id}. Status: ${masterResponse.status} - ${errorText}`);
    }

    const master: DiscogsMasterResponse = await masterResponse.json();
    masterYear = master.year;
  } else {
    masterYear = release.year;
  }

  return {
    artist: release.artists?.map(a => a.name).join(', ') || 'Unknown Artist',
    title: release.title,
    tracks: release.tracklist?.map(track => ({ position: track.position, title: track.title })) || [],
    masterYear: masterYear,
    releaseYear: release.year,
    discogsUrl: `https://www.discogs.com/release/${sanitizedReleaseId}`,
  };
};
