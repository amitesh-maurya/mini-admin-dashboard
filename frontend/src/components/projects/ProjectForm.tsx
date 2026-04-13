'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { userService } from '@/services/user.service';
import { User, ProjectStatus } from '@/types';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),
  status: z.enum(['pending', 'in-progress', 'completed', 'on-hold'] as const),
  assignedTo: z.array(z.string()).optional(),
});

export type ProjectFormValues = z.infer<typeof schema>;

interface ProjectFormProps {
  defaultValues?: Partial<ProjectFormValues>;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
];

export function ProjectForm({ defaultValues, onSubmit, submitLabel = 'Save', isLoading }: ProjectFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      status: 'pending',
      assignedTo: [],
      ...defaultValues,
    },
  });

  useEffect(() => {
    userService
      .getUsers({ limit: 100 })
      .then((res) => setUsers(res.data))
      .catch(() => {})
      .finally(() => setUsersLoading(false));
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register('title')} placeholder="Project title" />
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} placeholder="Project description" rows={4} />
        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <Label htmlFor="status">Status</Label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
      </div>

      {/* Assigned Users */}
      <div className="space-y-1.5">
        <Label>Assign Users</Label>
        {usersLoading ? (
          <p className="text-sm text-zinc-500">Loading users…</p>
        ) : (
          <Controller
            name="assignedTo"
            control={control}
            render={({ field }) => (
              <div className="border border-zinc-200 dark:border-zinc-700 rounded-md divide-y divide-zinc-100 dark:divide-zinc-800 max-h-48 overflow-y-auto">
                {users.map((u) => {
                  const checked = field.value?.includes(u._id) ?? false;
                  return (
                    <label
                      key={u._id}
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const current = field.value ?? [];
                          field.onChange(
                            e.target.checked ? [...current, u._id] : current.filter((id) => id !== u._id)
                          );
                        }}
                        className="accent-zinc-900"
                      />
                      <span className="text-sm text-zinc-800 dark:text-zinc-200">{u.name}</span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-auto">{u.email}</span>
                    </label>
                  );
                })}
                {users.length === 0 && (
                  <p className="px-3 py-2 text-sm text-zinc-400">No users available</p>
                )}
              </div>
            )}
          />
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}
