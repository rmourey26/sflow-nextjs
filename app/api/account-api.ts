const deletedUsers = new Set<string>();

export async function DELETE(request: Request) {
  const email = request.headers.get('x-saverflow-email') ?? 'guest@saverflow.app';
  deletedUsers.add(email.toLowerCase());

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const email = typeof payload?.email === 'string' ? payload.email.toLowerCase() : 'guest@saverflow.app';

  return new Response(
    JSON.stringify({
      ok: true,
      exportId: `export-${Date.now()}`,
      email,
    }),
    {
      status: 202,
      headers: { 'Content-Type': 'application/json' },
    },
  );
}
