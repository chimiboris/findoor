/**
 * Coordonnées officielles de la plateforme Findoor (et non d'un propriétaire) — affichées dans le
 * footer, utilisées comme fallback de contact WhatsApp/email partout où c'est pertinent.
 * Alignées sur le compte administrateur principal (voir backend DataSeeder.ADMIN_TELEPHONE/EMAIL).
 */
export const PLATFORM_PHONE_DISPLAY = '+237 695 63 75 55';
export const PLATFORM_PHONE_DIGITS = '237695637555';
export const PLATFORM_WHATSAPP_URL = `https://wa.me/${PLATFORM_PHONE_DIGITS}`;
export const PLATFORM_EMAIL = 'findoor100@gmail.com';

/** Construit une URL WhatsApp vers un numéro camerounais donné (celui d'un propriétaire), avec message pré-rempli optionnel. */
export function whatsappUrlFor(telephone: string | null | undefined, message?: string): string | null {
  if (!telephone) return null;
  let digits = telephone.replace(/[^\d]/g, '');
  if (!digits) return null;
  if (!digits.startsWith('237')) digits = `237${digits.replace(/^0+/, '')}`;
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
