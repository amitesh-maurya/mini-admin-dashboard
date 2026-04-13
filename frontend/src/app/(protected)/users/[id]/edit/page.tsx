'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { UserForm } from '@/components/users/UserForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { userService } from '@/services/user.service';
import { User, UpdateUserPayload } from '@/types';
import { toast } from 'sonner';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [user, setUser] = useState<User | null>(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    userService
      .getUserById(id)
      .then((res) => {
        if (res.success && res.data) setUser(res.data);
        else { toast.error('User not found'); router.replace('/users'); }
      })
      .catch(() => {
        toast.error('User not found');
        router.replace('/users');
      })
      .finally(() => setFetching(false));
  }, [id, router]);

  async function handleSubmit(values: UpdateUserPayload) {
    setSaving(true);
    try {
      await userService.updateUser(id, values);
      toast.success('User updated');
      router.push('/users');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update user';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
          <Link href="/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Edit user</h1>
          {user && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Editing {user.name}</p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>Update this user's information.</CardDescription>
        </CardHeader>
        <CardContent>
          {fetching ? (
            <div className="space-y-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : user ? (
            <UserForm
              mode="edit"
              defaultValues={user}
              onSubmit={handleSubmit as Parameters<typeof UserForm>[0]['onSubmit']}
              loading={saving}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
