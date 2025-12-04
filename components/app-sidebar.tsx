"use client";

import { Toilet, User } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import React, { useEffect, useState } from "react";
import { NotificationsController } from "./NotificationsController";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUser = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/whoami`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!res.ok) throw new Error("Not authenticated");

      const data = await res.json();
      const newUser = { name: data.data.name };
      setUser(newUser);

      localStorage.setItem("userData", JSON.stringify(newUser));
    } catch (err) {
      console.error("Nie udało się pobrać użytkownika:", err);
      setUser(null);
      localStorage.removeItem("userData");
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/user/unread/count`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await res.json();
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error(
        "Nie udało się pobrać liczby nieprzeczytanych powiadomień:",
        err
      );
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("userData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      } catch {
        localStorage.removeItem("userData");
      }
    } else {
      fetchUser();
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const data = {
    panel: [
      { title: "Pracownicy", url: "/pracownicy", icon: User },
      { title: "Pomieszczenia", url: "/pomieszczenia", icon: Toilet },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.panel} />
      </SidebarContent>
      <SidebarFooter>
        <NotificationsController
          unreadCount={unreadCount}
          setUnreadCount={setUnreadCount}
        />
        {user ? <NavUser user={user} /> : null}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
