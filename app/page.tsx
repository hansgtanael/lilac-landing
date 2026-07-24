import Loader from "@/components/Loader";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Experience from "@/components/Experience";
import AboutScroll from "@/components/AboutScroll";
import { WaveHills, WaveLip } from "@/components/WaveEdge";
import GalleryNoir from "@/components/GalleryNoir";
import Amenities from "@/components/Amenities";
import PropertyStrip from "@/components/PropertyStrip";
import BookSection from "@/components/BookSection";
import Footer from "@/components/Footer";
import SpacingTuner from "@/components/SpacingTuner";
import { SiteContentProvider } from "@/components/site-content";
import { getSiteContent } from "@/lib/site-content";

// Pre-Arc composition restored (2026-07-04): the navy Figma-based section
// order, with the client's real photos and all scroll effects kept.
//
// Content is resolved once here (Sanity when configured + seeded, else the
// built-in content.json) and handed to the whole tree: client sections read it
// through <SiteContentProvider> / useSiteContent(); the server-rendered Footer
// takes it as a prop. ISR re-reads at most once a minute.
export const revalidate = 60;

export default async function Home() {
  const site = await getSiteContent();
  return (
    <SiteContentProvider value={site}>
      {/* Soft film grain over everything — brand brief's linen texture. */}
      <div aria-hidden className="grain-overlay" />
      <Loader />
      <Nav />
      {/* Slow Lake editorial flow (Figma 244:2). The hero is PINNED (sticky):
          everything in the overlay wrapper scrolls over it, led by the
          Welcome section's wave lip. The wrapper carries the page cream so
          transparent sections never reveal the hero underneath. */}
      <main>
        <Hero />
        {/* Top margin = wave-lip height, so the crest sits exactly at the
            fold on load (nothing peeks into the hero until you scroll). */}
        <div className="relative z-10 mt-[68px] bg-cream md:mt-[120px]">
          {/* Crest that rides over the pinned hero as the cream layer scrolls
              up. Zero-height relative holder so <WaveLip/> (absolute,
              bottom-full) sits exactly at the cream layer's top edge — its
              68px/120px crest fills the mt above, matching the old
              WelcomeIntro placement. */}
          <div className="relative">
            <WaveLip />
          </div>
          <GalleryNoir />
          <AboutScroll />
          {/* WaveHills rides UP over the rooms photo's bottom 140/240px overhang
              — the photo extends exactly that far past the viewport, so it shows
              through the hill SVGs' transparent tops. */}
          {/* pointer-events-none: the pulled-up band must not swallow hovers
              meant for the rooms block it overlaps. */}
          <div className="pointer-events-none relative -mt-[140px] md:-mt-[240px]">
            <WaveHills />
          </div>
          <Amenities />
          <PropertyStrip />
          <Experience />
          <BookSection />
        </div>
      </main>
      <Footer content={site} />
      {/* Dev-only global spacing panel (production → null). */}
      <SpacingTuner />
    </SiteContentProvider>
  );
}
