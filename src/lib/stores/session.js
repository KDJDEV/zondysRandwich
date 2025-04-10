import debug from "debug";
import { writable } from "svelte/store";

const log = debug("app:lib:stores:session");

// Initialize the session store with a default value
export const session = writable({ user: null });

session.subscribe((session) => log("session:", session));