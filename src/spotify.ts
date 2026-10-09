import type { SpotifyTrack } from './types.ts';

interface EmbedTrackItem {
  uri?: string;
  id?: string;
  title?: string;
  subtitle?: string;
  artists?: Array<{ name: string }>;
}

export class SpotifyClient {
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
    const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
    const response = await fetch(embedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch playlist embed page (${response.status}): ${response.statusText}`,
      );
    }

    const html = await response.text();
    const match = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s,
    );

    if (!match) {
      throw new Error(
        'Could not find playlist data on Spotify embed page. Ensure the playlist is public.',
      );
    }

    const parsed = JSON.parse(match[1]);
    const trackList: EmbedTrackItem[] = parsed?.props?.pageProps?.state?.data?.entity?.trackList;

    if (!Array.isArray(trackList)) {
      throw new Error(
        'Could not find trackList in Spotify embed data. Ensure the playlist is public and contains tracks.',
      );
    }

    const tracks: SpotifyTrack[] = [];
    for (const item of trackList) {
      let id = item.id || '';
      if (!id && item.uri) {
        const parts = item.uri.split(':');
        id = parts[parts.length - 1];
      }

      if (!id) continue;

      let artists: Array<{ name: string }> = [];
      if (Array.isArray(item.artists)) {
        artists = item.artists.map((a) => ({ name: a.name }));
      } else if (typeof item.subtitle === 'string') {
        const cleaned = item.subtitle.replace(/\u00a0/g, ' ');
        artists = cleaned.split(/,\s*/).map((name) => ({ name: name.trim() }));
      }

      tracks.push({
        id,
        name: item.title ?? 'Unknown Title',
        artists,
      });
    }

    return tracks;
  }
}
