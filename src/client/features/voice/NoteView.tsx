import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/client/components/ui/Input';
import { Textarea } from '@/client/components/ui/Textarea';
import { IconButton } from '@/client/components/ui/IconButton';
import { Button } from '@/client/components/ui/Button';
import { Badge } from '@/client/components/ui/Badge';
import FlashcardDeck from './FlashcardDeck';
import type { GeneratedNote } from './types';

interface NoteViewProps {
  note: GeneratedNote;
  onChange?: (note: GeneratedNote) => void;
  readOnly?: boolean;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      {children}
    </div>
  );
}

function ListEditor({
  items,
  onChange,
  readOnly,
  placeholder,
}: {
  items: string[];
  onChange?: (items: string[]) => void;
  readOnly?: boolean;
  placeholder?: string;
}) {
  if (readOnly) {
    if (items.length === 0) return null;
    return (
      <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-soft">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <Textarea
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange?.(next);
            }}
            rows={1}
            className="min-h-9 flex-1 py-2"
          />
          <IconButton
            variant="ghost"
            color="destructive"
            size="sm"
            aria-label="Remove item"
            onClick={() => onChange?.(items.filter((_, idx) => idx !== i))}
          >
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={() => onChange?.([...items, ''])} leftIcon={<Plus className="h-3.5 w-3.5" />}>
        {placeholder ?? 'Add item'}
      </Button>
    </div>
  );
}

export default function NoteView({ note, onChange, readOnly = false }: NoteViewProps) {
  function update<K extends keyof GeneratedNote>(key: K, value: GeneratedNote[K]) {
    onChange?.({ ...note, [key]: value });
  }

  return (
    <div className="space-y-8">
      {!readOnly ? (
        <Input
          value={note.title}
          onChange={(e) => update('title', e.target.value)}
          className="font-display text-xl font-semibold h-auto py-3"
          placeholder="Note title"
        />
      ) : (
        <h2 className="font-display text-2xl font-semibold text-ink">{note.title}</h2>
      )}

      {(note.subject || note.tags?.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {note.subject && <Badge color="primary">{note.subject}</Badge>}
          {note.tags?.map((tag) => (
            <Badge key={tag} color="neutral">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {(note.summary || !readOnly) && (
        <Section title="Quick Summary">
          {readOnly ? (
            <p className="text-sm leading-relaxed text-ink-soft">{note.summary}</p>
          ) : (
            <Textarea value={note.summary} onChange={(e) => update('summary', e.target.value)} rows={3} />
          )}
        </Section>
      )}

      {note.keyConcepts?.length > 0 && (
        <Section title="Key Concepts">
          <ListEditor items={note.keyConcepts} onChange={(v) => update('keyConcepts', v)} readOnly={readOnly} placeholder="Add concept" />
        </Section>
      )}

      {note.detailedNotes?.length > 0 && (
        <Section title="Detailed Notes">
          <div className="space-y-4">
            {note.detailedNotes.map((section, i) => (
              <div key={i} className="rounded-xl border border-line-soft bg-paper-dim/50 p-4">
                {readOnly ? (
                  <>
                    <h4 className="mb-1 text-sm font-semibold text-ink">{section.heading}</h4>
                    <p className="text-sm leading-relaxed text-ink-soft whitespace-pre-line">{section.content}</p>
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Input
                        value={section.heading}
                        onChange={(e) => {
                          const next = [...note.detailedNotes];
                          next[i] = { ...next[i], heading: e.target.value };
                          update('detailedNotes', next);
                        }}
                        placeholder="Heading"
                        className="font-semibold"
                      />
                      <IconButton
                        variant="ghost"
                        color="destructive"
                        size="sm"
                        aria-label="Remove section"
                        onClick={() => update('detailedNotes', note.detailedNotes.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                    <Textarea
                      value={section.content}
                      onChange={(e) => {
                        const next = [...note.detailedNotes];
                        next[i] = { ...next[i], content: e.target.value };
                        update('detailedNotes', next);
                      }}
                      rows={3}
                    />
                  </div>
                )}
              </div>
            ))}
            {!readOnly && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => update('detailedNotes', [...note.detailedNotes, { heading: '', content: '' }])}
              >
                Add section
              </Button>
            )}
          </div>
        </Section>
      )}

      {note.definitions?.length > 0 && (
        <Section title="Important Definitions">
          <div className="space-y-2">
            {note.definitions.map((def, i) => (
              <div key={i} className="rounded-xl border border-line-soft bg-surface p-3">
                {readOnly ? (
                  <p className="text-sm">
                    <span className="font-semibold text-ink">{def.term}:</span>{' '}
                    <span className="text-ink-soft">{def.definition}</span>
                  </p>
                ) : (
                  <div className="flex items-start gap-2">
                    <Input
                      value={def.term}
                      onChange={(e) => {
                        const next = [...note.definitions];
                        next[i] = { ...next[i], term: e.target.value };
                        update('definitions', next);
                      }}
                      placeholder="Term"
                      className="w-1/3 font-semibold"
                    />
                    <Input
                      value={def.definition}
                      onChange={(e) => {
                        const next = [...note.definitions];
                        next[i] = { ...next[i], definition: e.target.value };
                        update('definitions', next);
                      }}
                      placeholder="Definition"
                      className="flex-1"
                    />
                    <IconButton
                      variant="ghost"
                      color="destructive"
                      size="sm"
                      aria-label="Remove definition"
                      onClick={() => update('definitions', note.definitions.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                )}
              </div>
            ))}
            {!readOnly && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => update('definitions', [...note.definitions, { term: '', definition: '' }])}
              >
                Add definition
              </Button>
            )}
          </div>
        </Section>
      )}

      {note.formulas?.length > 0 && (
        <Section title="Formulas">
          <div className="space-y-2">
            {note.formulas.map((f, i) => (
              <div key={i} className="rounded-xl border border-line-soft bg-surface p-3">
                {readOnly ? (
                  <div>
                    <p className="font-mono text-sm font-semibold text-ink">{f.formula}</p>
                    {f.description && <p className="mt-0.5 text-xs text-ink-soft">{f.description}</p>}
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <Input
                      value={f.formula}
                      onChange={(e) => {
                        const next = [...note.formulas];
                        next[i] = { ...next[i], formula: e.target.value };
                        update('formulas', next);
                      }}
                      placeholder="Formula"
                      className="w-1/3 font-mono"
                    />
                    <Input
                      value={f.description ?? ''}
                      onChange={(e) => {
                        const next = [...note.formulas];
                        next[i] = { ...next[i], description: e.target.value };
                        update('formulas', next);
                      }}
                      placeholder="Description (optional)"
                      className="flex-1"
                    />
                    <IconButton
                      variant="ghost"
                      color="destructive"
                      size="sm"
                      aria-label="Remove formula"
                      onClick={() => update('formulas', note.formulas.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                )}
              </div>
            ))}
            {!readOnly && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => update('formulas', [...note.formulas, { formula: '', description: '' }])}
              >
                Add formula
              </Button>
            )}
          </div>
        </Section>
      )}

      {note.examples?.length > 0 && (
        <Section title="Examples">
          <ListEditor items={note.examples} onChange={(v) => update('examples', v)} readOnly={readOnly} placeholder="Add example" />
        </Section>
      )}

      {note.importantPoints?.length > 0 && (
        <Section title="Important Points">
          <ListEditor
            items={note.importantPoints}
            onChange={(v) => update('importantPoints', v)}
            readOnly={readOnly}
            placeholder="Add point"
          />
        </Section>
      )}

      {note.examFocus?.length > 0 && (
        <Section title="Exam Focus">
          <ListEditor items={note.examFocus} onChange={(v) => update('examFocus', v)} readOnly={readOnly} placeholder="Add focus area" />
        </Section>
      )}

      {note.questionsToReview?.length > 0 && (
        <Section title="Questions to Review">
          <ListEditor
            items={note.questionsToReview}
            onChange={(v) => update('questionsToReview', v)}
            readOnly={readOnly}
            placeholder="Add question"
          />
        </Section>
      )}

      {note.flashcards?.length > 0 && (
        <Section title="Flashcards">
          {readOnly ? (
            <FlashcardDeck cards={note.flashcards} />
          ) : (
            <div className="space-y-2">
              {note.flashcards.map((card, i) => (
                <div key={i} className="flex items-start gap-2 rounded-xl border border-line-soft bg-surface p-3">
                  <Input
                    value={card.question}
                    onChange={(e) => {
                      const next = [...note.flashcards];
                      next[i] = { ...next[i], question: e.target.value };
                      update('flashcards', next);
                    }}
                    placeholder="Question"
                    className="flex-1"
                  />
                  <Input
                    value={card.answer}
                    onChange={(e) => {
                      const next = [...note.flashcards];
                      next[i] = { ...next[i], answer: e.target.value };
                      update('flashcards', next);
                    }}
                    placeholder="Answer"
                    className="flex-1"
                  />
                  <IconButton
                    variant="ghost"
                    color="destructive"
                    size="sm"
                    aria-label="Remove flashcard"
                    onClick={() => update('flashcards', note.flashcards.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              ))}
            </div>
          )}
          {!readOnly && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => update('flashcards', [...note.flashcards, { question: '', answer: '' }])}
            >
              Add flashcard
            </Button>
          )}
        </Section>
      )}

      {!readOnly && (
        <div className="flex flex-wrap gap-2 border-t border-line-soft pt-4">
          {note.keyConcepts?.length === 0 && (
            <Button variant="ghost" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => update('keyConcepts', [''])}>
              Key Concepts
            </Button>
          )}
          {note.detailedNotes?.length === 0 && (
            <Button variant="ghost" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => update('detailedNotes', [{ heading: '', content: '' }])}>
              Detailed Notes
            </Button>
          )}
          {note.definitions?.length === 0 && (
            <Button variant="ghost" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => update('definitions', [{ term: '', definition: '' }])}>
              Definitions
            </Button>
          )}
          {note.formulas?.length === 0 && (
            <Button variant="ghost" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => update('formulas', [{ formula: '', description: '' }])}>
              Formulas
            </Button>
          )}
          {note.examples?.length === 0 && (
            <Button variant="ghost" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => update('examples', [''])}>
              Examples
            </Button>
          )}
          {note.importantPoints?.length === 0 && (
            <Button variant="ghost" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => update('importantPoints', [''])}>
              Important Points
            </Button>
          )}
          {note.examFocus?.length === 0 && (
            <Button variant="ghost" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => update('examFocus', [''])}>
              Exam Focus
            </Button>
          )}
          {note.questionsToReview?.length === 0 && (
            <Button variant="ghost" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => update('questionsToReview', [''])}>
              Questions to Review
            </Button>
          )}
          {note.flashcards?.length === 0 && (
            <Button variant="ghost" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => update('flashcards', [{ question: '', answer: '' }])}>
              Flashcards
            </Button>
          )}
        </div>
      )}

      {(note.additionalContext || !readOnly) && (
        <Section title="Additional Context">
          {readOnly ? (
            note.additionalContext && <p className="text-sm italic leading-relaxed text-ink-faint">{note.additionalContext}</p>
          ) : (
            <Textarea
              value={note.additionalContext ?? ''}
              onChange={(e) => update('additionalContext', e.target.value)}
              rows={2}
              placeholder="AI-added context not directly from your transcript..."
            />
          )}
        </Section>
      )}
    </div>
  );
}
