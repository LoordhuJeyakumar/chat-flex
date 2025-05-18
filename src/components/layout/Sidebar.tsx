"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquarePlus, Menu, X, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import Link from "next/link";
import { cn, getMessagePreview } from "@/lib/utils";
import { mockConversations } from "@/data/mockData";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const createNewConversation = () => {
    router.push("/conversation/new");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {/* Mobile Toggle Button */}
      <SheetTrigger asChild>
        <Button variant="outline" className="fixed bottom-6 right-6 z-40 md:hidden rounded-full p-3 shadow-xl">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </SheetTrigger>

      {/* Sidebar */}
      <SheetContent className="w-80 bg-background p-0">
        <Card className="h-full">
          <CardHeader className="flex items-center justify-between p-4 border-b">
            <CardTitle className="text-xl font-semibold">Conversations</CardTitle>
            <Button variant="ghost" size="icon" onClick={createNewConversation} aria-label="New conversation">
              <MessageSquarePlus className="w-5 h-5" />
            </Button>
          </CardHeader>
          <ScrollArea className="flex-1 p-4">
            <Accordion type="single" collapsible>
              {mockConversations.map((conversation) => {
                const isActive = pathname === `/conversation/${conversation.id}`;
                const lastMessage = conversation.messages[conversation.messages.length - 1];
                return (
                  <AccordionItem key={conversation.id} value={conversation.id}>
                    <AccordionTrigger className={cn(
                      "flex items-center justify-between p-3 rounded-lg transition-colors",
                      isActive ? "bg-muted text-primary" : "hover:bg-muted/60"
                    )}>
                      <span className="font-medium truncate">{conversation.title}</span>
                      {isActive ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </AccordionTrigger>
                    <AccordionContent>
                      {lastMessage && (
                        <div className="text-sm text-muted-foreground truncate p-2">
                          {getMessagePreview(lastMessage.content)}
                        </div>
                      )}
                      <Link
                        href={`/conversation/${conversation.id}`}
                        className="block text-sm text-blue-600 hover:underline p-2"
                      >
                        Open Conversation
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </ScrollArea>
        </Card>
      </SheetContent>
    </Sheet>
  );
}
