import { Link } from "expo-router";
import { Text } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { mockEvents } from "@/features/mockData";

export default function EventsTabScreen() {
  return (
    <Screen>
      <AppSectionHeader title="My Events" subtitle="Create meets, define event disciplines, and manage invited institutions." />
      {mockEvents.map((event) => (
        <AppCard key={event.id}>
          <Text>{event.name}</Text>
          <Text>{event.venue}</Text>
          <Text>{event.eventDate}</Text>
        </AppCard>
      ))}
      <Link href="/events/create" asChild>
        <AppButton label="Create event" />
      </Link>
      <Link href="/events/detail" asChild>
        <AppButton label="Open event detail" variant="secondary" />
      </Link>
    </Screen>
  );
}
