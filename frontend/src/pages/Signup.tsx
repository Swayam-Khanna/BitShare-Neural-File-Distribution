import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Share2, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useGoogleLogin } from '@react-oauth/google';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:8000/api/auth/register', { name, email, password });
      setUser(data);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse: any) => {
      try {
        setLoading(true);
        const { data } = await axios.post('http://localhost:8000/api/auth/google', { 
            access_token: tokenResponse.access_token 
        });
        
        setUser(data);
        toast.success('Google Authentication Successful!');
        navigate('/dashboard');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Google Auth failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error('Google Auth Failed')
  });

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
          <span className="tracking-tight">BitShare</span>
        </div>

        <div className="glass p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl border-white/5">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-3 tracking-tight">Create Account</h1>
            <p className="text-gray-400 text-sm">Join the future of secure file sharing.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-400 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="John Doe"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all placeholder:text-gray-600"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-400 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-400 transition-colors" size={18} />
                <input 
                  type="email" 
                  placeholder="name@company.com"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all placeholder:text-gray-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-400 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-400 transition-colors" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all placeholder:text-gray-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black hover:bg-gray-100 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-white/5"
            >
              {loading ? 'Creating...' : 'Get Started'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-10 relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="bg-[#0f172a] px-4 text-gray-500 leading-none">Or sign up with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <button 
              type="button"
              onClick={() => loginWithGoogle()}
              className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-2xl py-3.5 hover:bg-white/10 transition-all group"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" alt="Google" />
              <span className="text-xs font-bold">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-2xl py-3.5 hover:bg-white/10 transition-all group">
              <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-all" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              <span className="text-xs font-bold">GitHub</span>
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-gray-400 text-sm">
          Already have an account? <Link to="/login" className="text-primary-400 font-bold hover:text-primary-300 transition">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
