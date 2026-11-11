import { CartItem, Product } from "../types";

export interface ParsedExtra {
  name: string;
  cleanName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

/**
 * Known catalog pricing for extras from Firestore (category: EXTRAS):
 * - "Leche de Almendra y Avena": Bs 4
 * - "Esencia": Bs 4
 * - "Shot de Espresso": Bs 3
 * 
 * Free / neutral options:
 * - "Entera", "Deslactosada", "Sin Esencia", "Caliente", "Frío": Bs 0
 */
export function parseExtra(input: any, defaultQty = 1, extraType?: 'milk' | 'essence' | 'flavor' | 'shot'): ParsedExtra {
  if (!input) {
    return { name: "", cleanName: "", unitPrice: 0, quantity: 0, totalPrice: 0 };
  }

  if (typeof input === "object" && input !== null) {
    const unitPrice = Number(input.unitPrice ?? input.price ?? 0) || 0;
    const quantity = Number(input.quantity ?? defaultQty ?? 1) || 1;
    const name = String(input.name || "");
    return {
      name,
      cleanName: name,
      unitPrice,
      quantity,
      totalPrice: Number((unitPrice * quantity).toFixed(2))
    };
  }

  const str = String(input).trim();
  const lower = str.toLowerCase();

  // 1. Free / neutral check
  if ([
    "sin esencia", 
    "ninguno", 
    "ninguna", 
    "entera", 
    "deslactosada", 
    "regular", 
    "normal", 
    "caliente", 
    "frio", 
    "frío", 
    ""
  ].includes(lower)) {
    return { name: str, cleanName: str, unitPrice: 0, quantity: 0, totalPrice: 0 };
  }

  // 2. Quantity extraction
  let quantity = defaultQty && defaultQty > 0 ? defaultQty : 1;
  const qtyMatch = str.match(/(?:^|\s|\()(\d+)\s*[xX*](?:\s|\)|$)|\b[xX*]\s*(\d+)\b|\((\d+)\s*(?:unidades?|u|shots?)\)/i);
  if (qtyMatch) {
    quantity = parseInt(qtyMatch[1] || qtyMatch[2] || qtyMatch[3], 10);
  }

  // 3. Explicit price extraction
  let unitPrice = 0;
  const bsPattern = /(?:[+(:\-\s]|^)Bs\.?\s*(\d+(?:[.,]\d+)?)/i;
  const postBsPattern = /(\d+(?:[.,]\d+)?)\s*Bs/i;
  const parenPattern = /\(\s*[+]?\s*(\d+(?:[.,]\d+)?)\s*\)/;
  const plusPattern = /(?:\+)\s*(\d+(?:[.,]\d+)?)/;
  const colonPattern = /:\s*(\d+(?:[.,]\d+)?)/;
  const dashPattern = /-\s*(\d+(?:[.,]\d+)?)/;

  let match = str.match(bsPattern);
  if (match) {
    unitPrice = parseFloat(match[1].replace(",", "."));
  } else if ((match = str.match(postBsPattern))) {
    unitPrice = parseFloat(match[1].replace(",", "."));
  } else if ((match = str.match(parenPattern))) {
    unitPrice = parseFloat(match[1].replace(",", "."));
  } else if ((match = str.match(plusPattern))) {
    unitPrice = parseFloat(match[1].replace(",", "."));
  } else if ((match = str.match(colonPattern))) {
    unitPrice = parseFloat(match[1].replace(",", "."));
  } else if ((match = str.match(dashPattern))) {
    unitPrice = parseFloat(match[1].replace(",", "."));
  } else {
    // 4. Fallback to catalog prices from Firestore menu (category: EXTRAS)
    if (extraType === "essence" && lower !== "sin esencia") {
      unitPrice = 4; // Price of "Esencia" in EXTRAS category
    } else if (extraType === "milk" && (lower.includes("almendra") || lower.includes("avena"))) {
      unitPrice = 4; // Price of "Leche de Almendra y Avena" in EXTRAS category
    } else if (lower.includes("almendra") || lower.includes("avena")) {
      unitPrice = 4;
    } else if (["vainilla", "coco", "chai", "frutos rojos", "avellana", "caramelo"].includes(lower)) {
      unitPrice = 4;
    } else if (lower.includes("shot") || lower.includes("espresso")) {
      unitPrice = 3;
    }
  }

  return {
    name: str,
    cleanName: str,
    unitPrice,
    quantity,
    totalPrice: Number((unitPrice * quantity).toFixed(2))
  };
}

/**
 * Calculates the unit price of a product including all its selected extras.
 */
export function calculateProductUnitPrice(
  basePrice: number,
  options: {
    milk?: any;
    milkQty?: number;
    essence?: any;
    essenceQty?: number;
    flavor?: any;
    flavorQty?: number;
    extras?: any[];
  }
): number {
  let extrasTotal = 0;

  if (options.milk) {
    extrasTotal += parseExtra(options.milk, options.milkQty, 'milk').totalPrice;
  }
  if (options.essence) {
    extrasTotal += parseExtra(options.essence, options.essenceQty, 'essence').totalPrice;
  }
  if (options.flavor) {
    extrasTotal += parseExtra(options.flavor, options.flavorQty, 'flavor').totalPrice;
  }
  if (Array.isArray(options.extras)) {
    for (const extra of options.extras) {
      extrasTotal += parseExtra(extra).totalPrice;
    }
  }

  return Number(((basePrice || 0) + extrasTotal).toFixed(2));
}

/**
 * Calculates unit price of a CartItem
 */
export function calculateCartItemUnitPrice(item: CartItem): number {
  const basePrice = Number(item.price) || 0;
  const extraList = Array.isArray(item.extras)
    ? item.extras.filter((e: any) => {
        const eName = typeof e === 'object' ? e.name : String(e);
        if (item.selectedMilk && eName.includes(item.selectedMilk)) return false;
        if (item.selectedEssence && eName.includes(item.selectedEssence)) return false;
        return true;
      })
    : [];

  return calculateProductUnitPrice(basePrice, {
    milk: item.selectedMilk,
    essence: item.selectedEssence,
    flavor: item.selectedFlavor,
    extras: extraList
  });
}

/**
 * Calculates total price for a CartItem line item (unit price * item quantity).
 */
export function calculateCartItemTotal(item: CartItem): number {
  const unitPrice = item.finalPrice > 0 ? item.finalPrice : calculateCartItemUnitPrice(item);
  const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
  return Number((unitPrice * qty).toFixed(2));
}

/**
 * Calculates total price of the entire cart.
 */
export function calculateCartTotal(cart: CartItem[]): number {
  const sum = cart.reduce((acc, item) => acc + calculateCartItemTotal(item), 0);
  return Number(sum.toFixed(2));
}
