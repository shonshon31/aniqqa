import type { AppUser } from "@/types/anime";

type UserRecord = {
  user: AppUser;
  passwordHash: string;
};

const users = new Map<string, UserRecord>();

export function findUserByEmail(email: string) {
  return users.get(email.toLowerCase());
}

export function createUser(input: { email: string; name: string; passwordHash: string }) {
  const id = crypto.randomUUID();
  const record: UserRecord = {
    passwordHash: input.passwordHash,
    user: {
      id,
      email: input.email,
      name: input.name,
      profiles: [
        { id: crypto.randomUUID(), name: input.name, avatar: "red", maturity: "adult" },
        { id: crypto.randomUUID(), name: "Kids", avatar: "blue", maturity: "kids" }
      ],
      activeProfileId: "",
      favorites: [],
      history: [],
      notifications: ["Welcome. Your watch history will sync when a database is connected."]
    }
  };
  record.user.activeProfileId = record.user.profiles[0].id;
  users.set(input.email.toLowerCase(), record);
  return record;
}
