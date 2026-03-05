"use client";

import Link from "next/link";
import { MdHome, MdLibraryMusic, MdSearch, MdPerson } from "react-icons/md";
import MuseLogo from "./SVG/MuseLogo";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Nav() {
  const { isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-2 hover:text-primary-bis text-foreground outline-none cursor-pointer">
        <div className="w-[20px] h-[20px]">
          <MdPerson className="w-full h-full" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card text-card-foreground border-border">
        {isAuthenticated ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="w-full cursor-pointer">Compte</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="cursor-pointer">
              Mode {theme === "dark" ? "clair" : "sombre"}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/a-propos" className="w-full cursor-pointer">À propos</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/a-propos#contact" className="w-full cursor-pointer">Contact</Link>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href="/login" className="w-full cursor-pointer">Connexion</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/register" className="w-full cursor-pointer">Inscription</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="cursor-pointer">
              Mode {theme === "dark" ? "clair" : "sombre"}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/a-propos" className="w-full cursor-pointer">À propos</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/a-propos#contact" className="w-full cursor-pointer">Contact</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {/* Mobile Nav (< lg) */}
      <nav className="fixed bg-background bottom-0 left-0 right-0 lg:hidden bg-background-secondary p-4 flex justify-around items-center z-50 text-foreground border-t border-input">
        <Link href="/" className="p-2 hover:text-primary-bis">
          <div className="w-[20px] h-[20px]">
            <MdHome className="w-full h-full" />
          </div>
        </Link>
        <Link href="/library" className="p-2 hover:text-primary-bis">
          <div className="w-[17px] h-[17px]">
            <MdLibraryMusic className="w-full h-full" />
          </div>
        </Link>
        <Link href="/" className="p-2 hover:text-primary-bis">
          <div className="w-[20px] h-[20px]">
            <MdSearch className="w-full h-full" />
          </div>
        </Link>
        <UserMenu />
      </nav>

      {/* Desktop Nav (>= lg) */}
      <nav className="hidden lg:flex sticky top-0 bg-background/95 backdrop-blur items-center justify-between px-[12.5%] py-4 border-b border-input z-50">
        <div className="flex items-center">
          <Link href="/">
            <div className="h-[30px] pb-2 w-auto">
              <MuseLogo color1="var(--color-muse-pink)" color2="var(--color-muse-sky-blue)" />
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/" className="p-2 hover:text-primary-bis text-foreground">
            <div className="w-[20px] h-[20px]">
              <MdHome className="w-full h-full" />
            </div>
          </Link>
          <Link href="/library" className="p-2 hover:text-primary-bis text-foreground">
            <div className="w-[17px] h-[17px]">
              <MdLibraryMusic className="w-full h-full" />
            </div>
          </Link>
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 rounded-full bg-background-secondary text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-secondary">
              <MdSearch className="w-full h-full" />
            </div>
          </div>

          <UserMenu />
        </div>
        <span></span>
      </nav>
    </>
  );
}
