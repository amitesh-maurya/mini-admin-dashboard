'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { User } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { RoleBadge } from '@/components/users/RoleBadge';
import { formatDate, getInitials } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface UserTableProps {
  users: User[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
}

export function UserTable({ users, loading, onDelete }: UserTableProps) {
  const { user: me } = useAuth();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirmId) return;
    setDeleting(true);
    await onDelete(confirmId);
    setDeleting(false);
    setConfirmId(null);
  }

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
        No users found.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left">
              <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">User</th>
              <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 hidden md:table-cell">Role</th>
              <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 hidden sm:table-cell">Status</th>
              <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">Joined</th>
              <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs">{getInitials(u.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{u.name}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <RoleBadge role={u.role} />
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <Badge variant={u.isActive ? 'success' : 'secondary'} className="text-xs">
                    {u.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-zinc-500 dark:text-zinc-400 text-xs">
                  {formatDate(u.createdAt!)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                      <Link href={`/users/${u._id}/edit`}>
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit {u.name}</span>
                      </Link>
                    </Button>
                    {me?._id !== u._id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => setConfirmId(u._id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete {u.name}</span>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Delete user"
        description="This action cannot be undone. The user account will be permanently removed."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
