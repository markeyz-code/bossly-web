import { z } from 'zod';

export const phoneSchema = z.string().min(7, 'Enter a phone number.').refine((v) => Boolean(v.replace(/\D/g, '').match(/^(?:234|0)?[789][01]\d{8}$/)), 'Enter a valid Nigerian phone number.');
export const passwordSchema = z.string().min(8, 'Use at least 8 characters.').regex(/[A-Za-z]/, 'Add at least one letter.').regex(/\d/, 'Add at least one number.');
export const emailSchema = z.string().email('Enter a valid email address.');

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, 'Enter your password.') });
export const registerSchema = z.object({
  name: z.string().min(2, 'What should we call you?'),
  email: emailSchema,
  password: passwordSchema,
  businessName: z.string().min(2, 'Give your business a name.'),
  category: z.string().min(1, 'Pick a category.'),
  phone: phoneSchema.optional().or(z.literal('')),
  referral: z.string().max(80).optional(),
});
export const productSchema = z.object({
  name: z.string().min(2, 'Give the product a name.'),
  category: z.string().min(1, 'Pick a category.'),
  priceKobo: z.number().int().min(1, 'Add a selling price.'),
  costPriceKobo: z.number().int().min(0),
  quantity: z.number().int().min(0),
});
export const expenseSchema = z.object({
  category: z.string().min(1, 'Pick a category.'),
  amountKobo: z.number().int().min(1, 'Enter an amount.'),
  date: z.string().min(1, 'Pick a date.'),
});

export function zodErrors(error: z.ZodError): Record<string, string> {
  const map: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!map[key]) map[key] = issue.message;
  }
  return map;
}
