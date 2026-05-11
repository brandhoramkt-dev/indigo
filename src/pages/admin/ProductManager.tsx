import React, { useState } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useFirestoreCollection } from "../../lib/hooks";
import { Product, Category } from "../../types";
import { Plus, Search, Edit2, Trash2, Check, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ProductManager() {
  const { data: products, loading, error } = useFirestoreCollection<Product>("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<Category>(Category.CLASSICS);
  const [description, setDescription] = useState("");
  const [hasMilk, setHasMilk] = useState(false);
  const [hasTemp, setHasTemp] = useState(false);

  const resetForm = () => {
    setName("");
    setPrice("");
    setCategory(Category.CLASSICS);
    setDescription("");
    setHasMilk(false);
    setHasTemp(false);
    setIsAdding(false);
    setEditingId(null);
  };

  // Removed handleGoogleSheetSync

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name,
      price: parseFloat(price),
      category,
      description,
      available: true,
      hasMilkOptions: hasMilk,
      hasTemperatureOptions: hasTemp,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "products", editingId), productData);
      } else {
        await addDoc(collection(db, "products"), productData);
      }
      resetForm();
    } catch (err: any) {
      console.error("Error saving product:", err);
      // Detailed error for troubleshooting
      const msg = err.code ? `${err.code}: ${err.message}` : (err.message || String(err));
      alert("Error al guardar el producto: " + msg);
    }
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "products", id), { available: !current });
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      await deleteDoc(doc(db, "products", id));
    }
  };

  const startEdit = (p: Product) => {
    setName(p.name);
    setPrice(p.price.toString());
    setCategory(p.category);
    setDescription(p.description || "");
    setHasMilk(!!p.hasMilkOptions);
    setHasTemp(!!p.hasTemperatureOptions);
    setEditingId(p.id);
    setIsAdding(true);
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Removed handleSeedData

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
           <h1 className="text-4xl font-extenda font-black text-indigo-brand tracking-tighter uppercase">Gestión de <span className="text-orange-brand">Menú</span></h1>
           <p className="text-gray-400 mt-1 font-medium font-sans">Gestiona los productos disponibles para tus clientes.</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => setIsAdding(true)} 
             className="bg-indigo-brand hover:bg-orange-brand text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-indigo-brand/10 flex items-center gap-3 text-xs tracking-widest active:scale-95"
           >
             NUEVO PRODUCTO <Plus size={18} />
           </button>
        </div>
      </header>

      {/* Filters & Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar producto..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-indigo-brand/30 transition-colors shadow-sm"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-[2rem] flex items-center gap-4 text-red-600">
          <AlertCircle className="shrink-0" />
          <div>
            <p className="font-bold text-sm uppercase tracking-wider">Error de conexión</p>
            <p className="text-xs opacity-80">{error.message}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/50">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Producto</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Categoría</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Precio</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Estado</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/30 transition-colors group">
                <td className="px-8 py-6">
                  <span className="font-bold text-indigo-brand uppercase text-sm block">{p.name}</span>
                  <span className="text-[10px] text-gray-400 block mt-1 line-clamp-1 max-w-xs">{p.description}</span>
                </td>
                <td className="px-8 py-6 text-xs text-gray-500 font-bold uppercase tracking-widest">{p.category}</td>
                <td className="px-8 py-6 font-extenda font-black text-xl text-indigo-brand">Bs {p.price}</td>
                <td className="px-8 py-6">
                  <button 
                    onClick={() => toggleAvailability(p.id, p.available)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${p.available ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}
                  >
                    {p.available ? "Disponible" : "Agotado"}
                  </button>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(p)} className="p-2 text-indigo-brand hover:bg-indigo-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-gray-400 uppercase font-black tracking-widest text-xs">No se encontraron productos</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal / Form Overlay */}
      <AnimatePresence>
        {isAdding && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="fixed inset-0 bg-indigo-dark/80 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded-[2.5rem] p-12 shadow-2xl z-[110] overflow-y-auto max-h-[90vh]"
            >
              <h2 className="text-4xl font-extenda font-black text-indigo-brand uppercase mb-8">{editingId ? "EDITAR" : "NUEVO"} <span className="text-orange-brand">PRODUCTO</span></h2>
              
              <form onSubmit={handleSave} className="space-y-6 font-sans">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Nombre del Producto</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-brand/30 font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Precio (Bs)</label>
                    <input type="number" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-brand/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Categoría</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-brand/30 uppercase font-bold text-xs tracking-widest">
                       {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Descripción Corta</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-brand/30" />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 flex flex-col gap-4">
                   <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={hasMilk} onChange={(e) => setHasMilk(e.target.checked)} className="w-5 h-5 rounded-lg border-gray-300 text-indigo-brand focus:ring-indigo-brand" />
                      <span className="text-sm font-bold uppercase tracking-widest text-indigo-brand">Opciones de Leche</span>
                   </label>
                   <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={hasTemp} onChange={(e) => setHasTemp(e.target.checked)} className="w-5 h-5 rounded-lg border-gray-300 text-indigo-brand focus:ring-indigo-brand" />
                      <span className="text-sm font-bold uppercase tracking-widest text-indigo-brand">Opciones de Temperatura</span>
                   </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={resetForm} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-400 font-bold py-4 rounded-2xl uppercase tracking-widest text-xs transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 bg-indigo-brand hover:bg-orange-brand text-white font-bold py-4 rounded-2xl uppercase tracking-widest text-xs transition-colors shadow-xl shadow-indigo-brand/20">Guardar Producto</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
