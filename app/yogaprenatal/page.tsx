"use client";
import { Card, CardHeader, CardDescription } from '@/components/ui/card';
import { Carousel, CarouselItem, CarouselContent, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Image from 'next/image';
import Link from 'next/link';


export default function GuiaYogaPrenatalPage() {
  const prenatalYogaItems = [
    {
      title: '🧘‍♀️ Posturas adaptadas',
      description:
        'Las posturas se modifican para acompañar el crecimiento del abdomen. Pueden utilizarse elementos como bloques, mantas, bolsters, pelotas de pilates o sillas para encontrar mayor estabilidad.',
    },
    {
      title: '🌿 Atención al cuerpo',
      description:
        'Pone especial atención en zonas como la espalda, la pelvis y las caderas, acompañando los cambios posturales y las molestias habituales del embarazo.',
    },
    {
      title: '🌬️ Respiración y relajación',
      description:
        'Uno de los pilares de la práctica. Te ayuda a conectar con tu cuerpo, encontrar momentos de calma y adquirir herramientas para el nacimiento.',
    },
    {
      title: '🤍 Conexión',
      description:
        'Un espacio para bajar el ritmo, escuchar tu cuerpo y conectar con vos misma y con tu bebé.',
    },
  ];

  return (
    <article className="max-w-[100rem] mx-auto px-6 py-12 text-gray-800 space-y-12">
      
      {/* HEADER DE LA GUÍA / H1 */}
      <header className="space-y-6 text-center border-b border-gray-100 pb-10">
        <h1 className="text-3xl md:text-5xl font-light text-[#C47E63] leading-tight">
          GUÍA DE YOGA PARA EMBARAZADAS: TIPOS, BENEFICIOS, POSTURAS Y CUÁNDO EMPEZAR
        </h1>
        <p className="text-base md:text-lg text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
          El yoga prenatal puede ser una gran herramienta para acompañarte durante el embarazo, ayudándote a conectar con tu cuerpo, moverte, respirar y encontrar momentos de calma.
        </p>
        <p className="text-sm md:text-base text-gray-600 font-light max-w-2xl mx-auto">
          En esta guía te cuento qué es el yoga para embarazadas, cuándo podés empezar, qué posturas pueden necesitar adaptación, cuáles son sus beneficios y dónde podés practicarlo.
        </p>
        <p className="text-sm font-medium text-[#C47E63] pt-2">
          🌿 Porque cada embarazo es diferente, y tu práctica también puede adaptarse a vos.
        </p>
      </header>

      {/* SECCIÓN 1: QUÉ ES */}
      <section className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-light text-[#C47E63]">
          QUÉ ES YOGA PARA EMBARAZADAS
        </h2>
        <div className="space-y-4 text-gray-700 leading-relaxed font-light">
          <p>
            El yoga para embarazadas, también conocido como <strong>yoga prenatal</strong>, es una práctica adaptada a los cambios físicos y emocionales que atraviesa el cuerpo durante el embarazo.
          </p>
          <p>
            A través del movimiento, las posturas, la respiración y la relajación, el yoga prenatal busca acompañarte durante las diferentes etapas de la gestación, respetando las necesidades de tu cuerpo y el momento particular que estás viviendo.
          </p>
          <p>
            No se trata simplemente de hacer las mismas posturas de yoga que practicarías fuera del embarazo. A medida que tu bebé crece, tu cuerpo cambia, tu centro de gravedad se modifica y también pueden cambiar tu equilibrio, tu movilidad y la manera en la que te sentís al moverte.
          </p>
          <p>
            Por eso, una práctica de yoga prenatal adapta los movimientos y las posturas para acompañar estos cambios y ayudarte a conectar con tu cuerpo de una manera consciente y respetuosa.
          </p>
          <p>
            Pero el yoga prenatal es mucho más que una práctica física. Es también un espacio para respirar, relajarte, escuchar lo que tu cuerpo necesita y conectar con vos misma y con tu bebé.
          </p>
          <p>
            Cada embarazo es diferente, y por eso no existe una única forma de practicar yoga durante esta etapa. La práctica puede adaptarse a tu momento del embarazo, a tu experiencia previa y a cómo te sentís cada día.
          </p>
          <p>
            Algunos días quizás necesites moverte y activar tu cuerpo. Otros, quizás necesites una práctica más suave. Y también habrá días en los que tu cuerpo te pida descansar. Aprender a reconocer esa diferencia también forma parte del camino.
          </p>
          <p className="italic text-[#C47E63] font-normal">
            El yoga prenatal no busca que hagas más. Busca ayudarte a escuchar mejor lo que tu cuerpo necesita.
          </p>
        </div>
      </section>

      {/* SECCIÓN 2: TIPOS Y SEGURIDAD */}
      <section className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-light text-[#C47E63]">
          ¿QUÉ TIPO DE YOGA PUEDE HACER Y ES SEGURO PARA UNA EMBARAZADA?
        </h2>
        <div className="space-y-4 text-gray-700 leading-relaxed font-light">
          <p>
            Los tipos de yoga que se recomiendan en esta etapa son <strong>hatha yoga o yoga prenatal</strong>, donde se realiza una práctica adaptada a los cambios físicos y emocionales del embarazo. Incluye posturas modificadas, movimientos suaves, ejercicios de respiración y momentos de relajación, respetando las necesidades de cada etapa.
          </p>
          <p>
            No se trata de hacer las mismas posturas que practicarías fuera del embarazo. A medida que tu cuerpo cambia, también puede cambiar tu forma de moverte y tu práctica puede necesitar adaptaciones.
          </p>
        </div>
        <div className='flex justify-content items-center w-full'>
          <Carousel>
            <CarouselContent className='max-w-xl min-h-sm basis-1/2'>
            {prenatalYogaItems.map((item, index) => (
              <CarouselItem key={index}>
                <div className='p2'>
                <Card>
                  <CardHeader>
                    {item.title}
                  </CardHeader>
                  <CardDescription>
                    {item.description}
                  </CardDescription>
                </Card>
                </div>
              </CarouselItem>
            ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        <div className="space-y-3 pt-2 text-gray-700 font-light">
          <p>
            <strong>¿Y si ya practicabas yoga?</strong><br />
            Si ya hacías yoga antes del embarazo, probablemente necesites adaptar tu práctica a medida que avance la gestación. Algunas posturas pueden modificarse y otras pueden dejar de resultarte cómodas. Tu cuerpo cambia y tu práctica puede cambiar con él.
          </p>
          <p>
            <strong>¿Y si nunca hice yoga?</strong><br />
            No necesitás tener experiencia previa ni ser flexible para comenzar. Una práctica de yoga prenatal puede adaptarse a mujeres que nunca practicaron yoga y quieren incorporar movimiento, respiración y relajación durante el embarazo.
          </p>
          <p className="text-sm text-gray-500 italic">
            Si querés comenzar una actividad nueva durante el embarazo, consultá previamente con tu obstetra o profesional de salud para saber qué tipo de actividad es adecuada para vos.
          </p>
        </div>
      </section>

      {/* SECCIÓN 3: CUÁNDO EMPEZAR (TRIMESTRES) */}
      <section className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-light text-[#C47E63]">
          ¿CUÁNDO EMPEZAR A HACER YOGA PARA EMBARAZADAS?
        </h2>
        <p className="text-gray-700 font-light">
          Podés empezar en cualquier etapa del embarazo. El momento adecuado dependerá de cada mujer, de su embarazo, de su experiencia previa y de las recomendaciones de su profesional de salud.
        </p>

        <div className="space-y-4">
          <div className="p-5 border-l-4 border-[#C47E63] bg-stone-50 rounded-r-xl space-y-2">
            <h3 className="font-medium text-lg text-[#C47E63]">🌱 Primer trimestre</h3>
            <p className="text-sm text-gray-600 font-light">
              Es una etapa de grandes cambios, ideal para comenzar a conectar con tu cuerpo, observar cómo te sentís y trabajar la respiración y la relajación. Si tu profesional de salud lo considera adecuado, podés realizar movimientos y posturas suaves, especialmente si aparecen náuseas o cansancio. Escucharte y respetar tus tiempos es parte de la práctica.
            </p>
          </div>

          <div className="p-5 border-l-4 border-[#C47E63] bg-stone-50 rounded-r-xl space-y-2">
            <h3 className="font-medium text-lg text-[#C47E63]">🌿 Segundo trimestre</h3>
            <p className="text-sm text-gray-600 font-light">
              Muchas mujeres comienzan a sentirse con más energía. A medida que el abdomen crece, la práctica se enfoca en mantener la movilidad y acompañar zonas como la espalda, la pelvis y las caderas, además de trabajar la respiración.
            </p>
          </div>

          <div className="p-5 border-l-4 border-[#C47E63] bg-stone-50 rounded-r-xl space-y-2">
            <h3 className="font-medium text-lg text-[#C47E63]">🌸 Tercer trimestre</h3>
            <p className="text-sm text-gray-600 font-light">
              La práctica se orienta hacia movimientos suaves, posiciones de descanso, respiración y relajación. Se incorporan movimientos que favorezcan la movilidad de la pelvis y la comodidad de manera adaptada con elementos de apoyo.
            </p>
          </div>
        </div>

        {/* RECUADRO DESTACADO DE SEGURIDAD */}
        <div className="p-5 border border-amber-200 bg-amber-50/60 rounded-xl space-y-2 my-6">
          <h4 className="font-semibold text-amber-800 flex items-center gap-2">
            ⚠️ Antes de comenzar
          </h4>
          <p className="text-sm text-amber-900 font-light leading-relaxed">
            Si estás embarazada y querés comenzar una nueva actividad física, consultá con tu obstetra o profesional de salud de referencia. Si tenés alguna condición médica o tu embarazo requiere cuidados especiales, seguí siempre las recomendaciones específicas que te hayan indicado.
          </p>
        </div>
      </section>

      {/* SECCIÓN 4: QUÉ POSTURAS EVITAR */}
      <section className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-light text-[#C47E63]">
          ¿QUÉ POSTURAS DE YOGA NO DEBE HACER UNA EMBARAZADA?
        </h2>
        <p className="text-gray-700 font-light">
          Las posturas que deben evitarse son aquellas que generan presión sobre el abdomen, requieren demasiado equilibrio o esfuerzo, provocan dolor o incomodidad, o no están adaptadas. No existe una lista universal; la práctica debe adaptarse a cada mujer.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-xl space-y-1">
            <h3 className="font-medium text-gray-800">🤰 Presión sobre el abdomen</h3>
            <p className="text-sm text-gray-600 font-light">
              A medida que crece la panza, las posturas de presión directa se modifican usando bloques, mantas, bolsters, pelotas o sillas.
            </p>
          </div>

          <div className="p-4 border rounded-xl space-y-1">
            <h3 className="font-medium text-gray-800">🧘‍♀️ Mucho equilibrio</h3>
            <p className="text-sm text-gray-600 font-light">
              Si te sentís inestable al cambiar tu centro de gravedad, podés usar una pared o silla como apoyo para practicar segura.
            </p>
          </div>

          <div className="p-4 border rounded-xl space-y-1">
            <h3 className="font-medium text-gray-800">🌿 Dolor o incomodidad</h3>
            <p className="text-sm text-gray-600 font-light">
              Si una postura causa dolor o mareo, hay que detenerse. Un estiramiento suave está bien, pero el dolor nunca se ignora.
            </p>
          </div>

          <div className="p-4 border rounded-xl space-y-1">
            <h3 className="font-medium text-gray-800">🔥 Prácticas muy intensas</h3>
            <p className="text-sm text-gray-600 font-light">
              No es recomendable empezar de repente con ejercicios hiper exigentes. El yoga prenatal busca acompañar, no llevarte al límite.
            </p>
          </div>

          <div className="p-4 border rounded-xl space-y-1">
            <h3 className="font-medium text-gray-800">🌡️ Ambientes calurosos</h3>
            <p className="text-sm text-gray-600 font-light">
              Deben evitarse ambientes con temperaturas muy elevadas (como Bikram yoga).
            </p>
          </div>

          <div className="p-4 border rounded-xl space-y-1">
            <h3 className="font-medium text-gray-800">🛌 Boca arriba prolongado</h3>
            <p className="text-sm text-gray-600 font-light">
              Estar boca arriba durante mucho tiempo puede resultar incómodo en etapas avanzadas. Se adapta recostándose de lado con almohadones.
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN 5: BENEFICIOS */}
      <section className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-light text-[#C47E63]">
          ¿CUÁLES SON LOS BENEFICIOS DE HACER YOGA DURANTE EL EMBARAZO?
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="p-4 bg-stone-50 rounded-xl space-y-1">
            <h3 className="font-medium text-[#C47E63]">🧘‍♀️ Mantenerte activa</h3>
            <p className="text-xs text-gray-600 font-light">Movimiento adaptado a cada etapa de manera consciente.</p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl space-y-1">
            <h3 className="font-medium text-[#C47E63]">🌿 Movilidad y conciencia</h3>
            <p className="text-xs text-gray-600 font-light">Aprender a reconocer qué movimientos te resultan cómodos.</p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl space-y-1">
            <h3 className="font-medium text-[#C47E63]">🤍 Acompañar molestias</h3>
            <p className="text-xs text-gray-600 font-light">Ayuda a aliviar tensiones musculares y molestias en la zona lumbar.</p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl space-y-1">
            <h3 className="font-medium text-[#C47E63]">🌬️ Herramientas de respiración</h3>
            <p className="text-xs text-gray-600 font-light">Ejercicios para encontrar calma y que te servirán para el nacimiento.</p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl space-y-1">
            <h3 className="font-medium text-[#C47E63]">🧠 Relajación y calma</h3>
            <p className="text-xs text-gray-600 font-light">Un espacio para bajar el ritmo en medio de la rutina diaria.</p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl space-y-1">
            <h3 className="font-medium text-[#C47E63]">👶 Conectar con tu bebé</h3>
            <p className="text-xs text-gray-600 font-light">Momento para habitar la gestación de manera presente.</p>
          </div>
        </div>
      </section>

      {/* SECCIÓN 6: DÓNDE PRACTICAR */}
      <section className="space-y-6 border-t border-gray-100 pt-8">
        <h2 className="text-2xl md:text-3xl font-light text-[#C47E63]">
          ¿DÓNDE PRACTICAR YOGA DURANTE EL EMBARAZO?
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-5 border rounded-xl space-y-2">
            <h3 className="font-medium text-lg text-gray-800">🌿 Clases presenciales</h3>
            <ul className="text-sm text-gray-600 font-light space-y-1 list-disc list-inside">
              <li>Acompañamiento cercano de una profesora.</li>
              <li>Compartir la experiencia con otras futuras mamás.</li>
              <li>Un espacio para salir de la rutina.</li>
            </ul>
          </div>

          <div className="p-5 border rounded-xl space-y-2">
            <h3 className="font-medium text-lg text-gray-800">🤍 Clases desde casa (Online)</h3>
            <ul className="text-sm text-gray-600 font-light space-y-1 list-disc list-inside">
              <li>Flexibilidad para practicar según tu energía.</li>
              <li>Comodidad sin necesidad de trasladarte.</li>
              <li>Comunidad online para no sentirte sola.</li>
            </ul>
          </div>
        </div>

        {/* CTA FINAL DE PRE-REGISTRO */}
        <div className="p-8 bg-stone-50 rounded-2xl text-center space-y-4 max-w-xl mx-auto mt-8 border border-[#C47E63]/20">
          <h3 className="text-xl font-light text-[#C47E63]">
            Mi propuesta para acompañarte
          </h3>
          <p className="text-sm text-gray-600 font-light leading-relaxed">
            Estoy creando un espacio online para acompañarte durante tu embarazo a través del yoga prenatal, el movimiento, la respiración y la relajación. La membresía todavía está en preparación.
          </p>
          <div className="pt-2">
            <Link
              href="#"
              className="inline-block bg-[#C47E63] text-white px-6 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-all shadow-sm"
            >
              QUIERO PRE-REGISTRARME →
            </Link>
          </div>
          <p className="text-xs text-gray-400">Te avisaré cuando abramos las puertas.</p>
        </div>
      </section>

    </article>
  );
}