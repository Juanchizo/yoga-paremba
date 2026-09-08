"use client"
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import instagramSvg from '@/public/instagram.svg';
import faceSvg from '@/public/face.svg';
import whatsSvg from '@/public/whats.svg';

const socials = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/tatimonteroyoga',
    svg: instagramSvg,
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/tatimonteroyoga',
    svg: faceSvg,
  },
  {
    name: 'WhatsApp',
    href: 'https://wa.me/1234567890',
    svg: whatsSvg,
  },
];



export default function Footer() {
      const pathname = usePathname();
  
      if (pathname === '/pre-registro2') {
          return null;
      }
      
  const openSocial = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="bg-[#C47E63] border-t mt-auto py-10 px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-none px-2 md:px-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-background">
            Tati Montero <strong className="font-semibold">Yoga</strong>
          </p>
        </div>

        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          {socials.map((item) => (
            <Button
              key={item.name}
              className="bg-background text-[#C47E63] hover:bg-background/95 hover:underline flex items-center gap-2 rounded-none px-4 py-3 transform-gpu transition duration-200 ease-out hover:scale-105 hover:shadow-lg"
              onClick={() => openSocial(item.href)}
            >
              <Image src={item.svg} alt={item.name} width={20} height={20} />
              {item.name}
            </Button>
          ))}
        </div>

        <div className="flex flex-col items-start gap-2 text-sm text-background sm:items-end">
          <span>&copy; {new Date().getFullYear()} Tati Montero Yoga.</span>
          <Link href="/politicas" className="hover:underline ">
            Políticas de Privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}