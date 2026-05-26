import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const { searchParams } = new URL(request.url);
  const rosterType = searchParams.get("type") ?? "active";

  try {
    // Use simple person hydration only — stat hydration causes MLB API to return empty roster
    const url = `https://statsapi.mlb.com/api/v1/teams/${teamId}/roster?rosterType=${rosterType}&hydrate=person`;
    const res = await fetch(url, { next: { revalidate: 1800 } });

    if (!res.ok) {
      console.error(`MLB roster API error: ${res.status} ${res.statusText} for teamId=${teamId}`);
      return NextResponse.json({ error: `MLB API returned ${res.status}`, roster: [] }, { status: 502 });
    }

    const data = await res.json();

    // Validate we actually got roster data
    if (!data.roster || !Array.isArray(data.roster)) {
      console.error(`Unexpected MLB roster shape for teamId=${teamId}:`, JSON.stringify(data).slice(0, 300));
      return NextResponse.json({ roster: [] });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error(`Failed to fetch roster for teamId=${teamId}:`, err);
    return NextResponse.json({ error: "Failed to fetch roster", roster: [] }, { status: 500 });
  }
}
