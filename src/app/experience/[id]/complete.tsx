import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { DateField } from '@/components/ui/date-field';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { completeSchema, type CompleteFormValues } from '@/features/experiences/schemas';
import { useExperience, useMarkCompleted, usePlaces } from '@/features/experiences/use-experiences';

const today = () => new Date().toISOString().slice(0, 10);

export default function MarkCompletedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: experience } = useExperience(id);
  const { data: places } = usePlaces();
  const { mutate: markCompleted, isPending } = useMarkCompleted();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CompleteFormValues>({
    resolver: zodResolver(completeSchema),
    defaultValues: { placeId: '', completedAt: today() },
  });

  useEffect(() => {
    if (experience) reset({ placeId: experience.placeId ?? '', completedAt: today() });
  }, [experience, reset]);

  const placeId = watch('placeId');

  function onSubmit(values: CompleteFormValues) {
    markCompleted({ id, ...values }, { onSuccess: () => router.replace(`/experience/${id}`) });
  }

  if (!experience) return null;

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title={`Confirmar "${experience.title}"`} />
      <ScrollView contentContainerClassName="gap-space-lg px-margin pb-space-xl pt-space-md">
        <Text className="font-jakarta text-body-md text-on-surface-variant">
          Confirma dónde y cuándo pasó realmente — después podrán añadir fotos y calificarla.
        </Text>

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
          name="completedAt"
          render={({ field }) => (
            <DateField label="Fecha real" value={field.value} onChange={field.onChange} error={errors.completedAt?.message} />
          )}
        />

        <PrimaryButton label="Confirmar cita realizada" icon="check-circle" onPress={handleSubmit(onSubmit)} loading={isPending} />
      </ScrollView>
    </View>
  );
}
