import { useState, useEffect } from 'react';
import { Upload, Loader2, Cpu, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../services/api';

const ProfileForm = ({ user, onClose }: any) => {
    const { updateProfile } = useAuthStore();
    const [name, setName] = useState(user?.name || '');
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusIndex, setStatusIndex] = useState(0);

    const statusMessages = [
        "CALIBRATING NODE...",
        "ENCRYPTING PAYLOAD...",
        "VERIFYING IDENTITY...",
        "ESTABLISHING LINK...",
        "FINALIZING SYNC..."
    ];

    useEffect(() => {
        let interval: any;
        if (loading) {
            interval = setInterval(() => {
                setStatusIndex((prev) => (prev + 1) % statusMessages.length);
            }, 300);
        } else {
            setStatusIndex(0);
        }
        return () => clearInterval(interval);
    }, [loading]);

    const getAvatarUrl = (path: string | undefined | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const base = api.defaults.baseURL || '';
        const cleanB = base.endsWith('/') ? base.slice(0, -1) : base;
        const baseUrlWithoutApi = cleanB.replace('/api', '');
        let cleanP = path;
        if (!cleanP.startsWith('/')) cleanP = `/${cleanP}`;
        return `${baseUrlWithoutApi}${cleanP}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('name', name);
            if (username.trim()) fd.append('username', username.trim());
            fd.append('email', email);
            if (avatarFile) fd.append('avatar', avatarFile);
            if (password) fd.append('password', password);
            await updateProfile(fd);
            toast.success('System Updated');
            onClose();
        } catch (error: any) { toast.error('Sync Failed'); } finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 relative">
            {/* Loading Overlay Hint */}
            <AnimatePresence>
                {loading && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10 bg-black/5 pointer-events-none rounded-3xl"
                    />
                )}
            </AnimatePresence>

            <div className="flex justify-center mb-8 relative">
                <div 
                    className="relative group cursor-pointer" 
                    onClick={() => !loading && document.getElementById('av-up')?.click()}
                >
                    <div className="w-28 h-28 rounded-[2rem] overflow-hidden border-2 border-primary-500 shadow-2xl relative bg-black/40 group-hover:scale-105 transition-all">
                        {preview ? (
                            <img src={preview} className="w-full h-full object-cover" />
                        ) : user?.avatar ? (
                            <img src={getAvatarUrl(user.avatar) || ''} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-black text-primary-500 uppercase italic">
                                {name?.[0]}
                            </div>
                        )}
                        
                        {/* Static Hover State */}
                        <div className="absolute inset-0 bg-primary-600/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload size={28} className="text-white animate-bounce" />
                        </div>

                        {/* Neural Scanner Overlay */}
                        <AnimatePresence>
                            {loading && (
                                <>
                                    <div className="scanner-laser" />
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute inset-0 bg-primary-500/10 backdrop-blur-[2px] transition-all"
                                    />
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                    <input 
                        id="av-up" 
                        type="file" 
                        accept="image/*" 
                        disabled={loading}
                        onChange={(e) => { 
                            const f = e.target.files?.[0]; 
                            if (f) { 
                                setAvatarFile(f); 
                                setPreview(URL.createObjectURL(f)); 
                            } 
                        }} 
                        className="hidden" 
                    />
                </div>
            </div>

            <motion.div 
                animate={{ opacity: loading ? 0.4 : 1 }}
                className="space-y-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Identity</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm font-bold" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Alias</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm font-bold" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Encrypted Mail</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm font-bold" required />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Access Key</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm font-bold" placeholder="REMAIN UNCHANGED" />
                </div>
            </motion.div>

            <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-white text-black hover:bg-gray-100 py-4 rounded-2xl font-black transition-all shadow-xl shadow-white/5 mt-4 disabled:opacity-80 active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden"
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin text-primary-600" size={18} />
                        <span className="text-[12px] tracking-[0.2em]">{statusMessages[statusIndex]}</span>
                    </>
                ) : (
                    <>
                        <ShieldCheck size={18} />
                        <span>UPDATE SYSTEM</span>
                    </>
                )}
            </button>

            {/* Visual Status Hint */}
            <AnimatePresence>
                {loading && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2 text-[8px] font-black text-primary-400 uppercase tracking-[0.4em] pt-2"
                    >
                        <Cpu size={12} className="animate-pulse" />
                        Secure Session Active
                        <Zap size={10} className="text-yellow-500" />
                    </motion.div>
                )}
            </AnimatePresence>
        </form>
    );
};

export default ProfileForm;
