"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check } from "lucide-react";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Spinner } from "./ui/spinner";

export function NotificationsController({
  unreadCount,
  setUnreadCount,
}: {
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { state } = useSidebar();
  const isOpen = state === "expanded";

  const [open, setOpen] = useState(false);
  const [read, setRead] = useState<any[]>([]);
  const [unread, setUnread] = useState<any[]>([]);
  const [view, setView] = useState("unread");
  const [loading, setLoading] = useState(false);

  async function loadAllNotifications() {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/user`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      setUnread(data.data.filter((n: any) => !n.isRead));
      setRead(data.data.filter((n: any) => n.isRead));
    } catch (error) {
      console.error("Błąd podczas pobierania powiadomień:", error);
    } finally {
      setLoading(false);
    }
  }

  async function markNotificationAsRead(id: string | number) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}`, {
        method: "PUT",
        credentials: "include",
      });
      setUnread((prev) => prev.filter((n) => n.id !== id));
      setRead((prev) => [...prev, unread.find((n) => n.id === id)]);
      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      console.error(
        "Błąd podczas oznaczania powiadomienia jako przeczytane:",
        error
      );
    }
  }

  async function markAllNotificationsAsRead() {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
        method: "PUT",
        credentials: "include",
      });
      setRead((prev) => [...prev, ...unread]);
      setUnread([]);
      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Błąd podczas oznaczania wszystkich powiadomień jako przeczytane:",
        error
      );
    }
  }

  useEffect(() => {
    if (open) loadAllNotifications();
  }, [open]);

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip="Powiadomienia"
          onClick={() => setOpen(true)}
          className="relative overflow-visible cursor-pointer"
        >
          <Bell className="w-5 h-5" />

          {!isOpen && unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full translate-x-1 -translate-y-1">
              {unreadCount}
            </span>
          )}

          {isOpen && (
            <span className="flex items-center gap-2">
              Powiadomienia
              {unreadCount > 0 && (
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </span>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[380px] sm:w-[420px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Powiadomienia</SheetTitle>

            {unread.length > 0 && view === "unread" && (
              <Button
                className="bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                size="sm"
                onClick={markAllNotificationsAsRead}
              >
                Oznacz wszystkie jako przeczytane
              </Button>
            )}
          </SheetHeader>

          <div className="flex border-b mt-2">
            <button
              onClick={() => setView("unread")}
              className={`flex-1 p-3 text-center ${
                view === "unread"
                  ? "font-semibold border-b-2 border-gray-600"
                  : "text-gray-500"
              }`}
            >
              Nieprzeczytane
            </button>

            <button
              onClick={() => setView("read")}
              className={`flex-1 p-3 text-center ${
                view === "read"
                  ? "font-semibold border-b-2 border-gray-600"
                  : "text-gray-500"
              }`}
            >
              Przeczytane
            </button>
          </div>

          <div className="flex flex-col overflow-auto h-full">
            {view === "unread" && (
              <>
                {unread.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Brak nieprzeczytanych powiadomień.
                  </div>
                ) : (
                  <div className="divide-y">
                    <AnimatePresence>
                      {unread.map((n) => (
                        <motion.div
                          key={n.id}
                          layout
                          initial={{ opacity: 1, x: 0 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 40 }}
                          className="group relative p-4 flex gap-3 items-start border-b last:border-none hover:bg-accent/50 transition"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{n.title}</div>
                            <div className="text-sm text-gray-500 whitespace-pre-line">
                              {n.message}
                            </div>
                            <div className="text-xs text-gray-400">
                              {n.date}
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markNotificationAsRead(n.id);
                            }}
                            className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition p-1 hover:bg-green-100 rounded cursor-pointer"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </>
            )}

            {view === "read" && (
              <div className="divide-y">
                <AnimatePresence>
                  {read.map((n) => (
                    <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 1, x: 0 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      className="group relative p-4 flex gap-3 items-start border-b last:border-none hover:bg-accent/50 transition"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{n.title}</div>
                        <div className="text-sm text-gray-500">{n.message}</div>
                        <div className="text-xs text-gray-400">{n.date}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {loading && (
              <div className="p-4 text-center flex items-center justify-center text-gray-500 w-full">
                <Spinner className="size-8" />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
