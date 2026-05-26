import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categories = searchParams.get("categories") ?? "homeRuns,battingAverage,onBasePlusSlugging";
  const season = searchParams.get("season") ?? new Date().getFullYear().toString();
  const limit = searchParams.get("limit") ?? "50";
  const group = searchParams.get("group") ?? "hitting";

  try {
    let url: string;
    if (season === "career") {
      // Career all-time leaders — omit season, add statType=career
      url = `https://statsapi.mlb.com/api/v1/stats/leaders?leaderCategories=${categories}&sportId=1&limit=${limit}&statGroup=${group}&statType=career`;
    } else {
      url = `https://statsapi.mlb.com/api/v1/stats/leaders?leaderCategories=${categories}&season=${season}&sportId=1&limit=${limit}&statGroup=${group}`;
    }

    const res = await fetch(url, { next: { revalidate: season === "career" ? 86400 : 1800 } });

    if (!res.ok) {
      console.error(`MLB leaders API error: ${res.status} for categories=${categories} season=${season}`);
      return NextResponse.json({ error: `MLB API ${res.status}`, leagueLeaders: [] }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to fetch leaders:", err);
    return NextResponse.json({ error: "Failed to fetch leaders", leagueLeaders: [] }, { status: 500 });
  }
}
