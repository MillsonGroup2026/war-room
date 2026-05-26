import { NextResponse } from "next/server";

export async function GET() {
  try {
    const season = new Date().getFullYear();
    const res = await fetch(
      `https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${season}&standingsTypes=regularSeason&hydrate=team`,
      { next: { revalidate: 1800 } }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch standings" }, { status: 500 });
  }
}
