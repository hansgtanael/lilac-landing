"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Star } from "@phosphor-icons/react";
import { EASE } from "@/lib/ease";
import { useReducedMotion } from "@/lib/useReducedMotion";
import RangeCalendar from "@/components/RangeCalendar";
import { useSiteContent } from "@/components/site-content";
import type { MinStayMap } from "@/lib/booking";
import { isBookingWidgetConfigured } from "@/lib/bookingWidget";

/** Money, always. Whole dollars print bare ($3,423) but anything with cents
 *  prints both digits ($445.20, never "$445.2").
 *
 *  This only began to matter when pricing moved wholly to Hospitable: the old
 *  static figures were whole dollars, so the missing digit never showed. Live
 *  taxes are not, and "$4,155.2" on a total reads as a typo on exactly the
 *  number a guest scrutinises hardest. */
const fmt = (n: number) => {
  const cents = Math.round(n * 100) % 100;
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: cents === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

// Light input chip — warm white surface, charcoal text, on the linen card.
const CHIP = "border border-dark-faded bg-white p-4";
const CHIP_LABEL =
  "whitespace-nowrap text-xs font-medium uppercase tracking-[0.35em] text-dark/60";

type Props = {
  checkIn: string;
  checkOut: string;
  guests: string;
  /** Booked dates (ISO) from Hospitable — grayed out in the calendar. */
  unavailable?: string[];
  /** ISO date -> minimum nights to start a stay that day. */
  minStay?: MinStayMap;
  /** Cheapest available night in the loaded window, in cents. Drives the
   *  "from $X" headline; null falls back to the static CMS rate. */
  priceFromCents?: number | null;
  /** Max guests, from Hospitable via /api/availability. */
  guestsMax: number;
  onDatesChange: (checkIn: string, checkOut: string) => void;
  onGuestsChange: (guests: string) => void;
  onReserve: () => void;
};

// Live quote from /api/quote. `configured` false means Hospitable isn't wired
// up, so the card keeps its static nightly math.
type Quote = {
  configured: boolean;
  available: boolean | null;
  subtotalCents: number | null;
  cleaningFeeCents: number | null;
  taxCents: number | null;
  totalCents: number | null;
  totalExact: boolean;
  degraded: boolean;
};

/** Booking card — Figma node 81:47: flat blue-deep card, check-in/check-out
 *  date chips (the calendar unfolds beneath them), guests chip, full-width
 *  lilac RESERVE pill, live fee breakdown. */
export default function BookingCard({
  checkIn,
  checkOut,
  guests,
  unavailable,
  minStay,
  priceFromCents = null,
  guestsMax,
  onDatesChange,
  onGuestsChange,
  onReserve,
}: Props) {
  const site = useSiteContent();
  const { booking } = site.text;

  /** "2026-06-12" -> "June 12, 2026" (parsed as local date, not UTC). */
  const fmtDate = (iso: string): string => {
    if (!iso) return booking.addDateLabel;
    const [y, m, d] = iso.split("-").map(Number);
    return `${MONTHS[m - 1]} ${d}, ${y}`;
  };
  const reduce = useReducedMotion();
  // Calendar is shown by default so the booking section always presents a
  // month picker; the date chips above just toggle it collapsed if wanted.
  const [calOpen, setCalOpen] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);
  const nights = nightsBetween(checkIn, checkOut);

  // Fetch a live quote when a valid range + guest count exists. Debounced so
  // dragging across the calendar doesn't spam the endpoint. When Hospitable
  // isn't configured the response says so and we ignore its pricing.
  useEffect(() => {
    if (nights <= 0) {
      setQuote(null);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      const qs = new URLSearchParams({ checkIn, checkOut, guests });
      fetch(`/api/quote?${qs}`, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!data) return;
          setQuote({
            configured: Boolean(data.configured),
            available: data.available ?? null,
            subtotalCents: typeof data.subtotalCents === "number" ? data.subtotalCents : null,
            cleaningFeeCents:
              typeof data.cleaningFeeCents === "number" ? data.cleaningFeeCents : null,
            taxCents: typeof data.taxCents === "number" ? data.taxCents : null,
            totalCents: typeof data.totalCents === "number" ? data.totalCents : null,
            totalExact: data.totalExact !== false,
            degraded: data.degraded === true,
          });
        })
        .catch(() => {});
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [checkIn, checkOut, guests, nights]);

  // Live figures win when Hospitable priced every night; otherwise fall back to
  // the static CMS math. Cleaning and tax come from the property's own fee and
  // tax config, not from content.json — the static $200 cleaning fee was $87
  // under the real one, and taxes were missing entirely, which understated a
  // real 3-night stay by about 18%.
  const liveStay =
    quote?.configured && quote.subtotalCents !== null ? quote.subtotalCents / 100 : null;
  const liveCleaning =
    quote?.configured && quote.cleaningFeeCents !== null ? quote.cleaningFeeCents / 100 : null;
  const liveTax = quote?.configured && quote.taxCents !== null ? quote.taxCents / 100 : null;
  const liveTotal = quote?.configured && quote.totalCents !== null ? quote.totalCents / 100 : null;

  // Live or nothing. There is no second set of numbers to fall back on any
  // more, and that is the point: the card can no longer quote a figure that
  // Hospitable would not charge.
  const stay = liveStay;
  const cleaning = liveCleaning;
  const total = liveTotal;

  /* -------- What this card is allowed to promise --------------------------
   *
   * Hospitable is now the only source of a price, so the rule is simple:
   * a number appears here when it came from Hospitable, and otherwise no
   * number appears at all.
   *
   * The failure this prevents is not "no data" — an empty card is obviously
   * empty. It is a confident WRONG total: the API drops out (plan downgrade,
   * expired token, upstream outage) while checkout stays up, the card quotes
   * from some second source, and the widget charges something different
   * seconds later. Nothing about the page would look broken. The guest would
   * simply be lied to, then corrected at the moment they reach for a card.
   *
   * Deleting the second source is what makes that unreachable rather than
   * merely unlikely.
   * --------------------------------------------------------------------- */
  const priceIsLive = liveTotal !== null;
  const totalApprox = priceIsLive && quote?.totalExact === false;
  // Read once: it is a build-time constant, not reactive state.
  const hasCheckout = isBookingWidgetConfigured();
  /** Dates are chosen but no live price exists. Say where the price comes from
   *  instead of printing one, whether or not checkout is wired up. */
  const deferPricing = !priceIsLive && nights > 0;
  const soldOut = quote?.configured && quote.available === false;

  const fold = {
    initial: reduce ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: reduce ? { opacity: 0 } : { opacity: 0, height: 0 },
  } as const;

  return (
    <div className="flex flex-col gap-6 border border-dark/10 bg-linen p-8 shadow-[0_20px_45px_rgba(44,40,37,0.1)]">
      {/* Price header */}
      <div className="flex items-baseline justify-between">
        {/* A rate appears only when Hospitable supplied one. "from" is
            load-bearing on the headline: nightly pricing is dynamic
            ($489-$574 here), so a single figure would be wrong for most dates
            — and wrong LOW on peak dates, which is the version a guest
            notices at checkout.

            With no live figure there is nothing honest to print, so the card
            says where the price comes from instead of inventing one. */}
        {liveStay !== null && nights > 0 ? (
          <p className="text-dark">
            <span className="text-xl font-medium">{fmt(Math.round(liveStay / nights))}</span>
            <span className="ml-1 text-base text-dark/60">{booking.perNightLabel}</span>
          </p>
        ) : priceFromCents !== null ? (
          <p className="text-dark">
            <span className="text-base text-dark/60">from </span>
            <span className="text-xl font-medium">{fmt(Math.round(priceFromCents / 100))}</span>
            <span className="ml-1 text-base text-dark/60">{booking.perNightLabel}</span>
          </p>
        ) : (
          <p className="text-base text-dark/60">Choose dates for pricing</p>
        )}
        <p className="flex items-center gap-1 text-base text-dark">
          <Star weight="fill" size={14} className="text-brand-deep" />
          {booking.rating}
        </p>
      </div>

      {/* Inputs — date chips + guests chip. */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 min-[360px]:flex-row">
          <button
            type="button"
            onClick={() => setCalOpen((v) => !v)}
            aria-expanded={calOpen}
            className={`${CHIP} flex flex-1 flex-col gap-1 text-left transition focus:outline-none focus:ring-2 focus:ring-brand/60`}
          >
            <span className={CHIP_LABEL}>{booking.checkInLabel}</span>
            <span className={`text-base ${checkIn ? "text-dark" : "text-dark/40"}`}>
              {fmtDate(checkIn)}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setCalOpen((v) => !v)}
            aria-expanded={calOpen}
            className={`${CHIP} flex flex-1 flex-col gap-1 text-left transition focus:outline-none focus:ring-2 focus:ring-brand/60`}
          >
            <span className={CHIP_LABEL}>{booking.checkOutLabel}</span>
            <span className={`text-base ${checkOut ? "text-dark" : "text-dark/40"}`}>
              {fmtDate(checkOut)}
            </span>
          </button>
        </div>

        {/* Calendar unfolds beneath the chips; closes once a range is set. */}
        <AnimatePresence initial={false}>
          {calOpen && (
            <motion.div
              key="calendar"
              {...fold}
              transition={{ duration: 0.45, ease: EASE }}
              className="overflow-hidden"
            >
              <RangeCalendar
              minStay={minStay}
                checkIn={checkIn}
                checkOut={checkOut}
                unavailable={unavailable}
                onChange={onDatesChange}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`${CHIP} flex flex-col gap-1`}>
          <label htmlFor="booking-guests" className={CHIP_LABEL}>
            {booking.guestsLabel}
          </label>
          <select
            id="booking-guests"
            value={guests}
            onChange={(e) => onGuestsChange(e.target.value)}
            className="w-full bg-transparent text-base text-dark outline-none"
          >
            {Array.from({ length: guestsMax }, (_, i) => i + 1).map((n) => (
              <option key={n} value={String(n)}>
                {n} {n === 1 ? "Guest" : "Guests"}
              </option>
            ))}
          </select>
          <p className="text-xs leading-[1.33] text-dark/60">
            {booking.guestsMaxNote.replace("{n}", String(guestsMax))}
          </p>
        </div>
      </div>

      {/* Reserve — full-width lilac pill, uppercase tracked label. Disabled
          when the live calendar reports the chosen nights as booked. */}
      <button
        onClick={onReserve}
        disabled={soldOut}
        className="flex h-14 w-full items-center justify-center rounded-full bg-brand text-base font-semibold uppercase tracking-[0.04em] text-dark transition-colors duration-[400ms] ease-luxe hover:bg-brand-deep hover:text-light active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-brand disabled:hover:text-dark"
      >
        {soldOut ? "Not available" : booking.reserveLabel}
      </button>

      <p className="text-center text-sm text-dark/60">
        {soldOut ? "Those dates are already booked — try another range." : booking.chargeNote}
      </p>

      {/* Fee breakdown — unfolds (height + opacity) once a date range exists. */}
      <AnimatePresence initial={false}>
        {nights > 0 && (
          <motion.div
            key="breakdown"
            {...fold}
            transition={{ duration: 0.45, ease: EASE }}
            className="-mt-2 overflow-hidden"
          >
            <div className="flex flex-col gap-3 text-base text-dark">
              {deferPricing ? (
                /* No live quote for these dates. Every figure below would have
                   to be invented, so none of them is shown — the guest is told
                   where the real number comes from instead. */
                <p className="text-dark/55">
                  {hasCheckout
                    ? "Your exact price, including cleaning and taxes, is shown at checkout before you pay."
                    : "We'll confirm the exact price, including cleaning and taxes, when we reply."}
                </p>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>
                      Stay &times; {nights} {nights === 1 ? "night" : "nights"}
                    </span>
                    <span>{fmt(stay as number)}</span>
                  </div>
                  {cleaning !== null && (
                    <div className="flex justify-between">
                      <span>{booking.cleaningFeeLabel}</span>
                      <span>{fmt(cleaning)}</span>
                    </div>
                  )}
                  {liveTax !== null && liveTax > 0 && (
                    <div className="flex justify-between">
                      <span>Taxes</span>
                      <span>{fmt(liveTax)}</span>
                    </div>
                  )}
                  {/* Always $0 and always shown: booking direct rather than
                      through Airbnb is the whole pitch, and this is the line
                      that proves it. */}
                  <div className="flex justify-between">
                    <span>{booking.serviceFeeLabel}</span>
                    <span>$0</span>
                  </div>
                  <div className="h-px w-full bg-dark/10" />
                  <div className="flex justify-between font-medium">
                    <span>
                      {booking.totalLabel}
                      {totalApprox && (
                        <span className="ml-1 font-normal text-dark/50">(estimated)</span>
                      )}
                    </span>
                    {/* Re-keyed on change so the number slides in fresh.
                     *
                     * CORRECTNESS BEFORE MOTION: this deliberately animates
                     * only position, never opacity, and uses no
                     * AnimatePresence.
                     *
                     * A previous version faded a new value in from opacity 0
                     * while the old one sat at opacity 1. If that transition
                     * did not run — a backgrounded tab pauses
                     * requestAnimationFrame, which is exactly what happens in
                     * a hidden preview — the STALE total stayed fully visible
                     * and the correct one was invisible on top of it. For a
                     * price that is the worst possible failure: the guest
                     * reads a number we already know is wrong.
                     *
                     * Now the correct figure paints at full opacity on its
                     * first frame and the animation is pure decoration. */}
                    <motion.span
                      key={total as number}
                      initial={reduce ? false : { y: 6 }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.25, ease: EASE }}
                    >
                      {fmt(total as number)}
                    </motion.span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
