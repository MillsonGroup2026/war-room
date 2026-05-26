"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DEFAULT_SCORING, ScoringConfig, calculateHitterPoints, calculatePitcherPoints, projectRestOfSeason } from "@/lib/fantasy-scoring";
import { TEAM_BY_ID, getPlayerHeadshotUrl } from "@/data/teams";

interface ESPNCreds {
  s2: string;
  swid: string;
  leagueId: number;
}

function ESPNConnectForm({ onConnect }: { onConnect: (creds: ESPNCreds) => void }) {
  const [s2, setS2] = useState("");
  const [swid, setSwid] = useState("");

  return (
    <Card className="max-w-lg mx-auto bg-card border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🏆</span> Connect ESPN Fantasy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-4 text-sm text-yellow-300">
          <p className="font-semibold mb-2">How to get your ESPN credentials:</p>
          <ol className="list-decimal list-inside space-y-1 text-yellow-200/80">
            <li>Log into ESPN Fantasy Baseball in Chrome</li>
            <li>Open DevTools (F12) → Application tab</li>
            <li>Go to Cookies → fantasy.espn.com</li>
            <li>Copy the values for <code className="bg-black/30 px-1 rounded">espn_s2</code> and <code className="bg-black/30 px-1 rounded">SWID</code></li>
          </ol>
          <p className="mt-2 text-xs text-yellow-200/60">Your credentials are only sent to the ESPN API and never stored permanently.</p>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-gray-300">ESPN League ID</Label>
            <Input
              value="81511270"
              readOnly
              className="bg-white/5 border-white/10 text-gray-400 mt-1"
            />
          </div>
          <div>
            <Label className="text-gray-300">espn_s2 Cookie</Label>
            <Input
              placeholder="Paste your espn_s2 value..."
              value={s2}
              onChange={(e) => setS2(e.target.value)}
              className="bg-white/5 border-white/10 text-white mt-1 font-mono text-xs"
            />
          </div>
          <div>
            <Label className="text-gray-300">SWID Cookie</Label>
            <Input
              placeholder="{xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}"
              value={swid}
              onChange={(e) => setSwid(e.target.value)}
              className="bg-white/5 border-white/10 text-white mt-1 font-mono text-xs"
            />
          </div>
        </div>

        <Button
          onClick={() => onConnect({ s2, swid, leagueId: 81511270 })}
          disabled={!s2 || !swid}
          className="w-full bg-red-600 hover:bg-red-500 text-white"
        >
          Connect to League →
        </Button>
      </CardContent>
    </Card>
  );
}

function ScoringEditor({
  config,
  onChange,
}: {
  config: ScoringConfig;
  onChange: (c: ScoringConfig) => void;
}) {
  const battingFields: (keyof ScoringConfig)[] = [
    "runs", "totalBases", "rbi", "gwrbi", "walks", "intentionalWalks",
    "strikeouts", "hitByPitch", "stolenBases", "caughtStealing",
    "groundIntoDoublePlay", "hittingForCycle", "errors",
  ];
  const pitchingFields: (keyof ScoringConfig)[] = [
    "inningsPitched", "hitsAllowed", "earnedRuns", "walksIssued",
    "hitBatsmen", "pitchingStrikeouts", "pickOffs", "qualityStarts",
    "completeGames", "noHitters", "perfectGames", "saves", "blownSaves", "holds",
  ];

  const LABELS: Record<keyof ScoringConfig, string> = {
    runs: "Runs (R)", totalBases: "Total Bases (TB)", rbi: "RBI", gwrbi: "GWRBI",
    walks: "Walks (BB)", intentionalWalks: "IBB", strikeouts: "Strikeouts (K)",
    hitByPitch: "Hit by Pitch (HBP)", stolenBases: "Stolen Bases (SB)",
    caughtStealing: "Caught Stealing (CS)", groundIntoDoublePlay: "GIDP",
    hittingForCycle: "Hitting for Cycle", errors: "Errors (E)",
    inningsPitched: "Innings Pitched (IP)", hitsAllowed: "Hits Allowed (H)",
    earnedRuns: "Earned Runs (ER)", walksIssued: "Walks Issued (BB)",
    hitBatsmen: "Hit Batsmen (HBP)", pitchingStrikeouts: "Strikeouts (K)",
    pickOffs: "Pick Offs (PKO)", qualityStarts: "Quality Starts (QS)",
    completeGames: "Complete Games (CG)", noHitters: "No Hitters (NH)",
    perfectGames: "Perfect Games (PG)", saves: "Saves (SV)",
    blownSaves: "Blown Saves (BS)", holds: "Holds (HD)",
  };

  const updateField = (key: keyof ScoringConfig, val: string) => {
    onChange({ ...config, [key]: parseFloat(val) || 0 });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-semibold text-red-400 mb-3 uppercase tracking-wider">⚾ Batting</p>
          <div className="space-y-2">
            {battingFields.map((field) => (
              <div key={field} className="flex items-center justify-between gap-3">
                <label className="text-sm text-gray-300 flex-1">{LABELS[field]}</label>
                <Input
                  type="number"
                  step="0.25"
                  value={config[field]}
                  onChange={(e) => updateField(field, e.target.value)}
                  className="w-20 bg-white/5 border-white/10 text-white text-center text-sm"
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wider">⚾ Pitching</p>
          <div className="space-y-2">
            {pitchingFields.map((field) => (
              <div key={field} className="flex items-center justify-between gap-3">
                <label className="text-sm text-gray-300 flex-1">{LABELS[field]}</label>
                <Input
                  type="number"
                  step="0.25"
                  value={config[field]}
                  onChange={(e) => updateField(field, e.target.value)}
                  className="w-20 bg-white/5 border-white/10 text-white text-center text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ESPNLeagueTeam {
  id: number;
  abbrev: string;
  name: string;
  record: { overall: { wins: number; losses: number; ties: number; pointsFor: number } };
  roster?: { entries: ESPNRosterEntry[] };
}

interface ESPNRosterEntry {
  playerPoolEntry: {
    playerPoolEntryId: number;
    player: {
      id: number;
      fullName: string;
      proTeamId: number;
      defaultPositionId: number;
    };
    onTeamId: number;
    acquisitionType: string;
  };
  lineupSlotId: number;
}

const ESPN_POS: Record<number, string> = {
  1: "C", 2: "1B", 3: "2B", 4: "3B", 5: "SS", 6: "LF", 7: "CF", 8: "RF",
  9: "DH", 10: "OF", 11: "P", 12: "SP", 13: "RP", 14: "UTIL",
};

function StandingsTable({ teams }: { teams: ESPNLeagueTeam[] }) {
  const sorted = [...teams].sort((a, b) =>
    (b.record.overall.wins - a.record.overall.wins) ||
    (b.record.overall.pointsFor - a.record.overall.pointsFor)
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs text-gray-400 uppercase">
            <th className="text-left pb-2 pl-2">Rank</th>
            <th className="text-left pb-2">Team</th>
            <th className="text-right pb-2">W</th>
            <th className="text-right pb-2">L</th>
            <th className="text-right pb-2 pr-2">Pts For</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((team, i) => (
            <tr key={team.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="py-2 pl-2 text-gray-400">{i + 1}</td>
              <td className="py-2 font-medium text-white">{team.name || team.abbrev}</td>
              <td className="py-2 text-right text-green-400">{team.record.overall.wins}</td>
              <td className="py-2 text-right text-red-400">{team.record.overall.losses}</td>
              <td className="py-2 text-right text-gray-300 pr-2">{team.record.overall.pointsFor.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RosterView({ entries }: { entries: ESPNRosterEntry[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {entries.map((entry) => {
        const player = entry.playerPoolEntry.player;
        const mlbTeam = TEAM_BY_ID[player.proTeamId];
        return (
          <div key={entry.playerPoolEntry.playerPoolEntryId} className="flex items-center gap-3 rounded-lg bg-white/5 p-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getPlayerHeadshotUrl(player.id)}
              alt={player.fullName}
              width={36}
              height={36}
              className="rounded-full object-cover border border-white/10 flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'%3E%3Ccircle cx='18' cy='18' r='18' fill='%231a2a1a'/%3E%3C/svg%3E";
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{player.fullName}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge className="text-xs px-1 py-0 bg-blue-600/20 text-blue-300 border-none">
                  {ESPN_POS[player.defaultPositionId] ?? "?"}
                </Badge>
                {mlbTeam && <span className="text-xs text-gray-500">{mlbTeam.abbreviation}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function FantasyWarRoomClient() {
  const [creds, setCreds] = useState<ESPNCreds | null>(null);
  const [scoring, setScoring] = useState<ScoringConfig>(DEFAULT_SCORING);
  const [showScoringEditor, setShowScoringEditor] = useState(false);

  const { data: leagueData, isLoading, error } = useQuery({
    queryKey: ["espn-league", creds?.s2],
    queryFn: async () => {
      const res = await fetch("/api/espn/league", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          s2: creds!.s2,
          swid: creds!.swid,
          leagueId: creds!.leagueId,
          views: ["mTeam", "mRoster", "mSettings", "mMatchup"],
        }),
      });
      if (!res.ok) throw new Error("ESPN API error");
      return res.json();
    },
    enabled: !!creds,
  });

  if (!creds) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black">🏆 Fantasy War Room</h1>
          <p className="text-gray-400 mt-2">ESPN Fantasy Baseball analytics with your custom scoring</p>
        </div>

        <div className="mb-10">
          <ESPNConnectForm onConnect={setCreds} />
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">— or explore scoring weights without connecting —</p>
          <Button
            variant="outline"
            className="border-white/20 text-gray-300 hover:bg-white/5"
            onClick={() => setShowScoringEditor(true)}
          >
            View Scoring Config
          </Button>
        </div>

        {showScoringEditor && (
          <div className="mt-8 max-w-3xl mx-auto">
            <Card className="bg-card border-white/10">
              <CardHeader>
                <CardTitle>Scoring Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <ScoringEditor config={scoring} onChange={setScoring} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black">🏆 Fantasy War Room</h1>
          <p className="text-gray-400 text-sm mt-1">
            {leagueData?.settings?.name ?? "ESPN League"} · League ID {creds.leagueId}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-gray-300 hover:bg-white/5"
            onClick={() => setShowScoringEditor(!showScoringEditor)}
          >
            {showScoringEditor ? "Hide" : "Edit"} Scoring
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-red-600/30 text-red-400 hover:bg-red-600/10"
            onClick={() => setCreds(null)}
          >
            Disconnect
          </Button>
        </div>
      </div>

      {showScoringEditor && (
        <Card className="mb-6 bg-card border-white/10">
          <CardHeader>
            <CardTitle className="text-base">Scoring Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoringEditor config={scoring} onChange={setScoring} />
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-600/10 border border-red-600/30 p-6 text-center">
          <p className="text-red-400 font-semibold">Failed to load ESPN data</p>
          <p className="text-sm text-gray-400 mt-1">Check that your cookies are current and the league ID is correct.</p>
          <Button
            className="mt-4 border-red-600/30 text-red-400 hover:bg-red-600/10"
            variant="outline"
            onClick={() => setCreds(null)}
          >
            Try again
          </Button>
        </div>
      ) : leagueData ? (
        <Tabs defaultValue="standings">
          <TabsList className="bg-white/5 border border-white/10 mb-6">
            <TabsTrigger value="standings" className="data-[state=active]:bg-red-600/30 data-[state=active]:text-red-300">Standings</TabsTrigger>
            <TabsTrigger value="rosters" className="data-[state=active]:bg-red-600/30 data-[state=active]:text-red-300">Rosters</TabsTrigger>
            <TabsTrigger value="matchups" className="data-[state=active]:bg-red-600/30 data-[state=active]:text-red-300">Matchups</TabsTrigger>
          </TabsList>

          <TabsContent value="standings">
            <Card className="bg-card border-white/10">
              <CardHeader>
                <CardTitle className="text-base">League Standings</CardTitle>
              </CardHeader>
              <CardContent>
                <StandingsTable teams={leagueData.teams ?? []} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rosters">
            <div className="space-y-6">
              {(leagueData.teams ?? []).map((team: ESPNLeagueTeam) => (
                <Card key={team.id} className="bg-card border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{team.name || team.abbrev}</span>
                      <span className="text-sm text-gray-400 font-normal">
                        {team.record.overall.wins}-{team.record.overall.losses}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {team.roster?.entries ? (
                      <RosterView entries={team.roster.entries} />
                    ) : (
                      <p className="text-gray-500 text-sm">No roster data</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="matchups">
            <div className="space-y-4">
              {(leagueData.schedule ?? [])
                .filter((m: { matchupPeriodId: number }) => m.matchupPeriodId === leagueData.scoringPeriodId)
                .map((matchup: { id: number; home: { teamId: number; totalPoints: number }; away: { teamId: number; totalPoints: number } }) => {
                  const homeTeam = (leagueData.teams ?? []).find((t: ESPNLeagueTeam) => t.id === matchup.home?.teamId);
                  const awayTeam = (leagueData.teams ?? []).find((t: ESPNLeagueTeam) => t.id === matchup.away?.teamId);
                  if (!homeTeam || !awayTeam) return null;
                  return (
                    <Card key={matchup.id} className="bg-card border-white/10">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-center flex-1">
                            <p className="font-bold text-white">{awayTeam.name || awayTeam.abbrev}</p>
                            <p className="text-2xl font-black text-red-400 mt-1">{matchup.away?.totalPoints?.toFixed(1) ?? "—"}</p>
                          </div>
                          <div className="text-gray-500 font-bold text-sm">VS</div>
                          <div className="text-center flex-1">
                            <p className="font-bold text-white">{homeTeam.name || homeTeam.abbrev}</p>
                            <p className="text-2xl font-black text-red-400 mt-1">{matchup.home?.totalPoints?.toFixed(1) ?? "—"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
}
