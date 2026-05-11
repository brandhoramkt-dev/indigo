import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Coffee, ShoppingBag, Menu, X, User } from "lucide-react";
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
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="Indigo Logo" className="h-6 object-contain" />
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
            <div className="pt-6 border-t border-gray-100 flex items-center justify-end">
               <button 
                 onClick={() => { setIsMobileMenuOpen(false); onOpenCart(); }}
                 className="flex items-center gap-2 text-indigo-brand font-bold"
               >
                 <ShoppingBag size={20} /> CARRITO ({cartCount})
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
