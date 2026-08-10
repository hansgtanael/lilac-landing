import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Accessibility | Lilac Landing",
  description:
    "How the Lilac Landing website is built for accessibility, what is known to fall short, and how to tell us about a problem.",
};

export const dynamic = "force-static";

const EMAIL = site.text.footer.email;

export default function AccessibilityPage() {
  return (
    <LegalPage
      title="Accessibility"
      updated="7 August 2026"
      intro="We want this site to be usable by as many people as possible. This page sets out what we have actually done, what we know still falls short, and how to tell us when something does not work."
    >
      <h2>What we have done</h2>
      <p>
        These are specific measures present in the site today, not aspirations:
      </p>
      <ul>
        <li>
          <strong>Every photograph carries alternative text</strong> describing what it
          shows, so screen reader users get the same sense of the house.
        </li>
        <li>
          <strong>Every button has an accessible name</strong>, including the calendar
          day cells and the gallery controls, which are labelled with their dates and
          actions rather than left unlabelled.
        </li>
        <li>
          <strong>Motion respects your system setting.</strong> If you have &ldquo;reduce
          motion&rdquo; enabled, the scrolling effects, parallax and auto playing
          carousels collapse to still states rather than animating.
        </li>
        <li>
          <strong>Keyboard navigation works throughout</strong>, and focused elements show
          a visible focus ring. The room panels respond to keyboard focus as well as to a
          mouse.
        </li>
        <li>
          <strong>Headings run in order</strong> with a single page title, so the document
          outline is navigable by heading.
        </li>
        <li>
          <strong>Text colours were chosen against the cream background</strong> for
          contrast, and the language of the page is declared so screen readers pronounce
          it correctly.
        </li>
      </ul>

      <h2>Where it currently falls short</h2>
      <p>
        We would rather name these than claim a clean bill of health:
      </p>
      <ul>
        <li>
          <strong>There is no skip to content link.</strong> Keyboard users must tab
          through the navigation on every page to reach the main content. This is a known
          gap and is worth fixing.
        </li>
        <li>
          <strong>The site is motion heavy by design.</strong> The reduced motion setting
          removes it, but if you have not enabled that setting and find the movement
          uncomfortable, turning it on at the operating system level will quiet the whole
          site.
        </li>
        <li>
          <strong>Some captions sit over photographs.</strong> Where that happens we add a
          shadow behind the text, but contrast will vary with the image underneath.
        </li>
      </ul>

      <h2>Standards</h2>
      <p>
        We build with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA as the
        target. To be straightforward with you: this site has <strong>not</strong> been
        through a formal accessibility audit or independent testing, so we do not claim
        conformance. The measures above are real and were verified, but verified is not
        the same as certified.
      </p>

      <h2>Assistive technology</h2>
      <p>
        The site is standard HTML and should work with current screen readers and browser
        zoom. If you use a particular tool and something behaves oddly, telling us which
        one helps enormously, because it lets us reproduce the problem rather than guess.
      </p>

      <h2>The property itself</h2>
      <p>
        This page is about the website. For questions about physical accessibility at the
        house, such as steps, doorway widths, bathroom layout or parking, please email us
        and we will describe the property honestly so you can decide whether it suits you.
        The house is on a lakeside slope and reaching the dock involves outdoor stairs.
      </p>

      <h2>Tell us about a problem</h2>
      <p>
        If any part of this site is difficult or impossible to use, we want to know. Email{" "}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a> with the page and what happened, and we
        will do our best to fix it. If something blocks you from enquiring about a stay,
        say so in the same email and we will arrange your booking directly instead.
      </p>
    </LegalPage>
  );
}
