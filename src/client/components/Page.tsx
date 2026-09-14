/**
 * Page wrapper template to be used as a base for all pages.
 */

import React from 'react';
import { Link, useLocation } from 'react-router';
import { useSession } from 'modelence/client';
import { AudioLines, FileText } from 'lucide-react';
import LoadingSpinner from '@/client/components/LoadingSpinner';
import VoicenLogo from '@/client/components/VoicenLogo';
import { Seo, type SeoProps } from '@/client/components/Seo';
import { Button } from '@/client/components/ui/Button';
import UserMenu from '@/client/components/UserMenu';
import { cn } from '@/client/lib/utils';

interface PageProps {
  children?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  /** Per-page <head> overrides (title, description, OG image, etc). */
  seo?: SeoProps;
}

function HeaderNavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const { pathname } = useLocation();
  const isActive = pathname === to || pathname.startsWith(`${to}/`);
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
        isActive ? 'bg-accent-soft text-accent-dark' : 'text-ink-soft hover:bg-paper-dim hover:text-ink'
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

function Header() {
  const { user } = useSession();

  return (
    <header className="flex items-center justify-between px-4 sm:px-8 h-14 border-b border-line bg-surface/80 backdrop-blur-md sticky top-0 z-10">
      <Link to="/" className="flex items-center gap-2 group">
        <VoicenLogo className="w-7 h-7 transition-transform group-hover:scale-105" />
        <span className="text-[15px] font-semibold tracking-tight text-ink">
          Voicen <span className="text-ink-faint">AI</span>
        </span>
      </Link>

      {user ? (
        <div className="flex items-center gap-1 sm:gap-2">
          <HeaderNavLink to="/voices" icon={<AudioLines className="h-4 w-4" />} label="Voices" />
          <HeaderNavLink to="/notes" icon={<FileText className="h-4 w-4" />} label="Notes" />
          <div className="ml-1 sm:ml-2">
            <UserMenu />
          </div>
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
