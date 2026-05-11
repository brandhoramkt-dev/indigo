import React, { useState, useEffect } from "react";
import { useFirestoreCollection } from "../lib/hooks";
import { Product, Category, CartItem } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus, Info } from "lucide-react";

export default function MenuSection({ onAddToCart }: { onAddToCart: (item: CartItem) => void }) {
  const { data: products, loading } = useFirestoreCollection<Product>("products");
  const categories = Object.values(Category);
  const [selectedCategory, setSelectedCategory] = useState<string>(Category.CLASSICS);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  // Auto-select first category that has products if current one is empty (only on first load)
  useEffect(() => {
    if (!loading && products.length > 0 && !hasAutoSelected) {
      const currentHasProducts = products.some(p => p.category === selectedCategory);
      if (!currentHasProducts) {
        const firstWithProducts = categories.find(cat => 
          products.some(p => p.category === cat)
        );
        if (firstWithProducts) {
          setSelectedCategory(firstWithProducts);
        }
      }
      setHasAutoSelected(true);
    }
  }, [loading, products.length, hasAutoSelected, selectedCategory, categories]);

  const filteredProducts = products.filter(p => p.category === selectedCategory);

  return (
    <section id="menu" className="py-24 px-6 max-w-7xl mx-auto min-h-[600px]">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          <span className="text-orange-brand font-bold uppercase tracking-widest text-xs mb-2 block font-sans">Selección de Barista</span>
          <h2 className="text-5xl md:text-7xl font-extenda font-black text-indigo-brand tracking-tighter uppercase leading-none">NUESTRO <span className="text-orange-brand italic">Menú</span></h2>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-4 -mx-6 px-6 hide-scroll w-full md:w-auto">
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
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-3xl p-8 h-64 animate-pulse border border-gray-100"></div>
          ))}
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={onAddToCart} />
            ))}
          </AnimatePresence>
          {filteredProducts.length === 0 && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="col-span-full text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200"
             >
                <p className="text-gray-400 font-sans font-bold uppercase tracking-[0.2em] text-[10px]">Próximamente: Delicias en esta categoría</p>
             </motion.div>
          )}
        </motion.div>
      )}
    </section>
  );
}

interface ProductCardProps {
  product: Product;
  onAdd: (item: CartItem) => void;
  key?: string | number;
}

function ProductCard({ product, onAdd }: ProductCardProps) {
  const [temp, setTemp] = useState<"Caliente" | "Frío">("Caliente");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group bg-white rounded-3xl p-8 border border-gray-100 hover:border-orange-brand/30 hover:shadow-2xl transition-all relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h3 className="font-extenda font-black text-3xl text-indigo-brand group-hover:text-orange-brand transition-colors leading-none mb-2 uppercase">{product.name}</h3>
          <p className="text-gray-400 text-sm font-light leading-relaxed font-sans">{product.description}</p>
        </div>
        <div className="text-right ml-4">
          <span className="font-extenda font-black text-3xl text-indigo-brand">Bs {product.price}</span>
        </div>
      </div>

      <div className="space-y-4 font-sans">
        {product.hasTemperatureOptions && (
          <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl">
            {(["Caliente", "Frío"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTemp(t)}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all ${temp === t ? "bg-white text-indigo-brand shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => onAdd({ ...product, uniqueId: Math.random().toString(36), selectedTemp: temp, finalPrice: product.price })}
          disabled={!product.available}
          className={`w-full py-4 rounded-2xl font-bold text-xs tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2 ${product.available ? "bg-indigo-brand text-white hover:bg-orange-brand" : "bg-gray-100 text-gray-300 cursor-not-allowed"}`}
        >
          {product.available ? (
            <>
              AGREGAR AL PEDIDO
              <Plus size={16} />
            </>
          ) : "AGOTADO"}
        </button>
      </div>
      
      {!product.available && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
           <span className="bg-gray-900 text-white px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Temporalmente Agotado</span>
        </div>
      )}
    </motion.div>
  );
}
