import { useState, useEffect } from 'react';
import { 
    Users, Shield, Zap, Database, Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminPanel = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTier, setFilterTier] = useState('ALL');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('admin/users');
            setUsers(data);
        } catch (error) {
            toast.error("Governance fetch failed");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTier = async (userId: string, tier: string, storage: number) => {
        try {
            await api.put('admin/users/tier', { userId, tier, storageLimit: storage });
            toast.success(`Node recalibrated to ${tier}`);
            fetchUsers();
        } catch (error) {
            toast.error("Recalibration failed");
        }
    };

    const handleToggleAdmin = async (userId: string) => {
        try {
            const { data } = await api.put('admin/users/admin', { userId });
            toast.success(data.message);
            fetchUsers();
        } catch (error) {
            toast.error("Clearance update failed");
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTier = filterTier === 'ALL' || u.tier === filterTier;
        return matchesSearch && matchesTier;
    });

    return (
        <div className="space-y-10 pb-10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                   <h1 className="text-3xl lg:text-4xl font-black tracking-tight italic mb-2 text-glow flex items-center gap-4">
                     <Shield className="text-red-500" size={32} /> Governance Terminal
                   </h1>
                   <p className="text-gray-500 font-bold text-[10px] lg:text-sm tracking-wide uppercase opacity-70">
                     Administrative control over neural nodes and storage allocation.
                   </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                    <div className="relative group flex-1 sm:flex-none">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-400 transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Find node..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all w-full sm:w-64"
                        />
                    </div>
                    <select 
                        value={filterTier}
                        onChange={(e) => setFilterTier(e.target.value)}
                        className="bg-white/5 border border-white/5 rounded-2xl px-6 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all appearance-none cursor-pointer text-center sm:text-left"
                    >
                        <option value="ALL">ALL SEGMENTS</option>
                        <option value="FREE">FREE</option>
                        <option value="PRO">PRO</option>
                        <option value="ENTERPRISE">ENTERPRISE</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="glass rounded-[3rem] overflow-hidden border-white/5 shadow-2xl overflow-x-auto bg-white/[0.01]">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                      <tr className="border-b border-white/5 text-gray-500 text-[10px] uppercase font-black tracking-[0.2em]">
                        <th className="px-8 py-6">Identity Node</th>
                        <th className="px-8 py-6">Current Tier</th>
                        <th className="px-8 py-6 text-center">Neural Load</th>
                        <th className="px-8 py-6 text-right">Recalibration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03] text-sm">
                        {loading ? (
                          <tr><td colSpan={4} className="p-20 text-center font-black text-gray-600 animate-pulse tracking-[0.5em] italic uppercase">SCANNING INFRASTRUCTURE...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                          <tr><td colSpan={4} className="p-24 text-center font-black text-gray-600 italic tracking-widest opacity-40 uppercase">NO NODES MATCHING QUERY</td></tr>
                        ) : (
                            filteredUsers.map((u, idx) => (
                                <motion.tr 
                                    key={u._id} 
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    transition={{ delay: idx * 0.05 }}
                                    className="hover:bg-white/[0.03] transition-all group cursor-default"
                                >
                                    <td className="px-8 py-5 flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic text-lg ${u.isAdmin ? 'bg-red-500/10 text-red-400' : 'bg-primary-500/10 text-primary-400'} border border-white/5 shadow-lg group-hover:scale-110 transition-transform`}>
                                            {u.name?.[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-black italic tracking-tight">{u.name}</p>
                                                {u.isAdmin && <span className="bg-red-500/10 text-red-500 text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">ADMIN</span>}
                                            </div>
                                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1 italic">{u.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${u.tier === 'FREE' ? 'bg-gray-500' : u.tier === 'PRO' ? 'bg-primary-500' : 'bg-purple-500'} animate-pulse`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{u.tier}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="w-48 mx-auto">
                                            <div className="flex justify-between text-[8px] mb-1 font-black uppercase tracking-widest text-gray-600">
                                                <span>{(u.usedStorage / 1024 / 1024).toFixed(1)}MB</span>
                                                <span>{(u.storageLimit / 1024 / 1024).toFixed(0)}MB</span>
                                            </div>
                                            <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden border border-white/5">
                                                <div 
                                                    className="bg-primary-500 h-full rounded-full opacity-60" 
                                                    style={{ width: `${Math.min((u.usedStorage / u.storageLimit) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex bg-black/40 border border-white/10 rounded-xl p-1">
                                                <button 
                                                    onClick={() => handleUpdateTier(u._id, 'FREE', 100 * 1024 * 1024)}
                                                    className={`px-3 py-1 rounded-lg text-[8px] font-black transition-all ${u.tier === 'FREE' ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-white'}`}
                                                >
                                                    FREE
                                                </button>
                                                <button 
                                                    onClick={() => handleUpdateTier(u._id, 'PRO', 10 * 1024 * 1024 * 1024)}
                                                    className={`px-3 py-1 rounded-lg text-[8px] font-black transition-all ${u.tier === 'PRO' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'text-gray-600 hover:text-white'}`}
                                                >
                                                    PRO
                                                </button>
                                                <button 
                                                    onClick={() => handleUpdateTier(u._id, 'ENTERPRISE', 100 * 1024 * 1024 * 1024)}
                                                    className={`px-3 py-1 rounded-lg text-[8px] font-black transition-all ${u.tier === 'ENTERPRISE' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-gray-600 hover:text-white'}`}
                                                >
                                                    ENT
                                                </button>
                                            </div>
                                            <button 
                                                onClick={() => handleToggleAdmin(u._id)}
                                                className={`p-3 rounded-xl transition-all ${u.isAdmin ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-gray-500 hover:text-red-400'}`}
                                                title="Toggle Admin Access"
                                            >
                                                <Shield size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
                    <Database size={24} className="text-primary-400 mb-6" />
                    <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Network Load</h3>
                    <p className="text-4xl font-black tracking-tighter">
                        {(users.reduce((acc, u) => acc + (u.usedStorage || 0), 0) / 1024 / 1024).toFixed(1)} MB
                    </p>
                    <div className="absolute -right-4 -bottom-4 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-all">
                        <Database size={80} />
                    </div>
                </div>
                <div className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
                    <Zap size={24} className="text-purple-400 mb-6" />
                    <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Elite Nodes (PRO/ENT)</h3>
                    <p className="text-4xl font-black tracking-tighter">
                        {users.filter(u => u.tier !== 'FREE').length}
                    </p>
                    <div className="absolute -right-4 -bottom-4 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-all">
                        <Zap size={80} />
                    </div>
                </div>
                <div className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
                    <Users size={24} className="text-emerald-400 mb-6" />
                    <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Node Count</h3>
                    <p className="text-4xl font-black tracking-tighter">{users.length}</p>
                    <div className="absolute -right-4 -bottom-4 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-all">
                        <Users size={80} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
