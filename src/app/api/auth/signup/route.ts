import { NextResponse } from "next/server";
import { hashPassword, signToken } from "@/services/auth";
import { createUser, findUserByEmail } from "@/services/users";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "").toLowerCase();
  const password = String(body.password ?? "");
  const name = String(body.name ?? "Anime Fan").trim();

  if (!email.includes("@") || password.length < 8) {
    return NextResponse.json({ message: "Use a valid email and an 8+ character password." }, { status: 400 });
  }

  if (findUserByEmail(email)) {
    return NextResponse.json({ message: "An account already exists for that email." }, { status: 409 });
  }

  const record = createUser({
    email,
    name,
    passwordHash: await hashPassword(password)
  });

  return NextResponse.json({
    user: record.user,
    token: await signToken({ sub: record.user.id, email: record.user.email })
  });
}
