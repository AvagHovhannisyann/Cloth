"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useHydration } from "@/hooks/useHydration";
import { Skeleton } from "@/components/ui/Skeleton";
import { GarmentForm } from "./GarmentForm";

export function GarmentFormScreen({
  title,
  editId,
}: {
  title: string;
  editId?: string;
}) {
  const hydrated = useHydration();

  return (
    <div className="px-6 pb-tabbar pt-safe">
      <header className="flex items-center gap-3 pt-8 sm:pt-10">
        <Link
          href="/wardrobe"
          aria-label="Back to wardrobe"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong text-ink-secondary transition-colors hover:text-ink"
        >
          <ArrowLeft size={17} aria-hidden />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </header>
      <div className="mx-auto mt-6 max-w-xl">
        {hydrated ? (
          <GarmentForm editId={editId} key={editId ?? "new"} />
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        )}
      </div>
    </div>
  );
}

export function EditGarmentScreen() {
  const params = useSearchParams();
  const id = params.get("id") ?? undefined;
  return <GarmentFormScreen title="Edit garment" editId={id} />;
}
