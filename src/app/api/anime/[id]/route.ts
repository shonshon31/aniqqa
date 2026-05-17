import { NextResponse } from "next/server";
import { getAnimeDetails } from "@/services/anikoto";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    return NextResponse.json(await getAnimeDetails(id));
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to fetch anime details" },
      { status: 502 }
    );
  }
}
