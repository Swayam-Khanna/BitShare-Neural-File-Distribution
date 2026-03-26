import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, Zap, Shield, Smartphone, ArrowRight, Share2, Globe, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import Scene3D from '../components/Scene3D';

const Home = () => {
  const [downloadCode, setDownloadCode] = useState('');
  const navigate = useNavigate();

  const handleDownload = (e: React.FormEvent) => {
    e.preventDefault();
    if (downloadCode.trim()) {
      navigate(`/d/${downloadCode.trim().toUpperCase()}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative min-h-screen text-white overflow-hidden selection:bg-primary-500/30">
      <Scene3D />
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b-0 m-3 sm:m-6 rounded-3xl max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-10 py-3 sm:py-5 transition-all hover:bg-white/[0.05]">
        <div className="text-xl sm:text-2xl font-black flex items-center gap-2 sm:gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="p-2 sm:p-2.5 bg-primary-600 rounded-xl shadow-xl shadow-primary-500/30 group-hover:scale-110 transition-transform">
            <Share2 className="text-white" size={20} />
          </div>
          <span className="tracking-tight italic font-black">BitShare</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-8">
          <button onClick={() => navigate('/login')} className="text-[10px] sm:text-sm font-bold text-gray-400 hover:text-white transition uppercase tracking-widest leading-none">Login</button>
          <button 
            onClick={() => navigate('/signup')} 
            className="bg-white text-black hover:bg-gray-100 px-4 sm:px-7 py-2 sm:py-3 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-white/5 active:scale-95 leading-none"
          >
            Get Started
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-48 pb-32">
        {/* Hero Section */}
        <div className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10 glow-primary"
          >
            <Zap size={14} className="animate-pulse" />
            <span>Neural Link Protocol v2.0</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-9xl font-black mb-10 tracking-tighter leading-[0.85] italic"
          >
            Share and <br />
            <span className="text-gradient text-glow">Decrypt</span> Instantly.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 mb-16 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            The future of decentralized file orbital transfer. 
            Secure, fast, and completely anonymous.
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch mb-32"
        >
          {/* Upload Section */}
          <motion.div 
            variants={itemVariants}
            className="glass p-8 rounded-[2rem] flex flex-col items-center justify-center text-center group hover:bg-white/[0.05] transition-all duration-700 premium-border"
          >
            <div className="w-14 h-14 bg-primary-500/10 rounded-[1.5rem] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
              <Upload className="text-primary-400" size={24} />
            </div>
            <h2 className="text-xl font-black mb-2 italic tracking-tight uppercase">Upload Segment</h2>
            <p className="text-gray-500 mb-6 max-w-xs font-bold text-xs uppercase tracking-widest">Initiate secure uplink for your local files.</p>
            <div className="w-full">
              <FileUpload />
            </div>
          </motion.div>

          {/* Download Section */}
          <motion.div 
            variants={itemVariants}
            className="glass p-8 rounded-[2rem] flex flex-col justify-center premium-border h-full"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-[1rem] flex items-center justify-center shadow-inner">
                  <Download className="text-emerald-400" size={20} />
                </div>
                <h2 className="text-xl font-black italic tracking-tight uppercase">Retrieve Data</h2>
              </div>
              
              <p className="text-gray-500 font-bold text-xs uppercase tracking-widest leading-loose">Enter the 6-digit decryption signature to begin terminal download.</p>
              
              <form onSubmit={handleDownload} className="space-y-6">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="SIGNAL KEY"
                    className="w-full bg-black/40 border border-white/5 rounded-[1.5rem] px-6 py-5 text-center text-3xl font-black tracking-[0.3em] focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all uppercase placeholder:opacity-10 italic"
                    value={downloadCode}
                    onChange={(e) => setDownloadCode(e.target.value)}
                    maxLength={6}
                  />
                  <div className="absolute inset-0 rounded-[1.5rem] bg-primary-500/5 blur-xl -z-10 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                </div>
                
                <button 
                  type="submit"
                  disabled={downloadCode.length !== 6}
                  className="w-full bg-white text-black hover:bg-gray-100 disabled:opacity-20 disabled:grayscale font-black py-4 rounded-[1.5rem] transition-all flex items-center justify-center gap-3 text-lg active:scale-95 shadow-2xl shadow-white/5 uppercase tracking-widest"
                >
                  Decrypt Signal <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
              
              <div className="flex items-center gap-3 text-[10px] text-gray-600 justify-center font-black uppercase tracking-[0.3em]">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>End-to-End Encrypted Transit</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Row */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          <FeatureCard 
            icon={<Globe className="text-primary-400" size={32} />}
            title="Global Link"
            desc="Instant satellite distribution across all neural endpoints."
          />
          <FeatureCard 
            icon={<Shield className="text-emerald-400" size={32} />}
            title="Iron Shield"
            desc="AES-256 military grade encryption active for all active signals."
          />
          <FeatureCard 
            icon={<Smartphone className="text-purple-400" size={32} />}
            title="Multi-Node"
            desc="Access your segments from any terminal in the grid."
          />
        </motion.div>
      </main>

      {/* Footer Decoration */}
      <footer className="relative z-10 py-16 text-center border-t border-white/5 mt-20">
          <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em] mb-4 italic">© 2026 BitShare Neural Systems. All rights reserved.</p>
          <div className="flex justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all">
              <Share2 size={16} />
              <Shield size={16} />
              <Globe size={16} />
          </div>
      </footer>

      {/* Background Decor */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -left-64 w-[600px] h-[600px] bg-primary-600/20 blur-[150px] rounded-full pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 -right-64 w-[600px] h-[600px] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none" 
      />
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <motion.div 
    variants={{
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0 }
    }}
    whileHover={{ y: -10 }}
    className="glass p-10 rounded-[2.5rem] group border-transparent hover:border-white/10 transition-all duration-500 premium-border"
  >
    <div className="mb-8 p-4 bg-white/5 w-fit rounded-2xl group-hover:bg-primary-500/20 transition-all duration-500 group-hover:scale-110 shadow-inner">
      {icon}
    </div>
    <h3 className="text-2xl font-black mb-4 tracking-tight uppercase italic">{title}</h3>
    <p className="text-gray-500 leading-relaxed font-bold text-xs uppercase tracking-widest">{desc}</p>
  </motion.div>
);

export default Home;
