/**
 * Page wrapper template to be used as a base for all pages.
 */

import React from 'react';
import { Link } from 'react-router';
import { useSession } from 'modelence/client';
import { Mic } from 'lucide-react';
import LoadingSpinner from '@/client/components/LoadingSpinner';
import { Seo, type SeoProps } from '@/client/components/Seo';
import { Button } from '@/client/components/ui/Button';
import { cn } from '@/client/lib/utils';

interface PageProps {
  children?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  /** Per-page <head> overrides (title, description, OG image, etc). */
  seo?: SeoProps;
}

function Header() {
  const { user } = useSession();

  return (
    <header className="flex items-center justify-between px-4 sm:px-8 h-14 border-b border-line bg-surface/80 backdrop-blur-md sticky top-0 z-10">
      <Link to="/" className="flex items-center gap-2.5 group">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-ink text-surface shadow-sm group-hover:bg-ink/85 transition-colors">
          <Mic className="w-4 h-4" strokeWidth={2.25} />
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-ink">
          VoiceNote <span className="text-ink-faint">AI</span>
        </span>
      </Link>

      {user ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink-soft hidden sm:inline">
            {user.handle}
          </span>
          <Link to="/logout">
            <Button variant="outline" color="neutral">
              Logout
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" color="neutral">
              Log in
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="solid" color="primary">
              Sign up
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col min-h-screen max-w-full overflow-x-hidden bg-paper text-ink">{children}</div>;
}

function PageBody({ children, className, isLoading = false }: PageProps) {
  return (
    <div className="flex flex-1 w-full min-h-0">
      <main className={cn("flex flex-col flex-1 p-4 sm:p-6 space-y-4 overflow-x-hidden", className)}>
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-full">
            <LoadingSpinner />
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}

export default function Page({ children, className, isLoading = false, seo }: PageProps) {
  return (
    <PageWrapper>
      <Seo {...seo} />
      <Header />
      <PageBody className={className} isLoading={isLoading}>{children}</PageBody>
    </PageWrapper>
  );
}
