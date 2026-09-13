import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { modelenceQuery } from '@modelence/react-query';
import { useSession } from 'modelence/client';
import { Mic, PenLine, HelpCircle, FileText, ArrowRight } from 'lucide-react';
import Page from '@/client/components/Page';
import { Card, CardContent } from '@/client/components/ui/Card';
import { Button } from '@/client/components/ui/Button';
import { Badge } from '@/client/components/ui/Badge';
import { MODE_META } from '@/client/features/voice/modes';
import type { NoteSummary } from '@/client/features/voice/types';

export default function HomePage() {
  const { user } = useSession();

  return <Page seo={{}}>{user ? <Dashboard /> : <Landing />}</Page>;
}

function Landing() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="mx-auto max-w-lg text-center animate-fade-in">
        <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-contrast shadow-md">
          <Mic className="h-7 w-7" strokeWidth={2} />
        </span>
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
          VoiceNote <span className="text-accent">AI</span>
        </h1>
        <p className="mt-4 text-base text-ink-soft">
          Stop typing your notes. Speak naturally, and let AI turn your voice into organized study notes.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/signup">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline">
              Log in
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useSession();
  const { data: notes, isLoading } = useQuery(modelenceQuery<NoteSummary[]>('voice.getNotes'));
  const recentNotes = (notes ?? []).slice(0, 4);
  const firstName = user?.handle?.split(/[@ ]/)[0] ?? 'there';

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">Ready to turn your thoughts into notes?</p>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:p-12">
          <Link to="/new" className="group">
            <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-accent text-accent-contrast shadow-md transition-transform duration-300 group-hover:scale-105">
              <Mic className="h-9 w-9" strokeWidth={2} />
            </span>
          </Link>
          <div>
            <p className="font-display text-lg text-ink">Tap to start a new voice note</p>
            <p className="mt-1 text-sm text-ink-soft">Speak naturally — AI will organize it for you.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickAction to="/new" icon={Mic} label="New Voice Note" />
        <QuickAction to="/new" icon={PenLine} label="Write Note" />
        <QuickAction icon={HelpCircle} label="Quiz Me" disabled />
        <QuickAction to="/notes" icon={FileText} label="Browse Notes" />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Recent Notes</h2>
          <Link to="/notes" className="inline-flex items-center gap-1 text-sm text-accent-dark hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-paper-dim" />
            ))}
          </div>
        ) : recentNotes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
              <p className="text-sm text-ink-soft">You haven't created any notes yet.</p>
              <Link to="/new">
                <Button size="sm" variant="outline">
                  Create your first note
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {recentNotes.map((note) => {
              const meta = MODE_META[note.mode];
              return (
                <Link key={note._id} to={`/notes/${note._id}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <Badge color="neutral">{meta.label}</Badge>
                      <h3 className="mt-2 font-display text-sm font-semibold text-ink line-clamp-1">{note.title}</h3>
                      <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{note.summary}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
  disabled,
}: {
  to?: string;
  icon: typeof Mic;
  label: string;
  disabled?: boolean;
}) {
  const content = (
    <Card className={disabled ? 'opacity-50' : 'transition-shadow hover:shadow-md'}>
      <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent-dark">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-xs font-medium text-ink">{label}</span>
      </CardContent>
    </Card>
  );

  if (disabled || !to) {
    return <div title={disabled ? 'Coming soon' : undefined}>{content}</div>;
  }

  return <Link to={to}>{content}</Link>;
}
