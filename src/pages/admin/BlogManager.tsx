import React, { useState } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useFirestoreCollection } from "../../lib/hooks";
import { BlogPost } from "../../types";
import { Plus, Trash2, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import MDEditor from '@uiw/react-md-editor';

const generateSlug = (text: string) => {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export default function BlogManager() {
  const { data: posts, loading } = useFirestoreCollection<BlogPost>("blogPosts");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setSeoTitle("");
    setSeoDescription("");
    setSummary("");
    setContent("");
    setImageUrl("");
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setTitle(post.title);
    setSlug(post.slug || "");
    setSeoTitle(post.seoTitle || "");
    setSeoDescription(post.seoDescription || "");
    setSummary(post.summary);
    setContent(post.content);
    setImageUrl(post.imageUrl || "");
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalSlug = slug || generateSlug(title);
      
      const postData = {
        title,
        slug: finalSlug,
        seoTitle,
        seoDescription,
        summary,
        content,
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop"
      };

      if (editingId) {
        await updateDoc(doc(db, "blogPosts", editingId), postData);
      } else {
        await addDoc(collection(db, "blogPosts"), {
          ...postData,
          publishedAt: serverTimestamp()
        });
      }
      resetForm();
    } catch (err) {
      console.error("Error saving post:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar este artículo de cultura?")) {
      await deleteDoc(doc(db, "blogPosts", id));
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-3xl md:text-4xl font-display font-black text-indigo-brand tracking-tighter uppercase">Gestión de <span className="text-orange-brand">Cultura</span></h1>
           <p className="text-gray-400 mt-1 font-medium text-sm">Comparte historias y conecta con tu comunidad.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)} 
          className="w-full md:w-auto bg-indigo-brand hover:bg-orange-brand text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-indigo-brand/10 flex items-center justify-center gap-3 text-xs tracking-widest"
        >
          NUEVA HISTORIA <Plus size={18} />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm group">
            <div className="h-48 bg-gray-100 relative">
               <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               <div className="absolute inset-0 bg-indigo-brand/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="p-8">
               <h3 className="font-display font-black text-2xl text-indigo-brand uppercase mb-2">{post.title}</h3>
               <p className="text-xs text-gray-400 mb-6 line-clamp-2 leading-relaxed">{post.summary}</p>
               <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                  <span className="text-[10px] font-black text-orange-brand uppercase tracking-widest">Publicado</span>
                  <div className="flex gap-2">
                     <button onClick={() => handleEdit(post)} className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-xl transition-all"><Pencil size={18} /></button>
                     <button onClick={() => handleDelete(post.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                  </div>
               </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && !loading && (
           <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
              <p className="text-gray-400 font-display uppercase tracking-widest text-xs">No hay historias publicadas</p>
           </div>
        )}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetForm} className="fixed inset-0 bg-indigo-dark/80 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl z-[110] max-h-[90vh] overflow-y-auto">
              <h2 className="text-4xl font-display font-black text-indigo-brand uppercase mb-8">{editingId ? 'EDITAR' : 'NUEVA'} <span className="text-orange-brand">HISTORIA</span></h2>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Título</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-brand/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Enlace Amigable (Slug) - Opcional</label>
                    <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="mi-historia-increible" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-brand/30" />
                  </div>
                </div>
                
                <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-indigo-brand">Configuración SEO</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Título SEO (Opcional)</label>
                      <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Título para Google" className="w-full bg-white border border-gray-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-brand/30 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Descripción SEO (Opcional)</label>
                      <input type="text" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Resumen para Google" className="w-full bg-white border border-gray-100 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-brand/30 text-sm" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">URL de Imagen</label>
                  <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-brand/30" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Resumen Corto</label>
                  <input type="text" value={summary} onChange={(e) => setSummary(e.target.value)} required className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-brand/30" />
                </div>
                <div data-color-mode="light">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Contenido</label>
                  <MDEditor
                    value={content}
                    onChange={(val) => setContent(val || '')}
                    height={300}
                    className="overflow-hidden rounded-2xl border border-gray-100 shadow-none"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={resetForm} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-400 font-bold py-4 rounded-2xl uppercase tracking-widest text-xs">Cancelar</button>
                  <button type="submit" className="flex-1 bg-indigo-brand hover:bg-orange-brand text-white font-bold py-4 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-indigo-brand/20">{editingId ? 'Guardar Cambios' : 'Publicar'}</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
