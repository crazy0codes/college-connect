"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar" // Using the shadcn sidebar component [^1]
import { Globe, Hash, Plus, Search } from "lucide-react"
import { Avatar } from "./ui/avatar"
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"

// Mock data for channels
const CHANNELS = [
  { id: "global", name: "Global Chat", icon: Globe, description: "Chat with students from all colleges" },
  { id: "cs101", name: "CS 101", icon: Hash, description: "Introduction to Computer Science" },
  { id: "math201", name: "Math 201", icon: Hash, description: "Advanced Calculus" },
  { id: "physics", name: "Physics Club", icon: Hash, description: "For physics enthusiasts" },
  { id: "gaming", name: "Gaming", icon: Hash, description: "Gaming discussions and meetups" },
  { id: "study-group", name: "Study Group", icon: Hash, description: "Find study partners" },
  { id: "campus-events", name: "Campus Events", icon: Hash, description: "Upcoming events at your campus" },
  { id: "internships", name: "Internships", icon: Hash, description: "Internship opportunities and advice" },
]

export function AppSidebar() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false)
  const [newChannelName, setNewChannelName] = useState("")
  const [newChannelDescription, setNewChannelDescription] = useState("")

  const filteredChannels = CHANNELS.filter((channel) => channel.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const isActive = (id: string) => {
    return pathname === `/chat/${id}`
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-2">
        <div className="flex items-center gap-2 px-2">
          <div className="flex-1">
            <h2 className="text-lg font-semibold">College Connect</h2>
            <p className="text-xs text-muted-foreground">{user?.college}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-4 py-2">
            <SidebarGroupLabel>Channels</SidebarGroupLabel>
            <Dialog open={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Create Channel</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a new channel</DialogTitle>
                </DialogHeader>
                <form
                  className="space-y-4 pt-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    // In a real app, this would create a new channel
                    setIsCreateChannelOpen(false)
                    setNewChannelName("")
                    setNewChannelDescription("")
                  }}
                >
                  <div className="space-y-2">
                    <label htmlFor="channel-name" className="text-sm font-medium">
                      Channel Name
                    </label>
                    <Input
                      id="channel-name"
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      placeholder="e.g., study-group"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="channel-description" className="text-sm font-medium">
                      Description
                    </label>
                    <Input
                      id="channel-description"
                      value={newChannelDescription}
                      onChange={(e) => setNewChannelDescription(e.target.value)}
                      placeholder="What's this channel about?"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateChannelOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Channel</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <SidebarGroupContent>
            <div className="px-4 py-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search channels"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-12rem)]">
              <SidebarMenu>
                {filteredChannels.map((channel) => (
                  <SidebarMenuItem key={channel.id}>
                    <SidebarMenuButton asChild isActive={isActive(channel.id)} tooltip={channel.description}>
                      <Link href={`/chat/${channel.id}`}>
                        <channel.icon className="h-4 w-4" />
                        <span>{channel.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {filteredChannels.length === 0 && (
                  <div className="px-4 py-2 text-sm text-muted-foreground">No channels found</div>
                )}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-2">
          {/* <div className="h-8 w-8 rounded-full bg-primary"></div> */}
          <Avatar className="h-8 w-8 rounded-full bh-white">
            <AvatarImage src={user?.profile} alt={user?.displayName} />
            <AvatarFallback>{user?.displayName}</AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium">{user?.displayName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.isAnonymous ? "Anonymous Mode" : user?.email}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

