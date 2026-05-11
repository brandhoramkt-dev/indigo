import { useState } from "react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
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
  LayoutDashboard
} from "lucide-react";
import ProductManager from "./admin/ProductManager";
import BlogManager from "./admin/BlogManager";
import ReservationViewer from "./admin/ReservationViewer";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = [
    { name: "Resumen", icon: LayoutDashboard, path: "/admin/dashboard" },
    { name: "Menú", icon: Coffee, path: "/admin/products" },
    { name: "Cultura", icon: BookOpen, path: "/admin/blog" },
    { name: "Reservas", icon: Calendar, path: "/admin/reservations" },
    { name: "Socios", icon: Users, path: "/admin/team" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-indigo-dark text-white flex flex-col sticky top-0 h-screen">
        <div className="p-8 pb-12">
          <div className="flex items-center gap-3 mb-12">
             <div className="w-10 h-10 bg-orange-brand rounded-xl flex items-center justify-center">
                <Coffee size={24} />
             </div>
             <span className="font-display font-black text-xl tracking-tighter">INDIGO <span className="text-orange-brand">OPS</span></span>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
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
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Socio Principal</p>
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
      <main className="flex-1 p-12 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/dashboard" element={<Overview />} />
          <Route path="/products" element={<ProductManager />} />
          <Route path="/blog" element={<BlogManager />} />
          <Route path="/reservations" element={<ReservationViewer />} />
          <Route path="/team" element={<div className="bg-white rounded-3xl p-12 border border-gray-100"><h2 className="text-4xl font-display font-black text-indigo-brand mb-4">Gestión de Socios</h2><p className="text-gray-400">Pronto disponible.</p></div>} />
        </Routes>
      </main>
    </div>
  );
}

function Overview() {
  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
           <h1 className="text-5xl font-display font-black text-indigo-brand tracking-tighter uppercase">RESUMEN <span className="text-orange-brand">OPERATIVO</span></h1>
           <p className="text-gray-400 mt-2 font-medium">Bienvenido de nuevo al centro de mando de Indigo Coffee.</p>
        </div>
        <div className="text-right">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-1">Estado de la Tienda</p>
           <span className="bg-green-500/10 text-green-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-green-500/20 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Abierto
           </span>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Ventas Hoy" value="Bs 1,240" icon={TrendingUp} trend="+12%" />
        <StatCard title="Reservas" value="12" icon={Calendar} trend="+2 hoy" />
        <StatCard title="Productos" value="48" icon={Coffee} />
        <StatCard title="Usuarios" value="4" icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
               <h3 className="font-display font-black text-2xl text-indigo-brand uppercase">Actividad Reciente</h3>
               <button className="text-indigo-brand font-bold text-xs uppercase tracking-widest hover:underline">Ver Todo</button>
            </div>
            <div className="space-y-8">
               {[1, 2, 3].map(i => (
                 <div key={i} className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                       <Clock size={20} className="text-gray-300" />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-indigo-brand uppercase mb-1">Nueva Reserva: Mesa 04</p>
                       <p className="text-xs text-gray-400">Hace 15 minutos • Por Carlos Mendoza</p>
                    </div>
                    <ChevronRight size={16} className="ml-auto text-gray-200" />
                 </div>
               ))}
            </div>
         </div>

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
