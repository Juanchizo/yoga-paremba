"use client"

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from 'embla-carousel-autoplay';
import { Label } from "@/components/ui/label"

const itemscard = [
  {
    title: 'Entender',
    icon: '/icons/elements/hoja.svg',
    text: 'Conocer los cambios que atraviesa tu cuerpo y aprender a escucharlo.',
  },
  {
    title: 'Moverte',
    icon:'/icons/elements/yoga-estiramiento.svg',
    text: 'Encontrar movimientos y prácticas que acompañen tu embarazo.',
  },
  {
    title: 'Respirar',
    icon:'/icons/elements/viento.svg',
    text: 'Aprender herramientas de respiración, relajación y conexión.',
  },
  {
    title: 'Conectar',
    icon:'/icons/elements/corazon.svg',
    text: 'Crear un espacio para vos, para tu cuerpo y para tu bebé.',
  }
];

import { useState } from 'react';

import miFoto from "@/public/tatifoto.png"
import { sendPdfAction } from './actions/send_gmail';

export default function HomePage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');

  // const plugin = React.useRef(
  //   Autoplay({ delay: 2000, stopOnInteraction: true })
  // )
  return (
    <div className="flex flex-col gap-6 px-2 md:px-0" id='divpage'>
      <div className="contenedorPrincipal">
        <div className="contenedorInfo py-6">
          <h1 className="text-center md:text-left">
            YOGA PRENATAL PARA ACOMPAÑARTE DURANTE TU EMBARAZO
          </h1>
          <p className="text-left">
            Yoga prenatal, movimiento, respiración y herramientas para acompañarte durante tu embarazo, estés donde estés.
          </p>
          <p className="text-left">
            Un espacio para moverte, respirar y conectar con tu cuerpo durante una de las etapas más transformadoras de tu vida.
          </p>
          <div className='flex gap-2'>
            <Link
              href="/guia-embarazadas"
              className="w-full bg-[#C47E63] text-white py-2 rounded  font-medium hover:opacity-90 text-center block justify-center items-center content-center"
              >
              EXPLORAR LA GUÍA
            </Link>
            <Link
              href="#mi-historia"
              className="w-full bg-[var(--color-crema)] color-terracota py-2 rounded  font-medium hover:opacity-90 text-center block"
              >
              CONOCER MI HISTORIA
            </Link>
          </div>
          {/* <p className="text-xl font-semibold text-[#C47E63]">TATI MONTERO</p> */}
        </div>
        <div className="contenedorOlas relative">
          <Image
            src="/galeria/tati-embarazada.webp"
            alt="Tati Montero"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-contain"
          />
        </div>
      </div>
      {/* 1. HERO */}
      <section className="gap-8 items-center">
        <div className="space-y-2">

          
        </div>
      </section>

      {/* 2. ¿POR QUÉ ESTÁS ACÁ? */}
      <section className="bg-[var(--color-marfil)] items-center px-6 py-6">
        <div className="flex flex-col md:flex-col gap-6 md:gap-8">
          <h2 className="w-full text-left">
            Quizás llegaste hasta acá porque estás buscando un espacio para vos.
          </h2>
          <div className="flex flex-col w-full text-left space-y-3">
            <p>
              Tu cuerpo está cambiando. Quizás algunos días sentís molestias, cansancio o tensión.
              Quizás tenés preguntas sobre cómo moverte durante el embarazo.
              Quizás es tu primer embarazo y aparecen dudas o miedos.
              O quizás simplemente necesitás encontrar un momento en el día para parar, respirar y conectar con vos misma.
              Sea cual sea el momento en el que estés, este puede ser tu espacio.
              Un lugar para aprender a escuchar tu cuerpo, moverte con confianza y disfrutar del proceso.
            </p>
            <p className="font-semibold text-[#C47E63] pt-2">
              NO TENÉS QUE ATREVESAR ESTE CAMINO SOLA.
            </p>
          </div>

        </div>
      </section>


      {/* 3. PROPUESTA Y 4 PILARES */}
      <section className="items-center px-6 py-6">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <h2 className="w-full md:w-1/3 text-left">
            Un espacio para acompañarte en cada etapa de tu embarazo
          </h2>
          <div className="flex flex-col w-full md:w-2/3 text-left space-y-3">
            <p className="">
              El embarazo es un momento de transformación. Tu cuerpo cambia, tus necesidades también y cada etapa puede traer nuevas sensaciones y desafíos.
            </p>
            <p className="">
              Por eso, mi propuesta no es solamente que hagas yoga. Es ofrecerte herramientas que te ayuden a conocer mejor tu cuerpo, acompañar sus cambios y encontrar momentos de conexión durante el embarazo.
            </p>
          </div>
        </div>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-6'>
          {itemscard.map(item=>{
            return (
              <div key={item.title} className="bg-[var(--color-crema)] rounded-xl p-4">
                {item.icon && (
                  <div className="w-full flex justify-center mb-2">
                    <Image src={item.icon} alt={item.title} width={50} height={50} />
                  </div>
                )}
                <p className="font-semibold text-lg text-[var(--color-verde-azulado)] dark:text-[#C47E63] select-none text-center">{item.title}</p>
                <p className="dark:text-white/70 select-none text-center">{item.text}</p>
              </div>
            )
          })}
        </div>

        {/* <div className="flex items-center justify-center w-full p-8">
          <Carousel className="w-full max-w-2xl flex bg-[#8FAE9C]/20 dark:bg-[#C47E63]/3 rounded-xl shadow " 
          plugins={[plugin.current]} 
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}>
            <CarouselContent className="">
              {itemscard.map((item, index) => (
                <CarouselItem key={index} className="md:basis-1/2 ">
                  <div className="p-2">
                  <Card className="">
                    <CardHeader className="">
                      <h3 className="font-semibold text-lg text-[#8FAE9C] dark:text-[#C47E63] select-none">{item.title}</h3>
                    </CardHeader>
                    <CardContent className="">
                      <p className="dark:text-white/70 select-none">{item.text}</p>
                    </CardContent>
                  </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
            </Carousel>
        </div> */}
      </section>

      {/* 4. SOBRE TATI */}
      <section id="mi-historia" className="bg-[var(--color-marfil)] grid md:grid-cols-3 gap-2 items-center scroll-mt-24 items-center px-6 py-6">
        <div className="space-y-4 md:col-span-2">
          <h2 className="text-center md:text-left">Hola, soy Tatiana Montero</h2>
          <p>Me hubiera gustado tener este espacio durante mi propio embarazo. Por eso decidí crearlo para vos.</p>
          <p>Mi camino hasta llegar al yoga prenatal comenzó mucho antes de llegar hasta acá. Primero fue la danza, después la educación física e inicial, y en el camino, descubrí el yoga y todo lo que puede ofrecernos a través del movimiento, la respiración y la conexión con nuestro cuerpo.</p>
          <p>Me formé en Yoga para Niños y Niñas, con certificación internacional de O.I.Y.A.Y, y realicé la formación especializada en Yoga y Embarazo, con certificación internacional de IYA (International Yoga Association).</p>
        </div>
        <div className="relative aspect-[1/1]  md:col-span-1  rounded-xl overflow-hidden shadow">
          <Image
            src="/galeria/tati-corazon.webp"
            alt="Tatiana Montero"
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
        <div className="space-y-4 md:order-2 md:col-span-2">
          <h2 className="text-center md:text-left">También soy mamá</h2>
          <div className="space-y-3">
            <p>Hace 9 años viví mi propio embarazo y tuve la oportunidad de participar en clases de preparación para el parto combinadas con movimiento y yoga durante mi último mes.</p>
            <p>Recuerdo lo bien que me hizo sentir tener ese espacio. Un momento para moverme, respirar, conectar conmigo misma y prepararme para el nacimiento de mi hija.</p>
            <p>Y también recuerdo pensar cuánto me habría gustado contar con ese acompañamiento durante todo mi embarazo. Un espacio donde pudiera aprender sobre mi cuerpo, encontrar herramientas para transitar sus cambios, resolver mis dudas y, sobre todo, sentirme acompañada.</p>
            <p>Por eso nació este espacio. Para que vos también puedas tener un lugar donde parar, respirar, moverte y conectar con vos misma y con tu bebé.</p>
            <p className="font-medium text-[#C47E63]">Sin exigencias. Sin buscar hacerlo perfecto. A tu ritmo. Porque creo que acompañar también es enseñar a confiar.</p>
          </div>
        </div>
        <div className="relative aspect-[1/1] mx-auto w-full rounded-xl overflow-hidden shadow md:order-1">
          <Image
            src="/galeria/tati-alma-yoga.webp"
            alt="Tatiana Montero"
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover"
          />
        </div>
      </section>

      {/* 6. NO SE TRATA DE HACERLO PERFECTO */}
      <section className="items-center bg-[var(--color-marfil)] py-6 px-6">
        <div className="space-y-2 text-center">
          <h2 >No se trata de hacerlo perfecto.</h2>
          <p>No creo que el embarazo tenga que vivirse siguiendo una lista de cosas que "deberías" hacer.</p>
          <p>Creo en escuchar tu cuerpo. En respetar tus tiempos. En aprender a reconocer lo que necesitás.</p>
          <p>En encontrar movimiento cuando tu cuerpo te lo pide. Y también en saber cuándo necesitás descansar.</p>
          <p>Creo en darte herramientas para que puedas atravesar tu embarazo con más información, más confianza y más conexión.</p>
          <p className="font-semibold text-[#C47E63]">A VECES CUIDARTE ES MOVERTE. Y otras veces, descansar.</p>
        </div>
      </section>

      {/* 7. HERRAMIENTAS */}
      <section className="flex flex-col gap-2 text-center">
        <h2 >Herramientas para acompañarte durante tu embarazo</h2>
        <p className="">Un espacio para aprender, practicar y conectar con vos misma.</p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-left">
          <div className="p-3 border rounded-lg bg-[var(--color-crema)]">
            <p className="font-semibold text-[var(--color-verde-azulado)]">🧠 Entiende tu cuerpo</p>
            <p className="text-xs">Información para comprender los cambios de tu cuerpo.</p>
          </div>
          <div className="p-3 border rounded-lg bg-[var(--color-crema)]">
            <p className="font-semibold text-[var(--color-verde-azulado)]">🧘‍♀️ Practica conmigo</p>
            <p className="text-xs">Movimientos y prácticas de yoga prenatal.</p>
          </div>
          <div className="p-3 border rounded-lg bg-[var(--color-crema)]">
            <p className="font-semibold text-[var(--color-verde-azulado)]">🌬️ Respira conmigo</p>
            <p className="text-xs">Respiraciones para encontrar calma y conexión.</p>
          </div>
          <div className="p-3 border rounded-lg bg-[var(--color-crema)]">
            <p className="font-semibold text-[var(--color-verde-azulado)]">🤎 Un momento para vos</p>
            <p className="text-xs">Pequeños espacios para parar y escucharte.</p>
          </div>
          <div className="p-3 border rounded-lg bg-[var(--color-crema)] col-span-2 md:col-span-1">
            <p className="font-semibold text-[var(--color-verde-azulado)]">🌸 Preparándote</p>
            <p className="text-xs">Herramientas para el momento del nacimiento.</p>
          </div>
        </div>
      </section>

      {/* 8. FORMULARIO RECURSO GRATUITO */}
      <section className="grid grid-cols-1 md:grid-cols-7 py-4 text-center gap-6">
        <div className="relative flex md:col-span-2" >
            <Image
              src="/galeria/portada-guia-embarazada.webp"
              alt="Guía de yoga para embarazadas"
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              className="object-contain"
              >

            </Image>
          </div>
        <div className="md:col-span-2">
          <h2>Empezá a acompañarte hoy</h2>
          <p className="">
            Mientras preparo este espacio para vos, podés empezar a incorporar pequeñas herramientas de movimiento, respiración y conexión a tu día a día.
          </p>
          
        </div>

        <form className="bg-[var(--color-crema)] p-6 border rounded-xl md:col-span-3 text-left shadow-sm space-y-3">
          <h3 >QUIERO RECIBIR EL RECURSO GRATUITO</h3>
          <div>
            <label className="text-xs font-semibold text-[var(--text-color)]">Nombre</label>
            <input type="text" className="w-full border p-2 rounded  mt-1 focus:outline-none bg-white" onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text-color)]">Email</label>
            <input type="email" className="w-full border p-2 rounded  mt-1 focus:outline-none bg-white" onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="w-full bg-[#C47E63] text-white py-2 rounded  font-medium hover:opacity-90" onClick={async (e) => {
            e.preventDefault();
            const response = await sendPdfAction(nombre, email);
            if (response.status === "success") {
              alert("¡Recursos enviados! Revisa tu correo.");
            } else {
              alert("Error al enviar los recursos. Inténtalo de nuevo.");
            }
          }}>
            QUIERO RECIBIRLO
          </button>
          <p className="text-[10px] text-gray-400 text-center pt-1">
            Al enviar aceptas nuestra <Link href="/politicas" className="underline">Política de Privacidad</Link>.
          </p>
        </form>
      </section>

    </div>
  );
}

