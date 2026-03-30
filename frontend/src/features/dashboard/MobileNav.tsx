import { motion } from 'framer-motion';
import { LayoutDashboard, BarChart3, Shield, Settings, Upload } from 'lucide-react';

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

const MobileNav = ({ currentView, setCurrentView, onUploadClick, onProfileClick }: any) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-md border-t border-white/10 z-[100] flex lg:hidden items-center justify-around px-6">
      <MobileNavItem 
        icon={<LayoutDashboard size={22} />} 
        active={currentView === 'files'} 
        onClick={() => setCurrentView('files')} 
      />
      <MobileNavItem 
        icon={<BarChart3 size={22} />} 
        active={currentView === 'analytics'} 
        onClick={() => setCurrentView('analytics')} 
      />
      <button 
        onClick={onUploadClick}
        className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-500/40 -translate-y-6 active:scale-95 transition-transform"
      >
        <Upload size={24} />
      </button>
      <MobileNavItem 
        icon={<Shield size={22} />} 
        active={currentView === 'security'} 
        onClick={() => setCurrentView('security')} 
      />
      <MobileNavItem 
        icon={<Settings size={22} />} 
        active={false} 
        onClick={onProfileClick} 
      />
    </nav>
  );
};

export default MobileNav;
