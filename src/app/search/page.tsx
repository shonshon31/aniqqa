import { SearchClient } from "@/app/search/SearchClient";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ genre?: string }> }) {
  const params = await searchParams;
  return <SearchClient initialGenre={params.genre ?? ""} />;
}
