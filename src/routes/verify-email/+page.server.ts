import { db } from "$lib/db";
import { users } from "$lib/db/schema";
import { eq } from "drizzle-orm";
import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ url }) => {
  const token = url.searchParams.get("token");
  if (!token) {
    return { error: "Invalid verification link." };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.verificationToken, token))
    .limit(1);

  if (!user) {
    return { error: "Invalid or expired verification token." };
  }

  const now = new Date();
  if (user.verificationTokenExpires < now) {
    return { error: "Verification token has expired." };
  }

  return { token }; // Pass token to page so we can POST it
};

export const actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const token = form.get("token");

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.verificationToken, token))
      .limit(1);

    if (!user) {
      return fail(400, { error: "Invalid or expired verification token." });
    }

    const now = new Date();
    if (user.verificationTokenExpires < now) {
      return fail(400, { error: "Verification token has expired." });
    }

    await db
      .update(users)
      .set({ emailVerified: true, verificationToken: null, verificationTokenExpires: null })
      .where(eq(users.id, user.id));

    throw redirect(302, "/email-verified");
  }
};
