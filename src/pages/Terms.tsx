import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect } from "react";

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-bg-warm flex flex-col">
      <div className="bg-indigo-dark"><Navbar cartCount={0} onOpenCart={() => {}} /></div>
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-32 w-full">
        <h1 className="text-5xl font-extenda font-black text-indigo-brand uppercase mb-8">Términos y Condiciones</h1>
        
        <div className="prose prose-indigo max-w-none text-gray-600 font-sans leading-relaxed space-y-6">
          <p>Última actualización: Mayo 2026</p>
          
          <h2 className="text-2xl font-bold text-indigo-dark mt-8 mb-4">1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar el sitio web de Indigo Coffee Hub, aceptas cumplir con los siguientes términos y condiciones. Si no estás de acuerdo con alguna parte de estos términos, te invitamos a no utilizar nuestro sitio web.
          </p>

          <h2 className="text-2xl font-bold text-indigo-dark mt-8 mb-4">2. Uso del Servicio</h2>
          <p>
            Nuestra plataforma web permite visualizar nuestro menú, realizar pedidos por WhatsApp y reservar espacios en nuestra zona de Co-work. Nos reservamos el derecho de modificar los precios y la disponibilidad de los productos sin previo aviso, aunque intentaremos mantener siempre el menú actualizado.
          </p>

          <h2 className="text-2xl font-bold text-indigo-dark mt-8 mb-4">3. Pedidos y Pagos</h2>
          <p>
            Todos los pedidos son confirmados exclusivamente a través de WhatsApp. Al elegir pagar mediante QR (Yape u otros métodos digitales provistos), te comprometes a enviar el comprobante de pago real al número oficial de nuestra tienda. Indigo Coffee Hub no procesa pagos automáticamente ni retiene datos de tus tarjetas bancarias.
          </p>

          <h2 className="text-2xl font-bold text-indigo-dark mt-8 mb-4">4. Privacidad</h2>
          <p>
            Reiteramos nuestro compromiso con tu privacidad: <strong>no compartimos tus datos (como números o nombres) con terceros</strong>. Toda interacción con nosotros se utiliza solo para brindar el servicio solicitado. Para más detalles, consulta nuestras Políticas de Privacidad.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
