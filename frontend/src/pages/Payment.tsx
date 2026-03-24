import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    CreditCard, ShieldCheck, ArrowLeft, Zap, Rocket, 
    Lock, Sparkles, CheckCircle2, Loader2
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Scene3D from '../components/Scene3D';

const Payment = () => {
    const { tier } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Mock Form State
    const [cardData, setCardData] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });

    const tiers: any = {
        PRO: { amount: '$9', storage: '10 GB', icon: <Zap size={24} /> },
        ENTERPRISE: { amount: '$29', storage: '100 GB', icon: <Rocket size={24} /> }
    };

    if (!tiers[tier as string]) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-10">
        <h2 className="text-2xl font-black italic mb-4">SEGMENT NOT FOUND</h2>
        <button onClick={() => navigate('/pricing')} className="bg-primary-600 px-8 py-3 rounded-2xl font-black">RETURN TO GRID</button>
    </div>;

    const currentPlan = tiers[tier as string];

    const handleProcess = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        // Simulated latency for aesthetic effect
        await new Promise(r => setTimeout(r, 2000));

        try {
            await api.post('payments/bypass-upgrade', { tier });
            setSuccess(true);
            toast.success('Neural Link Established');
            setTimeout(() => navigate('/dashboard?payment=success'), 2500);
        } catch (error) {
            toast.error('Recalibration Signal Failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden selection:bg-primary-500/30">
            <div className="fixed inset-0 pointer-events-none opacity-40">
                <Scene3D />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 lg:py-20">
                <button 
                    onClick={() => navigate('/pricing')}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors mb-10 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Grid
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
                    {/* Left: Plan Summary */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-10"
                    >
                        <div>
                            <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 px-4 py-2 rounded-full mb-6">
                                <ShieldCheck size={14} className="text-primary-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400">Secure Node Tunnel</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase mb-6 leading-tight">
                                Finalize <span className="text-primary-500 text-glow">Calibration</span>
                            </h1>
                            <p className="text-gray-500 font-bold text-sm italic leading-relaxed">
                                You are scaling your neural infrastructure to the <span className="text-white">{tier}</span> tier. 
                                This operation will expand your storage capacity to {currentPlan.storage}.
                            </p>
                        </div>

                        <div className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group border-white/10 bg-white/[0.02]">
                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg">
                                        {currentPlan.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-black italic tracking-tight">{tier} Segment</h3>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">One-time provisioning</p>
                                    </div>
                                </div>
                                <div className="text-2xl font-black italic">{currentPlan.amount}</div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <span>Network Fee</span>
                                <span className="text-primary-400">Waived</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-gray-600">
                            <Lock size={16} />
                            <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                AES-256 Encrypted Session. No card data is stored on BitShare nodes.
                            </p>
                        </div>
                    </motion.div>

                    {/* Right: Payment Form */}
                    <AnimatePresence mode="wait">
                        {!success ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="glass p-8 lg:p-10 rounded-[3rem] border-white/5 relative bg-black/40 shadow-2xl"
                            >
                                <div className="flex justify-between items-center mb-10">
                                    <h2 className="text-xl font-black italic uppercase tracking-tighter">Terminal Pay</h2>
                                    <div className="flex gap-2">
                                        <div className="w-8 h-5 bg-white/10 rounded-md border border-white/5" />
                                        <div className="w-8 h-5 bg-white/10 rounded-md border border-white/5" />
                                        <div className="w-8 h-5 bg-white/10 rounded-md border border-white/5" />
                                    </div>
                                </div>

                                <form onSubmit={handleProcess} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Identity on Node</label>
                                        <input 
                                            type="text" 
                                            placeholder="Neural Name" 
                                            required
                                            value={cardData.name}
                                            onChange={e => setCardData({...cardData, name: e.target.value})}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all text-sm font-bold uppercase" 
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Card Sequence</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                            <input 
                                                type="text" 
                                                placeholder="XXXX XXXX XXXX XXXX" 
                                                maxLength={19}
                                                required
                                                value={cardData.number}
                                                onChange={e => setCardData({...cardData, number: e.target.value})}
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all text-sm font-black tracking-widest" 
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Expiry</label>
                                            <input 
                                                type="text" 
                                                placeholder="MM / YY" 
                                                maxLength={5}
                                                required
                                                value={cardData.expiry}
                                                onChange={e => setCardData({...cardData, expiry: e.target.value})}
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all text-sm font-black tracking-tighter" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">CVC</label>
                                            <input 
                                                type="text" 
                                                placeholder="•••" 
                                                maxLength={3}
                                                required
                                                value={cardData.cvv}
                                                onChange={e => setCardData({...cardData, cvv: e.target.value})}
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all text-sm font-black tracking-widest" 
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary-600 hover:bg-primary-500 text-white py-5 rounded-2xl font-black transition-all shadow-xl shadow-primary-500/20 mt-4 active:scale-95 flex items-center justify-center gap-3 group"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                CALIBRATING...
                                            </>
                                        ) : (
                                            <>
                                                UPGRADE SYSTEM <ArrowLeft size={18} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Decorative Dots */}
                                <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-primary-500/10 rounded-full blur-[80px]" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass p-12 lg:p-16 rounded-[4rem] border-primary-500/20 flex flex-col items-center justify-center text-center bg-primary-500/5 shadow-2xl relative overflow-hidden"
                            >
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                    className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center text-white mb-8 shadow-2xl shadow-primary-500/40"
                                >
                                    <CheckCircle2 size={48} />
                                </motion.div>
                                <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-4">Node Calibrated</h2>
                                <p className="text-gray-400 font-bold mb-10 max-w-xs uppercase text-[10px] tracking-widest leading-relaxed">
                                    Your storage capacity has been expanded. Redirecting to your neural workspace...
                                </p>
                                <div className="flex gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>

                                <div className="absolute -top-10 -right-10 opacity-30">
                                    <Sparkles size={80} className="text-primary-400" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Background Decor */}
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />
        </div>
    );
};

export default Payment;
