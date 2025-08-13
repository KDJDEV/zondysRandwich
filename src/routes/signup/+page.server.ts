import { auth } from "$lib/auth";
import { fail } from "@sveltejs/kit";
import Mailjet from "node-mailjet";
import 'dotenv/config';

import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from "obscenity";

const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
});

// Initialize Mailjet client
const mailjet = Mailjet.apiConnect(
    process.env.MJ_APIKEY_PUBLIC,
    process.env.MJ_APIKEY_PRIVATE
);

async function sendVerificationEmail(email: string, username: string, verificationToken: string) {
    const verificationUrl = `https://zondys.com/verify-email?token=${verificationToken}`;

    await mailjet
        .post("send", { version: "v3.1" })
        .request({
            Messages: [
                {
                    From: {
                        Email: "no-reply@zondys.com",
                        Name: "Zondy's Randwich"
                    },
                    To: [
                        {
                            Email: email,
                            Name: username
                        }
                    ],
                    Subject: "Verify your Zondy's Randwich account",
                    TextPart: `Hello ${username},

Please verify your account by clicking this link: ${verificationUrl}

If you did not try to sign up, you can safely ignore this email.`,
                    HTMLPart: `<p>Hello ${username},</p>
                               <p>Please verify your account by clicking this link:</p>
                               <a href="${verificationUrl}">${verificationUrl}</a>
                               <p>If you did not try to sign up, you can safely ignore this email.</p>`
                }
            ]
        });

    console.log(`Verification email sent to ${email} with token: ${verificationToken}`);
}

export const actions = {
    async default(event) {
        const data = await event.request.formData();
        const username = data.get("username")?.toString();
        const email = data.get("email")?.toString();
        const password = data.get("password")?.toString();
        const passwordConfirm = data.get("password-confirm")?.toString();

        // Validation checks
        if (!username) return fail(422, { username, error: "A username is required." });
        if (!email) return fail(422, { username, error: "An email is required." });

        // Email must be @taylor.edu
        const domain = email.split("@")[1]?.toLowerCase();
        if (domain !== "taylor.edu") return fail(422, { username, error: "Email must be a @taylor.edu address." });

        // Obscenity check
        if (matcher.hasMatch(username)) {
            return fail(422, { username, error: "Please choose a different username." });
        }

        // Password checks
        if (!password) return fail(422, { username, error: "A password is required." });
        if (password.length < 8) return fail(422, { username, error: "Password must be at least 8 characters long." });
        if (password.length > 32) return fail(422, { username, error: "Password cannot be more than 32 characters long." });
        if (username.length > 32) return fail(422, { username, error: "Username cannot be more than 32 characters long." });
        if (password !== passwordConfirm) return fail(422, { username, error: "Your passwords must match." });

        // Signup
        const signupResp = await auth.signup({
            username,
            email,
            password,
            passwordConfirm,
            opts: { cookies: event.cookies },
        });

        if (signupResp.isErr()) {
            return fail(500, { username, error: String(signupResp.error) });
        }

        const newUser = signupResp.value;

        // Send verification email
        try {
            await sendVerificationEmail(email, username, newUser.verificationToken);
        } catch (err) {
            console.error("Email send failed:", err);
        }

        // Sign in immediately
        const loginResp = await auth.login({
            email,
            password,
            opts: { cookies: event.cookies },
        });

        if (loginResp.isErr()) {
            return fail(500, { username, error: String(loginResp.error) });
        }

        const user = loginResp.value;
        delete user.password;

        return { user };
    },
};
