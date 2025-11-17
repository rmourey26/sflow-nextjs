import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { FlowState, Suggestion } from '@/types';
import { secureStorage } from '@/lib/storage/secureStorage';

type FlowMode = 'connected' | 'manual';

type FlowStoreState = {
  flow: FlowState | null;
  mode: FlowMode;
  loading: boolean;
  lastUpdated?: string;
  setFlow: (flow: FlowState, timestamp?: string) => void;
  setMode: (mode: FlowMode) => void;
  setLoading: (loading: boolean) => void;
  updateSuggestion: (partial: Partial<Suggestion>) => void;
  reset: () => void;
};

const storage = {
  getItem: (name: string) => secureStorage.getItem(name),
  setItem: (name: string, value: string) => secureStorage.setItem(name, value),
  removeItem: (name: string) => secureStorage.removeItem(name),
};

export const useFlowStore = create<FlowStoreState>()(
  persist(
    (set, get) => ({
      flow: null,
      mode: 'manual',
      loading: false,
      setFlow: (flow, timestamp) => set({ flow, lastUpdated: timestamp ?? new Date().toISOString() }),
      setMode: (mode) => set({ mode }),
      setLoading: (loading) => set({ loading }),
      updateSuggestion: (partial) =>
        set((state) => {
          if (!state.flow || !state.flow.suggestion) {
            return state;
          }
          return {
            flow: {
              ...state.flow,
              suggestion: {
                ...state.flow.suggestion,
                ...partial,
              },
            },
          };
        }),
      reset: () => set({ flow: null, mode: 'manual', loading: false, lastUpdated: undefined }),
    }),
    {
      name: 'saverflow-flow',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        flow: state.flow,
        mode: state.mode,
        lastUpdated: state.lastUpdated,
      }),
    },
  ),
);
