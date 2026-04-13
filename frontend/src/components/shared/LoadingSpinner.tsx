import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  fullPage?: boolean;
  className?: string;
}

export function LoadingSpinner({ fullPage, className }: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={cn(
        'h-6 w-6 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100',
        className,
      )}
    />
  );

  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
