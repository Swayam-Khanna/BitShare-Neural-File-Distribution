import { useState, useEffect } from 'react';
import { 
    Shield, Key, History, Smartphone, CheckCircle2, AlertCircle, 
    Plus, Zap, Lock, Trash2, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const SecuritySettings = () => {
    const { user, fetchProfile } = useAuthStore();
    const [is2FASettingUp, setIs2FASettingUp] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [is2FAEnabled, setIs2FAEnabled] = useState(user?.isTwoFactorEnabled || false);
    const [loading, setLoading] = useState(false);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    
    // API Keys state
    const [apiKeys, setApiKeys] = useState<any[]>([]);
    const [newKeyLabel, setNewKeyLabel] = useState('');
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setIs2FAEnabled(user.isTwoFactorEnabled || false);
            fetchAuditLogs();
            fetchApiKeys();
        }
    }, [user]);

    const fetchAuditLogs = async () => {
        try {
            const { data } = await api.get('files/audit-logs');
            setAuditLogs(data);
        } catch (error) {
            console.error("Failed to fetch audit logs");
        }
    };

    const fetchApiKeys = async () => {
        try {
            const { data } = await api.get('auth/keys');
            setApiKeys(data);
        } catch (error) {
            console.error("Failed to fetch API keys");
        }
    };

    const handleCreateKey = async () => {
        if (!newKeyLabel.trim()) return toast.error("Label required");
        setLoading(true);
        try {
            const { data } = await api.post('auth/keys', { label: newKeyLabel });
            setGeneratedKey(data.apiKey);
            setNewKeyLabel('');
            fetchApiKeys();
            toast.success("Node Key Generated");
        } catch (error) {
            toast.error("Generation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteKey = async (id: string) => {
        if (!confirm("Revoke this key? All connected nodes will lose access.")) return;
        try {
            await api.delete(`auth/keys/${id}`);
            fetchApiKeys();
            toast.success("Key Revoked");
        } catch (error) {
            toast.error("Revocation failed");
        }
    };

    const handleSetup2FA = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('auth/2fa/setup');
            setQrCode(data.qrCodeUrl);
            setIs2FASettingUp(true);
        } catch (error) {
            toast.error("Failed to initiate 2FA setup");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2FA = async () => {
        if (verificationCode.length !== 6) return toast.error("Enter 6-digit code");
        setLoading(true);
        try {
            await api.post('auth/2fa/verify', { token: verificationCode });
            toast.success("Identity Guard Activated");
            setIs2FASettingUp(false);
            setIs2FAEnabled(true);
            await fetchProfile();
        } catch (error) {
            toast.error("Verification failed. Check the code.");
        } finally {
            setLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!confirm("Disable Identity Guard? This reduces your account security.")) return;
        setLoading(true);
        try {
            await api.post('auth/2fa/disable');
            toast.success("Identity Guard Deactivated");
            setIs2FAEnabled(false);
            await fetchProfile();
        } catch (error) {
            toast.error("Failed to disable 2FA");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                   <h1 className="text-3xl lg:text-4xl font-black tracking-tight italic mb-2 text-glow flex items-center gap-4">
                     <Shield className="text-primary-500" size={32} /> Security Terminal
                   </h1>
                   <p className="text-gray-500 font-bold text-[10px] lg:text-sm tracking-wide uppercase opacity-70">
                     Configure neural encryption and identity layers.
                   </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-10">
                {/* 2FA Section */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass rounded-[2.5rem] lg:rounded-[3rem] p-6 lg:p-10 border-white/5 space-y-8 relative overflow-hidden"
                >
                    <div className="flex items-center gap-4 mb-2">
                        <div className={`p-4 rounded-2xl ${is2FAEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-primary-500/10 text-primary-400'} border border-white/5`}>
                            <Lock size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black italic uppercase tracking-widest">Two-Factor Authentication</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Status: {is2FAEnabled ? 'ACTIVE SIGNAL' : 'UNSECURED'}</p>
                        </div>
                    </div>

                    {!is2FAEnabled && !is2FASettingUp && (
                        <div className="space-y-6">
                            <p className="text-sm text-gray-400 leading-relaxed font-medium">
                                Protect your neural data with an extra layer of security. Once enabled, you'll need a unique code from your authenticator app to access the workspace.
                            </p>
                            <button 
                                onClick={handleSetup2FA}
                                disabled={loading}
                                className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-2xl font-black transition-all flex items-center gap-3 shadow-xl shadow-primary-600/30 active:scale-95 group w-full justify-center"
                            >
                                <Smartphone size={20} className="group-hover:rotate-12 transition-transform" /> 
                                {loading ? 'INITIATING...' : 'ACTIVATE IDENTITY GUARD'}
                            </button>
                        </div>
                    )}

                    {is2FASettingUp && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div className="flex flex-col items-center gap-8 bg-black/40 p-8 rounded-[2.5rem] border border-white/5">
                                <div className="p-4 bg-white rounded-3xl shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Scan this code with Google Authenticator or Authy</p>
                                    <div className="flex items-center gap-2 justify-center">
                                        <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                                        <span className="text-[10px] font-black italic tracking-widest text-primary-400">SIGNAL SYNC PENDING</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <input 
                                    type="text" 
                                    placeholder="Enter 6-digit Verification Code" 
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-black text-center text-xl tracking-[0.5em]"
                                    maxLength={6}
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                />
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => setIs2FASettingUp(false)}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 py-4 rounded-2xl font-black transition-all text-xs uppercase tracking-widest"
                                    >
                                        ABORT
                                    </button>
                                    <button 
                                        onClick={handleVerify2FA}
                                        disabled={loading}
                                        className="flex-2 bg-primary-600 hover:bg-primary-500 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-xl shadow-primary-600/30 disabled:opacity-50"
                                    >
                                        {loading ? 'VERIFYING...' : 'FINALIZE SYNC'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {is2FAEnabled && (
                        <div className="space-y-8">
                            <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[2.5rem] flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                                    <CheckCircle2 size={32} />
                                </div>
                                <div>
                                    <p className="font-black italic text-lg tracking-tight">IDENTITY GUARD ACTIVE</p>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Your account is secured with multi-factor authentication.</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleDisable2FA}
                                disabled={loading}
                                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 py-4 rounded-2xl font-black transition-all text-xs uppercase tracking-[0.2em] border border-red-500/20"
                            >
                                DEACTIVATE SECURITY LAYER
                            </button>
                        </div>
                    )}

                    <div className="absolute -right-20 -bottom-20 opacity-[0.02] pointer-events-none">
                        <Lock size={300} />
                    </div>
                </motion.div>

                {/* Audit Logs Section */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass rounded-[3rem] p-10 border-white/5 flex flex-col h-full"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-primary-400">
                                <History size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black italic uppercase tracking-widest">Audit Terminal</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Live Sequence Feed</p>
                            </div>
                        </div>
                        <button onClick={fetchAuditLogs} className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all"><Zap size={18} /></button>
                    </div>

                    <div className="flex-1 space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {auditLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-40 py-20">
                                <AlertCircle size={40} className="mb-4 text-gray-600" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">NO SEQUENCES LOGGED</p>
                            </div>
                        ) : (
                            auditLogs.map((log: any, i: number) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass-dark p-6 rounded-2xl border border-white/5 group hover:bg-white/[0.03] transition-all"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="w-1.5 h-10 bg-primary-500 rounded-full" />
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-tight italic">{log.action}</p>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                                    {log.fileName ? `File: ${log.fileName}` : `Performed by: ${log.performedBy?.name || 'SYSTEM'}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-700">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                            <p className="text-[8px] font-bold text-gray-700">{new Date(log.timestamp).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    {log.details && (
                                        <div className="mt-4 p-3 bg-black/40 rounded-xl text-[9px] font-mono text-gray-600 border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {JSON.stringify(log.details)}
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>

            {/* API Keys Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-[3rem] p-10 border-white/5"
            >
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-purple-400">
                            <Key size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black italic uppercase tracking-widest">Developer Synapse</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">External Node API Keys</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Key Label</label>
                           <input 
                                type="text" 
                                placeholder="Production Node A" 
                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-bold"
                                value={newKeyLabel}
                                onChange={(e) => setNewKeyLabel(e.target.value)}
                           />
                           <button 
                                onClick={handleCreateKey}
                                disabled={loading}
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white px-6 py-4 rounded-2xl font-black transition-all flex items-center gap-3 shadow-xl shadow-purple-600/30 active:scale-95 group justify-center text-xs uppercase tracking-widest"
                           >
                                <Plus size={18} /> {loading ? 'GENERATING...' : 'GENERATE NEW KEY'}
                           </button>
                        </div>

                        <AnimatePresence>
                            {generatedKey && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl space-y-4"
                                >
                                    <div className="flex items-center gap-2 text-emerald-400 font-black italic text-xs">
                                        <AlertCircle size={14} /> ONE-TIME KEY DISPLAY
                                    </div>
                                    <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                                        <code className="text-[10px] font-mono text-emerald-300 break-all">{generatedKey}</code>
                                        <button onClick={() => { navigator.clipboard.writeText(generatedKey); toast.success("Key Copied"); }} className="p-2 hover:bg-white/5 rounded-lg text-emerald-400"><Copy size={14} /></button>
                                    </div>
                                    <button onClick={() => setGeneratedKey(null)} className="w-full py-2 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all">I HAVE SAVED IT</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="lg:col-span-2 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {apiKeys.length === 0 ? (
                            <div className="bg-white/5 rounded-3xl p-12 text-center border border-white/5 border-dashed">
                                <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em] italic">No active node connections.</p>
                            </div>
                        ) : (
                            apiKeys.map((key) => (
                                <div key={key.id} className="glass-dark p-6 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/[0.03] transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-purple-400">
                                            <Zap size={20} />
                                        </div>
                                        <div>
                                            <p className="font-black text-sm tracking-tight italic">{key.label}</p>
                                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">
                                                Created {new Date(key.createdAt).toLocaleDateString()} • {key.keyPreview}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteKey(key.id)}
                                        className="p-3 bg-white/5 hover:bg-red-500/20 rounded-xl text-gray-500 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SecuritySettings;
