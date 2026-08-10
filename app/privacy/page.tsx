import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy | Lilac Landing",
  description:
    "What Lilac Landing collects when you enquire about a stay, how it is used, and who it is shared with.",
};

// Static: nothing here depends on request or CMS data beyond the contact email.
export const dynamic = "force-static";

const EMAIL = site.text.footer.email;

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="7 August 2026"
      intro="This policy describes what happens to information you give us through this website. It is deliberately short, because this website collects very little."
    >
      <h2>The short version</h2>
      <p>
        We collect information in one place only: the booking enquiry form. There are no
        cookies, no analytics, no advertising trackers, and no third party scripts running
        on this site. We do not build a profile of you, and we do not sell or rent your
        information to anyone.
      </p>

      <h2>What we collect</h2>
      <p>When you submit a booking enquiry, you give us:</p>
      <ul>
        <li>Your name</li>
        <li>Your email address</li>
        <li>Your requested check in and check out dates</li>
        <li>The number of guests</li>
        <li>Any message you choose to write</li>
      </ul>
      <p>
        That is the complete list. There are no hidden fields, and nothing else about your
        visit is recorded by us.
      </p>

      <h2>Why we collect it</h2>
      <p>
        Solely to reply to your enquiry and arrange your stay. We do not add you to a
        mailing list, and we will not send you marketing.
      </p>

      <h2>Cookies and tracking</h2>
      <p>
        This website sets <strong>no cookies</strong> and runs <strong>no analytics</strong>.
        You will not see a cookie banner here because there is nothing to consent to.
      </p>

      <h2>Who else is involved</h2>
      <p>
        Running a website means a few service providers necessarily handle data on our
        behalf. We use as few as possible:
      </p>
      <ul>
        <li>
          <strong>Netlify</strong> hosts the site. Like any web host, its servers record
          standard request logs, which can include IP addresses.
        </li>
        <li>
          <strong>Resend</strong> delivers your enquiry to us by email.
        </li>
        <li>
          <strong>Sanity</strong> stores the site&apos;s text and photographs and serves
          the images. It does not receive anything you submit.
        </li>
      </ul>
      <p>
        Each processes data only to provide its service. None of them is given your
        information for their own marketing.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Your enquiry arrives as an email and stays in the owner&apos;s mailbox alongside
        ordinary correspondence. If you would like yours deleted, ask and we will remove
        it.
      </p>

      <h2>Your choices</h2>
      <p>
        You can ask us what we hold about you, ask for it to be corrected, or ask for it
        to be deleted. Email <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and we will respond.
        Depending on where you live, you may have additional rights under laws such as the
        GDPR or the CCPA. We will honour those requests regardless of where you are.
      </p>

      <h2>Payments</h2>
      <p>
        No payment is taken on this website, and no card details are ever entered here. If
        a booking goes ahead, payment is arranged separately and handled by the relevant
        booking or payment provider under their own terms.
      </p>

      <h2>Children</h2>
      <p>
        This site is intended for adults arranging travel. We do not knowingly collect
        information from children.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes, the date at the top of this page changes with it.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy can go to{" "}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
