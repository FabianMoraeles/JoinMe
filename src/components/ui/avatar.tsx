import { Image } from 'expo-image';
import { View } from 'react-native';

interface AvatarProps {
  uri: string;
  size?: number;
  ringed?: boolean;
  className?: string;
}

export function Avatar({ uri, size = 48, ringed = false, className }: AvatarProps) {
  return (
    <View
      className={`overflow-hidden rounded-full ${ringed ? 'border-2 border-primary-fixed' : ''} ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      <Image source={{ uri }} style={{ width: size, height: size }} contentFit="cover" />
    </View>
  );
}
