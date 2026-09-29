"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { EASE } from "@/lib/ease";
import { useReducedMotion } from "@/lib/useReducedMotion";
import BookingCard from "@/components/BookingCard";
import { useSiteContent } from "@/components/site-content";
import {
  validateRange,
  validateGuests,
  isValidEmail,
  validateMinStay,
  DEFAULT_MAX_GUESTS,
  type MinStayMap,
} from "@/lib/booking";
import { isBookingWidgetConfigured } from "@/lib/bookingWidget";
import BookingWidgetModal from "@/components/BookingWidgetModal";
import { buildMailto, prettyDate } from "@/lib/contact";

/** "contact" is the floor: no checkout, no working mail delivery, so the guest
 *  is handed the owner's address with their dates already written out. It is
 *  reachable when nothing is configured at all, which is precisely when the
 *  other two stages would dead-end. */
type Stage = "idle" | "form" | "sending" | "sent" | "contact";

type Props = {
  /** Whether /api/inquiry can actually deliver mail (Resend configured).
   *  Resolved on the server — lib/inquiry is server-only — and passed down, so
   *  the client never offers a form it already knows will fail. */
  inquiryConfigured: boolean;
};

/** Booking section — Figma node 81:4 ("04-book"): full-width lake image with
 *  "THE LAKE" header, then a two-column block — centered property summary
 *  (eyebrow, Playfair title, copy, policy note) left, live booking card
 *  right. */
/** Whole nights between two ISO dates; 0 when either is missing or invalid. */
function nightsFrom(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const a = Date.parse(checkIn);
  const b = Date.parse(checkOut);
  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return 0;
  return Math.round((b - a) / 86_400_000);
}

export default function BookSection({ inquiryConfigured }: Props) {
  const site = useSiteContent();
  const { booking } = site.text;
  const reduce = useReducedMotion();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("4");

  // Dates Hospitable reports as booked — the calendar grays these out. Empty
  // (open calendar) until availability loads, and stays empty if the API isn't
  // configured, so the UI works before any credentials exist.
  const [unavailable, setUnavailable] = useState<string[]>([]);
  // Minimum nights per check-in date, same source as `unavailable`. Empty when
  // unconfigured or on the iCal path, which means "no minimum known".
  const [minStay, setMinStay] = useState<MinStayMap>({});
  // Cheapest bookable night, for the card headline. Null = use the CMS rate.
  const [priceFromCents, setPriceFromCents] = useState<number | null>(null);
  // Sleeps-how-many, straight from Hospitable. The constant is only the value
  // used while that request is in flight or after it fails — not a setting.
  const [guestsMax, setGuestsMax] = useState<number>(DEFAULT_MAX_GUESTS);

  // Inquiry flow: card -> contact form -> sent.
  const [stage, setStage] = useState<Stage>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Hospitable checkout modal. Separate from `stage` because it is a parallel
  // path, not another step in the enquiry flow.
  const [widgetOpen, setWidgetOpen] = useState(false);

  // Pull booked dates once on mount. Fail open (leave the calendar fully
  // usable) on any error — availability is an enhancement, not a gate.
  useEffect(() => {
    let alive = true;
    fetch("/api/availability")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive || !data) return;
        if (Array.isArray(data.unavailable)) setUnavailable(data.unavailable);
        if (data.minStay && typeof data.minStay === "object") setMinStay(data.minStay);
        if (typeof data.priceFromCents === "number") setPriceFromCents(data.priceFromCents);
        if (typeof data.guestsMax === "number" && data.guestsMax > 0) setGuestsMax(data.guestsMax);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const ownerEmail = site.text.footer.email;
  const mailtoHref = buildMailto(ownerEmail, site.text.footer.brand, {
    checkIn,
    checkOut,
    guests,
    nights: nightsFrom(checkIn, checkOut),
  });

  const range = validateRange(checkIn, checkOut);
  const rangeValid = range.ok;
  const guestsValid = validateGuests(guests, guestsMax) !== null;
  // Belt and braces: the calendar already makes a short check-out unclickable,
  // but dates can also arrive from the chips, so re-check before either path.
  const minStayCheck = range.ok
    ? validateMinStay(checkIn, range.nights, minStay)
    : ({ ok: true } as const);

  // Reserve -> hand off to Hospitable when the widget is configured, otherwise
  // fall back to the email enquiry step. The same date/guest validation gates
  // both paths, so a guest never reaches either with an invalid range.
  const openInquiry = () => {
    setError(null);
    if (!rangeValid || !guestsValid) return;
    if (!minStayCheck.ok) {
      setError(minStayCheck.reason);
      return;
    }
    // Best available path, in order. Each one degrades to the next rather
    // than to a dead end: checkout takes the money outright; the form reaches
    // the owner's inbox; the contact panel hands over the address itself and
    // needs nothing configured to work.
    if (isBookingWidgetConfigured()) {
      setWidgetOpen(true);
      return;
    }
    setStage(inquiryConfigured ? "form" : "contact");
  };

  const submitInquiry = async () => {
    setError(null);
    if (!name.trim()) return setError("Please add your name.");
    if (!isValidEmail(email)) return setError("Please enter a valid email.");
    if (!rangeValid || !guestsValid) return setError("Please choose valid dates.");
    if (!minStayCheck.ok) return setError(minStayCheck.reason);

    setStage("sending");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          checkIn,
          checkOut,
          guests: Number(guests),
          message: message.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setStage("form");
        setError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStage("sent");
    } catch {
      setStage("form");
      setError("Something went wrong. Please try again.");
    }
  };

  const fade = {
    initial: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
  };

  return (
    <section id="booking" className="scroll-mt-22 bg-cream pb-46 pt-9 md:pb-[var(--sp-book-y,11.5rem)] md:pt-[var(--sp-book-y,2.25rem)]">
      {/* Lake image — 640px tall, gradient rises into the section cream. */}
      <div className="relative h-[420px] w-full overflow-hidden md:h-[640px]">
        <Image
          src="/figma/IMG_4299.jpeg"
          alt="View across Keuka Lake from the deck"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(0deg, rgba(245,239,228,1) 0%, rgba(245,239,228,0) 42%)",
          }}
        />
        {/* Top scrim so the white header reads over the sky. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/35 to-transparent" />
        <div className="absolute inset-x-0 top-0 flex h-20 items-center px-6 md:px-20">
          <p className="text-xl leading-[1.25] text-light">{booking.lakeLabel}</p>
        </div>
      </div>

      {/* Main content — summary left, booking card right. */}
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-14 px-6 py-20 md:px-10 lg:grid-cols-[1fr_440px] lg:gap-16 lg:px-16 xl:grid-cols-[1fr_480px] xl:gap-20 xl:px-20">
        {/* LEFT — centered property summary. */}
        <div className="flex flex-col items-center gap-12 self-center px-0 lg:px-6">
          <motion.div
            {...fade}
            transition={{ duration: 0.7, ease: EASE }}
            className="flex flex-col items-center gap-4 text-center"
          >
            <h2 className="font-display text-[2rem] italic leading-[1.1] text-dark md:text-[3rem]">
              {booking.heading}
            </h2>
            <p className="max-w-[600px] text-xl leading-[1.25] text-dark/80">
              {booking.body}
            </p>
          </motion.div>

          {/* Direct Booking Policy note — white/10 fill, lilac border. */}
          <motion.div
            {...fade}
            transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
            className="flex w-full max-w-[600px] flex-col gap-3 border border-brand bg-brand/15 p-6 text-base leading-[1.25]"
          >
            <p className="font-medium text-brand-deep">{booking.policyTitle}</p>
            <p className="text-dark/80">{booking.policyBody}</p>
          </motion.div>
        </div>

        {/* RIGHT — live booking card, contact step, or confirmation.
            #reserve: the "Availability" / "Book Direct" nav targets land here on
            the calendar, past the lake photo. scroll-mt clears the fixed nav. */}
        <motion.div
          id="reserve"
          className="scroll-mt-24"
          {...fade}
          transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
        >
          {stage === "sent" ? (
            <div className="flex flex-col gap-3 border border-dark/10 bg-linen p-10 text-center shadow-[0_20px_45px_rgba(44,40,37,0.1)]">
              <p className="font-display text-3xl italic text-dark">
                {booking.sentTitle}
              </p>
              <p className="text-base text-dark/60">{booking.sentBody}</p>
            </div>
          ) : stage === "idle" ? (
            <BookingCard
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
              unavailable={unavailable}
              minStay={minStay}
              priceFromCents={priceFromCents}
              guestsMax={guestsMax}
              onDatesChange={(ci, co) => {
                setCheckIn(ci);
                setCheckOut(co);
              }}
              onGuestsChange={setGuests}
              onReserve={openInquiry}
            />
          ) : stage === "contact" ? (
            /* The floor. Nothing here depends on a key, a domain or a server:
               a mailto link with the dates already filled in cannot be
               misconfigured, so this stage always works. */
            <div className="flex flex-col gap-5 border border-dark/10 bg-linen p-8 shadow-[0_20px_45px_rgba(44,40,37,0.1)]">
              <div className="flex flex-col gap-1">
                <p className="font-display text-2xl italic text-dark">Request these dates</p>
                <p className="text-sm text-dark/60">
                  {prettyDate(checkIn)} &rarr; {prettyDate(checkOut)} &middot; {guests}{" "}
                  {Number(guests) === 1 ? "guest" : "guests"}
                </p>
              </div>
              <p className="text-base text-dark/70">
                Email us and we&apos;ll hold these dates and confirm the exact price,
                usually the same day.
              </p>
              <a
                href={mailtoHref}
                className="flex h-12 items-center justify-center rounded-full bg-brand text-sm font-semibold uppercase tracking-[0.04em] text-dark transition-colors duration-300 ease-luxe hover:bg-brand-deep hover:text-light active:scale-[0.98]"
              >
                Email your request
              </a>
              {/* Spelled out as well as linked: a browser with no mail client
                  configured does nothing at all when the link is clicked, and
                  then a visible address is the only thing that still works. */}
              <p className="text-center text-sm text-dark/60">
                or write to{" "}
                <a href={`mailto:${ownerEmail}`} className="underline underline-offset-2">
                  {ownerEmail}
                </a>
              </p>
              <button
                type="button"
                onClick={() => setStage("idle")}
                className="flex h-12 items-center justify-center rounded-full border border-dark/20 text-sm font-semibold uppercase tracking-[0.04em] text-dark transition-colors hover:bg-dark/[0.05]"
              >
                Back
              </button>
            </div>
          ) : (
            // Contact step — collect who to reply to, then send the inquiry.
            <div className="flex flex-col gap-5 border border-dark/10 bg-linen p-8 shadow-[0_20px_45px_rgba(44,40,37,0.1)]">
              <div className="flex flex-col gap-1">
                <p className="font-display text-2xl italic text-dark">Request these dates</p>
                <p className="text-sm text-dark/60">
                  {prettyDate(checkIn)} &rarr; {prettyDate(checkOut)} &middot; {guests}{" "}
                  {Number(guests) === 1 ? "guest" : "guests"}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-dark/60">
                    Name
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    maxLength={120}
                    className="border border-dark-faded bg-white p-3 text-base text-dark outline-none focus:ring-2 focus:ring-brand/60"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-dark/60">
                    Email
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    maxLength={254}
                    className="border border-dark-faded bg-white p-3 text-base text-dark outline-none focus:ring-2 focus:ring-brand/60"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-dark/60">
                    Message <span className="normal-case text-dark/40">(optional)</span>
                  </span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    className="resize-none border border-dark-faded bg-white p-3 text-base text-dark outline-none focus:ring-2 focus:ring-brand/60"
                  />
                </label>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={reduce ? false : { opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-red-700"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Always present, not only after a failure. Delivery can break
                  upstream at any moment — an expired key, a Resend outage — and
                  the guest should never have to hit an error to discover there
                  is another way to reach us. */}
              {ownerEmail && (
                <p className="text-sm text-dark/55">
                  Prefer email?{" "}
                  <a href={mailtoHref} className="underline underline-offset-2 hover:text-dark">
                    Write to us directly
                  </a>{" "}
                  with these dates.
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStage("idle");
                    setError(null);
                  }}
                  disabled={stage === "sending"}
                  className="flex h-12 flex-1 items-center justify-center rounded-full border border-dark/20 text-sm font-semibold uppercase tracking-[0.04em] text-dark transition-colors hover:bg-dark/[0.05] disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={submitInquiry}
                  disabled={stage === "sending"}
                  className="flex h-12 flex-[2] items-center justify-center rounded-full bg-brand text-sm font-semibold uppercase tracking-[0.04em] text-dark transition-colors duration-300 ease-luxe hover:bg-brand-deep hover:text-light active:scale-[0.98] disabled:opacity-60"
                >
                  {stage === "sending" ? "Sending…" : "Send request"}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Hospitable checkout. Portals to <body>, so its position in this tree
          is irrelevant — it lives here to keep the booking state it reads in
          one place. Renders nothing unless configured AND open. */}
      <BookingWidgetModal
        open={widgetOpen}
        onClose={() => setWidgetOpen(false)}
        onEmailInstead={() => {
          setWidgetOpen(false);
          // Same three-tier rule as RESERVE. This used to jump straight to the
          // form, which meant a stalled checkout with no mail delivery landed
          // the guest on a form that 502s — the exact dead end the fallback
          // exists to prevent, reachable only when checkout was ALREADY
          // failing.
          setStage(inquiryConfigured ? "form" : "contact");
        }}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
      />
    </section>
  );
}
