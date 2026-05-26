import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://statsapi.mlb.com/api/v1/teams?sportId=1&activeStatus=Yes", {
      next: { revalidate: 86400 },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}
