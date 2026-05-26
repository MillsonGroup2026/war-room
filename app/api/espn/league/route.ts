import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { s2, swid, leagueId, views } = await request.json();

  if (!s2 || !swid) {
    return NextResponse.json({ error: "ESPN credentials required" }, { status: 400 });
  }

  const id = leagueId ?? 81511270;
  const season = new Date().getFullYear();
  const viewParam = (views ?? ["mTeam", "mRoster", "mSettings", "mMatchup"])
    .map((v: string) => `view=${v}`)
    .join("&");

  try {
    const res = await fetch(
      `https://fantasy.espn.com/apis/v3/games/flb/seasons/${season}/segments/0/leagues/${id}?${viewParam}`,
      {
        headers: {
          Cookie: `espn_s2=${s2}; SWID=${swid}`,
          "X-Fantasy-Source": "kona",
          "Accept": "application/json",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: `ESPN API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch ESPN data" }, { status: 500 });
  }
}
