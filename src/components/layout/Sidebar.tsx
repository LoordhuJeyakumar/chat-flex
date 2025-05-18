"use client";

import { usePathname, useRouter } from "next/navigation";
import { MessageSquarePlus, PlusCircle, Search, Clock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { cn, getMessagePreview } from "@/lib/utils";
import initialData from "@/data/mockData";
import { useSidebar } from "@/components/ui/sidebar";
import { SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

export function Sidebar() {
  const { open, isMobile } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();

  const createNewConversation = () => {
    router.push("/conversation/new");
  };

  return (
    <div data-state={open ? "expanded" : "collapsed"} className="h-full">
      <SidebarContent>
        <SidebarHeader className="p-4 flex items-center justify-between">
          <div className={cn("space-y-1", !open && isMobile && "hidden")}>
            <h2 className="text-lg font-semibold">Conversations</h2>
            <p className="text-sm text-muted-foreground">Manage your chats</p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="default" 
                size={open ? "default" : "icon"} 
                className="transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" 
                onClick={createNewConversation}
              >
                {open ? (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Chat
                  </>
                ) : (
                  <PlusCircle className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center" className={cn(open && "hidden")}>
              New Chat
            </TooltipContent>
          </Tooltip>
        </SidebarHeader>

        <div className="px-3 mb-2">
          <Button 
            variant="outline"
            className="w-full justify-start text-muted-foreground"
          >
            <Search className="mr-2 h-4 w-4" />
            {open && "Search chats..."}
          </Button>
        </div>

        <ScrollArea className="flex-1 overflow-hidden">
          <SidebarMenu>
            <Accordion 
              type="multiple" 
              className="space-y-1"
              defaultValue={[pathname.split('/')[2] || '']}
            >
              {initialData.map((conversation) => {
                const isActive = pathname === `/conversation/${conversation.id}`;
                return (
                  <AccordionItem 
                    key={conversation.id} 
                    value={conversation.id}
                    className="border-none"
                  >
                    <SidebarMenuItem>
                      <AccordionTrigger className={cn(
                        "flex items-center justify-between py-2 px-3 rounded-md transition-colors",
                        isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/60 text-muted-foreground",
                        !open && "justify-center p-2"
                      )}>
                        {open ? (
                          <span className="font-medium truncate">{conversation.title}</span>
                        ) : (
                          <MessageSquarePlus className="h-5 w-5" />
                        )}
                      </AccordionTrigger>
                    </SidebarMenuItem>
                    {open && (
                      <AccordionContent className="pt-1 pb-2">
                        <div className="pl-4 pr-2">
                          {conversation.messages.length > 0 && (
                            <div className="text-xs text-muted-foreground truncate mb-2 pl-2">
                              {getMessagePreview(conversation.messages[conversation.messages.length - 1].content)}
                            </div>
                          )}
                          <Link
                            href={`/conversation/${conversation.id}`}
                            className={cn(
                              "block w-full py-1.5 px-2 rounded text-sm hover:bg-muted transition-colors",
                              isActive && "bg-muted font-medium"
                            )}
                          >
                            Open Conversation
                          </Link>
                        </div>
                      </AccordionContent>
                    )}
                  </AccordionItem>
                );
              })}
            </Accordion>
          </SidebarMenu>
        </ScrollArea>

        <SidebarFooter className="p-4 border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Recent">
                <Link href="/recent">
                  <Clock className="h-4 w-4 mr-2" />
                  {open && "Recent"}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings">
                <Link href="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  {open && "Settings"}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SidebarContent>
    </div>
  );
}
