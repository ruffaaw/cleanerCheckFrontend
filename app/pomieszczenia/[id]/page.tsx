"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarProviderWithPersistence } from "@/components/SidebarProviderWithPersistence";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

function formatDuration(minutes: number | null) {
  if (minutes === null) return "W trakcie";
  if (!minutes) return "0 min";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return `${h}h ${m}m`;
}

export default function RoomDetailsPage() {
  const { id } = useParams();
  const [room, setRoom] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("itemsPerPagePomieszczeniaDetails");
      return saved ? Number(saved) : 10;
    }
    return 10;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "itemsPerPagePomieszczeniaDetails",
        String(itemsPerPage)
      );
    }
  }, [itemsPerPage]);

  async function fetchData() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/rooms/${id}`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();
      setRoom(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [id]);

  const filteredHistory = room?.history?.filter((h: any) => {
    const workerMatch = h.worker.toLowerCase().includes(search.toLowerCase());

    const start = new Date(h.startTime);
    const afterStart = !startDate || start >= new Date(startDate);
    const beforeEnd = !endDate || start <= new Date(endDate);

    return workerMatch && afterStart && beforeEnd;
  });

  const totalPages = Math.ceil((filteredHistory?.length || 0) / itemsPerPage);

  const currentData = filteredHistory?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, startDate, endDate]);

  return (
    <SidebarProviderWithPersistence>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/pomieszczenia">
                  Pomieszczenia
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage>Szczegóły</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="p-6 space-y-6">
          {/* GÓRNY NAGŁÓWEK */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {loading ? <Skeleton className="h-6 w-48" /> : room?.roomName}
            </h2>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLoading(true);
                  fetchData();
                }}
                disabled={loading}
              >
                Odśwież
              </Button>

              <Link href="/pomieszczenia">
                <Button variant="outline" size="sm" className="cursor-pointer">
                  Powrót
                </Button>
              </Link>
            </div>
          </div>

          {/* PODSTAWOWE INFORMACJE */}
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-48" />
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Status: </span>
                  {room?.currentStatus === "W trakcie" ? (
                    <Badge variant="default" className="bg-red-600">
                      {room.currentStatus}
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-600">
                      {room.currentStatus}
                    </Badge>
                  )}
                </p>
                <p>
                  <span className="font-medium">Sprzątane od: </span>
                  {room?.cleaningSince ?? (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </p>
                <p>
                  <span className="font-medium">Ostatnie sprzątanie: </span>
                  {room?.lastCleaning ?? (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* HISTORIA SPRZĄTAŃ */}
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-lg mb-3">Historia sprzątań</h3>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Input
                placeholder="Szukaj po pracowniku..."
                className="w-60"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Od:</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Do:</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
            </div>

            {/* TABELA */}
            <div className="grid grid-cols-4 font-medium text-sm border-b pb-2">
              <span>Pracownik</span>
              <span>Start</span>
              <span>Koniec</span>
              <span>Czas trwania</span>
            </div>

            {loading && (
              <div className="relative">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-4 py-3 border-b items-center opacity-50"
                  >
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}

                <div className="absolute inset-0 flex items-center justify-center">
                  <Spinner className="size-8 text-gray-500" />
                </div>
              </div>
            )}

            {!loading && (!room?.history || room.history.length === 0) && (
              <div className="text-center py-6 text-gray-500">
                Brak historii
              </div>
            )}

            {!loading &&
              currentData?.map((h: any, i: number) => (
                <div key={i} className="grid grid-cols-4 py-3 border-b text-sm">
                  <span className="font-medium">{h.worker}</span>
                  <span>{new Date(h.startTime).toLocaleString()}</span>
                  <span>
                    {h.endTime
                      ? new Date(h.endTime).toLocaleString()
                      : "W trakcie"}
                  </span>
                  <span>{formatDuration(h.duration)}</span>
                </div>
              ))}
          </div>

          {/* PAGINACJA */}
          {!loading && (
            <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Na stronę:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border rounded-md px-2 py-1 text-sm"
                >
                  {[5, 10, 25, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Poprzednia
                  </Button>

                  <span className="text-sm text-gray-600">
                    Strona {currentPage} z {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Następna
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProviderWithPersistence>
  );
}
