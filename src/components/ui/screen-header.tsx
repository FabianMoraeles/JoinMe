import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { colors } from '@/theme/colors';

interface ScreenHeaderProps {
  title: string;
  avatarUri?: string;
  onBack?: () => void;
}

export function ScreenHeader({ title, avatarUri, onBack }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="border-b border-surface-container bg-surface/95"
    >
      <View className="h-16 flex-row items-center justify-between gap-space-sm px-gutter">
        <View className="flex-1 flex-row items-center gap-space-sm">
          <Pressable
            accessibilityLabel="Volver"
            onPress={onBack ?? (() => router.back())}
            className="h-11 w-11 items-center justify-center rounded-full active:opacity-60"
          >
            <MaterialIcons name="arrow-back-ios-new" size={22} color={colors.secondary} />
          </Pressable>
          <Text className="flex-1 font-jakarta-semibold text-title-md text-on-surface" numberOfLines={1}>
            {title}
          </Text>
        </View>
        {avatarUri ? <Avatar uri={avatarUri} size={32} ringed /> : null}
      </View>
    </View>
  );
}
