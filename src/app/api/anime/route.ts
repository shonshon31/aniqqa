import { NextResponse } from "next/server";
import { getGenres, getRecentAnime, searchAnime } from "@/services/anikoto";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? 1);
  const perPage = Number(searchParams.get("perPage") ?? 24);
  const query = searchParams.get("q") ?? "";
  const genre = searchParams.get("genre") ?? "";
  const status = searchParams.get("status") ?? "";
  const sort = searchParams.get("sort") ?? "popular";

  try {
    const result = query ? await searchAnime(query, page, perPage) : await getRecentAnime(page, perPage);
    let items = result.items;

    if (genre) items = items.filter((item) => item.genres.some((value) => value.toLowerCase() === genre.toLowerCase()));
    if (status) items = items.filter((item) => item.status === status);

    if (sort === "rating") items = [...items].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sort === "year") items = [...items].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

    return NextResponse.json({ ...result, items });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to fetch anime" },
      { status: 502 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({ genres: await getGenres() });
}
