import { contactSchema } from '@/lib/validators';

type SupportTicket = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

const supportTickets: SupportTicket[] = [];

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = contactSchema.parse(payload);

    supportTickets.push({
      id: `ticket-${supportTickets.length + 1}`,
      name: parsed.name,
      email: parsed.email.toLowerCase(),
      message: parsed.message,
      createdAt: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
