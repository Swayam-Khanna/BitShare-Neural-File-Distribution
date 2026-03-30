import { memo } from 'react';
import { motion } from 'framer-motion';
import Scene3D from '../Scene3D';

const AuthLayout = memo(({ children, title }: { children: React.ReactNode, title?: string }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] overflow-x-hidden selection:bg-primary-500/30 font-sans text-white p-6 sm:p-10 relative">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-20 blur-3xl overflow-hidden pointer-events-none">
          <Scene3D />
      </div>
      
      {/* Animated Gradient Overlays */}
      <div className="absolute top-0 -left-1/4 w-full h-full bg-primary-600/5 blur-[150px] rounded-full opacity-60 animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 -right-1/4 w-full h-full bg-indigo-600/5 blur-[150px] rounded-full opacity-60 animate-pulse [animation-delay:2s] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass p-6 sm:p-8 rounded-xl border border-white/5 shadow-lg backdrop-blur-2xl relative overflow-hidden premium-border">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary-500/10 blur-[100px] rounded-full animate-pulse" />
          
          {title && (
            <div className="text-center mb-8 relative z-10">
              <h1 className="text-sm font-black tracking-[0.4em] italic text-gray-400 uppercase leading-none drop-shadow-2xl">
                  {title}
              </h1>
            </div>
          )}

          <div className="relative z-10">
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
});

export default AuthLayout;
