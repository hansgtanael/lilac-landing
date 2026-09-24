import Script from "next/script";
import { analyticsId, isAnalyticsConfigured, GA_LINKER_DOMAINS } from "@/lib/analytics";

/** The GA4 tag, or nothing at all.
 *
 *  Dormant until NEXT_PUBLIC_GA_ID is set (see lib/analytics.ts). Rendering
 *  null rather than an inert tag keeps the unmeasured site free of any
 *  third-party request, which is also what makes the tighter CSP in
 *  next.config.ts honest.
 *
 *  `afterInteractive` deliberately: this site's first paint is a video hero and
 *  a pinned scroll sequence, and analytics has no business competing with that
 *  for main-thread time. Measurement that degrades the thing being measured is
 *  a bad trade.
 */
export default function Analytics() {
  if (!isAnalyticsConfigured()) return null;

  const id = analyticsId();

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}', {
            linker: { domains: ${JSON.stringify(GA_LINKER_DOMAINS)}, decorate_forms: true }
          });
        `}
      </Script>
    </>
  );
}
