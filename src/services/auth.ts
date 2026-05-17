import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET ?? "development-only-secret-change-me";

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: Record<string, string>) {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, secret, { expiresIn: "7d" }, (error, token) => {
      if (error || !token) reject(error ?? new Error("Unable to sign token"));
      else resolve(token);
    });
  });
}
