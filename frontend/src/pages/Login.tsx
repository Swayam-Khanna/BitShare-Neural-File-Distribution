import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { GoogleLogin } from '@react-oauth/google';
import AuthLayout from '../components/ui/AuthLayout';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [tempUserId, setTempUserId] = useState('');
  
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('auth/login', { email, password });
      
      if (data.requires2FA) {
        setTempUserId(data.userId);
        setShow2FAModal(true);
        toast('Identity Verification Required', { icon: '🛡️' });
      } else {
        setUser(data);
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorToken.length !== 6) return toast.error('Enter 6-digit code');
    setLoading(true);

    try {
      const { data } = await api.post('auth/verify-2fa', { 
        userId: tempUserId, 
        token: twoFactorToken 
      });
      setUser(data);
      toast.success('Authentication Verified');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      const { data } = await api.post('auth/google', { 
          credential: credentialResponse.credential 
      });
      
      if (data.requires2FA) {
        setTempUserId(data.userId);
        setShow2FAModal(true);
        toast('Identity Verification Required', { icon: '🛡️' });
      } else {
        setUser(data);
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="AUTHENTICATE">
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="space-y-1"
          >
            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-primary-400 transition-colors" size={16} />
              <input 
                type="email" 
                placeholder="EMAIL"
                required
                className="w-full bg-white/[0.02] border border-white/5 rounded-lg px-12 py-3.5 focus:outline-none focus:ring-1 focus:ring-primary-500/30 transition-all font-bold text-white placeholder:text-gray-800 uppercase text-[9px] tracking-widest"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-1"
          >
            <div className="flex justify-between items-center ml-1">
              <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Password</label>
              <a href="#" className="text-[8px] text-primary-400 hover:text-white transition-colors font-black uppercase tracking-widest">Forgot?</a>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-primary-400 transition-colors" size={16} />
              <input 
                type="password" 
                placeholder="••••••••"
                required
                className="w-full bg-white/[0.02] border border-white/5 rounded-lg px-12 py-3.5 focus:outline-none focus:ring-1 focus:ring-primary-500/30 transition-all font-bold text-white placeholder:text-gray-800 text-[9px] tracking-[0.4em]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </motion.div>
        </div>

        <motion.button 
          type="submit" 
          disabled={loading}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-white text-black font-black py-3.5 rounded-lg transition-all flex items-center justify-center gap-2.5 mt-4 disabled:opacity-50 shadow-lg text-[9px] uppercase tracking-[0.2em] hover:bg-primary-50 active:scale-95"
        >
          {loading ? 'SYNC...' : 'AUTHENTICATE'} <ArrowRight size={14} />
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
        transition={{ delay: 0.5 }}
        className="flex justify-center mt-8 scale-105"
      >
        <GoogleLogin 
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error('Google Login Failed')}
          theme="filled_black"
          shape="pill"
          text="continue_with"
          width="100%"
        />
      </motion.div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 text-center text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]"
      >
        Signal unregistered? <Link to="/signup" className="text-primary-400 hover:text-white transition-colors underline decoration-primary-500/30 underline-offset-4">Establish Connection</Link>
      </motion.p>

      {/* 2FA Modal */}
      <AnimatePresence>
        {show2FAModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm glass p-10 rounded-[3rem] border border-white/10 relative z-10 text-center"
            >
              <div className="mb-8">
                <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-400 mx-auto mb-6 shadow-lg border border-white/5"><ShieldCheck size={32} /></div>
                <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">Identity Guard</h2>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-2">Neural verification required</p>
              </div>

              <form onSubmit={handleVerify2FA} className="space-y-6">
                <input 
                  type="text" placeholder="000000" maxLength={6} required
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-black text-center text-3xl tracking-[0.5em] text-white"
                  value={twoFactorToken}
                  onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, ''))}
                />
                <div className="flex gap-4">
                    <button type="button" onClick={() => setShow2FAModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-500 py-4 rounded-2xl font-black transition-all text-[9px] uppercase tracking-widest">CANCEL</button>
                    <button type="submit" disabled={loading} className="flex-2 bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-primary-600/30 text-[9px] uppercase tracking-widest">CONFIRM</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default Login;
