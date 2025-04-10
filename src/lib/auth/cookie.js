import debug from "debug";
import { err, ok } from "neverthrow";
import bcrypt from "bcryptjs";
import { db } from "$lib/db";
import { users } from "$lib/db/schema";
import {
  generateSessionToken,
  createSession,
  validateSessionToken,
  setSessionTokenCookie,
  deleteSessionTokenCookie,
  invalidateSession,
} from "$lib/auth/sessionService";
import { eq } from "drizzle-orm";

const log = debug("app:lib:auth:cookie");

export const cookie = {
  async validateSession({ opts }) {
    const token = opts?.cookies?.get("session");

    if (!token) return err(new Error("No session token found in cookies"));

    const { session, user } = await validateSessionToken(token);

    if (!session || !user) {
      return err(new Error("Invalid or expired session"));
    }

    return ok(user);
  },

  async login({ email, password, opts }) {
    if (!opts?.cookies) return err(new Error("Missing cookies"));

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) return err(new Error("User not found"));

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) return err(new Error("Invalid credentials"));

    const token = generateSessionToken();
    const session = await createSession(token, user.id);

    setSessionTokenCookie(opts, token, session.expiresAt);

    return ok(user);
  },

  async signup({ email, username, password, passwordConfirm, opts }) {
    if (!opts?.cookies) return err(new Error("Missing cookies"));
    console.log(email, username, password, passwordConfirm)
    if (!email || !username || !password) return err(new Error("Missing fields"));
    if (password !== passwordConfirm) return err(new Error("Passwords do not match"));

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) return err(new Error("Email is already registered"));

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        username,
        password: hashedPassword,
      })
      .returning({ id: users.id, email: users.email, username: users.username });

    const token = generateSessionToken();
    const session = await createSession(token, newUser.id);

    setSessionTokenCookie(opts, token, session.expiresAt);

    return ok(newUser);
  },

  async logout({ opts }) {
    if (!opts?.cookies) return err(new Error("Missing cookies"));

    const token = opts.cookies.get("session");

    if (token) {
      const sessionId = await validateSessionToken(token);
      if (sessionId?.session?.id) {
        await invalidateSession(sessionId.session.id);
      }
    }

    deleteSessionTokenCookie(opts);

    return ok(null);
  },
};
