import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Share2, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { GoogleLogin } from '@react-oauth/google';

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
      const { data } = await axios.post('http://localhost:8000/api/auth/login', { email, password });
      
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
      const { data } = await axios.post('http://localhost:8000/api/auth/verify-2fa', { 
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
      const { data } = await axios.post('http://localhost:8000/api/auth/google', { 
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
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-[#030712] overflow-y-auto py-12">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full relative z-10"
      >
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-3 text-2xl font-bold mb-6 sm:mb-10 justify-center cursor-pointer group"
        >
          <div className="p-2 bg-primary-600 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-primary-500/20">
            <Share2 className="text-white" size={20} />
          </div>
          <span className="tracking-tight italic font-black text-white">BitShare</span>
        </div>

        <div className="glass p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] shadow-2xl backdrop-blur-xl border-white/5">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black mb-3 tracking-tighter italic text-white uppercase">Welcome Back</h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Securely access your sharing dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Identity Mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary-400 transition-colors" size={18} />
                <input 
                  type="email" 
                  placeholder="name@company.com"
                  required
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-bold text-white placeholder:text-gray-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Access Key</label>
                <a href="#" className="text-[10px] text-primary-400 hover:text-primary-300 transition font-black uppercase tracking-wider">Reset Query?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary-400 transition-colors" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  required
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-bold text-white placeholder:text-gray-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black hover:bg-gray-100 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-white/5 text-xs uppercase tracking-widest"
            >
              {loading ? 'SYNCING...' : 'SIGN IN'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-10 relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
              <span className="bg-[#030712] px-4 text-gray-500 leading-none">External Nodes</span>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <GoogleLogin 
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Login Failed')}
              theme="filled_black"
              shape="pill"
              text="continue_with"
              width="300"
            />
          </div>
        </div>

        <p className="mt-8 text-center text-gray-500 text-[10px] font-black uppercase tracking-widest">
          Node unregistered? <Link to="/signup" className="text-primary-400 hover:text-primary-300 transition">Establish Connection</Link>
        </p>
      </motion.div>

      {/* 2FA Modal */}
      <AnimatePresence>
        {show2FAModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm glass p-10 rounded-[3rem] border border-white/10 relative z-10 text-center"
            >
              <div className="mb-8">
                <div className="w-20 h-20 bg-primary-500/10 rounded-3xl flex items-center justify-center text-primary-400 mx-auto mb-6 shadow-lg border border-white/5">
                  <ShieldCheck size={40} />
                </div>
                <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">Identity Guard</h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">Enter the verification code from your device</p>
              </div>

              <form onSubmit={handleVerify2FA} className="space-y-6">
                <input 
                  type="text" 
                  placeholder="000000"
                  maxLength={6}
                  required
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-black text-center text-3xl tracking-[0.5em] text-white"
                  value={twoFactorToken}
                  onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, ''))}
                />
                <div className="flex gap-4">
                    <button 
                        type="button"
                        onClick={() => setShow2FAModal(false)}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-gray-500 py-4 rounded-2xl font-black transition-all text-[10px] uppercase tracking-widest"
                    >
                        CANCEL
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="flex-2 bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-primary-600/30 text-[10px] uppercase tracking-widest"
                    >
                        {loading ? 'VERIFYING...' : 'CONFIRM IDENTITY'}
                    </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
