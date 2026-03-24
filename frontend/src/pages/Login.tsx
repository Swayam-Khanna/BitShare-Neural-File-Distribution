import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Share2, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';

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

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-[#030712] overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full relative z-10"
      >
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-3 text-2xl font-bold mb-10 justify-center cursor-pointer group"
        >
          <div className="p-2 bg-primary-600 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-primary-500/20">
            <Share2 className="text-white" size={20} />
          </div>
          <span className="tracking-tight italic font-black text-white">BitShare</span>
        </div>

        <div className="glass p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl border-white/5">
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

          <div className="grid grid-cols-2 gap-4 mt-8">
            <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-2xl py-3.5 hover:bg-white/10 transition-all group">
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" alt="Google" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-2xl py-3.5 hover:bg-white/10 transition-all group">
              <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-all" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">GitHub</span>
            </button>
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
