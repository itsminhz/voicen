import { useState } from 'react';
import {
  Users,
  ListTodo,
  Gavel,
  MessageCircleQuestion,
  AlignLeft,
  Hash,
  Plus,
  X,
  Info,
} from 'lucide-react';
import { cn } from '@/client/lib/utils';
import { Textarea } from '@/client/components/ui/Textarea';
import { Input } from '@/client/components/ui/Input';
import type { GeneratedMeetingNote, ActionItem } from './types';

interface MeetingNoteViewProps {
  note: GeneratedMeetingNote;
  onChange: (next: GeneratedMeetingNote) => void;
}

export default function MeetingNoteView({ note, onChange }: MeetingNoteViewProps) {
  const doneCount = note.actionItems.filter((item) => item.done).length;

  function patch(partial: Partial<GeneratedMeetingNote>) {
    onChange({ ...note, ...partial });
  }

  return (
    <div className="space-y-8">
      <div>
        <input
          value={note.title}
          onChange={(e) => patch({ title: e.target.value })}
          className="w-full bg-transparent text-2xl font-bold tracking-tight text-ink outline-none placeholder:text-ink-faint"
          placeholder="Meeting title"
        />
        {note.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {note.tags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-paper-dim px-2.5 py-0.5 text-xs font-medium text-ink-soft"
              >
                <Hash className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <Section icon={AlignLeft} title="Summary">
        <Textarea
          value={note.summary}
          onChange={(e) => patch({ summary: e.target.value })}
          rows={4}
          className="w-full"
        />
      </Section>

      <Section icon={Users} title="Attendees">
        <ChipListEditor
          items={note.attendees}
          placeholder="Add attendee"
          emptyLabel="No attendees identified."
          onChange={(attendees) => patch({ attendees })}
        />
      </Section>

      <Section
        icon={ListTodo}
        title="Action Items"
        badge={note.actionItems.length > 0 ? `${doneCount}/${note.actionItems.length} done` : undefined}
      >
        <ActionItemsEditor items={note.actionItems} onChange={(actionItems) => patch({ actionItems })} />
      </Section>

      <Section icon={Gavel} title="Key Decisions">
        <ListEditor
          items={note.decisions}
          placeholder="Add decision"
          emptyLabel="No decisions were recorded."
          onChange={(decisions) => patch({ decisions })}
        />
      </Section>

      <Section icon={AlignLeft} title="Topics Discussed">
        <ChipListEditor
          items={note.keyConcepts}
          placeholder="Add topic"
          emptyLabel="No topics recorded."
          onChange={(keyConcepts) => patch({ keyConcepts })}
        />
      </Section>

      <Section icon={MessageCircleQuestion} title="Follow-ups">
        <ListEditor
          items={note.followUps}
          placeholder="Add follow-up"
          emptyLabel="No open follow-ups."
          onChange={(followUps) => patch({ followUps })}
        />
      </Section>

      {note.additionalContext && (
        <Section icon={Info} title="Additional Context">
          <p className="rounded-lg bg-paper-dim p-3 text-sm leading-relaxed text-ink-soft">{note.additionalContext}</p>
        </Section>
      )}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  badge,
  children,
}: {
  icon: typeof Users;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="animate-slide-up-sm">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-paper-dim text-ink-soft">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {badge && (
          <span className="rounded-full bg-paper-dim px-2 py-0.5 text-xs font-medium text-ink-soft">{badge}</span>
        )}
      </div>
      {children}
    </section>
  );
}

function ActionItemsEditor({ items, onChange }: { items: ActionItem[]; onChange: (items: ActionItem[]) => void }) {
  const [draft, setDraft] = useState('');

  function update(index: number, partial: Partial<ActionItem>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...partial } : item)));
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function add() {
    const text = draft.trim();
    if (!text) return;
    onChange([...items, { text, done: false }]);
    setDraft('');
  }

  return (
    <div className="space-y-1.5">
      {items.length === 0 && <p className="text-sm text-ink-faint">No action items were identified.</p>}
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            'group flex items-start gap-3 rounded-lg border border-line bg-surface px-3 py-2.5 transition-colors',
            item.done && 'bg-paper-dim/60'
          )}
        >
          <button
            type="button"
            onClick={() => update(i, { done: !item.done })}
            aria-label={item.done ? 'Mark as not done' : 'Mark as done'}
            className={cn(
              'mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-all duration-150',
              item.done ? 'border-ink bg-ink text-surface' : 'border-line hover:border-ink-faint'
            )}
          >
            {item.done && (
              <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2.5 6.5L5 9l4.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <div className="min-w-0 flex-1">
            <input
              value={item.text}
              onChange={(e) => update(i, { text: e.target.value })}
              className={cn(
                'w-full bg-transparent text-sm text-ink outline-none',
                item.done && 'text-ink-faint line-through'
              )}
            />
            {(item.owner || item.due) && (
              <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-ink-faint">
                {item.owner && <span>@ {item.owner}</span>}
                {item.due && <span>Due: {item.due}</span>}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="Remove action item"
            className="mt-0.5 text-ink-faint opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Add an action item…"
          className="flex-1"
        />
        <button
          type="button"
          onClick={add}
          aria-label="Add action item"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ink-soft transition-colors hover:bg-paper-dim"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ListEditor({
  items,
  placeholder,
  emptyLabel,
  onChange,
}: {
  items: string[];
  placeholder: string;
  emptyLabel: string;
  onChange: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState('');

  function add() {
    const value = draft.trim();
    if (!value) return;
    onChange([...items, value]);
    setDraft('');
  }

  return (
    <div className="space-y-1.5">
      {items.length === 0 && <p className="text-sm text-ink-faint">{emptyLabel}</p>}
      {items.map((item, i) => (
        <div key={i} className="group flex items-start gap-2 rounded-lg border border-line bg-surface px-3 py-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-faint" />
          <input
            value={item}
            onChange={(e) => onChange(items.map((v, idx) => (idx === i ? e.target.value : v)))}
            className="w-full bg-transparent text-sm text-ink outline-none"
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            aria-label="Remove item"
            className="mt-0.5 text-ink-faint opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1"
        />
        <button
          type="button"
          onClick={add}
          aria-label="Add item"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ink-soft transition-colors hover:bg-paper-dim"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ChipListEditor({
  items,
  placeholder,
  emptyLabel,
  onChange,
}: {
  items: string[];
  placeholder: string;
  emptyLabel: string;
  onChange: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState('');

  function add() {
    const value = draft.trim();
    if (!value) return;
    onChange([...items, value]);
    setDraft('');
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {items.length === 0 && <p className="text-sm text-ink-faint">{emptyLabel}</p>}
        {items.map((item, i) => (
          <span
            key={i}
            className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-sm text-ink"
          >
            {item}
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              aria-label={`Remove ${item}`}
              className="text-ink-faint transition-colors hover:text-danger"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="max-w-56"
        />
        <button
          type="button"
          onClick={add}
          aria-label="Add"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ink-soft transition-colors hover:bg-paper-dim"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
