import type { AudioFeatures } from './types.ts';

interface ReccoBeatsItem {
  id: string;
  href?: string;
  tempo: number;
  key: number;
  mode: number;
  energy: number;
}

interface ReccoBeatsResponse {
  content?: ReccoBeatsItem[];
}

/**
 * Fetches audio features from ReccoBeats API for Spotify track IDs.
 * ReccoBeats accepts up to 40 track IDs per batch.
 */
export async function getAudioFeatures(
  trackIds: string[],
): Promise<Map<string, AudioFeatures>> {
  const featuresMap = new Map<string, AudioFeatures>();
  const batchSize = 40;

  for (let i = 0; i < trackIds.length; i += batchSize) {
    const chunk = trackIds.slice(i, i + batchSize);
    const url = 'https://api.reccobeats.com/v1/audio-features?ids=' + chunk.join(',');

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        console.warn('ReccoBeats returned HTTP status ' + response.status);
        continue;
      }

      const data: ReccoBeatsResponse = await response.json();
      if (Array.isArray(data.content)) {
        for (const item of data.content) {
          const feature: AudioFeatures = {
            tempo: item.tempo,
            key: item.key,
            mode: item.mode,
            energy: item.energy,
          };
          if (item.id) featuresMap.set(item.id, feature);
          if (item.href) {
            const match = item.href.match(/track\/([a-zA-Z0-9]{22})/);
            if (match) featuresMap.set(match[1], feature);
          }
        }
      }
    } catch (err) {
      console.warn('ReccoBeats fetch warning: ' + (err as Error).message);
    }

    if (i + batchSize < trackIds.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  return featuresMap;
}
