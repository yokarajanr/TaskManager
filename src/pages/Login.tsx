import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';

export const Login: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Invalid email or password.');
      }
    } catch (error) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFEDD5] via-[#E0FBFC] to-[#FFEDD5] p-4">
      <div className="w-full max-w-md glass rounded-3xl p-8 border-2 border-[#9B5DE5]/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#9B5DE5] to-[#7C3AED] rounded-2xl flex items-center justify-center mx-auto mb-4 glow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#1E1E24] !important mb-2">
            Welcome back
          </h1>
          <p className="text-[#7C6F64] !important">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#1E1E24] !important mb-2">Email</label>
            <input
              type="email"
              required
              disabled={loading}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300 disabled:opacity-50"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1E1E24] !important mb-2">Password</label>
            <input
              type="password"
              required
              disabled={loading}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300 disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <div className="text-sm text-[#D7263D] bg-[#D7263D]/20 border-2 border-[#D7263D]/30 rounded-2xl p-3 text-center">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="text-sm text-[#7C6F64] !important mt-6 text-center">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#9B5DE5] hover:text-[#7C3AED] transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

