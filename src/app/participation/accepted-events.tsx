import { Link } from "expo-router";
import { Text } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { mockInvitations } from "@/features/mockData";

export default function AcceptedEventsScreen() {
  const accepted = mockInvitations.filter((item) => item.status === "accepted");

  return (
    <Screen>
      <AppSectionHeader title="Accepted Events" subtitle="Events where your institution can register athletes." />
      {accepted.map((invitation) => (
        <AppCard key={invitation.id}>
          <Text>Event ID: {invitation.eventId}</Text>
          <Text>Invitation ID: {invitation.id}</Text>
        </AppCard>
      ))}
      <Link href="/participation/register-athletes" asChild>
        <AppButton label="Register athletes" />
      </Link>
    </Screen>
  );
}
