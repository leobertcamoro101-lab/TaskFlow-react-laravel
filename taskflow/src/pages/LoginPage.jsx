import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:border-violet-400 transition-colors text-sm placeholder-gray-500';

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">✅ TaskFlow</h1>
          <p className="text-gray-400">Sign in to manage your tasks</p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 sm:p-8">
          <h2 className="text-white font-bold text-xl mb-6">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              <input type="email" placeholder="your@email.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass} required />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Password</label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputClass} required />
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                ⚠️ {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-violet-500 hover:bg-violet-400 disabled:opacity-50
                         text-white font-bold py-3 rounded-xl transition-colors">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            No account?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
