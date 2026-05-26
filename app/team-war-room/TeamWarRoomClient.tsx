"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MLBTeam, getTeamLogoUrl, getPlayerHeadshotUrl } from "@/data/teams";

interface RosterPlayer {
  person: { id: number; fullName: string };
  jerseyNumber?: string;
  position: { code: string; name: string; type: string; abbreviation: string };
  status: { code: string; description: string };
}

interface HittingStat {
  gamesPlayed?: number;
  atBats?: number;
  hits?: number;
  avg?: string;
  obp?: string;
  slg?: string;
  ops?: string;
  homeRuns?: number;
  rbi?: number;
  runs?: number;
  stolenBases?: number;
  caughtStealing?: number;
  strikeOuts?: number;
  baseOnBalls?: number;
  intentionalWalks?: number;
  hitByPitch?: number;
  groundIntoDoublePlay?: number;
  totalBases?: number;
  doubles?: number;
  triples?: number;
  babip?: string;
  plateAppearances?: number;
  leftOnBase?: number;
}

interface PitchingStat {
  gamesPlayed?: number;
  gamesStarted?: number;
  wins?: number;
  losses?: number;
  saves?: number;
  holds?: number;
  blownSaves?: number;
  era?: string;
  whip?: string;
  strikeOuts?: number;
  baseOnBalls?: number;
  inningsPitched?: string;
  hits?: number;
  homeRuns?: number;
  earnedRuns?: number;
  strikeoutsPer9Inn?: string;
  walksPer9Inn?: string;
  qualityStarts?: number;
  completeGames?: number;
  strikeoutWalkRatio?: string;
  hitBatsmen?: number;
}

const SC = (val: number, low: number, mid: number, high: number, inv = false) => {
  if (inv) {
    if (val <= low) return "text-green-400";
    if (val <= mid) return "text-yellow-400";
    return "text-red-400";
  }
  if (val >= high) return "text-green-400";
  if (val >= mid) return "text-yellow-400";
  return "text-red-400";
};

function StatCell({ label, value, color }: { label: string; value: string | number | undefined; color?: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-white/5 px-3 py-2 min-w-[70px]">
      <span className={`text-lg font-black ${color ?? "text-white"}`}>{value ?? "—"}</span>
      <span className="text-xs text-gray-500 mt-0.5">{label}</span>
    </div>
  );
}

function SituationPanel({ splits }: { splits: Array<{ split?: { code: string; description: string }; stat: HittingStat }> }) {
  const get = (code: string) => splits.find((s) => s.split?.code === code)?.stat;
  const risp = get("risp");
  const twoOut = get("2out");
  const highLev = get("highLeverageIndex");
  const vsLeft = get("vl");
  const vsRight = get("vr");
  const loaded = get("basesLoaded");

  return (
    <div className="space-y-3">
      {vsLeft && vsRight && (
        <div>
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">vs Handedness</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-xs text-blue-400 font-semibold mb-2">vs LHP</p>
              <div className="flex flex-wrap gap-2">
                <StatCell label="AVG" value={vsLeft.avg} />
                <StatCell label="OBP" value={vsLeft.obp} />
                <StatCell label="OPS" value={vsLeft.ops} />
                <StatCell label="HR" value={vsLeft.homeRuns} />
              </div>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-xs text-red-400 font-semibold mb-2">vs RHP</p>
              <div className="flex flex-wrap gap-2">
                <StatCell label="AVG" value={vsRight.avg} />
                <StatCell label="OBP" value={vsRight.obp} />
                <StatCell label="OPS" value={vsRight.ops} />
                <StatCell label="HR" value={vsRight.homeRuns} />
              </div>
            </div>
          </div>
        </div>
      )}
      {risp && (
        <div>
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">🔥 Runners in Scoring Position</p>
          <div className="rounded-lg bg-white/5 p-3">
            <div className="flex flex-wrap gap-2">
              <StatCell label="AVG" value={risp.avg} color={SC(parseFloat(risp.avg ?? "0"), 0.220, 0.260, 0.300)} />
              <StatCell label="OBP" value={risp.obp} />
              <StatCell label="OPS" value={risp.ops} />
              <StatCell label="H" value={risp.hits} />
              <StatCell label="HR" value={risp.homeRuns} />
              <StatCell label="RBI" value={risp.rbi} />
              <StatCell label="K" value={risp.strikeOuts} />
              <StatCell label="BB" value={risp.baseOnBalls} />
            </div>
          </div>
        </div>
      )}
      {twoOut && (
        <div>
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">2 Outs</p>
          <div className="rounded-lg bg-white/5 p-3">
            <div className="flex flex-wrap gap-2">
              <StatCell label="AVG" value={twoOut.avg} color={SC(parseFloat(twoOut.avg ?? "0"), 0.200, 0.240, 0.280)} />
              <StatCell label="OPS" value={twoOut.ops} />
              <StatCell label="HR" value={twoOut.homeRuns} />
              <StatCell label="RBI" value={twoOut.rbi} />
              <StatCell label="K" value={twoOut.strikeOuts} />
            </div>
          </div>
        </div>
      )}
      {highLev && (
        <div>
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">⚡ High Leverage (Clutch)</p>
          <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/20 p-3">
            <div className="flex flex-wrap gap-2">
              <StatCell label="AVG" value={highLev.avg} color={SC(parseFloat(highLev.avg ?? "0"), 0.220, 0.260, 0.300)} />
              <StatCell label="OPS" value={highLev.ops} />
              <StatCell label="HR" value={highLev.homeRuns} />
              <StatCell label="RBI" value={highLev.rbi} />
              <StatCell label="BB" value={highLev.baseOnBalls} />
              <StatCell label="K" value={highLev.strikeOuts} />
            </div>
          </div>
        </div>
      )}
      {loaded && (
        <div>
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Bases Loaded</p>
          <div className="rounded-lg bg-white/5 p-3">
            <div className="flex flex-wrap gap-2">
              <StatCell label="AVG" value={loaded.avg} />
              <StatCell label="RBI" value={loaded.rbi} />
              <StatCell label="K" value={loaded.strikeOuts} />
              <StatCell label="BB" value={loaded.baseOnBalls} />
            </div>
          </div>
        </div>
      )}
      {!risp && !vsLeft && !highLev && (
        <p className="text-gray-500 text-sm">No situational split data available this season.</p>
      )}
    </div>
  );
}

function HitterStatsPanel({ stats, splits }: { stats: { season?: HittingStat; career?: HittingStat }; splits?: Array<{ split?: { code: string; description: string }; stat: HittingStat }> }) {
  const s = stats.season;
  if (!s) return <p className="text-gray-500 text-sm">No stats available for current season.</p>;
  const avg = parseFloat(s.avg ?? "0");
  const obp = parseFloat(s.obp ?? "0");
  const slg = parseFloat(s.slg ?? "0");
  const ops = parseFloat(s.ops ?? "0");

  return (
    <Tabs defaultValue="standard">
      <TabsList className="bg-white/5 border border-white/10 mb-4 w-full">
        <TabsTrigger value="standard" className="flex-1 data-[state=active]:bg-red-600/30 data-[state=active]:text-red-300 text-xs">Standard</TabsTrigger>
        <TabsTrigger value="situational" className="flex-1 data-[state=active]:bg-red-600/30 data-[state=active]:text-red-300 text-xs">Situational</TabsTrigger>
        <TabsTrigger value="career" className="flex-1 data-[state=active]:bg-red-600/30 data-[state=active]:text-red-300 text-xs">Career</TabsTrigger>
      </TabsList>
      <TabsContent value="standard" className="space-y-4">
        <div>
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Batting Line</p>
          <div className="flex flex-wrap gap-2">
            <StatCell label="AVG" value={s.avg} color={SC(avg, 0.220, 0.260, 0.300)} />
            <StatCell label="OBP" value={s.obp} color={SC(obp, 0.300, 0.330, 0.370)} />
            <StatCell label="SLG" value={s.slg} color={SC(slg, 0.380, 0.440, 0.500)} />
            <StatCell label="OPS" value={s.ops} color={SC(ops, 0.680, 0.750, 0.850)} />
            <StatCell label="HR" value={s.homeRuns} color={SC(s.homeRuns ?? 0, 10, 20, 30)} />
            <StatCell label="RBI" value={s.rbi} color={SC(s.rbi ?? 0, 40, 70, 100)} />
            <StatCell label="R" value={s.runs} />
            <StatCell label="SB" value={s.stolenBases} />
            <StatCell label="2B" value={s.doubles} />
            <StatCell label="3B" value={s.triples} />
            <StatCell label="TB" value={s.totalBases} />
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Plate Discipline</p>
          <div className="flex flex-wrap gap-2">
            <StatCell label="BB" value={s.baseOnBalls} color={SC(s.baseOnBalls ?? 0, 20, 50, 80)} />
            <StatCell label="K" value={s.strikeOuts} color={SC(s.strikeOuts ?? 0, 80, 120, 160, true)} />
            <StatCell label="IBB" value={s.intentionalWalks} />
            <StatCell label="HBP" value={s.hitByPitch} />
            <StatCell label="GIDP" value={s.groundIntoDoublePlay} color={SC(s.groundIntoDoublePlay ?? 0, 5, 10, 20, true)} />
            <StatCell label="BABIP" value={s.babip} color={SC(parseFloat(s.babip ?? "0"), 0.260, 0.300, 0.340)} />
            <StatCell label="G" value={s.gamesPlayed} />
            <StatCell label="AB" value={s.atBats} />
            <StatCell label="H" value={s.hits} />
            <StatCell label="PA" value={s.plateAppearances} />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="situational">
        {splits ? (
          <SituationPanel splits={splits} />
        ) : (
          <p className="text-gray-500 text-sm">Loading split data...</p>
        )}
      </TabsContent>
      <TabsContent value="career" className="space-y-4">
        {stats.career ? (
          <div>
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Career Totals</p>
            <div className="flex flex-wrap gap-2">
              <StatCell label="AVG" value={stats.career.avg} />
              <StatCell label="OBP" value={stats.career.obp} />
              <StatCell label="SLG" value={stats.career.slg} />
              <StatCell label="OPS" value={stats.career.ops} />
              <StatCell label="HR" value={stats.career.homeRuns} />
              <StatCell label="RBI" value={stats.career.rbi} />
              <StatCell label="R" value={stats.career.runs} />
              <StatCell label="H" value={stats.career.hits} />
              <StatCell label="SB" value={stats.career.stolenBases} />
              <StatCell label="BB" value={stats.career.baseOnBalls} />
              <StatCell label="K" value={stats.career.strikeOuts} />
              <StatCell label="G" value={stats.career.gamesPlayed} />
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No career data available.</p>
        )}
      </TabsContent>
    </Tabs>
  );
}

function PitcherStatsPanel({ stats }: { stats: { season?: PitchingStat; career?: PitchingStat } }) {
  const s = stats.season;
  if (!s) return <p className="text-gray-500 text-sm">No stats available for current season.</p>;
  const era = parseFloat(s.era ?? "99");
  const whip = parseFloat(s.whip ?? "99");

  return (
    <Tabs defaultValue="standard">
      <TabsList className="bg-white/5 border border-white/10 mb-4 w-full">
        <TabsTrigger value="standard" className="flex-1 data-[state=active]:bg-red-600/30 data-[state=active]:text-red-300 text-xs">Standard</TabsTrigger>
        <TabsTrigger value="career" className="flex-1 data-[state=active]:bg-red-600/30 data-[state=active]:text-red-300 text-xs">Career</TabsTrigger>
      </TabsList>
      <TabsContent value="standard" className="space-y-4">
        <div>
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Standard</p>
          <div className="flex flex-wrap gap-2">
            <StatCell label="ERA" value={s.era} color={SC(era, 2.5, 3.5, 5.0, true)} />
            <StatCell label="WHIP" value={s.whip} color={SC(whip, 1.0, 1.25, 1.50, true)} />
            <StatCell label="W" value={s.wins} color={SC(s.wins ?? 0, 5, 10, 15)} />
            <StatCell label="L" value={s.losses} />
            <StatCell label="SV" value={s.saves} />
            <StatCell label="HLD" value={s.holds} />
            <StatCell label="BS" value={s.blownSaves} />
            <StatCell label="QS" value={s.qualityStarts} color={SC(s.qualityStarts ?? 0, 5, 10, 18)} />
            <StatCell label="CG" value={s.completeGames} />
            <StatCell label="G" value={s.gamesPlayed} />
            <StatCell label="GS" value={s.gamesStarted} />
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Peripherals</p>
          <div className="flex flex-wrap gap-2">
            <StatCell label="K" value={s.strikeOuts} color={SC(s.strikeOuts ?? 0, 50, 120, 200)} />
            <StatCell label="BB" value={s.baseOnBalls} color={SC(s.baseOnBalls ?? 0, 20, 50, 80, true)} />
            <StatCell label="K/9" value={s.strikeoutsPer9Inn} color={SC(parseFloat(s.strikeoutsPer9Inn ?? "0"), 6, 8, 10)} />
            <StatCell label="BB/9" value={s.walksPer9Inn} color={SC(parseFloat(s.walksPer9Inn ?? "0"), 1.5, 3.0, 4.5, true)} />
            <StatCell label="K/BB" value={s.strikeoutWalkRatio} color={SC(parseFloat(s.strikeoutWalkRatio ?? "0"), 1.5, 2.5, 4.0)} />
            <StatCell label="HR" value={s.homeRuns} color={SC(s.homeRuns ?? 0, 10, 20, 35, true)} />
            <StatCell label="H" value={s.hits} />
            <StatCell label="ER" value={s.earnedRuns} />
            <StatCell label="HBP" value={s.hitBatsmen} />
            <StatCell label="IP" value={s.inningsPitched} />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="career" className="space-y-4">
        {stats.career ? (
          <div>
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Career Totals</p>
            <div className="flex flex-wrap gap-2">
              <StatCell label="ERA" value={stats.career.era} />
              <StatCell label="WHIP" value={stats.career.whip} />
              <StatCell label="W" value={stats.career.wins} />
              <StatCell label="L" value={stats.career.losses} />
              <StatCell label="K" value={stats.career.strikeOuts} />
              <StatCell label="SV" value={stats.career.saves} />
              <StatCell label="IP" value={stats.career.inningsPitched} />
              <StatCell label="G" value={stats.career.gamesPlayed} />
              <StatCell label="GS" value={stats.career.gamesStarted} />
              <StatCell label="QS" value={stats.career.qualityStarts} />
              <StatCell label="CG" value={stats.career.completeGames} />
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No career data available.</p>
        )}
      </TabsContent>
    </Tabs>
  );
}

function PlayerModal({ player, onClose }: { player: RosterPlayer | null; onClose: () => void }) {
  const isPitcher = player?.position.type === "Pitcher";
  const group = isPitcher ? "pitching" : "hitting";

  const { data, isLoading } = useQuery({
    queryKey: ["player", player?.person.id, group],
    queryFn: async () => {
      if (!player) return null;
      const res = await fetch(`/api/mlb/player/${player.person.id}?group=${group}`);
      return res.json();
    },
    enabled: !!player,
  });

  if (!player) return null;

  const personInfo = data?.person?.people?.[0];
  const seasonStats = data?.seasonStats?.stats?.[0]?.splits?.[0]?.stat;
  const careerStats = data?.careerStats?.stats?.[0]?.splits?.[0]?.stat;
  const rawSplits: Array<{ split?: { code: string; description: string }; stat: HittingStat }> = data?.splits?.stats?.[0]?.splits ?? [];

  return (
    <Dialog open={!!player} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#1a2a1a] border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getPlayerHeadshotUrl(player.person.id)} alt={player.person.fullName} width={64} height={64}
              className="rounded-full object-cover border-2 border-red-600/50"
              onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='32' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='28' fill='%23666'%3E⚾%3C/text%3E%3C/svg%3E"; }} />
            <div>
              <div className="text-xl font-bold text-white">{player.person.fullName}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs border-white/20 text-gray-300">{player.position.abbreviation}</Badge>
                {player.jerseyNumber && <span className="text-sm text-gray-400">#{player.jerseyNumber}</span>}
                {personInfo && (
                  <>
                    {personInfo.height && <span className="text-xs text-gray-500">{personInfo.height}</span>}
                    {personInfo.weight && <span className="text-xs text-gray-500">{personInfo.weight}lb</span>}
                    {personInfo.batSide && <span className="text-xs text-gray-400">Bats {personInfo.batSide.code}</span>}
                    {personInfo.pitchHand && <span className="text-xs text-gray-400">Throws {personInfo.pitchHand.code}</span>}
                    {personInfo.birthDate && <span className="text-xs text-gray-500">DOB {personInfo.birthDate}</span>}
                  </>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400 animate-pulse">Loading stats...</div>
          </div>
        ) : (
          <div className="mt-2">
            {isPitcher ? (
              <PitcherStatsPanel stats={{ season: seasonStats, career: careerStats }} />
            ) : (
              <HitterStatsPanel stats={{ season: seasonStats, career: careerStats }} splits={rawSplits} />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Sortable table header ────────────────────────────────────────────────────
function SortTh({ col, label, sortCol, sortDir, onSort }: {
  col: string; label: string; sortCol: string; sortDir: "asc" | "desc";
  onSort: (c: string) => void;
}) {
  const active = sortCol === col;
  return (
    <th
      onClick={() => onSort(col)}
      className="px-2 py-2 text-xs text-gray-400 uppercase whitespace-nowrap cursor-pointer select-none hover:text-white transition-colors"
    >
      <span className="flex items-center gap-1">
        {label}
        {active ? (sortDir === "desc" ? " ↓" : " ↑") : <span className="opacity-30"> ↕</span>}
      </span>
    </th>
  );
}

// ─── Hitter table row ─────────────────────────────────────────────────────────
function hitterVal(stat: HittingStat | undefined, col: string): number | string {
  if (!stat) return -Infinity;
  const map: Record<string, keyof HittingStat> = {
    avg: "avg", obp: "obp", slg: "slg", ops: "ops", hr: "homeRuns", rbi: "rbi",
    r: "runs", h: "hits", sb: "stolenBases", bb: "baseOnBalls", k: "strikeOuts",
    g: "gamesPlayed", pa: "plateAppearances", doubles: "doubles", triples: "triples",
    tb: "totalBases", babip: "babip", gidp: "groundIntoDoublePlay",
  };
  const key = map[col];
  if (!key) return -Infinity;
  const v = stat[key];
  if (v === undefined || v === null) return -Infinity;
  return typeof v === "string" ? parseFloat(v) : (v as number);
}

function pitcherVal(stat: PitchingStat | undefined, col: string): number {
  if (!stat) return -Infinity;
  const map: Record<string, keyof PitchingStat> = {
    era: "era", whip: "whip", w: "wins", l: "losses", sv: "saves", hld: "holds",
    bs: "blownSaves", qs: "qualityStarts", k: "strikeOuts", bb: "baseOnBalls",
    k9: "strikeoutsPer9Inn", bb9: "walksPer9Inn", g: "gamesPlayed", gs: "gamesStarted",
    ip: "inningsPitched", hr: "homeRuns", cg: "completeGames",
  };
  const key = map[col];
  if (!key) return -Infinity;
  const v = stat[key];
  if (v === undefined || v === null) return -Infinity;
  return typeof v === "string" ? parseFloat(v) : (v as number);
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TeamWarRoomClient({ teams }: { teams: MLBTeam[] }) {
  const [selectedTeamId, setSelectedTeamId] = useState<number>(147);
  const [selectedPlayer, setSelectedPlayer] = useState<RosterPlayer | null>(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [sortCol, setSortCol] = useState<string>("avg");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const team = teams.find((t) => t.id === selectedTeamId);

  const { data: rosterData, isLoading: rosterLoading } = useQuery({
    queryKey: ["roster", selectedTeamId],
    queryFn: async () => {
      const res = await fetch(`/api/mlb/roster/${selectedTeamId}`);
      return res.json();
    },
  });

  const roster: RosterPlayer[] = rosterData?.roster ?? [];
  const pitchers = roster.filter((p) => p.position.type === "Pitcher");
  const hitters = roster.filter((p) => p.position.type !== "Pitcher");

  // Batch-fetch stats for table view
  const hitterQueries = useQueries({
    queries: hitters.map((p) => ({
      queryKey: ["player-table", p.person.id, "hitting"],
      queryFn: async () => {
        const res = await fetch(`/api/mlb/player/${p.person.id}?group=hitting`);
        return res.json();
      },
      staleTime: 1800000,
      enabled: viewMode === "table" && hitters.length > 0,
    })),
  });

  const pitcherQueries = useQueries({
    queries: pitchers.map((p) => ({
      queryKey: ["player-table", p.person.id, "pitching"],
      queryFn: async () => {
        const res = await fetch(`/api/mlb/player/${p.person.id}?group=pitching`);
        return res.json();
      },
      staleTime: 1800000,
      enabled: viewMode === "table" && pitchers.length > 0,
    })),
  });

  const hitterStatsMap = useMemo(() => {
    const m: Record<number, HittingStat | undefined> = {};
    hitters.forEach((p, i) => {
      m[p.person.id] = hitterQueries[i]?.data?.seasonStats?.stats?.[0]?.splits?.[0]?.stat;
    });
    return m;
  }, [hitters, hitterQueries]);

  const pitcherStatsMap = useMemo(() => {
    const m: Record<number, PitchingStat | undefined> = {};
    pitchers.forEach((p, i) => {
      m[p.person.id] = pitcherQueries[i]?.data?.seasonStats?.stats?.[0]?.splits?.[0]?.stat;
    });
    return m;
  }, [pitchers, pitcherQueries]);

  const hitterTableLoading = hitterQueries.some((q) => q.isLoading);
  const pitcherTableLoading = pitcherQueries.some((q) => q.isLoading);

  function handleSort(col: string) {
    if (sortCol === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  }

  function sortHitters(list: RosterPlayer[]) {
    return [...list].sort((a, b) => {
      const av = hitterVal(hitterStatsMap[a.person.id], sortCol);
      const bv = hitterVal(hitterStatsMap[b.person.id], sortCol);
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "desc" ? bv - av : av - bv;
      }
      return a.person.fullName.localeCompare(b.person.fullName);
    });
  }

  function sortPitchers(list: RosterPlayer[]) {
    const invertCols = ["era", "whip", "bb", "hr", "l", "bs", "bb9"];
    return [...list].sort((a, b) => {
      let av = pitcherVal(pitcherStatsMap[a.person.id], sortCol);
      let bv = pitcherVal(pitcherStatsMap[b.person.id], sortCol);
      if (invertCols.includes(sortCol)) { av = -av; bv = -bv; }
      if (isFinite(av) && isFinite(bv)) return sortDir === "desc" ? bv - av : av - bv;
      return a.person.fullName.localeCompare(b.person.fullName);
    });
  }

  const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name));
  const alTeams = sortedTeams.filter((t) => t.league === "AL");
  const nlTeams = sortedTeams.filter((t) => t.league === "NL");

  const filteredHitters = hitters.filter((p) => p.person.fullName.toLowerCase().includes(search.toLowerCase()));
  const filteredPitchers = pitchers.filter((p) => p.person.fullName.toLowerCase().includes(search.toLowerCase()));

  // ─── Hitter table columns ─────────────────────────────────────────────────
  const HITTER_COLS = [
    { col: "g", label: "G" }, { col: "pa", label: "PA" }, { col: "avg", label: "AVG" },
    { col: "obp", label: "OBP" }, { col: "slg", label: "SLG" }, { col: "ops", label: "OPS" },
    { col: "h", label: "H" }, { col: "hr", label: "HR" }, { col: "rbi", label: "RBI" },
    { col: "r", label: "R" }, { col: "sb", label: "SB" }, { col: "doubles", label: "2B" },
    { col: "triples", label: "3B" }, { col: "tb", label: "TB" }, { col: "bb", label: "BB" },
    { col: "k", label: "K" }, { col: "babip", label: "BABIP" }, { col: "gidp", label: "GIDP" },
  ];
  const PITCHER_COLS = [
    { col: "g", label: "G" }, { col: "gs", label: "GS" }, { col: "ip", label: "IP" },
    { col: "era", label: "ERA" }, { col: "whip", label: "WHIP" }, { col: "w", label: "W" },
    { col: "l", label: "L" }, { col: "sv", label: "SV" }, { col: "hld", label: "HLD" },
    { col: "bs", label: "BS" }, { col: "qs", label: "QS" }, { col: "k", label: "K" },
    { col: "bb", label: "BB" }, { col: "k9", label: "K/9" }, { col: "bb9", label: "BB/9" },
    { col: "hr", label: "HR" }, { col: "cg", label: "CG" },
  ];

  function fmtStat(v: number | string | undefined, col: string) {
    if (v === undefined || v === null || v === -Infinity) return "—";
    if (typeof v === "string") return v;
    if (["avg", "obp", "slg", "ops", "babip"].includes(col)) return v.toFixed(3).replace(/^0/, "");
    if (["era", "whip", "k9", "bb9"].includes(col)) return v.toFixed(2);
    if (col === "ip") return v.toFixed(1);
    return v.toString();
  }

  function statColor(v: number, col: string) {
    const colorMap: Record<string, [number, number, number, boolean?]> = {
      avg: [0.220, 0.260, 0.300], obp: [0.300, 0.330, 0.370], slg: [0.380, 0.440, 0.500],
      ops: [0.680, 0.750, 0.850], hr: [5, 15, 25], rbi: [30, 60, 90], r: [30, 60, 80],
      sb: [5, 15, 25], bb: [15, 40, 70], k: [60, 90, 130, true],
      era: [2.5, 3.5, 5.0, true], whip: [1.0, 1.25, 1.50, true],
      w: [3, 8, 12], k9: [6, 8, 10], bb9: [1.5, 3.0, 4.5, true], sv: [5, 15, 30],
      qs: [3, 8, 15], gidp: [3, 8, 15, true],
    };
    const cfg = colorMap[col];
    if (!cfg) return "text-gray-200";
    return SC(v, cfg[0], cfg[1], cfg[2], cfg[3]);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black">⚾ Team War Room</h1>
          <p className="text-gray-400 text-sm mt-1">Full roster analytics — stats, splits, situational data</p>
        </div>
        <div className="flex items-center gap-3">
          {team && <img src={getTeamLogoUrl(team.id)} alt={team.name} width={40} height={40} className="object-contain" />}
          <Select value={selectedTeamId.toString()} onValueChange={(v) => { if (v) setSelectedTeamId(Number(v)); }}>
            <SelectTrigger className="w-52 bg-white/5 border-white/10"><SelectValue placeholder="Select team" /></SelectTrigger>
            <SelectContent className="bg-[#1a2a1a] border-white/10 max-h-80">
              <div className="px-2 py-1 text-xs text-gray-400 font-semibold">American League</div>
              {alTeams.map((t) => <SelectItem key={t.id} value={t.id.toString()} className="text-white hover:bg-white/10">{t.name}</SelectItem>)}
              <div className="px-2 py-1 text-xs text-gray-400 font-semibold mt-1">National League</div>
              {nlTeams.map((t) => <SelectItem key={t.id} value={t.id.toString()} className="text-white hover:bg-white/10">{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Team header */}
      {team && (
        <div className="rounded-xl border border-white/10 p-5 mb-6 flex items-center gap-5"
          style={{ background: `linear-gradient(135deg, ${team.primaryColor}30, transparent)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={getTeamLogoUrl(team.id)} alt={team.name} width={72} height={72} className="object-contain" />
          <div>
            <h2 className="text-2xl font-black text-white">{team.name}</h2>
            <p className="text-gray-400 text-sm">{team.division} · {team.league}</p>
            <div className="flex gap-2 mt-2">
              <Badge className="text-xs" style={{ background: team.primaryColor + "80", color: "white", border: "none" }}>{pitchers.length} Pitchers</Badge>
              <Badge className="text-xs" style={{ background: team.secondaryColor + "80", color: "white", border: "none" }}>{hitters.length} Position Players</Badge>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input placeholder="Search player..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 max-w-44" />
        <div className="flex rounded-md overflow-hidden border border-white/10 ml-auto">
          <button onClick={() => setViewMode("grid")}
            className={`px-3 py-2 text-xs font-medium transition ${viewMode === "grid" ? "bg-red-600/30 text-red-300" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
            ⊞ Cards
          </button>
          <button onClick={() => setViewMode("table")}
            className={`px-3 py-2 text-xs font-medium transition ${viewMode === "table" ? "bg-red-600/30 text-red-300" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
            ≡ Table
          </button>
        </div>
      </div>

      <Tabs defaultValue="hitters">
        <TabsList className="bg-white/5 border border-white/10 mb-4">
          <TabsTrigger value="hitters" className="data-[state=active]:bg-red-600/30 data-[state=active]:text-red-300">Hitters ({hitters.length})</TabsTrigger>
          <TabsTrigger value="pitchers" className="data-[state=active]:bg-red-600/30 data-[state=active]:text-red-300">Pitchers ({pitchers.length})</TabsTrigger>
        </TabsList>

        {rosterLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-20 rounded-lg bg-white/5 animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* ── HITTERS ── */}
            <TabsContent value="hitters">
              {viewMode === "grid" ? (
                <RosterGrid players={filteredHitters} onSelect={setSelectedPlayer} />
              ) : (
                <>
                  {hitterTableLoading && (
                    <div className="text-xs text-gray-500 mb-2 animate-pulse">
                      Loading stats for {filteredHitters.length} players...
                    </div>
                  )}
                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                          <th className="text-left px-3 py-2 text-gray-400 font-semibold sticky left-0 bg-[#1a2a1a] z-10 min-w-[160px]">Player</th>
                          <th className="text-left px-2 py-2 text-gray-400">Pos</th>
                          {HITTER_COLS.map((c) => (
                            <SortTh key={c.col} col={c.col} label={c.label} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sortHitters(filteredHitters).map((player) => {
                          const s = hitterStatsMap[player.person.id];
                          return (
                            <tr key={player.person.id} onClick={() => setSelectedPlayer(player)}
                              className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                              <td className="px-3 py-2 sticky left-0 bg-[#0f1a0f] hover:bg-[#1a2a1a] z-10">
                                <div className="flex items-center gap-2">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={getPlayerHeadshotUrl(player.person.id)} alt="" width={24} height={24}
                                    className="rounded-full object-cover border border-white/10"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                  <span className="font-medium text-white whitespace-nowrap">{player.person.fullName}</span>
                                </div>
                              </td>
                              <td className="px-2 py-2">
                                <Badge className="text-xs px-1.5 py-0" style={{ background: "#3b82f630", color: "#93c5fd", border: "none" }}>
                                  {player.position.abbreviation}
                                </Badge>
                              </td>
                              {HITTER_COLS.map((c) => {
                                const raw = hitterVal(s, c.col);
                                const display = fmtStat(typeof raw === "number" ? raw : undefined, c.col);
                                const color = typeof raw === "number" && isFinite(raw) ? statColor(raw, c.col) : "text-gray-500";
                                return (
                                  <td key={c.col} className={`px-2 py-2 text-right font-mono ${color}`}>
                                    {display}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </TabsContent>

            {/* ── PITCHERS ── */}
            <TabsContent value="pitchers">
              {viewMode === "grid" ? (
                <RosterGrid players={filteredPitchers} onSelect={setSelectedPlayer} />
              ) : (
                <>
                  {pitcherTableLoading && (
                    <div className="text-xs text-gray-500 mb-2 animate-pulse">
                      Loading stats for {filteredPitchers.length} pitchers...
                    </div>
                  )}
                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                          <th className="text-left px-3 py-2 text-gray-400 font-semibold sticky left-0 bg-[#1a2a1a] z-10 min-w-[160px]">Player</th>
                          <th className="text-left px-2 py-2 text-gray-400">Pos</th>
                          {PITCHER_COLS.map((c) => (
                            <SortTh key={c.col} col={c.col} label={c.label} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sortPitchers(filteredPitchers).map((player) => {
                          const s = pitcherStatsMap[player.person.id];
                          return (
                            <tr key={player.person.id} onClick={() => setSelectedPlayer(player)}
                              className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                              <td className="px-3 py-2 sticky left-0 bg-[#0f1a0f] hover:bg-[#1a2a1a] z-10">
                                <div className="flex items-center gap-2">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={getPlayerHeadshotUrl(player.person.id)} alt="" width={24} height={24}
                                    className="rounded-full object-cover border border-white/10"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                  <span className="font-medium text-white whitespace-nowrap">{player.person.fullName}</span>
                                </div>
                              </td>
                              <td className="px-2 py-2">
                                <Badge className="text-xs px-1.5 py-0" style={{ background: "#dc262630", color: "#f87171", border: "none" }}>
                                  {player.position.abbreviation}
                                </Badge>
                              </td>
                              {PITCHER_COLS.map((c) => {
                                const raw = pitcherVal(s, c.col);
                                const display = fmtStat(isFinite(raw) ? raw : undefined, c.col);
                                const color = isFinite(raw) ? statColor(raw, c.col) : "text-gray-500";
                                return (
                                  <td key={c.col} className={`px-2 py-2 text-right font-mono ${color}`}>
                                    {display}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>

      <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
    </div>
  );
}

function RosterGrid({ players, onSelect }: { players: RosterPlayer[]; onSelect: (p: RosterPlayer) => void }) {
  if (players.length === 0) return <p className="text-gray-500 text-sm py-4">No players found.</p>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {players.map((player) => {
        const isPitcher = player.position.type === "Pitcher";
        return (
          <button key={player.person.id} onClick={() => onSelect(player)}
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-left transition hover:border-red-600/40 hover:bg-red-600/10 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getPlayerHeadshotUrl(player.person.id)} alt={player.person.fullName} width={44} height={44}
              className="rounded-full object-cover border border-white/10 flex-shrink-0"
              onError={(e) => { const t = e.target as HTMLImageElement; t.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'%3E%3Ccircle cx='22' cy='22' r='22' fill='%231a2a1a'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='18' fill='%23444'%3E⚾%3C/text%3E%3C/svg%3E"; }} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white text-sm truncate group-hover:text-red-300 transition-colors">{player.person.fullName}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge className="text-xs px-1.5 py-0" style={{ background: isPitcher ? "#dc262630" : "#3b82f630", color: isPitcher ? "#f87171" : "#93c5fd", border: "none" }}>
                  {player.position.abbreviation}
                </Badge>
                {player.jerseyNumber && <span className="text-xs text-gray-500">#{player.jerseyNumber}</span>}
                {player.status.code !== "A" && <Badge className="text-xs px-1.5 py-0 bg-yellow-500/20 text-yellow-400 border-none">{player.status.code}</Badge>}
              </div>
            </div>
            <span className="text-gray-600 group-hover:text-red-400 transition-colors text-xs">→</span>
          </button>
        );
      })}
    </div>
  );
}
