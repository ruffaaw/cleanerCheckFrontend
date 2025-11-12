"use client";

import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { useEffect } from "react";

function SidebarPersistence() {
  const { open } = useSidebar();

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
  const defaultOpen =
    typeof window !== "undefined" &&
    localStorage.getItem("sidebar_state") === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      {children}
      <SidebarPersistence />
    </SidebarProvider>
  );
}
