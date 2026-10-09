export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
}

export interface AudioFeatures {
  tempo: number;
  key: number;
  mode: number;
  energy: number;
}

export interface PlaylistTrackRow {
  title: string;
  artists: string;
  bpm: number | string;
  key: string;
  camelot: string;
  energy: number | string;
}
