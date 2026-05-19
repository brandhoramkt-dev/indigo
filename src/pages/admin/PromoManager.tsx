import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Save, Image as ImageIcon, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

export default function PromoManager() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const docRef = doc(db, "settings", "promo");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || "");
          setText(data.text || "");
          setImageUrl(data.imageUrl || "");
          setIsActive(data.isActive || false);
        }
      } catch (err) {
        console.error("Error fetching promo:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPromo();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await setDoc(doc(db, "settings", "promo"), {
        title,
        text,
        imageUrl,
        isActive,
        updatedAt: new Date()
      }, { merge: true });
      setMessage("¡Sección promocional actualizada con éxito!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error saving promo:", err);
      setMessage("Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      <header>
         <h1 className="text-3xl md:text-4xl font-display font-black text-indigo-brand tracking-tighter uppercase">Gestión de <span className="text-orange-brand">Portada</span></h1>
         <p className="text-gray-400 mt-1 font-medium text-sm">Configura la sección promocional dinámica de la página principal.</p>
      </header>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 text-green-600 p-4 rounded-2xl border border-green-200 text-sm font-bold uppercase tracking-widest text-center">
          {message}
        </motion.div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 space-y-8">
        
        <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-2xl">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={isActive} 
              onChange={(e) => setIsActive(e.target.checked)} 
              className="w-6 h-6 rounded-lg border-gray-300 text-indigo-brand focus:ring-indigo-brand" 
            />
            <span className="text-lg font-black uppercase tracking-widest text-indigo-brand">Activar Sección en Portada</span>
          </label>
        </div>

        <div className="space-y-6 opacity-100 transition-opacity" style={{ opacity: isActive ? 1 : 0.6 }}>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Título Principal</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Ej: NUEVA TEMPORADA DE CAFÉ FRÍO"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-brand/30 font-bold" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Texto Descriptivo</label>
            <textarea 
              value={text} 
              onChange={(e) => setText(e.target.value)} 
              rows={4} 
              placeholder="Refresca tu tarde con nuestra nueva línea de bebidas heladas..."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-brand/30" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">URL de Imagen Principal (o Carrusel si se separan por comas)</label>
            <div className="flex gap-4 items-start">
               <div className="flex-1">
                  <input 
                    type="text" 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)} 
                    placeholder="https://..." 
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-brand/30 mb-4" 
                  />
                  <p className="text-xs text-gray-400 flex items-center gap-1"><AlertCircle size={14}/> Nota: Puedes ingresar múltiples URLs separadas por coma para mostrar un carrusel.</p>
               </div>
               {imageUrl && imageUrl.split(',')[0] && (
                 <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                    <img src={imageUrl.split(',')[0].trim()} alt="Vista Previa" className="w-full h-full object-cover" />
                 </div>
               )}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-50">
          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-indigo-brand hover:bg-orange-brand text-white font-bold py-5 rounded-2xl uppercase tracking-widest text-sm shadow-xl shadow-indigo-brand/20 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
          >
            {saving ? "GUARDANDO..." : "GUARDAR CAMBIOS"} <Save size={18} />
          </button>
        </div>

      </form>
    </div>
  );
}
