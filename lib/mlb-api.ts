const MLB_BASE = "https://statsapi.mlb.com/api/v1";

async function mlbFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${MLB_BASE}${path}`, {
    next: { revalidate: 1800 },
    headers: { "User-Agent": "TheWARRoom/1.0" },
  });
  if (!res.ok) throw new Error(`MLB API error: ${res.status} for ${path}`);
  return res.json();
}

export interface ScheduleGame {
  gamePk: number;
  gameDate: string;
  status: { abstractGameState: string; detailedState: string };
  teams: {
    away: { team: { id: number; name: string }; score?: number; leagueRecord: { wins: number; losses: number } };
    home: { team: { id: number; name: string }; score?: number; leagueRecord: { wins: number; losses: number } };
  };
  venue: { name: string };
  linescore?: {
    currentInning?: number;
    inningHalf?: string;
    innings?: Array<{ home: { runs?: number }; away: { runs?: number } }>;
  };
}

export async function getTodaySchedule(): Promise<ScheduleGame[]> {
  const today = new Date().toISOString().split("T")[0];
  const data = await mlbFetch<{ dates: Array<{ games: ScheduleGame[] }> }>(
    `/schedule?sportId=1&date=${today}&hydrate=linescore,team`
  );
  return data.dates?.[0]?.games ?? [];
}

export async function getScheduleForDate(date: string): Promise<ScheduleGame[]> {
  const data = await mlbFetch<{ dates: Array<{ games: ScheduleGame[] }> }>(
    `/schedule?sportId=1&date=${date}&hydrate=linescore,team`
  );
  return data.dates?.[0]?.games ?? [];
}

export interface RosterPlayer {
  person: { id: number; fullName: string };
  jerseyNumber?: string;
  position: { code: string; name: string; type: string; abbreviation: string };
  status: { code: string; description: string };
}

export async function getActiveRoster(teamId: number): Promise<RosterPlayer[]> {
  const data = await mlbFetch<{ roster: RosterPlayer[] }>(
    `/teams/${teamId}/roster?rosterType=active`
  );
  return data.roster ?? [];
}

export async function get40ManRoster(teamId: number): Promise<RosterPlayer[]> {
  const data = await mlbFetch<{ roster: RosterPlayer[] }>(
    `/teams/${teamId}/roster?rosterType=fullRoster`
  );
  return data.roster ?? [];
}

export interface HittingStat {
  gamesPlayed: number;
  atBats: number;
  hits: number;
  avg: string;
  obp: string;
  slg: string;
  ops: string;
  opsPlus?: number;
  homeRuns: number;
  rbi: number;
  runs: number;
  stolenBases: number;
  caughtStealing: number;
  strikeOuts: number;
  baseOnBalls: number;
  intentionalWalks: number;
  hitByPitch: number;
  groundIntoDoublePlay: number;
  totalBases: number;
  doubles: number;
  triples: number;
  babip?: string;
  plateAppearances: number;
  sacFlies: number;
}

export interface PitchingStat {
  gamesPlayed: number;
  gamesStarted: number;
  wins: number;
  losses: number;
  saves: number;
  holds: number;
  blownSaves: number;
  era: string;
  whip: string;
  strikeOuts: number;
  baseOnBalls: number;
  inningsPitched: string;
  hits: number;
  homeRuns: number;
  earnedRuns: number;
  strikeoutsPer9Inn: string;
  walksPer9Inn: string;
  hitsPer9Inn: string;
  strikeoutWalkRatio: string;
  qualityStarts: number;
  completeGames: number;
  shutouts: number;
  groundOutsToAirouts: string;
}

export interface PlayerStats {
  hitting?: { career?: HittingStat; season?: HittingStat; lastThreeYears?: HittingStat[] };
  pitching?: { career?: PitchingStat; season?: PitchingStat; lastThreeYears?: PitchingStat[] };
  splits?: { vsLeft?: HittingStat; vsRight?: HittingStat };
}

export async function getPlayerHittingStats(
  personId: number,
  season: number = new Date().getFullYear()
): Promise<{ season?: HittingStat; career?: HittingStat }> {
  const [seasonData, careerData] = await Promise.allSettled([
    mlbFetch<{ stats: Array<{ splits: Array<{ stat: HittingStat }> }> }>(
      `/people/${personId}/stats?stats=season&season=${season}&group=hitting`
    ),
    mlbFetch<{ stats: Array<{ splits: Array<{ stat: HittingStat }> }> }>(
      `/people/${personId}/stats?stats=career&group=hitting`
    ),
  ]);

  return {
    season: seasonData.status === "fulfilled" ? seasonData.value.stats?.[0]?.splits?.[0]?.stat : undefined,
    career: careerData.status === "fulfilled" ? careerData.value.stats?.[0]?.splits?.[0]?.stat : undefined,
  };
}

export async function getPlayerPitchingStats(
  personId: number,
  season: number = new Date().getFullYear()
): Promise<{ season?: PitchingStat; career?: PitchingStat }> {
  const [seasonData, careerData] = await Promise.allSettled([
    mlbFetch<{ stats: Array<{ splits: Array<{ stat: PitchingStat }> }> }>(
      `/people/${personId}/stats?stats=season&season=${season}&group=pitching`
    ),
    mlbFetch<{ stats: Array<{ splits: Array<{ stat: PitchingStat }> }> }>(
      `/people/${personId}/stats?stats=career&group=pitching`
    ),
  ]);

  return {
    season: seasonData.status === "fulfilled" ? seasonData.value.stats?.[0]?.splits?.[0]?.stat : undefined,
    career: careerData.status === "fulfilled" ? careerData.value.stats?.[0]?.splits?.[0]?.stat : undefined,
  };
}

export async function getPlayerSplits(
  personId: number,
  season: number = new Date().getFullYear(),
  group: "hitting" | "pitching" = "hitting"
): Promise<{ vsLeft?: HittingStat | PitchingStat; vsRight?: HittingStat | PitchingStat }> {
  try {
    const data = await mlbFetch<{ stats: Array<{ splits: Array<{ split: { code: string }; stat: HittingStat | PitchingStat }> }> }>(
      `/people/${personId}/stats?stats=statSplits&season=${season}&group=${group}&sitCodes=vl,vr`
    );
    const splits = data.stats?.[0]?.splits ?? [];
    return {
      vsLeft: splits.find((s) => s.split?.code === "vl")?.stat,
      vsRight: splits.find((s) => s.split?.code === "vr")?.stat,
    };
  } catch {
    return {};
  }
}

export interface StatLeader {
  rank: number;
  value: string;
  person: { id: number; fullName: string };
  team: { id: number; name: string };
}

export async function getStatLeaders(
  categories: string[],
  season: number = new Date().getFullYear(),
  limit: number = 50
): Promise<Record<string, StatLeader[]>> {
  const data = await mlbFetch<{ leagueLeaders: Array<{ leaderCategory: string; leaders: StatLeader[] }> }>(
    `/stats/leaders?leaderCategories=${categories.join(",")}&season=${season}&sportId=1&limit=${limit}`
  );
  const result: Record<string, StatLeader[]> = {};
  for (const cat of data.leagueLeaders ?? []) {
    result[cat.leaderCategory] = cat.leaders;
  }
  return result;
}

export interface PersonInfo {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  primaryNumber?: string;
  birthDate?: string;
  currentAge?: number;
  birthCity?: string;
  birthCountry?: string;
  height?: string;
  weight?: number;
  primaryPosition?: { code: string; name: string; abbreviation: string };
  batSide?: { code: string; description: string };
  pitchHand?: { code: string; description: string };
  mlbDebutDate?: string;
  currentTeam?: { id: number; name: string };
}

export async function getPersonInfo(personId: number): Promise<PersonInfo | null> {
  try {
    const data = await mlbFetch<{ people: PersonInfo[] }>(`/people/${personId}?hydrate=currentTeam`);
    return data.people?.[0] ?? null;
  } catch {
    return null;
  }
}

export interface Standings {
  division: string;
  teams: Array<{
    team: { id: number; name: string };
    wins: number;
    losses: number;
    gamesBack: string;
    pct: string;
    streak?: { streakCode: string };
    runsScored: number;
    runsAllowed: number;
  }>;
}

export async function getStandings(season: number = new Date().getFullYear()): Promise<Standings[]> {
  const data = await mlbFetch<{ records: Array<{ division: { name: string }; teamRecords: Standings["teams"] }> }>(
    `/standings?leagueId=103,104&season=${season}&standingsTypes=regularSeason&hydrate=team`
  );
  return (data.records ?? []).map((r) => ({
    division: r.division.name,
    teams: r.teamRecords,
  }));
}
