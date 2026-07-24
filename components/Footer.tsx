import { site as staticSite, type SiteContent } from "@/lib/content";

/** Footer — deep charcoal close on the cream page, candlelit warmth:
 *  Playfair wordmark, quiet cream links, lilac contact accent.
 *
 *  A Server Component (no interactivity), so it can't use the client
 *  useSiteContent() hook; the page passes resolved content as a prop instead,
 *  falling back to the built-in content.json. */
export default function Footer({ content }: { content?: SiteContent }) {
  const { footer } = (content ?? staticSite).text;
  return (
    <footer className="bg-dark py-16 text-light md:py-20">
      <div className="mx-auto grid max-w-[1408px] grid-cols-1 gap-12 px-4 md:grid-cols-2">
        {/* Brand */}
        <div>
          <p className="font-display text-2xl italic text-light">{footer.brand}</p>
          <p className="mt-2 text-sm text-light/50">{footer.location}</p>
          <p className="mt-1 text-sm text-light/50">
            {footer.hostedByPrefix}
            <a
              href={`mailto:${footer.email}`}
              className="text-brand underline underline-offset-2 transition-colors duration-200 hover:text-light"
            >
              {footer.email}
            </a>
          </p>
        </div>

        {/* Links */}
        <nav className="flex flex-col gap-2 md:items-end">
          <a
            href={footer.listingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-light/50 transition-colors duration-200 hover:text-light"
          >
            {footer.listingLabel}
          </a>
          <a
            href={footer.availabilityHref}
            className="text-sm text-light/50 transition-colors duration-200 hover:text-light"
          >
            {footer.availabilityLabel}
          </a>
          <a
            href={`mailto:${footer.email}`}
            className="text-sm text-light/50 transition-colors duration-200 hover:text-light"
          >
            {footer.contactLabel}
          </a>
        </nav>
      </div>

      <div className="mx-auto mt-8 max-w-[1408px] border-t border-light-faded px-4 pt-8 text-xs tracking-[0.04em] text-light/30">
        {footer.copyright}
      </div>
    </footer>
  );
}
