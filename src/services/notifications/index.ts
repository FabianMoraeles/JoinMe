import Constants from 'expo-constants';

// Merely importing 'expo-notifications' throws in Expo Go on Android since SDK 53 (remote
// notifications were removed from Expo Go there) — a static top-level import would crash the
// whole app under Expo Go before any of our own guard code could run. A dynamic import deferred
// behind this check means that module's problematic top-level code never executes in Expo Go.
// Constants.appOwnership (the older check) reads null rather than 'expo' on current Expo Go
// builds — executionEnvironment is the live check, though note it also matches a dev-client
// build (where notifications do work); this project doesn't use expo-dev-client, so that's fine.
const isExpoGo = Constants.executionEnvironment === 'storeClient';

let handlerConfigured = false;

async function getNotifications() {
  if (isExpoGo) return null;
  const Notifications = await import('expo-notifications');
  if (!handlerConfigured) {
    // SDK 57: shouldShowBanner/shouldShowList replaced the older shouldShowAlert field.
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    handlerConfigured = true;
  }
  return Notifications;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const Notifications = await getNotifications();
  if (!Notifications) return false;
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const requested = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return requested.granted;
}

// There is no real push server here (plan_app_parejas.md §5.12/Fase 11 needs one), so this
// schedules a short-delay local notification on the same device as a stand-in for what a real
// push to the partner's phone would trigger. No-ops under Expo Go (see isExpoGo above) — needs
// a development build to actually fire there.
export async function sendLocalNotification(title: string, body: string) {
  const Notifications = await getNotifications();
  if (!Notifications) return;
  const granted = await requestNotificationPermissions();
  if (!granted) return;
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2 },
  });
}
