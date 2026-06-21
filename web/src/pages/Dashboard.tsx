import { useAuthStore } from '../stores/authStore';

export function Dashboard() {
  const { user } = useAuthStore();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome back, {user?.firstName || user?.email}!
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Role</p>
          <p className="text-lg font-semibold capitalize">{user?.role?.toLowerCase()}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="text-lg font-semibold">{user?.email}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="text-lg font-semibold text-green-600">Active</p>
        </div>
      </div>
    </div>
  );
}
