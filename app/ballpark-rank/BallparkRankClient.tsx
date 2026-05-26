"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Ballpark,
  BallparkCriteria,
  CRITERIA_WEIGHTS,
  calculateTotalScore,
  getTier,
} from "@/data/ballparks";
import { getTeamLogoUrl } from "@/data/teams";

const STORAGE_KEY = "war-room-ballpark-ratings";

function loadRatings(): Record<string, BallparkCriteria & { visited: boolean }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveRatings(ratings: Record<string, BallparkCriteria & { visited: boolean }>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings)); } catch {}
}

// ─── Criterion metadata ───────────────────────────────────────────────────────
const CRITERIA_META: Record<keyof BallparkCriteria, { label: string; weight: string; description: string; icon: string }> = {
  location: {
    label: "Location & Surroundings",
    weight: "15%",
    icon: "📍",
    description: "Proximity to downtown & city views from within the park. Are there nearby restaurants, bars, walkable areas? Neighborhood safety. Ease of walking around the full exterior. Transit access. Parking convenience. Does the location add to or detract from the experience?",
  },
  fieldDynamics: {
    label: "Field Dynamics",
    weight: "15%",
    icon: "⚾",
    description: "Unique park dimensions that create strategy (short porches, deep corners, high walls). Quirky foul territory. Park factor for offense vs defense. Playing surface quality. Sight lines from all seat sections. How does the field shape influence how the game is played here?",
  },
  parkStructure: {
    label: "Park Structure & Design",
    weight: "15%",
    icon: "🏟️",
    description: "Overall architectural quality and aesthetic. Age and condition of the facility. Seat quality and legroom. Concourse width and walkability. Accessibility. Cleanliness and maintenance. Visual appeal from the inside — does it feel like a special place to be?",
  },
  atmosphere: {
    label: "Atmosphere & Fan Culture",
    weight: "15%",
    icon: "🔥",
    description: "Crowd energy and noise level. Fan intensity and knowledge. The pre/post game scene. Sellout frequency. Team tradition that fans carry into the park. Is it intimidating for opposing teams? Does the crowd elevate big moments?",
  },
  historicIntegration: {
    label: "Historic Integration",
    weight: "10%",
    icon: "📜",
    description: "Age of the ballpark and how history is preserved. Significant moments that occurred here (World Series, no-hitters, records). Monuments, statues, tributes to legends on-site. Local heritage and lore built into the fabric of the building.",
  },
  foodMerch: {
    label: "Food & Merch",
    weight: "5%",
    icon: "🌭",
    description: "Quality of food options beyond standard ballpark fare. Local and regional specialties unique to this market. Craft beer selection. Merchandise variety, exclusivity, and quality. Overall value for money on concessions.",
  },
  overallExperience: {
    label: "Overall Experience",
    weight: "25%",
    icon: "⭐",
    description: "The holistic gut-feeling of visiting this ballpark. Would you make a special trip just to see it? Is it a bucket-list destination? Does it leave you wanting to come back? This single score captures what no individual metric can — the magic (or lack thereof) of being there.",
  },
  tdfBonus: {
    label: "To Die For Bonus",
    weight: "Special ×0.1",
    icon: "🎯",
    description: "That ONE legendary feature that makes this park truly unforgettable — Fenway's Green Monster, PNC's skyline, Oracle's McCovey Cove, Yankee Stadium's Monument Park, Wrigley's ivy walls. Rate 0-10 on how iconic and irreplaceable this signature element is.",
  },
};

// ─── Tooltip wrapper ──────────────────────────────────────────────────────────
function CriterionLabel({ criterionKey }: { criterionKey: keyof BallparkCriteria }) {
  const meta = CRITERIA_META[criterionKey];
  return (
    <span className="flex items-center gap-1 group/tip relative">
      <span>{meta.icon} {meta.label}</span>
      <span className="text-xs text-gray-500 cursor-help" title={meta.description}>
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-600 text-gray-500 text-xs hover:border-gray-400 hover:text-gray-300 transition-colors">?</span>
      </span>
      <span className="text-xs text-red-400 font-semibold ml-1">{meta.weight}</span>
    </span>
  );
}

function RatingSlider({ label, weight, description, value, onChange }: {
  label: string; weight: string; description: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300 flex items-center gap-1">
          {label}
          <span className="text-xs text-gray-600 cursor-help" title={description}>
            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-gray-700 text-gray-500 text-xs hover:border-gray-500 hover:text-gray-400">?</span>
          </span>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{weight}</span>
          <span className="text-sm font-bold text-red-400 w-8 text-right">{value.toFixed(1)}</span>
        </div>
      </div>
      <Slider min={0} max={10} step={0.1} value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v as number)} className="w-full" />
    </div>
  );
}

// ─── Park detail modal ────────────────────────────────────────────────────────
function BallparkDetailModal({ park, userRating, onRatingChange, onClose }: {
  park: Ballpark | null;
  userRating?: BallparkCriteria & { visited: boolean };
  onRatingChange: (id: string, scores: BallparkCriteria & { visited: boolean }) => void;
  onClose: () => void;
}) {
  const [localScores, setLocalScores] = useState<BallparkCriteria & { visited: boolean }>(
    userRating ?? { ...park?.defaultScores ?? {} as BallparkCriteria, visited: false }
  );

  useEffect(() => {
    if (park) setLocalScores(userRating ?? { ...park.defaultScores, visited: false });
  }, [park, userRating]);

  if (!park) return null;
  const totalScore = calculateTotalScore(localScores);
  const tier = getTier(totalScore);
  const parkFactorClass = (pf: number) => pf > 105 ? "text-red-400" : pf < 95 ? "text-blue-400" : "text-gray-300";

  const updateCriteria = (key: keyof BallparkCriteria, val: number) => {
    const updated = { ...localScores, [key]: val };
    setLocalScores(updated);
    onRatingChange(park.id, updated);
  };

  return (
    <Dialog open={!!park} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1a2a1a] border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getTeamLogoUrl(park.teamId)} alt={park.teamName} width={36} height={36} className="object-contain" />
            <div>
              <div className="text-lg font-bold">{park.name}</div>
              <div className="text-sm text-gray-400 font-normal">{park.city}, {park.state} · {park.teamName}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="relative h-40 rounded-lg overflow-hidden bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={park.imageUrl} alt={park.name} className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <Badge className={`text-xs px-2 py-1 border ${tier.color}`}>{tier.label}</Badge>
            <span className="text-2xl font-black text-white">{totalScore.toFixed(2)}</span>
          </div>
        </div>

        <Tabs defaultValue="info" className="mt-1">
          <TabsList className="bg-white/5 border border-white/10 w-full">
            <TabsTrigger value="info" className="flex-1 data-[state=active]:bg-red-600/30 data-[state=active]:text-red-300">Info</TabsTrigger>
            <TabsTrigger value="rate" className="flex-1 data-[state=active]:bg-red-600/30 data-[state=active]:text-red-300">My Rating</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 pt-2">
            <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
              <p className="text-xs font-semibold text-yellow-400 mb-1">⭐ Did You Know?</p>
              <p className="text-sm text-gray-300">{park.funFact}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-xs text-gray-400 mb-2">Stadium Info</p>
                <div className="space-y-1">
                  <div className="flex justify-between"><span className="text-gray-500">Opened</span><span className="text-white">{park.opened}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Capacity</span><span className="text-white">{park.capacity.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Surface</span><span className="text-white">{park.surface}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Roof</span><span className="text-white">{park.roof}</span></div>
                </div>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-xs text-gray-400 mb-2">Park Factors (100 = neutral)</p>
                <div className="space-y-1">
                  <div className="flex justify-between"><span className="text-gray-500">Runs</span><span className={parkFactorClass(park.parkFactors.runs)}>{park.parkFactors.runs}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Home Runs</span><span className={parkFactorClass(park.parkFactors.homeRuns)}>{park.parkFactors.homeRuns}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Batting</span><span className={parkFactorClass(park.parkFactors.batting)}>{park.parkFactors.batting}</span></div>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-xs text-gray-400 mb-2">Dimensions (feet)</p>
              <div className="flex justify-between text-sm">
                <div className="text-center"><div className="text-xs text-gray-500">LF</div><div className="text-white font-bold">{park.dimensions.leftField}&apos;</div></div>
                <div className="text-center"><div className="text-xs text-gray-500">LC</div><div className="text-white font-bold">{park.dimensions.leftCenter}&apos;</div></div>
                <div className="text-center"><div className="text-xs text-gray-500">CF</div><div className="text-white font-bold">{park.dimensions.centerField}&apos;</div></div>
                <div className="text-center"><div className="text-xs text-gray-500">RC</div><div className="text-white font-bold">{park.dimensions.rightCenter}&apos;</div></div>
                <div className="text-center"><div className="text-xs text-gray-500">RF</div><div className="text-white font-bold">{park.dimensions.rightField}&apos;</div></div>
              </div>
            </div>
            <div className="rounded-lg bg-red-600/10 border border-red-600/20 p-3">
              <p className="text-xs font-semibold text-red-400 mb-1">🎯 To Die For</p>
              <p className="text-sm text-gray-300">{park.tdfDescription}</p>
            </div>
          </TabsContent>

          <TabsContent value="rate" className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Rate this park (1–10 per category)</p>
              <Button size="sm" variant="outline"
                className={`text-xs border-white/20 ${localScores.visited ? "text-green-400 border-green-400/30" : "text-gray-400"}`}
                onClick={() => {
                  const updated = { ...localScores, visited: !localScores.visited };
                  setLocalScores(updated);
                  onRatingChange(park.id, updated);
                }}>
                {localScores.visited ? "✓ Visited" : "Mark as Visited"}
              </Button>
            </div>
            <div className="space-y-4">
              {(Object.keys(CRITERIA_META) as (keyof BallparkCriteria)[]).map((key) => (
                <RatingSlider key={key}
                  label={`${CRITERIA_META[key].icon} ${CRITERIA_META[key].label}`}
                  weight={CRITERIA_META[key].weight}
                  description={CRITERIA_META[key].description}
                  value={localScores[key] ?? park.defaultScores[key]}
                  onChange={(v) => updateCriteria(key, v)} />
              ))}
            </div>
            <div className="flex items-center justify-between rounded-lg bg-red-600/10 border border-red-600/30 px-4 py-3">
              <span className="text-sm font-semibold text-gray-300">Your Total Score</span>
              <div className="flex items-center gap-3">
                <Badge className={`text-xs border ${tier.color}`}>{tier.label}</Badge>
                <span className="text-2xl font-black text-red-400">{totalScore.toFixed(2)}</span>
              </div>
            </div>
            <Button className="w-full bg-red-600 hover:bg-red-500 text-white"
              onClick={() => onRatingChange(park.id, localScores)}>
              Save Rating
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

type SortMode = "score" | "name" | "parkFactor" | "capacity" | "opened"
  | "location" | "fieldDynamics" | "parkStructure" | "atmosphere"
  | "historicIntegration" | "foodMerch" | "overallExperience" | "tdfBonus";
type ViewMode = "grid" | "table";

function SortTh({ col, label, sortMode, sortDir, onSort, className = "" }: {
  col: SortMode; label: string; sortMode: SortMode; sortDir: "asc" | "desc";
  onSort: (c: SortMode) => void; className?: string;
}) {
  const active = sortMode === col;
  return (
    <th onClick={() => onSort(col)}
      className={`px-2 py-2 text-xs text-gray-400 uppercase whitespace-nowrap cursor-pointer select-none hover:text-white transition-colors text-right ${className}`}>
      <span className="flex items-center justify-end gap-1">
        {label}{active ? (sortDir === "desc" ? " ↓" : " ↑") : <span className="opacity-30">↕</span>}
      </span>
    </th>
  );
}

export default function BallparkRankClient({ ballparks }: { ballparks: Ballpark[] }) {
  const [userRatings, setUserRatings] = useState<Record<string, BallparkCriteria & { visited: boolean }>>({});
  const [selectedPark, setSelectedPark] = useState<Ballpark | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [filterVisited, setFilterVisited] = useState<"all" | "visited" | "not-visited">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => { setUserRatings(loadRatings()); }, []);

  const handleRatingChange = (id: string, scores: BallparkCriteria & { visited: boolean }) => {
    const updated = { ...userRatings, [id]: scores };
    setUserRatings(updated);
    saveRatings(updated);
  };

  function handleSort(col: SortMode) {
    if (sortMode === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortMode(col); setSortDir("desc"); }
  }

  const withScores = useMemo(() => ballparks.map((park) => {
    const scores = userRatings[park.id] ?? { ...park.defaultScores, visited: false };
    return {
      ...park,
      userScore: calculateTotalScore(scores),
      defaultScore: calculateTotalScore(park.defaultScores),
      visited: userRatings[park.id]?.visited ?? false,
      scores,
    };
  }), [ballparks, userRatings]);

  const filtered = useMemo(() => {
    const searched = withScores.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase()) ||
      p.teamName.toLowerCase().includes(search.toLowerCase())
    ).filter((p) => {
      if (filterVisited === "visited") return p.visited;
      if (filterVisited === "not-visited") return !p.visited;
      return true;
    });

    return [...searched].sort((a, b) => {
      const dir = sortDir === "desc" ? -1 : 1;
      if (sortMode === "score") return dir * (a.userScore - b.userScore) * -1;
      if (sortMode === "name") return dir * a.name.localeCompare(b.name) * -1;
      if (sortMode === "parkFactor") return dir * (a.parkFactors.homeRuns - b.parkFactors.homeRuns) * -1;
      if (sortMode === "capacity") return dir * (a.capacity - b.capacity) * -1;
      if (sortMode === "opened") return dir * (a.opened - b.opened) * -1;
      // Criteria sorts
      const criteriaKeys: (keyof BallparkCriteria)[] = ["location", "fieldDynamics", "parkStructure", "atmosphere", "historicIntegration", "foodMerch", "overallExperience", "tdfBonus"];
      if (criteriaKeys.includes(sortMode as keyof BallparkCriteria)) {
        const key = sortMode as keyof BallparkCriteria;
        return dir * (a.scores[key] - b.scores[key]) * -1;
      }
      return 0;
    });
  }, [withScores, search, filterVisited, sortMode, sortDir]);

  // ─── Analytics ───────────────────────────────────────────────────────────
  const analytics = useMemo(() => {
    const scores = withScores.map((p) => p.userScore).sort((a, b) => a - b);
    const n = scores.length;
    const avg = scores.reduce((a, b) => a + b, 0) / n;
    const median = n % 2 === 0 ? (scores[n / 2 - 1] + scores[n / 2]) / 2 : scores[Math.floor(n / 2)];
    const byTier = (label: string) => withScores.filter((p) => getTier(p.userScore).label === label).length;
    const visitedParks = withScores.filter((p) => p.visited);
    const avgVisited = visitedParks.length > 0
      ? visitedParks.reduce((s, p) => s + p.userScore, 0) / visitedParks.length : 0;
    return {
      avg: avg.toFixed(2),
      median: median.toFixed(2),
      highest: scores[n - 1]?.toFixed(2) ?? "—",
      lowest: scores[0]?.toFixed(2) ?? "—",
      highestPark: withScores.reduce((best, p) => p.userScore > best.userScore ? p : best, withScores[0]),
      lowestPark: withScores.reduce((worst, p) => p.userScore < worst.userScore ? p : worst, withScores[0]),
      elite: byTier("ELITE"),
      upper: byTier("Upper Tier"),
      average: byTier("Average"),
      lower: byTier("Lower Tier"),
      crap: byTier("50 Feet of Crap"),
      visited: visitedParks.length,
      avgVisited: avgVisited.toFixed(2),
    };
  }, [withScores]);

  const visitedCount = withScores.filter((p) => p.visited).length;

  const tierCounts = {
    ELITE: filtered.filter((p) => getTier(p.userScore).label === "ELITE").length,
    "Upper Tier": filtered.filter((p) => getTier(p.userScore).label === "Upper Tier").length,
    Average: filtered.filter((p) => getTier(p.userScore).label === "Average").length,
    "Lower Tier": filtered.filter((p) => getTier(p.userScore).label === "Lower Tier").length,
    "50 Feet of Crap": filtered.filter((p) => getTier(p.userScore).label === "50 Feet of Crap").length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black">🎯 Ballpark Rank</h1>
        <p className="text-gray-400 text-sm mt-1">Rate all 30 MLB stadiums · Personal rankings saved locally</p>
      </div>

      {/* ── Scoring System Overview ─────────────────────────────────────────── */}
      <Card className="bg-card border-white/10 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-400 uppercase tracking-wider">📊 Scoring System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {(Object.keys(CRITERIA_META) as (keyof BallparkCriteria)[]).map((key) => {
              const m = CRITERIA_META[key];
              return (
                <div key={key} className="rounded-lg bg-white/5 p-2 text-center" title={m.description}>
                  <div className="text-lg mb-0.5">{m.icon}</div>
                  <div className="text-xs text-gray-300 font-semibold leading-tight">{m.label}</div>
                  <div className="text-xs text-red-400 font-bold mt-1">{m.weight}</div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-3">Hover the ? icons in the rating panel for detailed descriptions of each criterion. Total score = weighted sum (0–10 scale).</p>
        </CardContent>
      </Card>

      {/* ── Analytics Overview ──────────────────────────────────────────────── */}
      <Card className="bg-card border-white/10 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-400 uppercase tracking-wider">📈 Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-black text-yellow-400">{analytics.highest}</div>
              <div className="text-xs text-gray-500 mt-0.5">Highest Score</div>
              <div className="text-xs text-gray-600 mt-0.5 truncate">{analytics.highestPark?.name}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-red-500">{analytics.lowest}</div>
              <div className="text-xs text-gray-500 mt-0.5">Lowest Score</div>
              <div className="text-xs text-gray-600 mt-0.5 truncate">{analytics.lowestPark?.name}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-blue-400">{analytics.avg}</div>
              <div className="text-xs text-gray-500 mt-0.5">Average Score</div>
              <div className="text-xs text-gray-600 mt-0.5">All 30 parks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-green-400">{analytics.median}</div>
              <div className="text-xs text-gray-500 mt-0.5">Median Score</div>
              <div className="text-xs text-gray-600 mt-0.5">Middle park</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-red-400">{visitedCount}</div>
              <div className="text-xs text-gray-500 mt-0.5">Parks Visited</div>
              <div className="text-xs text-gray-600 mt-0.5">of 30</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-purple-400">{visitedCount > 0 ? analytics.avgVisited : "—"}</div>
              <div className="text-xs text-gray-500 mt-0.5">Avg (Visited)</div>
              <div className="text-xs text-gray-600 mt-0.5">Visited parks</div>
            </div>
          </div>
          {/* Tier breakdown */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: "ELITE ≥8.5", count: analytics.elite, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
              { label: "Upper Tier ≥7.5", count: analytics.upper, color: "text-green-400 bg-green-400/10 border-green-400/30" },
              { label: "Average ≥6.5", count: analytics.average, color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
              { label: "Lower Tier ≥5.5", count: analytics.lower, color: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
              { label: "50 Feet of Crap", count: analytics.crap, color: "text-red-400 bg-red-400/10 border-red-400/30" },
            ].map(({ label, count, color }) => (
              <Badge key={label} className={`text-xs border ${color}`}>{label}: {count} parks</Badge>
            ))}
          </div>
          {/* Score distribution bar */}
          <div className="mt-3">
            <div className="h-3 rounded-full overflow-hidden flex">
              {analytics.elite > 0 && <div className="bg-yellow-400/60" style={{ width: `${(analytics.elite / 30) * 100}%` }} />}
              {analytics.upper > 0 && <div className="bg-green-400/60" style={{ width: `${(analytics.upper / 30) * 100}%` }} />}
              {analytics.average > 0 && <div className="bg-blue-400/60" style={{ width: `${(analytics.average / 30) * 100}%` }} />}
              {analytics.lower > 0 && <div className="bg-orange-400/60" style={{ width: `${(analytics.lower / 30) * 100}%` }} />}
              {analytics.crap > 0 && <div className="bg-red-500/60" style={{ width: `${(analytics.crap / 30) * 100}%` }} />}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>ELITE</span><span>←—— Distribution ——→</span><span>50 Feet of Crap</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Input placeholder="Search parks..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 max-w-44" />
        <div className="flex rounded-md overflow-hidden border border-white/10">
          {(["all", "visited", "not-visited"] as const).map((f) => (
            <button key={f} onClick={() => setFilterVisited(f)}
              className={`px-3 py-2 text-xs font-medium transition ${filterVisited === f ? "bg-red-600/30 text-red-300" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
              {f === "all" ? "All 30" : f === "visited" ? "✓ Visited" : "Not Visited"}
            </button>
          ))}
        </div>
        <div className="flex rounded-md overflow-hidden border border-white/10 ml-auto">
          <button onClick={() => setViewMode("grid")}
            className={`px-3 py-2 text-xs font-medium transition ${viewMode === "grid" ? "bg-red-600/30 text-red-300" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
            ⊞ Grid
          </button>
          <button onClick={() => setViewMode("table")}
            className={`px-3 py-2 text-xs font-medium transition ${viewMode === "table" ? "bg-red-600/30 text-red-300" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
            ≡ Table
          </button>
        </div>
      </div>

      {/* Tier legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(tierCounts).map(([tier, count]) => {
          const score = tier === "ELITE" ? 9 : tier === "Upper Tier" ? 8 : tier === "Average" ? 7 : tier === "Lower Tier" ? 6 : 4;
          const t = getTier(score);
          return <Badge key={tier} className={`text-xs border ${t.color}`}>{tier}: {count}</Badge>;
        })}
      </div>

      {/* ── Grid View ───────────────────────────────────────────────────────── */}
      {viewMode === "grid" && (
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 self-center">Sort:</span>
          {([
            { v: "score", l: "Score" }, { v: "name", l: "Name" },
            { v: "parkFactor", l: "HR Factor" }, { v: "capacity", l: "Capacity" },
            { v: "opened", l: "Year Built" },
          ] as { v: SortMode; l: string }[]).map(({ v, l }) => (
            <button key={v} onClick={() => handleSort(v)}
              className={`px-2.5 py-1 rounded text-xs border transition ${sortMode === v ? "border-red-600/50 bg-red-600/20 text-red-300" : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"}`}>
              {l} {sortMode === v ? (sortDir === "desc" ? "↓" : "↑") : ""}
            </button>
          ))}
        </div>
      )}

      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((park, idx) => {
            const tier = getTier(park.userScore);
            const pfClass = park.parkFactors.homeRuns > 105 ? "text-red-400" : park.parkFactors.homeRuns < 95 ? "text-blue-400" : "text-gray-400";
            return (
              <button key={park.id}
                onClick={() => setSelectedPark(ballparks.find((b) => b.id === park.id) ?? null)}
                className="rounded-xl border border-white/10 bg-card text-left overflow-hidden hover:border-red-600/40 transition group">
                <div className="relative h-32 bg-white/5 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={park.imageUrl} alt={park.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute top-2 left-2"><span className="text-sm font-bold text-white/60">#{idx + 1}</span></div>
                  <div className="absolute top-2 right-2">
                    {park.visited && <span className="text-xs bg-green-600/40 text-green-300 px-1.5 py-0.5 rounded">✓</span>}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
                    <Badge className={`text-xs border ${tier.color}`}>{tier.label}</Badge>
                    <span className="text-xl font-black text-white">{park.userScore.toFixed(2)}</span>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getTeamLogoUrl(park.teamId)} alt="" width={20} height={20} className="object-contain" />
                    <div className="font-bold text-white text-sm">{park.name}</div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{park.city}, {park.state} · {park.opened}</p>
                  <div className="flex gap-3 text-xs">
                    <span className="text-gray-500">Cap: <span className="text-gray-300">{(park.capacity / 1000).toFixed(0)}k</span></span>
                    <span className="text-gray-500">HR PF: <span className={pfClass}>{park.parkFactors.homeRuns}</span></span>
                    <span className="text-gray-500">Roof: <span className="text-gray-300">{park.roof}</span></span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        // ── Table View ──────────────────────────────────────────────────────
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-3 py-2 text-gray-400 text-xs uppercase">#</th>
                <th className="text-left px-3 py-2 text-gray-400 text-xs uppercase min-w-[180px]">Park</th>
                <th className="text-left px-2 py-2 text-gray-400 text-xs uppercase hidden md:table-cell">City</th>
                <th className="text-left px-2 py-2 text-gray-400 text-xs uppercase">Tier</th>
                <SortTh col="score" label="Score" sortMode={sortMode} sortDir={sortDir} onSort={handleSort} className="text-white font-bold" />
                <SortTh col="location" label="📍 Loc" sortMode={sortMode} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="fieldDynamics" label="⚾ Field" sortMode={sortMode} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="parkStructure" label="🏟️ Structure" sortMode={sortMode} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="atmosphere" label="🔥 Atmo" sortMode={sortMode} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="historicIntegration" label="📜 History" sortMode={sortMode} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="foodMerch" label="🌭 Food" sortMode={sortMode} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="overallExperience" label="⭐ Overall" sortMode={sortMode} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="tdfBonus" label="🎯 TDF" sortMode={sortMode} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="parkFactor" label="HR PF" sortMode={sortMode} sortDir={sortDir} onSort={handleSort} />
                <th className="px-2 py-2 text-gray-400 text-xs uppercase text-center hidden sm:table-cell">✓</th>
              </tr>
              <tr className="border-b border-white/5">
                <td colSpan={15} className="px-3 py-1 text-xs text-gray-600 italic">
                  Click any column header to sort · Click a row to rate this park
                </td>
              </tr>
            </thead>
            <tbody>
              {filtered.map((park, idx) => {
                const tier = getTier(park.userScore);
                const s = park.scores;
                const pfClass = park.parkFactors.homeRuns > 105 ? "text-red-400" : park.parkFactors.homeRuns < 95 ? "text-blue-400" : "text-gray-400";
                const scoreColor = (v: number) => v >= 8 ? "text-green-400" : v >= 6.5 ? "text-gray-200" : v >= 5 ? "text-orange-400" : "text-red-400";
                return (
                  <tr key={park.id}
                    onClick={() => setSelectedPark(ballparks.find((b) => b.id === park.id) ?? null)}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                    <td className="px-3 py-2.5 text-gray-500 font-bold">{idx + 1}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={getTeamLogoUrl(park.teamId)} alt="" width={18} height={18} className="object-contain flex-shrink-0" />
                        <span className="font-semibold text-white">{park.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-gray-400 hidden md:table-cell">{park.city}</td>
                    <td className="px-2 py-2.5">
                      <Badge className={`text-xs border ${tier.color} whitespace-nowrap`}>{tier.label}</Badge>
                    </td>
                    <td className="px-2 py-2.5 text-right font-black text-white">{park.userScore.toFixed(2)}</td>
                    <td className={`px-2 py-2.5 text-right font-mono ${scoreColor(s.location)}`}>{s.location.toFixed(1)}</td>
                    <td className={`px-2 py-2.5 text-right font-mono ${scoreColor(s.fieldDynamics)}`}>{s.fieldDynamics.toFixed(1)}</td>
                    <td className={`px-2 py-2.5 text-right font-mono ${scoreColor(s.parkStructure)}`}>{s.parkStructure.toFixed(1)}</td>
                    <td className={`px-2 py-2.5 text-right font-mono ${scoreColor(s.atmosphere)}`}>{s.atmosphere.toFixed(1)}</td>
                    <td className={`px-2 py-2.5 text-right font-mono ${scoreColor(s.historicIntegration)}`}>{s.historicIntegration.toFixed(1)}</td>
                    <td className={`px-2 py-2.5 text-right font-mono ${scoreColor(s.foodMerch)}`}>{s.foodMerch.toFixed(1)}</td>
                    <td className={`px-2 py-2.5 text-right font-mono ${scoreColor(s.overallExperience)}`}>{s.overallExperience.toFixed(1)}</td>
                    <td className={`px-2 py-2.5 text-right font-mono ${s.tdfBonus >= 2 ? "text-yellow-400" : s.tdfBonus >= 1 ? "text-gray-200" : "text-gray-500"}`}>{s.tdfBonus.toFixed(1)}</td>
                    <td className={`px-2 py-2.5 text-right hidden md:table-cell ${pfClass}`}>{park.parkFactors.homeRuns}</td>
                    <td className="px-2 py-2.5 text-center hidden sm:table-cell">
                      {park.visited ? <span className="text-green-400">✓</span> : <span className="text-gray-600">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <BallparkDetailModal
        park={selectedPark}
        userRating={selectedPark ? userRatings[selectedPark.id] : undefined}
        onRatingChange={handleRatingChange}
        onClose={() => setSelectedPark(null)} />
    </div>
  );
}
