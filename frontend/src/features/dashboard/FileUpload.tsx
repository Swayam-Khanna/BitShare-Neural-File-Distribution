import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File as FileIcon, CheckCircle, Copy, LayoutDashboard, ArrowRight, Shield, Clock } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import { useFileStore } from '../../store/useFileStore';
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

    try {
      const { data } = await api.post('files/upload', formData, {
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
      <div 
        className="glass p-5 rounded-xl text-left border-emerald-500/20 shadow-lg relative overflow-hidden premium-border"
      >
        <div className="absolute top-0 right-0 p-6 opacity-[0.05] rotate-12 scale-150 text-emerald-500">
           <Shield size={80} />
        </div>

        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="bg-emerald-500/10 p-3 rounded-lg shadow-lg shadow-emerald-500/20 border border-emerald-500/20">
            <CheckCircle className="text-emerald-400" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black italic tracking-tighter uppercase text-emerald-400">Secure Link</h3>
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] mt-1 truncate max-w-[160px] italic">{result.originalName}</p>
          </div>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="glass-dark p-6 rounded-lg border-white/5 relative group overflow-hidden shadow-inner font-mono">
            <label className="text-[8px] text-gray-500 uppercase font-black tracking-[0.5em] mb-4 block opacity-60 italic text-center">Decryption Signature</label>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-2xl font-black tracking-[0.3em] text-primary-400 italic text-glow">{result.downloadCode}</span>
              <button 
                onClick={() => copyToClipboard(result.downloadCode)} 
                className="p-3 bg-white/5 hover:bg-primary-500/20 rounded-lg transition-all border border-white/5 active:scale-95"
              >
                <Copy size={16} className="text-primary-400" />
              </button>
            </div>
          </div>

          <div className="flex justify-center p-5 bg-white rounded-lg shadow-lg">
             <img src={result.qrCode} alt="QR Code" className="w-32 h-32 mix-blend-multiply opacity-90 transition-transform duration-700" />
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
            <button 
                onClick={() => { setFile(null); setResult(null); }}
                className="flex-1 py-6 bg-white/5 hover:bg-white/10 text-gray-400 font-black rounded-2xl transition-all uppercase text-xs tracking-widest border border-white/5"
            >
                New Segment
            </button>
            <button 
                onClick={() => {
                    if (onClose) onClose();
                    else navigate('/dashboard');
                }}
                className="flex-1 py-6 bg-white text-black hover:bg-gray-100 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-white/5 uppercase text-xs tracking-widest active:scale-95 transition-all"
            >
                <LayoutDashboard size={20} /> Workspace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!file ? (
        <div 
          {...getRootProps()} 
          className={`relative overflow-hidden border border-dashed rounded-xl p-8 transition-all duration-700 cursor-pointer flex flex-col items-center justify-center gap-4 group gpu-accel
            ${isDragActive ? 'border-primary-500 bg-primary-500/10' : 'border-white/10 hover:border-primary-500/30 hover:bg-white/[0.03]'}`}
        >
          <input {...getInputProps()} />
          <div className="bg-primary-500/10 p-4 rounded-lg group-hover:scale-105 group-hover:rotate-6 transition-all duration-700 shadow-inner border border-primary-500/20">
            <Upload className="text-primary-400" size={20} />
          </div>
          <div className="text-center">
            <p className="text-lg font-black italic tracking-tighter mb-1 uppercase">
              {isDragActive ? 'Release to Uplink' : 'Initiate Transfer'}
            </p>
            <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.5em] opacity-60 italic">Drop segments here</p>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/0 via-primary-500/5 to-primary-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -translate-x-full group-hover:translate-x-full" />
        </div>
      ) : (
        <div 
            className="glass p-4 rounded-lg flex items-center justify-between border-white/[0.08] shadow-lg group premium-border gpu-accel"
        >
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="bg-primary-500/10 p-3 rounded-lg border border-primary-500/20 shadow-inner">
              <FileIcon className="text-primary-400" size={18} />
            </div>
            <div className="text-left overflow-hidden">
              <p className="font-black truncate text-base tracking-tighter italic uppercase">{file.name}</p>
              <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.3em] mt-1 italic">{(file.size / 1024 / 1024).toFixed(2)} MB • READY</p>
            </div>
          </div>
          {!uploading && (
            <button 
              onClick={() => setFile(null)} 
              className="p-2.5 bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-lg transition-all border border-white/5"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {file && !uploading && !result && (
        <div 
          className="glass p-5 rounded-xl border-white/5 bg-white/[0.01] relative overflow-hidden premium-border"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-primary-500/10 rounded-md flex items-center justify-center border border-primary-500/10">
                <Clock size={14} className="text-primary-400" />
              </div>
              <h4 className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-500 italic">Temporal Decimation</h4>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: '1 HR', value: '1' },
              { label: '24 HR', value: '24' },
              { label: '7 D', value: '168' }
            ].map((opt) => (
              <button
                key={opt.value}
                disabled={user?.tier === 'FREE'}
                onClick={() => setExpiration(expiration === opt.value ? null : opt.value)}
                className={`py-1.5 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] transition-all border ${
                  expiration === opt.value
                    ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                    : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20'
                } ${user?.tier === 'FREE' ? 'opacity-40 cursor-not-allowed grayscale' : 'active:scale-95'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {file && !uploading && !result && (
        <button 
          onClick={handleUpload}
          className="w-full bg-white text-black hover:bg-gray-100 font-black py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2.5 text-lg group active:scale-95 uppercase tracking-[0.3em] italic"
        >
          UPLINK <ArrowRight className="group-hover:translate-x-1.5 transition-transform" size={20} />
        </button>
      )}

      {uploading && (
        <div className="glass p-6 rounded-xl space-y-6 relative overflow-hidden shadow-lg border-white/10 premium-border gpu-accel">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/[0.02] overflow-hidden">
             <div className="w-full h-full bg-primary-500/30 animate-pulse" />
          </div>
          
          <div className="flex justify-between items-end relative z-10 p-0.5">
            <div>
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.5em] mb-2 italic flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-primary-500 animate-ping" />
                Transferring
              </p>
              <p className="text-xl font-black tracking-tighter italic uppercase text-gradient">Neutral Grid Sync</p>
            </div>
            <span className="text-3xl font-black text-primary-400 italic text-glow font-mono">{progress}%</span>
          </div>

          <div className="w-full bg-black/60 rounded-full h-4 overflow-hidden border border-white/10 p-1 shadow-inner">
            <div 
              style={{ width: `${progress}%` }}
              className="bg-gradient-to-r from-primary-600 via-primary-400 to-indigo-500 h-full rounded-full shadow-[0_0_10px_rgba(99,102,241,0.2)] relative transition-all duration-500"
            >
               <div className="absolute inset-0 bg-white/10 animate-pulse rounded-full" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] justify-center italic opacity-60">
             {progress < 100 ? 'Encrypting...' : 'Finalizing...'}
          </div>
        </div>
      )}
    </div>
  );
};


export default FileUpload;
