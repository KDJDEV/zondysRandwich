import { auth } from "$lib/auth";
import { AUTH_TOKEN_EXPIRY_SECONDS } from "$lib/constants.server";
import { fail } from "@sveltejs/kit";
import debug from "debug";

export const config = {
    runtime: 'nodejs' // Force Node.js runtime
};

const log = debug("app:routes:login:page.server");

export const actions = {
    async default(event) {
        const data = await event.request.formData();
        const email = data.get("email");
        const password = data.get("password");

        if (!email || !password) {
            return fail(400, { email, error: "Email and password are required." });
        }

        const resp = await auth.login({
            email,
            password,
            opts: { cookies: event.cookies },
        });

        if (resp.isErr()) {
            const error = (
                String(resp.error) ?? "No account with that email could be found."
            ).trim();
            return fail(401, { email, error });
        }

        const user = resp.value;
        delete user.password;

        log("user logged in:", user);

        return { user };
    },
};
