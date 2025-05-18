import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/Header";


const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Chat Flex | Adaptive Multi-Modal Chat Interface",
  description: "An advanced chat interface with multi-modal content support",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
      
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 w-full">
                {children}
              </main>
            </div>
        
        </ThemeProvider>
      </body>
    </html>
  );
}