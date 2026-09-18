# JoinMe

Private two-person dating-memories app for Yesica & Fabián. Full product spec in
[plan_app_parejas.md](./plan_app_parejas.md).

## Stack

Expo + TypeScript + Expo Router, NativeWind (Tailwind for React Native), Supabase (Postgres +
Auth + Storage + Realtime), TanStack Query, Zustand, React Hook Form + Zod, react-native-maps,
expo-location, expo-image-picker, expo-image-manipulator, expo-crypto,
@react-native-community/datetimepicker, expo-notifications, jest-expo + React Native Testing
Library.

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
cp .env.example .env   # fill in with your Supabase project's URL + anon/publishable key
npx expo start
```

Open in **Expo Go** on a phone, or an iOS/Android simulator — this app is mobile-only (maps,
location, the photo picker, and Supabase's persisted-session storage have no meaningful web
output, so `npx expo start --web` is not supported).

### Supabase project setup (one-time, per project)

The app talks to a real Supabase project — there's no mock/offline mode. In the SQL Editor of
your project, run these files **in this exact order**:

1. `supabase/migrations/0001_init.sql` — tables + RLS.
2. `supabase/migrations/0002_policies.sql` — couple-membership-scoped policies.
3. `supabase/functions/submit_rating.sql` — the hidden-rating security-definer function.
4. `supabase/migrations/0003_activation_and_storage.sql` — the `activate_device` function, the
   private `experience-photos` Storage bucket + its policies, and enabling Realtime on `ratings`.
5. `supabase/seed.sql` — Yesica, Fabián, their couple, default categories, and a demo place/date.

Because Supabase's free tier **pauses a project after 1 week of inactivity**, if the app can't
reach Supabase, check the dashboard first — unpausing takes a few seconds.

### Try the full flow

1. First launch → pick **Soy Yesica** or **Soy Fabián** on the activation screen — this signs the
   device in anonymously and binds it to that profile server-side.
2. **Mapa** → hold anywhere on the map to create a place, tap a marker → its place detail.
3. **Ideas** → "Nueva idea" → fill the form → open it → "Convertir en plan" → pick a place + date.
4. Open the planned idea again → "Marcar como realizada" → confirm the real date.
5. Add photos from the experience detail screen (compressed + uploaded to a private bucket), then
   use the rating CTA there to rate the date.
6. The waiting screen actually waits: it subscribes to Realtime and unlocks the moment the
   partner rates from *their own* device/session — there's no single-device "simulate partner"
   shortcut anymore (see Known simplifications).
7. **Huella** shows stats computed from every completed date; **Perfil** shows the couple's
   shared profile, notification settings, and lets you revoke this device's activation.

## Project layout

- `src/app/` — Expo Router screens: `(activation)/` (device binding), `(tabs)/` (Mapa, Ideas,
  Huella, Perfil), `experience/[id]/` (detail, plan, complete, rate/rate-waiting/rate-reveal),
  `place/` (create, detail), `idea/create`.
- `src/components/ui/` — shared building blocks (Avatar, Pill, PrimaryButton, HeartRatingInput,
  ExperienceCard, ScreenHeader, DateField...).
- `src/features/experiences/` — domain types, Zod schemas for the forms, the photo
  compress-and-upload pipeline (`photos.ts`), and the TanStack Query hooks (`use-experiences.ts`)
  every screen calls — each one a real Supabase query/RPC, no mock layer left.
- `src/stores/use-auth-store.ts` — persisted device-activation state (anonymous Supabase auth
  session + which profile/couple this phone is bound to).
- `src/theme/colors.ts` / `tailwind.config.js` — design tokens shared between className usage and
  raw-hex usage (icons, SVG).
- `supabase/` — SQL migrations, RLS policies, the `submit_rating`/`activate_device`
  security-definer functions, private Storage bucket policies, and seed data.

## Known simplifications (not yet real)

These are placeholders standing in for pieces that need external accounts/credentials or native
config this session couldn't provide — call them out explicitly rather than treat them as done:

- **Testing the reveal needs two real sessions.** Since `submit_rating()` resolves identity from
  the caller's own Supabase session, one device can only ever rate as the profile it's activated
  as. To see both sides, either use two devices, or on one device clear the app's storage and
  reactivate as the other profile to submit that side's rating.
- **Android Google Maps needs an API key** (`app.json` → `android.config.googleMaps.apiKey`) to
  render map tiles in a real build; iOS uses Apple Maps and needs nothing extra.
- **Notifications are local to each device, not push.** `src/services/notifications/` requests
  permission and fires a real on-device notification when *this* device marks a date completed or
  sees both ratings land, gated by that profile's own toggle in Perfil. A real push to the
  partner's phone still needs Fase 11's push server — out of reach without that infrastructure.
- **Upload progress is per-file, not per-byte** ("Subiendo foto 2 de 3") — supabase-js's storage
  upload doesn't expose byte-level progress in React Native.
- **Test coverage is minimal** — two files, as a working example of the pattern (see "Testing"
  above), not the "pruebas de los flujos principales" Fase 12 asks for. Maestro flow tests aren't
  set up at all (they need a running device/CLI outside this environment).
- **No Sentry, EAS builds, or app store assets** — Fase 12 of the plan (crash monitoring, beta
  distribution, publishing) needs Expo/Sentry/Apple/Google accounts this session doesn't have.
- **No "registrar cita realizada" direct-entry screen** — the plan lists creating a completed
  date without going through idea → plan first; only the idea → plan → completed path has a UI
  today.
