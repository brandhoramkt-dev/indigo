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
