import { Suspense } from "react";
import { EditGarmentScreen } from "@/components/wardrobe/GarmentFormScreen";

export default function EditGarmentPage() {
  return (
    <Suspense fallback={null}>
      <EditGarmentScreen />
    </Suspense>
  );
}
