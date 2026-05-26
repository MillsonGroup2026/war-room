"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}

const STAT_COLOR = (val: number, low: number, mid: number, high: number, invert = false) => {
  if (invert) {
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

function HitterStatsPanel({ stats, splits }: { stats: { season?: HittingStat; career?: HittingStat }; splits?: { vsLeft?: HittingStat; vsRight?: HittingStat } }) {
  const s = stats.season;
  if (!s) return <p className="text-gray-500 text-sm">No stats available for current season.</p>;

  const avg = parseFloat(s.avg ?? "0");
  const obp = parseFloat(s.obp ?? "0");
  const slg = parseFloat(s.slg ?? "0");
  const ops = parseFloat(s.ops ?? "0");

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Standard</p>
        <div className="flex flex-wrap gap-2">
          <StatCell label="AVG" value={s.avg} color={STAT_COLOR(avg, 0.220, 0.260, 0.300)} />
          <StatCell label="OBP" value={s.obp} color={STAT_COLOR(obp, 0.300, 0.330, 0.370)} />
          <StatCell label="SLG" value={s.slg} color={STAT_COLOR(slg, 0.380, 0.440, 0.500)} />
          <StatCell label="OPS" value={s.ops} color={STAT_COLOR(ops, 0.680, 0.750, 0.850)} />
          <StatCell label="HR" value={s.homeRuns} color={STAT_COLOR(s.homeRuns ?? 0, 10, 20, 30)} />
          <StatCell label="RBI" value={s.rbi} color={STAT_COLOR(s.rbi ?? 0, 40, 70, 100)} />
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
          <StatCell label="BB" value={s.baseOnBalls} color={STAT_COLOR(s.baseOnBalls ?? 0, 20, 50, 80)} />
          <StatCell label="K" value={s.strikeOuts} color={STAT_COLOR(s.strikeOuts ?? 0, 80, 120, 160, true)} />
          <StatCell label="IBB" value={s.intentionalWalks} />
          <StatCell label="HBP" value={s.hitByPitch} />
          <StatCell label="GIDP" value={s.groundIntoDoublePlay} color={STAT_COLOR(s.groundIntoDoublePlay ?? 0, 5, 10, 20, true)} />
          <StatCell label="BABIP" value={s.babip} color={STAT_COLOR(parseFloat(s.babip ?? "0"), 0.260, 0.300, 0.340)} />
          <StatCell label="G" value={s.gamesPlayed} />
          <StatCell label="AB" value={s.atBats} />
          <StatCell label="H" value={s.hits} />
          <StatCell label="PA" value={s.plateAppearances} />
        </div>
      </div>
      {splits && (splits.vsLeft || splits.vsRight) && (
        <div>
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Splits</p>
          <div className="grid grid-cols-2 gap-3">
            {splits.vsLeft && (
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-xs text-blue-400 font-semibold mb-2">vs LHP</p>
                <div className="flex gap-2 flex-wrap">
                  <StatCell label="AVG" value={(splits.vsLeft as HittingStat).avg} />
                  <StatCell label="OPS" value={(splits.vsLeft as HittingStat).ops} />
                  <StatCell label="HR" value={(splits.vsLeft as HittingStat).homeRuns} />
                </div>
              </div>
            )}
            {splits.vsRight && (
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-xs text-red-400 font-semibold mb-2">vs RHP</p>
                <div className="flex gap-2 flex-wrap">
                  <StatCell label="AVG" value={(splits.vsRight as HittingStat).avg} />
                  <StatCell label="OPS" value={(splits.vsRight as HittingStat).ops} />
                  <StatCell label="HR" value={(splits.vsRight as HittingStat).homeRuns} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {stats.career && (
        <div>
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Career Totals</p>
          <div className="flex flex-wrap gap-2">
            <StatCell label="AVG" value={stats.career.avg} />
            <StatCell label="OBP" value={stats.career.obp} />
            <StatCell label="SLG" value={stats.career.slg} />
            <StatCell label="OPS" value={stats.career.ops} />
            <StatCell label="HR" value={stats.career.homeRuns} />
            <StatCell label="RBI" value={stats.career.rbi} />
            <StatCell label="G" value={stats.career.gamesPlayed} />
          </div>
        </div>
      )}
    </div>
  );
}

function PitcherStatsPanel({ stats }: { stats: { season?: PitchingStat; career?: PitchingStat } }) {
  const s = stats.season;
  if (!s) return <p className="text-gray-500 text-sm">No stats available for current season.</p>;

  const era = parseFloat(s.era ?? "99");
  const whip = parseFloat(s.whip ?? "99");

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Standard</p>
        <div className="flex flex-wrap gap-2">
          <StatCell label="ERA" value={s.era} color={STAT_COLOR(era, 2.5, 3.5, 5.0, true)} />
          <StatCell label="WHIP" value={s.whip} color={STAT_COLOR(whip, 1.0, 1.25, 1.50, true)} />
          <StatCell label="W" value={s.wins} color={STAT_COLOR(s.wins ?? 0, 5, 10, 15)} />
          <StatCell label="L" value={s.losses} />
          <StatCell label="SV" value={s.saves} />
          <StatCell label="HLD" value={s.holds} />
          <StatCell label="BS" value={s.blownSaves} />
          <StatCell label="QS" value={s.qualityStarts} color={STAT_COLOR(s.qualityStarts ?? 0, 5, 10, 18)} />
          <StatCell label="CG" value={s.completeGames} />
          <StatCell label="G" value={s.gamesPlayed} />
          <StatCell label="GS" value={s.gamesStarted} />
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Peripherals</p>
        <div className="flex flex-wrap gap-2">
          <StatCell label="K" value={s.strikeOuts} color={STAT_COLOR(s.strikeOuts ?? 0, 50, 120, 200)} />
          <StatCell label="BB" value={s.baseOnBalls} color={STAT_COLOR(s.baseOnBalls ?? 0, 20, 50, 80, true)} />
          <StatCell label="K/9" value={s.strikeoutsPer9Inn} color={STAT_COLOR(parseFloat(s.strikeoutsPer9Inn ?? "0"), 6, 8, 10)} />
          <StatCell label="BB/9" value={s.walksPer9Inn} color={STAT_COLOR(parseFloat(s.walksPer9Inn ?? "0"), 1.5, 3.0, 4.5, true)} />
          <StatCell label="K/BB" value={s.strikeoutWalkRatio} color={STAT_COLOR(parseFloat(s.strikeoutWalkRatio ?? "0"), 1.5, 2.5, 4.0)} />
          <StatCell label="HR" value={s.homeRuns} color={STAT_COLOR(s.homeRuns ?? 0, 10, 20, 35, true)} />
          <StatCell label="H" value={s.hits} />
          <StatCell label="ER" value={s.earnedRuns} />
          <StatCell label="IP" value={s.inningsPitched} />
        </div>
      </div>
      {stats.career && (
        <div>
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Career Totals</p>
          <div className="flex flex-wrap gap-2">
            <StatCell label="ERA" value={stats.career.era} />
            <StatCell label="WHIP" value={stats.career.whip} />
            <StatCell label="W" value={stats.career.wins} />
            <StatCell label="K" value={stats.career.strikeOuts} />
            <StatCell label="SV" value={stats.career.saves} />
            <StatCell label="IP" value={stats.career.inningsPitched} />
            <StatCell label="G" value={stats.career.gamesPlayed} />
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerModal({
  player,
  teamId,
  onClose,
}: {
  player: RosterPlayer | null;
  teamId: number;
  onClose: () => void;
}) {
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
  const rawSplits = data?.splits?.stats?.[0]?.splits ?? [];
  const splits = {
    vsLeft: rawSplits.find((s: { split?: { code: string } }) => s.split?.code === "vl")?.stat,
    vsRight: rawSplits.find((s: { split?: { code: string } }) => s.split?.code === "vr")?.stat,
  };

  return (
    <Dialog open={!!player} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#1a2a1a] border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getPlayerHeadshotUrl(player.person.id)}
              alt={player.person.fullName}
              width={64}
              height={64}
              className="rounded-full object-cover border-2 border-red-600/50"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='32' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='28' fill='%23666'%3E⚾%3C/text%3E%3C/svg%3E";
              }}
            />
            <div>
              <div className="text-xl font-bold text-white">{player.person.fullName}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                  {player.position.abbreviation}
                </Badge>
                {player.jerseyNumber && (
                  <span className="text-sm text-gray-400">#{player.jerseyNumber}</span>
                )}
                {personInfo && (
                  <>
                    {personInfo.height && <span className="text-xs text-gray-500">{personInfo.height}</span>}
                    {personInfo.weight && <span className="text-xs text-gray-500">{personInfo.weight}lb</span>}
                    {personInfo.batSide && <span className="text-xs text-gray-400">Bats {personInfo.batSide.code}</span>}
                    {personInfo.pitchHand && <span className="text-xs text-gray-400">Throws {personInfo.pitchHand.code}</span>}
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
              <HitterStatsPanel stats={{ season: seasonStats, career: careerStats }} splits={splits} />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

const POSITION_TYPES = ["All", "Pitcher", "Infielder", "Outfielder", "Catcher", "Hitter"];

export default function TeamWarRoomClient({ teams }: { teams: MLBTeam[] }) {
  const [selectedTeamId, setSelectedTeamId] = useState<number>(147); // Yankees default
  const [selectedPlayer, setSelectedPlayer] = useState<RosterPlayer | null>(null);
  const [posFilter, setPosFilter] = useState("All");
  const [search, setSearch] = useState("");

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

  const filteredRoster = roster.filter((p) => {
    const matchesSearch = p.person.fullName.toLowerCase().includes(search.toLowerCase());
    if (posFilter === "All") return matchesSearch;
    if (posFilter === "Pitcher") return p.position.type === "Pitcher" && matchesSearch;
    if (posFilter === "Hitter") return p.position.type !== "Pitcher" && matchesSearch;
    return p.position.type === posFilter && matchesSearch;
  });

  const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name));
  const alTeams = sortedTeams.filter((t) => t.league === "AL");
  const nlTeams = sortedTeams.filter((t) => t.league === "NL");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black">⚾ Team War Room</h1>
          <p className="text-gray-400 text-sm mt-1">Full roster analytics — stats, splits, and trade value</p>
        </div>
        <div className="flex items-center gap-3">
          {team && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={getTeamLogoUrl(team.id)} alt={team.name} width={40} height={40} className="object-contain" />
          )}
          <Select value={selectedTeamId.toString()} onValueChange={(v) => setSelectedTeamId(Number(v))}>
            <SelectTrigger className="w-52 bg-white/5 border-white/10">
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2a1a] border-white/10 max-h-80">
              <div className="px-2 py-1 text-xs text-gray-400 font-semibold">American League</div>
              {alTeams.map((t) => (
                <SelectItem key={t.id} value={t.id.toString()} className="text-white hover:bg-white/10">
                  {t.name}
                </SelectItem>
              ))}
              <div className="px-2 py-1 text-xs text-gray-400 font-semibold mt-1">National League</div>
              {nlTeams.map((t) => (
                <SelectItem key={t.id} value={t.id.toString()} className="text-white hover:bg-white/10">
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Team header */}
      {team && (
        <div
          className="rounded-xl border border-white/10 p-5 mb-6 flex items-center gap-5"
          style={{ background: `linear-gradient(135deg, ${team.primaryColor}30, transparent)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={getTeamLogoUrl(team.id)} alt={team.name} width={72} height={72} className="object-contain" />
          <div>
            <h2 className="text-2xl font-black text-white">{team.name}</h2>
            <p className="text-gray-400 text-sm">{team.division} · {team.league}</p>
            <div className="flex gap-2 mt-2">
              <Badge className="text-xs" style={{ background: team.primaryColor + "80", color: "white", border: "none" }}>
                {pitchers.length} Pitchers
              </Badge>
              <Badge className="text-xs" style={{ background: team.secondaryColor + "80", color: "white", border: "none" }}>
                {hitters.length} Position Players
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Roster tabs */}
      <Tabs defaultValue="hitters">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="hitters" className="data-[state=active]:bg-red-600/30 data-[state=active]:text-red-300">
              Hitters ({hitters.length})
            </TabsTrigger>
            <TabsTrigger value="pitchers" className="data-[state=active]:bg-red-600/30 data-[state=active]:text-red-300">
              Pitchers ({pitchers.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-red-600/30 data-[state=active]:text-red-300">
              All
            </TabsTrigger>
          </TabsList>
          <Input
            placeholder="Search player..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 max-w-48"
          />
        </div>

        {rosterLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <TabsContent value="hitters">
              <RosterGrid
                players={hitters.filter((p) => p.person.fullName.toLowerCase().includes(search.toLowerCase()))}
                onSelect={setSelectedPlayer}
              />
            </TabsContent>
            <TabsContent value="pitchers">
              <RosterGrid
                players={pitchers.filter((p) => p.person.fullName.toLowerCase().includes(search.toLowerCase()))}
                onSelect={setSelectedPlayer}
              />
            </TabsContent>
            <TabsContent value="all">
              <RosterGrid
                players={filteredRoster}
                onSelect={setSelectedPlayer}
              />
            </TabsContent>
          </>
        )}
      </Tabs>

      <PlayerModal
        player={selectedPlayer}
        teamId={selectedTeamId}
        onClose={() => setSelectedPlayer(null)}
      />
    </div>
  );
}

function RosterGrid({
  players,
  onSelect,
}: {
  players: RosterPlayer[];
  onSelect: (p: RosterPlayer) => void;
}) {
  if (players.length === 0) {
    return <p className="text-gray-500 text-sm py-4">No players found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {players.map((player) => {
        const isPitcher = player.position.type === "Pitcher";
        return (
          <button
            key={player.person.id}
            onClick={() => onSelect(player)}
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-left transition hover:border-red-600/40 hover:bg-red-600/10 group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getPlayerHeadshotUrl(player.person.id)}
              alt={player.person.fullName}
              width={44}
              height={44}
              className="rounded-full object-cover border border-white/10 flex-shrink-0"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'%3E%3Ccircle cx='22' cy='22' r='22' fill='%231a2a1a'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='18' fill='%23444'%3E⚾%3C/text%3E%3C/svg%3E";
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white text-sm truncate group-hover:text-red-300 transition-colors">
                {player.person.fullName}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge
                  className="text-xs px-1.5 py-0"
                  style={{
                    background: isPitcher ? "#dc2626" + "30" : "#3b82f6" + "30",
                    color: isPitcher ? "#f87171" : "#93c5fd",
                    border: "none",
                  }}
                >
                  {player.position.abbreviation}
                </Badge>
                {player.jerseyNumber && (
                  <span className="text-xs text-gray-500">#{player.jerseyNumber}</span>
                )}
                {player.status.code !== "A" && (
                  <Badge className="text-xs px-1.5 py-0 bg-yellow-500/20 text-yellow-400 border-none">
                    {player.status.code}
                  </Badge>
                )}
              </div>
            </div>
            <span className="text-gray-600 group-hover:text-red-400 transition-colors text-xs">→</span>
          </button>
        );
      })}
    </div>
  );
}
