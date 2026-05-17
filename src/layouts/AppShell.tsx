import { Navbar } from "@/components/Navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-ink pb-20">
      <Navbar />
      {children}
    </main>
  );
}
