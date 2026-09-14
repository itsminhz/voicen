import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { modelenceQuery, modelenceMutation } from '@modelence/react-query';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Check, Loader2, Trash2, Recycle, Sparkles, X } from 'lucide-react';
import Page from '@/client/components/Page';
import { Card, CardContent } from '@/client/components/ui/Card';
import { Button } from '@/client/components/ui/Button';
import { IconButton } from '@/client/components/ui/IconButton';
import { Badge } from '@/client/components/ui/Badge';
import NoteView from '@/client/features/voice/NoteView';
import MeetingNoteView from '@/client/features/voice/MeetingNoteView';
import ModeSelector from '@/client/features/voice/ModeSelector';
import { MODE_META, type StudyMode } from '@/client/features/voice/modes';
import type { FullNote, GeneratedNote, GeneratedMeetingNote } from '@/client/features/voice/types';

export default function NotePage() {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    ...modelenceQuery<FullNote>('voice.getNote', { noteId }),
    enabled: !!noteId,
  });

  const [note, setNote] = useState<GeneratedNote | null>(null);
  const [meetingNote, setMeetingNote] = useState<GeneratedMeetingNote | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstLoad = useRef(true);
  const isMeeting = data?.mode === 'meeting';

  useEffect(() => {
    if (data && isFirstLoad.current) {
      if (data.mode === 'meeting') {
        setMeetingNote({
          title: data.title,
          tags: data.tags ?? [],
          summary: data.summary ?? '',
          attendees: data.attendees ?? [],
          keyConcepts: data.keyConcepts ?? [],
          actionItems: data.actionItems ?? [],
          decisions: data.decisions ?? [],
          followUps: data.followUps ?? [],
          additionalContext: data.additionalContext,
        });
      } else {
        const { _id, mode, transcript, createdAt, updatedAt, ...rest } = data;
        setNote(rest);
      }
      isFirstLoad.current = false;
    }
  }, [data]);

  const updateMutation = useMutation({
    ...modelenceMutation('voice.updateNote'),
  });
  const deleteMutation = useMutation({
    ...modelenceMutation('voice.deleteNote'),
  });
  const reuseMutation = useMutation({
    ...modelenceMutation<{ noteId: string }>('voice.reuseRecording'),
  });

  const [showReuse, setShowReuse] = useState(false);
  const [reuseMode, setReuseMode] = useState<StudyMode>('flashcards');
  const isReusing = reuseMutation.isPending;

  async function handleReuse() {
    if (!noteId || !data?.transcript?.trim()) {
      toast.error('This note has no saved transcript to reuse.');
      return;
    }
    try {
      const result = await reuseMutation.mutateAsync({ noteId, mode: reuseMode });
      toast.success('New note created from this recording!');
      isFirstLoad.current = true;
      setNote(null);
      setMeetingNote(null);
      setShowReuse(false);
      navigate(`/notes/${result.noteId}`);
    } catch (err: any) {
      toast.error(err?.message || 'Could not generate a new note. Please try again.');
    }
  }

  function scheduleSave(payload: Record<string, unknown>) {
    setSaveState('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!noteId) return;
      try {
        await updateMutation.mutateAsync({ noteId, ...payload });
        setSaveState('saved');
      } catch (err: any) {
        toast.error(err?.message || 'Could not save changes');
        setSaveState('idle');
      }
    }, 800);
  }

  function handleChange(next: GeneratedNote) {
    setNote(next);
    scheduleSave({ ...next });
  }

  function handleMeetingChange(next: GeneratedMeetingNote) {
    setMeetingNote(next);
    scheduleSave({ ...next });
  }

  async function handleDelete() {
    if (!noteId || !confirm('Delete this note? This cannot be undone.')) return;
    try {
      await deleteMutation.mutateAsync({ noteId });
      toast.success('Note deleted');
      navigate('/notes');
    } catch (err: any) {
      toast.error(err?.message || 'Could not delete note');
    }
  }

  const activeTitle = isMeeting ? meetingNote?.title : note?.title;

  if (isLoading || (!note && !meetingNote)) {
    return (
      <Page className="max-w-3xl mx-auto w-full">
        <div className="space-y-4">
          <div className="h-8 w-1/2 animate-pulse rounded-lg bg-paper-dim" />
          <div className="h-40 animate-pulse rounded-2xl bg-paper-dim" />
        </div>
      </Page>
    );
  }

  const meta = data ? MODE_META[data.mode] : null;

  return (
    <Page seo={{ title: activeTitle ?? 'Note' }} className="max-w-3xl mx-auto w-full">
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Link to="/notes" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Back to notes
          </Link>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-ink-faint">
              {saveState === 'saving' && (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                </>
              )}
              {saveState === 'saved' && (
                <>
                  <Check className="h-3.5 w-3.5 text-success" /> Saved
                </>
              )}
            </span>
            {data?.transcript?.trim() && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Recycle className="h-3.5 w-3.5" />}
                onClick={() => setShowReuse((v) => !v)}
              >
                Reuse
              </Button>
            )}
            <IconButton variant="ghost" color="destructive" size="sm" aria-label="Delete note" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </div>
        </div>

        {meta && (
          <div>
            <Badge color="neutral">{meta.label}</Badge>
          </div>
        )}

        {showReuse && (
          <Card className="animate-slide-up">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold text-ink">
                    Reuse this recording
                  </h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    The original transcript is saved with this note. Pick a style and generate a
                    brand-new note from it — flashcards, exam notes, a study guide, and more.
                  </p>
                </div>
                <IconButton
                  variant="ghost"
                  size="sm"
                  aria-label="Close reuse panel"
                  onClick={() => setShowReuse(false)}
                >
                  <X className="h-4 w-4" />
                </IconButton>
              </div>
              <ModeSelector value={reuseMode} onChange={setReuseMode} />
              <Button
                className="w-full"
                leftIcon={<Sparkles className="h-4 w-4" />}
                loading={isReusing}
                onClick={handleReuse}
              >
                {isReusing ? 'Generating...' : `Generate ${MODE_META[reuseMode].label}`}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            {isMeeting && meetingNote ? (
              <MeetingNoteView note={meetingNote} onChange={handleMeetingChange} />
            ) : note ? (
              <NoteView note={note} onChange={handleChange} />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
