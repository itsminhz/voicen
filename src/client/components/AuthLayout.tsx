import React from 'react';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Seo, type SeoProps } from '@/client/components/Seo';
import VoicenLogo from '@/client/components/VoicenLogo';

/**
 * Landing-matched auth shell: #ededed frame, floating logo header,
 * centered white rounded card. Used by login / signup / password pages.
 */
export default function AuthLayout({
  seo,
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  seo?: SeoProps;
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen flex-col bg-paper"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Seo {...seo} />

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2">
          <VoicenLogo className="h-7 w-7" />
          <span className="text-[15px] font-semibold tracking-tight text-ink">
            Voicen <span className="text-ink-faint">AI</span>
          </span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-1.5 text-[13px] font-medium text-ink-soft shadow-sm transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>
      </div>

      {/* Card */}
      <div className="flex flex-1 items-center justify-center px-3 py-8 sm:px-4">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1 text-xs font-medium text-ink-soft shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#0ea5e9' }} />
                {eyebrow ?? 'Voicen AI'}
              </span>
              <h1
                className="mt-4 text-ink"
                style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 500, letterSpacing: '-0.02em' }}
              >
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{subtitle}</p>
              )}
            </div>
            <div className="mt-6">{children}</div>
          </div>
          {footer && <div className="mt-5 text-center text-sm text-ink-soft">{footer}</div>}
        </div>
      </div>

      {/* Footer */}
      <p className="pb-6 text-center text-xs text-ink-faint">
        © {new Date().getFullYear()} Voicen AI — voicen.xyz
      </p>
    </div>
  );
}

/** Serif italic accent, matching the landing headlines. */
export function Serif({ children }: { children: React.ReactNode }) {
  return <span className="font-serif italic font-normal">{children}</span>;
}

/** Landing-style sky pill submit button. */
export function AuthSubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
    >
      {children}
    </button>
  );
}
