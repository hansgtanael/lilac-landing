import Link from "next/link";
import Footer from "@/components/Footer";

/** Shared shell for the standalone policy pages (/terms, /privacy,
 *  /accessibility).
 *
 *  Deliberately NOT the home page's chrome: no Nav (it needs the site-content
 *  provider), no Loader, no scroll choreography. A policy page should render
 *  instantly and read like a document. It keeps the brand surface (cream,
 *  Lora display, DM Sans body) and the real Footer so navigation still works.
 *
 *  Server Component: no interactivity anywhere on these pages. */
export default function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  /** ISO date shown as "Last updated". Policy pages are dated by convention,
   *  and a stale date is worse than none, so it is a required prop. */
  updated: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="min-h-screen bg-cream">
        <div className="mx-auto max-w-[68ch] px-5 pb-24 pt-16 md:px-8 md:pb-32 md:pt-24">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-dark/55 underline-offset-4 transition-colors duration-200 hover:text-dark hover:underline"
          >
            <span aria-hidden>&larr;</span> Lilac Landing
          </Link>

          <h1 className="mt-8 font-display text-[clamp(2rem,5vw,3rem)] font-light italic leading-tight text-dark">
            {title}
          </h1>
          <p className="mt-3 text-sm text-dark/50">Last updated {updated}</p>

          {intro && (
            <p className="mt-8 text-[1.05rem] leading-relaxed text-dark/75">{intro}</p>
          )}

          {/* Typography for the policy body. Scoped here so the pages
              themselves stay as plain semantic HTML. */}
          <div
            className="
              mt-10 text-[1.05rem] leading-relaxed text-dark/75
              [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-[1.5rem] [&_h2]:font-light [&_h2]:italic [&_h2]:text-dark
              [&_h3]:mt-8 [&_h3]:text-[1.05rem] [&_h3]:font-semibold [&_h3]:text-dark
              [&_p]:mt-4
              [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5
              [&_li]:pl-1
              [&_a]:text-brand-deep [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-dark
              [&_strong]:font-semibold [&_strong]:text-dark
            "
          >
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
