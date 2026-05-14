import { useFirestoreCollection } from "../../lib/hooks";
import { Reservation } from "../../types";
import { Calendar, Clock, User, Check, X, Filter } from "lucide-react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function ReservationViewer() {
  const { data: reservations, loading } = useFirestoreCollection<Reservation>("reservations", ); // Add ordering if needed

  const updateStatus = async (id: string, status: "confirmed" | "cancelled") => {
    await updateDoc(doc(db, "reservations", id), { status });
  };

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-3xl md:text-4xl font-display font-black text-indigo-brand tracking-tighter uppercase">Visor de <span className="text-orange-brand">Reservas</span></h1>
        <p className="text-gray-400 mt-1 font-medium text-sm">Controla la ocupación de tus espacios en tiempo real.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reservations.map((res) => (
          <div key={res.id} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
               <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-indigo-brand/5 rounded-2xl flex items-center justify-center text-indigo-brand">
                     <Calendar size={20} />
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    res.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-200' : 
                    res.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-200' : 
                    'bg-yellow-50 text-yellow-600 border-yellow-200'
                  }`}>
                    {res.status === 'pending' ? 'Pendiente' : res.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                  </span>
               </div>

               <h3 className="font-display font-black text-2xl text-indigo-brand uppercase mb-4">{res.spotId}</h3>
               
               <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Clock size={16} className="text-orange-brand" />
                    <span className="font-bold">{res.date} • {res.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <User size={16} className="text-orange-brand" />
                    <span>{res.customerName} • {res.pax} personas</span>
                  </div>
                  {res.notes && (
                    <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-400 italic">
                      "{res.notes}"
                    </div>
                  )}
               </div>
            </div>

            <div className="flex gap-2 border-t border-gray-50 pt-6">
               <button 
                 onClick={() => updateStatus(res.id, "confirmed")}
                 className="flex-1 bg-green-500 hover:bg-green-600 text-white p-3 rounded-xl transition-all shadow-lg shadow-green-500/10 flex items-center justify-center"
               >
                 <Check size={18} />
               </button>
               <button 
                 onClick={() => updateStatus(res.id, "cancelled")}
                 className="flex-1 bg-red-400 hover:bg-red-500 text-white p-3 rounded-xl transition-all shadow-lg shadow-red-400/10 flex items-center justify-center"
               >
                 <X size={18} />
               </button>
            </div>
          </div>
        ))}

        {reservations.length === 0 && !loading && (
           <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
              <p className="text-gray-400 font-display uppercase tracking-widest text-xs">No hay reservas registradas por el momento</p>
           </div>
        )}
      </div>
    </div>
  );
}
