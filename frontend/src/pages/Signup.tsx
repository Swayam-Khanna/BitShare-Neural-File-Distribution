import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Share2, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { GoogleLogin } from '@react-oauth/google';

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

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      const { data } = await axios.post('http://localhost:8000/api/auth/google', { 
          credential: credentialResponse.credential 
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
            <h1 className="text-3xl font-black mb-3 tracking-tighter italic text-white uppercase">Create Account</h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Join the future of secure file sharing.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="John Doe"
                  required
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-bold text-white placeholder:text-gray-700"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
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
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
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
              {loading ? 'CREATING...' : 'GET STARTED'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-10 relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
              <span className="bg-[#030712] px-4 text-gray-500 leading-none">Or sign up with</span>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <GoogleLogin 
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Auth Failed')}
              theme="filled_black"
              shape="pill"
              text="signup_with"
              width="300"
            />
          </div>
        </div>

        <p className="mt-8 text-center text-gray-500 text-[10px] font-black uppercase tracking-widest">
          Already have an account? <Link to="/login" className="text-primary-400 hover:text-primary-300 transition">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
