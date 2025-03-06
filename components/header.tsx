"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MoonIcon,
  SunIcon,
  SearchIcon,
  Star,
  Home,
  Gamepad2,
  Dices,
} from "lucide-react";
import { useTheme } from "next-themes";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4 max-w-1xl">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="relative flex items-center">
              <Gamepad2 className="h-8 w-8 text-primary" />
              <Dices className="h-5 w-5 text-primary absolute -right-1 -top-2" />
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium flex items-center gap-1.5 ${
                pathname === "/"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link
              href="/favorites"
              className={`text-sm font-medium flex items-center gap-1.5 ${
                pathname === "/favorites"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <Star className="h-3.5 w-3.5" />
              Favorites
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search games..."
              className="w-[200px] pl-8 md:w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover:scale-110 transition-all duration-200 cursor-pointer"
          >
            <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Link href="/favorites" className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className={
                pathname === "/favorites"
                  ? "text-primary"
                  : "text-muted-foreground"
              }
            >
              <Star className="h-5 w-5" />
              <span className="sr-only">Favorites</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
