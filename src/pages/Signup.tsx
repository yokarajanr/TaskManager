import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await register(name || 'New User', email, password);
    if (!result.success) {
      setError(result.message || 'Signup failed');
      return;
    }
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFEDD5] via-[#E0FBFC] to-[#FFEDD5] p-4">
      <div className="w-full max-w-md glass rounded-3xl p-8 border-2 border-[#9B5DE5]/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#9B5DE5] to-[#7C3AED] rounded-2xl flex items-center justify-center mx-auto mb-4 glow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#1E1E24] !important mb-2">
            Create your account
          </h1>
          <p className="text-[#7C6F64] !important">Start managing your projects</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#1E1E24] !important mb-2">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1E1E24] !important mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1E1E24] !important mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300"
              placeholder="At least 6 characters"
              minLength={6}
            />
          </div>
          {error && (
            <div className="text-sm text-[#D7263D] bg-[#D7263D]/20 border-2 border-[#D7263D]/30 rounded-2xl p-3 text-center">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full btn-primary">
            Create account
          </Button>
        </form>

        <p className="text-sm text-[#7C6F64] !important mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-[#9B5DE5] hover:text-[#7C3AED] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

