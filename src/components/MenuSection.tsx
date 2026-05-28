import React, { useState, useEffect } from "react";
import { useFirestoreCollection } from "../lib/hooks";
import { Product, Category, CartItem } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Plus, Minus, Info, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { translateProducts } from "../lib/translator";

export default function MenuSection({ onAddToCart, disabled }: { onAddToCart: (item: CartItem) => void, disabled?: boolean }) {
  const { t, i18n } = useTranslation();
  const { data: products, loading } = useFirestoreCollection<Product>("products");
  
  const [translatedProducts, setTranslatedProducts] = useState<Product[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const categories = Array.from(new Set(translatedProducts.map(p => p.category))).filter(Boolean).sort();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [menuOptions, setMenuOptions] = useState<{milks: string[], essences: string[]}>({
    milks: ["Entera", "Deslactosada", "Almendra", "Avena"],
    essences: ["Sin Esencia", "Vainilla", "Caramelo", "Avellana"]
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "menuOptions"), (docSnap) => {
      if (docSnap.exists()) {
        setMenuOptions(docSnap.data() as any);
      }
    });
    return () => unsubscribe();
  }, []);

  // Translate products dynamically
  useEffect(() => {
    if (loading || products.length === 0) return;
    
    let isMounted = true;
    const runTranslation = async () => {
      if (i18n.language.startsWith("es")) {
        setTranslatedProducts(products);
      } else {
        setIsTranslating(true);
        const result = await translateProducts(products, i18n.language);
        if (isMounted) {
          setTranslatedProducts(result);
          setIsTranslating(false);
        }
      }
    };
    
    runTranslation();
    return () => { isMounted = false; };
  }, [products, loading, i18n.language]);

  // Auto-select first category that has products if current one is empty (only on first load)
  useEffect(() => {
    if (!loading && !isTranslating && translatedProducts.length > 0 && !hasAutoSelected) {
      if (!selectedCategory || !categories.includes(selectedCategory)) {
        setSelectedCategory(categories[0] || "");
      }
      setHasAutoSelected(true);
    }
  }, [loading, isTranslating, translatedProducts.length, hasAutoSelected, selectedCategory, categories]);

  const filteredProducts = translatedProducts.filter(p => p.category === selectedCategory);

  return (
    <section id="menu" className="py-24 px-6 max-w-7xl mx-auto min-h-[600px]">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          <span className="text-orange-brand font-bold uppercase tracking-widest text-xs mb-2 block font-sans">{t("menu.barista", "Selección de Barista")}</span>
          <h2 className="text-5xl md:text-7xl font-extenda font-black text-indigo-brand tracking-tighter uppercase leading-none" dangerouslySetInnerHTML={{ __html: t("menu.title", 'NUESTRO <span class="text-orange-brand italic">Menú</span>') }}></h2>
        </div>
      </div>

      <AnimatePresence>
        {!isMenuExpanded ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, overflow: "hidden" }}
            className="flex justify-center py-12"
          >
            <button 
              onClick={() => setIsMenuExpanded(true)}
              className="bg-indigo-brand hover:bg-orange-brand text-white font-bold py-6 px-12 rounded-[2rem] text-sm md:text-base tracking-[0.2em] transition-all shadow-2xl active:scale-95 flex items-center gap-4 uppercase"
            >
              {t("menu.viewAndOrder", "VER MENÚ Y REALIZAR PEDIDO")} <Plus size={24} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-12"
          >
            <div className="flex items-center gap-2 overflow-x-auto pb-4 -mx-6 px-6 hide-scroll w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${selectedCategory === cat ? "bg-indigo-brand text-white shadow-xl" : "bg-white text-gray-400 hover:text-indigo-brand border border-gray-100"}`}
            >
              {cat}
            </button>
          ))}
        </div>

      {loading || isTranslating ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="animate-spin text-orange-brand" size={48} />
          {isTranslating && <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Translating menu with AI...</p>}
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={onAddToCart} menuOptions={menuOptions} disabled={disabled} />
            ))}
          </AnimatePresence>
          {filteredProducts.length === 0 && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="col-span-full text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200"
             >
                <p className="text-gray-400 font-sans font-bold uppercase tracking-[0.2em] text-[10px]">{t("menu.comingSoon", "Próximamente: Delicias en esta categoría")}</p>
             </motion.div>
          )}
        </motion.div>
      )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

interface ProductCardProps {
  product: Product;
  menuOptions: { milks: string[], essences: string[] };
  onAdd: (item: CartItem) => void;
  disabled?: boolean;
}

function ProductCard({ product, onAdd, menuOptions, disabled }: ProductCardProps) {
  const [temp, setTemp] = useState<"Caliente" | "Frío">("Caliente");
  const [essence, setEssence] = useState<string>("");
  const [milk, setMilk] = useState<string>("");
  const { t } = useTranslation();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-orange-brand/30 hover:shadow-2xl transition-all relative overflow-hidden flex flex-col justify-between h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-extenda font-black text-xl md:text-2xl text-indigo-brand group-hover:text-orange-brand transition-colors leading-none mb-2 uppercase">{product.name}</h3>
          <p className="text-gray-400 text-xs md:text-sm font-light leading-relaxed font-sans line-clamp-3">{product.description}</p>
        </div>
        <div className="text-right ml-4">
          <span className="font-extenda font-black text-2xl md:text-3xl text-indigo-brand whitespace-nowrap">Bs {product.price}</span>
        </div>
      </div>

      <div className="space-y-3 font-sans mt-auto">
        {product.hasTemperatureOptions && (
          <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl">
            {(["Caliente", "Frío"] as const).map(t_opt => (
              <button
                key={t_opt}
                onClick={() => setTemp(t_opt)}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all ${temp === t_opt ? "bg-white text-indigo-brand shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                {t_opt === "Caliente" ? t("menu.hot", "Caliente") : t("menu.cold", "Frío")}
              </button>
            ))}
          </div>
        )}

        {product.hasMilkOptions && menuOptions.milks.length > 0 && (
          <div className="bg-gray-50 rounded-xl px-3 py-2 mt-2">
             <span className="block text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t("menu.chooseMilk", "Elige tu leche:")}</span>
             <select 
               value={milk} 
               onChange={(e) => setMilk(e.target.value)}
               className="w-full bg-transparent text-[10px] font-bold uppercase tracking-wider text-indigo-brand focus:outline-none cursor-pointer"
             >
               <option value="">{t("menu.select", "Selecciona...")}</option>
               {menuOptions.milks.map(m => <option key={m} value={m}>{m}</option>)}
             </select>
          </div>
        )}

        {product.hasEssenceOptions && menuOptions.essences.length > 0 && (
          <div className="bg-gray-50 rounded-xl px-3 py-2 mt-2">
             <span className="block text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t("menu.chooseEssence", "Elige tu esencia:")}</span>
             <select 
               value={essence} 
               onChange={(e) => setEssence(e.target.value)}
               className="w-full bg-transparent text-[10px] font-bold uppercase tracking-wider text-indigo-brand focus:outline-none cursor-pointer"
             >
               <option value="">{t("menu.select", "Selecciona...")}</option>
               {menuOptions.essences.map(e => <option key={e} value={e === "Sin Esencia" ? "" : e}>{e}</option>)}
             </select>
          </div>
        )}

        <button
          onClick={() => onAdd({ 
            ...product, 
            uniqueId: Math.random().toString(36), 
            selectedTemp: product.hasTemperatureOptions ? temp : undefined, 
            selectedEssence: (product.hasEssenceOptions && essence) ? essence : undefined, 
            selectedMilk: (product.hasMilkOptions && milk) ? milk : undefined, 
            finalPrice: product.price 
          })}
          disabled={!product.available || disabled}
          className={`w-full py-3 rounded-xl font-bold text-[10px] md:text-xs tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2 ${product.available && !disabled ? "bg-indigo-brand text-white hover:bg-orange-brand" : "bg-gray-100 text-gray-300 cursor-not-allowed"}`}
        >
          {product.available ? (
            <>
              {t("menu.add", "AGREGAR AL PEDIDO")}
              <Plus size={16} />
            </>
          ) : t("menu.soldOut", "AGOTADO")}
        </button>
      </div>
      
      {!product.available && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
           <span className="bg-gray-900 text-white px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">{t("menu.temporarilySoldOut", "Temporalmente Agotado")}</span>
        </div>
      )}
    </motion.div>
  );
}
