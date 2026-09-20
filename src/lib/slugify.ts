/**
 * Converts any product name or text into an SEO-friendly URL slug.
 * Example: "Pure Whey Impact 5lb" -> "pure-whey-impact-5lb"
 * Handles Spanish accents, special symbols, multiple spaces, etc.
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // separate accents from characters
    .replace(/[\u0300-\u036f]/g, '') // remove accent diacritics
    .replace(/[^a-z0-9]+/g, '-') // replace spaces & non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, ''); // remove leading/trailing hyphens
}
