'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, UserCheck, UserPlus, Activity, FolderKanban, FolderOpen, Clock, CheckCircle2, PauseCircle } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { StatusBadge } from '@/components/projects/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { userService } from '@/services/user.service';
import { projectService } from '@/services/project.service';
import { DashboardStats, User, Project, PaginatedResponse } from '@/types';
import { formatDate, getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user: me } = useAuth();

  // Admin state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // User state
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [myProjectsLoading, setMyProjectsLoading] = useState(true);

  const isAdmin = me?.role === 'admin';

  useEffect(() => {
    if (!me) return;

    if (isAdmin) {
      userService
        .getDashboardStats()
        .then((res) => { if (res.success && res.data) setStats(res.data); })
        .catch(() => toast.error('Failed to load dashboard stats'))
        .finally(() => setStatsLoading(false));
    } else {
      projectService
        .getProjects({ limit: 3 })
        .then((res: PaginatedResponse<Project>) => setMyProjects(res.data))
        .catch(() => toast.error('Failed to load projects'))
        .finally(() => setMyProjectsLoading(false));
    }
  }, [me, isAdmin]);

  // ─── Admin Dashboard ────────────────────────────────────────────────────────
  if (isAdmin) {
    const loading = statsLoading;
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Welcome back. Here's what's happening.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard label="Total Users" value={loading ? '—' : stats?.totalUsers ?? 0} icon={Users} loading={loading} />
          <StatsCard label="Active Users" value={loading ? '—' : stats?.activeUsers ?? 0} icon={UserCheck} description="Currently active accounts" loading={loading} />
          <StatsCard label="New This Week" value={loading ? '—' : stats?.newThisWeek ?? 0} icon={UserPlus} description="Registered in the last 7 days" loading={loading} />
          <StatsCard label="Total Projects" value={loading ? '—' : stats?.totalProjects ?? 0} icon={FolderKanban} description="All projects" loading={loading} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Signups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Activity className="h-4 w-4" />
                Recent Signups
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : !stats?.recentUsers?.length ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No users found.</p>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {stats.recentUsers.map((user: Partial<User>) => (
                    <div key={user._id} className="flex items-center gap-3 py-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs">{getInitials(user.name ?? '')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.name}</p>
                        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={user.role === 'admin' ? 'blue' : 'secondary'} className="text-xs">
                          {user.role}
                        </Badge>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 hidden sm:inline">
                          {user.createdAt ? formatDate(user.createdAt) : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <FolderOpen className="h-4 w-4" />
                Recent Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3.5 w-40" />
                        <Skeleton className="h-3 w-56" />
                      </div>
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : !stats?.recentProjects?.length ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No projects yet.</p>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {stats.recentProjects.map((project: Partial<Project>) => (
                    <div key={project._id} className="flex items-center gap-3 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{project.title}</p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">
                          {project.createdAt ? formatDate(project.createdAt) : ''}
                        </p>
                      </div>
                      {project.status && <StatusBadge status={project.status} />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── User Dashboard ──────────────────────────────────────────────────────────
  const statusCounts = myProjects.reduce(
    (acc, p) => { acc[p.status] = (acc[p.status] ?? 0) + 1; return acc; },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Welcome back, {me?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Here's a summary of your assigned projects.</p>
      </div>

      {/* Status summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="In Progress" value={myProjectsLoading ? '—' : statusCounts['in-progress'] ?? 0} icon={FolderOpen} loading={myProjectsLoading} />
        <StatsCard label="Pending" value={myProjectsLoading ? '—' : statusCounts['pending'] ?? 0} icon={Clock} loading={myProjectsLoading} />
        <StatsCard label="Completed" value={myProjectsLoading ? '—' : statusCounts['completed'] ?? 0} icon={CheckCircle2} loading={myProjectsLoading} />
      </div>

      {/* Recent assigned projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <PauseCircle className="h-4 w-4" />
            Latest Assigned Projects
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/my-projects">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {myProjectsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : myProjects.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No projects assigned yet.</p>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {myProjects.map((project) => (
                <div key={project._id} className="flex items-start gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{project.title}</p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{project.description}</p>
                  </div>
                  <StatusBadge status={project.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile quick link */}
      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link href="/profile">View Profile</Link>
        </Button>
      </div>
    </div>
  );
}
