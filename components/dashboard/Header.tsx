'use client';

import { format } from 'date-fns';

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm h-16 flex items-center px-6 sticky top-0 z-10">
      <div className="flex items-center justify-between w-full">
        <div>
          <h2 className="text-sm font-medium text-foreground">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </h2>
        </div>
        <div className="text-sm text-muted-foreground">
          Campaign Performance Dashboard
        </div>
      </div>
    </header>
  );
}
