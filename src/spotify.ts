import type { SpotifyAudioFeatures, SpotifyTrack } from './types.ts';

export class SpotifyClient {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  private async authenticate(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    const credentials = btoa(`${this.clientId}:${this.clientSecret}`);
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Spotify authentication failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    return this.accessToken!;
  }

  public extractPlaylistId(urlOrId: string): string {
    const trimmed = urlOrId.trim();
    const urlMatch = trimmed.match(/playlist\/([a-zA-Z0-9]{22})/);
    if (urlMatch) {
      return urlMatch[1];
    }

    const uriMatch = trimmed.match(/spotify:playlist:([a-zA-Z0-9]{22})/);
    if (uriMatch) {
      return uriMatch[1];
    }

    if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) {
      return trimmed;
    }

    throw new Error(`Invalid Spotify playlist URL or ID provided: "${urlOrId}"`);
  }

  public async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    const token = await this.authenticate();
    const tracks: SpotifyTrack[] = [];
    let nextUrl: string | null =
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100&fields=items(track(id,name,artists(name))),next`;

    while (nextUrl) {
      const response = await fetch(nextUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch playlist tracks (${response.status}): ${errorText}`,
        );
      }

      const data = await response.json();
      for (const item of data.items) {
        if (item.track && item.track.id) {
          tracks.push({
            id: item.track.id,
            name: item.track.name,
            artists: item.track.artists ?? [],
          });
        }
      }
      nextUrl = data.next;
    }

    return tracks;
  }

  public async getAudioFeatures(
    trackIds: string[],
  ): Promise<Map<string, SpotifyAudioFeatures>> {
    const token = await this.authenticate();
    const featuresMap = new Map<string, SpotifyAudioFeatures>();

    const batchSize = 100;
    for (let i = 0; i < trackIds.length; i += batchSize) {
      const chunk = trackIds.slice(i, i + batchSize);
      const url = `https://api.spotify.com/v1/audio-features?ids=${chunk.join(',')}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 403) {
          console.warn(
            '\n⚠️  Spotify returned 403 Forbidden for /v1/audio-features.\n' +
              '   Spotify has restricted audio features (BPM, key, energy) for developer apps.\n' +
              '   Exporting playlist tracks with "N/A" for these metrics.\n',
          );
          return featuresMap;
        }

        const errorText = await response.text();
        throw new Error(
          `Failed to fetch audio features (${response.status}): ${errorText}`,
        );
      }

      const data = await response.json();
      for (const feat of data.audio_features) {
        if (feat && feat.id) {
          featuresMap.set(feat.id, {
            id: feat.id,
            tempo: feat.tempo,
            key: feat.key,
            mode: feat.mode,
            energy: feat.energy,
          });
        }
      }
    }

    return featuresMap;
  }
}
