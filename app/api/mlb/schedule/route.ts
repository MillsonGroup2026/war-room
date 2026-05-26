import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  try {
    const res = await fetch(
      `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}&hydrate=linescore,team`,
      { next: { revalidate: 60 } }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}
