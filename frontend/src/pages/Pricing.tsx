import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Rocket, Shield, ArrowRight, Share2, Sparkles, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import Scene3D from '../components/Scene3D';

const PlanCard = ({ tier, price, storage, features, icon, highlighted = false, onSelect, onBypass, loading }: any) => (
  <motion.div 
    whileHover={{ y: -10, scale: 1.02 }}
    className={`glass p-10 rounded-[3rem] border ${highlighted ? 'border-primary-500 bg-primary-500/5 shadow-2xl shadow-primary-500/20' : 'border-white/5'} relative overflow-hidden group flex flex-col h-full`}
  >
    {highlighted && (
      <div className="absolute top-6 right-6 bg-primary-600 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
        Recommended
      </div>
    )}

    <div className="mb-8">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${highlighted ? 'bg-primary-500 text-white' : 'bg-white/5 text-primary-400'} shadow-lg group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">{tier}</h3>
        <div className="flex items-baseline gap-1 mb-4">
            <span className="text-4xl font-black italic">${price}</span>
            <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">/ ONE-TIME</span>
        </div>
        <p className="text-gray-500 text-xs font-bold leading-relaxed">{storage} of high-speed neural storage capacity.</p>
    </div>

    <div className="space-y-4 mb-10 flex-1">
        {features.map((f: string, i: number) => (
            <div key={i} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${highlighted ? 'bg-primary-500/20 text-primary-400' : 'bg-white/5 text-gray-500'}`}>
                    <Check size={12} strokeWidth={3} />
                </div>
                <span className="text-xs font-bold text-gray-400">{f}</span>
            </div>
        ))}
    </div>

    <button 
        onClick={() => onSelect(tier)}
        disabled={loading}
        className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 active:scale-95 group/btn ${
            highlighted 
                ? 'bg-white text-black hover:bg-gray-100 shadow-xl shadow-white/5' 
                : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
        }`}
    >
        {loading ? 'INITIATING...' : 'UPGRADE NODE'} 
        <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
    </button>

    <button 
        onClick={(e) => { e.stopPropagation(); onBypass(tier); }}
        className="mt-4 text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-primary-400 transition-colors opacity-40 hover:opacity-100"
    >
        [ DEPLOY NEURAL BYPASS ]
    </button>

    <div className="absolute -right-10 -bottom-10 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-700 pointer-events-none">
        {icon}
    </div>
  </motion.div>
);

const Pricing = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleUpgrade = (tier: string) => {
    if (tier === 'FREE') return navigate('/dashboard');
    navigate(`/payment/${tier}`);
  };

  const handleBypass = async (tier: string) => {
    setLoading(tier);
    try {
      await api.post('payments/bypass-upgrade', { tier });
      toast.success(`Neural Bypass Active: Node Upgraded to ${tier}`);
      setTimeout(() => navigate('/dashboard?payment=success'), 1000);
    } catch (error: any) {
      toast.error('Bypass Failed');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden selection:bg-primary-500/30">
        <div className="fixed inset-0 pointer-events-none opacity-40">
            <Scene3D />
        </div>

        {/* Header */}
        <nav className="h-20 lg:h-24 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
            <div onClick={() => navigate('/')} className="flex items-center gap-3 text-2xl font-bold cursor-pointer group">
                <div className="p-2 bg-primary-600 rounded-lg shadow-lg shadow-primary-500/20">
                    <Share2 className="text-white" size={20} />
                </div>
                <span className="tracking-tight italic font-black">BitShare</span>
            </div>
            <button 
                onClick={() => navigate('/dashboard')}
                className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors flex items-center gap-2"
            >
                <span className="hidden sm:inline">Back to Dashboard</span> <ArrowRight size={14} />
            </button>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-20">
            <div className="text-center mb-12 lg:mb-20">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 px-4 py-2 rounded-full mb-6"
                >
                    <Sparkles size={14} className="text-primary-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400">Scale Your Neural Network</span>
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-6xl font-black italic tracking-tighter uppercase mb-6"
                >
                    Elevate Your <span className="text-primary-500 text-glow">Capacity</span>
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-500 font-bold text-lg max-w-2xl mx-auto italic"
                >
                    Choose the throughput layer that fits your workflow. Enterprise-grade encryption included in every segment.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <PlanCard 
                    tier="FREE"
                    price="0"
                    storage="100 MB"
                    features={[
                        "Basic Synapse Analytics",
                        "Standard Encryption",
                        "Global Content Sharing",
                        "Mobile & PWA Ready"
                    ]}
                    icon={<Globe size={32} />}
                    onSelect={handleUpgrade}
                    onBypass={handleBypass}
                    loading={loading === 'FREE'}
                />
                <PlanCard 
                    tier="PRO"
                    price="9"
                    storage="10 GB"
                    highlighted={true}
                    features={[
                        "Everything in FREE",
                        "Advanced Analytics & Heatmaps",
                        "Identity Guard (2FA)",
                        "Developer API Synapse",
                        "Priority Connection Speeds"
                    ]}
                    icon={<Zap size={32} />}
                    onSelect={handleUpgrade}
                    onBypass={handleBypass}
                    loading={loading === 'PRO'}
                />
                <PlanCard 
                    tier="ENTERPRISE"
                    price="29"
                    storage="100 GB"
                    features={[
                        "Everything in PRO",
                        "Unlimited Segment Access",
                        "Dedicated Node Support",
                        "Custom Storage Quotas",
                        "Neural Compliance Logs"
                    ]}
                    icon={<Rocket size={32} />}
                    onSelect={handleUpgrade}
                    onBypass={handleBypass}
                    loading={loading === 'ENTERPRISE'}
                />
            </div>

            {/* Comparison Table Small Header */}
            <div className="glass rounded-[3rem] p-12 border-white/5 text-center relative overflow-hidden">
                <div className="relative z-10">
                    <Shield className="text-primary-500 mx-auto mb-6" size={48} />
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-4">Enterprise Security Standard</h2>
                    <p className="text-gray-500 text-sm font-bold max-w-xl mx-auto leading-relaxed">
                        All plans include end-to-end neural encryption, decentralized node distribution, and industrial-grade TLS 1.3 tunneling.
                    </p>
                </div>
                <div className="absolute -left-20 -bottom-20 opacity-[0.02] pointer-events-none">
                    <Shield size={300} />
                </div>
            </div>
        </div>

        {/* Background Footer Effect */}
        <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-primary-600/10 to-transparent pointer-events-none" />
    </div>
  );
};

export default Pricing;
