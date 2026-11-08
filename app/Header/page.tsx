"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button"
import { House, EyeClosed, Menu, LogOut, User, LayoutDashboard } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import Tatifoto from "@/public/tatifoto.png"
import { useRouter, usePathname } from 'next/navigation';
import { getStoredUser, removeStoredUser, hasPermission, refreshUserFromDB, AuthUser } from "@/lib/auth";

function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const initial = getStoredUser();
    setCurrentUser(initial);

    // Sincronizar en segundo plano con la base de datos por si cambiaron sus permisos
    if (initial?.email) {
      refreshUserFromDB(initial.email).then((updated) => {
        if (updated) setCurrentUser(updated);
      });
    }

    function handleAuthChange() {
      setCurrentUser(getStoredUser());
    }

    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  function handleLogout() {
    removeStoredUser();
    router.push('/');
  }

  if (pathname === '/pre-registro2') {
    return null;
  }

  const canAccessDashboard = hasPermission(currentUser, 'ver_dashboard');

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
          <span className="font-light tracking-[0.2rem] text-sm uppercase group-hover:opacity-90 transition-opacity">
            Tati Montero <strong className="font-semibold">Yoga</strong>
          </span>
        </Link>

        {/* Navegación Desktop */}
        <nav className="hidden lg:flex items-center gap-4 text-sm tracking-wide font-light">
          <Button className="bg-background hover:bg-[#C47E63]/20 !text-[#C47E63] transition-colors" variant={"outline"} onClick={() => router.push('/')}>
            Inicio
          </Button>
          <Button className="bg-background hover:bg-[#C47E63]/20 !text-[#C47E63] transition-colors" variant={"outline"} onClick={() => router.push('/guia-embarazadas')}>
            Guía para embarazadas
          </Button>
          <Button className="bg-background hover:bg-[#C47E63]/20 !text-[#C47E63] transition-colors" variant={"outline"} onClick={() => router.push('/yoga-embarazadas')}>
            Yoga Prenatal
          </Button>
          
          {/* Si está logueado */}
          {currentUser ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-stone-200">
              <span className="text-xs text-stone-600 flex items-center gap-1 font-normal">
                <User className="w-3.5 h-3.5 text-[#C47E63]" />
                Hola, {currentUser.nombre || currentUser.email.split('@')[0]}
              </span>

              {/* Botón discreto hacia el Dashboard si tiene permiso ver_dashboard */}
              {canAccessDashboard && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                  className="bg-[#C47E63]/10 hover:bg-[#C47E63]/20 !text-[#C47E63] border-[#C47E63]/30 transition-colors text-xs flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Panel
                </Button>
              )}

              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="text-stone-500 hover:text-red-600 hover:bg-red-50 border-stone-300 transition-colors text-xs flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Cerrar sesión
              </Button>
            </div>
          ) : (
            /* Si NO está logueado: Botón Acceso */
            <Button className="bg-background hover:bg-[#C47E63]/20 !text-[#C47E63] transition-colors font-normal" variant={"outline"} onClick={() => router.push('/acceso')}>
              Acceso
            </Button>
          )}
        </nav>

        {/* Navegación Móvil */}
        <div className='lg:hidden flex items-center gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger className="!text-[#C47E63] dark:!text-[#C47E63] transition-colors" 
              render={<Button variant={"outline"}></Button>}>
              <Menu color='#C47E63'/> Menu
            </DropdownMenuTrigger>
            <DropdownMenuContent className="lg:hidden">
              <DropdownMenuGroup>
                <DropdownMenuItem className="!text-[#8FAE9C] hover:!bg-[#8FAE9C]/30" onClick={() => router.push('/')}>
                  <House color='#8FAE9C'/>
                  Inicio
                </DropdownMenuItem>
                <DropdownMenuItem className="!text-[#C47E63] hover:!bg-[#C47E63]/30" onClick={() => router.push('/yoga-embarazadas')}>
                  <EyeClosed color='#C47E63' />
                  Yoga Prenatal
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:!bg-stone-100" onClick={() => router.push('/guia-embarazadas')}>
                  Guía para embarazadas
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {currentUser ? (
                  <>
                    <DropdownMenuItem disabled className="text-xs text-stone-500">
                      {currentUser.nombre || currentUser.email} ({currentUser.rol?.nombre || 'Estudiante'})
                    </DropdownMenuItem>
                    {canAccessDashboard && (
                      <DropdownMenuItem onClick={() => router.push('/dashboard')} className="!text-[#C47E63] font-medium">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Ir al Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout} className="!text-red-600 hover:!bg-red-50">
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => router.push('/acceso')}>
                    Acceso
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </header>
  );
}

export default Header;
