"use client";

import { useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

type Props = {
  checkIn: string; // "YYYY-MM-DD" or ""
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
  /** Booked dates (ISO) to gray out — from Hospitable's calendar. */
  unavailable?: string[];
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_MS = 86_400_000;

function toISO(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
function fromISO(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  return y ? new Date(y, m - 1, d) : null;
}
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function sameDay(a: Date | null, b: Date | null) {
  return !!a && !!b && a.getTime() === b.getTime();
}

/** Range calendar rendered as a light input chip — cream surface, dark text,
 *  the strongest contrast block on the page (per the Figma booking card). */
export default function RangeCalendar({ checkIn, checkOut, onChange, unavailable }: Props) {
  const ci = fromISO(checkIn);
  const co = fromISO(checkOut);
  const today = startOfDay(new Date());
  const [view, setView] = useState<Date>(() => ci ?? today);
  const booked = new Set(unavailable ?? []);

  const year = view.getFullYear();
  const month = view.getMonth();
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const pick = (d: Date) => {
    if (d < today || booked.has(toISO(d))) return;
    // No range yet, or a complete range exists -> start fresh.
    if (!ci || (ci && co)) {
      onChange(toISO(d), "");
      return;
    }
    // Check-in set, choosing check-out.
    if (d.getTime() <= ci.getTime()) onChange(toISO(d), "");
    else onChange(toISO(ci), toISO(d));
  };

  const between = (d: Date) => !!ci && !!co && d > ci && d < co;
  const nights = ci && co ? Math.round((co.getTime() - ci.getTime()) / DAY_MS) : 0;
  const canGoPrev = !(year === today.getFullYear() && month === today.getMonth());

  return (
    <div className="border border-dark-faded bg-white p-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          aria-label="Previous month"
          disabled={!canGoPrev}
          onClick={() => canGoPrev && setView(new Date(year, month - 1, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full text-dark transition-colors hover:bg-dark/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <CaretLeft weight="light" className="h-4 w-4" />
        </button>
        <p className="text-sm font-medium text-dark">
          {MONTHS[month]} {year}
        </p>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setView(new Date(year, month + 1, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full text-dark transition-colors hover:bg-dark/[0.06]"
        >
          <CaretRight weight="light" className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday header */}
      <div className="mt-3 grid grid-cols-7">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="py-1 text-center text-[10px] uppercase tracking-[0.08em] text-dark/50"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Day grid. No column gap so the selected range reads as one connected bar. */}
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const isPast = d < today;
          const isBooked = !isPast && booked.has(toISO(d));
          const isEdge = sameDay(d, ci) || sameDay(d, co);
          const mid = between(d);
          const isStart = sameDay(d, ci) && !!co;
          const isEnd = sameDay(d, co);
          const disabled = isPast || isBooked;

          return (
            <div
              key={i}
              // Range tint lives on the cell so it spans edge-to-edge.
              className={[
                "py-0.5",
                mid ? "bg-brand/25" : "",
                isStart ? "bg-brand/25" : "",
                isEnd ? "bg-brand/25" : "",
              ].join(" ")}
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => pick(d)}
                aria-label={isBooked ? `${toISO(d)} (booked)` : toISO(d)}
                className={[
                  "flex h-9 w-full items-center justify-center text-sm transition-colors",
                  isPast
                    ? "cursor-not-allowed text-dark/25"
                    : isBooked
                      ? "cursor-not-allowed text-dark/25 line-through"
                      : isEdge
                        ? "bg-dark font-medium text-light"
                        : "text-dark hover:bg-dark/[0.08]",
                ].join(" ")}
              >
                {d.getDate()}
              </button>
            </div>
          );
        })}
      </div>

      {/* Summary + clear */}
      <div className="mt-4 flex items-center justify-between border-t border-dark-faded pt-3 text-xs">
        <span className="text-dark/50">
          {ci
            ? co
              ? `${nights} night${nights === 1 ? "" : "s"}`
              : "Select your check-out date"
            : "Select your check-in date"}
        </span>
        {(ci || co) && (
          <button
            type="button"
            onClick={() => onChange("", "")}
            className="text-blue transition-colors hover:text-dark"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
