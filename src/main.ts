import { parseArgs } from '@std/cli/parse-args';
import { SpotifyClient } from './spotify.ts';
import { getAudioFeatures } from './reccobeats.ts';
import { getCamelotKey, getMusicalKey } from './music_theory.ts';
import { generateCsv } from './csv.ts';
import type { PlaylistTrackRow } from './types.ts';

async function main() {
  const flags = parseArgs(Deno.args, {
    string: ['output', 'o'],
    alias: { o: 'output' },
    default: { output: 'out/playlist.csv' },
  });

  const playlistInput = flags._[0]?.toString();
  if (!playlistInput) {
    console.error('Usage: ./run.sh <SPOTIFY_PLAYLIST_URL> [-o out/playlist.csv]');
    Deno.exit(1);
  }

  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    console.error(
      'Error: SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables must be set.',
    );
    Deno.exit(1);
  }

  const client = new SpotifyClient(clientId, clientSecret);

  try {
    const playlistId = client.extractPlaylistId(playlistInput);
    console.log(`Processing playlist ID: ${playlistId}`);

    console.log('Fetching tracks...');
    const tracks = await client.getPlaylistTracks(playlistId);
    console.log(`Retrieved ${tracks.length} tracks.`);

    if (tracks.length === 0) {
      console.warn('Playlist has no valid tracks.');
      return;
    }

    console.log('Fetching audio features (tempo, key, energy)...');
    const trackIds = tracks.map((t) => t.id);
    const featuresMap = await getAudioFeatures(trackIds);

    const rows: PlaylistTrackRow[] = [];
    for (const track of tracks) {
      const feat = featuresMap.get(track.id);
      const artistsJoined = track.artists.map((a) => a.name).join('; ');

      if (feat) {
        rows.push({
          title: track.name,
          artists: artistsJoined,
          bpm: feat.tempo,
          key: getMusicalKey(feat.key, feat.mode),
          camelot: getCamelotKey(feat.key, feat.mode),
          energy: feat.energy,
        });
      } else {
        rows.push({
          title: track.name,
          artists: artistsJoined,
          bpm: 'N/A',
          key: 'N/A',
          camelot: 'N/A',
          energy: 'N/A',
        });
      }
    }

    const csvContent = generateCsv(rows);
    const outputPath: string = flags.output ?? 'out/playlist.csv';

    const lastSlash = outputPath.lastIndexOf('/');
    if (lastSlash > 0) {
      const dir = outputPath.substring(0, lastSlash);
      await Deno.mkdir(dir, { recursive: true });
    }

    await Deno.writeTextFile(outputPath, csvContent);
    console.log(`\nSuccessfully exported ${rows.length} tracks to: ${outputPath}`);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await main();
}
