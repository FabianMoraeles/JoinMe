import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { placeSchema, type PlaceFormValues } from '@/features/experiences/schemas';
import { useCreatePlace } from '@/features/experiences/use-experiences';

export default function CreatePlaceScreen() {
  const { latitude, longitude } = useLocalSearchParams<{ latitude: string; longitude: string }>();
  const { mutate: createPlace, isPending } = useCreatePlace();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PlaceFormValues>({
    resolver: zodResolver(placeSchema),
    defaultValues: { name: '', city: '' },
  });

  function onSubmit(values: PlaceFormValues) {
    createPlace(
      {
        ...values,
        latitude: Number(latitude),
        longitude: Number(longitude),
        locationType: 'exact',
      },
      { onSuccess: (place) => router.replace(`/place/${place.id}`) },
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Nuevo lugar" />
      <ScrollView contentContainerClassName="gap-space-lg px-margin pb-space-xl pt-space-md">
        <Text className="font-jakarta text-body-sm text-on-surface-variant">
          Coordenadas: {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}
        </Text>

        <View className="gap-1">
          <Text className="font-jakarta-semibold text-label-lg text-on-surface">Nombre del lugar</Text>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Ej. Café Central"
                className="rounded-lg bg-surface-container-lowest px-space-md py-3 font-jakarta text-body-md text-on-surface shadow-sm"
              />
            )}
          />
          {errors.name ? <Text className="font-jakarta text-body-sm text-error">{errors.name.message}</Text> : null}
        </View>

        <View className="gap-1">
          <Text className="font-jakarta-semibold text-label-lg text-on-surface">Ciudad (opcional)</Text>
          <Controller
            control={control}
            name="city"
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Ciudad de Guatemala"
                className="rounded-lg bg-surface-container-lowest px-space-md py-3 font-jakarta text-body-md text-on-surface shadow-sm"
              />
            )}
          />
        </View>

        <PrimaryButton label="Guardar lugar" icon="location-on" onPress={handleSubmit(onSubmit)} loading={isPending} />
      </ScrollView>
    </View>
  );
}
