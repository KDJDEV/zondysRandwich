import { auth } from "$lib/auth";
import { AUTH_TOKEN_EXPIRY_SECONDS } from "$lib/constants.server";
import { fail, redirect } from "@sveltejs/kit";

export const actions = {
    async default(event) {
        const data = await event.request.formData();
        const username = data.get("username");
        const email = data.get("email");
        const password = data.get("password");
        const passwordConfirm = data.get("password-confirm");

        console.log("Form data:", { email, password, passwordConfirm });
        
        if (!username)
            return fail(422, { username, error: "A username is required." });
        if (!email)
            return fail(422, { email, error: "An email address is required." });
        if (!password)
            return fail(422, { email, error: "A password is required." });
        if (password.length < 8)
            return fail(422, {
                email,
                error: "Password must be at least 8 characters long.",
            });
        if (password.length > 32)
            return fail(422, {
                email,
                error: "Password cannot be more than 32 characters long.",
            });
        if (username.length > 32)
            return fail(422, {
                email,
                error: "Username cannot be more than 32 characters long.",
            });
        if (password !== passwordConfirm)
            return fail(422, {
                email,
                error: "Your passwords must match.",
            });

        const signup_resp = await auth.signup({
            email,
            username,
            password,
            passwordConfirm,
            opts: { cookies: event.cookies },
        });

        if (signup_resp.isErr()) {
            const error = (
                String(signup_resp.error) ??
                "There was an issue creating your account. Please try again."
            ).trim();
            return fail(500, { email, error });
        }

        // Sign the user in immediately
        const login_resp = await auth.login({
            email,
            password,
            opts: { cookies: event.cookies },
        });

        if (login_resp.isErr()) {
            const error = (
                String(login_resp.error) ?? "Could not sign you in. Please try again."
            ).trim();
            return fail(500, { email, error });
        }

        
        const user = login_resp.value;
        delete user.password;
        /*
        if (user?.id && user?.token) {
            // TODO: duplicated in login page
            event.cookies.set("auth_token", `${user.id}:${user.token}`, {
                path: "/",
                maxAge: AUTH_TOKEN_EXPIRY_SECONDS,
            });
        }

        delete user.token;
        */
        return { user };
    },
};