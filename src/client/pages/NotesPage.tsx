import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelenceQuery, modelenceMutation, createQueryKey } from '@modelence/react-query';
import { toast } from 'react-hot-toast';
import { Search, Plus, Copy, Trash2, FileText, ArrowUpDown } from 'lucide-react';
import Page from '@/client/components/Page';
import { Card, CardContent } from '@/client/components/ui/Card';
import { Button } from '@/client/components/ui/Button';
import { IconButton } from '@/client/components/ui/IconButton';
import { Input } from '@/client/components/ui/Input';
import { Badge } from '@/client/components/ui/Badge';
import { MODE_META } from '@/client/features/voice/modes';
import type { NoteSummary } from '@/client/features/voice/types';

type SortKey = 'updated' | 'created' | 'title';

export default function NotesPage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('updated');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(modelenceQuery<NoteSummary[]>('voice.getNotes'));

  const deleteMutation = useMutation({
    ...modelenceMutation('voice.deleteNote'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: createQueryKey('voice.getNotes') }),
  });
  const duplicateMutation = useMutation({
    ...modelenceMutation('voice.duplicateNote'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: createQueryKey('voice.getNotes') }),
  });

  const notes = useMemo(() => {
    const list = (data ?? []).filter((n) => {
      const q = search.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.subject?.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
    return list.sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title);
      if (sort === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [data, search, sort]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this note? This cannot be undone.')) return;
    try {
      await deleteMutation.mutateAsync({ noteId: id });
      toast.success('Note deleted');
    } catch (err: any) {
      toast.error(err?.message || 'Could not delete note');
    }
  }

  async function handleDuplicate(id: string) {
    try {
      await duplicateMutation.mutateAsync({ noteId: id });
      toast.success('Note duplicated');
    } catch (err: any) {
      toast.error(err?.message || 'Could not duplicate note');
    }
  }

  return (
    <Page seo={{ title: 'My Notes' }} className="max-w-4xl mx-auto w-full">
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">My Notes</h1>
            <p className="mt-1 text-sm text-ink-soft">All your voice notes, organized in one place.</p>
          </div>
          <Link to="/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>New Note</Button>
          </Link>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <Input
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-ink-faint" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <option value="updated">Recently updated</option>
              <option value="created">Recently created</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-paper-dim" />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-dark">
                <FileText className="h-6 w-6" />
              </span>
              <p className="font-display text-lg text-ink">
                {search ? 'No notes match your search' : 'No notes yet'}
              </p>
              <p className="max-w-sm text-sm text-ink-soft">
                {search
                  ? 'Try a different search term.'
                  : 'Record your first voice note and let AI turn it into organized study material.'}
              </p>
              {!search && (
                <Link to="/new">
                  <Button leftIcon={<Plus className="h-4 w-4" />}>Create your first note</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {notes.map((note) => {
              const meta = MODE_META[note.mode];
              const Icon = meta.icon;
              return (
                <Card key={note._id} className="group relative transition-shadow hover:shadow-md animate-slide-up-sm">
                  <CardContent className="p-5">
                    <Link to={`/notes/${note._id}`} className="block">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-paper-dim text-ink-soft">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <Badge color="neutral">{meta.label}</Badge>
                      </div>
                      <h3 className="font-display text-base font-semibold text-ink line-clamp-1">{note.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{note.summary}</p>
                    </Link>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-ink-faint">
                        {new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <IconButton
                          variant="ghost"
                          size="sm"
                          aria-label="Duplicate"
                          onClick={() => handleDuplicate(note._id)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </IconButton>
                        <IconButton
                          variant="ghost"
                          color="destructive"
                          size="sm"
                          aria-label="Delete"
                          onClick={() => handleDelete(note._id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </IconButton>
                      </div>
                    </div>
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
