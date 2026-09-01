"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import { useGarmentViews } from "@/hooks/useWardrobe";

/**
 * First-run welcome (§55): one quiet card, no wizard. Requests location by
 * simply triggering the weather refresh the user asked for.
 */
export function WelcomeCard({ onUseLocation }: { onUseLocation: () => void }) {
  const updateSettings = useAppStore((s) => s.updateSettings);
  const target = useAppStore((s) => s.settings.wardrobeTargetCount);
  const garments = useGarmentViews();
  const catalogued = garments.filter((g) => g.status !== "archived").length;

  const dismiss = () => updateSettings({ introSeen: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md rounded-lg border border-line bg-surface p-6"
    >
      <p className="font-serif text-xl italic">Welcome to Atelier</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
        Your wardrobe is catalogued — {catalogued} of {target} pieces. Each
        morning, one tap picks an outfit from it: weather, occasion and
        rotation considered. Default context is School; change it any time.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
        Weather works best with your location.
      </p>
      <div className="mt-5 flex gap-2.5">
        <Button
          variant="primary"
          className="flex-1"
          onClick={() => {
            dismiss();
            onUseLocation();
          }}
        >
          Use my location
        </Button>
        <Button className="flex-1" onClick={dismiss}>
          Not now
        </Button>
      </div>
    </motion.div>
  );
}
