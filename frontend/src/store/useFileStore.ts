import { create } from 'zustand';
import api from '../services/api';

export interface File {
  _id: string;
  filename: string;
  originalName: string;
  size: number;
  downloadCode: string;
  qrCode: string;
  downloadCount: number;
  uploadTime: string;
  lastAccessed?: string;
  summary?: string;
  thumbnail?: string;
  fileType?: string;
  isPrivate: boolean;
  expiresAt?: string;
}

interface FileState {
  files: File[];
  trash: File[];
  loading: boolean;
  fetchFiles: () => Promise<void>;
  fetchTrash: () => Promise<void>;
  addFile: (file: File) => void;
  deleteFile: (id: string) => Promise<void>;
  restoreFile: (id: string) => Promise<void>;
  permanentDeleteFile: (id: string) => Promise<void>;
}

export const useFileStore = create<FileState>((set, get) => ({
  files: [],
  trash: [],
  loading: false,
  fetchFiles: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('files');
      set({ files: data, loading: false });
    } catch (error) {
      console.error('Error fetching files:', error);
      set({ loading: false });
    }
  },
  fetchTrash: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('files/trash');
      set({ trash: data, loading: false });
    } catch (error) {
      console.error('Error fetching trash:', error);
      set({ loading: false });
    }
  },
  addFile: (file) => set((state) => ({ files: [file, ...state.files] })),
  deleteFile: async (id) => {
    try {
      const { files, trash } = get();
      const fileToDelete = files.find(f => f._id === id);
      
      await api.delete(`files/${id}`);
      
      set({ 
        files: files.filter((f) => f._id !== id),
        trash: fileToDelete ? [fileToDelete, ...trash] : trash
      });
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  },
  restoreFile: async (id) => {
    try {
        const { files, trash } = get();
        const fileToRestore = trash.find(f => f._id === id);

        await api.put(`files/${id}/restore`);
        
        set({
            trash: trash.filter((f) => f._id !== id),
            files: fileToRestore ? [fileToRestore, ...files] : files
        });
    } catch (error) {
        console.error('Error restoring file:', error);
    }
  },
  permanentDeleteFile: async (id) => {
    try {
        await api.delete(`files/${id}/permanent`);
        set((state) => ({
            trash: state.trash.filter((f) => f._id !== id)
        }));
    } catch (error) {
        console.error('Error permanently deleting file:', error);
    }
  },
}));
