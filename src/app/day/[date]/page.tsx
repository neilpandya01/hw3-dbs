import { Suspense } from "react";
import { ListSkeleton } from "@/components/Page";
import { DayView } from "./DayView";

// The date only exists in the URL at request time, so the view sits behind Suspense.
export default function DayPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <DayView />
    </Suspense>
  );
}
