import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { supabase } from '@/services/supabase/client';

// Real device activation (plan §5.1): picking a profile signs this device in anonymously and
// binds it server-side via the activate_device RPC (supabase/migrations/0003_...). Persisted
// locally via AsyncStorage so the binding survives app restarts without re-activating.
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

interface ActivateDeviceRow {
  device_binding_id: string;
  profile_id: string;
  couple_id: string;
  display_name: string;
}

interface AuthState {
  /** Which profile this device was activated as. Null until activation finishes. Every real
   * mutation is resolved server-side from the Supabase session tied to this profile — there's
   * no client-side "view as the other profile" override anymore (that only ever worked against
   * the single-device mock; a real device can only ever act as the profile it's bound to). */
  activatedProfile: ProfileKey | null;
  deviceId: string | null;
  deviceBindingId: string | null;
  activatedProfileId: string | null;
  coupleId: string | null;
  /** False until the persisted activation state has been read back from AsyncStorage. */
  hasHydrated: boolean;
  activateDevice: (profile: ProfileKey) => Promise<void>;
  revokeDevice: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      activatedProfile: null,
      deviceId: null,
      deviceBindingId: null,
      activatedProfileId: null,
      coupleId: null,
      hasHydrated: false,

      activateDevice: async (profile) => {
        const deviceId = get().deviceId ?? Crypto.randomUUID();

        const { error: signInError } = await supabase.auth.signInAnonymously();
        if (signInError) throw signInError;

        const { data, error } = await supabase.rpc('activate_device', {
          p_fixed_profile_key: profile,
          p_device_id: deviceId,
          p_platform: Platform.OS,
        });
        if (error) throw error;

        const row = (Array.isArray(data) ? data[0] : data) as ActivateDeviceRow | undefined;
        if (!row) throw new Error('activate_device no devolvió ninguna fila');

        set({
          activatedProfile: profile,
          deviceId,
          deviceBindingId: row.device_binding_id,
          activatedProfileId: row.profile_id,
          coupleId: row.couple_id,
        });
      },

      revokeDevice: async () => {
        const bindingId = get().deviceBindingId;
        if (bindingId) {
          await supabase
            .from('device_bindings')
            .update({ status: 'revoked', revoked_at: new Date().toISOString() })
            .eq('id', bindingId);
        }
        await supabase.auth.signOut();
        set({ activatedProfile: null, deviceBindingId: null, activatedProfileId: null, coupleId: null });
      },
    }),
    {
      name: 'joinme-device-activation',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activatedProfile: state.activatedProfile,
        deviceId: state.deviceId,
        deviceBindingId: state.deviceBindingId,
        activatedProfileId: state.activatedProfileId,
        coupleId: state.coupleId,
      }),
      onRehydrateStorage: () => () => useAuthStore.setState({ hasHydrated: true }),
    },
  ),
);
