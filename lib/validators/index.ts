import { z } from 'zod';

export const emailSchema = z.string().trim().min(1, 'Email is required').email('Enter a valid email');

export const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(80, 'Keep it under 80 characters');

export const waitlistSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    intent: z.enum(['trial', 'waitlist']).default('waitlist'),
    honeypot: z.string().optional(),
  })
  .refine((value) => !value.honeypot, {
    message: 'Invalid submission',
    path: ['honeypot'],
  });

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  message: z.string().trim().min(10, 'Tell us a little more so we can help').max(1000),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
