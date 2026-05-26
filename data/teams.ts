export interface MLBTeam {
  id: number;
  name: string;
  abbreviation: string;
  location: string;
  teamName: string;
  division: string;
  league: "AL" | "NL";
  primaryColor: string;
  secondaryColor: string;
}

export const MLB_TEAMS: MLBTeam[] = [
  { id: 108, name: "Los Angeles Angels", abbreviation: "LAA", location: "Los Angeles", teamName: "Angels", division: "AL West", league: "AL", primaryColor: "#BA0021", secondaryColor: "#003263" },
  { id: 109, name: "Arizona Diamondbacks", abbreviation: "ARI", location: "Arizona", teamName: "Diamondbacks", division: "NL West", league: "NL", primaryColor: "#A71930", secondaryColor: "#E3D4AD" },
  { id: 110, name: "Baltimore Orioles", abbreviation: "BAL", location: "Baltimore", teamName: "Orioles", division: "AL East", league: "AL", primaryColor: "#DF4601", secondaryColor: "#000000" },
  { id: 111, name: "Boston Red Sox", abbreviation: "BOS", location: "Boston", teamName: "Red Sox", division: "AL East", league: "AL", primaryColor: "#BD3039", secondaryColor: "#0D2B56" },
  { id: 112, name: "Chicago Cubs", abbreviation: "CHC", location: "Chicago", teamName: "Cubs", division: "NL Central", league: "NL", primaryColor: "#0E3386", secondaryColor: "#CC3433" },
  { id: 113, name: "Cincinnati Reds", abbreviation: "CIN", location: "Cincinnati", teamName: "Reds", division: "NL Central", league: "NL", primaryColor: "#C6011F", secondaryColor: "#000000" },
  { id: 114, name: "Cleveland Guardians", abbreviation: "CLE", location: "Cleveland", teamName: "Guardians", division: "AL Central", league: "AL", primaryColor: "#00385D", secondaryColor: "#E31937" },
  { id: 115, name: "Colorado Rockies", abbreviation: "COL", location: "Colorado", teamName: "Rockies", division: "NL West", league: "NL", primaryColor: "#33006F", secondaryColor: "#C4CED4" },
  { id: 116, name: "Detroit Tigers", abbreviation: "DET", location: "Detroit", teamName: "Tigers", division: "AL Central", league: "AL", primaryColor: "#0C2C56", secondaryColor: "#FA4616" },
  { id: 117, name: "Houston Astros", abbreviation: "HOU", location: "Houston", teamName: "Astros", division: "AL West", league: "AL", primaryColor: "#002D62", secondaryColor: "#EB6E1F" },
  { id: 118, name: "Kansas City Royals", abbreviation: "KC", location: "Kansas City", teamName: "Royals", division: "AL Central", league: "AL", primaryColor: "#004687", secondaryColor: "#C09A5B" },
  { id: 119, name: "Los Angeles Dodgers", abbreviation: "LAD", location: "Los Angeles", teamName: "Dodgers", division: "NL West", league: "NL", primaryColor: "#005A9C", secondaryColor: "#EF3E42" },
  { id: 120, name: "Washington Nationals", abbreviation: "WSH", location: "Washington", teamName: "Nationals", division: "NL East", league: "NL", primaryColor: "#AB0003", secondaryColor: "#14225A" },
  { id: 121, name: "New York Mets", abbreviation: "NYM", location: "New York", teamName: "Mets", division: "NL East", league: "NL", primaryColor: "#002D72", secondaryColor: "#FF5910" },
  { id: 133, name: "Athletics", abbreviation: "ATH", location: "Sacramento", teamName: "Athletics", division: "AL West", league: "AL", primaryColor: "#003831", secondaryColor: "#EFB21E" },
  { id: 134, name: "Pittsburgh Pirates", abbreviation: "PIT", location: "Pittsburgh", teamName: "Pirates", division: "NL Central", league: "NL", primaryColor: "#27251F", secondaryColor: "#FDB827" },
  { id: 135, name: "San Diego Padres", abbreviation: "SD", location: "San Diego", teamName: "Padres", division: "NL West", league: "NL", primaryColor: "#2F241D", secondaryColor: "#FFC425" },
  { id: 136, name: "Seattle Mariners", abbreviation: "SEA", location: "Seattle", teamName: "Mariners", division: "AL West", league: "AL", primaryColor: "#0C2C56", secondaryColor: "#005C5C" },
  { id: 137, name: "San Francisco Giants", abbreviation: "SF", location: "San Francisco", teamName: "Giants", division: "NL West", league: "NL", primaryColor: "#FD5A1E", secondaryColor: "#27251F" },
  { id: 138, name: "St. Louis Cardinals", abbreviation: "STL", location: "St. Louis", teamName: "Cardinals", division: "NL Central", league: "NL", primaryColor: "#C41E3A", secondaryColor: "#0C2340" },
  { id: 139, name: "Tampa Bay Rays", abbreviation: "TB", location: "Tampa Bay", teamName: "Rays", division: "AL East", league: "AL", primaryColor: "#092C5C", secondaryColor: "#8FBCE6" },
  { id: 140, name: "Texas Rangers", abbreviation: "TEX", location: "Texas", teamName: "Rangers", division: "AL West", league: "AL", primaryColor: "#003278", secondaryColor: "#C0111F" },
  { id: 141, name: "Toronto Blue Jays", abbreviation: "TOR", location: "Toronto", teamName: "Blue Jays", division: "AL East", league: "AL", primaryColor: "#134A8E", secondaryColor: "#1D2D5C" },
  { id: 142, name: "Minnesota Twins", abbreviation: "MIN", location: "Minnesota", teamName: "Twins", division: "AL Central", league: "AL", primaryColor: "#002B5C", secondaryColor: "#D31145" },
  { id: 143, name: "Philadelphia Phillies", abbreviation: "PHI", location: "Philadelphia", teamName: "Phillies", division: "NL East", league: "NL", primaryColor: "#E81828", secondaryColor: "#002D72" },
  { id: 144, name: "Atlanta Braves", abbreviation: "ATL", location: "Atlanta", teamName: "Braves", division: "NL East", league: "NL", primaryColor: "#CE1141", secondaryColor: "#13274F" },
  { id: 145, name: "Chicago White Sox", abbreviation: "CWS", location: "Chicago", teamName: "White Sox", division: "AL Central", league: "AL", primaryColor: "#27251F", secondaryColor: "#C4CED4" },
  { id: 146, name: "Miami Marlins", abbreviation: "MIA", location: "Miami", teamName: "Marlins", division: "NL East", league: "NL", primaryColor: "#00A3E0", secondaryColor: "#EF3340" },
  { id: 147, name: "New York Yankees", abbreviation: "NYY", location: "New York", teamName: "Yankees", division: "AL East", league: "AL", primaryColor: "#003087", secondaryColor: "#C4CED4" },
  { id: 158, name: "Milwaukee Brewers", abbreviation: "MIL", location: "Milwaukee", teamName: "Brewers", division: "NL Central", league: "NL", primaryColor: "#12284B", secondaryColor: "#FFC52F" },
];

export const TEAM_BY_ID = Object.fromEntries(MLB_TEAMS.map((t) => [t.id, t]));

export function getTeamLogoUrl(teamId: number): string {
  return `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
}

export function getPlayerHeadshotUrl(personId: number): string {
  return `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${personId}/headshot/67/current`;
}
