"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  } catch {
    return {};
  }
}

function saveRatings(ratings: Record<string, BallparkCriteria & { visited: boolean }>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
  } catch {}
}

const CRITERIA_LABELS: Record<keyof BallparkCriteria, { label: string; weight: string }> = {
  location: { label: "Location", weight: "15%" },
  fieldDynamics: { label: "Field Dynamics", weight: "15%" },
  parkStructure: { label: "Park Structure", weight: "15%" },
  atmosphere: { label: "Atmosphere", weight: "15%" },
  historicIntegration: { label: "Historic Integration", weight: "10%" },
  foodMerch: { label: "Food & Merch", weight: "5%" },
  overallExperience: { label: "Overall Experience", weight: "25%" },
  tdfBonus: { label: "TDF Bonus", weight: "Special" },
};

function RatingSlider({
  label,
  weight,
  value,
  onChange,
}: {
  label: string;
  weight: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{weight}</span>
          <span className="text-sm font-bold text-red-400 w-8 text-right">{value.toFixed(1)}</span>
        </div>
      </div>
      <Slider
        min={0}
        max={10}
        step={0.1}
        value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v as number)}
        className="w-full"
      />
    </div>
  );
}

function BallparkDetailModal({
  park,
  userRating,
  onRatingChange,
  onClose,
}: {
  park: Ballpark | null;
  userRating?: BallparkCriteria & { visited: boolean };
  onRatingChange: (id: string, scores: BallparkCriteria & { visited: boolean }) => void;
  onClose: () => void;
}) {
  const [localScores, setLocalScores] = useState<BallparkCriteria & { visited: boolean }>(
    userRating ?? { ...park?.defaultScores ?? {} as BallparkCriteria, visited: false }
  );

  useEffect(() => {
    if (park) {
      setLocalScores(userRating ?? { ...park.defaultScores, visited: false });
    }
  }, [park, userRating]);

  if (!park) return null;

  const totalScore = calculateTotalScore(localScores);
  const tier = getTier(totalScore);
  const parkFactorClass = (pf: number) =>
    pf > 105 ? "text-red-400" : pf < 95 ? "text-blue-400" : "text-gray-300";

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

        {/* Park image */}
        <div className="relative h-40 rounded-lg overflow-hidden bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={park.imageUrl}
            alt={park.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
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
            {/* Fun fact */}
            <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
              <p className="text-xs font-semibold text-yellow-400 mb-1">⭐ Did You Know?</p>
              <p className="text-sm text-gray-300">{park.funFact}</p>
            </div>

            {/* Park facts */}
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
                <p className="text-xs text-gray-400 mb-2">Park Factors</p>
                <div className="space-y-1">
                  <div className="flex justify-between"><span className="text-gray-500">Runs</span><span className={parkFactorClass(park.parkFactors.runs)}>{park.parkFactors.runs}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">HR</span><span className={parkFactorClass(park.parkFactors.homeRuns)}>{park.parkFactors.homeRuns}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Batting</span><span className={parkFactorClass(park.parkFactors.batting)}>{park.parkFactors.batting}</span></div>
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-xs text-gray-400 mb-2">Dimensions</p>
              <div className="flex justify-between text-sm">
                <div className="text-center"><div className="text-xs text-gray-500">LF</div><div className="text-white font-bold">{park.dimensions.leftField}&apos;</div></div>
                <div className="text-center"><div className="text-xs text-gray-500">LC</div><div className="text-white font-bold">{park.dimensions.leftCenter}&apos;</div></div>
                <div className="text-center"><div className="text-xs text-gray-500">CF</div><div className="text-white font-bold">{park.dimensions.centerField}&apos;</div></div>
                <div className="text-center"><div className="text-xs text-gray-500">RC</div><div className="text-white font-bold">{park.dimensions.rightCenter}&apos;</div></div>
                <div className="text-center"><div className="text-xs text-gray-500">RF</div><div className="text-white font-bold">{park.dimensions.rightField}&apos;</div></div>
              </div>
            </div>

            {/* TDF */}
            <div className="rounded-lg bg-red-600/10 border border-red-600/20 p-3">
              <p className="text-xs font-semibold text-red-400 mb-1">🎯 To Die For</p>
              <p className="text-sm text-gray-300">{park.tdfDescription}</p>
            </div>
          </TabsContent>

          <TabsContent value="rate" className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Rate this park (1-10 per category)</p>
              <Button
                size="sm"
                variant="outline"
                className={`text-xs border-white/20 ${localScores.visited ? "text-green-400 border-green-400/30" : "text-gray-400"}`}
                onClick={() => {
                  const updated = { ...localScores, visited: !localScores.visited };
                  setLocalScores(updated);
                  onRatingChange(park.id, updated);
                }}
              >
                {localScores.visited ? "✓ Visited" : "Mark as Visited"}
              </Button>
            </div>

            <div className="space-y-4">
              {(Object.keys(CRITERIA_LABELS) as (keyof BallparkCriteria)[]).map((key) => (
                <RatingSlider
                  key={key}
                  label={CRITERIA_LABELS[key].label}
                  weight={CRITERIA_LABELS[key].weight}
                  value={localScores[key] ?? park.defaultScores[key]}
                  onChange={(v) => updateCriteria(key, v)}
                />
              ))}
            </div>

            <div className="flex items-center justify-between rounded-lg bg-red-600/10 border border-red-600/30 px-4 py-3">
              <span className="text-sm font-semibold text-gray-300">Your Total Score</span>
              <div className="flex items-center gap-3">
                <Badge className={`text-xs border ${tier.color}`}>{tier.label}</Badge>
                <span className="text-2xl font-black text-red-400">{totalScore.toFixed(2)}</span>
              </div>
            </div>

            <Button
              className="w-full bg-red-600 hover:bg-red-500 text-white"
              onClick={() => onRatingChange(park.id, localScores)}
            >
              Save Rating
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

type SortMode = "score" | "name" | "parkFactor" | "capacity" | "opened";
type ViewMode = "grid" | "table";

export default function BallparkRankClient({ ballparks }: { ballparks: Ballpark[] }) {
  const [userRatings, setUserRatings] = useState<Record<string, BallparkCriteria & { visited: boolean }>>({});
  const [selectedPark, setSelectedPark] = useState<Ballpark | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("score");
  const [search, setSearch] = useState("");
  const [filterVisited, setFilterVisited] = useState<"all" | "visited" | "not-visited">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    setUserRatings(loadRatings());
  }, []);

  const handleRatingChange = (id: string, scores: BallparkCriteria & { visited: boolean }) => {
    const updated = { ...userRatings, [id]: scores };
    setUserRatings(updated);
    saveRatings(updated);
  };

  const withScores = ballparks.map((park) => {
    const scores = userRatings[park.id] ?? { ...park.defaultScores, visited: false };
    return {
      ...park,
      userScore: calculateTotalScore(scores),
      defaultScore: calculateTotalScore(park.defaultScores),
      visited: userRatings[park.id]?.visited ?? false,
    };
  });

  const filtered = withScores
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase()) || p.teamName.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => {
      if (filterVisited === "visited") return p.visited;
      if (filterVisited === "not-visited") return !p.visited;
      return true;
    })
    .sort((a, b) => {
      if (sortMode === "score") return b.userScore - a.userScore;
      if (sortMode === "name") return a.name.localeCompare(b.name);
      if (sortMode === "parkFactor") return b.parkFactors.homeRuns - a.parkFactors.homeRuns;
      if (sortMode === "capacity") return b.capacity - a.capacity;
      if (sortMode === "opened") return a.opened - b.opened;
      return 0;
    });

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
        <p className="text-gray-400 text-sm mt-1">Rate all 30 MLB stadiums · Community rankings · Park factors</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg bg-white/5 border border-white/10 p-4 text-center">
          <div className="text-2xl font-black text-red-400">{visitedCount}</div>
          <div className="text-xs text-gray-500 mt-1">Parks Visited</div>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-4 text-center">
          <div className="text-2xl font-black text-yellow-400">{tierCounts.ELITE}</div>
          <div className="text-xs text-gray-500 mt-1">ELITE Parks</div>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-4 text-center">
          <div className="text-2xl font-black text-blue-400">{30 - visitedCount}</div>
          <div className="text-xs text-gray-500 mt-1">Parks to Visit</div>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-4 text-center">
          <div className="text-2xl font-black text-green-400">
            {visitedCount > 0 ? (withScores.filter((p) => p.visited).reduce((sum, p) => sum + p.userScore, 0) / visitedCount).toFixed(1) : "—"}
          </div>
          <div className="text-xs text-gray-500 mt-1">Avg Score (Visited)</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Input
          placeholder="Search parks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 max-w-48"
        />
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="rounded-md bg-white/5 border border-white/10 text-white text-sm px-3 py-2"
        >
          <option value="score">Sort: My Score</option>
          <option value="name">Sort: Name</option>
          <option value="parkFactor">Sort: HR Park Factor</option>
          <option value="capacity">Sort: Capacity</option>
          <option value="opened">Sort: Oldest First</option>
        </select>
        <div className="flex rounded-md overflow-hidden border border-white/10">
          {(["all", "visited", "not-visited"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterVisited(f)}
              className={`px-3 py-2 text-xs font-medium transition ${filterVisited === f ? "bg-red-600/30 text-red-300" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
            >
              {f === "all" ? "All" : f === "visited" ? "✓ Visited" : "Not Visited"}
            </button>
          ))}
        </div>
        {/* View mode toggle */}
        <div className="flex rounded-md overflow-hidden border border-white/10 ml-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-2 text-xs font-medium transition ${viewMode === "grid" ? "bg-red-600/30 text-red-300" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
            title="Card grid view"
          >
            ⊞ Grid
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-2 text-xs font-medium transition ${viewMode === "table" ? "bg-red-600/30 text-red-300" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
            title="Table view"
          >
            ≡ Table
          </button>
        </div>
      </div>

      {/* Tier legend */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(tierCounts).map(([tier, count]) => {
          const t = getTier(tier === "ELITE" ? 9 : tier === "Upper Tier" ? 8 : tier === "Average" ? 7 : tier === "Lower Tier" ? 6 : 4);
          return (
            <Badge key={tier} className={`text-xs border ${t.color}`}>
              {tier}: {count}
            </Badge>
          );
        })}
      </div>

      {/* Park grid view */}
      {viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((park, idx) => {
            const tier = getTier(park.userScore);
            const isVisited = park.visited;
            const pfClass = park.parkFactors.homeRuns > 105 ? "text-red-400" :
              park.parkFactors.homeRuns < 95 ? "text-blue-400" : "text-gray-400";

            return (
              <button
                key={park.id}
                onClick={() => setSelectedPark(ballparks.find((b) => b.id === park.id) ?? null)}
                className="rounded-xl border border-white/10 bg-card text-left overflow-hidden hover:border-red-600/40 transition group"
              >
                <div className="relative h-32 bg-white/5 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={park.imageUrl}
                    alt={park.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute top-2 left-2">
                    <span className="text-sm font-bold text-white/60">#{idx + 1}</span>
                  </div>
                  <div className="absolute top-2 right-2">
                    {isVisited && <span className="text-xs bg-green-600/40 text-green-300 px-1.5 py-0.5 rounded">✓</span>}
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
      )}

      {/* Park table view */}
      {viewMode === "table" && (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-xs text-gray-400 uppercase">
                <th className="text-left px-4 py-3 w-10">#</th>
                <th className="text-left px-4 py-3">Park</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">City</th>
                <th className="text-center px-3 py-3">Tier</th>
                <th className="text-right px-4 py-3">Score</th>
                <th className="text-right px-3 py-3 hidden lg:table-cell">Loc</th>
                <th className="text-right px-3 py-3 hidden lg:table-cell">Field</th>
                <th className="text-right px-3 py-3 hidden lg:table-cell">Struct</th>
                <th className="text-right px-3 py-3 hidden lg:table-cell">Atmo</th>
                <th className="text-right px-3 py-3 hidden lg:table-cell">Hist</th>
                <th className="text-right px-3 py-3 hidden xl:table-cell">Food</th>
                <th className="text-right px-3 py-3 hidden lg:table-cell">Exp</th>
                <th className="text-right px-4 py-3 hidden md:table-cell">HR PF</th>
                <th className="text-center px-3 py-3 hidden sm:table-cell">✓</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((park, idx) => {
                const tier = getTier(park.userScore);
                const scores = userRatings[park.id] ?? { ...park.defaultScores, visited: false };
                const pfClass = park.parkFactors.homeRuns > 105 ? "text-red-400" :
                  park.parkFactors.homeRuns < 95 ? "text-blue-400" : "text-gray-400";
                return (
                  <tr
                    key={park.id}
                    onClick={() => setSelectedPark(ballparks.find((b) => b.id === park.id) ?? null)}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-500 font-bold">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={getTeamLogoUrl(park.teamId)} alt="" width={18} height={18} className="object-contain flex-shrink-0" />
                        <span className="font-semibold text-white">{park.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{park.city}</td>
                    <td className="px-3 py-3 text-center">
                      <Badge className={`text-xs border ${tier.color} whitespace-nowrap`}>{tier.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-black text-white">{park.userScore.toFixed(2)}</td>
                    <td className="px-3 py-3 text-right text-gray-300 hidden lg:table-cell">{scores.location.toFixed(1)}</td>
                    <td className="px-3 py-3 text-right text-gray-300 hidden lg:table-cell">{scores.fieldDynamics.toFixed(1)}</td>
                    <td className="px-3 py-3 text-right text-gray-300 hidden lg:table-cell">{scores.parkStructure.toFixed(1)}</td>
                    <td className="px-3 py-3 text-right text-gray-300 hidden lg:table-cell">{scores.atmosphere.toFixed(1)}</td>
                    <td className="px-3 py-3 text-right text-gray-300 hidden lg:table-cell">{scores.historicIntegration.toFixed(1)}</td>
                    <td className="px-3 py-3 text-right text-gray-300 hidden xl:table-cell">{scores.foodMerch.toFixed(1)}</td>
                    <td className="px-3 py-3 text-right text-gray-300 hidden lg:table-cell">{scores.overallExperience.toFixed(1)}</td>
                    <td className={`px-4 py-3 text-right hidden md:table-cell ${pfClass}`}>{park.parkFactors.homeRuns}</td>
                    <td className="px-3 py-3 text-center hidden sm:table-cell">
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
        onClose={() => setSelectedPark(null)}
      />
    </div>
  );
}
