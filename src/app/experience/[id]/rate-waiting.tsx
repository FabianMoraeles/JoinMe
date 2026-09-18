import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Pill } from '@/components/ui/pill';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useExperience, usePlace, useSimulatePartnerRating } from '@/features/experiences/use-experiences';
import { colors } from '@/theme/colors';
import { PROFILES, partnerOf, useAuthStore } from '@/stores/use-auth-store';

export default function RateWaitingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const activeProfile = useAuthStore((state) => state.activeProfile);
  const partner = partnerOf(activeProfile);
  const { data: experience } = useExperience(id);
  const { data: place } = usePlace(experience?.placeId);
  const { mutate: simulatePartnerRating, isPending } = useSimulatePartnerRating(id);

  if (!experience) return null;

  const bothRated = experience.ratings.length === 2;

  function handleSimulatePartner() {
    simulatePartnerRating(partner, {
      onSuccess: () => router.replace(`/experience/${id}/rate-reveal`),
    });
  }

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="pb-space-xl">
      <View className="flex-row items-center justify-between px-gutter py-space-sm">
        <Pill label="Cita Sellada" icon="lock" tone="secondary" />
        <Pressable
          accessibilityLabel="Cerrar y volver al recuerdo"
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-surface-container active:opacity-70"
        >
          <MaterialIcons name="close" size={20} color={colors.onSurfaceVariant} />
        </Pressable>
      </View>

      <View className="items-center gap-space-xs px-margin pb-space-sm pt-space-xs">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-secondary-container">
          <MaterialIcons name="favorite" size={32} color={colors.onSecondary} />
        </View>
        <Text className="mt-space-xs max-w-[280px] text-center font-jakarta-bold text-headline-lg-mobile text-on-surface">
          ¡Tu puntuación está guardada bajo llave! 💌
        </Text>
        <Text className="max-w-[310px] text-center font-jakarta text-body-md text-on-surface-variant">
          Esperando la puntuación de{' '}
          <Text className="font-jakarta-semibold text-primary">{PROFILES[partner].displayName}</Text> para
          desbloquear el recuerdo conjunto.
        </Text>
      </View>

      <View className="gap-space-md px-margin pt-space-sm">
        <View className="gap-space-md rounded-lg bg-surface-container-lowest p-space-lg shadow-sm">
          <View className="flex-row items-center justify-between">
            <Text className="font-jakarta-bold text-label-sm uppercase tracking-wider text-outline">
              Sintonía en curso
            </Text>
            <Text className="font-jakarta-semibold text-label-md text-secondary">
              {bothRated ? '2 de 2 votos sellados' : '1 de 2 votos sellados'}
            </Text>
          </View>
          <View className="h-2 flex-row gap-1 overflow-hidden rounded-full bg-surface-container p-0.5">
            <View className={`h-full flex-1 rounded-full bg-secondary`} />
            <View className={`h-full flex-1 rounded-full ${bothRated ? 'bg-secondary' : 'bg-surface-variant'}`} />
          </View>

          {experience.ratings.map((rating) => (
            <View
              key={rating.profileKey}
              className="flex-row items-center justify-between gap-space-sm rounded bg-surface-container-low p-space-md"
            >
              <View className="flex-row items-center gap-space-sm">
                <Avatar uri={PROFILES[rating.profileKey].avatarUrl} size={44} />
                <View>
                  <Text className="font-jakarta-semibold text-title-md text-on-surface">
                    {PROFILES[rating.profileKey].displayName}
                  </Text>
                  <Text className="font-jakarta text-body-sm text-secondary">¡Lista y enviada!</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="font-jakarta-bold text-title-md tracking-widest text-primary">•••</Text>
                <Text className="font-jakarta text-label-sm text-outline">Oculto</Text>
              </View>
            </View>
          ))}
          {!bothRated ? (
            <View className="flex-row items-center justify-between gap-space-sm rounded bg-surface-container-low p-space-md">
              <View className="flex-row items-center gap-space-sm">
                <Avatar uri={PROFILES[partner].avatarUrl} size={44} />
                <View>
                  <Text className="font-jakarta-semibold text-title-md text-on-surface">
                    {PROFILES[partner].displayName}
                  </Text>
                  <Text className="font-jakarta text-body-sm text-tertiary">Pensando su valoración...</Text>
                </View>
              </View>
              <MaterialIcons name="lock-clock" size={22} color={colors.outline} />
            </View>
          ) : null}
        </View>

        <View className="gap-1 rounded-lg bg-primary-fixed/40 p-space-lg">
          <Text className="font-jakarta-semibold text-label-lg text-on-surface">Pacto de Complicidad</Text>
          <Text className="font-jakarta text-body-md leading-relaxed text-on-surface-variant">
            En cuanto {PROFILES[partner].displayName} valore la noche en{' '}
            <Text className="font-jakarta-semibold text-on-surface">{place?.name ?? 'este lugar'}</Text>, descubrirán si
            hubo sintonía total y se revelarán sus notas secretas.
          </Text>
        </View>

        <View className="gap-space-sm pt-space-xs">
          <PrimaryButton label="Editar mi puntuación" icon="edit-note" variant="ghost" onPress={() => router.back()} />
          {!bothRated ? (
            <PrimaryButton
              label="(Demo) Simular puntuación de la pareja"
              icon="sync-alt"
              onPress={handleSimulatePartner}
              loading={isPending}
            />
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}
