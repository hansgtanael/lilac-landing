"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Star } from "@phosphor-icons/react";
import { EASE } from "@/lib/ease";
import { useReducedMotion } from "@/lib/useReducedMotion";
import RangeCalendar from "@/components/RangeCalendar";
import { useSiteContent } from "@/components/site-content";

const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;

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
};

/** Booking card — Figma node 81:47: flat blue-deep card, check-in/check-out
 *  date chips (the calendar unfolds beneath them), guests chip, full-width
 *  lilac RESERVE pill, live fee breakdown. */
export default function BookingCard({
  checkIn,
  checkOut,
  guests,
  unavailable,
  onDatesChange,
  onGuestsChange,
  onReserve,
}: Props) {
  const site = useSiteContent();
  const { booking } = site.text;
  const NIGHTLY_RATE = booking.pricePerNight;
  const CLEANING_FEE = booking.cleaningFee;

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
          });
        })
        .catch(() => {});
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [checkIn, checkOut, guests, nights]);

  // Live subtotal wins when Hospitable is configured and priced every night;
  // otherwise fall back to the static nightly rate.
  const liveStay =
    quote?.configured && quote.subtotalCents !== null ? quote.subtotalCents / 100 : null;
  const stay = liveStay ?? nights * NIGHTLY_RATE;
  const total = stay + (nights > 0 ? CLEANING_FEE : 0);
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
        <p className="text-dark">
          <span className="text-xl font-medium">{fmt(NIGHTLY_RATE)}</span>
          <span className="ml-1 text-base text-dark/60">{booking.perNightLabel}</span>
        </p>
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
            {Array.from({ length: booking.guestsMax }, (_, i) => i + 1).map((n) => (
              <option key={n} value={String(n)}>
                {n} {n === 1 ? "Guest" : "Guests"}
              </option>
            ))}
          </select>
          <p className="text-xs leading-[1.33] text-dark/60">
            {booking.guestsMaxNote.replace("{n}", String(booking.guestsMax))}
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
              <div className="flex justify-between">
                <span>
                  {liveStay !== null ? (
                    <>
                      Stay &times; {nights} {nights === 1 ? "night" : "nights"}
                    </>
                  ) : (
                    <>
                      {fmt(NIGHTLY_RATE)} &times; {nights}{" "}
                      {nights === 1 ? "night" : "nights"}
                    </>
                  )}
                </span>
                <span>{fmt(stay)}</span>
              </div>
              <div className="flex justify-between">
                <span>{booking.cleaningFeeLabel}</span>
                <span>{fmt(CLEANING_FEE)}</span>
              </div>
              <div className="flex justify-between">
                <span>{booking.serviceFeeLabel}</span>
                <span>$0</span>
              </div>
              <div className="h-px w-full bg-dark/10" />
              <div className="flex justify-between font-medium">
                <span>{booking.totalLabel}</span>
                {/* Re-keyed on change so the number slides in fresh. */}
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={total}
                    initial={reduce ? { opacity: 1 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    {fmt(total)}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
