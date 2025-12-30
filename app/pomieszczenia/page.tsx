"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarProviderWithPersistence } from "@/components/SidebarProviderWithPersistence";
import { Spinner } from "@/components/ui/spinner";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filtry
  const [search, setSearch] = useState("");

  // sortowanie
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

  // paginacja
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("itemsPerPagePomieszczenia");
      return saved ? Number(saved) : 10;
    }
    return 10;
  });

  // zmiana search
  function handleSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  // zmiana itemsPerPage
  function handleItemsPerPage(value: number) {
    setItemsPerPage(value);
    setCurrentPage(1);
  }

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("itemsPerPagePomieszczenia", String(itemsPerPage));
    }
  }, [itemsPerPage]);

  // toggle sort
  function toggleSort(column: string) {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
  }

  async function fetchRooms() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("page", String(currentPage));
      params.append("limit", String(itemsPerPage));

      if (search.length >= 3) params.append("search", search.toLowerCase());

      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/dashboard/rooms?${params.toString()}`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await res.json();

      setRooms(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
      setError("Nie udało się pobrać listy pomieszczeń");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (search.length === 0 || search.length >= 3) {
      fetchRooms();
    }
  }, [currentPage, itemsPerPage, search, sortBy, sortOrder]);

  const totalPages = pagination?.totalPages;

  return (
    <SidebarProviderWithPersistence>
      <AppSidebar />
      <SidebarInset>
        {/* HEADER */}
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 mx-2" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Pomieszczenia</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="p-6">
          {/* TOP BAR */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-4 gap-3">
            <Input
              placeholder="Szukaj pomieszczenia..."
              className="w-full sm:w-60"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={fetchRooms}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Odśwież
            </Button>
          </div>

          {/* TABELA */}
          <div className="border rounded-lg bg-white p-4 shadow-sm">
            <div className="hidden md:grid grid-cols-6 font-medium text-sm pb-2 border-b select-none">
              <span
                onClick={() => toggleSort("name")}
                className="cursor-pointer min-w-24"
              >
                Nazwa {sortBy === "name" && (sortOrder === "ASC" ? "↑" : "↓")}
              </span>

              <span className="min-w-16">Status </span>
              <span className="min-w-20">Pracownik </span>
              <span className="min-w-24">Pracuje od</span>

              <span
                onClick={() => toggleSort("lastCleaning")}
                className="cursor-pointer min-w-24"
              >
                Ostatnia aktywność{" "}
                {sortBy === "lastCleaning" && (sortOrder === "ASC" ? "↑" : "↓")}
              </span>

              <span className="min-w-16">Akcja</span>
            </div>

            {/* LOADING */}
            {loading && (
              <div className="relative">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-6 py-3 border-b items-center opacity-50"
                  >
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                ))}

                <div className="absolute inset-0 flex items-center justify-center">
                  <Spinner className="size-8 text-gray-500" />
                </div>
              </div>
            )}

            {/* DANE */}
            {!loading &&
              rooms?.map((room) => (
                <div
                  key={room.id}
                  className="grid md:grid-cols-6 grid-cols-1 py-3 border-b text-sm gap-2 md:gap-0"
                >
                  {/* NAZWA */}
                  <div className="flex md:block justify-between">
                    <span className="md:hidden text-gray-500">Nazwa:</span>
                    <span className="font-medium">{room.name}</span>
                  </div>

                  {/* STATUS */}
                  <div className="flex md:block justify-between">
                    <span className="md:hidden text-gray-500">Status:</span>
                    {room.isActive ? (
                      <Badge className="bg-red-600">{room.status}</Badge>
                    ) : (
                      <Badge variant="secondary">{room.status}</Badge>
                    )}
                  </div>

                  {/* PRACOWNIK */}
                  <div className="flex md:block justify-between">
                    <span className="md:hidden text-gray-500">Pracownik:</span>
                    {room.worker || (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </div>

                  {/* SPRZĄTANE OD */}
                  <div className="flex md:block justify-between">
                    <span className="md:hidden text-gray-500">
                      Sprzątane od:
                    </span>
                    {room.cleaningSince || (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </div>

                  {/* OSTATNIE SPRZĄTANIE */}
                  <div className="flex md:block justify-between">
                    <span className="md:hidden text-gray-500">
                      Ostatnie sprzątanie:
                    </span>
                    {room.lastCleaningText || (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </div>

                  {/* AKCJA */}
                  <div className="flex md:block justify-between">
                    <span className="md:hidden text-gray-500">Akcja:</span>
                    <Link href={`/pomieszczenia/${room.id}`}>
                      <Button
                        size="sm"
                        className="cursor-pointer w-full md:w-auto"
                      >
                        Szczegóły
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}

            {error && (
              <div className="text-center text-red-600 py-4">{error}</div>
            )}

            {!loading && rooms?.length === 0 && (
              <div className="text-center py-6 text-gray-500">Brak wyników</div>
            )}
          </div>

          {/* PAGINACJA */}
          {!loading && (
            <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 whitespace-nowrap">
                  Na stronę:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPage(Number(e.target.value))}
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
                <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-full sm:w-auto"
                  >
                    Poprzednia
                  </Button>

                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    Strona {pagination.page} z {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="w-full sm:w-auto"
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
