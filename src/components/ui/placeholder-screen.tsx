import type { ComponentProps, ReactNode } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';

interface PlaceholderScreenProps {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  description: string;
  children?: ReactNode;
}

export function PlaceholderScreen({ icon, title, description, children }: PlaceholderScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <View className="flex-1 items-center justify-center gap-space-md px-margin">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-primary-fixed">
          <MaterialIcons name={icon} size={30} color={colors.primary} />
        </View>
        <Text className="text-center font-jakarta-bold text-headline-md text-on-surface">{title}</Text>
        <Text className="text-center font-jakarta text-body-md text-on-surface-variant">{description}</Text>
        {children}
      </View>
    </SafeAreaView>
  );
}
