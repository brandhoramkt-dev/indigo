import { useState, useEffect } from "react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useFirestoreCollection } from "../lib/hooks";
import { useAuth } from "../lib/AuthContext";
import { 
  BarChart3, 
  Coffee, 
  BookOpen, 
  Calendar, 
  Users, 
  LogOut, 
  Plus, 
  Settings,
  ChevronRight,
  TrendingUp,
  Clock,
  LayoutDashboard,
  Menu,
  X,
  Image
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ProductManager from "./admin/ProductManager";
import BlogManager from "./admin/BlogManager";
import ReservationViewer from "./admin/ReservationViewer";
import TeamManager from "./admin/TeamManager";
import PromoManager from "./admin/PromoManager";
import MenuOptionsManager from "./admin/MenuOptionsManager";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = [
    { name: "Resumen", icon: LayoutDashboard, path: "/admin/dashboard" },
    { name: "Menú", icon: Coffee, path: "/admin/products" },
    { name: "Cultura", icon: BookOpen, path: "/admin/blog" },
    { name: "Portada", icon: Image, path: "/admin/promo" },
    { name: "Opciones Menú", icon: Settings, path: "/admin/menu-options" },
    { name: "Reservas", icon: Calendar, path: "/admin/reservations" },
    { name: "Socios", icon: Users, path: "/admin/team" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-indigo-dark text-white p-4 flex justify-between items-center sticky top-0 z-[60] border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-brand rounded-lg flex items-center justify-center">
            <Coffee size={18} />
          </div>
          <span className="font-display font-black text-lg tracking-tighter uppercase">INDIGO</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[55] w-72 bg-indigo-dark text-white flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0 md:sticky md:top-0 md:h-screen
      `}>
        <div className="p-8 pt-24 md:pt-8 pb-12">
          <div className="hidden md:flex items-center gap-3 mb-12">
             <div className="w-10 h-10 bg-orange-brand rounded-xl flex items-center justify-center">
                <Coffee size={24} />
             </div>
             <span className="font-display font-black text-xl tracking-tighter uppercase">INDIGO <span className="text-orange-brand">OPS</span></span>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors group text-sm font-bold uppercase tracking-widest text-white/60 hover:text-white"
              >
                <item.icon size={18} className="text-orange-brand group-hover:scale-110 transition-transform" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5">
          <div className="flex items-center gap-3 mb-6">
             <img src={user?.photoURL || ""} alt="User" className="w-10 h-10 rounded-full border border-white/20" />
             <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">{user?.displayName}</p>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Administrador</p>
             </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors text-xs font-bold uppercase tracking-widest bg-red-400/10 w-full p-3 rounded-xl"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/dashboard" element={<Overview />} />
          <Route path="/products" element={<ProductManager />} />
          <Route path="/blog" element={<BlogManager />} />
          <Route path="/promo" element={<PromoManager />} />
          <Route path="/menu-options" element={<MenuOptionsManager />} />
          <Route path="/reservations" element={<ReservationViewer />} />
          <Route path="/team" element={<TeamManager />} />
        </Routes>
      </main>
    </div>
  );
}

function Overview() {
  const { data: products } = useFirestoreCollection("products");
  const { data: admins } = useFirestoreCollection("admins");
  const { data: reservations } = useFirestoreCollection("reservations");
  const [storeOpen, setStoreOpen] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "store"), (docSnap) => {
      if (docSnap.exists()) {
         setStoreOpen(docSnap.data().isOpen ?? true);
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleStoreStatus = async () => {
    try {
      await setDoc(doc(db, "settings", "store"), { isOpen: !storeOpen }, { merge: true });
    } catch (e: any) {
      console.error("Error al actualizar el estado de la tienda", e);
      alert("Hubo un error al actualizar el estado. ¿Tienes permisos de administrador? " + e.message);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayReservations = reservations?.filter((r: any) => r.date === today) || [];

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 md:gap-0">
        <div>
           <h1 className="text-4xl md:text-5xl font-display font-black text-indigo-brand tracking-tighter uppercase">RESUMEN <span className="text-orange-brand">OPERATIVO</span></h1>
           <p className="text-gray-400 mt-2 font-medium text-sm md:text-base">Bienvenido de nuevo al centro de mando de Indigo Coffee.</p>
        </div>
        <div className="flex flex-col items-start md:items-end bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none border md:border-none border-gray-100 shadow-sm md:shadow-none w-full md:w-auto">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-2">Estado de la Tienda</p>
           <button 
             onClick={toggleStoreStatus}
             className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest border flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-sm ${
               storeOpen 
                 ? "bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20" 
                 : "bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20"
             }`}
           >
              <span className={`w-2.5 h-2.5 rounded-full ${storeOpen ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500"}`}></span> 
              {storeOpen ? "Abierto" : "Cerrado (Pedidos Desactivados)"}
           </button>
           <p className="text-[9px] text-gray-400 mt-2 max-w-[200px] md:text-right">Click para {storeOpen ? "desactivar" : "activar"} los pedidos en la página principal.</p>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <StatCard title="Reservas" value={reservations?.length.toString() || "0"} icon={Calendar} trend={`${todayReservations.length} hoy`} />
        <StatCard title="Productos" value={products?.length.toString() || "0"} icon={Coffee} />
        <StatCard title="Usuarios" value={admins?.length.toString() || "0"} icon={Users} />
      </div>

      <div className="grid grid-cols-1 gap-12">

         <div className="bg-indigo-brand rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
            <div className="relative z-10">
               <h3 className="font-display font-black text-2xl uppercase mb-4">Mejora tu presencia</h3>
               <p className="text-indigo-100/60 mb-8 font-light leading-relaxed max-w-xs">Añade nuevas historias a la sección de Cultura para conectar con tus clientes.</p>
               <Link to="/admin/blog" className="inline-flex items-center gap-3 bg-orange-brand text-white font-bold px-6 py-3 rounded-xl hover:shadow-xl transition-all active:scale-95 text-xs tracking-widest">
                  ESCRIBIR ARTÍCULO <Plus size={16} />
               </Link>
            </div>
            <BookOpen size={120} className="absolute -bottom-6 -right-6 text-white/5 group-hover:scale-110 transition-transform" />
         </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend }: { title: string, value: string, icon: any, trend?: string }) {
  return (
    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-indigo-brand">
          <Icon size={24} />
        </div>
        {trend && (
          <span className="text-[10px] font-black text-green-500 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">{trend}</span>
        )}
      </div>
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-1">{title}</h4>
        <p className="text-4xl font-display font-black text-indigo-brand">{value}</p>
      </div>
    </div>
  );
}
