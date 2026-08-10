"use client";

import { useEffect, useRef, useState } from "react";

const STORE = "lilac-spacing";
const LEGACY = "lilac-about-spacing";

/** One slider row: live readout with unit, wired to a single value. */
function Row({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  unit: "vh" | "px" | "%" | "svh" | "s";
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="mt-3 block text-[12px] text-light/80">
      {label}{" "}
      <span className="text-light/50">
        {value}
        {unit}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-[#c4a9c2]"
      />
    </label>
  );
}

/** Dev-only exploration sliders (Hans): every meaningful vertical gap on the
 *  home page in one panel. About-group vars are set on #about (they scope
 *  inside that section); section-group vars live on :root since those sections
 *  sit outside #about. Each var's baked default lives as its fallback in the
 *  markup, so an untouched panel renders pixel-identical to the hard-coded
 *  layout. About vars are always written (their defaults equal the fallbacks
 *  and are symmetric); section vars are written only once their own slider is
 *  dirtied, so untouched sections keep their fallbacks — this is what preserves
 *  the asymmetric pt/pb of Amenities & Book until they are deliberately tuned.
 *  Persists to one localStorage key; mirrors FrameTuner in GalleryNoir. */
export default function SpacingTuner() {
  const [open, setOpen] = useState(false);

  // About group — vh gaps (unchanged wiring) + new px gaps, set on #about.
  // Defaults = Hans's baked picks (2026-07-23).
  const [top, setTop] = useState(4);
  const [bottom, setBottom] = useState(7);
  const [band, setBand] = useState(4);
  const [introTop, setIntroTop] = useState(80);
  const [labelGap, setLabelGap] = useState(32);
  // Main Floor feature photo framing (crop % positions + aspect ×100; 150 =
  // the pro shot's native 3:2 uncropped — Hans bakes 109 w/ 45/41 crop):
  const [featureX, setFeatureX] = useState(45);
  const [featureY, setFeatureY] = useState(41);
  const [featureAr, setFeatureAr] = useState(109);
  // Band label ("― The Main Floor") size in px:
  const [labelSize, setLabelSize] = useState(36);

  // Section group — px vertical padding, set on :root. Book stays asymmetric
  // (slider default = its larger bottom padding); Amenities was baked
  // symmetric at 96 (Hans, 2026-07-23); tuning applies one value both sides.
  const [amenities, setAmenities] = useState(96);
  const [property, setProperty] = useState(48);
  const [experience, setExperience] = useState(48);
  const [book, setBook] = useState(184);

  // Motion + layout tuning. All defaults equal their markup fallbacks, so
  // the mount-time writes are identity-safe:
  //   driftScale — damps every Drift parallax (--drift-scale, 0.3 baked)
  //   featureW   — band feature-photo column width (--about-feature-w, 40%)
  //   roomsMask  — dim over the View Our Rooms RESTING COVER (--rooms-mask, 0.45 —
  //                Hans's pick, baked 2026-07-23)
  //   roomsVh    — the rooms block's viewport share (--rooms-vh, 100svh)
  const [driftScale, setDriftScale] = useState(30);
  const [featureW, setFeatureW] = useState(45);
  // MUST stay equal to the --rooms-mask fallback in ViewRooms.tsx (0.45), or
  // the "identity-safe" mount-time write below silently overrides it — the
  // effect runs even in production, where this component renders null.
  const [roomsMask, setRoomsMask] = useState(45);
  const [roomsVh, setRoomsVh] = useState(76);
  // Photo brightness lift (--photo-lift on :root, x100). MUST stay equal to
  // the :root value in globals.css (1.15) — same identity-safe rule as above.
  const [photoLift, setPhotoLift] = useState(115);
  // Marquee loop duration (seconds — LOWER is faster):
  //   railSpeed — Gallery rail (--rail-speed on #property, 100s baked)
  const [railSpeed, setRailSpeed] = useState(100);

  // Persist only after a deliberate move — otherwise stale saves would shadow
  // the baked defaults. `dirty` tracks which section vars the user actually
  // moved, so only those get written (untouched fallbacks survive).
  const touched = useRef(false);
  const dirty = useRef<Set<string>>(new Set());

  useEffect(() => {
    try {
      const rawNew = localStorage.getItem(STORE);
      if (rawNew) {
        const s = JSON.parse(rawNew);
        if (s.touched === true) {
          if (typeof s.top === "number") setTop(s.top);
          if (typeof s.bottom === "number") setBottom(s.bottom);
          if (typeof s.band === "number") setBand(s.band);
          if (typeof s.introTop === "number") setIntroTop(s.introTop);
          if (typeof s.labelGap === "number") setLabelGap(s.labelGap);
          if (typeof s.featureX === "number") setFeatureX(s.featureX);
          if (typeof s.featureY === "number") setFeatureY(s.featureY);
          if (typeof s.featureAr === "number") setFeatureAr(s.featureAr);
          if (typeof s.labelSize === "number") setLabelSize(s.labelSize);
          if (typeof s.amenities === "number") setAmenities(s.amenities);
          if (typeof s.property === "number") setProperty(s.property);
          if (typeof s.experience === "number") setExperience(s.experience);
          if (typeof s.book === "number") setBook(s.book);
          // Older saved JSON may lack these — leave the baked defaults.
          if (typeof s.driftScale === "number") setDriftScale(s.driftScale);
          if (typeof s.featureW === "number") setFeatureW(s.featureW);
          if (typeof s.roomsMask === "number") setRoomsMask(s.roomsMask);
          if (typeof s.roomsVh === "number") setRoomsVh(s.roomsVh);
          if (typeof s.photoLift === "number") setPhotoLift(s.photoLift);
          if (typeof s.railSpeed === "number") setRailSpeed(s.railSpeed);
          if (Array.isArray(s.dirty)) dirty.current = new Set(s.dirty);
          touched.current = true;
        }
      } else {
        // One-time migration: seed the three About vh values from the old
        // key. The old key is left untouched.
        const rawOld = localStorage.getItem(LEGACY);
        if (rawOld) {
          const o = JSON.parse(rawOld);
          if (o.touched === true) {
            if (typeof o.top === "number") setTop(o.top);
            if (typeof o.bottom === "number") setBottom(o.bottom);
            if (typeof o.band === "number") setBand(o.band);
            touched.current = true;
          }
        }
      }
    } catch {
      /* fresh start */
    }
  }, []);

  useEffect(() => {
    const el = document.getElementById("about");
    if (el) {
      el.style.setProperty("--about-gap-carousel-top", `${top}vh`);
      el.style.setProperty("--about-gap-carousel-bottom", `${bottom}vh`);
      el.style.setProperty("--about-gap-band", `${band}vh`);
      // Mobile keeps the same proportion as the baked defaults (12/16 = 0.75).
      el.style.setProperty("--about-gap-band-sm", `${band * 0.75}vh`);
      // Written in rem (value/16) so the mount-time write equals the rem
      // fallbacks even when the browser base font size isn't 16px.
      el.style.setProperty("--about-intro-top", `${introTop / 16}rem`);
      el.style.setProperty("--about-gap-label", `${labelGap / 16}rem`);
      el.style.setProperty("--drift-scale", String(driftScale / 100));
      el.style.setProperty("--about-feature-w", `${featureW}%`);
      el.style.setProperty("--about-feature-x", `${featureX}%`);
      el.style.setProperty("--about-feature-y", `${featureY}%`);
      el.style.setProperty("--about-feature-ar", String(featureAr / 100));
      el.style.setProperty("--about-label-size", `${labelSize / 16}rem`);
    }
    const propertyEl = document.getElementById("property");
    if (propertyEl) propertyEl.style.setProperty("--rail-speed", `${railSpeed}s`);
    // Section vars live on :root; only write the ones the user has dirtied so
    // untouched sections fall back to their exact hard-coded padding.
    const root = document.documentElement;
    const sections: [string, number][] = [
      ["--sp-amenities-y", amenities],
      ["--sp-property-y", property],
      ["--sp-experience-y", experience],
      ["--sp-book-y", book],
    ];
    for (const [name, val] of sections) {
      if (dirty.current.has(name)) root.style.setProperty(name, `${val}px`);
    }
    // Rooms vars live on #view-rooms; written unconditionally (defaults ==
    // the class fallbacks, so the mount-time writes are identity-safe).
    // NOTE: this effect runs in production too — the component only returns
    // null further down, which does not stop hooks. So a default that drifts
    // from its class fallback becomes a silent production style override.
    const rooms = document.getElementById("view-rooms");
    if (rooms) {
      rooms.style.setProperty("--rooms-mask", String(roomsMask / 100));
      rooms.style.setProperty("--rooms-vh", `${roomsVh}svh`);
    }
    // Photo lift is global (every cream section), so it lives on :root.
    root.style.setProperty("--photo-lift", String(photoLift / 100));
    if (touched.current) {
      try {
        localStorage.setItem(
          STORE,
          JSON.stringify({
            touched: true,
            top,
            bottom,
            band,
            introTop,
            labelGap,
            featureX,
            featureY,
            featureAr,
            labelSize,
            amenities,
            property,
            experience,
            book,
            driftScale,
            featureW,
            roomsMask,
            roomsVh,
            photoLift,
            railSpeed,
            dirty: [...dirty.current],
          }),
        );
      } catch {
        /* storage unavailable (private mode/quota) — sliders still work */
      }
    }
  }, [top, bottom, band, introTop, labelGap, featureX, featureY, featureAr, labelSize, amenities, property, experience, book, driftScale, featureW, roomsMask, roomsVh, railSpeed, photoLift]);

  // About slider: mark touched (About vars are written unconditionally).
  const onAbout = (setter: (n: number) => void) => (n: number) => {
    touched.current = true;
    setter(n);
  };
  // Section slider: also flag its var dirty so it starts being written.
  const onSection =
    (name: string, setter: (n: number) => void) => (n: number) => {
      touched.current = true;
      dirty.current.add(name);
      setter(n);
    };

  if (process.env.NODE_ENV === "production") return null;
  return (
    <div data-no-edit className="fixed bottom-20 right-6 z-40 font-sans">
      {open ? (
        <div className="max-h-[70vh] w-72 overflow-y-auto rounded-2xl bg-dark/90 p-4 text-light shadow-xl backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.18em] text-light/70">Spacing</p>
            <button onClick={() => setOpen(false)} className="text-light/60 hover:text-light">
              ×
            </button>
          </div>

          <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-light/40">About</p>
          <Row label="Intro → carousel" value={top} unit="vh" min={0} max={30} step={0.5} onChange={onAbout(setTop)} />
          <Row label="Carousel → bands" value={bottom} unit="vh" min={0} max={30} step={0.5} onChange={onAbout(setBottom)} />
          <Row label="Between bands" value={band} unit="vh" min={0} max={30} step={0.5} onChange={onAbout(setBand)} />
          <Row label="Intro top" value={introTop} unit="px" min={0} max={200} step={4} onChange={onAbout(setIntroTop)} />
          <Row label="Label → content" value={labelGap} unit="px" min={0} max={160} step={2} onChange={onAbout(setLabelGap)} />
          <Row label="Text drift" value={driftScale} unit="%" min={10} max={150} step={5} onChange={onAbout(setDriftScale)} />
          <Row label="Feature photo" value={featureW} unit="%" min={25} max={70} step={1} onChange={onAbout(setFeatureW)} />
          <Row label="Feature crop X" value={featureX} unit="%" min={0} max={100} step={1} onChange={onAbout(setFeatureX)} />
          <Row label="Feature crop Y" value={featureY} unit="%" min={0} max={100} step={1} onChange={onAbout(setFeatureY)} />
          <Row label="Feature aspect" value={featureAr} unit="%" min={50} max={180} step={1} onChange={onAbout(setFeatureAr)} />
          <Row label="Label size" value={labelSize} unit="px" min={20} max={64} step={1} onChange={onAbout(setLabelSize)} />

          <p className="mb-1 mt-5 text-[10px] uppercase tracking-[0.18em] text-light/40">Sections</p>
          <Row label="Amenities" value={amenities} unit="px" min={0} max={200} step={4} onChange={onSection("--sp-amenities-y", setAmenities)} />
          <Row label="The Property" value={property} unit="px" min={0} max={200} step={4} onChange={onSection("--sp-property-y", setProperty)} />
          <Row label="Experience" value={experience} unit="px" min={0} max={200} step={4} onChange={onSection("--sp-experience-y", setExperience)} />
          <Row label="Book" value={book} unit="px" min={0} max={200} step={4} onChange={onSection("--sp-book-y", setBook)} />

          <p className="mb-1 mt-5 text-[10px] uppercase tracking-[0.18em] text-light/40">Photos</p>
          <Row label="Photo brightness" value={photoLift} unit="%" min={100} max={150} step={1} onChange={onAbout(setPhotoLift)} />

          <p className="mb-1 mt-5 text-[10px] uppercase tracking-[0.18em] text-light/40">Rooms</p>
          <Row label="Cover dim (rest)" value={roomsMask} unit="%" min={0} max={80} step={1} onChange={onAbout(setRoomsMask)} />
          <Row label="Height" value={roomsVh} unit="svh" min={60} max={130} step={2} onChange={onAbout(setRoomsVh)} />

          <p className="mb-1 mt-5 text-[10px] uppercase tracking-[0.18em] text-light/40">Carousel (lower = faster)</p>
          <Row label="Gallery speed" value={railSpeed} unit="s" min={15} max={180} step={5} onChange={onAbout(setRailSpeed)} />
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-dark/80 px-4 py-2 text-[12px] text-light/90 shadow-lg backdrop-blur-sm"
        >
          Spacing
        </button>
      )}
    </div>
  );
}
