import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import api from '../lib/api';
import { toast } from '../components/ui/toast';

export function Login() {
  const navigate = useNavigate();
  const setUser = useAuthStore(s => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast('Please fill in all fields', 'error'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      setUser(data.user);
      toast('Welcome back!', 'success');
      navigate('/');
    } catch (err: any) {
      toast(err.response?.data?.message ?? 'Invalid credentials', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Link to="/" className="text-primary font-bold text-2xl block mb-2">RealEstate</Link>
          <CardTitle className="text-lg">Welcome back</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="email" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
            <Input id="password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            <Button type="submit" disabled={loading} className="w-full h-12">{loading ? 'Signing in...' : 'Sign in'}</Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-6">
            Don't have an account? <Link to="/register" className="text-primary hover:underline font-medium">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
