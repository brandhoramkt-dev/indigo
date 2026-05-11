import { useState, useEffect } from "react";
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
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);

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
    setIsCartOpen(true);
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
      if (cart.length === 0) return;
      message = "*¡Hola Indigo Coffee! Quisiera hacer el siguiente pedido:*\n\n";
      cart.forEach((item, index) => {
        message += `${index + 1}. *${item.name}*`;
        if (item.selectedTemp) message += ` (${item.selectedTemp})`;
        message += ` - Bs ${item.finalPrice}\n`;
      });
      message += `\n*TOTAL: Bs ${total.toFixed(2)}*\n\n`;
      
      if (!isOrderingTime()) {
        message += "_*Nota: Sé que estoy fuera del horario de pedidos (8:30 - 15:00), quisiera consultar si es posible coordinar un delivery._\n\n";
      }
      
      message += `_Enviado desde el Hub de Indigo Coffee_`;
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
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-indigo-dark/80 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-indigo-brand text-white">
                <div>
                  <h3 className="font-extenda font-black text-4xl uppercase tracking-tighter">TU PEDIDO</h3>
                  <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-1">Indigo Coffee Hub</p>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {!isOrderingTime() && (
                  <div className="bg-orange-brand/5 border border-orange-brand/10 p-4 rounded-xl text-orange-brand text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                     Nota: Estás pidiendo fuera del horario estándar (8:30 - 15:00). Coordinaremos tu delivery o recojo vía WhatsApp.
                  </div>
                )}
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20">
                    <ShoppingBag size={80} className="mb-4" />
                    <p className="font-sans font-bold uppercase tracking-widest text-sm text-indigo-brand">Tu carrito está vacío</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.uniqueId} className="flex justify-between items-start border-b border-gray-50 pb-6 group">
                      <div>
                        <h4 className="font-bold text-lg text-indigo-brand uppercase leading-tight font-sans">{item.name}</h4>
                        <div className="flex gap-2 mt-2">
                           {item.selectedTemp && (
                              <span className="text-[9px] font-bold bg-orange-brand/10 text-orange-brand px-2 py-0.5 rounded-md uppercase tracking-wider">{item.selectedTemp}</span>
                           )}
                        </div>
                        <span className="text-gray-400 font-black text-xl mt-2 block font-sans">Bs {item.finalPrice}</span>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.uniqueId)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="p-8 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-between items-end mb-6">
                   <span className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">Subtotal a Pagar</span>
                   <span className="font-sans font-black text-5xl text-indigo-brand">Bs {total.toFixed(2)}</span>
                </div>
                
                {cart.length > 0 && (
                  <div className="mb-6 bg-white p-6 rounded-2xl border border-gray-100 flex flex-col items-center text-center shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-brand mb-4">Escanea para pagar</p>
                    <img src="/indigo-qr-yape.png" alt="QR Yape" className="w-32 h-32 object-contain mb-4 rounded-xl border border-gray-100 p-2" />
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                      Escanea el QR para pagar tu orden.<br/>Luego presiona enviar a WhatsApp con tu comprobante.
                    </p>
                  </div>
                )}

                <button 
                  onClick={() => sendOrder("whatsapp")}
                  disabled={cart.length === 0}
                  className="w-full bg-orange-brand hover:bg-indigo-brand text-white py-5 rounded-2xl font-bold tracking-[0.2em] transition-all shadow-xl shadow-orange-brand/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isOrderingTime() ? "ENVIAR A WHATSAPP" : "CONSULTAR DISPONIBILIDAD"}
                </button>
                <button 
                  onClick={clearCart}
                  className="w-full text-gray-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest mt-6 transition-colors"
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
                   <img src="/menurev.png" alt="Menu Reverso" className="w-full rounded-2xl shadow-2xl border-4 border-white/10" />
                 </div>
              </div>
            </motion.div>
          </>
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
