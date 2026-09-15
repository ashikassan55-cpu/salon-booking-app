/**
 * Normalizes a UAE customer-entered phone number into the bare
 * international format wa.me expects (no "+", no leading 0) — e.g.
 * "050 123 4567" -> "971501234567". This is the opposite direction from
 * settings.whatsappNumber (the salon's own number, already stored this
 * way) — this one converts a customer's locally-entered number instead.
 */
export function normalizeUaePhoneForWhatsapp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("971")) return digits;
  if (digits.startsWith("0")) return `971${digits.slice(1)}`;
  return `971${digits}`;
}
