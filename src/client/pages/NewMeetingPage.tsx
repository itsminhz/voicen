import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { modelenceMutation } from '@modelence/react-query';
import { toast } from 'react-hot-toast';
import { Mic, PenLine, RefreshCcw, ArrowRight, Save, AlertCircle, Users } from 'lucide-react';
import Page from '@/client/components/Page';
import { Card, CardContent } from '@/client/components/ui/Card';
import { Button } from '@/client/components/ui/Button';
import { Textarea } from '@/client/components/ui/Textarea';
import MicButton from '@/client/features/voice/MicButton';
import Waveform from '@/client/features/voice/Waveform';
import ProcessingStage, { type ProcessingPhase } from '@/client/features/voice/ProcessingStage';
import MeetingNoteView from '@/client/features/voice/MeetingNoteView';
import { useVoiceRecorder } from '@/client/features/voice/useVoiceRecorder';
import { transcribeWavInChunks } from '@/client/lib/wav';
import type { GeneratedMeetingNote } from '@/client/features/voice/types';

type Step = 'record' | 'transcript' | 'processing' | 'preview';

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function NewMeetingPage() {
  const navigate = useNavigate();
  const recorder = useVoiceRecorder();
  const [step, setStep] = useState<Step>('record');
  const [inputTab, setInputTab] = useState<'speak' | 'type'>('speak');
  const [transcript, setTranscript] = useState('');
  const [phase, setPhase] = useState<ProcessingPhase>('transcribing');
  const [note, setNote] = useState<GeneratedMeetingNote | null>(null);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);

  const transcribeMutation = useMutation({
    ...modelenceMutation<{ transcript: string }>('voice.transcribeAudio'),
  });
  const generateMutation = useMutation({
    ...modelenceMutation<GeneratedMeetingNote>('voice.generateMeetingNote'),
  });
  const saveMutation = useMutation({
    ...modelenceMutation<{ noteId: string }>('voice.saveNote'),
  });

  const handleStop = useCallback(async () => {
    const blob = await recorder.stop();
    if (!blob) {
      toast.error("We couldn't capture that recording. Please try again.");
      return;
    }
    setStep('processing');
    setPhase('transcribing');
    try {
      const fullTranscript = await transcribeWavInChunks(blob, (audioBase64) =>
        transcribeMutation.mutateAsync({ audioBase64 })
      );
      setTranscript(fullTranscript);
      setStep('transcript');
      setTranscribeError(null);
    } catch (err: any) {
      setTranscribeError(err?.message || 'Transcription failed. Please try again.');
      setStep('record');
      recorder.reset();
    }
  }, [recorder, transcribeMutation]);

  async function handleGenerate() {
    if (!transcript.trim()) {
      toast.error('Please add a conversation transcript before generating.');
      return;
    }
    setStep('processing');
    setPhase('organizing');
    try {
      const result = await generateMutation.mutateAsync({ transcript });
      setNote(result);
      setStep('preview');
    } catch (err: any) {
      toast.error(err?.message || 'Could not generate meeting notes. Please try again.');
      setStep('transcript');
    }
  }

  async function handleSave() {
    if (!note) return;
    setPhase('saving');
    try {
      const result = await saveMutation.mutateAsync({ ...note, mode: 'meeting', transcript });
      toast.success('Meeting notes saved!');
      navigate(`/notes/${result.noteId}`);
    } catch (err: any) {
      toast.error(err?.message || 'Could not save the meeting notes. Please try again.');
    }
  }

  function startOver() {
    recorder.reset();
    setTranscript('');
    setNote(null);
    setTranscribeError(null);
    setStep('record');
  }

  return (
    <Page seo={{ title: 'New Meeting Note' }} className="max-w-3xl mx-auto w-full">
      <div className="space-y-6 animate-fade-in">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-ink">New Meeting Note</h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs font-medium text-ink-soft">
              <Users className="h-3 w-3" /> Meetings
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            Record the conversation — AI extracts the summary, action items and key decisions.
          </p>
        </div>

        {step === 'record' && (
          <Card>
            <CardContent className="p-6 sm:p-10">
              <div className="mb-6 flex justify-center gap-1 rounded-xl bg-paper-dim p-1">
                <button
                  type="button"
                  onClick={() => setInputTab('speak')}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                    inputTab === 'speak' ? 'bg-surface text-ink shadow-sm' : 'text-ink-soft'
                  }`}
                >
                  <Mic className="mr-1.5 inline h-4 w-4" /> Record
                </button>
                <button
                  type="button"
                  onClick={() => setInputTab('type')}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                    inputTab === 'type' ? 'bg-surface text-ink shadow-sm' : 'text-ink-soft'
                  }`}
                >
                  <PenLine className="mr-1.5 inline h-4 w-4" /> Paste transcript
                </button>
              </div>

              {transcribeError && (
                <div className="mb-6 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{transcribeError}</span>
                </div>
              )}

              {recorder.error && (
                <div className="mb-6 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{recorder.error}</span>
                </div>
              )}

              {inputTab === 'speak' ? (
                <div className="flex flex-col items-center gap-6 py-6">
                  <MicButton
                    recording={recorder.status === 'recording'}
                    requesting={recorder.status === 'requesting'}
                    onClick={() => {
                      if (recorder.status === 'recording') {
                        handleStop();
                      } else {
                        recorder.start();
                      }
                    }}
                  />
                  <div className="text-center">
                    {recorder.status === 'recording' ? (
                      <>
                        <p className="font-mono text-lg text-ink">{formatTime(recorder.seconds)}</p>
                        <p className="mt-1 text-sm text-ink-soft">Recording the conversation... tap to stop</p>
                      </>
                    ) : recorder.status === 'requesting' ? (
                      <p className="text-sm text-ink-soft">Requesting microphone access...</p>
                    ) : (
                      <p className="text-sm text-ink-soft">
                        Tap to record — place the device where it can hear everyone
                      </p>
                    )}
                  </div>
                  {recorder.status === 'recording' && <Waveform levels={recorder.levels} />}
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  <Textarea
                    rows={8}
                    placeholder="Paste a meeting transcript or type what was discussed..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                  />
                  <Button
                    className="w-full"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    onClick={() => setStep('transcript')}
                    disabled={!transcript.trim()}
                  >
                    Continue
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 'processing' && <ProcessingStage phase={phase} />}

        {step === 'transcript' && (
          <div className="space-y-6 animate-slide-up">
            <Card>
              <CardContent className="space-y-3 p-6">
                <h2 className="text-lg font-semibold text-ink">Review the transcript</h2>
                <Textarea
                  rows={10}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="leading-relaxed"
                />
                <Button variant="ghost" size="sm" leftIcon={<RefreshCcw className="h-3.5 w-3.5" />} onClick={startOver}>
                  Start over
                </Button>
              </CardContent>
            </Card>

            <Button className="w-full" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />} onClick={handleGenerate}>
              Generate Meeting Notes
            </Button>
          </div>
        )}

        {step === 'preview' && note && (
          <div className="space-y-6 animate-slide-up">
            <Card>
              <CardContent className="p-6">
                <MeetingNoteView note={note} onChange={setNote} />
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" leftIcon={<RefreshCcw className="h-4 w-4" />} onClick={startOver}>
                Start Over
              </Button>
              <Button
                className="flex-1"
                leftIcon={<Save className="h-4 w-4" />}
                loading={saveMutation.isPending}
                onClick={handleSave}
              >
                Save Meeting Notes
              </Button>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}
