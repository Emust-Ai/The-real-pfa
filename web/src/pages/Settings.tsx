import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { toast } from '../components/ui/toast';
import { useAuthStore } from '../stores/authStore';
import { SavedSearchesPage } from './SavedSearchesPage';

type Tab = 'profile' | 'password' | 'saved-searches';

export function Settings() {
  const { user, setUser } = useAuthStore();
  const [tab, setTab] = useState<Tab>('profile');

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const profileMutation = useMutation({
    mutationFn: (data: { firstName?: string; lastName?: string; phone?: string }) =>
      api.patch('/users/me/profile', data).then(r => r.data),
    onSuccess: (data) => {
      setUser({ ...user!, ...data });
      toast('Profile updated', 'success');
    },
    onError: () => toast('Failed to update profile', 'error'),
  });

  const passwordMutation = useMutation({
    mutationFn: (password: string) =>
      api.patch('/users/me/password', { password }).then(r => r.data),
    onSuccess: () => {
      toast('Password changed', 'success');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: () => toast('Failed to change password', 'error'),
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    profileMutation.mutate({ firstName, lastName, phone: phone || undefined });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast('Password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('Passwords do not match', 'error');
      return;
    }
    passwordMutation.mutate(newPassword);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <div className="flex border-b border-hairline">
        <button
          onClick={() => setTab('profile')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setTab('password')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'password' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Password
        </button>
        <button
          onClick={() => setTab('saved-searches')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'saved-searches' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Saved Searches
        </button>
      </div>

      {tab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} />
                <Input label="Last Name" id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
              <Input label="Phone" id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
              <Button type="submit" disabled={profileMutation.isPending}>
                {profileMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {tab === 'password' && (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input label="New Password" id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <Input label="Confirm New Password" id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              <Button type="submit" disabled={passwordMutation.isPending}>
                {passwordMutation.isPending ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {tab === 'saved-searches' && <SavedSearchesPage />}
    </div>
  );
}
