import { auth } from "$lib/auth";
import { redirect } from "@sveltejs/kit";

export async function load(event) {
    const token = event.cookies.get("auth_token");
    await auth.logout({
        token,
        opts: { cookies: event.cookies },
    });
    event.cookies.delete("auth_token");
    throw redirect(302, "/");
}