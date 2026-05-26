import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categories = searchParams.get("categories") ?? "homeRuns,battingAverage,onBasePlusSlugging";
  const season = searchParams.get("season") ?? new Date().getFullYear().toString();
  const limit = searchParams.get("limit") ?? "50";
  const group = searchParams.get("group") ?? "hitting";

  try {
    const res = await fetch(
      `https://statsapi.mlb.com/api/v1/stats/leaders?leaderCategories=${categories}&season=${season}&sportId=1&limit=${limit}&statGroup=${group}`,
      { next: { revalidate: 1800 } }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch leaders" }, { status: 500 });
  }
}
