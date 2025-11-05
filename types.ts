export interface DiscogsArtist {
  name: string;
  id: number;
}

export interface DiscogsTrack {
  position: string;
  title: string;
  duration: string;
}

export interface DiscogsReleaseResponse {
  id: number;
  title: string;
  artists: DiscogsArtist[];
  tracklist: DiscogsTrack[];
  master_id: number;
  year: number;
}

export interface DiscogsMasterResponse {
  id: number;
  year: number;
  title: string;
  artists: DiscogsArtist[];
}

export interface ReleaseData {
  artist: string;
  title: string;
  tracks: { position: string; title: string }[];
  masterYear: number;
  releaseYear: number;
  discogsUrl: string;
}
