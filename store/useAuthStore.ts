import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { secureStorage } from '@/lib/storage/secureStorage';

type AuthState = {
  token: string | null;
  email?: string;
  loading: boolean;
  setCredentials: (token: string, email?: string) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
};

const storage = {
  getItem: (name: string) => secureStorage.getItem(name),
  setItem: (name: string, value: string) => secureStorage.setItem(name, value),
  removeItem: (name: string) => secureStorage.removeItem(name),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: undefined,
      loading: false,
      setCredentials: (token, email) => set({ token, email }),
      setLoading: (loading) => set({ loading }),
      clear: () => set({ token: null, email: undefined }),
    }),
    {
      name: 'saverflow-auth',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        token: state.token,
        email: state.email,
      }),
    },
  ),
);
