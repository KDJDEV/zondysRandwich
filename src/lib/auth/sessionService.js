import { db } from '$lib/db';
import { users, sessions } from '$lib/db/schema'; 
import { eq } from "drizzle-orm";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

// Generate session token
export function generateSessionToken() {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

// Create session
export async function createSession(token, userId) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
	};
	await db.insert(sessions).values(session);
	return session;
}

// Validate session token
export async function validateSessionToken(token) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const result = await db
		.select({ user: users, session: sessions })
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.id, sessionId));
	if (result.length < 1) {
		return { session: null, user: null };
	}
	const { user, session } = result[0];
	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(sessions).where(eq(sessions.id, session.id));
		return { session: null, user: null };
	}
	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await db
			.update(sessions)
			.set({
				expiresAt: session.expiresAt
			})
			.where(eq(sessions.id, session.id));
	}
	return { session, user };
}

// Invalidate session
export async function invalidateSession(sessionId) {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}

// Invalidate all sessions
export async function invalidateAllSessions(userId) {
	await db.delete(sessions).where(eq(sessions.userId, userId));
}

// Sets the session token cookie
export function setSessionTokenCookie(event, token, expiresAt) {
    event.cookies.set("session", token, {
      httpOnly: true,
      sameSite: "lax",
      expires: expiresAt,
      path: "/"
    });
  }
  
  // Deletes the session token cookie
  export function deleteSessionTokenCookie(event) {
    event.cookies.set("session", "", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 0,
      path: "/"
    });
  }
  