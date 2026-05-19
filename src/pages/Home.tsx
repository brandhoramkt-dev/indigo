import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import MenuSection from "../components/MenuSection";
import Footer from "../components/Footer";
import CoffeeMatchmaker from "../components/CoffeeMatchmaker";
import { CartItem } from "../types";
import { X, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartStep, setCartStep] = useState<"list" | "qr">("list");
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);
  const [promo, setPromo] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "promo"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().isActive) {
        setPromo(docSnap.data());
      } else {
        setPromo(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load cart from local storage
  useEffect(() => {
    const savedCart = localStorage.getItem("indigo-cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error parsing cart:", e);
      }
    }
  }, []);

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem("indigo-cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart(prev => [...prev, item]);
  };

  const removeFromCart = (uniqueId: string) => {
    setCart(prev => prev.filter(item => item.uniqueId !== uniqueId));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + item.finalPrice, 0);

  const isOrderingTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours + minutes / 60;
    return currentTime >= 8.5 && currentTime <= 15;
  };

  const sendOrder = (type: "whatsapp" | "reservation") => {
    let message = "";
    
    if (type === "reservation") {
      message = "*¡Hola Indigo Coffee! Quisiera reservar un espacio para hoy.* \n¿Podrían confirmarme disponibilidad?";
    } else {
      message = "*¡Hola Indigo Coffee! Quisiera hacer el siguiente pedido:*\n\n";
      
      const itemCounts = cart.reduce((acc: any, item) => {
        let key = item.name;
        const details = [];
        if (item.selectedTemp) details.push(item.selectedTemp);
        if (item.selectedMilk) details.push(`+ ${item.selectedMilk}`);
        if (item.selectedEssence) details.push(`+ ${item.selectedEssence}`);
        
        if (details.length > 0) {
           key += ` (${details.join(', ')})`;
        }

        if (!acc[key]) {
          acc[key] = { count: 0, price: item.finalPrice };
        }
        acc[key].count += 1;
        return acc;
      }, {});

      Object.entries(itemCounts).forEach(([key, data]: [string, any]) => {
        message += `• ${key} (X${data.count})\n`;
      });
      message += `\n*TOTAL: Bs ${total.toFixed(2)}*\n\n`;
      
      if (!isOrderingTime()) {
        message += "_*Nota: Sé que estoy fuera del horario de pedidos (8:30 - 15:00), quisiera consultar si es posible coordinar un delivery._\n\n";
      }
      
      message += `_esito nomás, muchas gracias_`;
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/59176966747?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="relative min-h-screen">
      <Navbar cartCount={cart.length} onOpenCart={() => setIsCartOpen(true)} />
      
      <main>
        <Hero onOpenImageMenu={() => setIsImageMenuOpen(true)} />
        
        {/* Reservation Quick Hook */}
        <section id="reservas" className="py-24 bg-indigo-brand text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <motion.div
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
             >
                <h2 className="text-6xl md:text-8xl font-extenda font-black tracking-tighter uppercase mb-6 leading-none">RESERVA <br /><span className="text-yellow-brand">TU ESPACIO</span></h2>
                <p className="text-indigo-100 text-lg mb-10 max-w-md font-light leading-relaxed">
                  ¿Buscas el lugar perfecto para concentrarte? Reserva tu espacio de co-work y asegura tu productividad con el mejor café de La Paz.
                </p>
                <button 
                  onClick={() => sendOrder("reservation")}
                  className="inline-block bg-white text-indigo-brand font-bold px-10 py-5 rounded-2xl hover:bg-yellow-brand transition-colors tracking-widest text-sm active:scale-95 uppercase"
                >
                  RESERVAR POR WHATSAPP
                </button>
             </motion.div>
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="relative"
             >
                 <div className="bg-white/10 rounded-3xl flex items-center justify-center p-4 border border-white/20 shadow-2xl">
                    <div className="w-full h-full rounded-2xl overflow-hidden border-4 border-white/10">
                       <img 
                         src="/co-work-bolivia-lapaz.webp" 
                         alt="Cowork" 
                         className="w-full h-full object-cover"
                       />
                    </div>
                 </div>
             </motion.div>
          </div>
        </section>

        {promo && (
          <section className="py-24 bg-white overflow-hidden border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <motion.div
                 initial={{ opacity: 0, x: -50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
               >
                  <span className="text-orange-brand font-bold uppercase tracking-widest text-xs mb-4 block font-sans">Especial de Temporada</span>
                  <h2 className="text-5xl md:text-7xl font-extenda font-black tracking-tighter uppercase mb-6 text-indigo-brand leading-none">
                    {promo.title}
                  </h2>
                  <p className="text-gray-500 text-lg mb-10 max-w-md font-light leading-relaxed font-sans whitespace-pre-line">
                    {promo.text}
                  </p>
               </motion.div>
               <motion.div 
                 initial={{ opacity: 0, scale: 0.8 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 className="relative"
               >
                  <div className="bg-indigo-brand/5 rounded-3xl p-4 border border-indigo-brand/10">
                     <div className="w-full h-96 rounded-2xl overflow-hidden shadow-2xl relative">
                        {promo.imageUrl && promo.imageUrl.includes(',') ? (
                          <div className="w-full h-full flex overflow-x-auto hide-scroll snap-x snap-mandatory">
                            {promo.imageUrl.split(',').map((url: string, i: number) => (
                              <img key={i} src={url.trim()} alt="Promo" className="w-full h-full object-cover flex-shrink-0 snap-center" referrerPolicy="no-referrer" />
                            ))}
                          </div>
                        ) : (
                          <img src={promo.imageUrl || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085"} alt="Promo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        )}
                     </div>
                  </div>
               </motion.div>
            </div>
          </section>
        )}

        <section className="bg-bg-warm border-y border-gray-100">
           {!isOrderingTime() && (
             <div className="bg-yellow-brand/10 border-b border-yellow-brand/20 p-4 text-center">
                <p className="text-indigo-dark font-bold text-xs uppercase tracking-widest">
                  ⚠️ Fuera de horario de pedidos (8:30 - 15:00). Consulta disponibilidad de delivery por WhatsApp.
                </p>
             </div>
           )}
           <MenuSection onAddToCart={addToCart} />
        </section>

        {/* Culture Section */}
        <section id="cultura" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-6xl font-extenda font-black text-indigo-brand tracking-tighter uppercase mb-2">Cultura Indigo</h2>
               <p className="text-gray-400 font-editorial text-xl italic tracking-tight">Historias que se cuentan en cada sorbo.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <CultureCard 
                 title="El Origen del Grano"
                 excerpt="Bolivia tiene alturas únicas que dan a nuestro café notas de chocolate y cítricos imposibles de replicar..."
                 image="https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2070&auto=format&fit=crop"
               />
               <CultureCard 
                 title="Arte en el Espacio"
                 excerpt="Más que un café, somos un punto de encuentro para creativos, nómadas digitales y soñadores de La Paz..."
                 image="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop"
               />
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsCartOpen(false); setCartStep("list"); }}
              className="fixed inset-0 bg-indigo-dark/80 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 w-full h-[90vh] md:h-full md:top-0 md:left-auto md:max-w-md bg-white z-[70] shadow-2xl flex flex-col rounded-t-3xl md:rounded-none"
            >
              <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-indigo-brand text-white md:rounded-none rounded-t-3xl">
                <div>
                  <h3 className="font-extenda font-black text-4xl uppercase tracking-tighter">TU PEDIDO</h3>
                  <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-1">Indigo Coffee Hub</p>
                </div>
                <button onClick={() => { setIsCartOpen(false); setCartStep("list"); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4">
                {!isOrderingTime() && (
                  <div className="bg-orange-brand/5 border border-orange-brand/10 p-4 rounded-xl text-orange-brand text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                     Nota: Estás pidiendo fuera del horario estándar (8:30 - 15:00). Coordinaremos tu delivery o recojo vía WhatsApp.
                  </div>
                )}
                
                {cartStep === "list" ? (
                  cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 pt-12">
                      <ShoppingBag size={80} className="mb-4" />
                      <p className="font-sans font-bold uppercase tracking-widest text-sm text-indigo-brand">Tu carrito está vacío</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.uniqueId} className="flex justify-between items-center border-b border-gray-50 pb-4 group">
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-indigo-brand uppercase leading-tight font-sans">{item.name}</h4>
                          <div className="flex gap-2 mt-1">
                             {item.selectedTemp && (
                                <span className="text-[8px] font-bold bg-orange-brand/10 text-orange-brand px-2 py-0.5 rounded-md uppercase tracking-wider">{item.selectedTemp}</span>
                             )}
                             {item.selectedMilk && (
                                <span className="text-[8px] font-bold bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-md uppercase tracking-wider">{item.selectedMilk}</span>
                             )}
                             {item.selectedEssence && (
                                <span className="text-[8px] font-bold bg-indigo-brand/10 text-indigo-brand px-2 py-0.5 rounded-md uppercase tracking-wider">{item.selectedEssence}</span>
                             )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400 font-black text-sm font-sans whitespace-nowrap">Bs {item.finalPrice}</span>
                          <button 
                            onClick={() => removeFromCart(item.uniqueId)}
                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <p className="text-xs font-black uppercase tracking-widest text-indigo-brand mb-6 leading-relaxed">
                      Escanea el QR para pagar tu orden.<br/>Y prepara tu comprobante para enviarlo.
                    </p>
                    <img src="/indigo-qr-yape.png" alt="QR Yape" className="w-64 h-64 md:w-80 md:h-80 object-contain mb-4 rounded-2xl border border-gray-100 p-4 shadow-sm" />
                    
                    <a 
                      href="/indigo-qr-yape.png" 
                      download="Indigo-QR.png"
                      className="mb-8 text-[10px] text-indigo-brand font-bold uppercase tracking-widest hover:text-orange-brand transition-colors flex items-center gap-2 border border-indigo-brand/20 px-4 py-2 rounded-full"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      Descargar QR
                    </a>

                    <button 
                      onClick={() => setCartStep("list")}
                      className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-indigo-brand transition-colors underline"
                    >
                      Volver al detalle del pedido
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-between items-end mb-6">
                   <span className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">Subtotal a Pagar</span>
                   <span className="font-sans font-black text-3xl md:text-5xl text-indigo-brand">Bs {total.toFixed(2)}</span>
                </div>

                {cartStep === "list" ? (
                  <button 
                    onClick={() => setCartStep("qr")}
                    disabled={cart.length === 0}
                    className="w-full bg-indigo-brand hover:bg-orange-brand text-white py-4 md:py-5 rounded-2xl font-bold tracking-[0.2em] transition-all shadow-xl shadow-indigo-brand/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                  >
                    CONFIRMAR PEDIDO
                  </button>
                ) : (
                  <button 
                    onClick={() => sendOrder("whatsapp")}
                    disabled={cart.length === 0}
                    className="w-full bg-orange-brand hover:bg-indigo-brand text-white py-4 md:py-5 rounded-2xl font-bold tracking-[0.2em] transition-all shadow-xl shadow-orange-brand/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                  >
                    {isOrderingTime() ? "FINALIZAR PEDIDO (WHATSAPP)" : "CONSULTAR DISPONIBILIDAD"}
                  </button>
                )}

                <button 
                  onClick={() => { clearCart(); setCartStep("list"); }}
                  className="w-full text-gray-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest mt-4 transition-colors"
                >
                  Vaciar Carrito
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Image Menu Modal */}
      <AnimatePresence>
        {isImageMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsImageMenuOpen(false)}
              className="fixed inset-0 bg-indigo-dark/95 backdrop-blur-md z-[80] overflow-y-auto"
            >
              <div className="min-h-screen p-6 md:p-12 flex flex-col items-center justify-start relative">
                 <button 
                   onClick={() => setIsImageMenuOpen(false)}
                   className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-orange-brand text-white rounded-full transition-all"
                 >
                   <X size={24} />
                 </button>
                 
                 <div className="max-w-2xl w-full flex flex-col gap-8 mt-16 md:mt-8 pb-24">
                   <h2 className="text-4xl md:text-5xl font-extenda font-black text-white text-center tracking-tighter uppercase mb-4">NUESTRO <span className="text-orange-brand">MENÚ</span></h2>
                   <img src="/menuanv.png" alt="Menu Anverso" className="w-full rounded-2xl shadow-2xl border-4 border-white/10" />
                 </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Cart Button (Mobile Optimized) */}
      <AnimatePresence>
        {cart.length > 0 && !isCartOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-0 right-0 px-6 z-[55] flex justify-center pointer-events-none"
          >
            <button
              onClick={() => setIsCartOpen(true)}
              className="pointer-events-auto w-full max-w-sm bg-orange-brand text-white px-8 py-4 rounded-full font-bold tracking-[0.2em] uppercase text-xs shadow-2xl shadow-orange-brand/30 flex items-center justify-between border-2 border-white/20 active:scale-95 transition-transform"
            >
              <span className="flex items-center gap-2"><ShoppingBag size={18} /> VER PEDIDO ({cart.length})</span>
              <span>Bs {total.toFixed(2)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CoffeeMatchmaker />
    </div>
  );
}

function CultureCard({ title, excerpt, image }: { title: string, excerpt: string, image: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group cursor-pointer"
    >
       <div className="relative h-80 rounded-3xl overflow-hidden mb-6">
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-brand/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
       </div>
       <h3 className="font-extenda font-black text-3xl text-indigo-brand uppercase group-hover:text-orange-brand transition-colors mb-4">{title}</h3>
       <p className="text-gray-500 font-light leading-relaxed mb-6 font-sans">{excerpt}</p>
       <span className="text-orange-brand font-bold text-sm tracking-widest flex items-center gap-2 font-sans">LEER MÁS <X size={16} className="rotate-45" /></span>
    </motion.div>
  );
}
