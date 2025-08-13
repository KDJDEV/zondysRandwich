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
import { eq, and } from "drizzle-orm";

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


  async signup({ username, email, password, passwordConfirm, opts }) {
    if (!opts?.cookies) return err(new Error("Missing cookies"));
    if (!username || !password) return err(new Error("Missing fields"));
    if (password !== passwordConfirm) return err(new Error("Passwords do not match"));

    // Check if username is already taken
    const [existingUsername] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUsername) return err(new Error("Username is already registered"));

    // Validate email domain
    const emailDomain = email.split("@")[1]?.toLowerCase();
    if (emailDomain !== "taylor.edu") {
      return err(new Error("Email must be a @taylor.edu address"));
    }

    // **Check if email is already registered and verified**
    const [existingVerifiedEmail] = await db
      .select()
      .from(users)
      .where(
        eq(users.email, email)
      )
      .limit(1);

    if (existingVerifiedEmail) {
      return err(new Error("An account with this email has already been created."));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create verification token
    const verificationToken = crypto.randomUUID();
    const expiryDate = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h expiry

    const [newUser] = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        emailVerified: false,
        verificationToken,
        verificationTokenExpires: expiryDate
      })
      .returning({
        id: users.id,
        username: users.username,
        verificationToken: users.verificationToken
      });

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
