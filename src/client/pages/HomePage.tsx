import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { modelenceQuery } from '@modelence/react-query';
import { useSession } from 'modelence/client';
import {
  Mic,
  GraduationCap,
  Users,
  StickyNote,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  FileText,
  CheckCircle2,
  ListTodo,
  Plus,
  Clock,
} from 'lucide-react';
import Page from '@/client/components/Page';
import { Card, CardContent } from '@/client/components/ui/Card';
import { Button } from '@/client/components/ui/Button';
import { Badge } from '@/client/components/ui/Badge';
import { MODE_META, type NoteMode } from '@/client/features/voice/modes';
import type { NoteSummary } from '@/client/features/voice/types';
import { STICKY_COLOR_CLASSES, type Sticky } from '@/client/features/voice/stickyTypes';
import { cn } from '@/client/lib/utils';

export default function HomePage() {
  const { user } = useSession();

  return <Page seo={{}}>{user ? <Dashboard /> : <Landing />}</Page>;
}

/* ------------------------------- Landing ------------------------------- */

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
          Voicen AI turns your voice into organized notes — study notes for students,
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

/* ------------------------------ Dashboard ------------------------------ */

const WORKSPACE_MODES = [
  {
    key: 'student',
    icon: GraduationCap,
    title: 'Student',
    description: 'Study notes, flashcards & exam prep from your voice.',
    to: '/new',
    chip: 'bg-violet-100 text-violet-700',
    ring: 'group-hover:border-violet-300',
  },
  {
    key: 'meetings',
    icon: Users,
    title: 'Meetings',
    description: 'Summaries with action items and key decisions.',
    to: '/meeting',
    chip: 'bg-sky-100 text-sky-700',
    ring: 'group-hover:border-sky-300',
  },
  {
    key: 'sticky',
    icon: StickyNote,
    title: 'Sticky Notes',
    description: 'Rambling thoughts become clean, checkable lists.',
    to: '/stickies',
    chip: 'bg-amber-100 text-amber-700',
    ring: 'group-hover:border-amber-300',
  },
] as const;

type NotesFilter = 'all' | 'study' | 'meeting';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function Dashboard() {
  const { user } = useSession();
  const { data: notes, isLoading: notesLoading } = useQuery(
    modelenceQuery<NoteSummary[]>('voice.getNotes')
  );
  const { data: stickies, isLoading: stickiesLoading } = useQuery(
    modelenceQuery<Sticky[]>('voice.getStickies')
  );
  const [filter, setFilter] = useState<NotesFilter>('all');

  const allNotes = notes ?? [];
  const studyCount = allNotes.filter((n) => n.mode !== 'meeting').length;
  const meetingCount = allNotes.filter((n) => n.mode === 'meeting').length;
  const openActions = allNotes.reduce((sum, n) => sum + (n.openActionItems ?? 0), 0);
  const stickyCount = stickies?.length ?? 0;

  const filtered = allNotes.filter((n) =>
    filter === 'all' ? true : filter === 'meeting' ? n.mode === 'meeting' : n.mode !== 'meeting'
  );
  const recentNotes = filtered.slice(0, 6);
  const actionNotes = allNotes.filter((n) => (n.openActionItems ?? 0) > 0).slice(0, 4);
  const recentStickies = (stickies ?? []).slice(0, 4);

  const firstName = user?.handle?.split(/[@ ]/)[0] ?? 'there';
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 py-2 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">{today}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Welcome back, {firstName}
          </h1>
        </div>
        <Link to="/new">
          <Button color="primary">
            <Mic className="mr-1.5 h-4 w-4" />
            Start recording
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={FileText} label="Total notes" value={allNotes.length} loading={notesLoading} />
        <StatCard icon={GraduationCap} label="Study notes" value={studyCount} loading={notesLoading} />
        <StatCard icon={Users} label="Meetings" value={meetingCount} loading={notesLoading} />
        <StatCard icon={StickyNote} label="Sticky lists" value={stickyCount} loading={stickiesLoading} />
      </div>

      {/* Mode tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {WORKSPACE_MODES.map((mode, i) => (
          <Link key={mode.key} to={mode.to} className="group block h-full">
            <Card
              className={cn(
                'h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                mode.ring
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <CardContent className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between">
                  <span
                    className={cn(
                      'inline-flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-105',
                      mode.chip
                    )}
                  >
                    <mode.icon className="h-5 w-5" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-ink">{mode.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">{mode.description}</p>
                <span className="mt-auto pt-3 inline-flex items-center gap-1 text-xs font-medium text-ink">
                  <Mic className="h-3 w-3" /> Start speaking
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Content: recent notes + right rail */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent notes */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1 rounded-lg border border-line bg-surface p-0.5 shadow-sm">
              {(
                [
                  { key: 'all', label: 'All' },
                  { key: 'study', label: 'Study' },
                  { key: 'meeting', label: 'Meetings' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={cn(
                    'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                    filter === tab.key
                      ? 'bg-ink text-surface shadow-sm'
                      : 'text-ink-soft hover:text-ink'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <Link
              to="/notes"
              className="inline-flex items-center gap-1 text-sm font-medium text-ink transition-colors hover:text-ink-soft"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <Card>
            {notesLoading ? (
              <div className="space-y-3 p-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-paper-dim" />
                ))}
              </div>
            ) : recentNotes.length === 0 ? (
              <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-dim text-ink-faint">
                  <Mic className="h-4.5 w-4.5" />
                </span>
                <p className="text-sm text-ink-soft">
                  {filter === 'all' ? "You haven't created any notes yet." : 'Nothing here yet.'}
                </p>
                <Link to={filter === 'meeting' ? '/meeting' : '/new'}>
                  <Button size="sm" variant="outline">
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Create one
                  </Button>
                </Link>
              </CardContent>
            ) : (
              <div className="divide-y divide-line">
                {recentNotes.map((note) => <NoteRow key={note._id} note={note} />)}
              </div>
            )}
          </Card>
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          {/* Action items */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">
                Open action items
              </h2>
              {openActions > 0 && <Badge color="neutral">{openActions}</Badge>}
            </div>
            <Card>
              {actionNotes.length === 0 ? (
                <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
                  <CheckCircle2 className="h-5 w-5 text-ink-faint" />
                  <p className="text-xs text-ink-soft">Nothing outstanding. All caught up.</p>
                </CardContent>
              ) : (
                <div className="divide-y divide-line">
                  {actionNotes.map((note) => (
                    <Link
                      key={note._id}
                      to={`/notes/${note._id}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-paper-dim"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sky-100 text-sky-700">
                        <ListTodo className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-ink">{note.title}</p>
                        <p className="text-[11px] text-ink-faint">
                          {note.openActionItems} open item{note.openActionItems === 1 ? '' : 's'}
                        </p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sticky lists */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">
                Sticky lists
              </h2>
              <Link
                to="/stickies"
                className="inline-flex items-center gap-1 text-xs font-medium text-ink transition-colors hover:text-ink-soft"
              >
                Open board <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {stickiesLoading ? (
              <div className="grid grid-cols-2 gap-2">
                {[0, 1].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-xl bg-paper-dim" />
                ))}
              </div>
            ) : recentStickies.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
                  <StickyNote className="h-5 w-5 text-ink-faint" />
                  <p className="text-xs text-ink-soft">No lists yet.</p>
                  <Link to="/stickies">
                    <Button size="sm" variant="outline">
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      New list
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {recentStickies.map((sticky) => <MiniSticky key={sticky._id} sticky={sticky} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof Mic;
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-paper-dim text-ink">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          {loading ? (
            <div className="h-6 w-10 animate-pulse rounded bg-paper-dim" />
          ) : (
            <p className="text-xl font-bold leading-none tracking-tight text-ink">{value}</p>
          )}
          <p className="mt-1 truncate text-xs text-ink-faint">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function NoteRow({ note }: { note: NoteSummary }) {
  const meta = MODE_META[note.mode as NoteMode] ?? MODE_META.brain_dump;
  const isMeeting = note.mode === 'meeting';
  const Icon = meta.icon;

  return (
    <Link
      to={`/notes/${note._id}`}
      className="flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-paper-dim"
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          isMeeting ? 'bg-sky-100 text-sky-700' : 'bg-violet-100 text-violet-700'
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-ink">{note.title}</h3>
          {note.openActionItems > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-700">
              <ListTodo className="h-2.5 w-2.5" />
              {note.openActionItems}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-ink-soft">{note.summary}</p>
      </div>
      <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
        <Badge color="neutral">{meta.label}</Badge>
        <span className="inline-flex items-center gap-1 text-[11px] text-ink-faint">
          <Clock className="h-3 w-3" />
          {timeAgo(note.updatedAt)}
        </span>
      </div>
    </Link>
  );
}

function MiniSticky({ sticky }: { sticky: Sticky }) {
  const colors = STICKY_COLOR_CLASSES[sticky.color] ?? STICKY_COLOR_CLASSES.yellow;
  const shown = sticky.items.slice(0, 3);
  const more = sticky.items.length - shown.length;

  return (
    <Link
      to="/stickies"
      className={cn(
        'block rounded-xl border p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        colors.card
      )}
    >
      <h3 className="truncate text-xs font-semibold text-ink">{sticky.title}</h3>
      <ul className="mt-1.5 space-y-1">
        {shown.map((item, i) => (
          <li
            key={i}
            className={cn(
              'truncate text-[11px] leading-tight',
              item.done ? 'text-ink-faint line-through' : 'text-ink-soft'
            )}
          >
            • {item.text}
          </li>
        ))}
      </ul>
      {more > 0 && <p className="mt-1 text-[10px] text-ink-faint">+{more} more</p>}
    </Link>
  );
}
