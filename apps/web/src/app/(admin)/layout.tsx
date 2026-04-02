'use client';

import { AdminShell } from '../../components/layout/admin-shell';
import { RequireAuth } from '../../components/layout/require-auth';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <RequireAuth>
      <AdminShell>{children}</AdminShell>
    </RequireAuth>
  );
}
