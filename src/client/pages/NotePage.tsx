import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { modelenceQuery, modelenceMutation } from '@modelence/react-query';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Check, Loader2, Trash2 } from 'lucide-react';
import Page from '@/client/components/Page';
import { Card, CardContent } from '@/client/components/ui/Card';
import { IconButton } from '@/client/components/ui/IconButton';
import { Badge } from '@/client/components/ui/Badge';
import NoteView from '@/client/features/voice/NoteView';
import { MODE_META } from '@/client/features/voice/modes';
import type { FullNote, GeneratedNote } from '@/client/features/voice/types';

export default function NotePage() {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    ...modelenceQuery<FullNote>('voice.getNote', { noteId }),
    enabled: !!noteId,
  });

  const [note, setNote] = useState<GeneratedNote | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (data && isFirstLoad.current) {
      const { _id, mode, transcript, createdAt, updatedAt, ...rest } = data;
      setNote(rest);
      isFirstLoad.current = false;
    }
  }, [data]);

  const updateMutation = useMutation({
    ...modelenceMutation('voice.updateNote'),
  });
  const deleteMutation = useMutation({
    ...modelenceMutation('voice.deleteNote'),
  });

  function handleChange(next: GeneratedNote) {
    setNote(next);
    setSaveState('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!noteId) return;
      try {
        await updateMutation.mutateAsync({ noteId, ...next });
        setSaveState('saved');
      } catch (err: any) {
        toast.error(err?.message || 'Could not save changes');
        setSaveState('idle');
      }
    }, 800);
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

  if (isLoading || !note) {
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
    <Page seo={{ title: note.title }} className="max-w-3xl mx-auto w-full">
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

        <Card>
          <CardContent className="p-6">
            <NoteView note={note} onChange={handleChange} />
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
