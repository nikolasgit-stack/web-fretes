'use client';

import { AdminHeader } from './admin-header';
import { AdminSidebar } from './admin-sidebar';

export function AdminShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[var(--wf-bg)] px-4 py-4 text-[var(--wf-ink)] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1680px] gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
        <AdminSidebar />

        <div className="min-w-0 space-y-4">
          <AdminHeader />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
