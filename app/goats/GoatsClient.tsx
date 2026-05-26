"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { getPlayerHeadshotUrl } from "@/data/teams";
import { TEAM_BY_ID, getTeamLogoUrl } from "@/data/teams";

interface StatLeader {
  rank: number;
  value: string;
  person: { id: number; fullName: string };
  team: { id: number; name: string };
}

interface LeaderCategory {
  id: string;
  label: string;
  apiName: string;
  group: "hitting" | "pitching";
  description: string;
}

const HITTING_CATEGORIES: LeaderCategory[] = [
  { id: "homeRuns", label: "Home Runs", apiName: "homeRuns", group: "hitting", description: "HR" },
  { id: "battingAverage", label: "Batting Average", apiName: "battingAverage", group: "hitting", description: "AVG" },
  { id: "onBasePlusSlugging", label: "OPS", apiName: "onBasePlusSlugging", group: "hitting", description: "OPS" },
  { id: "rbi", label: "RBI", apiName: "rbi", group: "hitting", description: "RBI" },
  { id: "runs", label: "Runs", apiName: "runs", group: "hitting", description: "R" },
  { id: "hits", label: "Hits", apiName: "hits", group: "hitting", description: "H" },
  { id: "stolenBases", label: "Stolen Bases", apiName: "stolenBases", group: "hitting", description: "SB" },
  { id: "doubles", label: "Doubles", apiName: "doubles", group: "hitting", description: "2B" },
  { id: "triples", label: "Triples", apiName: "triples", group: "hitting", description: "3B" },
  { id: "strikeouts_h", label: "Strikeouts", apiName: "strikeouts", group: "hitting", description: "K" },
  { id: "totalBases", label: "Total Bases", apiName: "totalBases", group: "hitting", description: "TB" },
  { id: "baseOnBalls", label: "Walks", apiName: "baseOnBalls", group: "hitting", description: "BB" },
  { id: "onBasePercentage", label: "On Base %", apiName: "onBasePercentage", group: "hitting", description: "OBP" },
  { id: "sluggingPercentage", label: "Slugging %", apiName: "sluggingPercentage", group: "hitting", description: "SLG" },
];

const PITCHING_CATEGORIES: LeaderCategory[] = [
  { id: "wins", label: "Wins", apiName: "wins", group: "pitching", description: "W" },
  { id: "strikeouts_p", label: "Strikeouts", apiName: "strikeouts", group: "pitching", description: "K" },
  { id: "era", label: "ERA", apiName: "era", group: "pitching", description: "ERA" },
  { id: "saves", label: "Saves", apiName: "saves", group: "pitching", description: "SV" },
  { id: "whip", label: "WHIP", apiName: "whip", group: "pitching", description: "WHIP" },
  { id: "shutouts", label: "Shutouts", apiName: "shutouts", group: "pitching", description: "SHO" },
  { id: "completeGames", label: "Complete Games", apiName: "completeGames", group: "pitching", description: "CG" },
  { id: "inningsPitched", label: "Innings Pitched", apiName: "inningsPitched", group: "pitching", description: "IP" },
  { id: "losses", label: "Losses", apiName: "losses", group: "pitching", description: "L" },
  { id: "holds", label: "Holds", apiName: "holds", group: "pitching", description: "HLD" },
  { id: "blownSaves", label: "Blown Saves", apiName: "blownSaves", group: "pitching", description: "BS" },
];

// ─── Hitter MVP ──────────────────────────────────────────────────────────────
interface HitterWeights {
  avg: number;
  hr: number;
  rbi: number;
  ops: number;
  sb: number;
  runs: number;
  hits: number;
}

const DEFAULT_HITTER_WEIGHTS: HitterWeights = {
  avg: 20, hr: 25, rbi: 20, ops: 25, sb: 5, runs: 3, hits: 2,
};

const HITTER_WEIGHT_MAP: Record<keyof HitterWeights, { apiKey: string; lowerBetter: boolean }> = {
  avg: { apiKey: "battingAverage", lowerBetter: false },
  hr: { apiKey: "homeRuns", lowerBetter: false },
  rbi: { apiKey: "rbi", lowerBetter: false },
  ops: { apiKey: "onBasePlusSlugging", lowerBetter: false },
  sb: { apiKey: "stolenBases", lowerBetter: false },
  runs: { apiKey: "runs", lowerBetter: false },
  hits: { apiKey: "hits", lowerBetter: false },
};

const HITTER_WEIGHT_LABELS: Record<keyof HitterWeights, string> = {
  avg: "Batting Average", hr: "Home Runs", rbi: "RBI", ops: "OPS",
  sb: "Stolen Bases", runs: "Runs", hits: "Hits",
};

// ─── Pitcher MVP ─────────────────────────────────────────────────────────────
interface PitcherWeights {
  era: number;
  whip: number;
  strikeouts: number;
  wins: number;
  saves: number;
  ip: number;
}

const DEFAULT_PITCHER_WEIGHTS: PitcherWeights = {
  era: 25, whip: 20, strikeouts: 20, wins: 15, saves: 10, ip: 10,
};

const PITCHER_WEIGHT_MAP: Record<keyof PitcherWeights, { apiKey: string; lowerBetter: boolean }> = {
  era: { apiKey: "era", lowerBetter: true },
  whip: { apiKey: "whip", lowerBetter: true },
  strikeouts: { apiKey: "strikeouts", lowerBetter: false },
  wins: { apiKey: "wins", lowerBetter: false },
  saves: { apiKey: "saves", lowerBetter: false },
  ip: { apiKey: "inningsPitched", lowerBetter: false },
};

const PITCHER_WEIGHT_LABELS: Record<keyof PitcherWeights, string> = {
  era: "ERA (lower = better)", whip: "WHIP (lower = better)", strikeouts: "Strikeouts",
  wins: "Wins", saves: "Saves", ip: "Innings Pitched",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function normalizeScore(val: number, allVals: number[], lowerBetter: boolean): number {
  const validVals = allVals.filter((v) => v > 0 && isFinite(v));
  if (!validVals.length) return 0;
  const maxVal = Math.max(...validVals);
  const minVal = Math.min(...validVals);
  if (maxVal === minVal) return 0.5;
  return lowerBetter
    ? (maxVal - val) / (maxVal - minVal)
    : (val - minVal) / (maxVal - minVal);
}

function LeaderBoard({ category, season }: { category: LeaderCategory; season: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["leaders", category.apiName, category.group, season],
    queryFn: async () => {
      const res = await fetch(
        `/api/mlb/leaders?categories=${category.apiName}&season=${season}&limit=50&group=${category.group}`
      );
      return res.json();
    },
    staleTime: 30 * 60 * 1000,
  });

  const leaders: StatLeader[] = data?.leagueLeaders?.[0]?.leaders ?? [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!leaders.length) {
    return <p className="text-gray-500 text-sm py-4">No data available for this category and season.</p>;
  }

  const top3Class = ["text-yellow-400", "text-gray-300", "text-amber-600"];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs text-gray-400 uppercase">
            <th className="text-left pb-2 w-10">#</th>
            <th className="text-left pb-2">Player</th>
            <th className="text-left pb-2">Team</th>
            <th className="text-right pb-2">{category.label}</th>
          </tr>
        </thead>
        <tbody>
          {leaders.slice(0, 50).map((leader, i) => {
            const mlbTeam = TEAM_BY_ID[leader.team?.id];
            return (
              <tr key={`${leader.person.id}-${i}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-2">
                  <span className={`font-bold ${i < 3 ? top3Class[i] : "text-gray-500"}`}>
                    {i < 3 ? ["🥇", "🥈", "🥉"][i] : leader.rank}
                  </span>
                </td>
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getPlayerHeadshotUrl(leader.person.id)}
                      alt=""
                      width={28}
                      height={28}
                      className="rounded-full object-cover border border-white/10 flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <span className="font-medium text-white">{leader.person.fullName}</span>
                  </div>
                </td>
                <td className="py-2">
                  <div className="flex items-center gap-1.5">
                    {mlbTeam && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={getTeamLogoUrl(leader.team.id)} alt="" width={16} height={16} className="object-contain" />
                    )}
                    <span className="text-gray-400 text-xs">{mlbTeam?.abbreviation ?? leader.team?.name ?? "—"}</span>
                  </div>
                </td>
                <td className="py-2 text-right">
                  <span className={`font-bold ${i === 0 ? "text-yellow-400" : i < 3 ? "text-gray-200" : "text-gray-300"}`}>
                    {leader.value}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Hitter MVP Calculator ────────────────────────────────────────────────────
function HitterMVPCalculator({ season }: { season: string; onSeasonChange: (s: string) => void }) {
  const [weights, setWeights] = useState<HitterWeights>(DEFAULT_HITTER_WEIGHTS);
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const { data, isLoading } = useQuery({
    queryKey: ["mvp-hitter", season],
    queryFn: async () => {
      const cats = "homeRuns,battingAverage,onBasePlusSlugging,rbi,runs,hits,stolenBases";
      const res = await fetch(`/api/mlb/leaders?categories=${cats}&season=${season}&limit=150&group=hitting`);
      return res.json();
    },
    staleTime: 30 * 60 * 1000,
  });

  interface LeaderData { leaderCategory: string; leaders: StatLeader[] }
  const leaderData: LeaderData[] = data?.leagueLeaders ?? [];

  const playerMap: Record<number, { name: string; teamId: number; scores: Partial<Record<string, number>>; rawVals: Partial<Record<string, number>> }> = {};

  for (const cat of leaderData) {
    const leaders = cat.leaders ?? [];
    const allVals = leaders.map((l) => parseFloat(l.value) || 0);
    const { apiKey, lowerBetter } = Object.values(HITTER_WEIGHT_MAP).find(m => m.apiKey === cat.leaderCategory) ??
      { apiKey: cat.leaderCategory, lowerBetter: false };

    for (const leader of leaders) {
      const val = parseFloat(leader.value) || 0;
      if (!playerMap[leader.person.id]) {
        playerMap[leader.person.id] = { name: leader.person.fullName, teamId: leader.team?.id, scores: {}, rawVals: {} };
      }
      playerMap[leader.person.id].scores[cat.leaderCategory] = normalizeScore(val, allVals, lowerBetter);
      playerMap[leader.person.id].rawVals[cat.leaderCategory] = val;
      void apiKey;
    }
  }

  const composites = Object.entries(playerMap).map(([id, player]) => {
    let score = 0;
    for (const [key, { apiKey }] of Object.entries(HITTER_WEIGHT_MAP)) {
      const w = weights[key as keyof HitterWeights] / (totalWeight || 100);
      score += (player.scores[apiKey] ?? 0) * w;
    }
    return { id: Number(id), name: player.name, teamId: player.teamId, score };
  }).sort((a, b) => b.score - a.score).slice(0, 25);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-card border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Hitter Stat Weights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(Object.keys(weights) as (keyof HitterWeights)[]).map((key) => (
            <div key={key} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">{HITTER_WEIGHT_LABELS[key]}</span>
                <span className="text-red-400 font-bold w-8 text-right">{weights[key]}%</span>
              </div>
              <Slider
                min={0} max={50} step={1}
                value={[weights[key]]}
                onValueChange={(v) => setWeights({ ...weights, [key]: Array.isArray(v) ? v[0] : v as number })}
              />
            </div>
          ))}
          <div className="flex justify-between text-xs pt-2 border-t border-white/10">
            <span className={totalWeight === 100 ? "text-gray-500" : totalWeight > 100 ? "text-yellow-400" : "text-gray-500"}>
              Total: {totalWeight}% {totalWeight !== 100 && "(auto-normalized)"}
            </span>
            <button className="text-red-400 hover:text-red-300" onClick={() => setWeights(DEFAULT_HITTER_WEIGHTS)}>Reset</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Old School", w: { avg: 35, hr: 15, rbi: 30, ops: 10, sb: 5, runs: 3, hits: 2 } },
              { label: "Sabermetric", w: { avg: 5, hr: 15, rbi: 5, ops: 50, sb: 10, runs: 10, hits: 5 } },
              { label: "Fantasy", w: { avg: 10, hr: 30, rbi: 25, ops: 15, sb: 10, runs: 7, hits: 3 } },
              { label: "5-Tool", w: { avg: 20, hr: 20, rbi: 15, ops: 20, sb: 20, runs: 3, hits: 2 } },
            ].map((p) => (
              <button key={p.label} onClick={() => setWeights(p.w as HitterWeights)}
                className="text-xs px-2 py-1 rounded border border-white/10 text-gray-400 hover:bg-white/5">
                {p.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">🏆 Hitter Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />)}</div>
          ) : (
            <div className="space-y-1.5">
              {composites.slice(0, 15).map((player, i) => {
                const mlbTeam = TEAM_BY_ID[player.teamId];
                return (
                  <div key={player.id} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                    <span className={`font-bold text-sm w-6 text-center ${i < 3 ? ["text-yellow-400", "text-gray-300", "text-amber-600"][i] : "text-gray-500"}`}>
                      {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getPlayerHeadshotUrl(player.id)} alt="" width={24} height={24}
                      className="rounded-full object-cover border border-white/10"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <span className="flex-1 text-sm font-medium text-white">{player.name}</span>
                    {mlbTeam && <img src={getTeamLogoUrl(player.teamId)} alt="" width={16} height={16} className="object-contain" />}
                    <span className="text-xs text-red-400 font-bold w-12 text-right">{(player.score * 100).toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Pitcher MVP Calculator ───────────────────────────────────────────────────
function PitcherMVPCalculator({ season }: { season: string }) {
  const [weights, setWeights] = useState<PitcherWeights>(DEFAULT_PITCHER_WEIGHTS);
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const { data, isLoading } = useQuery({
    queryKey: ["mvp-pitcher", season],
    queryFn: async () => {
      const cats = "era,whip,strikeouts,wins,saves,inningsPitched";
      const res = await fetch(`/api/mlb/leaders?categories=${cats}&season=${season}&limit=150&group=pitching`);
      return res.json();
    },
    staleTime: 30 * 60 * 1000,
  });

  interface LeaderData { leaderCategory: string; leaders: StatLeader[] }
  const leaderData: LeaderData[] = data?.leagueLeaders ?? [];

  const playerMap: Record<number, { name: string; teamId: number; scores: Partial<Record<string, number>> }> = {};

  for (const cat of leaderData) {
    const leaders = cat.leaders ?? [];
    const allVals = leaders.map((l) => parseFloat(l.value) || 0);
    const matchedKey = (Object.keys(PITCHER_WEIGHT_MAP) as (keyof PitcherWeights)[])
      .find(k => PITCHER_WEIGHT_MAP[k].apiKey === cat.leaderCategory);
    const lowerBetter = matchedKey ? PITCHER_WEIGHT_MAP[matchedKey].lowerBetter : false;

    for (const leader of leaders) {
      const val = parseFloat(leader.value) || 0;
      if (!playerMap[leader.person.id]) {
        playerMap[leader.person.id] = { name: leader.person.fullName, teamId: leader.team?.id, scores: {} };
      }
      playerMap[leader.person.id].scores[cat.leaderCategory] = normalizeScore(val, allVals, lowerBetter);
    }
  }

  const composites = Object.entries(playerMap).map(([id, player]) => {
    let score = 0;
    for (const [key, { apiKey }] of Object.entries(PITCHER_WEIGHT_MAP)) {
      const w = weights[key as keyof PitcherWeights] / (totalWeight || 100);
      score += (player.scores[apiKey] ?? 0) * w;
    }
    return { id: Number(id), name: player.name, teamId: player.teamId, score };
  }).sort((a, b) => b.score - a.score).slice(0, 25);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-card border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pitcher Stat Weights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(Object.keys(weights) as (keyof PitcherWeights)[]).map((key) => (
            <div key={key} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">{PITCHER_WEIGHT_LABELS[key]}</span>
                <span className="text-blue-400 font-bold w-8 text-right">{weights[key]}%</span>
              </div>
              <Slider
                min={0} max={50} step={1}
                value={[weights[key]]}
                onValueChange={(v) => setWeights({ ...weights, [key]: Array.isArray(v) ? v[0] : v as number })}
              />
            </div>
          ))}
          <div className="flex justify-between text-xs pt-2 border-t border-white/10">
            <span className={totalWeight !== 100 ? "text-yellow-400" : "text-gray-500"}>
              Total: {totalWeight}% {totalWeight !== 100 && "(auto-normalized)"}
            </span>
            <button className="text-blue-400 hover:text-blue-300" onClick={() => setWeights(DEFAULT_PITCHER_WEIGHTS)}>Reset</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Ace", w: { era: 30, whip: 25, strikeouts: 25, wins: 10, saves: 0, ip: 10 } },
              { label: "Closer", w: { era: 20, whip: 20, strikeouts: 15, wins: 0, saves: 40, ip: 5 } },
              { label: "Old School", w: { era: 20, whip: 10, strikeouts: 10, wins: 40, saves: 15, ip: 5 } },
              { label: "Workhorse", w: { era: 20, whip: 20, strikeouts: 20, wins: 15, saves: 0, ip: 25 } },
            ].map((p) => (
              <button key={p.label} onClick={() => setWeights(p.w as PitcherWeights)}
                className="text-xs px-2 py-1 rounded border border-white/10 text-gray-400 hover:bg-white/5">
                {p.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">🏆 Pitcher Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />)}</div>
          ) : (
            <div className="space-y-1.5">
              {composites.slice(0, 15).map((player, i) => {
                const mlbTeam = TEAM_BY_ID[player.teamId];
                return (
                  <div key={player.id} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                    <span className={`font-bold text-sm w-6 text-center ${i < 3 ? ["text-yellow-400", "text-gray-300", "text-amber-600"][i] : "text-gray-500"}`}>
                      {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getPlayerHeadshotUrl(player.id)} alt="" width={24} height={24}
                      className="rounded-full object-cover border border-white/10"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <span className="flex-1 text-sm font-medium text-white">{player.name}</span>
                    {mlbTeam && <img src={getTeamLogoUrl(player.teamId)} alt="" width={16} height={16} className="object-contain" />}
                    <span className="text-xs text-blue-400 font-bold w-12 text-right">{(player.score * 100).toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GoatsClient() {
  const currentYear = new Date().getFullYear();
  const [season, setSeason] = useState(currentYear.toString());
  const [activeHittingCat, setActiveHittingCat] = useState<LeaderCategory>(HITTING_CATEGORIES[0]);
  const [activePitchingCat, setActivePitchingCat] = useState<LeaderCategory>(PITCHING_CATEGORIES[0]);

  // Years from current down to 1969 (expansion era) + career all-time
  const yearOptions = [
    { value: "career", label: "All Time (Career)" },
    ...Array.from({ length: currentYear - 1968 }, (_, i) => {
      const y = (currentYear - i).toString();
      return { value: y, label: `${y} Season` };
    }),
  ];

  const seasonLabel = season === "career" ? "All Time" : `${season} Season`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">🐐 GOATs</h1>
          <p className="text-gray-400 text-sm mt-1">Historical stat leaders · Weighted MVP calculator</p>
        </div>
        <Select value={season} onValueChange={(v) => { if (v !== null) setSeason(v); }}>
          <SelectTrigger className="w-44 bg-white/5 border-white/10">
            <SelectValue placeholder="Season" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a2a1a] border-white/10 max-h-72 overflow-y-auto">
            {yearOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-white text-sm">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="hitting">
        <TabsList className="bg-white/5 border border-white/10 mb-6">
          <TabsTrigger value="hitting" className="data-[state=active]:bg-red-600/30 data-[state=active]:text-red-300">
            Hitting Leaders
          </TabsTrigger>
          <TabsTrigger value="pitching" className="data-[state=active]:bg-red-600/30 data-[state=active]:text-red-300">
            Pitching Leaders
          </TabsTrigger>
          <TabsTrigger value="mvp-h" className="data-[state=active]:bg-red-600/30 data-[state=active]:text-red-300">
            🥊 Hitter GOAT
          </TabsTrigger>
          <TabsTrigger value="mvp-p" className="data-[state=active]:bg-blue-600/30 data-[state=active]:text-blue-300">
            ⚾ Pitcher GOAT
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hitting">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card className="bg-card border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-400 uppercase tracking-wider">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 p-3 pt-0">
                  {HITTING_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveHittingCat(cat)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
                        activeHittingCat.id === cat.id
                          ? "bg-red-600/20 text-red-300"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-3">
              <Card className="bg-card border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{activeHittingCat.label} Leaders</span>
                    <Badge className="text-xs border-white/10 text-gray-400">{seasonLabel}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LeaderBoard category={activeHittingCat} season={season} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pitching">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card className="bg-card border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-400 uppercase tracking-wider">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 p-3 pt-0">
                  {PITCHING_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActivePitchingCat(cat)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
                        activePitchingCat.id === cat.id
                          ? "bg-red-600/20 text-red-300"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-3">
              <Card className="bg-card border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{activePitchingCat.label} Leaders</span>
                    <Badge className="text-xs border-white/10 text-gray-400">{seasonLabel}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LeaderBoard category={activePitchingCat} season={season} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mvp-h">
          <HitterMVPCalculator season={season} onSeasonChange={setSeason} />
        </TabsContent>

        <TabsContent value="mvp-p">
          <PitcherMVPCalculator season={season} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
