import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, File as FileIcon, Clock, Shield, Lock, AlertCircle, Share2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const DownloadPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [passwordRequired, setPasswordRequired] = useState(false);

  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        const { data } = await api.get(`/files/info/${code}`);
        setFile(data);
      } catch (error: any) {
        toast.error('Sector offline or link terminated');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchFileInfo();
  }, [code, navigate]);

  const handleDownload = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      const response = await api({
        url: `/files/download/${code}`,
        method: 'GET',
        params: { password },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Decryption successful. Download started.');
    } catch (error: any) {
        if (error.response?.status === 401) {
            setPasswordRequired(true);
            toast.error(password ? 'Access Key Invalid' : 'Authorized Personnel Only');
        } else {
            toast.error('Download failed');
        }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="relative">
          <Share2 className="animate-pulse text-primary-500" size={48} />
          <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

       <nav className="p-8 relative z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div 
                onClick={() => navigate('/')} 
                className="flex items-center gap-3 text-2xl font-bold cursor-pointer group"
            >
              <div className="p-2 bg-primary-600 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-primary-500/20">
                <Share2 className="text-white" size={20} />
              </div>
              <span className="tracking-tight italic font-black">BitShare</span>
            </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-10 rounded-[2.5rem] max-w-lg w-full text-center border-white/5 shadow-2xl"
        >
          <div className="relative inline-block mb-10">
            <div className="bg-primary-500/10 p-8 rounded-3xl shadow-inner relative z-10">
              <FileIcon size={64} className="text-primary-400" />
            </div>
            <div className="absolute -inset-4 bg-primary-500/20 blur-2xl rounded-full opacity-50 animate-pulse" />
          </div>

          <h1 className="text-3xl font-black mb-2 truncate px-4 tracking-tight italic">
            {file?.originalName}
          </h1>
          <p className="text-gray-500 mb-10 font-bold uppercase tracking-widest text-xs">
            {(file?.size / 1024 / 1024).toFixed(2)} MB • {file?.downloadCount} SUCCESSFUL UPLINKS
          </p>

          <div className="space-y-6">
            {passwordRequired && (
               <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Lock size={12} className="text-primary-400" /> Authorization Required
                  </label>
                  <input 
                    type="password"
                    placeholder="ENTER ACCESS KEY"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-black"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
               </div>
            )}

            <button 
                onClick={() => handleDownload()}
                className="w-full bg-white text-black hover:bg-gray-100 font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/5 text-lg group active:scale-95"
            >
                START DECRYPTION <Download size={24} className="group-hover:translate-y-1 transition-transform" />
            </button>

            <div className="flex items-center justify-center gap-8 text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <Shield size={16} className="text-emerald-500" /> AES-256
                </div>
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-primary-400" /> {new Date(file?.uploadTime).toLocaleDateString()}
                </div>
            </div>
          </div>

          {file?.expiresAt && (
             <div className="mt-10 p-4 bg-primary-500/5 border border-primary-500/10 rounded-2xl text-primary-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 italic">
                <AlertCircle size={14} />
                Sector terminates on {new Date(file.expiresAt).toLocaleString()}
             </div>
          )}
        </motion.div>
      </main>

      <footer className="p-10 text-center relative z-10">
         <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">End-to-End Encrypted File Transfer Node</p>
      </footer>
    </div>
  );
};

export default DownloadPage;
