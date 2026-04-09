import type { Track } from "packages/domain/src/entities/track";
import type { TrackCatalogRepository } from "packages/domain/src/repositories/track-catalog-repository";

export type ExtraBlindtestConstraints = {
  yearBegin: number | null;
  yearEnd: number | null;
  isInstrumental: boolean | null;
  genreIds: string[];
  artistIds: string[];
  compulsoryTrackIds: string[];
}

export type GetRecommendationsInput = {
  seedTrackIds: string[];
  blacklistedTrackIds: string[];
  limit: number;
  randomness: number; // 0 to 100
  currentAccountId?: string | null;
  extraBlindtestConstraints?: ExtraBlindtestConstraints;
};

// Calculate cosine similarity between two feature vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i]! * vecB[i]!;
    normA += vecA[i]! * vecA[i]!;
    normB += vecB[i]! * vecB[i]!;
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Extract numerical features from the audioFeatures object
function extractFeaturesArray(features: any): number[] {
  if (!features) return [];
  // These are the standard Spotify-like audio features usually stored in DBs
  return [
    features.acousticness || 0,
    features.danceability || 0,
    features.energy || 0,
    features.instrumentalness || 0,
    features.liveness || 0,
    features.speechiness || 0,
    features.valence || 0,
    // Tempo usually needs normalization if compared exactly, but we'll include it scaled
    (features.tempo || 0) / 200, 
  ];
}

export const createGetRecommendations =
  (trackCatalogRepository: TrackCatalogRepository) =>
  async (input: GetRecommendationsInput): Promise<Track[]> => {
    const { seedTrackIds, limit, randomness, currentAccountId, extraBlindtestConstraints } = input;
    
    // Always exclude the seeds themselves from being recommended again, plus the explicit blacklist
    const excludedIds = [...new Set([...input.blacklistedTrackIds, ...seedTrackIds])];

    // 1. If randomness is 100 or no seeds provided, return purely random tracks (excluding blacklist)
    if (randomness >= 100 || seedTrackIds.length === 0) {
      return trackCatalogRepository.getRandomTracks(limit, excludedIds, currentAccountId, extraBlindtestConstraints);
    }

    // 2. Fetch seed tracks with their audio features
    const seedTracks = await trackCatalogRepository.getTracksWithFeatures(seedTrackIds, currentAccountId);
    
    // Filter seeds that actually have feature data
    const seedsWithFeatures = seedTracks.filter(t => t.audioFeatures);

    // 3. Fallback: if no seeds have audio features, fallback to purely random tracks 
    // (As per user logic: "Si aucune musique de la liste n'a d'audiofeature... c'est comme si l'aléatoire est de 100" 
    // *User also mentioned genres/tags but API structure doesn't expose genres easily yet, so fallback to random is safest*)
    if (seedsWithFeatures.length === 0) {
      return trackCatalogRepository.getRandomTracks(limit, excludedIds, currentAccountId, extraBlindtestConstraints);
    }

    // 4. Calculate the average feature vector of the valid seeds
    const numFeatures = extractFeaturesArray(seedsWithFeatures[0].audioFeatures).length;
    const averageVector = new Array(numFeatures).fill(0);
    
    for (const track of seedsWithFeatures) {
      const vec = extractFeaturesArray(track.audioFeatures);
      for (let i = 0; i < numFeatures; i++) {
        averageVector[i] += vec[i]! / seedsWithFeatures.length;
      }
    }

    // 5. Fetch a pool of candidate tracks that also have audio features
    // We fetch a larger pool (e.g., 200) to score them against the average vector
    const candidateTracks = await trackCatalogRepository.getRandomTracks(200, excludedIds, currentAccountId, extraBlindtestConstraints);
    
    if (candidateTracks.length === 0) return [];

    // 6. Score each candidate
    // score = similariteCosinus * (1 - (randomness / 100)) + Math.random() * (randomness / 100)
    const randomFactor = Math.max(0, Math.min(100, randomness)) / 100;
    const similarityFactor = 1 - randomFactor;

    const scoredTracks = candidateTracks.map(candidate => {
      const candidateVec = extractFeaturesArray(candidate.audioFeatures);
      const similarity = cosineSimilarity(averageVector, candidateVec);
      
      const finalScore = (similarity * similarityFactor) + (Math.random() * randomFactor);
      
      return { track: candidate, score: finalScore };
    });

    // 7. Sort by highest score and take 'limit'
    scoredTracks.sort((a, b) => b.score - a.score);
    
    return scoredTracks.slice(0, limit).map(st => st.track);
  };
