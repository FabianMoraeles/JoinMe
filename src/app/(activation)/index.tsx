import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { PrimaryButton } from '@/components/ui/primary-button';
import { requestNotificationPermissions } from '@/services/notifications';
import { colors } from '@/theme/colors';
import { PROFILES, useAuthStore, type ProfileKey } from '@/stores/use-auth-store';

// Real device activation (plan §4 "Activación inicial"): signs the device in anonymously and
// binds it to the chosen profile server-side (see use-auth-store.ts's activateDevice). A real
// build would also confirm with a private install key or a code from the other device before
// binding — that confirmation step isn't implemented yet, just the tap + confirm here.
export default function ActivationScreen() {
  const activatedProfile = useAuthStore((state) => state.activatedProfile);
  const activateDevice = useAuthStore((state) => state.activateDevice);
  const [selected, setSelected] = useState<ProfileKey | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  if (activatedProfile) return <Redirect href="/(tabs)" />;

  async function handleConfirm() {
    if (!selected) return;
    setIsActivating(true);
    try {
      await activateDevice(selected);
      void requestNotificationPermissions();
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(
        'No se pudo activar el dispositivo',
        error instanceof Error ? error.message : 'Intenta de nuevo.',
      );
    } finally {
      setIsActivating(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom']}>
      <View className="flex-1 justify-center gap-space-xl px-margin">
        <View className="items-center gap-space-sm">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-primary-fixed">
            <MaterialIcons name="favorite" size={30} color={colors.primary} />
          </View>
          <Text className="text-center font-jakarta-extrabold text-headline-lg text-on-surface">JoinMe</Text>
          <Text className="max-w-[280px] text-center font-jakarta text-body-md text-on-surface-variant">
            Este teléfono es privado para Yesica y Fabián. ¿Quién eres tú?
          </Text>
        </View>

        <View className="gap-space-sm">
          {(Object.keys(PROFILES) as ProfileKey[]).map((key) => {
            const profile = PROFILES[key];
            const active = selected === key;
            return (
              <Pressable
                key={key}
                onPress={() => setSelected(key)}
                className={`flex-row items-center gap-space-sm rounded-lg border-2 p-space-md ${
                  active ? 'border-primary bg-primary-fixed' : 'border-transparent bg-surface-container-lowest'
                }`}
              >
                <Avatar uri={profile.avatarUrl} size={48} ringed={active} />
                <Text className="font-jakarta-semibold text-title-md text-on-surface">Soy {profile.displayName}</Text>
                {active ? (
                  <MaterialIcons name="check-circle" size={22} color={colors.primary} style={{ marginLeft: 'auto' }} />
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <PrimaryButton
          label={selected ? `Confirmar activación como ${PROFILES[selected].displayName}` : 'Elige un perfil'}
          icon="lock"
          onPress={handleConfirm}
          disabled={!selected}
          loading={isActivating}
        />
      </View>
    </SafeAreaView>
  );
}
