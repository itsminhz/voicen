import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelenceQuery, modelenceMutation, createQueryKey } from '@modelence/react-query';
import { useSession } from 'modelence/client';
import { toast } from 'react-hot-toast';
import {
  Check,
  FileText,
  GraduationCap,
  Users,
  StickyNote,
  ListTodo,
  LogOut,
  Save,
  Clock,
  ArrowRight,
  AtSign,
  Loader2,
} from 'lucide-react';
import Page from '@/client/components/Page';
import { Card, CardContent } from '@/client/components/ui/Card';
import { Button } from '@/client/components/ui/Button';
import { Input } from '@/client/components/ui/Input';
import { Textarea } from '@/client/components/ui/Textarea';
import { Badge } from '@/client/components/ui/Badge';
import { MODE_META, type NoteMode } from '@/client/features/voice/modes';
import type { NoteSummary } from '@/client/features/voice/types';
import type { Sticky } from '@/client/features/voice/stickyTypes';
import avatarMale from '@/client/assets/avatar-male.png';
import avatarFemale from '@/client/assets/avatar-female.png';
import { cn } from '@/client/lib/utils';

type Gender = 'male' | 'female';

const AVATARS: Record<Gender, string> = {
  male: avatarMale,
  female: avatarFemale,
};

interface Profile {
  gender: Gender | null;
  displayName: string;
  bio: string;
}

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

export default function ProfilePage() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery(modelenceQuery<Profile>('profile.get'));
  const { data: notes } = useQuery(modelenceQuery<NoteSummary[]>('voice.getNotes'));
  const { data: stickies } = useQuery(modelenceQuery<Sticky[]>('voice.getStickies'));

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGenderLocal] = useState<Gender>('male');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (profile && !hydrated) {
      setDisplayName(profile.displayName);
      setBio(profile.bio);
      setGenderLocal(profile.gender ?? 'male');
      setHydrated(true);
    }
  }, [profile, hydrated]);

  const { mutate: saveProfile, isPending: isSaving } = useMutation({
    ...modelenceMutation('profile.update'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createQueryKey('profile.get') });
      toast.success('Profile saved');
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const allNotes = notes ?? [];
  const studyCount = allNotes.filter((n) => n.mode !== 'meeting').length;
  const meetingCount = allNotes.filter((n) => n.mode === 'meeting').length;
  const openActions = allNotes.reduce((sum, n) => sum + (n.openActionItems ?? 0), 0);
  const stickyList = stickies ?? [];
  const itemsDone = stickyList.reduce(
    (sum, s) => sum + s.items.filter((i) => i.done).length,
    0
  );
  const recent = allNotes.slice(0, 5);

  const dirty =
    hydrated &&
    profile != null &&
    (displayName !== profile.displayName ||
      bio !== profile.bio ||
      gender !== (profile.gender ?? 'male'));

  const shownName = displayName.trim() || user?.handle?.split(/[@ ]/)[0] || 'there';

  return (
    <Page isLoading={isLoading} seo={{ title: 'Profile' }}>
      <div className="mx-auto w-full max-w-4xl space-y-6 py-2 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Profile</h1>
          <p className="mt-1 text-sm text-ink-soft">Manage how you appear across Voicen AI.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: identity card */}
          <div className="space-y-6">
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <img
                  src={AVATARS[gender]}
                  alt="Profile avatar"
                  className="h-24 w-24 rounded-full border-2 border-line shadow-md"
                />
                <h2 className="mt-4 text-base font-semibold text-ink">{shownName}</h2>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-faint">
                  <AtSign className="h-3 w-3" />
                  {user?.handle}
                </p>
                {bio.trim() && (
                  <p className="mt-3 text-xs leading-relaxed text-ink-soft">{bio}</p>
                )}

                <div className="mt-5 w-full">
                  <p className="mb-2 text-left text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                    Avatar
                  </p>
                  <div className="flex justify-center gap-3">
                    {(Object.keys(AVATARS) as Gender[]).map((g) => (
                      <button
                        key={g}
                        onClick={() => setGenderLocal(g)}
                        className={cn(
                          'relative rounded-full transition-all hover:scale-105',
                          gender === g
                            ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface'
                            : 'opacity-60 hover:opacity-100'
                        )}
                        aria-label={g === 'male' ? 'Male avatar' : 'Female avatar'}
                      >
                        <img src={AVATARS[g]} alt="" className="h-14 w-14 rounded-full border border-line" />
                        {gender === g && (
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-surface">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-2">
                <Link
                  to="/logout"
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-danger transition-colors hover:bg-paper-dim"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Right: details, stats, activity */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardContent className="space-y-4 p-5">
                <h2 className="text-sm font-semibold text-ink">Account details</h2>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-soft">
                    Display name
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="How should we greet you?"
                    maxLength={60}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-soft">Bio</label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="A short line about you (school, team, what you use Voicen for...)"
                    maxLength={300}
                    rows={3}
                  />
                  <p className="mt-1 text-right text-[11px] text-ink-faint">{bio.length}/300</p>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-4">
                  <p className="text-xs text-ink-faint">
                    Signed in as <span className="font-medium text-ink-soft">{user?.handle}</span>
                  </p>
                  <Button
                    color="primary"
                    disabled={!dirty || isSaving}
                    onClick={() => saveProfile({ displayName, bio, gender })}
                  >
                    {isSaving ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-1.5 h-4 w-4" />
                    )}
                    Save changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-faint">
                Your activity
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <MiniStat icon={FileText} label="Total notes" value={allNotes.length} />
                <MiniStat icon={GraduationCap} label="Study notes" value={studyCount} chip="bg-violet-100 text-violet-700" />
                <MiniStat icon={Users} label="Meetings" value={meetingCount} chip="bg-sky-100 text-sky-700" />
                <MiniStat icon={StickyNote} label="Sticky lists" value={stickyList.length} chip="bg-amber-100 text-amber-700" />
                <MiniStat icon={ListTodo} label="Open actions" value={openActions} chip="bg-rose-100 text-rose-700" />
                <MiniStat icon={Check} label="Items checked" value={itemsDone} chip="bg-emerald-100 text-emerald-700" />
              </div>
            </div>

            {/* Recent activity */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-faint">
                  Recent notes
                </h2>
                <Link
                  to="/notes"
                  className="inline-flex items-center gap-1 text-xs font-medium text-ink transition-colors hover:text-ink-soft"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <Card>
                {recent.length === 0 ? (
                  <CardContent className="py-10 text-center text-sm text-ink-soft">
                    No notes yet — head back to the dashboard and start speaking.
                  </CardContent>
                ) : (
                  <div className="divide-y divide-line">
                    {recent.map((note) => {
                      const meta = MODE_META[note.mode as NoteMode] ?? MODE_META.brain_dump;
                      return (
                        <Link
                          key={note._id}
                          to={`/notes/${note._id}`}
                          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-paper-dim"
                        >
                          <span
                            className={cn(
                              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                              note.mode === 'meeting'
                                ? 'bg-sky-100 text-sky-700'
                                : 'bg-violet-100 text-violet-700'
                            )}
                          >
                            <meta.icon className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-ink">{note.title}</p>
                          </div>
                          <Badge color="neutral">{meta.label}</Badge>
                          <span className="hidden shrink-0 items-center gap-1 text-[11px] text-ink-faint sm:inline-flex">
                            <Clock className="h-3 w-3" />
                            {timeAgo(note.updatedAt)}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  chip = 'bg-paper-dim text-ink',
}: {
  icon: typeof Check;
  label: string;
  value: number;
  chip?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3.5">
        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', chip)}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-lg font-bold leading-none tracking-tight text-ink">{value}</p>
          <p className="mt-0.5 truncate text-[11px] text-ink-faint">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
