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

export default function WorkersPage() {
  const [workers, setWorkers] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtry
  const [search, setSearch] = useState("");

  // Paginacja
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("itemsPerPagePracownicy");
      return saved ? Number(saved) : 10;
    }
    return 10;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("itemsPerPagePracownicy", String(itemsPerPage));
    }
  }, [itemsPerPage]);

  // Sortowanie
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

  const totalPages = Math.ceil(workers?.pagination?.totalPages || 0);

  function toggleSort(column: string) {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
    setCurrentPage(1);
  }

  // Pobieranie z API
  async function fetchWorkers() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
        sortBy,
        sortOrder,
      });

      if (search.length >= 3) {
        params.append("search", search.toLowerCase());
      }

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/dashboard/workers?${params.toString()}`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await res.json();

      setWorkers(data);
      setError(null);
    } catch (e) {
      setWorkers([]);
      setError("Nie udało się pobrać listy pracowników.");
    } finally {
      setLoading(false);
    }
  }

  // Fetch przy zmianie paginacji, sortowania, filtrowania
  useEffect(() => {
    fetchWorkers();
  }, [currentPage, itemsPerPage, sortBy, sortOrder]);

  // Debounce wyszukiwarki – po 3 znakach
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.length === 0 || search.length >= 3) {
        setCurrentPage(1);
        fetchWorkers();
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <SidebarProviderWithPersistence>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 mx-2" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Pracownicy</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Input
              placeholder="Szukaj pracownika..."
              className="w-60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchWorkers}
                disabled={loading}
              >
                Odśwież
              </Button>
            </div>
          </div>

          <div className="border rounded-lg bg-white p-4 shadow-sm">
            {/* Nagłówki z sortowaniem */}
            <div className="grid grid-cols-4 font-medium text-sm pb-2 border-b select-none">
              <span
                className="cursor-pointer"
                onClick={() => toggleSort("name")}
              >
                Nazwa {sortBy === "name" && (sortOrder === "ASC" ? "↑" : "↓")}
              </span>

              <span>Status</span>
              <span>Pomieszczenie</span>
              <span>Akcja</span>
            </div>

            {/* Ładowanie */}
            {loading && (
              <div className="relative">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-4 py-3 border-b items-center opacity-50"
                  >
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}

                <div className="absolute inset-0 flex items-center justify-center">
                  <Spinner className="size-8 text-gray-500" />
                </div>
              </div>
            )}

            {/* Dane */}
            {!loading &&
              workers.data?.map((worker: any) => (
                <div
                  key={worker.id}
                  className="grid grid-cols-4 py-3 border-b items-center text-sm"
                >
                  <span className="font-medium">{worker.name}</span>

                  <span>
                    {worker.isCleaning ? (
                      <Badge variant="default" className="bg-red-600">
                        Sprząta
                      </Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-600">
                        Wolny
                      </Badge>
                    )}
                  </span>

                  <span>
                    {worker.currentRoom || (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </span>

                  <Link
                    href={`/pracownicy/${worker.id}`}
                    className="cursor-pointer w-fit"
                  >
                    <Button size="sm" className="cursor-pointer">
                      Szczegóły
                    </Button>
                  </Link>
                </div>
              ))}

            {/* Błąd */}
            {error && (
              <div className="text-center text-red-600 py-4">{error}</div>
            )}

            {/* Brak wyników */}
            {!loading && workers?.length === 0 && (
              <div className="text-center py-6 text-gray-500">Brak wyników</div>
            )}
          </div>

          {/* PAGINACJA */}
          {!loading && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
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
                  {[1, 5, 10, 25, 50].map((n) => (
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
                    Strona {currentPage}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => p + 1)}
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
