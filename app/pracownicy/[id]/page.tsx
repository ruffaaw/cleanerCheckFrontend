"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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

function formatDuration(minutes: number | null) {
  if (minutes === null) return "W trakcie";
  if (!minutes) return "0 min";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return `${h}h ${m}m`;
}

export default function WorkerDetailsPage() {
  const { id } = useParams();
  const [worker, setWorker] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/workers/${id}`,
          {
            credentials: "include",
          }
        );

        const data = await res.json();
        setWorker(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const filteredHistory = worker?.history?.filter((h: any) => {
    const roomMatch = h.room.toLowerCase().includes(search.toLowerCase());

    const start = new Date(h.startTime);
    const afterStart = !startDate || start >= new Date(startDate);
    const beforeEnd = !endDate || start <= new Date(endDate);

    return roomMatch && afterStart && beforeEnd;
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
        {/* HEADER */}
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/pracownicy">Pracownicy</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage>Szczegóły</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="p-6 space-y-6">
          {/* Worker Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {loading ? <Skeleton className="h-6 w-48" /> : worker?.workerName}
            </h2>

            <Link href="/pracownicy">
              <Button variant="outline">Powrót</Button>
            </Link>
          </div>

          {/* Info card */}
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
                  {worker?.isCleaning ? (
                    <Badge className="bg-green-600">Sprząta</Badge>
                  ) : (
                    <Badge variant="secondary">Wolny</Badge>
                  )}
                </p>
                <p>
                  <span className="font-medium">Aktualny pokój: </span>
                  {worker?.currentRoom ?? (
                    <span className="text-gray-400 italic">Brak</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* History table */}
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-lg mb-3">Historia sprzątania</h3>

            {/* FILTRY */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Input
                placeholder="Szukaj po pokoju..."
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

            <div className="grid grid-cols-4 font-medium text-sm border-b pb-2">
              <span>Pomieszczenie</span>
              <span>Start</span>
              <span>Koniec</span>
              <span>Czas trwania</span>
            </div>

            {loading &&
              [...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-4 py-3 border-b">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}

            {!loading && (!worker?.history || worker.history.length === 0) && (
              <div className="text-center py-6 text-gray-500">
                Brak historii
              </div>
            )}

            {!loading &&
              currentData?.map((h: any, i: number) => (
                <div key={i} className="grid grid-cols-4 py-3 border-b text-sm">
                  <span className="font-medium">{h.room}</span>
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
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
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
      </SidebarInset>
    </SidebarProviderWithPersistence>
  );
}
