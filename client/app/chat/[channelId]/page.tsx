"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { socket } from "@/lib/socket";

// Mock data for channels
const CHANNELS = [
  {
    id: "global",
    name: "Global Chat",
    description: "Chat with students from all colleges",
  },
];

type Message = {
  id: string;
  content: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    college: string;
  };
};

export default function ChannelPage() {
  const { user } = useAuth();
  const { channelId } = useParams<{ channelId: string }>();
  const [channel, setChannel] = useState<(typeof CHANNELS)[0] | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [picture, setPicture] = useState("");

  const generateMockMessages = (channelId: string) => {
    return [
      {
        id: "msg-1",
        content: "Hello everyone!",
        timestamp: new Date().toISOString(),
        user: {
          id: "user-1",
          name: "John Doe",
          college: "Engineering",
        },
      },
      {
        id: "msg-2",
        content: "Hi John! How are you?",
        timestamp: new Date().toISOString(),
        user: {
          id: "user-2",
          name: "Jane Smith",
          college: "Arts",
        },
      },
    ];
  }

  useEffect(() => {
    socket.connect();

   
    socket.on("updated-pfp", (imgUrl) => {
      setPicture(() => imgUrl);
      console.log(imgUrl);
    });

    socket.on("fetch-pfp", (imgUrl) => {
      console.log("imgUrl :", imgUrl);
      setPicture(() => imgUrl);
    });

    socket.on("updated-username", (username) => {
      localStorage.setItem("username", username);
    });

    return () => {
      socket.off("updated-username");
      socket.off("pfp");
      socket.off("fetch-pfp");
      socket.disconnect();
    };
  }, []);


  // Find channel data
  useEffect(() => {
    const foundChannel = CHANNELS.find((c) => c.id === channelId);
    setChannel(foundChannel);

    // Load mock messages
    if (foundChannel) {
      setMessages(generateMockMessages(channelId as string));
    }
  }, [channelId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    const typingTimeout = setTimeout(() => {
      setIsTyping(false);
    }, 3000);

    return () => clearTimeout(typingTimeout);
  }, [isTyping]);

  // Simulate other users typing
  useEffect(() => {
    const interval = setInterval(() => {
      const shouldAddTyper = Math.random() > 0.7;

      if (shouldAddTyper) {
        const typers = ["Alex", "Taylor", "Jordan"];
        const randomTyper = typers[Math.floor(Math.random() * typers.length)];

        setTypingUsers((prev) => {
          if (prev.includes(randomTyper)) return prev;
          return [...prev, randomTyper];
        });

        // Remove typer after random time
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((name) => name !== randomTyper));
        }, 2000 + Math.random() * 3000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.displayName,
        college: user.college,
      },
    };

    setMessages((prev) => [...prev, newMsg]);
    setNewMessage("");
    setIsTyping(false);
  };

  const handleTyping = () => {
    setIsTyping(true);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (!channel) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <p>Channel not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        <div className="border-b px-6 py-3">
          <h1 className="text-xl font-bold">{channel.name}</h1>
          <p className="text-sm text-muted-foreground">{channel.description}</p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 min-h-[calc(100vh-12rem)]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.user.id === user?.id ? "justify-end" : ""
                }`}
              >
                {message.user.id !== user?.id && (
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(message.user.name)}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[80%] space-y-1 ${
                    message.user.id === user?.id ? "items-end" : ""
                  }`}
                >
                  {message.user.id !== user?.id && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {message.user.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {message.user.college}
                      </span>
                    </div>
                  )}

                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.user.id === user?.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {formatTime(message.timestamp)}
                  </span>
                </div>

                {message.user.id === user?.id && (
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {(typingUsers.length > 0 || isTyping) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
                </div>
                <span>
                  {typingUsers.length > 2
                    ? `${typingUsers.length}+ people are typing...`
                    : typingUsers.length > 0
                    ? `${typingUsers.join(", ")} ${
                        typingUsers.length === 1 ? "is" : "are"
                      } typing...`
                    : "You are typing..."}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder={`Message ${channel.name}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleTyping}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
