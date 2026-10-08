/**
 * Maps Spotify pitch class integers (0-11) and mode (0: Minor, 1: Major)
 * to standard musical key names and Camelot notation.
 */

const PITCH_CLASSES_MAJOR: Record<number, string> = {
  0: 'C Major',
  1: 'Db Major',
  2: 'D Major',
  3: 'Eb Major',
  4: 'E Major',
  5: 'F Major',
  6: 'F# Major',
  7: 'G Major',
  8: 'Ab Major',
  9: 'A Major',
  10: 'Bb Major',
  11: 'B Major',
};

const PITCH_CLASSES_MINOR: Record<number, string> = {
  0: 'C Minor',
  1: 'C# Minor',
  2: 'D Minor',
  3: 'Eb Minor',
  4: 'E Minor',
  5: 'F Minor',
  6: 'F# Minor',
  7: 'G Minor',
  8: 'G# Minor',
  9: 'A Minor',
  10: 'Bb Minor',
  11: 'B Minor',
};

// Camelot Major: B scale
const CAMELOT_MAJOR: Record<number, string> = {
  0: '8B', // C
  1: '3B', // Db
  2: '10B', // D
  3: '5B', // Eb
  4: '12B', // E
  5: '7B', // F
  6: '2B', // F#
  7: '9B', // G
  8: '4B', // Ab
  9: '11B', // A
  10: '6B', // Bb
  11: '1B', // B
};

// Camelot Minor: A scale
const CAMELOT_MINOR: Record<number, string> = {
  0: '5A', // C min
  1: '12A', // C# min
  2: '7A', // D min
  3: '2A', // Eb min
  4: '9A', // E min
  5: '4A', // F min
  6: '11A', // F# min
  7: '6A', // G min
  8: '1A', // G# min
  9: '8A', // A min
  10: '3A', // Bb min
  11: '10A', // B min
};

export function getMusicalKey(key: number, mode: number): string {
  if (key < 0 || key > 11) {
    return 'Unknown';
  }
  return mode === 1 ? PITCH_CLASSES_MAJOR[key] : PITCH_CLASSES_MINOR[key];
}

export function getCamelotKey(key: number, mode: number): string {
  if (key < 0 || key > 11) {
    return 'Unknown';
  }
  return mode === 1 ? CAMELOT_MAJOR[key] : CAMELOT_MINOR[key];
}
