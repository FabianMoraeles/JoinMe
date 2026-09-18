import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useCategories, useCreateIdea, usePlaces } from '@/features/experiences/use-experiences';
import { ideaSchema, type IdeaFormValues } from '@/features/experiences/schemas';

const BUDGET_LABELS: Record<1 | 2 | 3, string> = { 1: '$', 2: '$$', 3: '$$$' };

export default function CreateIdeaScreen() {
  const { data: categories } = useCategories();
  const { data: places } = usePlaces();
  const { mutate: createIdea, isPending } = useCreateIdea();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaSchema),
    defaultValues: { title: '', description: '', categoryId: undefined, placeId: undefined, budgetLevel: undefined },
  });

  const categoryId = watch('categoryId');
  const placeId = watch('placeId');
  const budgetLevel = watch('budgetLevel');

  function onSubmit(values: IdeaFormValues) {
    createIdea(values, { onSuccess: () => router.back() });
  }

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Nueva idea" />
      <ScrollView contentContainerClassName="gap-space-lg px-margin pb-space-xl pt-space-md">
        <View className="gap-1">
          <Text className="font-jakarta-semibold text-label-lg text-on-surface">Título</Text>
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Ej. Cena con velas en la azotea"
                className="rounded-lg bg-surface-container-lowest px-space-md py-3 font-jakarta text-body-md text-on-surface shadow-sm"
              />
            )}
          />
          {errors.title ? <Text className="font-jakarta text-body-sm text-error">{errors.title.message}</Text> : null}
        </View>

        <View className="gap-1">
          <Text className="font-jakarta-semibold text-label-lg text-on-surface">Descripción (opcional)</Text>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder="¿En qué consiste la idea?"
                multiline
                numberOfLines={3}
                className="rounded-lg bg-surface-container-lowest px-space-md py-3 font-jakarta text-body-md text-on-surface shadow-sm"
              />
            )}
          />
        </View>

        <View className="gap-1">
          <Text className="font-jakarta-semibold text-label-lg text-on-surface">Categoría</Text>
          <View className="flex-row flex-wrap gap-2">
            {categories?.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => setValue('categoryId', categoryId === category.id ? undefined : category.id)}
                className={`rounded-full px-3 py-1.5 ${categoryId === category.id ? 'bg-primary-fixed' : 'bg-surface-container-lowest'}`}
              >
                <Text className="font-jakarta-semibold text-label-md text-on-surface">{category.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="gap-1">
          <Text className="font-jakarta-semibold text-label-lg text-on-surface">Presupuesto estimado</Text>
          <View className="flex-row gap-2">
            {([1, 2, 3] as const).map((level) => (
              <Pressable
                key={level}
                onPress={() => setValue('budgetLevel', budgetLevel === level ? undefined : level)}
                className={`rounded-full px-4 py-1.5 ${budgetLevel === level ? 'bg-primary-fixed' : 'bg-surface-container-lowest'}`}
              >
                <Text className="font-jakarta-semibold text-label-md text-on-surface">{BUDGET_LABELS[level]}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {places && places.length > 0 ? (
          <View className="gap-1">
            <Text className="font-jakarta-semibold text-label-lg text-on-surface">Lugar (opcional)</Text>
            <View className="flex-row flex-wrap gap-2">
              {places.map((place) => (
                <Pressable
                  key={place.id}
                  onPress={() => setValue('placeId', placeId === place.id ? undefined : place.id)}
                  className={`rounded-full px-3 py-1.5 ${placeId === place.id ? 'bg-primary-fixed' : 'bg-surface-container-lowest'}`}
                >
                  <Text className="font-jakarta-semibold text-label-md text-on-surface">{place.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <PrimaryButton label="Guardar idea" icon="lightbulb" onPress={handleSubmit(onSubmit)} loading={isPending} />
      </ScrollView>
    </View>
  );
}
