export interface ScoringConfig {
  // Batting
  runs: number;
  totalBases: number;
  rbi: number;
  gwrbi: number;
  walks: number;
  intentionalWalks: number;
  strikeouts: number;
  hitByPitch: number;
  stolenBases: number;
  caughtStealing: number;
  groundIntoDoublePlay: number;
  hittingForCycle: number;
  errors: number;
  // Pitching
  inningsPitched: number;
  hitsAllowed: number;
  earnedRuns: number;
  walksIssued: number;
  hitBatsmen: number;
  pitchingStrikeouts: number;
  pickOffs: number;
  qualityStarts: number;
  completeGames: number;
  noHitters: number;
  perfectGames: number;
  saves: number;
  blownSaves: number;
  holds: number;
}

export const DEFAULT_SCORING: ScoringConfig = {
  // Batting
  runs: 1,
  totalBases: 1,
  rbi: 1,
  gwrbi: 2,
  walks: 1,
  intentionalWalks: 1,
  strikeouts: -0.25,
  hitByPitch: 1,
  stolenBases: 1,
  caughtStealing: -0.5,
  groundIntoDoublePlay: -0.5,
  hittingForCycle: 10,
  errors: -0.5,
  // Pitching
  inningsPitched: 3,
  hitsAllowed: -0.25,
  earnedRuns: 2,
  walksIssued: -0.25,
  hitBatsmen: -0.25,
  pitchingStrikeouts: 1,
  pickOffs: 1,
  qualityStarts: 3,
  completeGames: 2,
  noHitters: 5,
  perfectGames: 15,
  saves: 5,
  blownSaves: 3,
  holds: 2,
};

export interface HitterFantasyStats {
  gamesPlayed: number;
  atBats: number;
  runs: number;
  hits: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  rbi: number;
  walks: number;
  intentionalWalks: number;
  strikeouts: number;
  hitByPitch: number;
  stolenBases: number;
  caughtStealing: number;
  groundIntoDoublePlay: number;
  totalBases: number;
}

export interface PitcherFantasyStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  saves: number;
  holds: number;
  blownSaves: number;
  qualityStarts: number;
  completeGames: number;
  inningsPitched: number;
  hitsAllowed: number;
  earnedRuns: number;
  walksIssued: number;
  strikeouts: number;
  hitBatsmen: number;
}

export function calculateHitterPoints(stats: HitterFantasyStats, config: ScoringConfig): number {
  return (
    stats.runs * config.runs +
    stats.totalBases * config.totalBases +
    stats.rbi * config.rbi +
    stats.walks * config.walks +
    stats.intentionalWalks * config.intentionalWalks +
    stats.strikeouts * config.strikeouts +
    stats.hitByPitch * config.hitByPitch +
    stats.stolenBases * config.stolenBases +
    stats.caughtStealing * config.caughtStealing +
    stats.groundIntoDoublePlay * config.groundIntoDoublePlay
  );
}

export function calculatePitcherPoints(stats: PitcherFantasyStats, config: ScoringConfig): number {
  return (
    stats.inningsPitched * config.inningsPitched +
    stats.hitsAllowed * config.hitsAllowed +
    stats.earnedRuns * config.earnedRuns +
    stats.walksIssued * config.walksIssued +
    stats.hitBatsmen * config.hitBatsmen +
    stats.strikeouts * config.pitchingStrikeouts +
    stats.qualityStarts * config.qualityStarts +
    stats.completeGames * config.completeGames +
    stats.saves * config.saves +
    stats.blownSaves * config.blownSaves +
    stats.holds * config.holds
  );
}

export function calculatePointsPerGame(totalPoints: number, gamesPlayed: number): number {
  if (gamesPlayed === 0) return 0;
  return Math.round((totalPoints / gamesPlayed) * 100) / 100;
}

export function projectRestOfSeason(
  currentPoints: number,
  gamesPlayed: number,
  totalGames: number = 162
): number {
  if (gamesPlayed === 0) return 0;
  const pace = currentPoints / gamesPlayed;
  const gamesRemaining = Math.max(0, totalGames - gamesPlayed);
  return Math.round(pace * gamesRemaining * 10) / 10;
}
