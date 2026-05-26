// MLB Player Contract Data (2025 Season)
// Source: Public contract information from Spotrac / Baseball Reference
// Salary in millions USD per year

export interface PlayerContract {
  playerId: number;   // MLB person ID
  name: string;
  salary: number;     // AAV in $M
  totalValue: number; // total contract value in $M
  years: number;      // total years
  yearsLeft: number;  // years remaining including 2025
  expiresAfter: number; // year contract ends
  contractType: "extension" | "free-agent" | "arbitration" | "pre-arb" | "league-min";
  teamId: number;
}

// Pre-arb / league min placeholder
const MIN = 0.74; // 2025 MLB minimum salary

const CONTRACTS: PlayerContract[] = [
  // ── Yankees (147) ──────────────────────────────────────────────────────────
  { playerId: 592450, name: "Aaron Judge",       salary: 40,    totalValue: 360,  years: 9, yearsLeft: 7, expiresAfter: 2031, contractType: "extension",   teamId: 147 },
  { playerId: 664023, name: "Gerrit Cole",        salary: 36,    totalValue: 324,  years: 9, yearsLeft: 3, expiresAfter: 2027, contractType: "free-agent",  teamId: 147 },
  { playerId: 621244, name: "Anthony Rizzo",      salary: 17,    totalValue: 51,   years: 3, yearsLeft: 1, expiresAfter: 2025, contractType: "free-agent",  teamId: 147 },
  { playerId: 650402, name: "Jazz Chisholm",      salary: 6,     totalValue: 6,    years: 1, yearsLeft: 1, expiresAfter: 2025, contractType: "arbitration", teamId: 147 },
  { playerId: 671277, name: "Juan Soto",          salary: 51,    totalValue: 765,  years: 15, yearsLeft: 15, expiresAfter: 2039, contractType: "free-agent", teamId: 121 },

  // ── Mets (121) ──────────────────────────────────────────────────────────────
  { playerId: 671277, name: "Juan Soto",          salary: 51,    totalValue: 765,  years: 15, yearsLeft: 15, expiresAfter: 2039, contractType: "free-agent", teamId: 121 },
  { playerId: 605141, name: "Francisco Lindor",   salary: 34.1,  totalValue: 341,  years: 10, yearsLeft: 6, expiresAfter: 2031, contractType: "extension",  teamId: 121 },
  { playerId: 669270, name: "Pete Alonso",        salary: 27,    totalValue: 54,   years: 2, yearsLeft: 2, expiresAfter: 2026, contractType: "free-agent",  teamId: 121 },
  { playerId: 666201, name: "Sean Manaea",        salary: 26.5,  totalValue: 53,   years: 2, yearsLeft: 2, expiresAfter: 2026, contractType: "free-agent",  teamId: 121 },

  // ── Dodgers (119) ──────────────────────────────────────────────────────────
  { playerId: 660271, name: "Shohei Ohtani",      salary: 46,    totalValue: 700,  years: 10, yearsLeft: 9, expiresAfter: 2033, contractType: "free-agent", teamId: 119 },
  { playerId: 605135, name: "Freddie Freeman",    salary: 27,    totalValue: 162,  years: 6, yearsLeft: 4, expiresAfter: 2028, contractType: "free-agent",  teamId: 119 },
  { playerId: 596115, name: "Clayton Kershaw",    salary: 20,    totalValue: 20,   years: 1, yearsLeft: 1, expiresAfter: 2025, contractType: "free-agent",  teamId: 119 },
  { playerId: 641154, name: "Tyler Glasnow",      salary: 25,    totalValue: 136,  years: 5, yearsLeft: 4, expiresAfter: 2028, contractType: "extension",  teamId: 119 },
  { playerId: 663586, name: "Teoscar Hernandez",  salary: 23.5,  totalValue: 23.5, years: 1, yearsLeft: 1, expiresAfter: 2025, contractType: "free-agent",  teamId: 119 },

  // ── Angels (108) ──────────────────────────────────────────────────────────
  { playerId: 545361, name: "Mike Trout",         salary: 37.1,  totalValue: 426,  years: 12, yearsLeft: 4, expiresAfter: 2030, contractType: "extension",  teamId: 108 },

  // ── Red Sox (111) ──────────────────────────────────────────────────────────
  { playerId: 646240, name: "Rafael Devers",      salary: 31.25, totalValue: 313,  years: 10, yearsLeft: 8, expiresAfter: 2033, contractType: "extension",  teamId: 111 },
  { playerId: 596019, name: "Chris Sale",         salary: 27.5,  totalValue: 27.5, years: 1, yearsLeft: 1, expiresAfter: 2025, contractType: "free-agent",  teamId: 111 },
  { playerId: 657020, name: "Jarren Duran",       salary: 0.74,  totalValue: 0.74, years: 1, yearsLeft: 1, expiresAfter: 2025, contractType: "pre-arb",    teamId: 111 },

  // ── Cubs (112) ──────────────────────────────────────────────────────────────
  { playerId: 669257, name: "Dansby Swanson",     salary: 23.5,  totalValue: 177,  years: 7, yearsLeft: 5, expiresAfter: 2029, contractType: "free-agent",  teamId: 112 },
  { playerId: 656945, name: "Seiya Suzuki",       salary: 17,    totalValue: 85,   years: 5, yearsLeft: 3, expiresAfter: 2027, contractType: "free-agent",  teamId: 112 },
  { playerId: 641531, name: "Kyle Tucker",        salary: 31,    totalValue: 186,  years: 6, yearsLeft: 6, expiresAfter: 2030, contractType: "extension",  teamId: 112 },

  // ── Astros (117) ──────────────────────────────────────────────────────────
  { playerId: 514888, name: "Justin Verlander",   salary: 16,    totalValue: 32,   years: 2, yearsLeft: 1, expiresAfter: 2025, contractType: "free-agent",  teamId: 117 },
  { playerId: 600303, name: "Jose Altuve",        salary: 29,    totalValue: 125,  years: 5, yearsLeft: 3, expiresAfter: 2027, contractType: "extension",  teamId: 117 },
  { playerId: 665742, name: "Yordan Alvarez",     salary: 37.5,  totalValue: 115,  years: 6, yearsLeft: 4, expiresAfter: 2028, contractType: "extension",  teamId: 117 },
  { playerId: 682998, name: "Jeremy Pena",        salary: 4,     totalValue: 4,    years: 1, yearsLeft: 1, expiresAfter: 2025, contractType: "arbitration", teamId: 117 },
  { playerId: 543592, name: "Lance McCullers",    salary: 13.5,  totalValue: 85,   years: 5, yearsLeft: 1, expiresAfter: 2025, contractType: "extension",  teamId: 117 },

  // ── Phillies (143) ─────────────────────────────────────────────────────────
  { playerId: 596142, name: "Bryce Harper",       salary: 26,    totalValue: 330,  years: 13, yearsLeft: 5, expiresAfter: 2031, contractType: "free-agent", teamId: 143 },
  { playerId: 543612, name: "Zack Wheeler",       salary: 23.3,  totalValue: 124,  years: 5, yearsLeft: 2, expiresAfter: 2026, contractType: "free-agent",  teamId: 143 },
  { playerId: 608566, name: "Aaron Nola",         salary: 16,    totalValue: 172,  years: 7, yearsLeft: 5, expiresAfter: 2029, contractType: "extension",  teamId: 143 },
  { playerId: 676801, name: "Trea Turner",        salary: 34,    totalValue: 300,  years: 11, yearsLeft: 9, expiresAfter: 2033, contractType: "free-agent", teamId: 143 },

  // ── Cardinals (138) ────────────────────────────────────────────────────────
  { playerId: 518966, name: "Willson Contreras",  salary: 17.5,  totalValue: 87.5, years: 5, yearsLeft: 3, expiresAfter: 2027, contractType: "free-agent",  teamId: 138 },
  { playerId: 677800, name: "Masyn Winn",         salary: 0.74,  totalValue: 0.74, years: 1, yearsLeft: 1, expiresAfter: 2025, contractType: "pre-arb",    teamId: 138 },

  // ── Orioles (110) ──────────────────────────────────────────────────────────
  { playerId: 683737, name: "Adley Rutschman",    salary: 5.5,   totalValue: 5.5,  years: 1, yearsLeft: 1, expiresAfter: 2025, contractType: "arbitration", teamId: 110 },
  { playerId: 682998, name: "Gunnar Henderson",   salary: 0.74,  totalValue: 0.74, years: 1, yearsLeft: 1, expiresAfter: 2025, contractType: "pre-arb",    teamId: 110 },
  { playerId: 676971, name: "Corbin Burnes",      salary: 28.5,  totalValue: 28.5, years: 1, yearsLeft: 1, expiresAfter: 2025, contractType: "free-agent",  teamId: 110 },

  // ── Guardians (114) ────────────────────────────────────────────────────────
  { playerId: 669923, name: "José Ramírez",       salary: 26,    totalValue: 124.5, years: 7, yearsLeft: 5, expiresAfter: 2028, contractType: "extension", teamId: 114 },
  { playerId: 666917, name: "Shane Bieber",       salary: 13.5,  totalValue: 13.5, years: 1, yearsLeft: 1, expiresAfter: 2025, contractType: "free-agent",  teamId: 114 },

  // ── Rockies (115) ──────────────────────────────────────────────────────────
  { playerId: 641355, name: "Kris Bryant",        salary: 26,    totalValue: 182,  years: 7, yearsLeft: 3, expiresAfter: 2027, contractType: "free-agent",  teamId: 115 },
  { playerId: 664702, name: "Ryan McMahon",       salary: 16.7,  totalValue: 70,   years: 6, yearsLeft: 3, expiresAfter: 2027, contractType: "extension",  teamId: 115 },

  // ── Rangers (140) ──────────────────────────────────────────────────────────
  { playerId: 665487, name: "Corey Seager",       salary: 32.5,  totalValue: 325,  years: 10, yearsLeft: 8, expiresAfter: 2032, contractType: "free-agent", teamId: 140 },
  { playerId: 672515, name: "Marcus Semien",      salary: 29,    totalValue: 175,  years: 7, yearsLeft: 5, expiresAfter: 2027, contractType: "free-agent",  teamId: 140 },
  { playerId: 621107, name: "Nathan Eovaldi",     salary: 17,    totalValue: 68,   years: 4, yearsLeft: 3, expiresAfter: 2026, contractType: "free-agent",  teamId: 140 },
  { playerId: 656169, name: "Max Scherzer",       salary: 43.3,  totalValue: 130,  years: 3, yearsLeft: 1, expiresAfter: 2025, contractType: "free-agent",  teamId: 140 },

  // ── Blue Jays (141) ────────────────────────────────────────────────────────
  { playerId: 596129, name: "Vladimir Guerrero",  salary: 10.4,  totalValue: 10.4, years: 1, yearsLeft: 1, expiresAfter: 2025, contractType: "arbitration", teamId: 141 },
  { playerId: 677651, name: "Bo Bichette",        salary: 17,    totalValue: 17,   years: 1, yearsLeft: 1, expiresAfter: 2025, contractType: "arbitration", teamId: 141 },
  { playerId: 641702, name: "Kevin Gausman",      salary: 22,    totalValue: 110,  years: 5, yearsLeft: 3, expiresAfter: 2026, contractType: "free-agent",  teamId: 141 },

  // ── Padres (135) ───────────────────────────────────────────────────────────
  { playerId: 665487, name: "Fernando Tatis Jr.", salary: 25.6,  totalValue: 340,  years: 14, yearsLeft: 10, expiresAfter: 2034, contractType: "extension", teamId: 135 },
  { playerId: 669923, name: "Manny Machado",      salary: 34,    totalValue: 350,  years: 11, yearsLeft: 7, expiresAfter: 2031, contractType: "extension",  teamId: 135 },
  { playerId: 668227, name: "Dylan Cease",        salary: 10.5,  totalValue: 10.5, years: 1, yearsLeft: 1, expiresAfter: 2025, contractType: "arbitration", teamId: 135 },

  // ── Braves (144) ───────────────────────────────────────────────────────────
  { playerId: 671096, name: "Ronald Acuña Jr.",   salary: 17,    totalValue: 124,  years: 8, yearsLeft: 5, expiresAfter: 2028, contractType: "extension",  teamId: 144 },
  { playerId: 669270, name: "Matt Olson",         salary: 22.5,  totalValue: 168,  years: 8, yearsLeft: 6, expiresAfter: 2029, contractType: "extension",  teamId: 144 },
  { playerId: 596106, name: "Max Fried",          salary: 15,    totalValue: 185,  years: 8, yearsLeft: 7, expiresAfter: 2031, contractType: "free-agent",  teamId: 144 },

  // ── Giants (137) ───────────────────────────────────────────────────────────
  { playerId: 613564, name: "Matt Chapman",       salary: 23.4,  totalValue: 151.5, years: 6, yearsLeft: 5, expiresAfter: 2029, contractType: "free-agent", teamId: 137 },
  { playerId: 671561, name: "Logan Webb",         salary: 23.7,  totalValue: 90,   years: 5, yearsLeft: 4, expiresAfter: 2028, contractType: "extension",  teamId: 137 },

  // ── Tigers (116) ───────────────────────────────────────────────────────────
  { playerId: 683737, name: "Tarik Skubal",       salary: 4.5,   totalValue: 4.5,  years: 1, yearsLeft: 1, expiresAfter: 2025, contractType: "arbitration", teamId: 116 },

  // ── Mariners (136) ─────────────────────────────────────────────────────────
  { playerId: 677577, name: "Julio Rodríguez",    salary: 17,    totalValue: 210,  years: 12, yearsLeft: 11, expiresAfter: 2034, contractType: "extension", teamId: 136 },

  // ── Twins (142) ────────────────────────────────────────────────────────────
  { playerId: 650559, name: "Carlos Correa",      salary: 35.1,  totalValue: 270,  years: 6, yearsLeft: 5, expiresAfter: 2028, contractType: "free-agent",  teamId: 142 },
  { playerId: 660670, name: "Byron Buxton",       salary: 26,    totalValue: 100,  years: 7, yearsLeft: 4, expiresAfter: 2027, contractType: "extension",  teamId: 142 },

  // ── White Sox (145) ────────────────────────────────────────────────────────
  { playerId: 673357, name: "Garrett Crochet",    salary: 6.0,   totalValue: 6.0,  years: 1, yearsLeft: 1, expiresAfter: 2025, contractType: "arbitration", teamId: 145 },

  // ── Nationals (120) ────────────────────────────────────────────────────────
  { playerId: 676391, name: "MacKenzie Gore",     salary: 0.74,  totalValue: 0.74, years: 1, yearsLeft: 1, expiresAfter: 2025, contractType: "pre-arb",    teamId: 120 },
  { playerId: 663993, name: "CJ Abrams",          salary: 0.74,  totalValue: 0.74, years: 1, yearsLeft: 1, expiresAfter: 2025, contractType: "pre-arb",    teamId: 120 },

  // ── Marlins (146) ──────────────────────────────────────────────────────────
  { playerId: 668942, name: "Jazz Chisholm Jr.",  salary: 5.5,   totalValue: 5.5,  years: 1, yearsLeft: 1, expiresAfter: 2025, contractType: "arbitration", teamId: 146 },

  // ── Athletics (133) ────────────────────────────────────────────────────────
  { playerId: 671095, name: "Brent Rooker",       salary: 12.5,  totalValue: 12.5, years: 1, yearsLeft: 1, expiresAfter: 2025, contractType: "arbitration", teamId: 133 },

  // ── Pirates (134) ──────────────────────────────────────────────────────────
  { playerId: 682829, name: "Paul Skenes",        salary: 0.74,  totalValue: 0.74, years: 1, yearsLeft: 1, expiresAfter: 2025, contractType: "pre-arb",    teamId: 134 },

  // ── Reds (113) ─────────────────────────────────────────────────────────────
  { playerId: 669203, name: "Elly De La Cruz",    salary: 0.74,  totalValue: 0.74, years: 1, yearsLeft: 1, expiresAfter: 2025, contractType: "pre-arb",    teamId: 113 },

  // ── Brewers (158) ──────────────────────────────────────────────────────────
  { playerId: 642423, name: "Christian Yelich",   salary: 26,    totalValue: 215,  years: 9, yearsLeft: 4, expiresAfter: 2028, contractType: "extension",  teamId: 158 },
  { playerId: 681911, name: "Jackson Chourio",    salary: 7.5,   totalValue: 82,   years: 8, yearsLeft: 7, expiresAfter: 2031, contractType: "extension",  teamId: 158 },

  // ── Royals (118) ───────────────────────────────────────────────────────────
  { playerId: 673490, name: "Bobby Witt Jr.",     salary: 34.2,  totalValue: 288,  years: 11, yearsLeft: 11, expiresAfter: 2034, contractType: "extension", teamId: 118 },
  { playerId: 663338, name: "Salvador Perez",     salary: 10.5,  totalValue: 82,   years: 4, yearsLeft: 2, expiresAfter: 2026, contractType: "extension",  teamId: 118 },

  // ── Rays (139) ─────────────────────────────────────────────────────────────
  { playerId: 669394, name: "Wander Franco",      salary: 8.3,   totalValue: 182,  years: 12, yearsLeft: 8, expiresAfter: 2032, contractType: "extension", teamId: 139 },

  // ── Diamondbacks (109) ─────────────────────────────────────────────────────
  { playerId: 688438, name: "Corbin Carroll",     salary: 1.0,   totalValue: 111,  years: 8, yearsLeft: 7, expiresAfter: 2031, contractType: "extension",  teamId: 109 },
  { playerId: 663698, name: "Ketel Marte",        salary: 12,    totalValue: 76,   years: 5, yearsLeft: 3, expiresAfter: 2027, contractType: "extension",  teamId: 109 },

  // ── Mets (121) ─────────────────────────────────────────────────────────────
  { playerId: 663182, name: "Luis Severino",      salary: 13,    totalValue: 13,   years: 1, yearsLeft: 1, expiresAfter: 2025, contractType: "free-agent",  teamId: 121 },
];

// ─── Lookups ─────────────────────────────────────────────────────────────────

/** Get contract data by player ID */
export function getContract(playerId: number): PlayerContract | undefined {
  return CONTRACTS.find((c) => c.playerId === playerId);
}

/** Get all contracts for a team, sorted by salary desc */
export function getTeamContracts(teamId: number): PlayerContract[] {
  return CONTRACTS.filter((c) => c.teamId === teamId)
    .sort((a, b) => b.salary - a.salary);
}

/** Estimated team payroll (sum of known contracts + estimate for unlisted) */
export function estimateTeamPayroll(teamId: number, rosterSize = 26): number {
  const known = getTeamContracts(teamId);
  const knownTotal = known.reduce((s, c) => s + c.salary, 0);
  // Estimate unlisted players at league minimum
  const remaining = Math.max(0, rosterSize - known.length);
  return knownTotal + remaining * MIN;
}

/** Format salary for display */
export function fmtSalary(salaryM: number): string {
  if (salaryM >= 1) return `$${salaryM.toFixed(1)}M`;
  return `$${(salaryM * 1000).toFixed(0)}K`;
}

export const CONTRACT_STATUS_COLOR: Record<PlayerContract["contractType"], string> = {
  "extension":   "text-blue-400",
  "free-agent":  "text-green-400",
  "arbitration": "text-yellow-400",
  "pre-arb":     "text-gray-400",
  "league-min":  "text-gray-500",
};

export const LUXURY_TAX_THRESHOLD = 241.0; // 2025 CBT threshold in $M
