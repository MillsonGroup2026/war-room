import Link from "next/link";
import { TEAM_BY_ID, getTeamLogoUrl } from "@/data/teams";

interface ScheduleGame {
  gamePk: number;
  gameDate: string;
  status: { abstractGameState: string; detailedState: string };
  teams: {
    away: { team: { id: number; name: string }; score?: number; leagueRecord: { wins: number; losses: number } };
    home: { team: { id: number; name: string }; score?: number; leagueRecord: { wins: number; losses: number } };
  };
  venue: { name: string };
  linescore?: { currentInning?: number; inningHalf?: string };
}

async function getTodayGames(): Promise<ScheduleGame[]> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const res = await fetch(
      `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${today}&hydrate=linescore,team`,
      { next: { revalidate: 60 } }
    );
    const data = await res.json();
    return data.dates?.[0]?.games ?? [];
  } catch {
    return [];
  }
}

function GameCard({ game }: { game: ScheduleGame }) {
  const { away, home } = game.teams;
  const state = game.status.abstractGameState;
  const isLive = state === "Live";
  const isFinal = state === "Final";
  const isPreview = state === "Preview";

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3 min-w-[175px] flex-shrink-0">
      <div className="flex justify-between items-center mb-2">
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
          isLive ? "bg-red-600/30 text-red-400" : isFinal ? "bg-white/10 text-gray-400" : "bg-green-600/20 text-green-400"
        }`}>
          {isLive
            ? `${game.linescore?.inningHalf?.[0] ?? ""}${game.linescore?.currentInning ?? " Live"}`
            : isFinal ? "FINAL"
            : new Date(game.gameDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }) + " ET"}
        </span>
      </div>
      <div className="space-y-1.5">
        {([away, home] as typeof away[]).map((side, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getTeamLogoUrl(side.team.id)} alt="" width={16} height={16} className="object-contain" />
              <span className="text-sm font-medium text-white">
                {TEAM_BY_ID[side.team.id]?.abbreviation ?? side.team.name.split(" ").pop()}
              </span>
              <span className="text-xs text-gray-500">
                {side.leagueRecord.wins}-{side.leagueRecord.losses}
              </span>
            </div>
            {!isPreview && (
              <span className="text-sm font-bold text-gray-200">{side.score ?? "-"}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const FEATURES = [
  {
    href: "/team-war-room",
    icon: "⚾",
    title: "Team War Room",
    description: "Full roster analytics — Statcast, WAR components, LHP/RHP splits, situational hitting, spin rate, and trade value.",
    color: "from-red-600/20 to-transparent",
    border: "border-red-600/30",
  },
  {
    href: "/fantasy-war-room",
    icon: "🏆",
    title: "Fantasy War Room",
    description: "ESPN Fantasy integration with custom scoring, live league data, waiver wire rankings, and undervalued player finder.",
    color: "from-yellow-600/20 to-transparent",
    border: "border-yellow-600/30",
  },
  {
    href: "/ballpark-rank",
    icon: "🎯",
    title: "Ballpark Rank",
    description: "Rate all 30 stadiums across 8 criteria. Community rankings with ELITE to '50 Feet of Crap' tiers.",
    color: "from-green-600/20 to-transparent",
    border: "border-green-600/30",
  },
  {
    href: "/goats",
    icon: "🐐",
    title: "GOATs",
    description: "All-time historical leaderboards across every major stat. Weighted MVP calculator for every position.",
    color: "from-blue-600/20 to-transparent",
    border: "border-blue-600/30",
  },
];

export default async function HomePage() {
  const games = await getTodayGames();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10 py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }}
        />
        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <div className="mb-4 text-5xl">⚾</div>
          <h1 className="mb-3 text-6xl font-black tracking-tight sm:text-7xl">
            The <span className="text-red-500">WAR</span> Room
          </h1>
          <p className="mx-auto mb-2 max-w-xl text-lg text-gray-300">
            Advanced MLB analytics for GMs and fantasy managers.
            Real-time stats, Statcast, splits, and tools to dominate your league.
          </p>
          <p className="mb-8 text-xs text-gray-500">
            Live data from MLB Stats API · Baseball Savant · ESPN Fantasy
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/team-war-room" className="rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-500">
              Open Team War Room →
            </Link>
            <Link href="/fantasy-war-room" className="rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5">
              Fantasy Rankings →
            </Link>
          </div>
        </div>
      </section>

      {/* Scoreboard */}
      <section className="border-b border-white/10 bg-black/20 py-4">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </span>
            {games.some((g) => g.status.abstractGameState === "Live") && (
              <span className="flex items-center gap-1.5 text-xs text-red-400">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Live
              </span>
            )}
          </div>
          {games.length === 0 ? (
            <p className="py-2 text-sm text-gray-500">No games scheduled today.</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {games.map((game) => (
                <GameCard key={game.gamePk} game={game} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats highlight */}
      <section className="border-b border-white/10 py-6">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
            {[
              { value: "150+", label: "Stat Categories" },
              { value: "30", label: "MLB Teams" },
              { value: "30", label: "Parks Ranked" },
              { value: "20k+", label: "Historical Players" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-black text-red-400">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold">Everything a GM Needs</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feat) => (
              <Link key={feat.href} href={feat.href} className="group">
                <div className={`h-full rounded-xl border ${feat.border} bg-gradient-to-br ${feat.color} bg-card p-5 transition-transform hover:scale-[1.02]`}>
                  <div className="mb-3 text-3xl">{feat.icon}</div>
                  <h3 className="mb-2 font-bold text-white">{feat.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="flex items-center gap-4 px-4 opacity-10">
        <div className="h-px flex-1 bg-white" />
        <span className="text-xl">⚾</span>
        <div className="h-px flex-1 bg-white" />
      </div>

      <section className="py-10">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <p className="text-sm text-gray-400 leading-relaxed">
            The WAR Room combines MLB Stats API data with Baseball Savant Statcast metrics
            to give you the edge — whether evaluating trade targets, building your fantasy lineup,
            or settling a debate about the greatest ballpark in baseball.
          </p>
        </div>
      </section>
    </div>
  );
}
