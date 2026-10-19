import type { Metadata } from "next";
import { WelcomeFlow } from "./WelcomeFlow";

export const metadata: Metadata = { title: "Welcome · Dayplan" };

export default function WelcomePage() {
  return <WelcomeFlow />;
}
