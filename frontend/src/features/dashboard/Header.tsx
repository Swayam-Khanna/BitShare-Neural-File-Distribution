import { Search, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ 
  searchTerm, 
  setSearchTerm, 
  showNotifications, 
  setShowNotifications, 
  unreadCount, 
  notifications, 
  markAsRead, 
  clearNotifications, 
  user, 
  getAvatarUrl, 
  onProfileClick 
}: any) => {
  return (
    <header className="h-20 lg:h-24 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 bg-black/20 backdrop-blur-md sticky top-0 z-20">
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
            <span className="text-white font-black italic">B</span>
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
                  notifications.map((n: any) => (
                    <div 
                      key={n.id} 
                      onClick={() => markAsRead(n.id)}
                      className={`p-4 rounded-2xl border transition-colors cursor-pointer ${n.read ? 'bg-white/5 border-white/5 opacity-60' : 'bg-primary-500/10 border-primary-500/20 shadow-lg shadow-primary-500/5'}`}
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
            onClick={onProfileClick}
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
  );
};

export default Header;
