'use client';

import { useCallback, useEffect, useState } from 'react';
import { Project, ProjectStatus } from '@/types';
import { projectService } from '@/services/project.service';
import { StatusBadge } from '@/components/projects/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { Briefcase } from 'lucide-react';

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
];

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectService.getProjects({ limit: 100 });
      setProjects(res.data);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  async function handleStatusChange(projectId: string, newStatus: ProjectStatus) {
    setUpdatingId(projectId);
    try {
      const res = await projectService.updateStatus(projectId, newStatus);
      if (res.data) {
        setProjects((prev) => prev.map((p) => (p._id === projectId ? res.data! : p)));
        toast.success('Status updated');
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">My Projects</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          All projects assigned to you
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-8 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Briefcase className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600 mb-3" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No projects assigned to you yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <Card key={project._id}>
              <CardHeader className="pb-1">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {project.title}
                  </CardTitle>
                  <StatusBadge status={project.status} />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">{project.description}</p>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    Updated {formatDate(project.updatedAt)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Update status:</span>
                    <Select
                      value={project.status}
                      onValueChange={(val) => handleStatusChange(project._id, val as ProjectStatus)}
                      disabled={updatingId === project._id}
                    >
                      <SelectTrigger className="h-8 w-36 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
