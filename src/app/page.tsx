
import { Header } from "@/components/layout/Header";
import { AppSidebar } from "@/components/app-sidebar";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";




export default function Home() {
 
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
       <Header/>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Main content area */}
          <div className="flex flex-col flex-1">
           
            <main className="flex flex-col items-center justify-center flex-1 p-8 bg-muted/30">
              <div className="max-w-lg space-y-4 text-center">
                <h1 className="text-3xl font-bold tracking-tight">
                  Welcome to Chat Flex
                </h1>
                <p className="text-muted-foreground">
                  Select an existing conversation from the sidebar or start a
                  new one
                </p>
                <div className="flex justify-center">
                  <a
                    href="/conversation/new"
                    className="inline-flex items-center justify-center px-4 py-2 font-medium transition-colors bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Start New Conversation
                  </a>
                 
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
