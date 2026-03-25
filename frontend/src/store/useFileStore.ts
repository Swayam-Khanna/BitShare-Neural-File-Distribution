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
  error: string | null;
  fetchFiles: () => Promise<void>;
  fetchTrash: () => Promise<void>;
  addFile: (file: File) => void;
  deleteFile: (id: string) => Promise<void>;
  restoreFile: (id: string) => Promise<void>;
  permanentDeleteFile: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  files: [],
  trash: [],
  loading: false,
  error: null,
  clearError: () => set({ error: null }),
  fetchFiles: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('files');
      set({ files: data, loading: false });
    } catch (error: any) {
      console.error('Error fetching files:', error);
      set({ loading: false, error: error?.response?.data?.message || 'Failed to fetch files' });
    }
  },
  fetchTrash: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('files/trash');
      set({ trash: data, loading: false });
    } catch (error: any) {
      console.error('Error fetching trash:', error);
      set({ loading: false, error: error?.response?.data?.message || 'Failed to fetch trash' });
    }
  },
  addFile: (file) => set((state) => ({ files: [file, ...state.files] })),
  deleteFile: async (id) => {
    const { files, trash } = get();
    const fileToDelete = files.find(f => f._id === id);
    if (!fileToDelete) return;

    set({ 
      files: files.filter((f) => f._id !== id),
      trash: [fileToDelete, ...trash],
      error: null
    });

    try {
      await api.delete(`files/${id}`);
    } catch (error: any) {
      console.error('Error deleting file:', error);
      set({
        files,
        trash,
        error: error?.response?.data?.message || 'Failed to delete file'
      });
    }
  },
  restoreFile: async (id) => {
    const { files, trash } = get();
    const fileToRestore = trash.find(f => f._id === id);
    if (!fileToRestore) return;

    set({
      trash: trash.filter((f) => f._id !== id),
      files: [fileToRestore, ...files],
      error: null
    });

    try {
        await api.put(`files/${id}/restore`);
    } catch (error: any) {
        console.error('Error restoring file:', error);
        set({
            trash,
            files,
            error: error?.response?.data?.message || 'Failed to restore file'
        });
    }
  },
  permanentDeleteFile: async (id) => {
    const { trash } = get();
    
    set({
      trash: trash.filter((f) => f._id !== id),
      error: null
    });

    try {
        await api.delete(`files/${id}/permanent`);
    } catch (error: any) {
        console.error('Error permanently deleting file:', error);
        set({
            trash,
            error: error?.response?.data?.message || 'Failed to permanently delete file'
        });
    }
  },
}));
