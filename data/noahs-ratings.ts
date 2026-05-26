// Noah's personal ballpark ratings imported from his spreadsheet
// Auto-seeded into localStorage on first load

import { BallparkCriteria } from "./ballparks";

export type NoahRating = BallparkCriteria & {
  visited: boolean;
  visitNote?: string;
};

/**
 * Noah's personal scores for current active MLB parks.
 * Keys match the park IDs in BALLPARKS array.
 * Scored on 1–10 per criterion.
 * Total = loc×0.15 + fd×0.15 + ps×0.15 + atmo×0.15 + hist×0.10 + food×0.05 + overall×0.25 + tdf×0.1
 */
export const NOAHS_MLB_RATINGS: Record<string, NoahRating> = {
  // ─── ELITE ──────────────────────────────────────────────────────────────────
  chc: {
    location: 9, fieldDynamics: 9.5, parkStructure: 9, atmosphere: 10,
    historicIntegration: 10, foodMerch: 7, overallExperience: 9.5, tdfBonus: 2,
    visited: true, visitNote: "Multiple visits",
  },
  // total: 9.55
  bos: {
    location: 8, fieldDynamics: 9.5, parkStructure: 9, atmosphere: 9.5,
    historicIntegration: 9, foodMerch: 7, overallExperience: 9, tdfBonus: 2,
    visited: true,
  },
  // total: 9.1
  sf: {
    location: 9.5, fieldDynamics: 9, parkStructure: 9, atmosphere: 8.5,
    historicIntegration: 7, foodMerch: 8.5, overallExperience: 9.5, tdfBonus: 2,
    visited: true,
  },
  // total: 9.1
  nyy: {
    location: 8, fieldDynamics: 8, parkStructure: 9.5, atmosphere: 8.5,
    historicIntegration: 7, foodMerch: 8, overallExperience: 9.5, tdfBonus: 0.5,
    visited: true, visitNote: "Many visits",
  },
  // total: 8.625

  // ─── UPPER TIER ─────────────────────────────────────────────────────────────
  bal: {
    location: 6, fieldDynamics: 8.5, parkStructure: 9, atmosphere: 8.5,
    historicIntegration: 9.5, foodMerch: 7.5, overallExperience: 8.5, tdfBonus: 1.5,
    visited: true, visitNote: "May 2017 · 2 games",
  },
  // total: 8.4
  stl: {
    location: 8, fieldDynamics: 8, parkStructure: 8, atmosphere: 9,
    historicIntegration: 7.5, foodMerch: 7.5, overallExperience: 8, tdfBonus: 1,
    visited: true,
  },
  // total: 8.175
  phi: {
    location: 7.5, fieldDynamics: 8, parkStructure: 8, atmosphere: 9,
    historicIntegration: 6.5, foodMerch: 8.5, overallExperience: 8.5, tdfBonus: 0.75,
    visited: true, visitNote: "May 2017",
  },
  // total: 8.15
  hou: {
    location: 7, fieldDynamics: 8, parkStructure: 7.5, atmosphere: 7.5,
    historicIntegration: 6.5, foodMerch: 6.5, overallExperience: 7, tdfBonus: 0.5,
    visited: true, visitNote: "Oct 2018 · 3 games",
  },
  // total: 7.275 → 7.28
  cle: {
    location: 7, fieldDynamics: 7.5, parkStructure: 7.5, atmosphere: 7,
    historicIntegration: 7, foodMerch: 7, overallExperience: 7.5, tdfBonus: 0.5,
    visited: true,
  },
  // total: 7.325

  // ─── AVERAGE ─────────────────────────────────────────────────────────────────
  col: {
    location: 9, fieldDynamics: 5, parkStructure: 6, atmosphere: 7,
    historicIntegration: 6, foodMerch: 6, overallExperience: 5, tdfBonus: 0,
    visited: true, visitNote: "July 2016 & many · 6 games",
  },
  // total: 6.20
  nym: {
    location: 7.5, fieldDynamics: 7, parkStructure: 8, atmosphere: 7,
    historicIntegration: 6.5, foodMerch: 7.5, overallExperience: 7.5, tdfBonus: 0.75,
    visited: true,
  },
  // total: 7.4

  // ─── LOWER TIER ─────────────────────────────────────────────────────────────
  tor: {
    location: 7.5, fieldDynamics: 4, parkStructure: 5, atmosphere: 6,
    historicIntegration: 5, foodMerch: 6, overallExperience: 5.5, tdfBonus: 1,
    visited: true, visitNote: "August 2014 · 1 game",
  },
  // total: 5.65
  wsh: {
    location: 7, fieldDynamics: 6.5, parkStructure: 6, atmosphere: 5,
    historicIntegration: 5.5, foodMerch: 6, overallExperience: 5.5, tdfBonus: 0.5,
    visited: true, visitNote: "August 2014 · 2 games",
  },
  // total: 5.95
  ari: {
    location: 5.5, fieldDynamics: 6, parkStructure: 7, atmosphere: 5,
    historicIntegration: 4, foodMerch: 7, overallExperience: 5, tdfBonus: 1.5,
    visited: true, visitNote: "April 2017 · 1 game",
  },
  // total: 5.675
  tex: {
    location: 6, fieldDynamics: 5.5, parkStructure: 8, atmosphere: 6,
    historicIntegration: 3, foodMerch: 7.5, overallExperience: 5.5, tdfBonus: 0,
    visited: true, visitNote: "June 2023 · 1 game",
  },
  // total: 5.875
  mia: {
    location: 6.5, fieldDynamics: 6.5, parkStructure: 7.5, atmosphere: 4,
    historicIntegration: 3, foodMerch: 7, overallExperience: 4.5, tdfBonus: 1.5,
    visited: true,
  },
  // total: 5.6

  // ─── 50 FEET OF CRAP ─────────────────────────────────────────────────────────
  tb: {
    location: 4.5, fieldDynamics: 4, parkStructure: 3.5, atmosphere: 5,
    historicIntegration: 3.5, foodMerch: 5.5, overallExperience: 4, tdfBonus: 1,
    visited: true, visitNote: "May 2017",
  },
  // total: ~4.3
};

// ─── Historical / Non-MLB Parks Noah Has Visited ────────────────────────────

export interface HistoricalPark {
  id: string;
  name: string;
  teamName: string;
  city: string;
  state: string;
  opened: number;
  closed: number;
  category: "historical" | "spring-training" | "minors";
  imageUrl: string;
  funFact: string;
  noahRating: NoahRating;
}

export const NOAHS_HISTORICAL_PARKS: HistoricalPark[] = [
  // ─── Former MLB parks ──────────────────────────────────────────────────────
  {
    id: "old-yankee",
    name: "Old Yankee Stadium",
    teamName: "New York Yankees",
    city: "Bronx",
    state: "NY",
    opened: 1923,
    closed: 2008,
    category: "historical",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Yankee_Stadium%2C_1921.jpg/1200px-Yankee_Stadium%2C_1921.jpg",
    funFact: "The House That Ruth Built (1923–2008). Three tiers, the famous copper frieze, and an aura that new Yankee Stadium could never fully replicate.",
    noahRating: {
      location: 10, fieldDynamics: 9.5, parkStructure: 9, atmosphere: 10,
      historicIntegration: 10, foodMerch: 9, overallExperience: 10, tdfBonus: 2.5,
      visited: true, visitNote: "Rank #1 All-Time",
    },
    // total: 9.975
  },
  {
    id: "old-arlington",
    name: "Ballpark in Arlington",
    teamName: "Texas Rangers",
    city: "Arlington",
    state: "TX",
    opened: 1994,
    closed: 2019,
    category: "historical",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Rangers_Ballpark_in_Arlington_%2820101001%29.jpg/1200px-Rangers_Ballpark_in_Arlington_%2820101001%29.jpg",
    funFact: "Classic retro design with Texas flair — limestone exterior, four-story office building beyond left field, and a baseball 'office building' backdrop in right. Home for 26 seasons.",
    noahRating: {
      location: 6, fieldDynamics: 7.5, parkStructure: 7.5, atmosphere: 7.5,
      historicIntegration: 6.5, foodMerch: 7, overallExperience: 7.5, tdfBonus: 0.5,
      visited: true, visitNote: "Jan 2000 · ~30 games",
    },
    // total: 7.2
  },
  {
    id: "turner-field",
    name: "Turner Field",
    teamName: "Atlanta Braves",
    city: "Atlanta",
    state: "GA",
    opened: 1997,
    closed: 2016,
    category: "historical",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Turner_Field_July_2013.jpg/1200px-Turner_Field_July_2013.jpg",
    funFact: "Originally built as the 1996 Olympic Stadium, converted to a ballpark after the Games. Hosted the Braves for 20 seasons before the move to Truist Park.",
    noahRating: {
      location: 6, fieldDynamics: 6.5, parkStructure: 6, atmosphere: 6,
      historicIntegration: 5.5, foodMerch: 6, overallExperience: 6, tdfBonus: 0,
      visited: true,
    },
    // total: 6.0
  },
  {
    id: "coliseum",
    name: "Oakland–Alameda County Coliseum",
    teamName: "Oakland Athletics",
    city: "Oakland",
    state: "CA",
    opened: 1966,
    closed: 2024,
    category: "historical",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Oakland_Coliseum_field_level_2013.jpg/1200px-Oakland_Coliseum_field_level_2013.jpg",
    funFact: "The last multi-sport coliseum in MLB. Mount Davis — the black tarp-covered upper deck — was the A's most infamous feature. Sewer floods, tarps everywhere, and 10,000-fan crowds. A vibe only a true baseball fan could love.",
    noahRating: {
      location: 5, fieldDynamics: 5, parkStructure: 3, atmosphere: 5,
      historicIntegration: 6, foodMerch: 4.5, overallExperience: 3.5, tdfBonus: 0.5,
      visited: true, visitNote: "May 2017",
    },
    // total: ~4.4
  },

  // ─── Spring Training ────────────────────────────────────────────────────────
  {
    id: "steinbrenner-field",
    name: "George M. Steinbrenner Field",
    teamName: "New York Yankees (Spring Training)",
    city: "Tampa",
    state: "FL",
    opened: 1996,
    closed: 9999,
    category: "spring-training",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/George_M_Steinbrenner_Field.jpg/1200px-George_M_Steinbrenner_Field.jpg",
    funFact: "The Yankees' spring training home since 1996, a scaled-down version of old Yankee Stadium. The team also used it as an alternate site during the 2020 COVID bubble.",
    noahRating: {
      location: 7, fieldDynamics: 6, parkStructure: 7, atmosphere: 6,
      historicIntegration: 5, foodMerch: 6, overallExperience: 6.5, tdfBonus: 0.5,
      visited: true, visitNote: "March 2024 · 1 game",
    },
  },
  {
    id: "baycare-ballpark",
    name: "BayCare Ballpark",
    teamName: "Philadelphia Phillies (Spring Training)",
    city: "Clearwater",
    state: "FL",
    opened: 2004,
    closed: 9999,
    category: "spring-training",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/BayCare_Ballpark%2C_Clearwater%2C_FL_%2821991700936%29.jpg/1200px-BayCare_Ballpark%2C_Clearwater%2C_FL_%2821991700936%29.jpg",
    funFact: "Spring home of the Phillies since 2004. Clearwater's laid-back Gulf Coast vibe makes it a beloved stop on the Grapefruit League circuit.",
    noahRating: {
      location: 6, fieldDynamics: 6, parkStructure: 6, atmosphere: 5,
      historicIntegration: 4, foodMerch: 5.5, overallExperience: 5.5, tdfBonus: 0,
      visited: true,
    },
  },

  // ─── Minor League ───────────────────────────────────────────────────────────
  {
    id: "autozone-park",
    name: "AutoZone Park",
    teamName: "Memphis Redbirds (STL AA/AAA)",
    city: "Memphis",
    state: "TN",
    opened: 2000,
    closed: 9999,
    category: "minors",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/AutoZone_Park.jpg/1200px-AutoZone_Park.jpg",
    funFact: "Considered one of the best minor league ballparks in America. The Pyramid building visible beyond the outfield and blues-city atmosphere give it a unique personality.",
    noahRating: {
      location: 7, fieldDynamics: 7, parkStructure: 7.5, atmosphere: 7,
      historicIntegration: 5, foodMerch: 6.5, overallExperience: 7, tdfBonus: 0,
      visited: true, visitNote: "July 2022",
    },
  },
  {
    id: "riders-field",
    name: "Riders Field (Frisco RoughRiders)",
    teamName: "Texas Rangers AA",
    city: "Frisco",
    state: "TX",
    opened: 2003,
    closed: 9999,
    category: "minors",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Dr_Pepper_Ballpark_in_Frisco_Texas.jpg/1200px-Dr_Pepper_Ballpark_in_Frisco_Texas.jpg",
    funFact: "Home of the Frisco RoughRiders, Texas Rangers Double-A affiliate. One of the premier Double-A ballparks with a Western saloon aesthetic and great sightlines.",
    noahRating: {
      location: 6.5, fieldDynamics: 6.5, parkStructure: 7.5, atmosphere: 7,
      historicIntegration: 4, foodMerch: 6.5, overallExperience: 7, tdfBonus: 0,
      visited: true, visitNote: "Multiple visits",
    },
  },
  {
    id: "smokies-stadium",
    name: "Smokies Stadium",
    teamName: "Tennessee Smokies (CHC AA)",
    city: "Kodak",
    state: "TN",
    opened: 2000,
    closed: 9999,
    category: "minors",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Tennessee_Smokies_Smokies_Stadium.jpg/1200px-Tennessee_Smokies_Smokies_Stadium.jpg",
    funFact: "Nestled in the foothills of the Great Smoky Mountains. One of the most scenic backdrops in minor league baseball — mountain views beyond the outfield on clear days.",
    noahRating: {
      location: 5, fieldDynamics: 5.5, parkStructure: 6, atmosphere: 6,
      historicIntegration: 4, foodMerch: 5, overallExperience: 5.5, tdfBonus: 0,
      visited: true, visitNote: "Multiple visits",
    },
  },
];
