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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<{ name: string } | null>(null);

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
      <SidebarFooter>{user ? <NavUser user={user} /> : ""}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
