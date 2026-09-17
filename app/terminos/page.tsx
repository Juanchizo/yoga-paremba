import Link from 'next/link';

export default function TerminosYCondiciones() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl space-y-8">
      <h1 className="text-3xl font-light text-[#C47E63] mb-6">Términos y Condiciones</h1>
      
      <section className="space-y-2">
        <h2 className="text-xl font-medium text-[#C47E63]">1. Información General</h2>
        <p className="font-light text-[#C47E63]">Bienvenido/a a <strong>Tatimonteroyoga</strong>. Al acceder y utilizar nuestra plataforma, aceptas estar sujeto a los presentes Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos, te invitamos a no utilizar nuestros servicios.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-medium text-[#C47E63]">2. Cuentas de Usuario y Responsabilidades</h2>
        <p className="font-light text-[#C47E63]">Para acceder a ciertas funciones, es posible que debas registrarte. Al hacerlo, te comprometes a proporcionar información precisa. Eres responsable de todas las actividades que ocurran bajo tu cuenta.</p>
        <p className="font-light text-[#C47E63]">Nos reservamos el derecho de suspender o cancelar cuentas que violen estos términos, que proporcionen información falsa o que se utilicen para fines fraudulentos.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-medium text-[#C47E63]">3. Uso Adecuado de la Plataforma</h2>
        <p className="font-light text-[#C47E63]">Te comprometes a utilizar <strong>Tatimonteroyoga</strong> únicamente con fines legales y de una manera que no infrinja los derechos, ni restrinja o inhiba el uso y disfrute de la plataforma por parte de cualquier tercero.</p>
        <p className="font-light text-[#C47E63]">Queda prohibido el uso de la web para la transmisión de material difamatorio, ofensivo o que infrinja los derechos de autor de terceros.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-medium text-[#C47E63]">4. Propiedad Intelectual</h2>
        <p className="font-light text-[#C47E63]">Todo el contenido presente en esta plataforma, incluyendo textos, gráficos, logotipos, íconos y software, es propiedad de <strong>Tatimonteroyoga</strong> o de sus proveedores de contenido y está protegido por las leyes de propiedad intelectual internacionales.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-medium text-[#C47E63]">5. Limitación de Responsabilidad</h2>
        <p className="font-light text-[#C47E63]"><strong>Tatimonteroyoga</strong> no se hace responsable por los daños directos, indirectos o consecuentes que puedan resultar del uso o la imposibilidad de uso de la plataforma, incluyendo la pérdida de datos o interrupciones del servicio.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-medium text-[#C47E63]">6. Modificaciones de los Términos</h2>
        <p className="font-light text-[#C47E63]">Nos reservamos el derecho a modificar estos Términos y Condiciones en cualquier momento. Los cambios entrarán en vigencia inmediatamente después de su publicación en el sitio web. Es tu responsabilidad revisar periódicamente estos términos.</p>
      </section>

      <div className="mt-10 border-t pt-4 text-sm text-muted-foreground flex flex-col sm:flex-row justify-between items-center">
        <p className="font-light text-[#C47E63]">Última actualización: 17/9/2026</p>
      </div>
    </div>
  );
}
