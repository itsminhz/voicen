import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { modelenceQuery } from '@modelence/react-query';
import { useSession } from 'modelence/client';
import { Mic, GraduationCap, Users, StickyNote, ArrowRight, Sparkles } from 'lucide-react';
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
    <div className="flex flex-1 items-center justify-center py-12">
      <div className="mx-auto max-w-2xl px-4 text-center animate-fade-in">
        <span className="mx-auto mb-8 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-soft shadow-sm">
          <Sparkles className="h-3 w-3" />
          AI-powered voice notes
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Speak it. <span className="text-ink-faint">We'll write it.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-ink-soft">
          VoiceNote AI turns your voice into organized notes — study notes for students,
          structured minutes for meetings, and clean lists for everything else.
        </p>
        <div className="mt-9 flex items-center justify-center gap-3">
          <Link to="/signup">
            <Button size="lg" color="primary">
              Get Started
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline">
              Log in
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
          <FeatureCard
            icon={GraduationCap}
            title="Student"
            description="Lectures and ideas become structured study notes, flashcards and exam prep."
          />
          <FeatureCard
            icon={Users}
            title="Meetings"
            description="Conversations become summaries with action items and key decisions."
          />
          <FeatureCard
            icon={StickyNote}
            title="Sticky Notes"
            description="Quick thoughts become beautiful, checkable lists — like Keep, but by voice."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Mic;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-sm transition-shadow hover:shadow-md animate-slide-up">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-paper-dim text-ink">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-ink-soft">{description}</p>
    </div>
  );
}

const WORKSPACE_MODES = [
  {
    key: 'student',
    icon: GraduationCap,
    title: 'Student',
    description: 'Study notes, flashcards, exam prep and more from your voice.',
    to: '/new',
    available: true,
  },
  {
    key: 'meetings',
    icon: Users,
    title: 'Meetings',
    description: 'Record a conversation — get a summary, action items and decisions.',
    to: '/meeting',
    available: true,
  },
  {
    key: 'sticky',
    icon: StickyNote,
    title: 'Sticky Notes',
    description: 'Turn rambling thoughts into clean, checkable lists.',
    available: false,
  },
] as const;

function Dashboard() {
  const { user } = useSession();
  const { data: notes, isLoading } = useQuery(modelenceQuery<NoteSummary[]>('voice.getNotes'));
  const recentNotes = (notes ?? []).slice(0, 4);
  const firstName = user?.handle?.split(/[@ ]/)[0] ?? 'there';

  return (
    <div className="mx-auto w-full max-w-4xl space-y-10 py-2 animate-fade-in">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">Pick a mode and start speaking.</p>
        </div>
        <Link to="/new">
          <Button color="primary">
            <Mic className="mr-1.5 h-4 w-4" />
            New voice note
          </Button>
        </Link>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-faint">Modes</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {WORKSPACE_MODES.map((mode) => {
            const inner = (
              <Card
                className={
                  mode.available
                    ? 'h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md'
                    : 'h-full'
                }
              >
                <CardContent className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between">
                    <span
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${
                        mode.available ? 'bg-ink text-surface' : 'bg-paper-dim text-ink-faint'
                      }`}
                    >
                      <mode.icon className="h-5 w-5" />
                    </span>
                    {!mode.available && <Badge color="neutral">Coming soon</Badge>}
                  </div>
                  <h3 className={`mt-4 text-sm font-semibold ${mode.available ? 'text-ink' : 'text-ink-faint'}`}>
                    {mode.title}
                  </h3>
                  <p className={`mt-1 text-xs leading-relaxed ${mode.available ? 'text-ink-soft' : 'text-ink-faint'}`}>
                    {mode.description}
                  </p>
                  {mode.available && (
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-ink">
                      Open <ArrowRight className="h-3 w-3" />
                    </span>
                  )}
                </CardContent>
              </Card>
            );

            return mode.available && 'to' in mode ? (
              <Link key={mode.key} to={mode.to} className="block h-full">
                {inner}
              </Link>
            ) : (
              <div key={mode.key} className="h-full cursor-not-allowed" title="Coming soon">
                {inner}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">Recent Notes</h2>
          <Link
            to="/notes"
            className="inline-flex items-center gap-1 text-sm font-medium text-ink transition-colors hover:text-ink-soft"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-paper-dim" />
            ))}
          </div>
        ) : recentNotes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-dim text-ink-faint">
                <Mic className="h-4.5 w-4.5" />
              </span>
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
                  <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <CardContent className="p-4">
                      <Badge color="neutral">{meta.label}</Badge>
                      <h3 className="mt-2 text-sm font-semibold text-ink line-clamp-1">{note.title}</h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-soft">{note.summary}</p>
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
