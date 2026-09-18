import { useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Switch, Text, TextInput, View } from 'react-native';
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
  const revokeDevice = useAuthStore((state) => state.revokeDevice);

  const { data: couple } = useCouple();
  const { mutate: updateCouple } = useUpdateCouple();
  const { data: notificationSettings } = useNotificationSettings();
  const { mutate: updateNotificationSetting } = useUpdateNotificationSetting();

  const [coupleName, setCoupleName] = useState(couple?.name ?? '');
  const [isRevoking, setIsRevoking] = useState(false);

  useEffect(() => {
    if (couple) setCoupleName(couple.name);
  }, [couple]);

  async function handleRevoke() {
    setIsRevoking(true);
    try {
      await revokeDevice();
      router.replace('/(activation)');
    } finally {
      setIsRevoking(false);
    }
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
            Notificaciones
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

        <PrimaryButton
          label={`Revocar este dispositivo (${PROFILES[activatedProfile].displayName})`}
          icon="phonelink-erase"
          variant="ghost"
          onPress={handleRevoke}
          loading={isRevoking}
        />
        <Text className="text-center font-jakarta text-body-sm text-on-surface-variant">
          Revocar no borra recuerdos ni perfiles — {PROFILES[partnerOf(activatedProfile)].displayName} sigue teniendo
          acceso desde su teléfono.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
