import { useRef, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import MapView, { Marker, type LongPressEvent, type Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useExperiences, usePlaces } from '@/features/experiences/use-experiences';
import type { ExperienceStatus } from '@/features/experiences/types';
import { colors } from '@/theme/colors';

const GUATEMALA_CITY: Region = {
  latitude: 14.6139,
  longitude: -90.5069,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

type FilterKey = 'all' | ExperienceStatus;
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'idea', label: 'Ideas' },
  { key: 'planned', label: 'Planeadas' },
  { key: 'completed', label: 'Realizadas' },
];

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const { data: places } = usePlaces();
  const { data: experiences } = useExperiences();
  const [filter, setFilter] = useState<FilterKey>('all');

  async function handleCenterOnUser() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const position = await Location.getCurrentPositionAsync({});
    mapRef.current?.animateToRegion({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    });
  }

  function handleLongPress(event: LongPressEvent) {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    router.push({ pathname: '/place/create', params: { latitude: String(latitude), longitude: String(longitude) } });
  }

  const placesWithMarkers = (places ?? [])
    .filter((place) => place.latitude != null && place.longitude != null)
    .map((place) => {
      const placeExperiences = (experiences ?? []).filter((e) => e.placeId === place.id);
      const matchesFilter = filter === 'all' || placeExperiences.some((e) => e.status === filter);
      const hasCompleted = placeExperiences.some((e) => e.status === 'completed');
      const hasPlanned = placeExperiences.some((e) => e.status === 'planned');
      return { place, matchesFilter, hasCompleted, hasPlanned };
    });

  return (
    <View className="flex-1 bg-surface">
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={GUATEMALA_CITY}
        onLongPress={handleLongPress}
      >
        {placesWithMarkers
          .filter((p) => p.matchesFilter)
          .map(({ place, hasCompleted, hasPlanned }) => (
            <Marker
              key={place.id}
              coordinate={{ latitude: place.latitude!, longitude: place.longitude! }}
              pinColor={hasCompleted ? colors.primary : hasPlanned ? colors.secondary : colors.outline}
              title={place.name}
              description={place.city}
              onCalloutPress={() => router.push(`/place/${place.id}`)}
            />
          ))}
      </MapView>

      <SafeAreaView className="absolute left-0 right-0 top-0" edges={['top']} pointerEvents="box-none">
        <View className="flex-row gap-2 px-margin pt-space-sm" pointerEvents="box-none">
          {FILTERS.map((item) => {
            const active = filter === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setFilter(item.key)}
                className={`rounded-full px-3 py-1.5 shadow-sm ${active ? 'bg-primary' : 'bg-surface-container-lowest'}`}
              >
                <Text className={`font-jakarta-semibold text-label-md ${active ? 'text-on-primary' : 'text-on-surface'}`}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>

      <SafeAreaView className="absolute bottom-0 right-0" edges={['bottom']} pointerEvents="box-none">
        <Pressable
          onPress={handleCenterOnUser}
          className="mb-space-md mr-margin h-12 w-12 items-center justify-center rounded-full bg-surface-container-lowest shadow-md"
        >
          <MaterialIcons name="my-location" size={22} color={colors.primary} />
        </Pressable>
      </SafeAreaView>

      <Text className="absolute bottom-2 left-0 right-0 text-center font-jakarta text-label-sm text-on-surface-variant">
        Mantén presionado el mapa para crear un lugar nuevo
      </Text>
    </View>
  );
}
