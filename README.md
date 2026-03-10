# Athlos

Athlos is an Expo + React Native + TypeScript institution management app for athletics events. This scaffold covers institution onboarding, roster management, event creation, invitation handling, participation registration, and event-day check-in with balanced heat generation.

## Stack

- Expo + React Native
- TypeScript
- Expo Router using `src/app`
- Firebase Web SDK
- Authentication, Firestore, Storage
- Zustand
- React Hook Form + Zod

## Setup

```bash
npm install
npm start
```

Copy `.env.example` into your local environment and set:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

## Firestore Collections

- `users`
- `institutions`
- `coaches`
- `athletes`
- `categories`
- `events`
- `eventDisciplines`
- `invitations`
- `eventParticipations`
- `eventRegistrations`
- `relayTeams`
- `checkins`
- `heatsOrGroups`
- `heatAssignments`
