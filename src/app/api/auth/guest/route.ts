import { NextResponse } from "next/server";
import { signToken } from "@/services/auth";

export async function POST() {
  const user = {
    id: "guest",
    email: "guest@aniqqa.local",
    name: "Guest",
    profiles: [
      { id: "guest-main", name: "Guest", avatar: "crimson", maturity: "adult" as const }
    ],
    activeProfileId: "guest-main",
    favorites: [],
    history: [],
    notifications: ["Guest progress is saved on this device."]
  };

  return NextResponse.json({ user, token: await signToken({ sub: user.id, email: user.email }) });
}
