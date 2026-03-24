import { useEffect, useState, Component, type ReactNode } from 'react';
import { 
    LayoutDashboard, File as FileIcon, Settings, LogOut, Search, Bell, Trash2, Copy, Download,
    Activity, Upload, RotateCcw, XCircle, Image as ImageIcon, Share2,
    BarChart3, Globe, Flame, Zap, Shield, ArrowRight, Users, QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useFileStore } from '../store/useFileStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import Scene3D from '../components/Scene3D';
import FileUpload from '../components/FileUpload';
import SecuritySettings from './SecuritySettings';
import AdminPanel from './AdminPanel';

// --- UI HELPERS ---

const SidebarItem = ({ icon, label, active = false, onClick }: any) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
      active 
        ? 'bg-white text-black shadow-xl shadow-white/5 font-bold' 
        : 'text-gray-500 hover:bg-white/5 hover:text-white'
    }`}
  >
    <div className={`${active ? 'text-black' : 'text-gray-500 group-hover:text-primary-400'} transition-colors`}>
      {icon}
    </div>
    <span className="text-sm tracking-tight">{label}</span>
    {active && (
      <motion.div 
        layoutId="active-pill"
        className="ml-auto w-1 h-4 bg-primary-500 rounded-full"
      />
    )}
  </button>
);

const MobileNavItem = ({ icon, active = false, onClick }: any) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
      active ? 'text-primary-400' : 'text-gray-500'
    }`}
  >
    <div className={`${active ? 'scale-110' : 'scale-100'} transition-transform`}>
        {icon}
    </div>
    {active && <motion.div layoutId="mobile-active" className="w-1 h-1 bg-primary-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />}
  </button>
);

const StatCard = ({ title, value, icon, desc }: any) => (
  <motion.div 
    whileHover={{ 
        y: -12, 
        scale: 1.02,
        rotateX: 5,
        rotateY: 5,
        boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.25)"
    }} 
    style={{ perspective: 1000 }}
    className="glass p-8 rounded-[2.5rem] cursor-default relative overflow-hidden group border-white/5 transition-all duration-500"
  >
    <div className={`absolute -right-4 -top-4 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 group-hover:scale-110 group-hover:rotate-12`}>
      {icon}
    </div>
    <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl bg-white/5 text-primary-400 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500 shadow-lg group-hover:shadow-primary-500/20`}>
          {icon}
        </div>
    </div>
    <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</h3>
    <p className="text-3xl md:text-4xl font-black tracking-tighter mb-3">{value}</p>
    <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{desc}</span>
    </div>
  </motion.div>
);

const AnalyticsCard = ({ title, value, icon, sub, color }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group h-full"
  >
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-primary-600 transition-all duration-500 shadow-lg`}>
        {icon}
      </div>
      <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 border border-white/5`}>
        Live Signal
      </div>
    </div>
    <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</h3>
    <p className={`text-4xl font-black tracking-tighter mb-2 ${color || 'text-white'}`}>{value}</p>
    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{sub}</p>
    <div className="absolute -right-4 -bottom-4 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-700 pointer-events-none">
       {icon}
    </div>
  </motion.div>
);

const Heatmap = ({ points }: { points: any[] }) => {
  return (
    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
      <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-4 opacity-10 pointer-events-none">
        {Array.from({ length: 72 }).map((_, i) => (
          <div key={i} className="border border-white/10 rounded-sm" />
        ))}
      </div>
      
      {points.map((p, i) => (
        <motion.div
           key={i}
           initial={{ scale: 0, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ delay: i * 0.1 }}
           className="absolute w-3 h-3 bg-primary-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)]"
           style={{ 
             left: `${((p.lng + 180) / 360) * 80 + 10}%`, 
             top: `${(1 - (p.lat + 90) / 180) * 70 + 15}%` 
           }}
        >
          <div className="absolute inset-0 bg-primary-400 rounded-full animate-ping opacity-50" />
          <div className="absolute -inset-2 bg-primary-500/10 rounded-full blur-sm" />
        </motion.div>
      ))}

      <div className="text-center relative z-10">
        <Globe size={180} className="text-white/5 animate-pulse" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 mt-8">Global Grid Status: Active</p>
      </div>
    </div>
  );
};

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  public state = { hasError: false };
  public static getDerivedStateFromError() { return { hasError: true }; }
  public render() {
    if (this.state.hasError) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 text-center"><h2 className="text-2xl font-bold mb-4">Dashboard Error</h2><button onClick={() => window.location.reload()} className="bg-blue-600 px-8 py-3 rounded-xl font-bold">Refresh Page</button></div>;
    return this.props.children;
  }
}

const ProfileForm = ({ user, onClose }: any) => {
    const { updateProfile } = useAuthStore();
    const [name, setName] = useState(user?.name || '');
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const getAvatarUrl = (path: string | undefined | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const base = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:8000';
        const cleanB = base.endsWith('/') ? base.slice(0, -1) : base;
        let cleanP = path.startsWith('/public/') ? path.replace('/public/', '/') : path;
        if (!cleanP.startsWith('/')) cleanP = `/${cleanP}`;
        return `${cleanB}${cleanP}`;
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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center mb-8">
                <div 
                    className="relative group cursor-pointer" 
                    onClick={() => document.getElementById('av-up')?.click()}
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
                        <div className="absolute inset-0 bg-primary-600/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                            <Upload size={28} className="text-white animate-bounce" />
                        </div>
                    </div>
                    <input 
                        id="av-up" 
                        type="file" 
                        accept="image/*" 
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Identity</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm font-bold" required />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Alias</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm font-bold" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Encrypted Mail</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm font-bold" required />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Access Key</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm font-bold" placeholder="REMAIN UNCHANGED" />
            </div>

            <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-white text-black hover:bg-gray-100 py-4 rounded-2xl font-black transition-all shadow-xl shadow-white/5 mt-4 disabled:opacity-50 active:scale-95"
            >
                {loading ? 'SYNCING...' : 'UPDATE SYSTEM'}
            </button>
        </form>
    );
};

const DashboardContent = () => {
  const { user, logout, fetchProfile } = useAuthStore();
  const { files, trash, fetchFiles, fetchTrash, deleteFile, restoreFile, permanentDeleteFile, loading } = useFileStore();
  const { initSocket, socket, unreadCount } = useNotificationStore();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, markAsRead, clearNotifications } = useNotificationStore();
  const [showQrModal, setShowQrModal] = useState<any>(null);
  const [storageStats, setStorageStats] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'MEDIA' | 'DOCS' | 'CODE'>('ALL');
  const [currentView, setCurrentView] = useState<'files' | 'trash' | 'analytics' | 'security' | 'admin'>('files');

  useEffect(() => { 
    fetchFiles(); fetchTrash(); fetchActivities(); if (user?._id) initSocket(user._id); 
    
    // Check for payment success
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      toast.success('Neural Capacity Upgraded!', { icon: '🚀', duration: 5000 });
      fetchProfile(); // Refresh tier/storage data
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user?._id, currentView]);

  useEffect(() => {
    if (socket) {
      const h = (a: any) => setActivities(p => [a, ...p].slice(0, 10));
      socket.on('activityFeedUpdate', h);
      return () => { socket.off('activityFeedUpdate', h); };
    }
  }, [socket]);



  useEffect(() => {
    if (user?._id) fetchStats();
  }, [user?._id, files.length]);

  const fetchStats = async () => {
    try { const { data } = await api.get('files/storage-stats'); setStorageStats(data); } catch (e) {}
  };

  const fetchActivities = async () => {
    try { const { data } = await api.get('files/activities'); setActivities(Array.isArray(data) ? data : []); } catch (e) { setActivities([]); }
  };

  const getFiltered = () => {
    const src = currentView === 'files' ? files : trash;
    let items = Array.isArray(src) ? src : [];
    
    // Category Filter
    if (selectedCategory !== 'ALL') {
        items = items.filter(f => {
            const type = f.fileType?.toLowerCase() || '';
            if (selectedCategory === 'MEDIA') return type.includes('image') || type.includes('video') || type.includes('audio');
            if (selectedCategory === 'DOCS') return type.includes('pdf') || type.includes('text') || type.includes('word') || type.includes('sheet');
            if (selectedCategory === 'CODE') return type.includes('javascript') || type.includes('json') || type.includes('html') || type.includes('css') || type.includes('typescript');
            return true;
        });
    }

    return items
      .filter(f => f.originalName?.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime());
  };

  const getAvatarUrl = (path: string | undefined | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:8000';
    const cleanB = base.endsWith('/') ? base.slice(0, -1) : base;
    let cleanP = path.startsWith('/public/') ? path.replace('/public/', '/') : path;
    if (!cleanP.startsWith('/')) cleanP = `/${cleanP}`;
    return `${cleanB}${cleanP}`;
  };

  if (!user) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  const cFiles = getFiltered();
  const totalSize = Array.isArray(files) ? (files as any[]).reduce((acc, f) => acc + (f.size || 0), 0) : 0;
  const storagePercent = Math.min((totalSize / (user?.storageLimit || 100 * 1024 * 1024)) * 100, 100);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white relative flex-col lg:flex-row pb-20 lg:pb-0">
      <div className="opacity-30 fixed inset-0 pointer-events-none"><Scene3D /></div>

      {/* Sidebar - Desktop */}
      <aside className="w-72 border-r border-white/5 p-8 hidden lg:flex flex-col gap-10 relative z-10 glass-dark">
        <div onClick={() => navigate('/')} className="flex items-center gap-3 text-2xl font-bold px-2 cursor-pointer group transition-transform hover:scale-105">
          <div className="p-2 bg-primary-600 rounded-lg shadow-lg shadow-primary-500/20">
            <Share2 className="text-white" size={20} />
          </div>
          <span className="tracking-tight italic font-black">BitShare</span>
        </div>

        <nav className="flex-1 space-y-3">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Workspace" active={currentView === 'files'} onClick={() => setCurrentView('files')} />
          <SidebarItem icon={<BarChart3 size={20} />} label="Analytics" active={currentView === 'analytics'} onClick={() => setCurrentView('analytics')} />
          <SidebarItem icon={<Shield size={20} />} label="Security" active={currentView === 'security'} onClick={() => setCurrentView('security')} />
          {user?.isAdmin && (
            <SidebarItem icon={<Users size={20} />} label="Governance" active={currentView === 'admin'} onClick={() => setCurrentView('admin')} />
          )}
          <SidebarItem icon={<Trash2 size={20} />} label="Archive" active={currentView === 'trash'} onClick={() => setCurrentView('trash')} />
          <SidebarItem icon={<Settings size={20} />} label="System Profile" onClick={() => setShowProfileModal(true)} />
        </nav>

        <div className="glass p-5 rounded-3xl border-white/5 bg-white/[0.02]">
          <div className="flex justify-between text-[10px] mb-3 font-black uppercase tracking-widest text-gray-500">
            <span>Storage Capacity</span>
            <button 
                onClick={() => navigate('/pricing')}
                className="text-primary-400 hover:text-primary-300 transition-colors font-black flex items-center gap-1"
            >
                UPGRADE <ArrowRight size={10} />
            </button>
          </div>
          <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden p-0.5 border border-white/5 mb-3">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${storagePercent}%` }}
              className="bg-primary-500 h-full rounded-full shadow-lg shadow-primary-500/40" 
            />
          </div>
          <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tight text-center">
            {(totalSize / 1024 / 1024).toFixed(1)}MB / {((user?.storageLimit || 100 * 1024 * 1024) / 1024 / 1024).toFixed(0)}MB USED
          </p>
        </div>

        <button onClick={() => logout()} className="flex items-center gap-3 px-6 py-4 text-gray-500 hover:text-white transition-all font-black text-xs uppercase tracking-[0.2em] hover:bg-white/5 rounded-2xl active:scale-95">
          <LogOut size={18} className="text-red-500" /> Disconnect
        </button>
      </aside>

      {/* Mobile Nav Bar - Bottom */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-2xl border-t border-white/10 z-[100] flex lg:hidden items-center justify-around px-6">
          <MobileNavItem icon={<LayoutDashboard size={22} />} active={currentView === 'files'} onClick={() => setCurrentView('files')} />
          <MobileNavItem icon={<BarChart3 size={22} />} active={currentView === 'analytics'} onClick={() => setCurrentView('analytics')} />
          <button 
            onClick={() => setShowUploadModal(true)}
            className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-500/40 -translate-y-6 active:scale-95 transition-transform"
          >
            <Upload size={24} />
          </button>
          <MobileNavItem icon={<Shield size={22} />} active={currentView === 'security'} onClick={() => setCurrentView('security')} />
          <MobileNavItem icon={<Settings size={22} />} active={false} onClick={() => setShowProfileModal(true)} />
      </nav>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Header */}
        <header className="h-20 lg:h-24 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 bg-black/20 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex-1 max-w-2xl relative hidden md:block group mr-6">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-400 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Query files, patterns, or metadata..." 
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-14 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-medium text-sm placeholder:text-gray-600" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          <div className="flex items-center gap-2 lg:gap-3 lg:hidden">
             <div className="p-2 bg-primary-600 rounded-lg">
                <Share2 size={18} className="text-white" />
             </div>
             <span className="font-black italic text-lg tracking-tight">BitShare</span>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white relative transition-all active:scale-95"
            >
              <Bell size={20} />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full border-2 border-black" />}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-24 right-10 w-80 glass-dark border border-white/10 rounded-[2rem] shadow-2xl p-6 z-[100] overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Signal Feed</h4>
                    <button onClick={clearNotifications} className="text-[8px] font-black text-primary-400 hover:text-white transition-colors uppercase tracking-widest">Clear All</button>
                  </div>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <p className="text-center py-10 text-[10px] text-gray-600 font-bold uppercase tracking-widest italic">No Passive Signals</p>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => markAsRead(n.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${n.read ? 'bg-white/5 border-white/5 opacity-60' : 'bg-primary-500/10 border-primary-500/20 shadow-lg shadow-primary-500/5'}`}
                        >
                          <p className="text-[10px] font-black italic mb-1 line-clamp-2">{n.message}</p>
                          <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{new Date(n.createdAt).toLocaleTimeString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex items-center gap-3 lg:gap-4 pl-4 lg:pl-6 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <div className="flex items-center gap-2 justify-end">
                    {user?.tier !== 'FREE' && (
                        <span className="text-[8px] font-black bg-primary-600 text-white px-2 py-0.5 rounded-full italic">
                            {user?.tier}
                        </span>
                    )}
                    <p className="text-sm font-black tracking-tight leading-none italic">{user?.name}</p>
                </div>
                <p className="text-[10px] text-gray-500 mt-1 uppercase font-black tracking-[0.2em] opacity-60">@{user?.username || 'GUEST'}</p>
              </div>
              <div 
                onClick={() => setShowProfileModal(true)}
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl overflow-hidden border-2 border-primary-500/20 bg-black/40 shadow-xl cursor-pointer hover:border-primary-500 transition-all active:scale-95"
              >
                {user?.avatar ? (
                  <img src={getAvatarUrl(user.avatar) || ''} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-primary-500 uppercase italic text-lg">
                    {user?.name?.[0]}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-10 custom-scrollbar">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentView}
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeOut" }}
                >
                    {currentView === 'admin' && <AdminPanel />}
                    {currentView === 'security' && <SecuritySettings />}
                    {currentView === 'analytics' && (
                        <div className="space-y-10 pb-10">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                                <AnalyticsCard title="Total Distributions" value={Array.isArray(files) ? (files as any[]).reduce((acc, f) => acc + (f.downloadCount || 0), 0) : 0} icon={<Download size={24} />} sub="Global signal reach" color="text-primary-400" />
                                <AnalyticsCard title="Active Segments" value={Array.isArray(files) ? files.length : 0} icon={<BarChart3 size={24} />} sub="Currently mapped nodes" color="text-emerald-400" />
                                <AnalyticsCard title="Neural Load" value={`${(totalSize / 1024 / 1024).toFixed(1)} MB`} icon={<Zap size={24} />} sub={`${storagePercent.toFixed(1)}% usage intensity`} color="text-purple-400" />
                            </div>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                                <div className="glass rounded-[2.5rem] lg:rounded-[3rem] p-6 lg:p-10 border-white/5 flex flex-col h-[400px] lg:h-[500px]">
                                    <h3 className="text-lg lg:text-xl font-black italic uppercase tracking-widest mb-6 lg:mb-8 flex items-center gap-3"><Globe size={20} className="text-primary-400" /> Global Heatmap</h3>
                                    <div className="flex-1 bg-black/20 rounded-3xl border border-white/5 overflow-hidden flex items-center justify-center p-4 shadow-inner">
                                        <Heatmap points={Array.isArray(files) ? (files as any[]).flatMap(f => (f.downloads || []).map((d: any) => d.geo || {})) : []} />
                                    </div>
                                </div>
                                <div className="glass rounded-[2.5rem] lg:rounded-[3rem] p-6 lg:p-10 border-white/5 flex flex-col">
                                    <h3 className="text-lg lg:text-xl font-black italic uppercase tracking-widest mb-6 lg:mb-8 flex items-center gap-3"><Flame size={20} className="text-orange-400" /> Popular Segments</h3>
                                    <div className="space-y-4">
                                        {(files as any[]).sort((a,b) => (b.downloadCount||0)-(a.downloadCount||0)).slice(0,5).map((file, i) => (
                                            <div key={file._id} className="glass-dark p-4 lg:p-6 rounded-2xl flex items-center justify-between group border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-xl font-black italic text-gray-800 pr-2 group-hover:text-primary-500 uppercase">{i + 1}</div>
                                                    <div className="min-w-0">
                                                        <p className="font-black text-sm truncate max-w-[150px] lg:max-w-[200px] italic">{file.originalName}</p>
                                                        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{(file.size/1024/1024).toFixed(2)} MB • {file.downloadCount} HITS</p>
                                                    </div>
                                                </div>
                                                <Download size={18} className="text-primary-400" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {currentView === 'files' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
                            {/* Most Shared */}
                            <div className="glass p-8 rounded-[3rem] border-white/5 bg-white/[0.01]">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                                    <Flame size={14} className="text-orange-500" /> High-Resonance Signals
                                </h3>
                                <div className="space-y-4">
                                    {files.slice().sort((a,b) => (b.downloadCount||0)-(a.downloadCount||0)).slice(0, 2).map(f => (
                                        <div key={f._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg group-hover:scale-110 transition-transform">
                                                    <Zap size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-xs truncate max-w-[120px] italic">{f.originalName}</p>
                                                    <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">{f.downloadCount} Total Uplinks</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => { navigator.clipboard.writeText(f.downloadCode); toast.success('SIGNAL COPIED'); }}
                                                className="p-2 text-gray-500 hover:text-white transition-colors"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recently Accessed */}
                            <div className="glass p-8 rounded-[3rem] border-white/5 bg-white/[0.01]">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                                    <RotateCcw size={14} className="text-primary-400" /> Recent Resonance
                                </h3>
                                <div className="space-y-4">
                                    {files.slice().sort((a,b) => new Date(b.lastAccessed || 0).getTime() - new Date(a.lastAccessed || 0).getTime()).slice(0, 2).map(f => (
                                        <div key={f._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-primary-500/10 text-primary-400 rounded-lg group-hover:scale-110 transition-transform">
                                                    <Activity size={16} />
                                                </div>
                                                 <div className="min-w-0">
                                                    <p className="font-black text-xs truncate max-w-[120px] italic">{f.originalName}</p>
                                                    <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest italic">{new Date(f.lastAccessed || 0).toLocaleTimeString()} resonance</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => { window.open(`${api.defaults.baseURL}/files/download/${f.downloadCode}`, '_blank'); }}
                                                className="p-2 text-gray-500 hover:text-white transition-colors"
                                            >
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {(currentView === 'files' || currentView === 'trash') && (
                        <div className="space-y-10">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-10">
                                <div>
                                    <h1 className="text-3xl lg:text-4xl font-black tracking-tight italic mb-2 text-glow">
                                        {currentView === 'files' ? 'Neural Workspace' : 'Encrypted Archive'}
                                    </h1>
                                    <p className="text-gray-500 font-bold text-xs lg:text-sm tracking-wide uppercase opacity-70">
                                        {currentView === 'files' ? 'Synchronized with BitShare Nodes' : 'Temporary storage before erasure.'}
                                    </p>
                                </div>
                                {currentView === 'files' && (
                                    <button 
                                        onClick={() => setShowUploadModal(true)} 
                                        className="hidden sm:flex bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-2xl font-black transition-all items-center gap-3 shadow-xl active:scale-95 group"
                                    >
                                        <Upload size={20} className="group-hover:-translate-y-1 transition-transform" /> NEW TRANSFER
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                                <StatCard title="Total Detections" value={Array.isArray(files) ? files.length : 0} icon={<FileIcon size={24} />} desc="Active links in sector" />
                                
                                <div className="glass p-8 rounded-[2.5rem] flex flex-col justify-center h-full min-h-[220px] border-white/5 relative overflow-hidden group">
                                    <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Activity size={14} className="text-primary-400" /> Neural Pulse</h3>
                                    <div style={{ height: '140px' }} className="relative z-10 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={storageStats?.pulse || []}>
                                                <defs>
                                                    <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#00f2fe" stopOpacity={1}/>
                                                        <stop offset="95%" stopColor="#4facfe" stopOpacity={0.4}/>
                                                    </linearGradient>
                                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                                        <feGaussianBlur stdDeviation="6" result="blur" />
                                                        <feFlood floodColor="#00f2fe" floodOpacity="0.8" result="glowColor" />
                                                        <feComposite in="glowColor" in2="blur" operator="in" result="softGlow" />
                                                        <feMerge>
                                                            <feMergeNode in="softGlow" />
                                                            <feMergeNode in="softGlow" />
                                                            <feMergeNode in="SourceGraphic" />
                                                        </feMerge>
                                                    </filter>
                                                </defs>
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="intensity" 
                                                    stroke="#00f2fe" 
                                                    strokeWidth={8} 
                                                    fillOpacity={1} 
                                                    fill="url(#colorPulse)" 
                                                    filter="url(#glow)"
                                                    animationDuration={2500}
                                                    isAnimationActive={true}
                                                    baseValue="dataMin"
                                                />
                                                <Tooltip 
                                                    contentStyle={{backgroundColor:'rgba(0,242,254,0.1)', border:'1px solid rgba(0,242,254,0.3)', borderRadius:'16px', backdropFilter:'blur(10px)'}} 
                                                    cursor={{ stroke: '#00f2fe', strokeWidth: 2, strokeDasharray: '5 5' }} 
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="absolute -right-4 -bottom-4 p-8 opacity-[0.15] group-hover:opacity-[0.25] transition-all text-primary-500/30">
                                        <Activity size={80} />
                                    </div>
                                </div>

                                <div className="glass p-8 rounded-[2.5rem] flex flex-col justify-center h-full min-h-[180px] border-white/5 relative group overflow-hidden bg-primary-500/5">
                                    <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 text-primary-400"><RotateCcw size={14} /> Capacity Forecast</h3>
                                    <p className="text-3xl font-black italic tracking-tighter mb-2">~{storageStats?.daysLeft || '365'} Days</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Until Sector Depletion</p>
                                    <div className="absolute -right-4 -bottom-4 p-8 opacity-[0.12] group-hover:scale-110 transition-transform text-primary-500/20">
                                        <Zap size={80} className="text-primary-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide py-4">
                                {['ALL', 'MEDIA', 'DOCS', 'CODE'].map((cat: any) => (
                                    <button 
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                            selectedCategory === cat 
                                            ? 'bg-white text-black border-white shadow-xl shadow-white/5' 
                                            : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 pb-10">
                                <div className="xl:col-span-2 space-y-6">
                                    <h2 className="text-xl font-black tracking-tight italic">{currentView === 'files' ? 'Recent Sequences' : 'Deleted Packets'}</h2>
                                    <div className="glass rounded-[2rem] overflow-hidden border-white/5 shadow-2xl overflow-x-auto bg-white/[0.01]">
                                        <table className="w-full text-left border-collapse min-w-[600px]">
                                            <thead>
                                                <tr className="border-b border-white/5 text-gray-500 text-[10px] uppercase font-black tracking-[0.2em]"><th className="px-8 py-6">Signal Identity</th><th className="px-8 py-6 text-center">{currentView === 'files' ? 'Access Key' : 'Erasure Date'}</th><th className="px-8 py-6 text-right">Operation</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/[0.03] text-sm">
                                                {loading ? (
                                                    <tr><td colSpan={3} className="p-20 text-center font-black text-gray-600 animate-pulse tracking-[0.5em] italic uppercase">DECRYPTING...</td></tr>
                                                ) : cFiles.length === 0 ? (
                                                    <tr><td colSpan={3} className="p-24 text-center font-black text-gray-600 italic tracking-widest opacity-40 uppercase">SECTOR EMPTY.</td></tr>
                                                ) : (
                                                    cFiles.map((f) => (
                                                        <tr key={f._id} className="hover:bg-white/[0.03] transition-all group cursor-default">
                                                            <td className="px-8 py-5 flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-primary-400 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-lg overflow-hidden border border-white/5">
                                                                    {f.thumbnail ? (
                                                                        <img src={getAvatarUrl(f.thumbnail) || ''} alt="T" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        (f as any).fileType?.includes('image') ? <ImageIcon size={18} /> : <FileIcon size={18} />
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="font-black truncate max-w-[150px] lg:max-w-[200px] group-hover:text-primary-300 transition-colors tracking-tight italic">{f.originalName}</p>
                                                                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-1">{(f.size/1024/1024).toFixed(2)} MB</p>
                                                                    {f.summary && (
                                                                        <p className="text-[8px] text-gray-700 font-bold italic mt-1 truncate max-w-[180px] group-hover:text-gray-500 transition-colors">
                                                                            {f.summary}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5 text-center font-mono text-primary-500 font-black text-base lg:text-lg tracking-[0.2em]">{currentView === 'files' ? f.downloadCode : new Date().toLocaleDateString()}</td>
                                                            <td className="px-8 py-5 text-right">
                                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {currentView === 'files' ? (
                                                                        <>
                                                                            <button onClick={() => setShowQrModal(f)} className="p-2.5 bg-white/5 hover:bg-primary-500/20 rounded-xl text-gray-500 hover:text-primary-400 transition-all"><QrCode size={16} /></button>
                                                                            <button onClick={() => { navigator.clipboard.writeText(f.downloadCode); toast.success('COPIED'); }} className="p-2.5 bg-white/5 hover:bg-primary-500/20 rounded-xl text-gray-500 hover:text-primary-400 transition-all"><Copy size={16} /></button>
                                                                        </>
                                                                    ) : (
                                                                        <button onClick={() => restoreFile(f._id)} className="p-2.5 bg-white/5 hover:bg-emerald-500/20 rounded-xl text-gray-500 hover:text-emerald-400 transition-all"><RotateCcw size={16} /></button>
                                                                    )}
                                                                    <button onClick={() => currentView === 'files' ? deleteFile(f._id) : permanentDeleteFile(f._id)} className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl text-gray-500 hover:text-red-400 transition-all"><Trash2 size={16} /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h2 className="text-xl font-black tracking-tight italic">Pulse Feed</h2>
                                    <div className="glass rounded-[2rem] p-6 lg:p-8 border-white/5 min-h-[300px] bg-white/[0.01]">
                                        <div className="space-y-6">
                                            {activities.length === 0 ? (<p className="text-center py-10 text-gray-600 font-bold uppercase text-[10px] tracking-widest italic uppercase">NO PULSES</p>) : (
                                                activities.map((act, i) => (
                                                    <div key={i} className="flex gap-4 group">
                                                        <div className={`w-1.5 h-8 rounded-full transition-colors ${act.type === 'UPLOAD' ? 'bg-primary-500' : 'bg-emerald-500'}`} />
                                                        <div><p className="text-xs font-black uppercase tracking-tight italic line-clamp-1">{act.message}</p><p className="text-[9px] text-gray-600 font-bold">{new Date(act.createdAt).toLocaleTimeString()} • {act.type}</p></div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showUploadModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 text-white">
                <div 
                    className="absolute inset-0 bg-black/80 backdrop-blur-2xl" 
                    onClick={() => setShowUploadModal(false)} 
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    className="w-full max-w-2xl relative z-10"
                >
                    <FileUpload onClose={() => setShowUploadModal(false)} />
                </motion.div>
            </div>
          )}
          
          {showProfileModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 text-white text-left">
                <div 
                    className="absolute inset-0 bg-black/80 backdrop-blur-2xl" 
                    onClick={() => setShowProfileModal(false)} 
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    className="w-full max-w-xl bg-slate-900/50 backdrop-blur-3xl p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3rem] border border-white/10 relative z-10"
                >
                    <div className="flex justify-between items-center mb-8 lg:mb-10">
                        <div>
                            <h2 className="text-2xl lg:text-3xl font-black italic tracking-tighter uppercase">System Profile</h2>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Configure your neural identity</p>
                        </div>
                        <button onClick={() => setShowProfileModal(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                            <XCircle size={24} />
                        </button>
                    </div>
                    <ProfileForm user={user} onClose={() => setShowProfileModal(false)} />
                </motion.div>
            </div>
          )}
          
          {showQrModal && (
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl" onClick={() => setShowQrModal(null)} />
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-slate-950 p-8 lg:p-12 rounded-[3.5rem] border border-white/10 relative z-10 text-center shadow-2xl overflow-hidden"
                >
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary-600/20 rounded-full blur-[80px]" />
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary-600/20 rounded-full blur-[80px]" />
                    
                    <div className="relative mb-8 flex justify-center">
                        <div className="p-4 bg-white rounded-[2.5rem] shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                            <QRCodeSVG 
                                value={`${window.location.protocol}//${storageStats?.localIp || window.location.hostname}:${window.location.port || '8000'}/api/files/download/${showQrModal.downloadCode}`}
                                size={200}
                                level="M"
                                includeMargin={false}
                            />
                        </div>
                    </div>
                    
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-3">Neural Portal</h2>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-8 px-6 leading-relaxed">
                        Point a mobile node camera at the signal above to establish an instant contactless bridge.
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 font-mono text-primary-400 text-xl tracking-[0.3em] font-black">
                            {showQrModal.downloadCode}
                        </div>
                        <button 
                            onClick={() => setShowQrModal(null)}
                            className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-black transition-all border border-white/5 uppercase text-xs tracking-widest"
                        >
                            Close Connection
                        </button>
                    </div>
                </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const Dashboard = () => (
  <ErrorBoundary>
    <DashboardContent />
  </ErrorBoundary>
);

export default Dashboard;
