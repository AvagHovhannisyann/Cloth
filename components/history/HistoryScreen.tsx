"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useHydration } from "@/hooks/useHydration";
import { useGarmentMap } from "@/hooks/useWardrobe";
import { useAppStore } from "@/lib/store";
import { daysBetween, formatDayLabel, todayISO } from "@/domain/history/dates";
import { OCCASIONS } from "@/data/presets";
import { uid } from "@/lib/utils";
import type { WearRecord } from "@/types/history";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Field";
import { OutfitTriptych } from "@/components/outfit/OutfitTriptych";

interface Section {
  title: string;
  records: WearRecord[];
}

export function HistoryScreen() {
  const hydrated = useHydration();
  const garments = useGarmentMap();
  const history = useAppStore((s) => s.history);
  const removeWear = useAppStore((s) => s.removeWear);
  const recordWear = useAppStore((s) => s.recordWear);

  const [amending, setAmending] = useState<WearRecord | null>(null);
  const [amendTop, setAmendTop] = useState("");
  const [amendBottom, setAmendBottom] = useState("");
  const [amendShoe, setAmendShoe] = useState("");

  const today = todayISO();

  const sections = useMemo<Section[]>(() => {
    const sorted = [...history].sort((a, b) => b.dateISO.localeCompare(a.dateISO));
    const buckets: Section[] = [
      { title: "Today", records: [] },
      { title: "Yesterday", records: [] },
      { title: "Past week", records: [] },
      { title: "Past month", records: [] },
      { title: "Earlier", records: [] },
    ];
    for (const rec of sorted) {
      const d = daysBetween(rec.dateISO, today);
      const bucket =
        d <= 0 ? 0 : d === 1 ? 1 : d <= 7 ? 2 : d <= 31 ? 3 : 4;
      buckets[bucket]!.records.push(rec);
    }
    return buckets.filter((b) => b.records.length > 0);
  }, [history, today]);

  const startAmend = (rec: WearRecord) => {
    setAmending(rec);
    setAmendTop(rec.topId);
    setAmendBottom(rec.bottomId);
    setAmendShoe(rec.shoeId);
  };

  const confirmAmend = () => {
    if (!amending) return;
    removeWear(amending.id);
    recordWear({
      id: uid("wear"),
      dateISO: amending.dateISO,
      topId: amendTop,
      bottomId: amendBottom,
      shoeId: amendShoe,
      occasion: amending.occasion,
      source: "manual",
      recordedAt: new Date().toISOString(),
    });
    setAmending(null);
    toast("History updated");
  };

  if (!hydrated) {
    return (
      <div className="px-6 pb-tabbar pt-safe">
        <div className="space-y-4 pt-10">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  const garmentOptions = Array.from(garments.values()).filter(
    (g) => g.status !== "archived",
  );

  return (
    <div className="px-6 pb-tabbar pt-safe">
      <header className="pt-8 sm:pt-10">
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
      </header>

      {sections.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No outfits recorded yet"
            detail="When you tap “Wear this” on the home screen, the day lands here."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="label-caps text-ink-secondary">{section.title}</h2>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {section.records.map((rec) => {
                  const top = garments.get(rec.topId);
                  const bottom = garments.get(rec.bottomId);
                  const shoe = garments.get(rec.shoeId);
                  return (
                    <li key={rec.id} className="flex items-center gap-4 py-3.5">
                      <OutfitTriptych top={top} bottom={bottom} shoe={shoe} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium tracking-tight">
                          {top?.name ?? "—"}
                        </p>
                        <p className="truncate text-xs text-ink-secondary">
                          {bottom?.name ?? "—"}
                          {shoe ? ` · ${shoe.name}` : ""}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-faint">
                          {formatDayLabel(rec.dateISO, today)} ·{" "}
                          {OCCASIONS[rec.occasion].label}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => startAmend(rec)}>
                        Edit
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Sheet
        open={amending !== null}
        onOpenChange={(open) => {
          if (!open) setAmending(null);
        }}
        title="Actually wore something else"
      >
        <div className="space-y-4">
          <Field label="Top">
            {(id) => (
              <Select id={id} value={amendTop} onChange={(e) => setAmendTop(e.target.value)}>
                {garmentOptions
                  .filter((g) => g.category === "top")
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
              </Select>
            )}
          </Field>
          <Field label="Bottom">
            {(id) => (
              <Select
                id={id}
                value={amendBottom}
                onChange={(e) => setAmendBottom(e.target.value)}
              >
                {garmentOptions
                  .filter((g) => g.category === "bottom")
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
              </Select>
            )}
          </Field>
          <Field label="Shoes">
            {(id) => (
              <Select id={id} value={amendShoe} onChange={(e) => setAmendShoe(e.target.value)}>
                {garmentOptions
                  .filter((g) => g.category === "shoe")
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
              </Select>
            )}
          </Field>
          <div className="flex gap-2.5 pt-1">
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => {
                if (amending) removeWear(amending.id);
                setAmending(null);
                toast("Record removed");
              }}
            >
              Remove day
            </Button>
            <Button variant="primary" className="flex-1" onClick={confirmAmend}>
              Save
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
