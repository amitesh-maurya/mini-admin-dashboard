'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProjectForm, ProjectFormValues } from '@/components/projects/ProjectForm';
import { projectService } from '@/services/project.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function NewProjectPage() {
  const { user: me } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (me && me.role !== 'admin') router.replace('/dashboard');
  }, [me, router]);

  async function handleSubmit(values: ProjectFormValues) {
    setIsLoading(true);
    try {
      await projectService.createProject(values);
      toast.success('Project created successfully');
      router.push('/projects');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create project';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  if (me?.role !== 'admin') return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">New Project</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Create a new project and assign users</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm onSubmit={handleSubmit} submitLabel="Create Project" isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
