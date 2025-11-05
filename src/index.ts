import 'dotenv/config';
import { fetchRelease, fetchMaster } from './core/api-client';
import { sanitizeReleaseId } from './core/sanitizer';
import { getToken } from './core/config';
import { DiscogsApiError } from './errors';
import type { LookupResult } from './types';

// By re-exporting, we make these part of the package's public API.
export type { LookupResult } from './types';
export { DiscogsApiError } from './errors';


/**
 * Fetches and formats comprehensive release data from the Discogs API.
 * @param releaseId The ID of the Discogs release. Can be in formats like '249504', 'r249504', or '[r249504]'.
 * @param discogsToken Your Discogs personal access token. If not provided, it will try to use the DISCOGS_TOKEN environment variable.
 * @returns A promise that resolves with the formatted release data.
 */
export async function lookupRelease(releaseId: string, discogsToken?: string): Promise<LookupResult> {
  const sanitizedId = sanitizeReleaseId(releaseId);
  if (!sanitizedId) {
    throw new DiscogsApiError(`Invalid Release ID format: "${releaseId}". Please provide a valid numeric ID.`);
  }

  const token = getToken(discogsToken);

  const release = await fetchRelease(sanitizedId, token);
  
  let masterYear: number;
  if (release.master_id) {
    const master = await fetchMaster(release.master_id, token);
    masterYear = master.year;
  } else {
    // If no master_id, this is the original release, so use its year.
    masterYear = release.year;
  }

  // Format the final data structure
  return {
    artist: release.artists?.map(a => a.name).join(', ') || 'Unknown Artist',
    title: release.title,
    tracks: release.tracklist?.map(track => ({ position: track.position, title: track.title })) || [],
    masterYear: masterYear,
    releaseYear: release.year,
    discogsUrl: `https://www.discogs.com/release/${sanitizedId}`,
  };
}