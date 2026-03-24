import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File as FileIcon, CheckCircle, Copy, LayoutDashboard, ArrowRight, Shield, Lock, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useFileStore } from '../store/useFileStore';
import { useNavigate } from 'react-router-dom';

const FileUpload = ({ onClose }: { onClose?: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [expiration, setExpiration] = useState<string | null>(null);
  
  const { user } = useAuthStore();
  const { addFile } = useFileStore();
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    setResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (expiration && user?.tier !== 'FREE') {
      const hours = parseInt(expiration);
      const expiryDate = new Date(Date.now() + hours * 3600000);
      formData.append('expiresAt', expiryDate.toISOString());
    }

    const API_HOST = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

    try {
      const { data } = await axios.post(`${API_HOST}/files/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: user ? `Bearer ${user.token}` : undefined
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          setProgress(percentCompleted);
        }
      });

      setResult(data);
      addFile(data);
      toast.success('DECRYPTION SIGNATURE GENERATED');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Uplink Failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('KEY COPIED');
  };

  if (result) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-10 rounded-[2.5rem] text-left border-emerald-500/10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 scale-150">
           <Shield size={120} />
        </div>

        <div className="flex items-center gap-5 mb-10 relative z-10">
          <div className="bg-emerald-500/10 p-4 rounded-2xl shadow-lg shadow-emerald-500/20 border border-emerald-500/20">
            <CheckCircle className="text-emerald-400" size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black italic tracking-tight uppercase text-emerald-400">Secure Link Active</h3>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1 truncate max-w-[200px]">{result.originalName}</p>
          </div>
        </div>

        <div className="space-y-8 relative z-10">
          <div className="glass-dark p-8 rounded-[2rem] border-white/5 relative group overflow-hidden shadow-inner">
            <label className="text-[10px] text-gray-500 uppercase font-black tracking-[0.3em] mb-4 block opacity-60">Decryption Signature</label>
            <div className="flex justify-between items-center">
              <span className="text-5xl font-black tracking-[0.25em] text-primary-400 font-mono italic text-glow">{result.downloadCode}</span>
              <button 
                onClick={() => copyToClipboard(result.downloadCode)} 
                className="p-4 bg-white/5 hover:bg-primary-500/20 rounded-2xl transition-all group-hover:scale-110 active:scale-90 border border-white/5"
              >
                <Copy size={24} className="text-primary-400" />
              </button>
            </div>
          </div>

          <div className="flex justify-center p-8 bg-white/95 rounded-[2.5rem] shadow-2xl group hover:scale-[1.02] transition-transform duration-500">
             <img src={result.qrCode} alt="QR Code" className="w-48 h-48 mix-blend-multiply opacity-90 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="flex gap-5">
            <button 
                onClick={() => { setFile(null); setResult(null); }}
                className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-gray-500 font-black rounded-2xl transition-all uppercase text-xs tracking-widest border border-white/5"
            >
                New Segment
            </button>
            <button 
                onClick={() => {
                    if (onClose) onClose();
                    else navigate('/dashboard');
                }}
                className="flex-1 py-5 bg-white text-black hover:bg-gray-100 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-white/5 uppercase text-xs tracking-widest active:scale-95 transition-all"
            >
                <LayoutDashboard size={18} /> Workspace
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {!file ? (
        <div 
          {...getRootProps()} 
          className={`relative overflow-hidden border-2 border-dashed rounded-[3rem] p-16 transition-all duration-700 cursor-pointer flex flex-col items-center justify-center gap-8 group
            ${isDragActive ? 'border-primary-500 bg-primary-500/10 scale-102' : 'border-white/10 hover:border-primary-500/30 hover:bg-white/[0.03]'}`}
        >
          <input {...getInputProps()} />
          <div className="bg-primary-500/10 p-6 rounded-[2rem] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner border border-primary-500/10">
            <Upload className="text-primary-400" size={40} />
          </div>
          <div className="text-center">
            <p className="text-2xl font-black italic tracking-tight mb-3 uppercase">
              {isDragActive ? 'Release to Uplink' : 'Initiate Transfer'}
            </p>
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] opacity-60">Drag and drop file segments here</p>
          </div>
          
          {/* Scanning Line Animation */}
          <AnimatePresence>
            {isDragActive && (
              <motion.div 
                initial={{ top: '-10%' }}
                animate={{ top: '110%' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent shadow-[0_0_20px_rgba(99,102,241,0.5)] z-20 pointer-events-none"
              />
            )}
          </AnimatePresence>
          
          {/* Ambient Rings */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-primary-500/10 rounded-full animate-ping" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-primary-500/5 rounded-full animate-pulse" />
          </div>
        </div>
      ) : (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 rounded-[2rem] flex items-center justify-between border-white/[0.05] shadow-xl group premium-border"
        >
          <div className="flex items-center gap-5 overflow-hidden">
            <div className="bg-primary-500/10 p-4 rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
              <FileIcon className="text-primary-400 group-hover:text-white" size={28} />
            </div>
            <div className="text-left overflow-hidden">
              <p className="font-black truncate text-xl tracking-tight italic">{file.name}</p>
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB • READY FOR TRANSFER</p>
            </div>
          </div>
          {!uploading && (
            <button 
              onClick={() => setFile(null)} 
              className="p-3 bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-2xl transition-all active:scale-90 border border-white/5"
            >
              <X size={24} />
            </button>
          )}
        </motion.div>
      )}

      {file && !uploading && !result && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-[2rem] border-white/5 bg-white/[0.01] relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-primary-400" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Temporal Decimation</h4>
            </div>
            {user?.tier === 'FREE' && (
              <div className="flex items-center gap-2 px-3 py-1 bg-primary-500/10 rounded-full border border-primary-500/20">
                <Lock size={10} className="text-primary-400" />
                <span className="text-[8px] font-black text-primary-400 uppercase tracking-widest">PREMIUM</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '1 Hour', value: '1' },
              { label: '1 Day', value: '24' },
              { label: '7 Days', value: '168' }
            ].map((opt) => (
              <button
                key={opt.value}
                disabled={user?.tier === 'FREE'}
                onClick={() => setExpiration(expiration === opt.value ? null : opt.value)}
                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  expiration === opt.value
                    ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/20'
                    : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/10'
                } ${user?.tier === 'FREE' ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          
          {user?.tier === 'FREE' && (
            <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest mt-4 text-center italic">
              Upgrade to Pro to enable auto-erasure protocols.
            </p>
          )}
        </motion.div>
      )}

      {file && !uploading && !result && (
        <motion.button 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleUpload}
          className="w-full bg-white text-black hover:bg-gray-100 font-black py-6 rounded-[2rem] transition-all shadow-2xl shadow-white/5 flex items-center justify-center gap-3 text-lg hover:gap-6 group active:scale-95 uppercase tracking-widest italic"
        >
          GENERATE SIGNATURE <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
        </motion.button>
      )}

      {uploading && (
        <div className="glass p-10 rounded-[2.5rem] space-y-8 relative overflow-hidden shadow-2xl border-white/5">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
             <motion.div 
               animate={{ x: ['-100%', '100%'] }}
               transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
               className="w-1/2 h-full bg-primary-500 blur-sm"
             />
          </div>
          
          <div className="flex justify-between items-end relative z-10">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2 italic">Neural Sync in Progress</p>
              <p className="text-3xl font-black tracking-tight italic uppercase">Streaming Data...</p>
            </div>
            <span className="text-5xl font-black text-primary-400 italic text-glow">{progress}%</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-5 overflow-hidden border border-white/5 p-1.5 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="bg-gradient-to-r from-primary-600 to-indigo-500 h-full rounded-full shadow-lg shadow-primary-500/40 relative"
            >
               <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] justify-center">
             <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-ping" />
             Encrypting Segment...
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
