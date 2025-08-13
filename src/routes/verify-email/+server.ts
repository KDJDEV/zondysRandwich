import { db } from "$lib/db";
import { users } from "$lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect, json } from "@sveltejs/kit";

export const GET = async ({ url }) => {
  const token = url.searchParams.get("token");

  if (!token) return json({ success: false, message: "Invalid verification link." }, { status: 400 });

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.verificationToken, token))
    .limit(1);

  if (!user) return json({ success: false, message: "Invalid or expired verification token." }, { status: 400 });

  const now = new Date();
  if (user.verificationTokenExpires < now) {
    return json({ success: false, message: "Verification token has expired." }, { status: 400 });
  }

  // Mark email as verified
  await db
    .update(users)
    .set({ emailVerified: true, verificationToken: null, verificationTokenExpires: null })
    .where(eq(users.id, user.id));

  // Redirect to a “verified” page
  throw redirect(302, "/email-verified");
};
