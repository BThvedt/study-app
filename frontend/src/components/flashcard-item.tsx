'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import type { JsonApiResource } from '@/lib/drupal';

interface FlashcardItemProps {
  card: JsonApiResource;
  index: number;
  onUpdated?: (card: JsonApiResource) => void;
  onDeleted?: (cardId: string) => void;
}

export function FlashcardItem({ card, index, onUpdated, onDeleted }: FlashcardItemProps) {
  const [flipped, setFlipped] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const frontRef = useRef<HTMLTextAreaElement>(null);

  const front = card.attributes.field_front as string;
  const back = card.attributes.field_back as string;

  function startEditing(e: React.MouseEvent) {
    e.stopPropagation();
    setEditFront(front);
    setEditBack(back);
    setEditing(true);
    setDeleteConfirm(false);
  }

  function cancelEditing() {
    setEditing(false);
  }

  useEffect(() => {
    if (editing) frontRef.current?.focus();
  }, [editing]);

  async function saveEdit(e: React.MouseEvent | React.FormEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (!editFront.trim() || !editBack.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ front: editFront.trim(), back: editBack.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        onUpdated?.(data.data);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/cards/${card.id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        onDeleted?.(card.id);
      }
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  }

  function cancelDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setDeleteConfirm(false);
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-ring bg-card p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Editing card #{index + 1}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Front</label>
          <textarea
            ref={frontRef}
            value={editFront}
            onChange={(e) => setEditFront(e.target.value)}
            rows={3}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Back</label>
          <textarea
            value={editBack}
            onChange={(e) => setEditBack(e.target.value)}
            rows={3}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={saveEdit}
            disabled={saving || !editFront.trim() || !editBack.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Check className="h-3 w-3" />
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={cancelEditing}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={flipped ? 'Showing answer — click to see question' : 'Showing question — click to see answer'}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setFlipped((f) => !f)}
      className="group relative cursor-pointer select-none rounded-xl border border-border bg-card p-5 transition-colors hover:border-ring/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Action buttons — top-right */}
      <div className="absolute top-3 right-4 flex items-center gap-1">
        {deleteConfirm ? (
          <>
            <span className="text-[11px] text-destructive mr-1">Delete?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-md p-1 text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="Confirm delete"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={cancelDelete}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Cancel delete"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <>
            <span className="text-xs text-muted-foreground tabular-nums mr-1">
              #{index + 1}
            </span>
            <button
              onClick={startEditing}
              className="rounded-md p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted transition-all"
              aria-label="Edit card"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setDeleteConfirm(true); }}
              className="rounded-md p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
              aria-label="Delete card"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Side indicator */}
      <span
        className={cn(
          'mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors',
          flipped
            ? 'bg-primary/10 text-primary'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {flipped ? 'Answer' : 'Question'}
      </span>

      {/* Content */}
      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap pr-16">
        {flipped ? back : front}
      </p>

      {/* Flip hint */}
      <p className="mt-3 text-[11px] text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
        Click to flip
      </p>
    </div>
  );
}
