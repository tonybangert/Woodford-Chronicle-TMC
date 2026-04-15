import { useState, useEffect, useRef } from 'react';
import { motion, useInView, animate, useMotionValue, useTransform } from 'motion/react';

// ============================================================================
// CONSTANTS
// ============================================================================

const MAILED_COPIES = 2672;       // Mailed to every home & business in Eureka (61530)
const STORE_COPIES = 700;         // Distributed to stores, restaurants, gas stations & businesses in Woodford County
const TOTAL_COPIES = MAILED_COPIES + STORE_COPIES;  // 3,372
const PASS_ALONG_RATE = 2.3;
const TOTAL_READERS = Math.round(TOTAL_COPIES * PASS_ALONG_RATE);
const FACEBOOK_CPM = 15;

const AD_SIZES = [
  { id: 'full',     name: 'Full Page',          dims: '10.25" × 11"',  price: 650, w: 100, h: 100 },
  { id: 'half-h',   name: 'Half Page',          dims: '10.25" × 5.4"', price: 335, w: 100, h: 49  },
  { id: 'half-v',   name: 'Half Vertical',      dims: '5" × 11"',      price: 335, w: 49,  h: 100 },
  { id: 'quarter',  name: 'Quarter Page',       dims: '5" × 5.4"',     price: 175, w: 49,  h: 49  },
  { id: 'eighth',   name: 'Eighth Page',        dims: '5" × 2.6"',     price: 115, w: 49,  h: 24  },
  { id: 'card',     name: 'Business Card',      dims: '3.3" × 2.6"',   price: 65,  w: 32,  h: 24  },
];

const DURATIONS = [
  { months: 1,  discount: 0,    label: '1 issue'    },
  { months: 3,  discount: 0.05, label: '3 issues'   },
  { months: 6,  discount: 0.10, label: '6 issues'   },
  { months: 12, discount: 0.15, label: '12 issues'  },
];

const RED  = '#E53935';
const INK  = '#1A1A1A';
const PAPER = '#FAFAF7';
const GRAY  = '#9B9B9B';

// ============================================================================
// FONT LOADER
// ============================================================================

function useFonts() {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..900&family=Inter+Tight:wght@300..800&family=JetBrains+Mono:wght@400..700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Inject keyframes for the household reveal
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes dotFadeIn {
        0%   { opacity: 0; transform: scale(0.3); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes scrollHint {
        0%, 100% { transform: translateY(0); opacity: 0.4; }
        50%      { transform: translateY(8px); opacity: 1; }
      }
      .paper-grain {
        background-image:
          radial-gradient(circle at 20% 30%, rgba(0,0,0,0.015) 1px, transparent 1px),
          radial-gradient(circle at 70% 60%, rgba(0,0,0,0.015) 1px, transparent 1px),
          radial-gradient(circle at 40% 80%, rgba(0,0,0,0.012) 1px, transparent 1px);
        background-size: 8px 8px, 6px 6px, 10px 10px;
      }
      .tabular { font-variant-numeric: tabular-nums; }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);
}

// ============================================================================
// CHRONICLE WORDMARK (recreated to match)
// ============================================================================

function ChronicleLogo({ size = 1, showTagline = false }) {
  return (
    <div
      className="inline-flex flex-col leading-none select-none items-center"
      style={{ letterSpacing: '-0.02em' }}
    >
      <span style={{ fontFamily: 'Arial Black, Impact, sans-serif', color: GRAY, fontSize: `${size * 1.6}rem`, lineHeight: 0.85 }}>
        WOODFORD
      </span>
      <span style={{
        fontFamily: 'Arial Black, Impact, sans-serif',
        color: RED,
        fontSize: `${size * 2.0}rem`,
        lineHeight: 0.85,
        marginTop: `${size * 0.05}rem`,
        letterSpacing: '-0.04em',
      }}>
        chronicle
      </span>
      {showTagline && (
        <span style={{
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: GRAY,
          fontSize: `${size * 0.55}rem`,
          marginTop: `${size * 0.4}rem`,
          letterSpacing: '0.08em',
          fontWeight: 400,
          textTransform: 'uppercase',
        }}>
          Serving Woodford County Since 2005
        </span>
      )}
    </div>
  );
}

// ============================================================================
// COUNTER (animated number)
// ============================================================================

function Counter({ to, duration = 2, className = '', prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={`tabular ${className}`}>
      {prefix}{val.toLocaleString()}{suffix}
    </span>
  );
}

// ============================================================================
// HERO
// ============================================================================

function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col justify-between paper-grain overflow-hidden"
      style={{ backgroundColor: PAPER }}
    >
      {/* Top bar: centered logo with tagline */}
      <div className="flex flex-col items-center px-8 md:px-16 pt-10">
        <ChronicleLogo size={1.1} showTagline />
      </div>

      {/* Center stage */}
      <div className="px-8 md:px-16 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <div
            className="inline-flex items-center gap-3 px-3 py-1.5 border-2"
            style={{
              borderColor: INK,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              color: INK,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: RED }} />
            INAUGURAL TMC EDITION / WED JUNE 3, 2026
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="font-medium leading-[0.88] tracking-tight"
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: 'clamp(3rem, 9vw, 8rem)',
            color: INK,
            fontVariationSettings: '"opsz" 144',
          }}
        >
          Reach every<br />
          home in<br />
          <span style={{ color: RED, fontStyle: 'italic', fontWeight: 400 }}>Eureka.</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 max-w-4xl"
        >
          <Stat number={3372} label="Copies distributed" />
          <Stat number={7756} label="Adult readers" />
          <Stat number={100} label="Coverage of 61530" suffix="%" />
          <Stat number={1} label="Day. Once a month." />
        </motion.div>
      </div>

      {/* Bottom: scroll cue */}
      <div className="px-8 md:px-16 pb-10 flex items-end justify-between">
        <div
          className="max-w-md text-sm leading-relaxed opacity-70"
          style={{ fontFamily: 'Inter Tight, sans-serif', color: INK }}
        >
          The only advertising medium in Eureka that guarantees 100% household
          delivery. No algorithm. No opt-in. No scrolling past.
        </div>
        <div
          className="flex flex-col items-center gap-2"
          style={{ animation: 'scrollHint 2s ease-in-out infinite' }}
        >
          <span
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: INK }}
            className="opacity-60"
          >
            BUILD YOUR PLAN
          </span>
          <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
            <path d="M7 1 V19 M1 13 L7 19 L13 13" stroke={INK} strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </section>
  );
}

function Stat({ number, label, suffix = '' }) {
  return (
    <div className="border-t-2 pt-3" style={{ borderColor: INK }}>
      <div
        className="font-medium leading-none mb-2"
        style={{
          fontFamily: 'Fraunces, serif',
          fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
          color: INK,
          fontVariationSettings: '"opsz" 144',
        }}
      >
        <Counter to={number} suffix={suffix} />
      </div>
      <div
        className="text-xs uppercase tracking-wider opacity-60"
        style={{ fontFamily: 'JetBrains Mono, monospace', color: INK }}
      >
        {label}
      </div>
    </div>
  );
}

// ============================================================================
// THE MAP MOMENT — household reveal
// ============================================================================

function HouseholdReveal() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  // Build a 60-col grid of dots totaling ~3372
  const cols = 60;
  const fullRows = Math.floor(TOTAL_COPIES / cols); // 56
  const remainder = TOTAL_COPIES - fullRows * cols; // 12
  const dots = [];
  for (let r = 0; r < fullRows; r++) {
    for (let c = 0; c < cols; c++) dots.push({ r, c });
  }
  for (let c = 0; c < remainder; c++) dots.push({ r: fullRows, c });

  const spacing = 11;
  const dotR = 2.4;
  const padX = 12;
  const padY = 12;
  const svgW = cols * spacing + padX * 2;
  const svgH = (fullRows + 1) * spacing + padY * 2;

  return (
    <section
      ref={ref}
      className="relative py-32 px-8 md:px-16 overflow-hidden"
      style={{ backgroundColor: INK, color: PAPER }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 max-w-3xl">
          <div
            className="text-xs uppercase tracking-wider opacity-50 mb-4"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            01 / The Reach
          </div>
          <h2
            className="font-medium leading-[0.95] mb-6"
            style={{
              fontFamily: 'Fraunces, serif',
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontVariationSettings: '"opsz" 144',
            }}
          >
            Every dot is a<br />
            <span style={{ color: RED, fontStyle: 'italic' }}>kitchen table.</span>
          </h2>
          <p
            className="text-base md:text-lg leading-relaxed opacity-70 max-w-xl"
            style={{ fontFamily: 'Inter Tight, sans-serif' }}
          >
            On the first Wednesday of every month starting June 3, 2026, 2,672 copies
            are mailed to every home and business in Eureka, and 700 more
            are distributed to stores, restaurants, gas stations and local businesses
            throughout Woodford County. No targeting guesswork. No skipped feeds.
          </p>
        </div>

        <div className="relative">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full h-auto"
            style={{ maxHeight: '60vh' }}
          >
            {dots.map((d, i) => (
              <circle
                key={i}
                cx={padX + d.c * spacing + spacing / 2}
                cy={padY + d.r * spacing + spacing / 2}
                r={dotR}
                fill={RED}
                style={{
                  opacity: 0,
                  transformOrigin: 'center',
                  animation: inView
                    ? `dotFadeIn 0.5s ease-out ${i * 0.0006}s forwards`
                    : 'none',
                }}
              />
            ))}
          </svg>

          {/* Floating data tag */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 2.4, duration: 0.6 }}
            className="absolute top-4 right-4 md:top-8 md:right-8 border p-4 backdrop-blur"
            style={{
              borderColor: 'rgba(250,250,247,0.3)',
              backgroundColor: 'rgba(26,26,26,0.6)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
            }}
          >
            <div className="opacity-60 mb-1">ZIP 61530 / EUREKA, IL</div>
            <div className="text-2xl mb-1 tabular" style={{ fontFamily: 'Fraunces, serif' }}>
              3,372
            </div>
            <div className="opacity-60">copies every issue</div>
          </motion.div>
        </div>

        {/* Comparison row */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 md:gap-12">
          <Compare
            label="The Chronicle TMC"
            value="100%"
            sub="Guaranteed household delivery in 61530"
            highlight
          />
          <Compare
            label="Facebook local targeting"
            value="35–45%"
            sub="And only those still scrolling that day"
          />
          <Compare
            label="Google Search ads"
            value="<8%"
            sub="Only people already searching for you"
          />
        </div>
      </div>
    </section>
  );
}

function Compare({ label, value, sub, highlight }) {
  return (
    <div
      className="border-t pt-4"
      style={{ borderColor: highlight ? RED : 'rgba(250,250,247,0.2)' }}
    >
      <div
        className="text-xs uppercase tracking-wider mb-3 opacity-60"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}
      >
        {label}
      </div>
      <div
        className="font-medium leading-none mb-2 tabular"
        style={{
          fontFamily: 'Fraunces, serif',
          fontSize: '3rem',
          color: highlight ? RED : PAPER,
          fontVariationSettings: '"opsz" 144',
        }}
      >
        {value}
      </div>
      <div
        className="text-sm opacity-60 leading-snug"
        style={{ fontFamily: 'Inter Tight, sans-serif' }}
      >
        {sub}
      </div>
    </div>
  );
}

// ============================================================================
// AD BUILDER + ROI + COMMITMENT (combined interactive section)
// ============================================================================

function PlanBuilder() {
  const [size, setSize] = useState(AD_SIZES[3]);   // Quarter Page default
  const [duration, setDuration] = useState(DURATIONS[2]); // 6 issues default
  const [customerValue, setCustomerValue] = useState(150);
  const [newCustomers, setNewCustomers] = useState(4);

  const monthly = size.price * (1 - duration.discount);
  const total = monthly * duration.months;
  const totalReach = TOTAL_COPIES * duration.months;
  const cpm = (size.price / TOTAL_COPIES) * 1000;
  const monthlyRevenue = customerValue * newCustomers;
  const roi = ((monthlyRevenue - monthly) / monthly) * 100;
  const breakeven = Math.ceil(monthly / customerValue);

  return (
    <section
      className="py-32 px-8 md:px-16 paper-grain"
      style={{ backgroundColor: PAPER, color: INK }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-16 max-w-3xl">
          <div
            className="text-xs uppercase tracking-wider opacity-50 mb-4"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            02 / Build Your Plan
          </div>
          <h2
            className="font-medium leading-[0.95]"
            style={{
              fontFamily: 'Fraunces, serif',
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontVariationSettings: '"opsz" 144',
            }}
          >
            Pick a size.<br />
            See exactly what<br />
            <span style={{ color: RED, fontStyle: 'italic' }}>it does for you.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* LEFT: Ad size selector + page mockup */}
          <div className="lg:col-span-7">
            <div
              className="text-xs uppercase tracking-wider opacity-50 mb-4"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              Ad Size
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-10">
              {AD_SIZES.map((s) => {
                const active = size.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSize(s)}
                    className="text-left p-4 border-2 transition-all"
                    style={{
                      borderColor: active ? RED : 'rgba(26,26,26,0.15)',
                      backgroundColor: active ? RED : 'transparent',
                      color: active ? PAPER : INK,
                    }}
                  >
                    <div
                      className="font-medium text-sm mb-1"
                      style={{ fontFamily: 'Inter Tight, sans-serif' }}
                    >
                      {s.name}
                    </div>
                    <div
                      className="text-xs opacity-70 tabular"
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      {s.dims}
                    </div>
                    <div
                      className="text-lg font-medium mt-2 tabular"
                      style={{ fontFamily: 'Fraunces, serif' }}
                    >
                      ${s.price}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Page mockup */}
            <div
              className="text-xs uppercase tracking-wider opacity-50 mb-4"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              Live Preview / Your ad on the page
            </div>
            <PageMockup size={size} />
          </div>

          {/* RIGHT: ROI + Duration */}
          <div className="lg:col-span-5 space-y-10">
            {/* Duration toggle */}
            <div>
              <div
                className="text-xs uppercase tracking-wider opacity-50 mb-4"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                Run Length
              </div>
              <div className="grid grid-cols-4 gap-2">
                {DURATIONS.map((d) => {
                  const active = duration.months === d.months;
                  return (
                    <button
                      key={d.months}
                      onClick={() => setDuration(d)}
                      className="py-3 border-2 transition-all"
                      style={{
                        borderColor: active ? INK : 'rgba(26,26,26,0.15)',
                        backgroundColor: active ? INK : 'transparent',
                        color: active ? PAPER : INK,
                      }}
                    >
                      <div
                        className="text-sm font-medium tabular"
                        style={{ fontFamily: 'Inter Tight, sans-serif' }}
                      >
                        {d.months}×
                      </div>
                      {d.discount > 0 && (
                        <div
                          className="text-[10px] mt-0.5 tabular"
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            color: active ? RED : RED,
                          }}
                        >
                          −{d.discount * 100}%
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ROI inputs */}
            <div>
              <div
                className="text-xs uppercase tracking-wider opacity-50 mb-4"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                Your Numbers
              </div>

              <SliderRow
                label="Average customer value"
                value={customerValue}
                min={20}
                max={2000}
                step={10}
                prefix="$"
                onChange={setCustomerValue}
              />
              <SliderRow
                label="New customers per issue"
                value={newCustomers}
                min={1}
                max={50}
                step={1}
                onChange={setNewCustomers}
              />
            </div>

            {/* Result panel */}
            <div className="border-2 p-6" style={{ borderColor: INK }}>
              <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                <Metric label="Per issue" value={`${Math.round(monthly)}`} />
                <Metric label="Total investment" value={`${Math.round(total).toLocaleString()}`} accent />
                <Metric label="Total reach" value={totalReach.toLocaleString()} sub="households" />
                <Metric label="CPM" value={`${cpm.toFixed(2)}`} sub={`vs ${FACEBOOK_CPM} on Facebook`} />
              </div>

              <div
                className="mt-6 pt-5 border-t"
                style={{ borderColor: 'rgba(26,26,26,0.15)' }}
              >
                <div
                  className="text-xs uppercase tracking-wider mb-2 opacity-60"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  Projected ROI per issue
                </div>
                <div className="flex items-baseline gap-3">
                  <span
                    className="font-medium tabular"
                    style={{
                      fontFamily: 'Fraunces, serif',
                      fontSize: '3.5rem',
                      lineHeight: 0.9,
                      color: roi > 0 ? RED : INK,
                      fontVariationSettings: '"opsz" 144',
                    }}
                  >
                    {roi > 0 ? '+' : ''}{Math.round(roi)}%
                  </span>
                  <span
                    className="text-sm opacity-60"
                    style={{ fontFamily: 'Inter Tight, sans-serif' }}
                  >
                    return on investment
                  </span>
                </div>
                <div
                  className="text-sm mt-3 opacity-70"
                  style={{ fontFamily: 'Inter Tight, sans-serif' }}
                >
                  Breakeven: just <span className="font-semibold tabular">{breakeven}</span>{' '}
                  new {breakeven === 1 ? 'customer' : 'customers'} pays for the entire ad.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PageMockup({ size }) {
  // Render an 8.5 × 11ish newspaper page with the selected ad placed inside
  const PAGE_W = 320;
  const PAGE_H = 360;
  const PAD_X = 16;
  const PAD_Y = 14;
  const CONTENT_W = PAGE_W - PAD_X * 2;
  const CONTENT_H = PAGE_H - PAD_Y * 2;
  const adW = (size.w / 100) * CONTENT_W;
  const adH = (size.h / 100) * CONTENT_H;

  return (
    <div className="flex justify-center">
      <div
        className="relative shadow-2xl"
        style={{
          width: PAGE_W,
          height: PAGE_H,
          backgroundColor: '#FFFCF5',
          padding: '14px 16px',
        }}
      >
        {/* Mock masthead */}
        <div className="flex items-end justify-between mb-2 pb-2 border-b-2" style={{ borderColor: INK }}>
          <div style={{ fontFamily: 'Arial Black, Impact, sans-serif', fontSize: '0.55rem', color: GRAY, letterSpacing: '-0.02em' }}>
            WOODFORD <span style={{ color: RED }}>chronicle</span>
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.4rem', color: INK, opacity: 0.6 }}>
            JUNE 3, 2026
          </div>
        </div>

        {/* Mock article column lines */}
        <div className="space-y-1 mb-2">
          <div className="h-1 w-3/4" style={{ backgroundColor: INK, opacity: 0.85 }} />
          <div className="h-1 w-1/2" style={{ backgroundColor: INK, opacity: 0.85 }} />
        </div>

        {/* Article body grid (placeholder text bars) */}
        <div className="flex gap-1.5">
          <div className="flex-1 space-y-0.5">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className="h-[2px]"
                style={{
                  width: `${85 + (i % 4) * 4}%`,
                  backgroundColor: INK,
                  opacity: 0.25,
                }}
              />
            ))}
          </div>
          <div className="flex-1 space-y-0.5">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className="h-[2px]"
                style={{
                  width: `${82 + (i % 5) * 4}%`,
                  backgroundColor: INK,
                  opacity: 0.25,
                }}
              />
            ))}
          </div>
        </div>

        {/* The ad — absolutely positioned, bottom-right of content area */}
        <motion.div
          key={size.id}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute flex flex-col items-center justify-center"
          style={{
            right: PAD_X,
            bottom: PAD_Y,
            width: adW,
            height: adH,
            backgroundColor: RED,
            color: PAPER,
            border: `2px solid ${INK}`,
            boxShadow: '4px 4px 0 rgba(0,0,0,0.15)',
          }}
        >
          <div
            className="text-center px-2"
            style={{ fontFamily: 'Fraunces, serif', fontSize: adH > 60 ? '0.85rem' : '0.6rem', fontWeight: 600 }}
          >
            YOUR AD
          </div>
          <div
            className="text-center px-2 opacity-80"
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.5rem', marginTop: 2 }}
          >
            {size.dims}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function SliderRow({ label, value, min, max, step, prefix = '', onChange }) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between mb-2">
        <span
          className="text-sm opacity-70"
          style={{ fontFamily: 'Inter Tight, sans-serif' }}
        >
          {label}
        </span>
        <span
          className="font-medium tabular"
          style={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', color: INK }}
        >
          {prefix}{value.toLocaleString()}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full appearance-none h-1 cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${RED} 0%, ${RED} ${((value - min) / (max - min)) * 100}%, rgba(26,26,26,0.15) ${((value - min) / (max - min)) * 100}%, rgba(26,26,26,0.15) 100%)`,
        }}
      />
    </div>
  );
}

function Metric({ label, value, sub, accent }) {
  return (
    <div>
      <div
        className="text-[10px] uppercase tracking-wider mb-1 opacity-60"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}
      >
        {label}
      </div>
      <div
        className="font-medium leading-none tabular"
        style={{
          fontFamily: 'Fraunces, serif',
          fontSize: '1.6rem',
          color: accent ? RED : INK,
          fontVariationSettings: '"opsz" 144',
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          className="text-[10px] opacity-50 mt-1"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// THE CLOSE — deadlines + reservation
// ============================================================================

function TheClose() {
  return (
    <section
      className="py-32 px-8 md:px-16"
      style={{ backgroundColor: INK, color: PAPER }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <div
              className="text-xs uppercase tracking-wider opacity-50 mb-4"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              03 / Reserve Your Placement
            </div>
            <h2
              className="font-medium leading-[0.92] mb-8"
              style={{
                fontFamily: 'Fraunces, serif',
                fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                fontVariationSettings: '"opsz" 144',
              }}
            >
              The first issue<br />
              closes <span style={{ color: RED, fontStyle: 'italic' }}>May 29.</span>
            </h2>
            <p
              className="text-base md:text-lg opacity-70 max-w-xl leading-relaxed mb-8"
              style={{ fontFamily: 'Inter Tight, sans-serif' }}
            >
              Space is reserved on a first-come basis. Once the inaugural June 3
              edition is full, the next opportunity is July. Lock in your spot
              today and we will design your ad at no extra cost.
            </p>

            <a
              href="mailto:mdoherty@chronicleillinois.com?subject=Reserve%20Woodford%20Chronicle%20TMC%20Placement"
              className="inline-flex items-center gap-3 px-8 py-5 transition-all hover:gap-5"
              style={{
                backgroundColor: RED,
                color: PAPER,
                fontFamily: 'Inter Tight, sans-serif',
                fontWeight: 600,
                fontSize: '1rem',
                letterSpacing: '0.02em',
              }}
            >
              RESERVE MY PLACEMENT
              <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                <path d="M0 6 H18 M13 1 L19 6 L13 11" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </a>

            <div
              className="mt-8 text-sm opacity-60"
              style={{ fontFamily: 'Inter Tight, sans-serif' }}
            >
              Or call Mark Doherty directly:{' '}
              <a href="tel:8476752715" className="font-semibold tabular hover:opacity-100" style={{ color: PAPER }}>
                847.675.2715
              </a>
            </div>
          </div>

          {/* Deadline timeline */}
          <div className="lg:col-span-5">
            <div className="border p-8" style={{ borderColor: 'rgba(250,250,247,0.2)' }}>
              <div
                className="text-xs uppercase tracking-wider opacity-50 mb-6"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                Production Timeline
              </div>

              <Milestone
                date="FRI MAY 29"
                title="Space reservation closes"
                sub="Confirm size and run length"
              />
              <Milestone
                date="MON JUN 2"
                title="Final artwork due"
                sub="Or send copy + logo, we design free"
              />
              <Milestone
                date="WED JUN 3"
                title="In-home delivery"
                sub="Edition No. 01 — 2,672 mailed + 700 to local businesses"
                highlight
              />
              <Milestone
                date="EVERY MONTH"
                title="First Wednesday, ongoing"
                sub="Issues 02 and beyond — reserve early to lock placement"
                last
              />
            </div>
          </div>
        </div>

        {/* Footer / closing line */}
        <div
          className="mt-24 pt-12 border-t flex flex-col md:flex-row md:items-end md:justify-between gap-8"
          style={{ borderColor: 'rgba(250,250,247,0.15)' }}
        >
          <div>
            <ChronicleLogo size={1} />
            <div
              className="mt-4 text-xs opacity-50 max-w-sm leading-relaxed"
              style={{ fontFamily: 'Inter Tight, sans-serif' }}
            >
              Chronicle Media, LLC. Member, Illinois Press Association and
              National Newspaper Association. Trusted local journalism, built
              for the people who read it and the businesses who serve them.
            </div>
          </div>
          <div
            className="text-right"
            style={{ fontFamily: 'Fraunces, serif', fontSize: '1.5rem', fontStyle: 'italic' }}
          >
            Support local.<br />
            Be seen.<br />
            <span style={{ color: RED }}>Grow your business.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Milestone({ date, title, sub, highlight, last }) {
  return (
    <div className={`flex gap-5 ${last ? '' : 'pb-6 mb-6 border-b'}`} style={{ borderColor: 'rgba(250,250,247,0.1)' }}>
      <div className="flex-shrink-0 w-2 mt-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: highlight ? RED : 'rgba(250,250,247,0.4)' }}
        />
      </div>
      <div className="flex-1">
        <div
          className="text-[10px] uppercase tracking-wider opacity-60 mb-1 tabular"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          {date}
        </div>
        <div
          className="font-medium mb-1"
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: '1.15rem',
            color: highlight ? RED : PAPER,
          }}
        >
          {title}
        </div>
        <div
          className="text-xs opacity-60 leading-snug"
          style={{ fontFamily: 'Inter Tight, sans-serif' }}
        >
          {sub}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN APP
// ============================================================================

export default function WoodfordChronicleReach() {
  useFonts();
  return (
    <div style={{ backgroundColor: PAPER }}>
      <Hero />
      <HouseholdReveal />
      <PlanBuilder />
      <TheClose />
    </div>
  );
}
