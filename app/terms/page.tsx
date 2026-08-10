import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms of Use | Lilac Landing",
  description:
    "The terms that apply to using the Lilac Landing website and submitting a booking enquiry.",
};

export const dynamic = "force-static";

const EMAIL = site.text.footer.email;
const GUESTS_MAX = site.text.booking.guestsMax;

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      updated="7 August 2026"
      intro="These terms cover your use of this website. They are not your rental agreement: the terms of an actual stay are confirmed with you directly before any booking is final."
    >
      <h2>An enquiry is not a booking</h2>
      <p>
        This is the most important thing on this page. Submitting the form on this site
        sends us a <strong>request</strong>. It does not reserve the property, does not
        create a contract, and does not guarantee the dates. Your stay is confirmed only
        once we reply and confirm it to you in writing.
      </p>
      <p>
        Nothing on this website is an offer capable of acceptance. We may decline an
        enquiry.
      </p>

      <h2>Rates, fees and availability</h2>
      <p>
        Rates, fees and the calendar shown here are indicative and can change without
        notice. The calendar is refreshed from our booking channels, so it can be briefly
        out of date and a date shown as free may already be taken. The figures that apply
        to you are the ones in the written confirmation we send, not the ones displayed
        here.
      </p>

      <h2>House rules and occupancy</h2>
      <p>
        The property sleeps up to {GUESTS_MAX} guests. Occupancy limits, check in and
        check out times, the cancellation policy, the security deposit if any, and the
        rest of the house rules form part of your rental agreement and are provided to
        you before your booking is confirmed. Please read them: they govern your stay,
        and these website terms do not replace them.
      </p>

      <h2>Using this website</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the site for anything unlawful, or to send false or misleading enquiries</li>
        <li>
          Attempt to gain unauthorised access to the site, its systems, or anyone
          else&apos;s information
        </li>
        <li>
          Scrape, copy or reuse the photography or written content for any commercial
          purpose
        </li>
        <li>Interfere with the site&apos;s normal operation</li>
      </ul>

      <h2>Content and photography</h2>
      <p>
        The photographs, text and design on this site are owned by the property owner or
        used with permission, and are protected by copyright. You may share links to the
        site freely. You may not reproduce the photography or copy elsewhere without
        written permission.
      </p>
      <p>
        We try hard to describe the property accurately and the photographs are of the
        actual house. Even so, descriptions and images are illustrative, and small
        differences between what you see here and the property on the day are possible.
      </p>

      <h2>Links to other sites</h2>
      <p>
        Where we link to third party sites such as our listing pages, those sites have
        their own terms and privacy practices. We are not responsible for their content
        and a link is not an endorsement.
      </p>

      <h2>Availability of the site</h2>
      <p>
        We aim to keep the site available and accurate, but we do not guarantee that it
        will be uninterrupted, error free, or current at any given moment. We may change
        or withdraw any part of it at any time.
      </p>

      <h2>Liability</h2>
      <p>
        To the fullest extent the law allows, we are not liable for indirect or
        consequential loss arising from your use of this website, or from reliance on
        information shown here that later proves to be out of date. Nothing in these terms
        limits liability that cannot lawfully be limited, including liability for death or
        personal injury caused by negligence, or for fraud.
      </p>

      <h2>Governing law</h2>
      <p>
        The property is in Penn Yan, New York, and these terms are governed by the laws of
        the State of New York.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms. The date at the top of this page shows when they last
        changed, and the version published here is the one that applies.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms can go to{" "}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
