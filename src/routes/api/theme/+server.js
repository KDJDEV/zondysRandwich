import { json } from "@sveltejs/kit";
import { getTodayTheme } from '$lib/theme';

export const GET = async () => {
    const todayTheme = getTodayTheme();
    return json({ theme: todayTheme });
};
