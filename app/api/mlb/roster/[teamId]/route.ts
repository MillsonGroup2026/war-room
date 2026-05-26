import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const { searchParams } = new URL(request.url);
  const rosterType = searchParams.get("type") ?? "active";

  try {
    const res = await fetch(
      `https://statsapi.mlb.com/api/v1/teams/${teamId}/roster?rosterType=${rosterType}&hydrate=person(stats(type=season,group=hitting),stats(type=season,group=pitching))`,
      { next: { revalidate: 1800 } }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch roster" }, { status: 500 });
  }
}
