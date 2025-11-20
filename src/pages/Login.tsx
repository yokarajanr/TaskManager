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
  const [success, setSuccess] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        // Show success state briefly
        setSuccess(true);
        // Navigate with smooth transition
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 150); // Reduced delay for faster navigation
      } else {
        setError(result.message || 'Invalid email or password.');
        setLoading(false);
      }
    } catch (error) {
      setError('An error occurred during login. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFEDD5] via-[#E0FBFC] to-[#FFEDD5] p-4 relative">
      {/* Success overlay with smooth transition */}
      {success && (
        <div className="fixed inset-0 bg-gradient-to-br from-[#9B5DE5]/20 to-[#00F5D4]/20 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-3xl p-8 shadow-2xl transform animate-scale-in">
            <div className="w-16 h-16 bg-gradient-to-br from-[#9B5DE5] to-[#00F5D4] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-[#1E1E24] text-center">Welcome back!</p>
          </div>
        </div>
      )}
      
      <div className="w-full max-w-md glass rounded-3xl p-8 border-2 border-[#9B5DE5]/20 transition-all duration-300">
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
            <div className={`text-sm rounded-2xl p-3 ${
              error.includes('pending') || error.includes('approval') 
                ? 'text-[#F7B801] bg-[#F7B801]/20 border-2 border-[#F7B801]/30' 
                : 'text-[#D7263D] bg-[#D7263D]/20 border-2 border-[#D7263D]/30'
            }`}>
              {error.includes('pending') || error.includes('approval') ? (
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-semibold mb-1">Account Pending</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              ) : (
                <p className="text-center">{error}</p>
              )}
            </div>
          )}
          <Button type="submit" className="w-full btn-primary relative overflow-hidden" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing in...</span>
              </span>
            ) : 'Sign in'}
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

