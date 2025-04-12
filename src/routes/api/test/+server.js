export const POST = async ({ request }) => {
    const body = await request.text();
    console.log('Got POST:', body);
    return new Response('OK', { status: 200 });
  };
  