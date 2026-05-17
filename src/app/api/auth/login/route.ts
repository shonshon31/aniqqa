import { NextResponse } from "next/server";
import { verifyPassword, signToken } from "@/services/auth";
import { findUserByEmail } from "@/services/users";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "").toLowerCase();
  const password = String(body.password ?? "");
  const record = findUserByEmail(email);

  if (!record || !(await verifyPassword(password, record.passwordHash))) {
    return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
  }

  return NextResponse.json({
    user: record.user,
    token: await signToken({ sub: record.user.id, email: record.user.email })
  });
}
