import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { DateField } from '@/components/ui/date-field';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { planSchema, type PlanFormValues } from '@/features/experiences/schemas';
import { useConvertIdeaToPlan, useExperience, usePlaces } from '@/features/experiences/use-experiences';

export default function ConvertToPlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: experience } = useExperience(id);
  const { data: places } = usePlaces();
  const { mutate: convertIdeaToPlan, isPending } = useConvertIdeaToPlan();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: { placeId: '', plannedAt: '' },
  });

  useEffect(() => {
    if (experience) reset({ placeId: experience.placeId ?? '', plannedAt: experience.plannedAt ?? '' });
  }, [experience, reset]);

  const placeId = watch('placeId');

  function onSubmit(values: PlanFormValues) {
    convertIdeaToPlan({ id, ...values }, { onSuccess: () => router.replace(`/experience/${id}`) });
  }

  if (!experience) return null;

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title={`Planear "${experience.title}"`} />
      <ScrollView contentContainerClassName="gap-space-lg px-margin pb-space-xl pt-space-md">
        <View className="gap-1">
          <Text className="font-jakarta-semibold text-label-lg text-on-surface">Lugar</Text>
          {!places || places.length === 0 ? (
            <Text className="font-jakarta text-body-sm text-on-surface-variant">
              Aún no tienen lugares registrados. Créalo primero desde el mapa.
            </Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {places.map((place) => (
                <Pressable
                  key={place.id}
                  onPress={() => setValue('placeId', place.id)}
                  className={`rounded-full px-3 py-1.5 ${placeId === place.id ? 'bg-primary-fixed' : 'bg-surface-container-lowest'}`}
                >
                  <Text className="font-jakarta-semibold text-label-md text-on-surface">{place.name}</Text>
                </Pressable>
              ))}
            </View>
          )}
          {errors.placeId ? <Text className="font-jakarta text-body-sm text-error">{errors.placeId.message}</Text> : null}
        </View>

        <Controller
          control={control}
          name="plannedAt"
          render={({ field }) => (
            <DateField label="Fecha planeada" value={field.value} onChange={field.onChange} error={errors.plannedAt?.message} />
          )}
        />

        <PrimaryButton label="Confirmar plan" icon="event-available" onPress={handleSubmit(onSubmit)} loading={isPending} />
      </ScrollView>
    </View>
  );
}
