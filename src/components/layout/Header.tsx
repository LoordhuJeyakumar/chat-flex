"use client";

import { useEffect, useState } from "react";
import { Home, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";


export function Header() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Fix: Ensure the client is mounted before showing the theme toggle
  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamic breadcrumb based on pathname
  const breadcrumbItems = pathname
    .split("/")
    .filter(Boolean)
    .map((part, index, array) => {
      const href = "/" + array.slice(0, index + 1).join("/");
      return {
        label: part.charAt(0).toUpperCase() + part.slice(1),
        href,
      };
    });

  if (!mounted) {
    // Avoid rendering the toggle until the client is fully mounted
    return null;
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b bg-white dark:bg-gray-900 px-4 py-3 shadow-md w-full transition-all duration-300">
      {/* Left: Sidebar trigger and Breadcrumb */}
      <div className="flex items-center gap-2">
       
        <Separator orientation="vertical" className="h-6 mx-2" />
        <Breadcrumb className="text-sm text-muted-foreground hidden sm:flex">
          <BreadcrumbList>
          <Link href='/'><Home size={16}/></Link> / 
            {breadcrumbItems.length > 0 ? (
              breadcrumbItems.map((item, index) => (
                <BreadcrumbItem key={item.href}>
                  <BreadcrumbLink
                    href={item.href}
                    className="hover:text-primary transition-colors"
                  >
                    {item.label}
                  </BreadcrumbLink>
                  {index < breadcrumbItems.length - 1 && (
                    <BreadcrumbSeparator />
                  )}
                </BreadcrumbItem>
              ))
            ) : (
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="hover:text-primary transition-colors">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Center: Title */}
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight select-none bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 dark:from-blue-400 dark:via-purple-300 dark:to-indigo-400 transition-colors hover:scale-105 transform duration-200">
          Chat<span className="text-primary font-black">Flex</span>
        </h1>
        <div className="flex h-6 items-center">
          <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/30">
            Beta
          </span>
        </div>
      </div>

      {/* Right: Theme toggle button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-md transition-transform transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Toggle theme"
        >
          <div className="relative w-6 h-6">
            <Sun
              className={`absolute transition-transform duration-300 ${
                theme === "dark" ? "rotate-90 scale-0" : "rotate-0 scale-100"
              }`}
            />
            <Moon
              className={`absolute transition-transform duration-300 ${
                theme === "dark" ? "rotate-0 scale-100" : "-rotate-90 scale-0"
              }`}
            />
          </div>
          <span className="sr-only">Toggle theme</span>
        </button>
      </div>
    </header>
  );
}
