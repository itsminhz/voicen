import { useState } from 'react';
import { Link } from 'react-router';
import { ChevronDown, ChevronRight, LogIn, Menu } from 'lucide-react';

function VoicenLogo() {
  // Sky gradient rounded tile with white voice waveform bars
  return (
    <svg viewBox="0 0 32 32" className="w-7 h-7 sm:w-8 sm:h-8" aria-label="Voicen AI logo">
      <defs>
        <linearGradient id="voicen-logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#voicen-logo-grad)" />
      {/* waveform bars */}
      {[
        { x: 7.5, h: 8 },
        { x: 12, h: 14 },
        { x: 16.5, h: 20 },
        { x: 21, h: 12 },
        { x: 25.5, h: 6 },
      ].map((bar, i) => (
        <rect
          key={i}
          x={bar.x - 1.25}
          y={16 - bar.h / 2}
          width={2.5}
          height={bar.h}
          rx={1.25}
          fill="white"
        />
      ))}
    </svg>
  );
}

const NAV_ITEMS = [
  { label: 'Home', href: '#top', dot: true },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#about' },
  { label: 'Modes', href: '#features', accent: true, chevron: true },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex justify-center pt-4 sm:pt-6 px-3 sm:px-4">
      <nav className="bg-white rounded-full shadow-sm border border-neutral-200 pl-2 pr-2 py-2 w-full max-w-[760px] relative flex items-center gap-4">
        <span className="shrink-0 pl-1">
          <VoicenLogo />
        </span>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6" style={{ fontSize: 14 }}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={
                item.accent
                  ? 'inline-flex items-center gap-0.5 font-medium'
                  : 'inline-flex items-center gap-1.5 text-neutral-800 font-medium'
              }
              style={item.accent ? { color: '#0ea5e9' } : undefined}
            >
              {item.dot && <span className="w-[6px] h-[6px] rounded-full bg-black" style={{ width: 6, height: 6 }} />}
              {item.label}
              {item.chevron && <ChevronDown className="w-3.5 h-3.5" />}
            </a>
          ))}
        </div>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-neutral-100 transition-colors"
            aria-label="Log in"
          >
            <LogIn className="w-4.5 h-4.5 text-neutral-800" />
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-full text-white font-medium pl-4 sm:pl-5 pr-1.5 py-1.5"
            style={{ backgroundColor: '#0ea5e9', fontSize: 13 }}
          >
            <span className="hidden sm:inline">Get early access</span>
            <span className="sm:hidden">Early access</span>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
              <ChevronRight className="w-4 h-4" />
            </span>
          </Link>
          <button
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-neutral-100 transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <Menu className="w-5 h-5 text-neutral-800" />
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="absolute top-full left-2 right-2 mt-2 bg-white rounded-2xl shadow-lg border border-neutral-200 p-3 z-20 md:hidden">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 font-medium hover:bg-neutral-50"
                style={{ fontSize: 14, color: item.accent ? '#0ea5e9' : '#262626' }}
              >
                {item.dot && <span className="rounded-full bg-black" style={{ width: 6, height: 6 }} />}
                {item.label}
                {item.chevron && <ChevronDown className="w-3.5 h-3.5" />}
              </a>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
}
