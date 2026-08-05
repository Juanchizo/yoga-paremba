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
// Autoplay plugin removed because 'embla-carousel-autoplay' is not available in the project
// If you install it later, re-enable the import and the plugins prop on the Carousel below

import { Label } from "@/components/ui/label"


const itemscard = [
  {
    title: 'Entender',
    text: 'Conocer los cambios que atraviesa tu cuerpo y aprender a escucharlo.',
  },
  {
    title: 'Moverte',
    text: 'Encontrar movimientos y prácticas que acompañen tu embarazo.',
  },
  {
    title: 'Respirar',
    text: 'Aprender herramientas de respiración, relajación y conexión.',
  },
  {
    title: 'Conectar',
    text: 'Crear un espacio para vos, para tu cuerpo y para tu bebé.',
  }
];


import miFoto from "@/public/tatifoto.png"

export default function HomePage() {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  )
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-20 text-gray-800" id='divpage'>
          <h1 className="text-5xl font-light text-[#C47E63] text-center">
            YOGA PRENATAL PARA ACOMPAÑARTE DURANTE TU EMBARAZO
          </h1>
          <div className="flex items-center justify-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={miFoto.src} alt="Tati Montero" />
              <AvatarFallback>TM</AvatarFallback>
            </Avatar>
            <p className="text-xl font-semibold text-[#C47E63]">TATI MONTERO</p>
          </div>
      {/* 1. HERO */}
      <section className="gap-8 items-center">
        <div className="space-y-2">

          <p className="text-gray-600 uppercase text-center">
            Yoga prenatal, movimiento, respiración y herramientas para acompañarte durante tu embarazo, estés donde estés.
          </p>
          <p className="text-gray-600 uppercase text-center">
            Un espacio para moverte, respirar y conectar con tu cuerpo durante una de las etapas más transformadoras de tu vida.
          </p>
        </div>
      </section>

      {/* 2. ¿POR QUÉ ESTÁS ACÁ? */}
      <section className="items-center">
        <div className="space-y-1 text-center">
          <h2 className="text-2xl font-light text-[#C47E63]">
            Quizás llegaste hasta acá porque estás buscando un espacio para vos.
          </h2>
          <div className="text-gray-600">
            <p>Tu cuerpo está cambiando.</p>
            <p>Quizás algunos días sentís molestias, cansancio o tensión.</p>
            <p>Quizás tenés preguntas sobre cómo moverte durante el embarazo.</p>
            <p>Quizás es tu primer embarazo y aparecen dudas o miedos.</p>
            <p>O quizás simplemente necesitás encontrar un momento en el día para parar, respirar y conectar con vos misma.</p>
            <p>Sea cual sea el momento en el que estés, este puede ser tu espacio.</p>
            <p>Un lugar para aprender a escuchar tu cuerpo, moverte con confianza y disfrutar del proceso.</p>
          </div>
          <p className="font-semibold text-[#C47E63] pt-2">
            NO TENÉS QUE ATREVESAR ESTE CAMINO SOLA.
          </p>
        </div>
      </section>

      {/* 3. PROPUESTA Y 4 PILARES */}
      <section className="space-y-8 text-center">
        <div className=" space-y-3">
          <h2 className="text-2xl font-light text-[#C47E63]">
            Un espacio para acompañarte en cada etapa de tu embarazo
          </h2>
          <p className="text-gray-600">
            El embarazo es un momento de transformación. Tu cuerpo cambia, tus necesidades también y cada etapa puede traer nuevas sensaciones y desafíos.
          </p>
          <p className="text-gray-600">
            Por eso, mi propuesta no es solamente que hagas yoga. Es ofrecerte herramientas que te ayuden a conocer mejor tu cuerpo, acompañar sus cambios y encontrar momentos de conexión durante el embarazo.
          </p>
        </div>
        <div className="flex items-center justify-center w-full">
          <Carousel className="w-full max-w-2xl flex bg-[#8FAE9C]/20 dark:bg-[#C47E63]/3 rounded-xl shadow" 
          plugins={[plugin.current]} 
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}>
            <CarouselContent className="">
              {itemscard.map((item, index) => (
                <CarouselItem key={index} className="md:basis-1/2">
                  <div className="p-2">
                  <Card className="">
                    <CardHeader className="">
                      <h3 className="font-semibold text-lg text-[#8FAE9C] dark:text-[#C47E63] select-none">{item.title}</h3>
                    </CardHeader>
                    <CardContent className="">
                      <p className="text-gray-600 dark:text-white/70 select-none">{item.text}</p>
                    </CardContent>
                  </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
            </Carousel>
        </div>
      </section>

      {/* 4. SOBRE TATI */}
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-light text-[#C47E63]">Hola, soy Tatiana Montero</h2>
          <p className="text-gray-600">Me hubiera gustado tener este espacio durante mi propio embarazo. Por eso decidí crearlo para vos.</p>
          <p className="text-gray-600">Mi camino hasta llegar al yoga prenatal comenzó mucho antes de llegar hasta acá. Primero fue la danza, después la educación física e inicial, y en el camino, descubrí el yoga y todo lo que puede ofrecernos a través del movimiento, la respiración y la conexión con nuestro cuerpo.</p>
          <p className="text-gray-600">Me formé en Yoga para Niños y Niñas, con certificación internacional de O.I.Y.A.Y, y realicé la formación especializada en Yoga y Embarazo, con certificación internacional de IYA (International Yoga Association).</p>
        </div>
        <div className="relative aspect-[9/16] max-w-xs mx-auto w-full rounded-xl overflow-hidden shadow">
          <Image src="/tati-retrato.jpg" alt="Tatiana Montero" fill className="object-cover" />
        </div>
      </section>

      {/* 5. TAMBIÉN SOY MAMÁ */}
      <section className="max-w-10xl mx-auto p-6 bg-stone-50 rounded-xl space-y-4">
        <h2 className="text-2xl font-light text-[#C47E63] text-center">También soy mamá</h2>
        <div className="space-y-3 text-gray-600">
          <p>Hace 9 años viví mi propio embarazo y tuve la oportunidad de participar en clases de preparación para el parto combinadas con movimiento y yoga durante mi último mes.</p>
          <p>Recuerdo lo bien que me hizo sentir tener ese espacio. Un momento para moverme, respirar, conectar conmigo misma y prepararme para el nacimiento de mi hija.</p>
          <p>Y también recuerdo pensar cuánto me habría gustado contar con ese acompañamiento durante todo mi embarazo. Un espacio donde pudiera aprender sobre mi cuerpo, encontrar herramientas para transitar sus cambios, resolver mis dudas y, sobre todo, sentirme acompañada.</p>
          <p>Por eso nació este espacio. Para que vos también puedas tener un lugar donde parar, respirar, moverte y conectar con vos misma y con tu bebé.</p>
          <p className="font-medium text-[#C47E63]">Sin exigencias. Sin buscar hacerlo perfecto. A tu ritmo. Porque creo que acompañar también es enseñar a confiar.</p>
        </div>
      </section>

      {/* 6. NO SE TRATA DE HACERLO PERFECTO */}
      <section className="items-center">
        <div className="space-y-4 text-gray-600 text-center">
          <h2 className="text-2xl font-light text-[#C47E63]">No se trata de hacerlo perfecto.</h2>
          <p>No creo que el embarazo tenga que vivirse siguiendo una lista de cosas que "deberías" hacer.</p>
          <p>Creo en escuchar tu cuerpo. En respetar tus tiempos. En aprender a reconocer lo que necesitás.</p>
          <p>En encontrar movimiento cuando tu cuerpo te lo pide. Y también en saber cuándo necesitás descansar.</p>
          <p>Creo en darte herramientas para que puedas atravesar tu embarazo con más información, más confianza y más conexión.</p>
          <p className="font-semibold text-[#C47E63]">A VECES CUIDARTE ES MOVERTE. Y otras veces, descansar.</p>
        </div>
      </section>

      {/* 7. HERRAMIENTAS */}
      <section className="space-y-6 text-center">
        <h2 className="text-2xl font-light text-[#C47E63]">Herramientas para acompañarte durante tu embarazo</h2>
        <p className="text-gray-600">Un espacio para aprender, practicar y conectar con vos misma.</p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-left">
          <div className="p-3 border rounded-lg">
            <span className="text-xl">🧠</span>
            <h3 className="font-medium text-xs text-gray-800 uppercase mt-1">Entiende tu cuerpo</h3>
            <p className="text-xs text-gray-500">Información para comprender los cambios de tu cuerpo.</p>
          </div>
          <div className="p-3 border rounded-lg">
            <span className="text-xl">🧘‍♀️</span>
            <h3 className="font-medium text-xs text-gray-800 uppercase mt-1">Practica conmigo</h3>
            <p className="text-xs text-gray-500">Movimientos y prácticas de yoga prenatal.</p>
          </div>
          <div className="p-3 border rounded-lg">
            <span className="text-xl">🌬️</span>
            <h3 className="font-medium text-xs text-gray-800 uppercase mt-1">Respira conmigo</h3>
            <p className="text-xs text-gray-500">Respiraciones para encontrar calma y conexión.</p>
          </div>
          <div className="p-3 border rounded-lg">
            <span className="text-xl">🤎</span>
            <h3 className="font-medium text-xs text-gray-800 uppercase mt-1">Un momento para vos</h3>
            <p className="text-xs text-gray-500">Pequeños espacios para parar y escucharte.</p>
          </div>
          <div className="p-3 border rounded-lg col-span-2 md:col-span-1">
            <span className="text-xl">🌸</span>
            <h3 className="font-medium text-xs text-gray-800 uppercase mt-1">Preparándote</h3>
            <p className="text-xs text-gray-500">Herramientas para el momento del nacimiento.</p>
          </div>
        </div>
      </section>

      {/* 8. FORMULARIO RECURSO GRATUITO */}
      <section className="max-w-md mx-auto space-y-4 text-center">
        <h2 className="text-2xl font-light text-[#C47E63]">Empezá a acompañarte hoy</h2>
        <p className="text-sm text-gray-600">
          Mientras preparo este espacio para vos, podés empezar a incorporar pequeñas herramientas de movimiento, respiración y conexión a tu día a día.
        </p>

        <form className="bg-white p-6 border rounded-xl space-y-3 text-left shadow-sm">
          <h3 className="font-medium text-center text-gray-800 text-sm">QUIERO RECIBIR EL RECURSO GRATUITO</h3>
          <div>
            <label className="text-xs text-gray-500">Nombre</label>
            <input type="text" className="w-full border p-2 rounded text-sm mt-1 focus:outline-none" required />
          </div>
          <div>
            <label className="text-xs text-gray-500">Email</label>
            <input type="email" className="w-full border p-2 rounded text-sm mt-1 focus:outline-none" required />
          </div>
          <button type="submit" className="w-full bg-[#C47E63] text-white py-2 rounded text-sm font-medium hover:opacity-90">
            QUIERO RECIBIRLO
          </button>
          <p className="text-[10px] text-gray-400 text-center pt-1">
            Al enviar aceptas nuestra <Link href="#" className="underline">Política de Privacidad</Link>.
          </p>
        </form>
      </section>

    </div>
  );
}

