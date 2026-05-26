import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ personId: string }> }
) {
  const { personId } = await params;
  const { searchParams } = new URL(request.url);
  const season = searchParams.get("season") ?? new Date().getFullYear().toString();
  const group = searchParams.get("group") ?? "hitting";

  try {
    const [personRes, seasonRes, careerRes, splitsRes] = await Promise.allSettled([
      fetch(`https://statsapi.mlb.com/api/v1/people/${personId}?hydrate=currentTeam`, { next: { revalidate: 3600 } }),
      fetch(`https://statsapi.mlb.com/api/v1/people/${personId}/stats?stats=season&season=${season}&group=${group}`, { next: { revalidate: 1800 } }),
      fetch(`https://statsapi.mlb.com/api/v1/people/${personId}/stats?stats=career&group=${group}`, { next: { revalidate: 3600 } }),
      fetch(`https://statsapi.mlb.com/api/v1/people/${personId}/stats?stats=statSplits&season=${season}&group=${group}&sitCodes=vl,vr`, { next: { revalidate: 1800 } }),
    ]);

    const person = personRes.status === "fulfilled" ? await personRes.value.json() : null;
    const seasonStats = seasonRes.status === "fulfilled" ? await seasonRes.value.json() : null;
    const careerStats = careerRes.status === "fulfilled" ? await careerRes.value.json() : null;
    const splits = splitsRes.status === "fulfilled" ? await splitsRes.value.json() : null;

    return NextResponse.json({ person, seasonStats, careerStats, splits });
  } catch {
    return NextResponse.json({ error: "Failed to fetch player data" }, { status: 500 });
  }
}
