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
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-indigo-dark transition-all">
                  <Icon size={18} />
                </a>
              ))}
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
             <p className="text-white/60 text-sm leading-relaxed mb-4 font-sans">
                Calle 18 de Calacoto, San Miguel.<br />
                La Paz, Bolivia.
             </p>
             <iframe 
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1912.441026410313!2d-68.0827297!3d-16.5393437!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x915f212269a96e57%3A0x6d8f8d2235c392c6!2sCalle%2018%2C%20La%20Paz!5e0!3m2!1ses!2sbo!4v1714620000000!5m2!1ses!2sbo" 
               className="w-full h-32 rounded-xl border-0 opacity-40 hover:opacity-100 transition-opacity"
               loading="lazy" 
               referrerPolicy="no-referrer-when-downgrade"
             ></iframe>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-widest font-bold text-white/20">
          <p>© 2026 Indigo Coffee. Todos los derechos reservados.</p>
          <div className="flex gap-8">
            <Link to="/login" className="hover:text-yellow-brand transition-colors text-white/40">Acceso Socios</Link>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
