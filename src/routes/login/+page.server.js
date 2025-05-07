import { auth } from "$lib/auth";
import { AUTH_TOKEN_EXPIRY_SECONDS } from "$lib/constants.server";
import { fail, redirect } from "@sveltejs/kit";
import debug from "debug";

export const config = {
    runtime: 'nodejs' // Force Node.js runtime
};

const log = debug("app:routes:login:page.server");

export const actions = {
    async default(event) {
        const data = await event.request.formData();
        const username = data.get("username");
        const password = data.get("password");

        const resp = await auth.login({
            username,
            password,
            opts: { cookies: event.cookies },
        });

        if (resp.isErr()) {
            const error = (
                String(resp.error) ??
                "No account with that username could be found."
            ).trim();
            return fail(401, { username, error });
        }

        const user = resp.value;
        delete user.password;

        log("user:", user);

        /*
        if (user && user.token) {
            // TODO: duplicated in login page
            event.cookies.set("auth_token", `${user.id}:${user.token}`, {
                path: "/",
                maxAge: AUTH_TOKEN_EXPIRY_SECONDS,
            });
        }

        */

        log("redirecting user...");

        return { user };
    },
};