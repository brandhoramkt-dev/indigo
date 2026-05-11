import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect } from "react";

export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-bg-warm flex flex-col">
      {/* We pass a mock cartCount and onOpenCart just to satisfy Navbar props on static pages */}
      <div className="bg-indigo-dark"><Navbar cartCount={0} onOpenCart={() => {}} /></div>
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-32 w-full">
        <h1 className="text-5xl font-extenda font-black text-indigo-brand uppercase mb-8">Políticas de Privacidad</h1>
        
        <div className="prose prose-indigo max-w-none text-gray-600 font-sans leading-relaxed space-y-6">
          <p>Última actualización: Mayo 2026</p>
          
          <h2 className="text-2xl font-bold text-indigo-dark mt-8 mb-4">1. Recopilación de Información</h2>
          <p>
            En Indigo Coffee Hub nos tomamos muy en serio tu privacidad. La información que proporcionas al hacer un pedido
            a través de WhatsApp o al realizar una reserva (como nombre, número de teléfono y notas) se utiliza exclusivamente
            para gestionar y entregar tu orden de manera efectiva.
          </p>

          <h2 className="text-2xl font-bold text-indigo-dark mt-8 mb-4">2. Protección de Datos</h2>
          <p>
            <strong>No compartimos, vendemos, ni alquilamos tus datos personales (incluyendo nombre, número de contacto o preferencias) con ningún tercero.</strong> Toda la información recolectada es de uso estricto y confidencial para la operatividad de nuestra cafetería y la mejora de tu experiencia en nuestras instalaciones.
          </p>

          <h2 className="text-2xl font-bold text-indigo-dark mt-8 mb-4">3. Seguridad</h2>
          <p>
            Implementamos medidas de seguridad para proteger tu información personal cuando realizas un pedido o te comunicas con nosotros. Utilizamos plataformas de mensajería cifradas (WhatsApp) para procesar tus solicitudes.
          </p>

          <h2 className="text-2xl font-bold text-indigo-dark mt-8 mb-4">4. Contacto</h2>
          <p>
            Si tienes preguntas sobre nuestra política de privacidad, no dudes en escribirnos a través de nuestro canal oficial de WhatsApp.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
