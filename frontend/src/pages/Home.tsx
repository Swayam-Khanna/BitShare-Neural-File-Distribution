import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, Zap, Shield, Smartphone, ArrowRight, Share2, Globe, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../features/dashboard/FileUpload';
import Scene3D from '../components/Scene3D';
import Navbar from '../components/ui/Navbar';

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
        staggerChildren: 0.03,
        delayChildren: 0.05
      }
    }
  };

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden selection:bg-primary-500/30 font-sans">
      <Scene3D />
      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-24">

        {/* Hero Section */}
        <div className="text-center mt-12 sm:mt-16 mb-12 sm:mb-16 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-[8px] font-black uppercase tracking-[0.3em] mb-6 glow-primary backdrop-blur-md"
          >
            <Zap size={10} className="animate-pulse" />
            <span>Neural Link Protocol v2.4 Active</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tighter leading-[0.85] italic"
          >
            Share and <br />
            <span className="text-gradient text-glow drop-shadow-2xl">Decrypt</span> <br className="sm:hidden" /> Instantly.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-sm sm:text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed font-medium px-4 uppercase tracking-tighter italic"
          >
            The world's most advanced decentralized <span className="text-white">file orbital transfer</span> network.
            Military-grade security, zero-latency delivery.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <button
              onClick={() => window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
              className="px-10 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:bg-primary-50 transition-all active:scale-95 shadow-2xl shadow-white/5"
            >
              Start Uplink
            </button>
            <button
              onClick={() => navigate('/security')}
              className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 backdrop-blur-md"
            >
              Encryption Specs
            </button>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch mb-32 section-perf"
        >
          {/* Upload Section */}
          <motion.div
            variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } }}
            className="glass p-6 sm:p-8 rounded-2xl flex flex-col items-center justify-center text-center group hover:bg-white/[0.04] transition-all duration-700 premium-border relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] -rotate-12 translate-x-1/4 -translate-y-1/4">
              <Upload size={120} />
            </div>

            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-500/10 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 group-hover:rotate-6 transition-all duration-700 shadow-inner border border-primary-500/20">
              <Upload className="text-primary-400" size={22} />
            </div>
            <h2 className="text-lg sm:text-xl font-black mb-2 italic tracking-tight uppercase">Upload Segment</h2>
            <p className="text-gray-500 mb-6 max-w-xs font-black text-[9px] uppercase tracking-[0.3em] leading-loose">Securely encapsulate and broadcast your data into the neural grid.</p>
            <div className="w-full relative z-10">
              <FileUpload />
            </div>
          </motion.div>

          {/* Download Section */}
          <motion.div
            variants={{ hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0 } }}
            className="glass p-6 sm:p-8 rounded-2xl flex flex-col justify-center premium-border h-full relative overflow-hidden"
          >
            <div className="absolute bottom-0 left-0 p-8 opacity-[0.02] rotate-12 -translate-x-1/4 translate-y-1/4">
              <Download size={120} />
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center shadow-inner border border-emerald-500/20">
                  <Download className="text-emerald-400" size={20} />
                </div>
                <h2 className="text-lg sm:text-xl font-black italic tracking-tight uppercase">Retrieve Data</h2>
              </div>

              <p className="text-gray-500 font-black text-[9px] uppercase tracking-[0.3em] leading-loose max-w-sm">Provide the cryptographic signature to materialize the requested data segment.</p>

              <form onSubmit={handleDownload} className="space-y-5">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="SIGNAL KEY"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 sm:py-5 text-center text-2xl sm:text-3xl font-black tracking-[0.4em] focus:outline-none focus:border-primary-500/40 transition-all uppercase placeholder:opacity-5 italic font-mono"
                    value={downloadCode}
                    onChange={(e) => setDownloadCode(e.target.value)}
                    maxLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={downloadCode.length !== 6}
                  className="w-full bg-white text-black hover:bg-gray-100 disabled:opacity-20 disabled:grayscale font-black py-4 rounded-xl transition-all flex items-center justify-center gap-3 text-base active:scale-95 shadow-md uppercase tracking-[0.2em]"
                >
                  Decrypt Signal <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </form>

              <div className="flex items-center gap-2 text-[8px] text-gray-600 justify-center font-black uppercase tracking-[0.4em] border-t border-white/5 pt-5">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>End-to-End Quantum Transit Active</span>
              </div>
            </div>
          </motion.div>
        </motion.div>


        {/* Features Row */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10 section-perf"
        >
          <FeatureCard
            icon={<Globe className="text-primary-400" size={32} />}
            title="Global Link"
            desc="Instant node-to-node replication across the planetary neural mesh."
          />
          <FeatureCard
            icon={<Shield className="text-emerald-400" size={32} />}
            title="Orbital Shield"
            desc="AES-GCM 256-bit encryption with ephemeral key generation."
          />
          <FeatureCard
            icon={<Smartphone className="text-purple-400" size={32} />}
            title="Adaptive Node"
            desc="High-performance interface optimized for low-latency terminal access."
          />
        </motion.div>
      </main>

      {/* Footer Decoration */}
      <footer className="relative z-10 py-24 text-center border-t border-white/5 mt-40 glass">
        <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.8em] mb-10 italic">© 2026 BitShare Neural Systems. Established in the Void.</p>
        <div className="flex justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
          <Share2 size={20} className="hover:text-primary-400 cursor-pointer" />
          <Shield size={20} className="hover:text-emerald-400 cursor-pointer" />
          <Globe size={20} className="hover:text-indigo-400 cursor-pointer" />
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = memo(({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0 }
    }}
    whileHover={{ y: -6 }}
    transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
    className="glass p-8 rounded-xl group border-transparent hover:border-white/10 transition-all duration-700 premium-border gpu-accel relative overflow-hidden"
  >
    <div className="absolute bottom-0 right-0 p-6 opacity-[0.01] rotate-12 group-hover:opacity-[0.03] transition-all duration-700">
      {icon}
    </div>
    <div className="mb-6 p-3.5 bg-white/5 w-fit rounded-lg group-hover:bg-primary-500/20 transition-all duration-700 group-hover:scale-105 shadow-inner border border-white/5">
      {icon}
    </div>
    <h3 className="text-xl font-black mb-2 tracking-tighter uppercase italic text-gradient">{title}</h3>
    <p className="text-gray-500 leading-relaxed font-black text-[9px] uppercase tracking-widest">{desc}</p>
  </motion.div>
));


export default Home;
