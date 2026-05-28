import { Product } from "../types";
import { ai } from "./gemini";

const CACHE_KEY = "indigo_translations_";

export async function translateProducts(products: Product[], targetLanguage: string): Promise<Product[]> {
  // If targetLanguage is Spanish, no translation needed
  if (targetLanguage.startsWith("es")) return products;
  
  // We translate to English as universal fallback
  const langKey = "en"; 
  
  const translatedProducts: Product[] = [];
  const productsToTranslate: Product[] = [];

  // Check cache
  for (const product of products) {
    const cached = localStorage.getItem(`${CACHE_KEY}${langKey}_${product.id}`);
    if (cached) {
      try {
        translatedProducts.push({ ...product, ...JSON.parse(cached) });
      } catch(e) {
        productsToTranslate.push(product);
      }
    } else {
      productsToTranslate.push(product);
    }
  }

  if (productsToTranslate.length === 0) {
    // Keep original ordering
    return products.map(p => translatedProducts.find(t => t.id === p.id) || p);
  }

  // Prepare payload for Gemini
  const payload = productsToTranslate.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    category: p.category
  }));

  const prompt = `
Translate the following coffee shop menu items from Spanish to English.
Return strictly a valid JSON array of objects with the exact same 'id' and the translated 'name', 'description', and 'category'.

Input:
${JSON.stringify(payload, null, 2)}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "[]";
    const translations = JSON.parse(text);

    // Merge and cache
    for (const translation of translations) {
      const originalIndex = productsToTranslate.findIndex(p => p.id === translation.id);
      if (originalIndex !== -1) {
        const originalProduct = productsToTranslate[originalIndex];
        const translatedProduct = {
          ...originalProduct,
          name: translation.name || originalProduct.name,
          description: translation.description || originalProduct.description,
          category: translation.category || originalProduct.category
        };
        
        // Cache it
        localStorage.setItem(`${CACHE_KEY}${langKey}_${originalProduct.id}`, JSON.stringify({
          name: translatedProduct.name,
          description: translatedProduct.description,
          category: translatedProduct.category
        }));

        translatedProducts.push(translatedProduct);
      }
    }
    
    // Add any products that failed to translate back as original
    for (const product of productsToTranslate) {
      if (!translations.find((t: any) => t.id === product.id)) {
        translatedProducts.push(product);
      }
    }
  } catch (error) {
    console.error("Translation failed:", error);
    // Fallback to original if translation fails
    return products.map(p => translatedProducts.find(t => t.id === p.id) || p);
  }

  // Keep original ordering
  return products.map(p => translatedProducts.find(t => t.id === p.id) || p);
}

export async function translateContent<T extends { id: string }>(
  items: T[], 
  targetLanguage: string,
  cacheKeyPrefix: string,
  fieldsToTranslate: (keyof T)[]
): Promise<T[]> {
  if (targetLanguage.startsWith("es")) return items;
  
  const langKey = "en"; 
  const translatedItems: T[] = [];
  const itemsToTranslate: T[] = [];

  // Check cache
  for (const item of items) {
    const cached = localStorage.getItem(`${CACHE_KEY}${cacheKeyPrefix}_${langKey}_${item.id}`);
    if (cached) {
      try {
        translatedItems.push({ ...item, ...JSON.parse(cached) });
      } catch(e) {
        itemsToTranslate.push(item);
      }
    } else {
      itemsToTranslate.push(item);
    }
  }

  if (itemsToTranslate.length === 0) {
    return items.map(p => translatedItems.find(t => t.id === p.id) || p);
  }

  // Prepare payload
  const payload = itemsToTranslate.map(p => {
    const obj: any = { id: p.id };
    fieldsToTranslate.forEach(field => {
      obj[field] = p[field];
    });
    return obj;
  });

  const prompt = `
Translate the following items from Spanish to English.
Return strictly a valid JSON array of objects with the exact same 'id' and the translated fields: ${fieldsToTranslate.join(", ")}.

Input:
${JSON.stringify(payload, null, 2)}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });

    const text = response.text || "[]";
    const translations = JSON.parse(text);

    for (const translation of translations) {
      const originalIndex = itemsToTranslate.findIndex(p => p.id === translation.id);
      if (originalIndex !== -1) {
        const originalItem = itemsToTranslate[originalIndex];
        const translatedItem = { ...originalItem } as any;
        const cacheObj: any = {};
        
        fieldsToTranslate.forEach(field => {
          translatedItem[field] = translation[field] || originalItem[field];
          cacheObj[field] = translatedItem[field];
        });
        
        localStorage.setItem(`${CACHE_KEY}${cacheKeyPrefix}_${langKey}_${originalItem.id}`, JSON.stringify(cacheObj));
        translatedItems.push(translatedItem as T);
      }
    }
    
    for (const item of itemsToTranslate) {
      if (!translations.find((t: any) => t.id === item.id)) {
        translatedItems.push(item);
      }
    }
  } catch (error) {
    console.error(`Translation failed for ${cacheKeyPrefix}:`, error);
    return items.map(p => translatedItems.find(t => t.id === p.id) || p);
  }

  return items.map(p => translatedItems.find(t => t.id === p.id) || p);
}
