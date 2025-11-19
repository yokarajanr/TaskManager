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
  const [organizationCode, setOrganizationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [requiresApproval, setRequiresApproval] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    console.log('📝 Signup: Submitting registration...');
    const result = await register(name || 'New User', email, password, organizationCode);
    console.log('📝 Signup: Registration result:', result);
    
    if (!result.success) {
      setError(result.message || 'Signup failed');
      return;
    }
    
    // Check if approval is required
    if (result.requiresApproval) {
      console.log('⏳ Signup: User requires approval');
      setRequiresApproval(true);
      setSuccess(result.message || 'Your account is pending approval. Please wait for an administrator to approve your registration.');
      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setOrganizationCode('');
    } else {
      console.log('✅ Signup: User auto-approved, redirecting...');
      // Direct login (for auto-approved users)
      navigate('/', { replace: true });
    }
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
          <div>
            <label className="block text-sm font-medium text-[#1E1E24] !important mb-2">Organization Code</label>
            <input
              type="text"
              required
              value={organizationCode}
              onChange={(e) => setOrganizationCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-[#E0FBFC] border-2 border-[#9B5DE5]/30 rounded-2xl text-[#1E1E24] placeholder-[#7C6F64] focus:outline-none focus:border-[#9B5DE5] focus:ring-4 focus:ring-[#9B5DE5]/20 transition-all duration-300 uppercase"
              placeholder="Enter your organization code"
              maxLength={12}
            />
            <p className="text-xs text-[#7C6F64] !important mt-1">
              Get this code from your organization administrator
            </p>
          </div>
          {error && (
            <div className="text-sm text-[#D7263D] bg-[#D7263D]/20 border-2 border-[#D7263D]/30 rounded-2xl p-3 text-center">
              {error}
            </div>
          )}
          {success && requiresApproval && (
            <div className="text-sm text-[#F7B801] bg-[#F7B801]/20 border-2 border-[#F7B801]/30 rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-[#F7B801] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-[#1E1E24] !important mb-1">Account Pending Approval</p>
                  <p className="text-sm">{success}</p>
                  <p className="text-sm mt-2">You can close this page. You'll be notified once approved.</p>
                </div>
              </div>
            </div>
          )}
          <Button type="submit" className="w-full btn-primary" disabled={requiresApproval}>
            {requiresApproval ? 'Registration Complete' : 'Create account'}
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

