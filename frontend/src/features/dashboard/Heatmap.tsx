import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

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

      <div className="text-center relative z-10 w-full flex flex-col items-center">
        <Globe size={180} className="text-white/5 animate-pulse" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 mt-8">Global Grid Status: Active</p>
      </div>
    </div>
  );
};

export default Heatmap;
