export interface WeightOption {
  label: string;
  price?: number;
}

/**
 * Parses weight presentation string into structured options with label and optional price.
 * Supports formats:
 * - "300g ($35.00), 500g ($50.00)"
 * - "300g:35, 500g:50"
 * - "300g - $35, 500g - $50"
 * - "300g, 500g, 1 kg" (plain weights, fallback to basePrice)
 */
export function parseWeightOptions(weightStr: string | null | undefined, basePrice: number): WeightOption[] {
  if (!weightStr || typeof weightStr !== 'string' || !weightStr.trim()) {
    return [];
  }

  const items = weightStr.split(',').map(s => s.trim()).filter(Boolean);
  const options: WeightOption[] = [];

  for (const item of items) {
    // Format 1: "300g ($35.00)" or "300g ($35)"
    const parenMatch = item.match(/^(.+?)\s*\(\$?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:USD)?\)$/i);
    if (parenMatch) {
      const label = parenMatch[1].trim();
      const price = parseFloat(parenMatch[2]);
      options.push({
        label,
        price: !isNaN(price) && price > 0 ? price : basePrice
      });
      continue;
    }

    // Format 2: "300g:35" or "300g : $35.00"
    const colonMatch = item.match(/^(.+?)\s*:\s*\$?([0-9]+(?:\.[0-9]+)?)$/);
    if (colonMatch) {
      const label = colonMatch[1].trim();
      const price = parseFloat(colonMatch[2]);
      options.push({
        label,
        price: !isNaN(price) && price > 0 ? price : basePrice
      });
      continue;
    }

    // Format 3: "300g - $35"
    const dashMatch = item.match(/^(.+?)\s+-\s+\$?([0-9]+(?:\.[0-9]+)?)$/);
    if (dashMatch) {
      const label = dashMatch[1].trim();
      const price = parseFloat(dashMatch[2]);
      options.push({
        label,
        price: !isNaN(price) && price > 0 ? price : basePrice
      });
      continue;
    }

    // Format 4: Plain string (e.g. "300g")
    options.push({
      label: item,
      price: basePrice
    });
  }

  return options;
}

/**
 * Formats a weight option with its price for display/saving.
 * e.g. formatWeightString("500g", 50) -> "500g ($50.00)"
 */
export function formatWeightEntry(label: string, price?: number | null): string {
  const cleanLabel = label.replace(/\s*\(\$?[0-9.]+(?:\s*USD)?\)$/i, '').replace(/:\s*\$?[0-9.]+$/, '').trim();
  if (price !== undefined && price !== null && !isNaN(price) && price > 0) {
    return `${cleanLabel} ($${Number(price).toFixed(2)})`;
  }
  return cleanLabel;
}
