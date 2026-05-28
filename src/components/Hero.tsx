import { motion } from "motion/react";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Hero({ onOpenImageMenu }: { onOpenImageMenu?: () => void }) {
  const { t } = useTranslation();
  return (
    <section id="home" className="relative h-[95vh] flex items-center justify-center overflow-hidden bg-indigo-dark">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/cafeteria-co-work-bolivia-indigo.webp" 
          alt="Indigo Coffee Shop Background" 
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-dark/60 via-transparent to-indigo-dark"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="text-yellow-brand font-sans font-bold uppercase tracking-[0.3em] text-sm mb-6 block">{t("hero.subtitle", "Tu espacio, tu ritmo")}</span>
          <h1 className="flex flex-col items-center justify-center mb-8">
            <img src="/logo.png" alt="Indigo Coffee Logo" className="h-20 md:h-28 lg:h-36 object-contain mb-2" />
            <span className="text-white font-bold border-t-2 border-b-2 border-white/20 px-4 py-1 mt-2 inline-block font-sans uppercase text-4xl md:text-5xl tracking-widest">COFFEE</span>
          </h1>
          
          <p className="text-white/70 max-w-xl mx-auto text-lg md:text-xl font-light mb-12 leading-relaxed">
            {t("hero.desc", "Olvídate de las filas. Tu bebida favorita lista cuando tú quieras. Reserva tu mesa ideal para trabajar o charlar.")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
            <a 
              href="#menu"
              className="group bg-orange-brand hover:bg-white text-white hover:text-indigo-brand px-8 py-4 rounded-2xl font-bold transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 w-full sm:w-auto text-sm"
            >
              {t("hero.order", "ORDENAR")}
              <ShoppingCart size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <button 
              onClick={onOpenImageMenu}
              className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/30 px-8 py-4 rounded-2xl font-bold transition-all w-full sm:w-auto hover:border-white text-sm"
            >
              {t("hero.viewMenu", "VER MENÚ")}
            </button>
            <a 
              href="#reservas"
              className="bg-indigo-brand/80 hover:bg-indigo-brand text-white backdrop-blur-md px-8 py-4 rounded-2xl font-bold transition-all w-full sm:w-auto text-sm"
            >
              {t("hero.book", "RESERVAR")}
            </a>
          </div>
        </motion.div>
      </div>

      {/* Floating indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-bounce opacity-50">
        <div className="w-0.5 h-12 bg-gradient-to-b from-white to-transparent"></div>
      </div>
    </section>
  );
}
