import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const GET = async ({ params }) => {
  const { id } = params;
  
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
      .execute();

    if (user.length === 0) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    return json({ username: user[0].username });
  } catch (err) {
    return json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
};
