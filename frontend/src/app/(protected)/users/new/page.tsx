'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { UserForm } from '@/components/users/UserForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { userService } from '@/services/user.service';
import { CreateUserPayload } from '@/types';
import { toast } from 'sonner';

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(values: CreateUserPayload) {
    setLoading(true);
    try {
      await userService.createUser(values);
      toast.success('User created successfully');
      router.push('/users');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create user';
      toast.error(msg);
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">New user</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Create a new user account</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>Fill in the information for the new user.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm mode="create" onSubmit={handleSubmit as Parameters<typeof UserForm>[0]['onSubmit']} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}
