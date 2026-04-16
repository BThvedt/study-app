'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type UnsavedChangesGuardProps = {
  isDirty: boolean;
};

/**
 * Warns before leaving the page when there are unsaved changes: browser tab close/refresh
 * (native prompt) and in-app navigations via same-origin links (modal). Programmatic
 * `router.push` / `router.replace` do not pass through anchor clicks and are not blocked.
 */
export function UnsavedChangesGuard({ isDirty }: UnsavedChangesGuardProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const handleConfirmLeave = useCallback(() => {
    const href = pendingHref;
    setDialogOpen(false);
    setPendingHref(null);
    if (href) router.push(href);
  }, [pendingHref, router]);

  useEffect(() => {
    if (!isDirty) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;

    const handler = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const el = (e.target as Element | null)?.closest?.('a[href]');
      if (!el) return;
      const a = el as HTMLAnchorElement;
      if (a.target && a.target !== '_self') return;

      const hrefAttr = a.getAttribute('href');
      if (!hrefAttr || hrefAttr.startsWith('#')) return;

      let url: URL;
      try {
        url = new URL(hrefAttr, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;

      const dest = `${url.pathname}${url.search}${url.hash}`;
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (dest === current) return;

      e.preventDefault();
      e.stopPropagation();
      setPendingHref(dest);
      setDialogOpen(true);
    };

    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [isDirty]);

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) setPendingHref(null);
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Discard unsaved changes?</DialogTitle>
          <DialogDescription>
            You have unsaved changes. If you leave now, they will be lost.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
            Stay
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirmLeave}>
            Leave without saving
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
