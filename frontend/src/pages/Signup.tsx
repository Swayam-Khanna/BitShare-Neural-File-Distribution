import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, User, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { GoogleLogin } from '@react-oauth/google';
import AuthLayout from '../components/ui/AuthLayout';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  // ── Handlers ──────────────────────────────────────────────
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val && !/^[A-Za-z\s]*$/.test(val)) {
      setNameError('Only alphabets are allowed');
      setName(val.replace(/[^A-Za-z\s]/g, ''));
    } else {
      setNameError('');
      setName(val);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (!val) {
      setEmailError('');
    } else if (val[0] && val[0] !== val[0].toLowerCase()) {
      setEmailError('Email should start with a lowercase letter');
    } else if (val.length > 3 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setEmailError('Enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nameError || emailError) return;
    if (!/^[A-Za-z\s]+$/.test(name)) {
      setNameError('Only alphabets are allowed');
      return;
    }
    if (email && email[0] !== email[0].toLowerCase()) {
      setEmailError('Email should start with a lowercase letter');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('auth/register', { name, email, password });
      setUser(data);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      const { data } = await api.post('auth/google', {
        credential: credentialResponse.credential,
      });
      setUser(data);
      toast.success('Google Authentication Successful!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Google Auth failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Animated error badge ───────────────────────────────────
  const ErrorBadge = ({ msg }: { msg: string }) => (
    <AnimatePresence>
      {msg && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="ml-1 mt-1.5 text-[10px] font-black uppercase tracking-widest text-red-400"
        >
          ⚠ {msg}
        </motion.p>
      )}
    </AnimatePresence>
  );

  return (
    <AuthLayout title="INITIALIZE">
      <form onSubmit={handleSignup} className="space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-1"
        >
          <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Name</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-primary-400 transition-colors z-10" size={16} />
            <input
              type="text"
              placeholder="NAME"
              required
              className={`relative w-full bg-white/[0.02] border rounded-lg px-12 py-3 focus:outline-none focus:ring-1 transition-all font-black text-white placeholder:text-gray-800 uppercase tracking-widest text-[9px] z-10 ${nameError ? 'border-red-500/20' : 'border-white/5 focus:ring-primary-500/30'}`}
              value={name}
              onChange={handleNameChange}
            />
          </div>
          <ErrorBadge msg={nameError} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-1"
        >
          <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Email</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-primary-400 transition-colors z-10" size={16} />
            <input
              type="email"
              placeholder="EMAIL"
              required
              className={`relative w-full bg-white/[0.02] border rounded-lg px-12 py-3 focus:outline-none focus:ring-1 transition-all font-black text-white placeholder:text-gray-800 uppercase tracking-widest text-[9px] z-10 ${emailError ? 'border-red-500/20' : 'border-white/5 focus:ring-primary-500/30'}`}
              value={email}
              onChange={handleEmailChange}
            />
          </div>
          <ErrorBadge msg={emailError} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-1"
        >
          <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-primary-400 transition-colors z-10" size={16} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              className="relative w-full bg-white/[0.02] border border-white/5 rounded-lg px-12 py-3 focus:outline-none focus:ring-1 focus:ring-primary-500/30 transition-all font-black text-white placeholder:text-gray-800 z-10 text-[9px] tracking-[0.4em]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700 hover:text-primary-400 transition-colors p-1.5 z-20 active:scale-90"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </motion.div>

        <motion.button
          type="submit"
          disabled={loading || !!nameError || !!emailError}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-white text-black font-black py-3 rounded-lg flex items-center justify-center gap-2 mt-5 disabled:opacity-50 text-[9px] uppercase tracking-[0.2em] shadow-lg hover:bg-primary-50 transition-all group italic"
        >
          {loading ? 'SYNC...' : 'INITIALIZE'}
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </form>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 border-t border-white/5 pt-6"
      />

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center mt-6 active:scale-105 transition-transform"
      >
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error('Auth Failed')}
          theme="filled_black"
          shape="pill"
          text="signup_with"
          width="100%"
        />
      </motion.div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-8 text-center text-gray-600 text-[9px] font-black uppercase tracking-[0.3em] italic"
      >
        Active Node?{' '}
        <Link to="/login" className="text-primary-400 hover:text-white transition-colors underline decoration-primary-500/20 underline-offset-4">Authenticate</Link>
      </motion.p>
    </AuthLayout>
  );
};

export default Signup;
