export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Mini Admin Dashboard
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Secure role-based access control system
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
