// "use client";
// import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cookies } from "next/headers";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default async function DashboardPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  const workers = [
    {
      id: "aa60b95c-71a5-4651-9950-ccaa5cdd6754",
      name: "test",
      isCleaning: false,
      currentRoom: null,
    },
  ];

  const loading = workers.length === 0;

  // const [workers, setWorkers] = useState<any[]>([]);

  // const [filtered, setFiltered] = useState<any[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [search, setSearch] = useState("");

  // useEffect(() => {
  //   async function fetchWorkers() {
  //     try {
  //       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workers`, {
  //         credentials: "include",
  //         cache: "no-store",
  //       });

  //       const data = await res.json();
  //       setWorkers(data.data);
  //       setFiltered(data.data);
  //     } catch (e) {
  //       setWorkers([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   fetchWorkers();
  // }, []);

  // Filter with debounce
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     const q = search.toLowerCase();
  //     setFiltered(workers.filter((w) => w.name.toLowerCase().includes(q)));
  //   }, 200);

  //   return () => clearTimeout(timer);
  // }, [search, workers]);

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Pracownicy</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            {/* <h2 className="text-xl font-semibold">Pracownicy</h2> */}
            <Input
              placeholder="Szukaj pracownika..."
              className="w-60"
              // value={search}
              // onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Table */}
          <div className="border rounded-lg bg-white p-4 shadow-sm">
            {/* TABLE HEADER */}
            <div className="grid grid-cols-4 font-medium text-sm pb-2 border-b">
              <span>Nazwa</span>
              <span>Status sprzątania</span>
              <span>Pomieszczenie</span>
              <span>Akcja</span>
            </div>

            {/* LOADING SKELETON */}
            {loading &&
              [...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-4 py-3 border-b last:border-0 items-center"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}

            {/* DATA ROWS */}
            {!loading &&
              workers.map((worker) => (
                <div
                  key={worker.id}
                  className="grid grid-cols-4 py-3 border-b last:border-0 items-center text-sm"
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
                    {worker.currentRoom ? (
                      <span>{worker.currentRoom}</span>
                    ) : (
                      <span className="text-gray-400 italic">Brak</span>
                    )}
                  </span>

                  <Link
                    href={`/dashboard/workers/${worker.id}`}
                    className="w-fit"
                  >
                    <Button size="sm" className="cursor-pointer w-fit">
                      Szczegóły
                    </Button>
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
