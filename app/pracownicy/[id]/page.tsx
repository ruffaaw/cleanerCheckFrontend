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
                <BreadcrumbLink href="/dashboard/workers">
                  Pracownicy
                </BreadcrumbLink>
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
              worker?.history?.map((h: any, i: number) => (
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
        </div>
      </SidebarInset>
    </SidebarProviderWithPersistence>
  );
}
