import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelenceQuery, modelenceMutation, createQueryKey } from '@modelence/react-query';
import { toast } from 'react-hot-toast';
import { Plus, StickyNote, AlertCircle, Loader2, PenLine } from 'lucide-react';
import Page from '@/client/components/Page';
import { Button } from '@/client/components/ui/Button';
import { Textarea } from '@/client/components/ui/Textarea';
import { Card, CardContent } from '@/client/components/ui/Card';
import MicButton from '@/client/features/voice/MicButton';
import Waveform from '@/client/features/voice/Waveform';
import StickyCard from '@/client/features/voice/StickyCard';
import { useVoiceRecorder } from '@/client/features/voice/useVoiceRecorder';
import { transcribeWavInChunks } from '@/client/lib/wav';
import type { Sticky } from '@/client/features/voice/stickyTypes';

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type CaptureState = 'idle' | 'processing';

export default function StickyBoardPage() {
  const queryClient = useQueryClient();
  const recorder = useVoiceRecorder();
  const [captureState, setCaptureState] = useState<CaptureState>('idle');
  const [showTypeIn, setShowTypeIn] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: stickies, isLoading } = useQuery(modelenceQuery<Sticky[]>('voice.getStickies'));

  const transcribeMutation = useMutation({
    ...modelenceMutation<{ transcript: string }>('voice.transcribeAudio'),
  });
  const generateMutation = useMutation({
    ...modelenceMutation<{ stickyIds: string[]; count: number }>('voice.generateStickies'),
  });
  const createMutation = useMutation({ ...modelenceMutation<{ stickyId: string }>('voice.createSticky') });
  const updateMutation = useMutation({ ...modelenceMutation('voice.updateSticky') });
  const deleteMutation = useMutation({ ...modelenceMutation('voice.deleteSticky') });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: createQueryKey('voice.getStickies') });
  }, [queryClient]);

  async function generateFromTranscript(transcript: string) {
    const result = await generateMutation.mutateAsync({ transcript });
    invalidate();
    toast.success(result.count === 1 ? 'Created 1 list' : `Created ${result.count} lists`);
  }

  const handleStop = useCallback(async () => {
    const blob = await recorder.stop();
    if (!blob) {
      toast.error("We couldn't capture that recording. Please try again.");
      return;
    }
    setCaptureState('processing');
    setError(null);
    try {
      const transcript = await transcribeWavInChunks(blob, (audioBase64) =>
        transcribeMutation.mutateAsync({ audioBase64 })
      );
      await generateFromTranscript(transcript);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setCaptureState('idle');
      recorder.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder, transcribeMutation]);

  async function handleTypedGenerate() {
    if (!typedText.trim()) return;
    setCaptureState('processing');
    setError(null);
    try {
      await generateFromTranscript(typedText);
      setTypedText('');
      setShowTypeIn(false);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setCaptureState('idle');
    }
  }

  async function handleCreateBlank() {
    try {
      await createMutation.mutateAsync({});
      invalidate();
    } catch (err: any) {
      toast.error(err?.message || 'Could not create a list.');
    }
  }

  // Optimistic local patching for smooth checkbox/typing UX
  function handleUpdate(stickyId: string, patch: Partial<Pick<Sticky, 'title' | 'color' | 'items' | 'pinned'>>) {
    queryClient.setQueryData(createQueryKey('voice.getStickies'), (prev: Sticky[] | undefined) =>
      prev?.map((s) => (s._id === stickyId ? { ...s, ...patch } : s))
    );
    updateMutation.mutate(
      { stickyId, ...patch },
      {
        onError: (err: any) => {
          toast.error(err?.message || 'Could not save changes');
          invalidate();
        },
      }
    );
  }

  async function handleDelete(stickyId: string) {
    if (!confirm('Delete this list?')) return;
    queryClient.setQueryData(createQueryKey('voice.getStickies'), (prev: Sticky[] | undefined) =>
      prev?.filter((s) => s._id !== stickyId)
    );
    try {
      await deleteMutation.mutateAsync({ stickyId });
    } catch (err: any) {
      toast.error(err?.message || 'Could not delete the list');
    } finally {
      invalidate();
    }
  }

  const pinned = (stickies ?? []).filter((s) => s.pinned);
  const others = (stickies ?? []).filter((s) => !s.pinned);
  const recording = recorder.status === 'recording';

  return (
    <Page seo={{ title: 'Sticky Notes' }} className="max-w-5xl mx-auto w-full">
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-ink">Sticky Notes</h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs font-medium text-ink-soft">
                <StickyNote className="h-3 w-3" /> Lists
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-soft">
              Speak your thoughts — AI splits them into clean, checkable lists.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<PenLine className="h-3.5 w-3.5" />} onClick={() => setShowTypeIn((v) => !v)}>
              Type instead
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={handleCreateBlank}>
              Blank list
            </Button>
          </div>
        </div>

        {(error || recorder.error) && (
          <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error || recorder.error}</span>
          </div>
        )}

        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-6 sm:p-8">
            {captureState === 'processing' ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <Loader2 className="h-8 w-8 animate-spin text-ink" />
                <p className="text-sm text-ink-soft">Turning your words into lists...</p>
              </div>
            ) : (
              <>
                <MicButton
                  size="md"
                  recording={recording}
                  requesting={recorder.status === 'requesting'}
                  onClick={() => {
                    if (recording) {
                      handleStop();
                    } else {
                      setError(null);
                      recorder.start();
                    }
                  }}
                />
                <div className="text-center">
                  {recording ? (
                    <>
                      <p className="font-mono text-base text-ink">{formatTime(recorder.seconds)}</p>
                      <p className="mt-0.5 text-sm text-ink-soft">Listening... tap to stop</p>
                    </>
                  ) : (
                    <p className="text-sm text-ink-soft">
                      Tap and say things like "buy milk and eggs, call the dentist, plan the weekend trip"
                    </p>
                  )}
                </div>
                {recording && <Waveform levels={recorder.levels} />}

                {showTypeIn && (
                  <div className="w-full max-w-xl space-y-3 pt-2 animate-slide-up-sm">
                    <Textarea
                      rows={4}
                      placeholder="Type or paste your thoughts here..."
                      value={typedText}
                      onChange={(e) => setTypedText(e.target.value)}
                    />
                    <Button className="w-full" onClick={handleTypedGenerate} disabled={!typedText.trim()}>
                      Make lists
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-paper-dim" />
            ))}
          </div>
        ) : (stickies ?? []).length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-dim text-ink-faint">
              <StickyNote className="h-5 w-5" />
            </span>
            <p className="text-sm text-ink-soft">No lists yet — record something or create a blank list.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pinned.length > 0 && (
              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">Pinned</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pinned.map((sticky) => (
                    <StickyCard key={sticky._id} sticky={sticky} onUpdate={handleUpdate} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            )}
            {others.length > 0 && (
              <div>
                {pinned.length > 0 && (
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">Others</h2>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {others.map((sticky) => (
                    <StickyCard key={sticky._id} sticky={sticky} onUpdate={handleUpdate} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Page>
  );
}
