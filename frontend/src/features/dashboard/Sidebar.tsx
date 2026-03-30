import { LayoutDashboard, BarChart3, Shield, Users, Trash2, Settings, LogOut, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
      <div className="ml-auto w-1 h-4 bg-primary-500 rounded-full" />
    )}
  </button>
);

const Sidebar = ({ currentView, setCurrentView, isAdmin, logout, storagePercent, usedMB, limitMB, onProfileClick }: any) => {
  const navigate = useNavigate();

  return (
    <aside className="w-72 border-r border-white/5 p-8 hidden lg:flex flex-col gap-10 relative z-10 glass-dark h-screen sticky top-0">
      <div onClick={() => navigate('/')} className="flex items-center gap-3 text-2xl font-bold px-2 cursor-pointer group transition-transform hover:scale-105">
        <div className="p-2 bg-primary-600 rounded-lg shadow-lg shadow-primary-500/20">
          <Share2 className="text-white" size={20} />
        </div>
        <span className="tracking-tight italic font-black">BitShare</span>
      </div>

      <nav className="flex-1 space-y-3">
        <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Workspace" 
            active={currentView === 'files'} 
            onClick={() => setCurrentView('files')} 
        />
        <SidebarItem 
            icon={<BarChart3 size={20} />} 
            label="Analytics" 
            active={currentView === 'analytics'} 
            onClick={() => setCurrentView('analytics')} 
        />
        <SidebarItem 
            icon={<Shield size={20} />} 
            label="Security" 
            active={currentView === 'security'} 
            onClick={() => setCurrentView('security')} 
        />
        {isAdmin && (
          <SidebarItem 
            icon={<Users size={20} />} 
            label="Governance" 
            active={currentView === 'admin'} 
            onClick={() => setCurrentView('admin')} 
          />
        )}
        <SidebarItem 
            icon={<Trash2 size={20} />} 
            label="Archive" 
            active={currentView === 'trash'} 
            onClick={() => setCurrentView('trash')} 
        />
        <SidebarItem 
            icon={<Settings size={20} />} 
            label="System Profile" 
            onClick={onProfileClick} 
        />
      </nav>

      <div className="glass p-5 rounded-3xl border-white/5 bg-white/[0.02]">
        <div className="flex justify-between text-[10px] mb-3 font-black uppercase tracking-widest text-gray-500">
          <span>Storage Capacity</span>
          <button 
              onClick={() => navigate('/pricing')}
              className="text-primary-400 hover:text-primary-300 transition-colors font-black flex items-center gap-1"
          >
              UPGRADE
          </button>
        </div>
        <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden p-0.5 border border-white/5 mb-3">
          <div 
            style={{ width: `${storagePercent}%` }}
            className="bg-primary-500 h-full rounded-full shadow-lg shadow-primary-500/40 transition-all duration-500" 
          />
        </div>
        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tight text-center">
          {usedMB}MB / {limitMB}MB USED
        </p>
      </div>

      <button onClick={logout} className="flex items-center gap-3 px-6 py-4 text-gray-500 hover:text-white transition-all font-black text-xs uppercase tracking-[0.2em] hover:bg-white/5 rounded-2xl active:scale-95">
        <LogOut size={18} className="text-red-500" /> Disconnect
      </button>
    </aside>
  );
};

export default Sidebar;
