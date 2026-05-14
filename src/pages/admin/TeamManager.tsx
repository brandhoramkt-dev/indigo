import { useState, useEffect } from "react";
import { collection, doc, setDoc, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Users, Mail, Plus, Trash2, Shield, Loader2 } from "lucide-react";

export default function TeamManager() {
  const [admins, setAdmins] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const mainAdmin = "brandhoramkt@gmail.com";

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "admins"));
      const adminList = querySnapshot.docs.map(doc => doc.id);
      setAdmins(adminList);
    } catch (err) {
      console.error("Error fetching admins:", err);
      setError("No se pudieron cargar los socios. Verifica tus permisos.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const emailToAdd = newEmail.trim().toLowerCase();
    
    if (!emailToAdd || !emailToAdd.includes("@")) {
      setError("Por favor ingresa un correo electrónico válido.");
      return;
    }

    if (emailToAdd === mainAdmin || admins.includes(emailToAdd)) {
      setError("Este usuario ya es un socio administrador.");
      return;
    }

    setSaving(true);
    try {
      // Create a document with the email as the ID
      await setDoc(doc(db, "admins", emailToAdd), {
        addedAt: new Date().toISOString(),
        role: "admin"
      });
      setAdmins([...admins, emailToAdd]);
      setNewEmail("");
    } catch (err) {
      console.error("Error adding admin:", err);
      setError("Hubo un error al añadir al socio.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAdmin = async (emailToRemove: string) => {
    if (!window.confirm(`¿Estás seguro de quitar acceso a ${emailToRemove}?`)) return;
    
    try {
      await deleteDoc(doc(db, "admins", emailToRemove));
      setAdmins(admins.filter(email => email !== emailToRemove));
    } catch (err) {
      console.error("Error removing admin:", err);
      alert("Hubo un error al eliminar al socio.");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-3xl md:text-4xl font-display font-black text-indigo-brand uppercase mb-2">
          Gestión de Socios
        </h1>
        <p className="text-gray-400 font-medium text-sm">Administra quiénes tienen acceso a este panel de control.</p>
      </header>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="text-orange-brand" size={24} />
          <h2 className="text-lg md:text-xl font-bold text-indigo-brand uppercase tracking-wider">Añadir Nuevo Socio</h2>
        </div>
        
        <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="email" 
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-brand/20 focus:border-indigo-brand transition-all text-sm"
            />
          </div>
          <button 
            type="submit"
            disabled={saving || !newEmail}
            className="w-full sm:w-auto bg-indigo-brand text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-orange-brand transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
            Añadir
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-3 font-medium">{error}</p>}
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Users className="text-indigo-brand" size={24} />
          <h2 className="text-lg md:text-xl font-bold text-indigo-brand uppercase tracking-wider">Socios Actuales</h2>
        </div>

        {loading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="animate-spin text-indigo-brand" size={32} />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Main Admin */}
            <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-brand text-white rounded-full flex items-center justify-center font-bold">
                  B
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-indigo-brand text-sm md:text-base truncate">{mainAdmin}</p>
                  <p className="text-[10px] text-indigo-brand/60 uppercase tracking-widest font-black mt-1">Socio Principal</p>
                </div>
              </div>
            </div>

            {/* Other Admins */}
            {admins.map(email => (
              <div key={email} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl group">
                <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-bold">
                    {email[0].toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-gray-700 text-sm md:text-base truncate">{email}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-1">Socio Administrador</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveAdmin(email)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all md:opacity-0 md:group-hover:opacity-100"
                  title="Quitar acceso"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            {admins.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">No hay socios adicionales configurados.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
