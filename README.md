# JoinMe

Private two-person dating-memories app for Yesica & Fabián. Full product spec in
[plan_app_parejas.md](./plan_app_parejas.md).

## Stack

Expo + TypeScript + Expo Router, NativeWind (Tailwind for React Native), Supabase,
TanStack Query, Zustand, React Hook Form + Zod, react-native-maps, expo-location,
expo-image-picker, @react-native-community/datetimepicker, expo-notifications,
jest-expo + React Native Testing Library.

## Testing

```bash
npm test
```

Runs the Jest suite (`jest-expo` preset): pure-logic coverage for the hidden-rating state
machine (`src/features/experiences/__tests__/types.test.ts`) and a component test for
`HeartRatingInput`. Not a full suite — see "Known simplifications" below.

## Get started

```bash
npm install
cp .env.example .env   # fill in EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY once you have a project
npx expo start
```

Open in **Expo Go** on a phone, or an iOS/Android simulator — this app is mobile-only (maps,
location and the photo picker have no meaningful web output, so `npx expo start --web` is not
supported).

There's no live Supabase project wired up yet — the app reads/writes through an in-memory mock
(`src/features/experiences/mock-backend.ts`) shaped like the real tables, so every screen works
standalone. `supabase/migrations/` and `supabase/seed.sql` create the matching schema (with RLS
policies scoped by couple membership) and seed data once a project exists; swapping the mock for
real Supabase calls happens inside `src/features/experiences/use-experiences.ts` one hook at a
time, without touching any screen.

### Try the full flow

1. First launch → pick **Soy Yesica** or **Soy Fabián** on the activation screen.
2. **Mapa** → hold anywhere on the map to create a place, tap a marker → its place detail.
3. **Ideas** → "Nueva idea" → fill the form → open it → "Convertir en plan" → pick a place + date.
4. Open the planned idea again → "Marcar como realizada" → confirm the real date.
5. Add photos from the experience detail screen, then use the rating CTA there to rate the date.
6. On the waiting screen, use the dev-only "Simular puntuación de la pareja" button (no second
   phone needed) to unlock the reveal screen.
7. **Huella** now shows stats computed from every completed date; **Perfil** lets you preview the
   app as the other profile, edit notification settings, and revoke this device's activation.

## Project layout

- `src/app/` — Expo Router screens: `(activation)/` (device binding), `(tabs)/` (Mapa, Ideas,
  Huella, Perfil), `experience/[id]/` (detail, plan, complete, rate/rate-waiting/rate-reveal),
  `place/` (create, detail), `idea/create`.
- `src/components/ui/` — shared building blocks (Avatar, Pill, PrimaryButton, HeartRatingInput,
  ExperienceCard, ScreenHeader...).
- `src/features/experiences/` — domain types, the mock backend (Zustand, shaped like the real
  Supabase tables), Zod schemas for the forms, and the TanStack Query hooks every screen calls.
- `src/stores/use-auth-store.ts` — persisted device-activation state (which profile this phone is
  bound to) plus a dev-only "preview as the other profile" override.
- `src/theme/colors.ts` / `tailwind.config.js` — design tokens shared between className usage and
  raw-hex usage (icons, SVG).
- `supabase/` — SQL migrations, RLS policies, the `submit_rating` security-definer function, and
  seed data for Yesica & Fabián's couple.

## Known simplifications (not yet real)

These are placeholders standing in for pieces that need external accounts/credentials or native
config this session couldn't provide — call them out explicitly rather than treat them as done:

- **No live backend.** Everything lives in the in-memory mock; closing the app resets demo data
  you added (new ideas, photos, etc.) back to the seed. Connecting a real Supabase project is the
  next step (`supabase/` is ready for it).
- **Photos aren't uploaded anywhere** — `expo-image-picker` returns a local file URI that's only
  valid for this device session; there's no Supabase Storage bucket wired up yet.
- **Android Google Maps needs an API key** (`app.json` → `android.config.googleMaps.apiKey`) to
  render map tiles in a real build; iOS uses Apple Maps and needs nothing extra.
- **Notifications are local, not push** — `src/services/notifications/` requests permission and
  fires a real on-device notification (via `expo-notifications`) when a date is marked completed
  or both ratings are in, gated by each profile's toggle in Perfil. But since there's no push
  server, it fires on *this* device rather than the partner's — a stand-in for what Fase 11's
  real push setup would deliver.
- **Test coverage is minimal** — two files, as a working example of the pattern (see "Testing"
  above), not the "pruebas de los flujos principales" Fase 12 asks for. Maestro flow tests aren't
  set up at all (they need a running device/CLI outside this environment).
- **No Sentry, EAS builds, or app store assets** — Fase 12 of the plan (crash monitoring, beta
  distribution, publishing) needs Expo/Sentry/Apple/Google accounts this session doesn't have.
