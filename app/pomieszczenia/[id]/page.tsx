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

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // ---- FILTRY ----
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ---- SORTOWANIE ----
  const [sortBy, setSortBy] = useState("startTime");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  // ---- PAGINACJA ----
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("itemsPerPagePomieszczeniaDetails");
      return saved ? Number(saved) : 10;
    }
    return 10;
  });

  function toggleSort(column: string) {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "itemsPerPagePomieszczeniaDetails",
        String(itemsPerPage)
      );
    }
  }, [itemsPerPage]);

  // ---- FETCH ----
  async function fetchData() {
    setLoading(true);

    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(itemsPerPage),
      search,
      sortBy,
      sortOrder,
    });

    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/dashboard/rooms/${id}?${params.toString()}`,
        {
          credentials: "include",
        }
      );

      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Za każdym razem gdy zmienia się filtr lub sortowanie → pobierz dane
  useEffect(() => {
    fetchData();
  }, [
    id,
    currentPage,
    itemsPerPage,
    search,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  ]);

  // Reset strony po zmianie filtrów
  useEffect(() => {
    setCurrentPage(1);
  }, [search, startDate, endDate, sortBy, sortOrder]);

  const history = data?.history || [];
  const pagination = data?.pagination || {};

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

        <div className="p-3 sm:p-6 space-y-6">
          {/* GÓRA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">
              {loading ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                data?.roomName || "Pomieszczenie"
              )}
            </h2>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchData()}
                disabled={loading}
              >
                Odśwież
              </Button>
              <Link href="/pomieszczenia">
                <Button variant="outline" size="sm">
                  Powrót
                </Button>
              </Link>
            </div>
          </div>

          {/* INFORMACJE */}
          <div className="bg-white border rounded-lg p-3 sm:p-4 shadow-sm">
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
                  {data?.isActive ? (
                    <Badge variant="default" className="bg-red-600">
                      {data.status}
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-600">
                      {data.status}
                    </Badge>
                  )}
                </p>

                <p>
                  <span className="font-medium">Pracuje od: </span>
                  {data?.cleaningSince ?? (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </p>

                <p>
                  <span className="font-medium">Ostatnia aktywność: </span>
                  {data?.lastCleaning ?? (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* HISTORIA */}
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-lg mb-3">Historia aktywności</h3>

            {/* FILTRY */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 mb-4">
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
            <div className="hidden sm:grid grid-cols-4 font-medium text-sm border-b pb-2 select-none">
              <span
                onClick={() => toggleSort("worker")}
                className="cursor-pointer"
              >
                Pracownik{" "}
                {sortBy === "worker" && (sortOrder === "ASC" ? "↑" : "↓")}
              </span>
              <span
                onClick={() => toggleSort("startTime")}
                className="cursor-pointer"
              >
                Start{" "}
                {sortBy === "startTime" && (sortOrder === "ASC" ? "↑" : "↓")}
              </span>
              <span
                onClick={() => toggleSort("endTime")}
                className="cursor-pointer"
              >
                Koniec{" "}
                {sortBy === "endTime" && (sortOrder === "ASC" ? "↑" : "↓")}
              </span>
              <span
                onClick={() => toggleSort("duration")}
                className="cursor-pointer"
              >
                Czas trwania{" "}
                {sortBy === "duration" && (sortOrder === "ASC" ? "↑" : "↓")}
              </span>
            </div>

            {/* LOADING */}
            {loading && (
              <div className="relative">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 sm:grid-cols-4 py-3 border-b gap-1 sm:gap-0 opacity-50"
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

            {!loading &&
              history.map((h: any, i: number) => (
                <div
                  key={i}
                  className="grid grid-cols-1 sm:grid-cols-4 py-3 border-b text-sm gap-1 sm:gap-0"
                >
                  <span>
                    <span className="sm:hidden font-medium">Pracownik: </span>
                    <span className="font-medium sm:font-normal">
                      {h.worker}
                    </span>
                  </span>

                  <span>
                    <span className="sm:hidden font-medium">Start: </span>
                    {new Date(h.startTime).toLocaleString()}
                  </span>

                  <span>
                    <span className="sm:hidden font-medium">Koniec: </span>
                    {h.endTime
                      ? new Date(h.endTime).toLocaleString()
                      : "W trakcie"}
                  </span>

                  <span>
                    <span className="sm:hidden font-medium">Czas: </span>
                    {formatDuration(h.duration)}
                  </span>
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

              {pagination?.totalPages > 1 && (
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
                    Strona {pagination.page} z {pagination.totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(pagination.totalPages, p + 1)
                      )
                    }
                    disabled={currentPage === pagination.totalPages}
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
