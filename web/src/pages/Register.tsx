import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Building2 } from 'lucide-react';
import type { Role } from '../types/auth';

export function Register() {
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', phone: '', role: 'CLIENT' as Role });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('accessToken', data.accessToken);
      setUser(data.user);
      navigate('/');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Building2 className="h-10 w-10 text-primary" />
          </div>
          <CardTitle>Create an account</CardTitle>
          <p className="text-sm text-muted-foreground">Join the platform</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input id="firstName" label="First name" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} />
              <Input id="lastName" label="Last name" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} />
            </div>
            <Input id="email" label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} required />
            <Input id="phone" label="Phone" placeholder="+216 xx xxx xxx" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            <Input id="password" label="Password" type="password" placeholder="•••••••• (min 6 chars)" value={form.password} onChange={(e) => update('password', e.target.value)} required />
            <div className="space-y-1">
              <label className="text-sm font-medium">I am a...</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.role}
                onChange={(e) => update('role', e.target.value)}
              >
                <option value="CLIENT">Buyer / Client</option>
                <option value="RETAILER">Real Estate Agent</option>
                <option value="BUILDER">Builder / Developer</option>
              </select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
