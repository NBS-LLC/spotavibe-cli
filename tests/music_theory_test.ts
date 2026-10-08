import { assertEquals } from '@std/assert';
import { generateCsv } from '../src/csv.ts';
import type { PlaylistTrackRow } from '../src/types.ts';

Deno.test('CSV Generation - Correct headers and numeric formatting', () => {
  const rows: PlaylistTrackRow[] = [
    {
      title: 'Get Lucky',
      artists: 'Daft Punk; Pharrell Williams; Nile Rodgers',
      bpm: 116.04,
      key: 'F# Minor',
      camelot: '11A',
      energy: 0.811,
    },
    {
      title: 'One More Time',
      artists: 'Daft Punk',
      bpm: 122.98,
      key: 'D Major',
      camelot: '10B',
      energy: 0.692,
    },
    {
      title: 'Earth, Wind & Fire Tribute',
      artists: 'Earth, Wind & Fire; Maurice White',
      bpm: 128.0,
      key: 'C Major',
      camelot: '8B',
      energy: 0.95,
    },
  ];

  const csv = generateCsv(rows);
  const lines = csv.trim().split('\r\n');

  // Headers
  assertEquals(
    lines[0],
    'song title,artists,bpm,key,camelot notation,energy',
  );

  // Semicolon-separated values do not require quotes in comma-delimited CSV
  assertEquals(
    lines[1],
    'Get Lucky,Daft Punk; Pharrell Williams; Nile Rodgers,116.0,F# Minor,11A,0.811',
  );

  // Single artist without special characters
  assertEquals(
    lines[2],
    'One More Time,Daft Punk,123.0,D Major,10B,0.692',
  );

  // Values containing commas are correctly quoted
  assertEquals(
    lines[3],
    '"Earth, Wind & Fire Tribute","Earth, Wind & Fire; Maurice White",128.0,C Major,8B,0.950',
  );
});

Deno.test('CSV Generation - Handles N/A fallback when audio features are unavailable', () => {
  const rows: PlaylistTrackRow[] = [
    {
      title: 'Starboy',
      artists: 'The Weeknd; Daft Punk',
      bpm: 'N/A',
      key: 'N/A',
      camelot: 'N/A',
      energy: 'N/A',
    },
  ];

  const csv = generateCsv(rows);
  const lines = csv.trim().split('\r\n');

  assertEquals(
    lines[0],
    'song title,artists,bpm,key,camelot notation,energy',
  );
  assertEquals(
    lines[1],
    'Starboy,The Weeknd; Daft Punk,N/A,N/A,N/A,N/A',
  );
});
