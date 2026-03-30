import { memo } from 'react';
import { File as FileIcon, Image as ImageIcon, QrCode, Copy, RotateCcw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const FileRow = memo(({ f, currentView, getAvatarUrl, setShowQrModal, restoreFile, deleteFile, permanentDeleteFile }: any) => (
  <tr className="hover:bg-white/[0.03] transition-colors group cursor-default gpu-accel">
    <td className="px-8 py-5 flex items-center gap-4">
      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-primary-400 group-hover:bg-primary-600 group-hover:text-white transition-colors shadow-lg overflow-hidden border border-white/5">
        {f.thumbnail ? (
          <img src={getAvatarUrl(f.thumbnail) || ''} alt="T" className="w-full h-full object-cover" loading="lazy" decoding="async" />
        ) : (
          f.fileType?.includes('image') ? <ImageIcon size={18} /> : <FileIcon size={18} />
        )}
      </div>
      <div className="min-w-0">
        <p className="font-black truncate max-w-[150px] lg:max-w-[200px] group-hover:text-primary-300 transition-colors tracking-tight italic">{f.originalName}</p>
        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-1">{(f.size/1024/1024).toFixed(2)} MB</p>
        {f.summary && (
          <p className="text-[8px] text-gray-700 font-bold italic mt-1 truncate max-w-[180px] group-hover:text-gray-500 transition-colors">
            {f.summary}
          </p>
        )}
      </div>
    </td>
    <td className="px-8 py-5 text-center font-mono text-primary-500 font-black text-base lg:text-lg tracking-[0.2em]">
      {currentView === 'files' ? f.downloadCode : new Date(f.deletedAt || Date.now()).toLocaleDateString()}
    </td>
    <td className="px-8 py-5 text-right">
      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {currentView === 'files' ? (
          <>
            <button onClick={() => setShowQrModal(f)} className="p-2.5 bg-white/5 hover:bg-primary-500/20 rounded-xl text-gray-500 hover:text-primary-400 transition-all"><QrCode size={16} /></button>
            <button onClick={() => { navigator.clipboard.writeText(f.downloadCode); toast.success('COPIED'); }} className="p-2.5 bg-white/5 hover:bg-primary-500/20 rounded-xl text-gray-500 hover:text-primary-400 transition-all"><Copy size={16} /></button>
          </>
        ) : (
          <button onClick={() => restoreFile(f._id)} className="p-2.5 bg-white/5 hover:bg-emerald-500/20 rounded-xl text-gray-500 hover:text-emerald-400 transition-all"><RotateCcw size={16} /></button>
        )}
        <button onClick={() => currentView === 'files' ? deleteFile(f._id) : permanentDeleteFile(f._id)} className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl text-gray-500 hover:text-red-400 transition-all"><Trash2 size={16} /></button>
      </div>
    </td>
  </tr>
));

const FileListing = memo(({ loading, files, currentView, getAvatarUrl, setShowQrModal, restoreFile, deleteFile, permanentDeleteFile }: any) => {
  return (
    <div className="glass rounded-[2rem] overflow-hidden border-white/5 shadow-2xl bg-white/[0.01]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 text-[10px] uppercase font-black tracking-[0.2em]">
              <th className="px-8 py-6">Signal Identity</th>
              <th className="px-8 py-6 text-center">{currentView === 'files' ? 'Access Key' : 'Erasure Date'}</th>
              <th className="px-8 py-6 text-right">Operation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03] text-sm">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-8 py-5 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl skeleton" />
                    <div className="space-y-2">
                        <div className="h-3 w-32 bg-white/5 rounded skeleton" />
                        <div className="h-2 w-20 bg-white/5 rounded skeleton" />
                    </div>
                  </td>
                  <td className="px-8 py-5"><div className="h-4 w-20 bg-white/5 rounded mx-auto skeleton" /></td>
                  <td className="px-8 py-5"><div className="h-8 w-24 bg-white/5 rounded ml-auto skeleton" /></td>
                </tr>
              ))
            ) : files.length === 0 ? (
              <tr><td colSpan={3} className="p-24 text-center font-black text-gray-600 italic tracking-widest opacity-40 uppercase">SECTOR EMPTY.</td></tr>
            ) : (
              files.map((f: any) => (
                <FileRow 
                  key={f._id} 
                  f={f} 
                  currentView={currentView}
                  getAvatarUrl={getAvatarUrl}
                  setShowQrModal={setShowQrModal}
                  restoreFile={restoreFile}
                  deleteFile={deleteFile}
                  permanentDeleteFile={permanentDeleteFile}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default FileListing;
