import { notFound } from "next/navigation";
import { DebugScreen } from "@/components/debug/DebugScreen";

/** Development-only recommendation inspector; 404s in production builds. */
export default function DebugPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <DebugScreen />;
}
