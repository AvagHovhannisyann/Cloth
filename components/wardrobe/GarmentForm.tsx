"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type {
  BrandConfidence,
  ColorFamily,
  Garment,
  GarmentCategory,
  MaterialConfidence,
  GarmentWeight,
  Season,
  StyleGroup,
} from "@/types/garment";
import { useGarmentViews } from "@/hooks/useWardrobe";
import { useAppStore } from "@/lib/store";
import { uid } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Field, Select, TextArea, TextInput } from "@/components/ui/Field";
import { GarmentVisual } from "./GarmentVisual";

const FAMILIES: ColorFamily[] = [
  "white", "cream", "beige", "stone", "camel", "taupe", "oatmeal",
  "brown", "grey", "black", "navy", "blue", "light-blue", "indigo",
];

const WEIGHTS: GarmentWeight[] = [
  "very-light", "light", "light-medium", "medium", "medium-heavy", "heavy",
];

const SEASONS: Season[] = ["spring", "summer", "autumn", "winter"];

const BLANK: Garment = {
  id: "",
  name: "",
  category: "top",
  subtype: "",
  brandConfidence: "unverified",
  colors: { primary: "", family: ["grey"], swatch: "#a49c92" },
  materialDescription: "",
  materialConfidence: "visual-estimate",
  texture: "",
  weight: "light-medium",
  warmth: 3,
  formality: 5,
  styleGroup: "classic-core",
  styleTags: [],
  weather: {},
  seasons: ["spring", "summer", "autumn"],
};

export function GarmentForm({ editId }: { editId?: string }) {
  const router = useRouter();
  const garments = useGarmentViews();
  const addGarment = useAppStore((s) => s.addGarment);
  const updateGarment = useAppStore((s) => s.updateGarment);
  const customGarments = useAppStore((s) => s.customGarments);

  const editing = useMemo(
    () => garments.find((g) => g.id === editId),
    [garments, editId],
  );
  const isSeedGarment =
    editId !== undefined && !customGarments.some((g) => g.id === editId);

  const [draft, setDraft] = useState<Garment>(() =>
    editing ? { ...editing } : { ...BLANK },
  );

  const patch = (p: Partial<Garment>) => setDraft((d) => ({ ...d, ...p }));

  const duplicateFrom = (id: string) => {
    const src = garments.find((g) => g.id === id);
    if (!src) return;
    setDraft({ ...src, id: "", name: `${src.name} (copy)` });
  };

  const save = () => {
    if (!draft.name.trim() || !draft.subtype.trim()) {
      toast("Name and subtype are required");
      return;
    }
    const garment: Garment = {
      ...draft,
      id: draft.id || uid("garment"),
      name: draft.name.trim(),
    };
    if (editing && draft.id) {
      updateGarment(garment);
      toast("Garment updated");
    } else {
      addGarment(garment);
      toast("Added to wardrobe");
    }
    router.push("/wardrobe");
  };

  return (
    <div className="space-y-6">
      {isSeedGarment ? (
        <p className="rounded-md border border-line bg-surface px-4 py-3 text-xs leading-relaxed text-ink-secondary">
          This is a catalogued seed garment — saving stores your edited copy
          alongside it.
        </p>
      ) : null}

      {!editId ? (
        <Field label="Start from existing" hint="Similar pieces exist — duplicate, then adjust.">
          {(id) => (
            <Select
              id={id}
              defaultValue=""
              onChange={(e) => e.target.value && duplicateFrom(e.target.value)}
            >
              <option value="">Blank garment</option>
              {garments
                .filter((g) => g.status !== "archived")
                .map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
            </Select>
          )}
        </Field>
      ) : null}

      <div className="flex items-start gap-5">
        <GarmentVisual garment={draft} className="aspect-[5/6] w-28 shrink-0" />
        <div className="flex-1 space-y-4">
          <Field label="Name">
            {(id) => (
              <TextInput
                id={id}
                value={draft.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="Navy Merino Crew Neck"
              />
            )}
          </Field>
          <Field label="Swatch colour" hint="Drives the placeholder until a photo is added.">
            {(id) => (
              <input
                id={id}
                type="color"
                value={draft.colors.swatch}
                onChange={(e) =>
                  patch({ colors: { ...draft.colors, swatch: e.target.value } })
                }
                className="h-11 w-full cursor-pointer rounded-md border border-line bg-surface px-1.5"
              />
            )}
          </Field>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Category">
          {(id) => (
            <Select
              id={id}
              value={draft.category}
              onChange={(e) => patch({ category: e.target.value as GarmentCategory })}
            >
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="shoe">Shoe</option>
              <option value="outerwear">Outerwear</option>
              <option value="accessory">Accessory</option>
            </Select>
          )}
        </Field>
        <Field label="Subtype">
          {(id) => (
            <TextInput
              id={id}
              value={draft.subtype}
              onChange={(e) => patch({ subtype: e.target.value })}
              placeholder="Short-sleeve polo"
            />
          )}
        </Field>
        <Field label="Brand">
          {(id) => (
            <TextInput
              id={id}
              value={draft.brand ?? ""}
              onChange={(e) => patch({ brand: e.target.value || undefined })}
              placeholder="Optional"
            />
          )}
        </Field>
        <Field label="Brand certainty">
          {(id) => (
            <Select
              id={id}
              value={draft.brandConfidence}
              onChange={(e) =>
                patch({ brandConfidence: e.target.value as BrandConfidence })
              }
            >
              <option value="confirmed">Confirmed</option>
              <option value="probable">Probable</option>
              <option value="unverified">Unverified</option>
            </Select>
          )}
        </Field>
      </div>

      <Field label="Colour description">
        {(id) => (
          <TextInput
            id={id}
            value={draft.colors.primary}
            onChange={(e) =>
              patch({ colors: { ...draft.colors, primary: e.target.value } })
            }
            placeholder="Deep chocolate brown"
          />
        )}
      </Field>

      <div className="space-y-2">
        <span className="label-caps block text-ink-secondary">Colour family</span>
        <div className="flex flex-wrap gap-2">
          {FAMILIES.map((f) => {
            const active = draft.colors.family.includes(f);
            return (
              <Chip
                key={f}
                active={active}
                onClick={() => {
                  const family = active
                    ? draft.colors.family.filter((x) => x !== f)
                    : [...draft.colors.family, f];
                  if (family.length > 0)
                    patch({ colors: { ...draft.colors, family } });
                }}
              >
                {f}
              </Chip>
            );
          })}
        </div>
        <p className="text-xs text-ink-faint">First selected family is dominant.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Material">
          {(id) => (
            <TextInput
              id={id}
              value={draft.materialDescription}
              onChange={(e) => patch({ materialDescription: e.target.value })}
              placeholder="Cotton piqué"
            />
          )}
        </Field>
        <Field label="Material certainty">
          {(id) => (
            <Select
              id={id}
              value={draft.materialConfidence}
              onChange={(e) =>
                patch({ materialConfidence: e.target.value as MaterialConfidence })
              }
            >
              <option value="confirmed">Confirmed</option>
              <option value="probable">Probable</option>
              <option value="visual-estimate">Visual estimate</option>
            </Select>
          )}
        </Field>
        <Field label="Texture">
          {(id) => (
            <TextInput
              id={id}
              value={draft.texture}
              onChange={(e) => patch({ texture: e.target.value })}
              placeholder="Fine piqué"
            />
          )}
        </Field>
        <Field label="Weight">
          {(id) => (
            <Select
              id={id}
              value={draft.weight}
              onChange={(e) => patch({ weight: e.target.value as GarmentWeight })}
            >
              {WEIGHTS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label={`Warmth · ${draft.warmth}/10`}>
          {(id) => (
            <input
              id={id}
              type="range"
              min={1}
              max={10}
              value={draft.warmth}
              onChange={(e) => patch({ warmth: Number(e.target.value) })}
              className="h-11 w-full accent-ink"
            />
          )}
        </Field>
        <Field label={`Formality · ${draft.formality}/10`}>
          {(id) => (
            <input
              id={id}
              type="range"
              min={1}
              max={10}
              value={draft.formality}
              onChange={(e) => patch({ formality: Number(e.target.value) })}
              className="h-11 w-full accent-ink"
            />
          )}
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Style branch">
          {(id) => (
            <Select
              id={id}
              value={draft.styleGroup}
              onChange={(e) => patch({ styleGroup: e.target.value as StyleGroup })}
            >
              <option value="classic-core">Classic / school core</option>
              <option value="clean-casual">Clean casual</option>
              <option value="sport">Sport / athleisure</option>
            </Select>
          )}
        </Field>
        <Field label="Style tags">
          {(id) => (
            <TextInput
              id={id}
              value={draft.styleTags.join(", ")}
              onChange={(e) =>
                patch({
                  styleTags: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
              placeholder="classic, school"
            />
          )}
        </Field>
        <Field label="Min temp °C">
          {(id) => (
            <TextInput
              id={id}
              type="number"
              inputMode="numeric"
              value={draft.weather.minTemp ?? ""}
              onChange={(e) =>
                patch({
                  weather: {
                    ...draft.weather,
                    minTemp: e.target.value === "" ? undefined : Number(e.target.value),
                  },
                })
              }
              placeholder="—"
            />
          )}
        </Field>
        <Field label="Max temp °C">
          {(id) => (
            <TextInput
              id={id}
              type="number"
              inputMode="numeric"
              value={draft.weather.maxTemp ?? ""}
              onChange={(e) =>
                patch({
                  weather: {
                    ...draft.weather,
                    maxTemp: e.target.value === "" ? undefined : Number(e.target.value),
                  },
                })
              }
              placeholder="—"
            />
          )}
        </Field>
      </div>

      <div className="space-y-2">
        <span className="label-caps block text-ink-secondary">Seasons</span>
        <div className="flex flex-wrap gap-2">
          {SEASONS.map((s) => {
            const active = draft.seasons.includes(s);
            return (
              <Chip
                key={s}
                active={active}
                onClick={() =>
                  patch({
                    seasons: active
                      ? draft.seasons.filter((x) => x !== s)
                      : [...draft.seasons, s],
                  })
                }
              >
                {s}
              </Chip>
            );
          })}
        </div>
      </div>

      <Field
        label="Photo path"
        hint="Optional. Add the file under /public/wardrobe/ and reference it here, e.g. /wardrobe/top-23.png."
      >
        {(id) => (
          <TextInput
            id={id}
            value={draft.image ?? ""}
            onChange={(e) => patch({ image: e.target.value || undefined })}
            placeholder="/wardrobe/…"
          />
        )}
      </Field>

      <Field label="Notes">
        {(id) => (
          <TextArea
            id={id}
            value={draft.notes ?? ""}
            onChange={(e) => patch({ notes: e.target.value || undefined })}
            placeholder="Anything worth remembering"
          />
        )}
      </Field>

      <div className="flex gap-2.5 pb-4">
        <Button className="flex-1" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" onClick={save}>
          Save garment
        </Button>
      </div>
    </div>
  );
}
