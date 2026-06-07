import { z } from "zod";

/**
 * Shared contact-form schema — the single source of truth for validation on both
 * the client (react-hook-form resolver) and the server (/api/contact).
 * The `website` honeypot is intentionally NOT part of this schema; it is checked
 * separately and must be empty for a real submission.
 */
export const contactSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().min(6),
  interest: z.enum(["buy", "sell", "rent", "invest"]),
  budget: z.string().trim().optional().or(z.literal("")),
  area: z.string().trim().optional().or(z.literal("")),
  message: z.string().trim().min(10),
  consent: z.literal(true),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Form values include the honeypot, which the resolver ignores. */
export type ContactFormValues = ContactInput & { website?: string };
