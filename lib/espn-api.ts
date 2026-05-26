const ESPN_BASE = "https://fantasy.espn.com/apis/v3/games/flb";
const DEFAULT_LEAGUE_ID = 81511270;

export interface ESPNCredentials {
  leagueId?: number;
  s2: string;
  swid: string;
}

export interface ESPNTeam {
  id: number;
  name: string;
  abbrev: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  roster?: ESPNRosterEntry[];
}

export interface ESPNRosterEntry {
  playerPoolEntry: {
    acquisitionType: string;
    playerPoolEntryId: number;
    player: {
      id: number;
      fullName: string;
      proTeamId: number;
      defaultPositionId: number;
      eligibleSlots: number[];
      stats?: ESPNPlayerStats[];
    };
    onTeamId: number;
  };
  lineupSlotId: number;
}

export interface ESPNPlayerStats {
  scoringPeriodId: number;
  seasonId: number;
  statSourceId: number;
  statSplitTypeId: number;
  stats: Record<string, number>;
  appliedTotal: number;
}

export interface ESPNMatchup {
  id: number;
  matchupPeriodId: number;
  home: { teamId: number; totalPoints: number; rosterForCurrentScoringPeriod?: { entries: ESPNRosterEntry[] } };
  away: { teamId: number; totalPoints: number; rosterForCurrentScoringPeriod?: { entries: ESPNRosterEntry[] } };
}

export interface ESPNLeagueData {
  id: number;
  settings: {
    name: string;
    scoringSettings: {
      scoringItems: Array<{ statId: number; pointsPerStat: number; isReverseItem: boolean }>;
    };
    scheduleSettings: { matchupPeriodCount: number; playoffMatchupPeriodLength: number };
  };
  teams: ESPNTeam[];
  schedule: ESPNMatchup[];
  scoringPeriodId: number;
  seasonId: number;
}

export async function fetchESPNLeague(
  creds: ESPNCredentials,
  views: string[] = ["mTeam", "mSettings", "mMatchup"]
): Promise<ESPNLeagueData | null> {
  const leagueId = creds.leagueId ?? DEFAULT_LEAGUE_ID;
  const season = new Date().getFullYear();
  const viewParam = views.map((v) => `view=${v}`).join("&");
  const url = `${ESPN_BASE}/seasons/${season}/segments/0/leagues/${leagueId}?${viewParam}`;

  try {
    const res = await fetch(url, {
      headers: {
        Cookie: `espn_s2=${creds.s2}; SWID=${creds.swid}`,
        "X-Fantasy-Source": "kona",
        "X-Fantasy-Platform": "kona-PROD-m.3827.0",
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error(`ESPN API error: ${res.status}`);
      return null;
    }

    return res.json();
  } catch (err) {
    console.error("ESPN fetch error:", err);
    return null;
  }
}

export async function fetchESPNRosters(creds: ESPNCredentials): Promise<ESPNLeagueData | null> {
  return fetchESPNLeague(creds, ["mRoster", "mTeam"]);
}

export async function fetchESPNMatchup(creds: ESPNCredentials, scoringPeriodId?: number): Promise<ESPNMatchup[]> {
  const leagueId = creds.leagueId ?? DEFAULT_LEAGUE_ID;
  const season = new Date().getFullYear();
  const periodParam = scoringPeriodId ? `&scoringPeriodId=${scoringPeriodId}` : "";
  const url = `${ESPN_BASE}/seasons/${season}/segments/0/leagues/${leagueId}?view=mMatchup${periodParam}`;

  try {
    const res = await fetch(url, {
      headers: { Cookie: `espn_s2=${creds.s2}; SWID=${creds.swid}` },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data: ESPNLeagueData = await res.json();
    return data.schedule ?? [];
  } catch {
    return [];
  }
}

export const ESPN_POSITION_MAP: Record<number, string> = {
  1: "C", 2: "1B", 3: "2B", 4: "3B", 5: "SS", 6: "LF", 7: "CF", 8: "RF",
  9: "DH", 10: "OF", 11: "P", 12: "SP", 13: "RP", 14: "UTIL",
};

export const ESPN_STAT_MAP: Record<number, string> = {
  0: "AB", 1: "H", 2: "AVG", 3: "OBP", 4: "SLG", 5: "R", 6: "HR", 7: "RBI",
  8: "K", 9: "BB", 10: "SB", 11: "CS", 12: "GIDP", 13: "HBP", 14: "SF",
  15: "SH", 16: "TB", 17: "XBH", 18: "2B", 19: "3B", 20: "IBB", 21: "OPS",
  25: "IP", 26: "H_P", 27: "ER", 28: "HR_P", 29: "BB_P", 30: "K_P", 31: "W",
  32: "L", 33: "SV", 34: "HLD", 35: "ERA", 36: "WHIP", 37: "BS", 38: "CG",
  39: "SHO", 40: "NH", 41: "QS", 42: "K9",
};
