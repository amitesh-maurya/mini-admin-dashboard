'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, CreateUserPayload, UpdateUserPayload } from '@/types';
import { useAuth } from '@/context/AuthContext';

const createSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'user']),
  isActive: z.boolean(),
});

const editSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'user']),
  isActive: z.boolean(),
});

type CreateFormValues = z.infer<typeof createSchema>;
type EditFormValues = z.infer<typeof editSchema>;

interface UserFormProps {
  mode: 'create' | 'edit';
  defaultValues?: User;
  onSubmit: (values: CreateUserPayload | UpdateUserPayload) => Promise<void>;
  loading?: boolean;
}

export function UserForm({ mode, defaultValues, onSubmit, loading }: UserFormProps) {
  const { user: me } = useAuth();
  const isAdmin = me?.role === 'admin';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateFormValues | EditFormValues>({
    resolver: zodResolver(mode === 'create' ? createSchema : editSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          email: defaultValues.email,
          role: defaultValues.role,
          isActive: defaultValues.isActive,
        }
      : {
          name: '',
          email: '',
          password: '',
          role: 'user',
          isActive: true,
        },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name,
        email: defaultValues.email,
        role: defaultValues.role,
        isActive: defaultValues.isActive,
      });
    }
  }, [defaultValues, reset]);

  const role = watch('role');
  const isActive = watch('isActive');

  return (
    <form onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])} className="space-y-4">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" {...register('name')} placeholder="John Doe" />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} placeholder="john@example.com" />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      {/* Password (create only) */}
      {mode === 'create' && (
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register('password' as keyof CreateFormValues)} placeholder="Min 6 characters" />
          {'password' in errors && errors.password && (
            <p className="text-xs text-red-500">{(errors as { password?: { message?: string } }).password?.message}</p>
          )}
        </div>
      )}

      {/* Role (admin only) */}
      {isAdmin && (
        <div className="space-y-1.5">
          <Label>Role</Label>
          <Select value={role} onValueChange={(v) => setValue('role', v as 'admin' | 'user')}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Active status (admin only) */}
      {isAdmin && (
        <div className="flex items-center gap-3">
          <input
            id="isActive"
            type="checkbox"
            aria-label="Active account"
            className="h-4 w-4 rounded border-zinc-300 accent-zinc-900 dark:accent-zinc-100"
            checked={isActive}
            onChange={(e) => setValue('isActive', e.target.checked)}
          />
          <Label htmlFor="isActive" className="cursor-pointer">Active account</Label>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving…' : mode === 'create' ? 'Create user' : 'Save changes'}
      </Button>
    </form>
  );
}
