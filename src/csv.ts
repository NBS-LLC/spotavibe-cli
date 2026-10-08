import { stringify } from '@std/csv';
import type { PlaylistTrackRow } from './types.ts';

export function generateCsv(rows: PlaylistTrackRow[]): string {
  const formattedData = rows.map((r) => ({
    'song title': r.title,
    'artists': r.artists,
    'bpm': typeof r.bpm === 'number' ? r.bpm.toFixed(1) : r.bpm,
    'key': r.key,
    'camelot notation': r.camelot,
    'energy': typeof r.energy === 'number' ? r.energy.toFixed(3) : r.energy,
  }));

  return stringify(formattedData, {
    columns: ['song title', 'artists', 'bpm', 'key', 'camelot notation', 'energy'],
  });
}
