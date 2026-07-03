import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import api from '../lib/api';
import { toast } from '../components/ui/toast';
import type { Role } from '../types/auth';

export function Register() {
  const navigate = useNavigate();
  const setUser = useAuthStore(s => s.setUser);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('CLIENT');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast('Email and password are required', 'error'); return; }
    if (password.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { email, password, firstName, lastName, phone, role });
      localStorage.setItem('accessToken', data.accessToken);
      setUser(data.user);
      toast('Account created!', 'success');
      navigate('/');
    } catch (err: any) {
      toast(err.response?.data?.message ?? 'Registration failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Link to="/" className="text-primary font-bold text-2xl block mb-2">RealEstate</Link>
          <CardTitle className="text-lg">Create an account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input id="firstName" label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" />
              <Input id="lastName" label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" />
            </div>
            <Input id="email" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
            <Input id="phone" label="Phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+216 XX XXX XXX" />
            <Input id="password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" />
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">I am a</label>
              <select value={role} onChange={e => setRole(e.target.value as Role)}
                className="flex h-14 w-full rounded-sm border border-border bg-background px-4 py-3 text-base outline-none focus:border-foreground transition-colors">
                <option value="CLIENT">Buyer / Renter</option>
                <option value="RETAILER">Agent / Agency</option>
                <option value="BUILDER">Developer / Builder</option>
              </select>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12">{loading ? 'Creating account...' : 'Create account'}</Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-6">
            Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
