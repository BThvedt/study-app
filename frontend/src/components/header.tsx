'use client';

import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

interface HeaderProps {
  authenticated: boolean;
  onSignIn: () => void;
  onSignUp: () => void;
  onLogout: () => void;
}

export function Header({ authenticated, onSignIn, onSignUp, onLogout }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground font-semibold text-lg tracking-tight">
          <BookOpen className="h-5 w-5 text-primary" />
          <span>StudyApp</span>
        </div>

        <nav className="flex items-center gap-2">
          {authenticated ? (
            <Button variant="outline" size="sm" onClick={onLogout}>
              Log out
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onSignIn}>
                Sign in
              </Button>
              <Button size="sm" onClick={onSignUp}>
                Sign up
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
