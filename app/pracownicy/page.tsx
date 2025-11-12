"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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

export default function WorkersPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedWorkers = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    async function fetchWorkers() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/workers`,
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await res.json();
        setWorkers(data.data);
        setFiltered(data.data);
      } catch (e) {
        setWorkers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkers();
  }, []);

  // Filter with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const q = search.toLowerCase();
      setFiltered(workers.filter((w) => w.name.toLowerCase().includes(q)));
    }, 200);

    return () => clearTimeout(timer);
  }, [search, workers]);

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
          </div>

          <div className="border rounded-lg bg-white p-4 shadow-sm">
            <div className="grid grid-cols-4 font-medium text-sm pb-2 border-b">
              <span>Nazwa</span>
              <span>Status</span>
              <span>Pomieszczenie</span>
              <span>Akcja</span>
            </div>

            {loading &&
              [...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-4 py-3 border-b items-center"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}

            {!loading &&
              paginatedWorkers.map((worker) => (
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
                      <span className="text-gray-400 italic">Brak</span>
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

            {!loading && filtered.length === 0 && (
              <div className="text-center py-6 text-gray-500">Brak wyników</div>
            )}
          </div>
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
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
