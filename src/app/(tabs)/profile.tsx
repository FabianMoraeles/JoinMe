import { useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { Pill } from '@/components/ui/pill';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useCouple, useNotificationSettings, useUpdateCouple, useUpdateNotificationSetting } from '@/features/experiences/use-experiences';
import type { NotificationSettings } from '@/features/experiences/types';
import { colors } from '@/theme/colors';
import { PROFILES, partnerOf, useAuthStore, type ProfileKey } from '@/stores/use-auth-store';

const NOTIFICATION_LABELS: Record<keyof NotificationSettings, string> = {
  newPlan: 'Nuevo plan creado',
  planChanged: 'Plan modificado',
  experienceCompleted: 'Cita marcada como realizada',
  ratingRequested: 'Solicitud de puntuación',
  ratingRevealed: 'Puntuaciones listas para revelarse',
};

export default function ProfileScreen() {
  const activatedProfile = useAuthStore((state) => state.activatedProfile) as ProfileKey;
  const activeProfile = useAuthStore((state) => state.activeProfile);
  const setActiveProfile = useAuthStore((state) => state.setActiveProfile);
  const revokeDevice = useAuthStore((state) => state.revokeDevice);

  const { data: couple } = useCouple();
  const { mutate: updateCouple } = useUpdateCouple();
  const { data: notificationSettings } = useNotificationSettings(activeProfile);
  const { mutate: updateNotificationSetting } = useUpdateNotificationSetting(activeProfile);

  const [coupleName, setCoupleName] = useState(couple?.name ?? '');

  useEffect(() => {
    if (couple) setCoupleName(couple.name);
  }, [couple]);

  function handleRevoke() {
    revokeDevice();
    router.replace('/(activation)');
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <ScrollView contentContainerClassName="gap-space-lg px-margin pb-space-xl pt-space-lg">
        <View className="flex-row items-center justify-between">
          <Text className="font-jakarta-bold text-headline-md text-on-surface">Perfil</Text>
          <Pill label={`Activado como ${PROFILES[activatedProfile].displayName}`} icon="verified-user" tone="primary" />
        </View>

        <View className="gap-space-sm rounded-lg bg-surface-container-lowest p-space-lg shadow-sm">
          <Text className="font-jakarta-bold text-label-sm uppercase tracking-wider text-on-surface-variant">
            Nuestra pareja
          </Text>
          <View className="flex-row items-center gap-space-sm">
            <View className="flex-row">
              <Avatar uri={PROFILES.yesica.avatarUrl} size={44} />
              <Avatar uri={PROFILES.fabian.avatarUrl} size={44} className="-ml-3" />
            </View>
            <TextInput
              value={coupleName}
              onChangeText={setCoupleName}
              onBlur={() => coupleName.trim() && updateCouple({ name: coupleName.trim() })}
              className="flex-1 font-jakarta-semibold text-title-md text-on-surface"
              placeholder="Nombre de la pareja"
            />
          </View>
          {couple?.relationshipStartedOn ? (
            <Text className="font-jakarta text-body-sm text-on-surface-variant">
              Juntos desde {couple.relationshipStartedOn} · {couple.baseCity}
            </Text>
          ) : null}
        </View>

        <View className="gap-space-sm">
          <Text className="font-jakarta-bold text-label-sm uppercase tracking-wider text-on-surface-variant">
            Notificaciones {activeProfile === activatedProfile ? '' : `(vista de ${PROFILES[activeProfile].displayName})`}
          </Text>
          <View className="gap-1 rounded-lg bg-surface-container-lowest p-space-sm shadow-sm">
            {notificationSettings &&
              (Object.keys(NOTIFICATION_LABELS) as (keyof NotificationSettings)[]).map((key) => (
                <View key={key} className="flex-row items-center justify-between px-space-sm py-2">
                  <Text className="flex-1 font-jakarta text-body-md text-on-surface">{NOTIFICATION_LABELS[key]}</Text>
                  <Switch
                    value={notificationSettings[key]}
                    onValueChange={(value) => updateNotificationSetting({ key, value })}
                    trackColor={{ false: colors.surfaceContainerHigh, true: colors.primaryFixed }}
                    thumbColor={notificationSettings[key] ? colors.primary : colors.surfaceContainerLowest}
                  />
                </View>
              ))}
          </View>
        </View>

        <View className="gap-space-sm">
          <Text className="font-jakarta-bold text-label-sm uppercase tracking-wider text-on-surface-variant">
            Modo desarrollador · previsualizar como
          </Text>
          <Text className="font-jakarta text-body-sm text-on-surface-variant">
            Este teléfono está activado como {PROFILES[activatedProfile].displayName}. Usa esto solo para probar el
            flujo de puntuación desde el otro lado sin necesidad de un segundo teléfono.
          </Text>
          <View className="flex-row gap-space-sm">
            {(['yesica', 'fabian'] as ProfileKey[]).map((key) => {
              const active = key === activeProfile;
              return (
                <Pressable
                  key={key}
                  onPress={() => setActiveProfile(key)}
                  className={`flex-1 flex-row items-center gap-space-sm rounded-lg p-space-md ${
                    active ? 'bg-primary-fixed' : 'bg-surface-container-lowest'
                  }`}
                >
                  <Avatar uri={PROFILES[key].avatarUrl} size={36} ringed={active} />
                  <Text className="font-jakarta-semibold text-label-lg text-on-surface">{PROFILES[key].displayName}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <PrimaryButton
          label={`Revocar este dispositivo (${PROFILES[activatedProfile].displayName})`}
          icon="phonelink-erase"
          variant="ghost"
          onPress={handleRevoke}
        />
        <Text className="text-center font-jakarta text-body-sm text-on-surface-variant">
          Revocar no borra recuerdos ni perfiles — {PROFILES[partnerOf(activatedProfile)].displayName} sigue teniendo
          acceso desde su teléfono.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
