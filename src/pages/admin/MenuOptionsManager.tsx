import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Save, Plus, Trash2 } from "lucide-react";

interface MenuOptionsData {
  milks: string[];
  essences: string[];
}

export default function MenuOptionsManager() {
  const [data, setData] = useState<MenuOptionsData>({
    milks: ["Entera", "Deslactosada", "Almendra", "Avena"],
    essences: ["Sin Esencia", "Vainilla", "Caramelo", "Avellana"]
  });
  
  const [newMilk, setNewMilk] = useState("");
  const [newEssence, setNewEssence] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const docRef = doc(db, "settings", "menuOptions");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setData(docSnap.data() as MenuOptionsData);
      } else {
        // Seed default options if document doesn't exist
        await setDoc(docRef, data);
      }
    } catch (error) {
      console.error("Error fetching menu options:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "menuOptions"), data);
      alert("Opciones guardadas exitosamente!");
    } catch (error) {
      console.error("Error saving options:", error);
      alert("Error al guardar opciones.");
    } finally {
      setSaving(false);
    }
  };

  const addMilk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilk.trim() || data.milks.includes(newMilk.trim())) return;
    setData({ ...data, milks: [...data.milks, newMilk.trim()] });
    setNewMilk("");
  };

  const removeMilk = (index: number) => {
    const newMilks = [...data.milks];
    newMilks.splice(index, 1);
    setData({ ...data, milks: newMilks });
  };

  const addEssence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEssence.trim() || data.essences.includes(newEssence.trim())) return;
    setData({ ...data, essences: [...data.essences, newEssence.trim()] });
    setNewEssence("");
  };

  const removeEssence = (index: number) => {
    const newEssences = [...data.essences];
    newEssences.splice(index, 1);
    setData({ ...data, essences: newEssences });
  };

  if (loading) return <div className="p-8 text-indigo-brand font-bold uppercase tracking-widest text-xs">Cargando opciones...</div>;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extenda font-black text-indigo-brand tracking-tighter uppercase leading-none">Opciones de <span className="text-orange-brand">Menú</span></h1>
          <p className="text-gray-400 font-sans mt-2">Personaliza las leches y esencias disponibles.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-brand hover:bg-orange-brand text-white font-bold py-3 px-6 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
        
        {/* Leches */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-black text-indigo-brand uppercase tracking-tight mb-6">Tipos de Leche</h2>
          
          <form onSubmit={addMilk} className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={newMilk} 
              onChange={(e) => setNewMilk(e.target.value)} 
              placeholder="Ej: Leche de Coco"
              className="flex-1 bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-brand/30 text-sm font-bold uppercase tracking-widest"
            />
            <button type="submit" className="bg-orange-brand text-white p-3 rounded-xl hover:bg-indigo-brand transition-colors">
              <Plus size={20} />
            </button>
          </form>

          <div className="space-y-2">
            {data.milks.map((milk, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 group">
                <span className="font-bold uppercase tracking-widest text-xs text-indigo-brand">{milk}</span>
                <button onClick={() => removeMilk(index)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {data.milks.length === 0 && (
              <p className="text-gray-400 text-xs text-center py-4 uppercase tracking-widest font-bold">No hay opciones registradas</p>
            )}
          </div>
        </div>

        {/* Esencias */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-black text-indigo-brand uppercase tracking-tight mb-6">Tipos de Esencias</h2>
          
          <form onSubmit={addEssence} className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={newEssence} 
              onChange={(e) => setNewEssence(e.target.value)} 
              placeholder="Ej: Jarabe de Menta"
              className="flex-1 bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-brand/30 text-sm font-bold uppercase tracking-widest"
            />
            <button type="submit" className="bg-orange-brand text-white p-3 rounded-xl hover:bg-indigo-brand transition-colors">
              <Plus size={20} />
            </button>
          </form>

          <div className="space-y-2">
            {data.essences.map((essence, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 group">
                <span className="font-bold uppercase tracking-widest text-xs text-indigo-brand">{essence}</span>
                <button onClick={() => removeEssence(index)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {data.essences.length === 0 && (
              <p className="text-gray-400 text-xs text-center py-4 uppercase tracking-widest font-bold">No hay opciones registradas</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
