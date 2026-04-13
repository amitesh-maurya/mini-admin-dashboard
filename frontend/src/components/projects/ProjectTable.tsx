'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/projects/StatusBadge';
import { formatDate } from '@/lib/utils';

interface ProjectTableProps {
  projects: Project[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
}

export function ProjectTable({ projects, loading, onDelete }: ProjectTableProps) {
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
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!projects.length) {
    return (
      <div className="py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
        No projects found.
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {projects.map((project) => (
          <div key={project._id} className="flex items-start gap-3 px-4 py-3">
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {project.title}
              </p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {project.description}
              </p>
              {project.assignedTo?.length > 0 && (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                  Assigned:{' '}
                  {project.assignedTo.map((u) => u.name).join(', ')}
                </p>
              )}
            </div>

            {/* Status + date */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <StatusBadge status={project.status} />
              <span className="text-xs text-zinc-400 dark:text-zinc-500">{formatDate(project.createdAt)}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/projects/${project._id}/edit`}>
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => setConfirmId(project._id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(open) => { if (!open) setConfirmId(null); }}
        title="Delete Project"
        description="This action cannot be undone. The project will be permanently deleted."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
