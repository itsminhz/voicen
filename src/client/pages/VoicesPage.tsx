import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelenceQuery, modelenceMutation, createQueryKey } from '@modelence/react-query';
import { toast } from 'react-hot-toast';
import { Mic, Plus, Recycle, Sparkles, X, ExternalLink } from 'lucide-react';
import Page from '@/client/components/Page';
import { Card, CardContent } from '@/client/components/ui/Card';
import { Button } from '@/client/components/ui/Button';
import { IconButton } from '@/client/components/ui/IconButton';
import { Badge } from '@/client/components/ui/Badge';
import ModeSelector from '@/client/features/voice/ModeSelector';
import { MODE_META, type NoteMode, type StudyMode } from '@/client/features/voice/modes';

interface Recording {
  _id: string;
  title: string;
  mode: NoteMode;
  transcriptPreview: string;
  wordCount: number;
  createdAt: string | Date;
}

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function VoicesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(modelenceQuery<Recording[]>('voice.getRecordings'));

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reuseMode, setReuseMode] = useState<StudyMode>('flashcards');

  const reuseMutation = useMutation({
    ...modelenceMutation<{ noteId: string }>('voice.reuseRecording'),
  });

  async function handleReuse(recordingId: string) {
    try {
      const result = await reuseMutation.mutateAsync({ noteId: recordingId, mode: reuseMode });
      queryClient.invalidateQueries({ queryKey: createQueryKey('voice.getNotes') });
      toast.success('New note created from this recording!');
      navigate(`/notes/${result.noteId}`);
    } catch (err: any) {
      toast.error(err?.message || 'Could not generate a new note. Please try again.');
    }
  }

  return (
    <Page seo={{ title: 'Voices' }} className="max-w-4xl mx-auto w-full">
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">Voices</h1>
            <p className="mt-1 text-sm text-ink-soft">
              Every recording you've saved. Reuse any of them as flashcards, exam notes, a study
              guide, and more — without recording again.
            </p>
          </div>
          <Link to="/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>New Recording</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-paper-dim" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-dark">
                <Mic className="h-6 w-6" />
              </span>
              <p className="font-display text-lg text-ink">No recordings yet</p>
              <p className="max-w-sm text-sm text-ink-soft">
                Record a voice note and its transcript will be saved here, ready to reuse in any
                style.
              </p>
              <Link to="/new">
                <Button leftIcon={<Mic className="h-4 w-4" />}>Start recording</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {data.map((rec) => {
              const isExpanded = expandedId === rec._id;
              const isReusing = isExpanded && reuseMutation.isPending;
              return (
                <Card key={rec._id} className="transition-shadow hover:shadow-md">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-dark">
                          <Mic className="h-4 w-4" />
                        </span>
                        <div>
                          <Link
                            to={`/notes/${rec._id}`}
                            className="font-display text-base font-semibold text-ink hover:text-accent-dark"
                          >
                            {rec.title}
                          </Link>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-faint">
                            <span>{formatDate(rec.createdAt)}</span>
                            <span>·</span>
                            <span>{rec.wordCount} words</span>
                            <Badge color="neutral">{MODE_META[rec.mode].label}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Link to={`/notes/${rec._id}`}>
                          <IconButton variant="ghost" size="sm" aria-label="Open note">
                            <ExternalLink className="h-4 w-4" />
                          </IconButton>
                        </Link>
                        <Button
                          variant={isExpanded ? 'solid' : 'outline'}
                          size="sm"
                          leftIcon={<Recycle className="h-3.5 w-3.5" />}
                          onClick={() => setExpandedId(isExpanded ? null : rec._id)}
                        >
                          Reuse
                        </Button>
                      </div>
                    </div>

                    <p className="line-clamp-2 text-sm leading-relaxed text-ink-soft">
                      {rec.transcriptPreview}
                    </p>

                    {isExpanded && (
                      <div className="space-y-4 rounded-2xl border border-line-soft bg-paper-dim/40 p-4 animate-slide-up">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm text-ink-soft">
                            Pick a style — Voicen will generate a brand-new note from this
                            recording's transcript.
                          </p>
                          <IconButton
                            variant="ghost"
                            size="sm"
                            aria-label="Close reuse panel"
                            onClick={() => setExpandedId(null)}
                          >
                            <X className="h-4 w-4" />
                          </IconButton>
                        </div>
                        <ModeSelector value={reuseMode} onChange={setReuseMode} />
                        <Button
                          className="w-full"
                          leftIcon={<Sparkles className="h-4 w-4" />}
                          loading={isReusing}
                          onClick={() => handleReuse(rec._id)}
                        >
                          {isReusing ? 'Generating...' : `Generate ${MODE_META[reuseMode].label}`}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Page>
  );
}
