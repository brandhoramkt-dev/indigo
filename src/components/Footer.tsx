import { Coffee, Instagram, Facebook, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-indigo-dark text-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-orange-brand rounded-lg flex items-center justify-center text-white">
                <Coffee size={18} />
              </div>
              <span className="font-extenda font-black text-2xl tracking-tighter uppercase">INDIGO</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-xs font-sans">
              Tu hogar fuera de casa en el corazón de La Paz. Café de especialidad, comunidad y el espacio que necesitas para crear.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/indigo.coffee.bo" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-indigo-dark transition-all">
                <Instagram size={18} />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61583564830212" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-indigo-dark transition-all">
                <Facebook size={18} />
              </a>
              <a href="https://www.tiktok.com/@indigocoffee.bo" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-indigo-dark transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-extenda font-bold uppercase tracking-widest text-xs text-yellow-brand mb-8">Navegación</h4>
            <ul className="space-y-4 font-sans">
              {["Inicio", "Menú", "Reservas", "Cultura", "Contacto"].map(item => (
                <li key={item}><a href={`#${item.toLowerCase()}`} className="text-white/60 hover:text-white transition-colors text-sm">{item}</a></li>
              ))}
            </ul>
          </div>
          
          <div>
             <h4 className="font-extenda font-bold uppercase tracking-widest text-xs text-yellow-brand mb-8">Horarios</h4>
             <ul className="space-y-4 text-white/60 text-sm font-sans">
                <li className="flex justify-between"><span>Lun - Vie</span> <span>08:00 - 21:00</span></li>
                <li className="flex justify-between"><span>Sáb - Dom</span> <span>09:00 - 17:00</span></li>
             </ul>
          </div>

          <div>
             <h4 className="font-extenda font-bold uppercase tracking-widest text-xs text-yellow-brand mb-8">Ubicación</h4>
             <a href="https://maps.app.goo.gl/F4Xfnf9PK2kkyTvp8" target="_blank" rel="noopener noreferrer" className="block text-white/60 text-sm leading-relaxed mb-4 font-sans hover:text-white transition-colors">
                Calle 18 de Calacoto, San Miguel.<br />
                La Paz, Bolivia.<br />
                <span className="text-orange-brand font-bold text-xs mt-2 inline-block">Ver en Google Maps →</span>
             </a>
             <p className="text-white/60 text-sm font-sans mb-4">
                <span className="block font-bold mb-1">WhatsApp:</span>
                <a href="https://wa.me/59176966747" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">+591 76966747</a>
             </p>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-widest font-bold text-white/20">
          <p>© 2026 Indigo Coffee. Todos los derechos reservados.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
