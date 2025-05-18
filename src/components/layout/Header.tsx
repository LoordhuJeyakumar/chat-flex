"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

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
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b bg-background px-4 py-2 shadow-md">
      {/* Left: Sidebar trigger and Breadcrumb */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 p-2 hover:bg-muted rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
          <Menu size={20} />
        </SidebarTrigger>
        <Separator orientation="vertical" className="h-6 mx-2" />
        <Breadcrumb className="text-sm text-muted-foreground">
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
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
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Center: Title */}
      <h1 className="text-lg font-semibold tracking-wide select-none">
        Chat Flex
      </h1>

      {/* Right: Theme toggle button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-md transition-transform transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
