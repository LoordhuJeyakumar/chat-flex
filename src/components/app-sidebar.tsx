"use client"

import * as React from "react"
import { ArchiveX, MessageCirclePlus, Settings, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useConversations } from "@/hooks/useConversations"
import { useConversationActions } from "@/hooks/useConversationActions"
import { usePathname } from "next/navigation"
import { getRelativeTime } from "@/lib/utils"

// This is sample data
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "New Chat",
      url: "/conversation/new",
      icon: MessageCirclePlus,
      isActive: true,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      isActive: false,
    },
    {
      title: "Archive",
      url: "#",
      icon: ArchiveX,
      isActive: false,
    },
    {
      title: "Trash",
      url: "#",
      icon: Trash2,
      isActive: false,
    },
  ],
}

// Debug helper function
function debugConversations(conversations: any[], source: string) {
  console.log(`[SIDEBAR] ${source}: Conversations count=${conversations?.length || 0}`);
  if (conversations?.length > 0) {
    console.log(`[SIDEBAR] Available IDs: ${conversations.map(c => c.id).join(', ')}`);
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpen } = useSidebar()
  const { conversations, error: conversationsError } = useConversations()
  const [search, setSearch] = React.useState('')
  const [activeItem, setActiveItem] = React.useState(data.navMain[0])
  const router = useRouter()
  const pathname = usePathname()

  // Debug logs when conversations change
  React.useEffect(() => {
    debugConversations(conversations, "useEffect");
  }, [conversations]);

  // Handle search input change
  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }, [])

  // Filter conversations based on search term
  const filteredConversations = React.useMemo(() => {
    console.log(`[SIDEBAR] Filtering conversations, search="${search}"`);
    
    if (!conversations || !Array.isArray(conversations)) {
      console.log('[SIDEBAR] No conversations array available');
      return [];
    }
    
    debugConversations(conversations, "filteredConversations");
    
    const filtered = conversations.filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase())
    );
    
    console.log(`[SIDEBAR] Filtered to ${filtered.length} conversations`);
    return filtered;
  }, [conversations, search])

  // Handle sidebar item click
  const handleSidebarItemClick = React.useCallback((item) => {
    console.log(`[SIDEBAR] Clicked sidebar item: ${item.title}`);
    setActiveItem(item)
    setOpen(true)
    
    // Navigate to the item URL if provided
    if (item.url && item.url !== "#") {
      console.log(`[SIDEBAR] Navigating to ${item.url}`);
      router.push(item.url)
    }
  }, [setActiveItem, setOpen, router])

  // Handle navigation to a specific conversation
  const handleConversationClick = React.useCallback((id: string) => {
    console.log(`[SIDEBAR] Clicked conversation: ${id}`);
    router.push(`/conversation/${id}`)
  }, [router])

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      <div className="flex flex-row h-full w-[calc(var(--sidebar-width-icon)+1px)]">
        {/* Icon sidebar */}
        <Sidebar
          collapsible="none"
          className="md:w-[calc(var(--sidebar-width-icon)+1px)] w-[60px] border-r"
        >
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                  <a href="/">
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                      CF
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">Chat Flex</span>
                      <span className="truncate text-xs">CF</span>
                    </div>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent className="px-1.5 md:px-0">
                <SidebarMenu>
                  {data.navMain.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={{
                          children: item.title,
                          hidden: false,
                        }}
                        onClick={() => handleSidebarItemClick(item)}
                        isActive={activeItem?.title === item.title}
                        className="px-2.5 md:px-2"
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <NavUser user={data.user} />
          </SidebarFooter>
        </Sidebar>

        {/* Content sidebar */}
        <Sidebar collapsible="none" className="flex flex-col">
          <SidebarHeader className="gap-3.5 border-b p-4">
            <div className="flex w-full items-center justify-between">
              <div className="text-foreground text-base font-medium">
                {activeItem?.title}
              </div>
              {activeItem?.title === "New Chat" && (
                <a 
                  href="/conversation/new"
                  className="bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-accent-foreground rounded-md px-2.5 py-1.5 text-xs font-medium"
                >
                  New
                </a>
              )}
            </div>
            <SidebarInput 
              placeholder="Type to search..." 
              value={search}
              onChange={handleSearchChange}
            />
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup className="px-0">
              <SidebarGroupContent>
                {conversationsError ? (
                  <div className="p-4 text-sm text-red-500">
                    Error loading conversations: {conversationsError}
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">
                    {search ? "No conversations found" : "No conversations yet"}
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <a
                      href="#"
                      key={conv.id}
                      onClick={(e) => {
                        e.preventDefault();
                        handleConversationClick(conv.id);
                      }}
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0"
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="font-medium truncate max-w-[200px]">{conv.title}</span>
                        <span className="text-xs text-gray-500">
                          {conv.messages && conv.messages[0] ? 
                            getRelativeTime(conv.messages[0].timestamp) : 
                            ""}
                        </span>
                      </div>
                      <span className="line-clamp-2 w-full text-xs whitespace-break-spaces text-gray-600">
                        {conv.description}
                      </span>
                    </a>
                  ))
                )}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </div>
    </Sidebar>
  )
}