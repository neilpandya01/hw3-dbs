import type { Metadata } from "next";
import { UpcomingView } from "./UpcomingView";

export const metadata: Metadata = { title: "Upcoming · Dayplan" };

export default function UpcomingPage() {
  return <UpcomingView />;
}
