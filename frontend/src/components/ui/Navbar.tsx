import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Menu, X, ArrowRight, Home, BarChart3, Shield, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const Navbar = memo(() => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Infrastructure', path: '/', icon: <Home size={18} /> },
    { name: 'Neural Capacity', path: '/pricing', icon: <BarChart3 size={18} /> },
    { name: 'Security Protocol', path: '/security', icon: <Shield size={18} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-400 px-4 sm:px-6 py-2 ${
          isScrolled ? 'pt-2' : 'pt-4'
        }`}
      >
        <div 
          className={`max-w-7xl mx-auto glass rounded-xl sm:rounded-2xl border-white/5 flex items-center justify-between px-4 lg:px-6 py-2 sm:py-2.5 transition-all duration-400 ${
            isScrolled ? 'bg-black/60 shadow-lg border-primary-500/20' : 'bg-white/[0.03]'
          }`}
        >
          {/* Logo */}
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-base sm:text-lg font-black cursor-pointer group shrink-0"
          >
            <div className="p-1 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-lg shadow-md group-hover:scale-105 group-hover:rotate-6 transition-all duration-500">
              <Share2 className="text-white" size={16} />
            </div>
            <span className="tracking-tighter italic font-black hidden sm:block text-gradient">BitShare</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-5 lg:gap-8">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`text-[8px] lg:text-[9px] font-black uppercase tracking-[0.2em] transition-all relative group py-2 ${
                  isActive(link.path) ? 'text-white' : 'text-gray-500 hover:text-white'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.div 
                    layoutId="nav-active"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-500 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 lg:gap-4">
            {!user ? (
              <>
                <button 
                  onClick={() => navigate('/login')} 
                  className="hidden sm:block text-[8px] lg:text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors"
                >
                  Access
                </button>
                <button 
                  onClick={() => navigate('/signup')} 
                  className="bg-white text-black hover:bg-gray-100 px-4 lg:px-6 py-1.5 sm:py-2 rounded-lg text-[8px] lg:text-[9px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center gap-2 group"
                >
                  Initialize <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </>
            ) : (
              <button 
                onClick={() => navigate('/dashboard')} 
                className="bg-primary-600 text-white hover:bg-primary-500 px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg text-[8px] lg:text-[9px] font-black uppercase tracking-widest transition-all shadow-md shadow-primary-500/10 active:scale-95 flex items-center gap-2"
              >
                Workspace <Zap size={10} className="text-white animate-pulse" />
              </button>
            )}



            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "100dvh", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[90] md:hidden pt-32 px-6 bg-[#030712]/98 overflow-hidden flex flex-col"
          >
            {/* Background Accent */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05),transparent_70%)] pointer-events-none" />
            
            <motion.div 
              initial="closed"
              animate="open"
              variants={{
                open: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
                closed: { transition: { staggerChildren: 0.03, staggerDirection: -1 } }
              }}
              className="flex flex-col gap-3 relative z-10"
            >
              <div className="text-[8px] font-black text-gray-700 uppercase tracking-[0.5em] mb-4 flex items-center gap-4">
                <span className="h-px flex-1 bg-white/5"></span>
                Registry Nodes
                <span className="h-px flex-1 bg-white/5"></span>
              </div>

              {navLinks.map((link, i) => (
                <motion.button
                  variants={{
                    open: { opacity: 1, x: 0, scale: 1 },
                    closed: { opacity: 0, x: -10, scale: 0.98 }
                  }}
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`group relative flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isActive(link.path) 
                      ? 'bg-primary-600/10 border-primary-500/30 text-white shadow-[0_0_20px_rgba(99,102,241,0.05)]' 
                      : 'bg-white/[0.02] border-white/5 text-gray-500 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`${isActive(link.path) ? 'text-primary-400' : 'text-gray-600 group-hover:text-gray-400'} transition-colors`}>
                        {link.icon}
                    </div>
                    <div className="flex flex-col items-start translate-y-0.5">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{link.name}</span>
                        <span className="text-[6px] font-mono text-gray-700 mt-0.5 tracking-widest uppercase">
                            {isActive(link.path) ? `LINK_ACTIVE [0${i+1}]` : `NODE_READY [0${i+1}]`}
                        </span>
                    </div>
                  </div>
                  
                  {isActive(link.path) && (
                    <motion.div 
                        layoutId="mobile-active-glint"
                        className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                    />
                  )}
                </motion.button>
              ))}
              
              {!user && (
                <motion.button
                  variants={{
                    open: { opacity: 1, x: 0 },
                    closed: { opacity: 0, x: -10 }
                  }}
                  onClick={() => navigate('/login')}
                  className="flex items-center justify-between p-5 rounded-2xl border bg-white/[0.02] border-white/5 text-gray-500 group"
                >
                  <div className="flex items-center gap-4">
                    <Zap size={18} className="text-primary-500/50 group-hover:text-primary-500 transition-colors" />
                    <div className="flex flex-col items-start translate-y-0.5">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Platform Access</span>
                        <span className="text-[6px] font-mono text-gray-700 mt-0.5 tracking-widest uppercase">AUTH_SERVICE_SECURE</span>
                    </div>
                  </div>
                  <ArrowRight size={12} className="text-gray-800" />
                </motion.button>
              )}
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4 }}
               className="mt-auto pb-12 relative z-10"
            >
                <button 
                    onClick={() => navigate('/signup')} 
                    className="w-full relative group"
                >
                    <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                    <div className="relative bg-white text-black py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl flex items-center justify-center gap-3 overflow-hidden transition-transform active:scale-95">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-200 to-transparent opacity-50" />
                        <span>Initialize Protocol</span>
                        <Shield size={14} />
                    </div>
                </button>

                <div className="flex flex-col items-center gap-2 mt-8 opacity-40">
                    <div className="flex gap-4">
                        <div className="w-1 h-1 rounded-full bg-primary-500 animate-pulse" />
                        <div className="w-1 h-1 rounded-full bg-primary-500 animate-pulse [animation-delay:200ms]" />
                        <div className="w-1 h-1 rounded-full bg-primary-500 animate-pulse [animation-delay:400ms]" />
                    </div>
                    <p className="text-[7px] font-black uppercase tracking-[0.8em] text-gray-500 italic">BitShare Neural Engine v2.4</p>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

export default Navbar;
