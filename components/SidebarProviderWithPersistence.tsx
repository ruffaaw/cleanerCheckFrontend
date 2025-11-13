"use client";

import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { useEffect } from "react";

function SidebarPersistence() {
  const { open, setOpen } = useSidebar();

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_state");
    if (saved !== null && (saved === "true") !== open) {
      setOpen(saved === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar_state", open ? "true" : "false");
  }, [open]);

  return null;
}

export function SidebarProviderWithPersistence({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      {children}
      <SidebarPersistence />
    </SidebarProvider>
  );
}
