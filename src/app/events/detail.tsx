import { Link } from "expo-router";
import { Text } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { StatusBadge } from "@/components/StatusBadge";
import { mockEventDisciplines, mockEvents } from "@/features/mockData";

export default function EventDetailScreen() {
  const event = mockEvents[0];

  return (
    <Screen>
      <AppSectionHeader title={event.name} subtitle={event.description} />
      <AppCard>
        <Text>Venue: {event.venue}</Text>
        <Text>Date: {event.eventDate}</Text>
        <StatusBadge label={event.status} />
      </AppCard>
      {mockEventDisciplines.map((discipline) => (
        <AppCard key={discipline.id}>
          <Text>{discipline.name}</Text>
          <Text>{discipline.disciplineType}</Text>
          <Text>Max per heat/group: {discipline.maxParticipantsPerHeat}</Text>
        </AppCard>
      ))}
      <Link href="/invitations/send" asChild>
        <AppButton label="Send invitations" />
      </Link>
    </Screen>
  );
}
