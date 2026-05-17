import { NextResponse } from "next/server";
import { getGenres } from "@/services/anikoto";

export async function GET() {
  try {
    return NextResponse.json({ genres: await getGenres() });
  } catch {
    return NextResponse.json({ genres: ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Romance", "Sci-Fi"] });
  }
}
