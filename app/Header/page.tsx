"use client";
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button"
import  { House, EyeClosed, Info, Menu  } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import Tatifoto from "@/public/tatifoto.png"
import { useRouter } from 'next/navigation';
import { buttonVariants } from "@/components/ui/button"
import menu from "@/public/menu.svg"
import { usePathname } from 'next/navigation';


function Header() {
  const router = useRouter();
    const pathname = usePathname();

    if (pathname === '/pre-registro2') {
        return null;
    }

  return (
    <header className="sticky top-0 z-50 shadow-md shadow-black-100/10 dark:shadow-white/6 bg-background transition-all h-16 flex items-center">
    <div className="max-w-7xl w-full mx-auto px-5 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Link href="https://www.instagram.com/tatimonteroyoga?igsh=enIyNnI5Z2Y1NjJp" target="_blank" className="flex items-center gap-2 group">
        <div className="relative h-30 rounded-full overflow-hidden flex items-center justify-center">
            <Image 
            src={Tatifoto.src} 
            alt="Tati Montero Logo" 
            width={38} 
            height={38}
            className="object-cover"
            onError={(e) => e.currentTarget.style.display = 'none'} 
            />
        </div>
        <span className="font-light tracking-[0.2rem] text-sm uppercase text- group-hover:opacity-90 transition-opacity">
            Tati Montero <strong className="font-semibold">Yoga</strong>
        </span>
        </Link>

        {/* Navegación */}
        <nav className="hidden lg:flex items-center gap-4 text-sm tracking-wide font-light">
            <Button className="bg-background hover:bg-[#C47E63]/30 !text-[#C47E63] hover:px-10" variant={"outline"} onClick={() => router.push('/')}>
                Inicio
            </Button>
            <Button className="bg-background hover:bg-[#C47E63]/30 !text-[#C47E63] hover:px-10" variant={"outline"} onClick={() => router.push('/sobre-mi')}>
                Sobre mi
            </Button>
            <Button className="bg-background hover:bg-[#C47E63]/30 !text-[#C47E63] hover:px-10" variant={"outline"} onClick={() => router.push('/yogaprenatal')}>
                Yoga Prenatal
            </Button>
            <Button className="bg-background hover:bg-[#C47E63]/30 !text-[#C47E63] hover:px-10" variant={"outline"} onClick={() => router.push('/contacto')}>
                Contacto
            </Button>
            
            {/* REGISTRO */}
            <Button className="bg-background hover:bg-[#C47E63]/30 !text-[#C47E63] hover:px-10" variant={"outline"} onClick={() => router.push('/pre-registro')}>
                Pre-Registro
            </Button>
        </nav>

        <div className='lg:hidden flex'>
            <DropdownMenu >
                <DropdownMenuTrigger className="!text-[#C47E63] dark:!text-[#C47E63] hover:px-8" 
                render={<Button variant={"outline"}></Button>}>
                    <Menu color='#C47E63'/>Menu
                </DropdownMenuTrigger>
                <DropdownMenuContent className="lg:hidden">
                <DropdownMenuGroup>
                    <DropdownMenuItem className="!text-[#8FAE9C] hover:!bg-[#8FAE9C]/30" onClick={() => router.push('/')}>
                    <House color='#8FAE9C'/>
                    Inicio
                    </DropdownMenuItem>
                    <DropdownMenuItem className="!text-[#C47E63] hover:!bg-[#C47E63]/30" onClick={() => router.push('/sobre-mi')}>
                    <Info color='#C47E63' />
                    Sobre Mi
                    </DropdownMenuItem>
                    <DropdownMenuItem className="!text-[#C47E63] hover:!bg-[#C47E63]/30" onClick={() => router.push('/yogaprenatal')}>
                    <EyeClosed color='#C47E63' />
                    Yoga Prenatal
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push('/pre-registro')}>Pre-Registro</DropdownMenuItem>
                </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

    </div>
    </header>
  );
}

export default Header;