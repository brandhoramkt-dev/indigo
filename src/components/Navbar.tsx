import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Coffee, ShoppingBag, Menu, X, Instagram, Facebook } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { motion, AnimatePresence } from "motion/react";

export default function Navbar({ cartCount, onOpenCart }: { cartCount: number, onOpenCart: () => void }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Inicio", href: "#home" },
    { name: "Menú", href: "#menu" },
    { name: "Reservas", href: "#reservas" },
    { name: "Cultura", href: "#cultura" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-4 group">
          <img src="/icono.png" alt="Indigo Icon" className="h-10 object-contain" />
          <img src="/logo.png" alt="Indigo Logo" className="h-6 object-contain hidden sm:block" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className={`text-sm font-medium tracking-wide uppercase group relative ${isScrolled ? "text-gray-600 hover:text-indigo-brand" : "text-white/80 hover:text-white"}`}
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-brand transition-all group-hover:w-full"></span>
            </a>
          ))}
          
          <div className="flex items-center gap-4 ml-4">
            <div className={`flex items-center gap-3 pr-4 border-r ${isScrolled ? "border-gray-200 text-gray-400" : "border-white/20 text-white/70"}`}>
               <a href="https://www.instagram.com/indigo.coffee.bo" target="_blank" rel="noopener noreferrer" className="hover:text-orange-brand transition-colors"><Instagram size={18} /></a>
               <a href="https://www.facebook.com/profile.php?id=61583564830212" target="_blank" rel="noopener noreferrer" className="hover:text-orange-brand transition-colors"><Facebook size={18} /></a>
               <a href="https://www.tiktok.com/@indigocoffee.bo" target="_blank" rel="noopener noreferrer" className="hover:text-orange-brand transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg></a>
               <a href="https://wa.me/59176966747" target="_blank" rel="noopener noreferrer" className="hover:text-orange-brand transition-colors ml-1"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></a>
            </div>

            <button 
              onClick={onOpenCart}
              className={`relative p-2 rounded-full transition-colors ${isScrolled ? "bg-gray-100 text-gray-600 hover:bg-indigo-50" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-brand text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className={`md:hidden p-2 ${isScrolled ? "text-indigo-brand" : "text-white"}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white shadow-xl py-8 px-6 flex flex-col gap-6 md:hidden"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-display font-medium text-indigo-brand"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-6 border-t border-gray-100 flex flex-col gap-6">
               <div className="flex items-center gap-6 text-gray-400">
                 <a href="https://www.instagram.com/indigo.coffee.bo" target="_blank" rel="noopener noreferrer"><Instagram size={24} /></a>
                 <a href="https://www.facebook.com/profile.php?id=61583564830212" target="_blank" rel="noopener noreferrer"><Facebook size={24} /></a>
                 <a href="https://www.tiktok.com/@indigocoffee.bo" target="_blank" rel="noopener noreferrer"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg></a>
                 <a href="https://wa.me/59176966747" target="_blank" rel="noopener noreferrer"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></a>
               </div>
               <div className="flex items-center justify-end">
                 <button 
                   onClick={() => { setIsMobileMenuOpen(false); onOpenCart(); }}
                   className="flex items-center gap-2 text-indigo-brand font-bold"
                 >
                   <ShoppingBag size={20} /> CARRITO ({cartCount})
                 </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
