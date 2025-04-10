export async function load(event) {
    const user = event.locals?.user;
    if (!user) return { user: null };
    delete user.token;
    return { user };
}