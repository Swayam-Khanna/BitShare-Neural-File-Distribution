import { useEffect, useState, Component, type ReactNode, useMemo, useCallback } from 'react';
import { 
    Activity, Zap, Shield, ArrowRight, BarChart3, Globe, Flame, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

import { useAuthStore } from '../store/useAuthStore';
import { useFileStore } from '../store/useFileStore';
import { useNotificationStore } from '../store/useNotificationStore';
import api from '../services/api';

// Components
import Scene3D from '../components/Scene3D';
import FileUpload from '../features/dashboard/FileUpload';
import SecuritySettings from '../features/dashboard/SecuritySettings';
import AdminPanel from '../features/dashboard/AdminPanel';

// Dashboard Components
import Sidebar from '../features/dashboard/Sidebar';
import MobileNav from '../features/dashboard/MobileNav';
import Header from '../features/dashboard/Header';
import { StatCard, AnalyticsCard } from '../features/dashboard/Stats';
import Heatmap from '../features/dashboard/Heatmap';
import ProfileForm from '../features/dashboard/ProfileForm';
import FileListing from '../features/dashboard/FileListing';
import ActivityFeed from '../features/dashboard/ActivityFeed';

// --- Error Boundary ---
class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  public state = { hasError: false };
  public static getDerivedStateFromError() { return { hasError: true }; }
  public render() {
    if (this.state.hasError) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Dashboard Error</h2>
            <button onClick={() => window.location.reload()} className="bg-primary-600 px-8 py-3 rounded-xl font-bold">Refresh Page</button>
        </div>
    );
    return this.props.children;
  }
}

const Dashboard = () => {
  const { user, logout, fetchProfile } = useAuthStore();
  const files = useFileStore(state => state.files);
  const trash = useFileStore(state => state.trash);
  const loading = useFileStore(state => state.loading);
  const { fetchFiles, fetchTrash, deleteFile, restoreFile, permanentDeleteFile } = useFileStore();
  const { initSocket, socket, unreadCount, notifications, markAsRead, clearNotifications } = useNotificationStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQrModal, setShowQrModal] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'MEDIA' | 'DOCS' | 'CODE'>('ALL');
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'files' | 'trash' | 'analytics' | 'security' | 'admin'>(() => {
    const p = window.location.pathname.replace('/', '');
    if (['files', 'trash', 'analytics', 'security', 'admin'].includes(p)) return p as any;
    return 'files';
  });

  const handleSetView = (view: any) => {
    setCurrentView(view);
    navigate(`/${view === 'files' ? 'dashboard' : view}`);
  };

  useEffect(() => { 
    fetchFiles(); fetchTrash(); fetchActivities(); if (user?._id) initSocket(user._id); 
    
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      toast.success('Neural Capacity Upgraded!', { icon: '🚀', duration: 5000 });
      fetchProfile();
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
    // Logic for periodic stats update if needed
  }, [user?._id, files.length]);

  const fetchActivities = async () => {
    try { const { data } = await api.get('files/activities'); setActivities(Array.isArray(data) ? data : []); } catch (e) { setActivities([]); }
  };

  const cFiles = useMemo(() => {
    const src = currentView === 'files' ? files : trash;
    let items = Array.isArray(src) ? src : [];
    
    if (selectedCategory !== 'ALL') {
        const cat = selectedCategory;
        items = items.filter(f => {
            const type = (f as any).fileType?.toLowerCase() || '';
            if (cat === 'MEDIA') return type.includes('image') || type.includes('video') || type.includes('audio');
            if (cat === 'DOCS') return type.includes('pdf') || type.includes('text') || type.includes('word') || type.includes('sheet');
            if (cat === 'CODE') return type.includes('javascript') || type.includes('json') || type.includes('html') || type.includes('css') || type.includes('typescript');
            return true;
        });
    }

    return items
      .filter(f => (f as any).originalName?.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date((b as any).uploadTime).getTime() - new Date((a as any).uploadTime).getTime());
  }, [files, trash, currentView, selectedCategory, searchTerm]);

  const getAvatarUrl = useCallback((path: string | undefined | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = api.defaults.baseURL || '';
    const cleanB = base.endsWith('/') ? base.slice(0, -1) : base;
    const baseUrlWithoutApi = cleanB.replace('/api', '');
    let cleanP = path;
    if (!cleanP.startsWith('/')) cleanP = `/${cleanP}`;
    return `${baseUrlWithoutApi}${cleanP}`;
  }, []);

  if (!user) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { totalSize, storagePercent } = useMemo(() => {
    const total = Array.isArray(files) ? (files as any[]).reduce((acc, f) => acc + (f.size || 0), 0) : 0;
    const percent = Math.min((total / (user?.storageLimit || 100 * 1024 * 1024)) * 100, 100);
    return { totalSize: total, storagePercent: percent };
  }, [files, user?.storageLimit]);

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-slate-950 text-white relative flex-col lg:flex-row pb-20 lg:pb-0 overflow-hidden">
        <div className="opacity-30 fixed inset-0 pointer-events-none"><Scene3D /></div>

        <Sidebar 
            currentView={currentView} 
            setCurrentView={handleSetView} 
            isAdmin={user.isAdmin} 
            logout={logout}
            storagePercent={storagePercent}
            usedMB={(totalSize / 1024 / 1024).toFixed(1)}
            limitMB={((user.storageLimit || 1) / 1024 / 1024).toFixed(0)}
            onProfileClick={() => setShowProfileModal(true)}
        />

        <MobileNav 
            currentView={currentView} 
            setCurrentView={handleSetView} 
            onUploadClick={() => setShowUploadModal(true)}
            onProfileClick={() => setShowProfileModal(true)}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10 h-screen">
          <Header 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            unreadCount={unreadCount}
            notifications={notifications}
            markAsRead={markAsRead}
            clearNotifications={clearNotifications}
            user={user}
            getAvatarUrl={getAvatarUrl}
            onProfileClick={() => setShowProfileModal(true)}
          />

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 space-y-10 custom-scrollbar pb-32 lg:pb-10 gpu-accel">
              <AnimatePresence mode="wait">
                      <motion.div
                          key={currentView}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-full gpu-accel"
                      >
                      {currentView === 'admin' && <AdminPanel />}
                      {currentView === 'security' && <SecuritySettings />}
                      
                      {currentView === 'analytics' && (
                          <div className="space-y-10">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <AnalyticsCard title="Total Distributions" value={Array.isArray(files) ? files.reduce((acc, f) => acc + ((f as any).downloadCount || 0), 0) : 0} icon={<Download size={24} />} sub="Global signal reach" color="text-primary-400" />
                                  <AnalyticsCard title="Active Segments" value={files.length} icon={<BarChart3 size={24} />} sub="Currently mapped nodes" color="text-emerald-400" />
                                  <AnalyticsCard title="Neural Load" value={`${(totalSize / 1024 / 1024).toFixed(1)} MB`} icon={<Zap size={24} />} sub={`${storagePercent.toFixed(1)}% usage intensity`} color="text-purple-400" />
                              </div>
                              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10">
                                  <div className="glass rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-10 border-white/5 flex flex-col min-h-[400px]">
                                      <h3 className="text-lg font-black italic uppercase tracking-widest mb-6 lg:mb-8 flex items-center gap-3"><Globe size={20} className="text-primary-400" /> Global Heatmap</h3>
                                      <div className="flex-1 bg-black/20 rounded-3xl border border-white/5 overflow-hidden p-4 shadow-inner">
                                          <Heatmap points={(files as any[]).flatMap(f => (f.downloads || []).map((d: any) => d.geo || {}))} />
                                      </div>
                                  </div>
                                  <div className="glass rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-10 border-white/5 flex flex-col">
                                      <h3 className="text-lg font-black italic uppercase tracking-widest mb-6 lg:mb-8 flex items-center gap-3"><Flame size={20} className="text-orange-400" /> Popular Segments</h3>
                                      <div className="space-y-4">
                                          {(files as any[]).slice().sort((a,b) => (b.downloadCount||0)-(a.downloadCount||0)).slice(0,5).map((file, i) => (
                                              <div key={file._id} className="glass-dark p-4 lg:p-5 rounded-2xl flex items-center justify-between group border-white/5 hover:bg-white/[0.05] transition-all">
                                                  <div className="flex items-center gap-4">
                                                      <div className="text-xl font-black italic text-gray-800 pr-2 group-hover:text-primary-500 transition-colors uppercase">{i + 1}</div>
                                                      <div>
                                                          <p className="font-black text-sm truncate max-w-[120px] sm:max-w-[200px] italic">{file.originalName}</p>
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
                        <div className="space-y-10">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                                <div className="glass p-8 rounded-[2.5rem] lg:rounded-[3rem] border-white/5 bg-white/[0.01]">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                                        <Flame size={14} className="text-orange-500" /> High-Resonance Signals
                                    </h3>
                                    <div className="space-y-4">
                                        {files.slice().sort((a,b) => (b.downloadCount||0)-(a.downloadCount||0)).slice(0, 2).map(f => (
                                            <div key={f._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg group-hover:scale-110 transition-transform"><Zap size={16} /></div>
                                                    <div className="min-w-0">
                                                        <p className="font-black text-xs truncate max-w-[120px] italic">{f.originalName}</p>
                                                        <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">{f.downloadCount} Uplinks</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="glass p-8 rounded-[2.5rem] lg:rounded-[3rem] border-white/5 bg-white/[0.01]">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                                        <Activity size={14} className="text-primary-400" /> Recent Resonance
                                    </h3>
                                    <div className="space-y-4">
                                        {files.slice().sort((a,b) => new Date(b.lastAccessed || 0).getTime() - new Date(a.lastAccessed || 0).getTime()).slice(0, 2).map(f => (
                                            <div key={f._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-primary-500/10 text-primary-400 rounded-lg group-hover:scale-110 transition-transform"><Activity size={16} /></div>
                                                    <div className="min-w-0">
                                                        <p className="font-black text-xs truncate max-w-[120px] italic">{f.originalName}</p>
                                                        <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest italic">{new Date(f.lastAccessed || 0).toLocaleTimeString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                                <div>
                                    <h1 className="text-3xl lg:text-4xl font-black tracking-tight italic mb-2 text-glow">Neural Workspace</h1>
                                    <p className="text-gray-500 font-bold text-xs uppercase tracking-wide opacity-70">Synchronized with BitShare Nodes</p>
                                </div>
                                <button onClick={() => setShowUploadModal(true)} className="hidden sm:flex bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-2xl font-black transition-all items-center gap-3 shadow-xl active:scale-95 group">
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /> NEW TRANSFER
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                                <StatCard title="Total Detections" value={files.length} icon={<BarChart3 size={24} />} desc="Active links in sector" />
                                <div className="glass p-8 rounded-[2.5rem] flex flex-col justify-center h-full min-h-[220px] border-white/5 relative group bg-white/[0.01]">
                                    <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Activity size={14} className="text-primary-400" /> Neural Pulse</h3>
                                    <div className="text-3xl font-black italic tracking-tighter opacity-10 uppercase text-center py-4">Sensing...</div>
                                    <div className="absolute -right-4 -bottom-4 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-all"><Activity size={80} /></div>
                                </div>
                                <div className="glass p-8 rounded-[2.5rem] flex flex-col justify-center h-full min-h-[180px] border-white/5 relative group bg-primary-500/5">
                                    <h3 className="text-primary-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Capacity Status</h3>
                                    <p className="text-3xl font-black italic tracking-tighter mb-2">HEALTHY</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{storagePercent.toFixed(1)}% Usage</p>
                                    <div className="absolute -right-4 -bottom-4 p-8 opacity-[0.05] group-hover:scale-110 transition-transform"><Shield size={80} /></div>
                                </div>
                            </div>
                        </div>
                      )}

                      {(currentView === 'files' || currentView === 'trash') && (
                          <div className="space-y-10 mt-10">
                              <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
                                  {['ALL', 'MEDIA', 'DOCS', 'CODE'].map((cat: any) => (
                                      <button 
                                          key={cat}
                                          onClick={() => setSelectedCategory(cat)}
                                          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${
                                              selectedCategory === cat 
                                              ? 'bg-white text-black border-white shadow-xl shadow-white/5' 
                                              : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20'
                                          }`}
                                      >
                                          {cat}
                                      </button>
                                  ))}
                              </div>

                              <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                                  <div className="xl:col-span-2 space-y-6">
                                      <h2 className="text-xl font-black tracking-tight italic">{currentView === 'files' ? 'Recent Sequences' : 'Archive Packets'}</h2>
                                      <FileListing 
                                          loading={loading}
                                          files={cFiles}
                                          currentView={currentView}
                                          getAvatarUrl={getAvatarUrl}
                                          setShowQrModal={setShowQrModal}
                                          restoreFile={restoreFile}
                                          deleteFile={deleteFile}
                                          permanentDeleteFile={permanentDeleteFile}
                                      />
                                  </div>
                                  <div className="space-y-6">
                                      <h2 className="text-xl font-black tracking-tight italic">Pulse Feed</h2>
                                      <ActivityFeed activities={activities} />
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
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-10">
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowUploadModal(false)} 
                  />
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-2xl relative z-10">
                      <FileUpload onClose={() => setShowUploadModal(false)} />
                  </motion.div>
              </div>
            )}

            {showProfileModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-10">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowProfileModal(false)} 
                    />
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="w-full max-w-xl glass p-8 sm:p-12 rounded-[3rem] relative z-10">
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-6">System Identity</h2>
                        <ProfileForm user={user} onClose={() => setShowProfileModal(false)} />
                    </motion.div>
                </div>
            )}

            {showQrModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-10">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowQrModal(null)} 
                    />
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="glass p-10 sm:p-16 rounded-[4rem] relative z-10 text-center max-w-sm w-full">
                        <div className="bg-white p-8 rounded-[3rem] shadow-2xl mb-8 group transition-transform hover:scale-110">
                            <QRCodeSVG value={`${window.location.origin}/d/${showQrModal.downloadCode}`} size={200} className="w-full h-auto" />
                        </div>
                        <h3 className="text-2xl font-black italic mb-2 truncate uppercase">{showQrModal.originalName}</h3>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-10">SCAN TO BROADCAST SIGNAL</p>
                        <button onClick={() => setShowQrModal(null)} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all">TERMINATE</button>
                    </motion.div>
                </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
