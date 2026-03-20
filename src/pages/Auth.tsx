import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Mail, Lock, User as UserIcon, ShieldCheck } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signInWithEmail, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-24 flex flex-col gap-8">
      <div className="text-center flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Welcome Back</h1>
        <p className="text-slate-600">Sign in to your OMETS account</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white pl-12 pr-4 py-3 text-sm focus:border-emerald-600 focus:outline-none"
            required
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white pl-12 pr-4 py-3 text-sm focus:border-emerald-600 focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
        </button>
      </form>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-black/5" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-400">Or continue with</span>
        </div>
      </div>

      <button
        onClick={signInWithGoogle}
        className="rounded-xl border border-black/10 py-3 font-bold text-slate-600 hover:bg-slate-50 transition-colors flex justify-center items-center gap-2"
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4" />
        Google Account
      </button>

      <p className="text-center text-sm text-slate-600">
        Don't have an account? <Link to="/register" className="text-emerald-600 font-bold">Register</Link>
      </p>
    </div>
  );
};

export const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { registerWithEmail, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      if (!user.verified) {
        navigate('/verify');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    setLoading(true);
    setError('');
    try {
      await registerWithEmail(formData.email, formData.password, formData.firstName, formData.lastName);
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-24 flex flex-col gap-8">
      <div className="text-center flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Create Account</h1>
        <p className="text-slate-600">Join the OMETS global community</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-emerald-600 focus:outline-none"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-emerald-600 focus:outline-none"
            required
          />
        </div>
        <input
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-emerald-600 focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-emerald-600 focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-emerald-600 focus:outline-none"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Register'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        Already have an account? <Link to="/login" className="text-emerald-600 font-bold">Sign In</Link>
      </p>
    </div>
  );
};

export const Verify = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { verifyCode, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const success = await verifyCode(code);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid verification code');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-slate-600">Please register or login first.</p>
        <Link to="/login" className="text-emerald-600 font-bold">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24 flex flex-col gap-8">
      <div className="text-center flex flex-col gap-4">
        <div className="mx-auto bg-emerald-50 text-emerald-600 p-4 rounded-full w-fit">
          <ShieldCheck className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Verify Your Email</h1>
        <p className="text-slate-600">
          We've sent a 6-digit verification code to <span className="font-bold text-slate-900">{user.email}</span>.
          Please enter it below to activate your account.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="rounded-xl border border-black/10 bg-white px-4 py-4 text-center text-2xl font-bold tracking-[1em] focus:border-emerald-600 focus:outline-none"
          required
        />
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify Account'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Didn't receive the code? <button className="text-emerald-600 font-bold hover:underline">Resend Code</button>
      </p>
    </div>
  );
};
