import { redirect } from "next/navigation";

/** Temporary redirect — the trip guide lives at `/`. */
export default function LandingRedirect() {
  redirect("/");
}
