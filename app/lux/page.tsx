import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LuxHero from "@/components/lux/LuxHero";
import Arrival from "@/components/lux/Arrival";
import ScrollFilm from "@/components/lux/ScrollFilm";
import RoomsFilm from "@/components/lux/RoomsFilm";
import ConciergeStay from "@/components/lux/ConciergeStay";
import { getLuxContent } from "@/lib/sanity";

// ISR: when Sanity is configured, re-read the singleton at most once a minute.
// With Sanity unset getLuxContent() returns null and every section renders its
// built-in fallback copy — the page looks exactly as it did before the CMS.
export const revalidate = 60;

// Luxury motion prototype (2026-07-12) — non-destructive alternate at /lux.
// Direction viz for the client: cinematic video hero, scroll-scrubbed film
// (slot for generated slow-dolly clips), full-bleed photography story, and a
// concierge booking moment. Loader intentionally omitted; same brand tokens.
// Content is sourced from Sanity (singleton "luxPage") when configured, else
// from each section's typed fallback.
export default async function LuxHome() {
  const content = await getLuxContent();
  return (
    <>
      <div aria-hidden className="grain-overlay" />
      <Nav />
      <main>
        <LuxHero content={content?.hero ?? null} />
        <Arrival content={content?.arrival ?? null} />
        <ScrollFilm content={content?.film ?? null} />
        <RoomsFilm content={content?.rooms ?? null} />
        <ConciergeStay content={content?.concierge ?? null} />
      </main>
      <Footer />
    </>
  );
}
