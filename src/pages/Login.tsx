import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { motion } from "motion/react";
import { Coffee, ArrowRight } from "lucide-react";

export default function Login() {
  const { login, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isAdmin) {
      navigate("/admin/dashboard");
    }
  }, [user, isAdmin, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-indigo-dark flex items-center justify-center px-6">
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-brand rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-brand rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] p-12 shadow-2xl relative z-10"
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-indigo-brand rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-brand/20">
            <Coffee size={32} />
          </div>
          <h1 className="text-4xl font-display font-black text-indigo-brand uppercase tracking-tighter">SOCIOS <span className="text-orange-brand">INDIGO</span></h1>
          <p className="text-gray-400 mt-2 font-medium">Panel de Gestión Administrativa</p>
        </div>

        {user && !isAdmin ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-sm mb-8 border border-red-100 flex flex-col gap-4">
            <p className="font-bold">Acceso Denegado</p>
            <p>Tu cuenta ({user.email}) no está registrada como socio. Por favor contacta al administrador del sistema.</p>
            <button onClick={() => window.location.reload()} className="text-red-700 font-black underline text-xs uppercase tracking-widest text-left">Intentar con otra cuenta</button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => login('popup')}
              className="w-full group bg-indigo-brand hover:bg-orange-brand text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-4 transition-all shadow-xl shadow-indigo-brand/10 active:scale-95"
            >
              ENTRAR CON GOOGLE (POPUP)
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={() => login('redirect')}
              className="w-full group bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-4 transition-all active:scale-95 text-sm"
            >
              USAR REDIRECCIÓN (SI FALLA EL POPUP)
            </button>
            
            <p className="text-[10px] text-gray-400 text-center px-4 leading-tight">
              Si la ventana se cierra sola, por favor haz clic en el icono de <span className="font-bold">"Abrir en pestaña nueva"</span> (arriba a la derecha) y vuelve a intentarlo.
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
           <a href="/" className="text-gray-400 hover:text-indigo-brand text-xs font-bold uppercase tracking-widest transition-colors">Volver a la página principal</a>
        </div>
      </motion.div>

      <div className="fixed bottom-8 text-white/20 text-[10px] font-bold uppercase tracking-[0.3em]">
        Indigo Coffee Ops v1.0 • Secure Access
      </div>
    </div>
  );
}
