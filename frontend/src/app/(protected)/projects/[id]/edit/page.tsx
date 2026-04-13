'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProjectForm, ProjectFormValues } from '@/components/projects/ProjectForm';
import { projectService } from '@/services/project.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Project } from '@/types';

export default function EditProjectPage() {
  const { user: me } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (me && me.role !== 'admin') router.replace('/dashboard');
  }, [me, router]);

  useEffect(() => {
    if (!id || me?.role !== 'admin') return;
    projectService
      .getProjectById(id)
      .then((res) => { if (res.data) setProject(res.data); })
      .catch(() => { toast.error('Project not found'); router.push('/projects'); })
      .finally(() => setFetchLoading(false));
  }, [id, me, router]);

  async function handleSubmit(values: ProjectFormValues) {
    if (!id) return;
    setIsLoading(true);
    try {
      await projectService.updateProject(id, values);
      toast.success('Project updated');
      router.push('/projects');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update project';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  if (me?.role !== 'admin') return null;

  const defaultValues: Partial<ProjectFormValues> = project
    ? {
        title: project.title,
        description: project.description,
        status: project.status,
        assignedTo: project.assignedTo.map((u) => u._id ?? '').filter(Boolean),
      }
    : {};

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Edit Project</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Update project details and assignments</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          {fetchLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          ) : (
            <ProjectForm
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              submitLabel="Save Changes"
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
