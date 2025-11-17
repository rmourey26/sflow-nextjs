import { waitlistSchema } from '@/lib/validators';

type WaitlistEntry = {
  name: string;
  email: string;
  intent: 'trial' | 'waitlist';
  createdAt: string;
  source?: string;
};

const waitlistStore = new Map<string, WaitlistEntry>();

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = waitlistSchema.parse(payload);

    if (parsed.honeypot) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    const key = parsed.email.toLowerCase();
    const existing = waitlistStore.get(key);

    if (existing) {
      waitlistStore.set(key, { ...existing, name: parsed.name, intent: parsed.intent });
      return new Response(JSON.stringify({ ok: true, duplicate: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const entry: WaitlistEntry = {
      name: parsed.name,
      email: key,
      intent: parsed.intent,
      createdAt: new Date().toISOString(),
      source: request.headers.get('referer') ?? undefined,
    };

    waitlistStore.set(key, entry);

    return new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid data' }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: false, error: 'Something went wrong' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
