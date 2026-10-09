import { assertEquals, assertThrows } from '@std/assert';
import { SpotifyClient } from '../src/spotify.ts';

Deno.test('SpotifyClient - extractPlaylistId from various formats', () => {
  const client = new SpotifyClient();

  // Standard web URL with query params
  assertEquals(
    client.extractPlaylistId(
      'https://open.spotify.com/playlist/5Jo5zTyCP5gc51Zrkb42NI?si=abcdef123456',
    ),
    '5Jo5zTyCP5gc51Zrkb42NI',
  );

  // Clean web URL
  assertEquals(
    client.extractPlaylistId('https://open.spotify.com/playlist/5Jo5zTyCP5gc51Zrkb42NI'),
    '5Jo5zTyCP5gc51Zrkb42NI',
  );

  // Spotify URI format
  assertEquals(
    client.extractPlaylistId('spotify:playlist:5Jo5zTyCP5gc51Zrkb42NI'),
    '5Jo5zTyCP5gc51Zrkb42NI',
  );

  // Direct 22-character Spotify ID
  assertEquals(
    client.extractPlaylistId('5Jo5zTyCP5gc51Zrkb42NI'),
    '5Jo5zTyCP5gc51Zrkb42NI',
  );

  // Whitespace trimming
  assertEquals(
    client.extractPlaylistId('  5Jo5zTyCP5gc51Zrkb42NI  '),
    '5Jo5zTyCP5gc51Zrkb42NI',
  );
});

Deno.test('SpotifyClient - extractPlaylistId throws on invalid inputs', () => {
  const client = new SpotifyClient();

  assertThrows(
    () => client.extractPlaylistId('https://open.spotify.com/album/5Jo5zTyCP5gc51Zrkb42NI'),
    Error,
    'Invalid Spotify playlist URL or ID provided',
  );

  assertThrows(
    () => client.extractPlaylistId('not-a-valid-id'),
    Error,
    'Invalid Spotify playlist URL or ID provided',
  );
});
