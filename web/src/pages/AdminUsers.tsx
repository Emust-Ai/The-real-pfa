import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

import { Search, Shield, ShieldOff, Trash2, ChevronDown, KeyRound, X } from 'lucide-react';
import { toast } from '../components/ui/toast';

interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const roles = ['SUPER_ADMIN', 'RETAILER', 'CLIENT', 'BUILDER'];

export function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [passwordModal, setPasswordModal] = useState<{ id: number; email: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then(r => r.data),
  });

  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      api.patch(`/users/${id}/role`, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const toggleActive = useMutation({
    mutationFn: (id: number) => api.patch(`/users/${id}/toggle-active`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const changePassword = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      api.patch(`/users/${id}/password`, { password }),
    onSuccess: () => {
      setPasswordModal(null);
      setNewPassword('');
      setConfirmPassword('');
    },
  });

  const deleteUser = useMutation({
    mutationFn: (id: number) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setConfirmDelete(null);
    },
  });

  const filtered = users.filter(u =>
    !search || u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="relative w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users..." className="pl-10" />
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading users...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">No users found.</p>
      ) : (
        <div className="rounded-md border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-hairline">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-4 py-3 text-left">User</th>
                  <th className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-4 py-3 text-left">Email</th>
                  <th className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-4 py-3 text-left">Role</th>
                  <th className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-4 py-3 text-left">Status</th>
                  <th className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-4 py-3 text-left">Joined</th>
                  <th className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      <span className="font-medium">{u.firstName ?? u.lastName ? `${u.firstName ?? ''} ${u.lastName ?? ''}` : '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="relative inline-block">
                        <select value={u.role} onChange={e => changeRole.mutate({ id: u.id, role: e.target.value })}
                          className="appearance-none bg-transparent border border-hairline rounded-sm px-3 py-1.5 pr-7 text-xs font-medium cursor-pointer hover:border-foreground focus-visible:outline-none focus-visible:border-foreground">
                          {roles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button onClick={() => toggleActive.mutate(u.id)}
                        className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                          u.isActive ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'
                        }`}>
                        {u.isActive ? <Shield className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
                        {u.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => { setPasswordModal({ id: u.id, email: u.email }); setNewPassword(''); setConfirmPassword(''); }}
                          title="Change password">
                          <KeyRound className="h-3.5 w-3.5" />
                        </Button>
                        {confirmDelete === u.id ? (
                          <>
                            <Button variant="destructive" size="sm" className="h-8 text-xs px-3"
                              onClick={() => deleteUser.mutate(u.id)} disabled={deleteUser.isPending}>
                              Confirm
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-xs px-3"
                              onClick={() => setConfirmDelete(null)}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-8 w-8"
                            onClick={() => setConfirmDelete(u.id)}
                            disabled={u.id === JSON.parse(localStorage.getItem('user') || '{}').id}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {passwordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setPasswordModal(null)}>
          <div className="rounded-md border bg-card shadow-lg p-6 w-full max-w-sm mx-4 space-y-4"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Change Password</h3>
              <button onClick={() => setPasswordModal(null)} className="p-1 hover:bg-muted rounded-sm">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">Set new password for <strong>{passwordModal.email}</strong></p>
            <Input type="password" placeholder="New password (min 6 chars)"
              value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <Input type="password" placeholder="Confirm password"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setPasswordModal(null)}>Cancel</Button>
              <Button onClick={() => {
                if (newPassword.length < 6) return toast('Password must be at least 6 characters', 'error');
                if (newPassword !== confirmPassword) return toast('Passwords do not match', 'error');
                changePassword.mutate({ id: passwordModal.id, password: newPassword });
              }} disabled={changePassword.isPending}>
                {changePassword.isPending ? 'Saving...' : 'Save Password'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
