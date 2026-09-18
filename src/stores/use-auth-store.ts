import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Stand-in for the "device activation" flow in plan_app_parejas.md §5.1 — for now a profile is
// bound to this device by picking it once in (activation)/index.tsx (persisted locally via
// AsyncStorage) instead of via device_bindings + anonymous Supabase auth.
export type ProfileKey = 'yesica' | 'fabian';

export const PROFILES: Record<ProfileKey, { displayName: string; avatarUrl: string }> = {
  yesica: {
    displayName: 'Yesica',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida/AEtjO1V4JDFx9PYumr4MsfAZEMp61X6JF2gi7Izc8_-_qV8TRc8-uZZNUBre1lG2eImBlIrJlm-PqTgzfVKcef4yPdcW2YztFLUlv9d7jQTrqUuFxiW4ZmW2jSMcg_XcYAzSJbO5sp8UDJqritDvt5z8Q0KPwKOp5yBur3IEPCMeyMiYSe9qnF9MQpDUO-TET_dyJXuYCuJM0uUC-Ish5nP6v9lhYQwfm8mYDGmMmzrZm0ui7m8NdmATCkuuuwoq',
  },
  fabian: {
    displayName: 'Fabián',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB8D0TvZ5esHP5QdOLOklRYqDMLZZIm_2bEAAkdyQewI426yBX6J9r6r7YMZGa6YiXypNaiIHLoBvTWLrOstLPMsiTdEo4rkgKhpDXRcOFjdAoSfYakdOu819EDakaXJwfBV9A9icBttMbsbUpSFgm5hORuAJAuf4cHyKmh7DR2yeM-mILlN3bfBvMgLj6cqTmruuKDLPMW3I8tynxZ3n87f7Y7n7fIiJR4A6WV5q_24FaXpjxaEPwUOA',
  },
};

export function partnerOf(profile: ProfileKey): ProfileKey {
  return profile === 'yesica' ? 'fabian' : 'yesica';
}

interface AuthState {
  /** Which profile this device was activated as. Null until activation finishes. */
  activatedProfile: ProfileKey | null;
  /** Currently viewed-as profile — normally equal to activatedProfile, but can be toggled from
   * the Perfil tab to preview the app as either side without re-running activation. */
  activeProfile: ProfileKey;
  /** False until the persisted activation state has been read back from AsyncStorage. */
  hasHydrated: boolean;
  activateDevice: (profile: ProfileKey) => void;
  setActiveProfile: (profile: ProfileKey) => void;
  revokeDevice: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      activatedProfile: null,
      activeProfile: 'yesica',
      hasHydrated: false,
      activateDevice: (profile) => set({ activatedProfile: profile, activeProfile: profile }),
      setActiveProfile: (profile) => set({ activeProfile: profile }),
      revokeDevice: () => set({ activatedProfile: null }),
    }),
    {
      name: 'joinme-device-activation',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ activatedProfile: state.activatedProfile }),
      onRehydrateStorage: () => () => useAuthStore.setState({ hasHydrated: true }),
    },
  ),
);
