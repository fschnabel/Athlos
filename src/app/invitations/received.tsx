import { Link } from "expo-router";
import { Text } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { mockInvitations } from "@/features/mockData";

export default function ReceivedInvitationsScreen() {
  const received = mockInvitations.filter((item) => item.toInstitutionId === "inst-1");

  return (
    <Screen>
      <AppSectionHeader title="Received Invitations" subtitle="Review invitations from external institutions and respond." />
      {received.map((invitation) => (
        <AppCard key={invitation.id}>
          <Text>Event: {invitation.eventId}</Text>
          <Text>Status: {invitation.status}</Text>
        </AppCard>
      ))}
      <Link href="/invitations/accept" asChild>
        <AppButton label="Accept invitation" />
      </Link>
      <Link href="/invitations/reject" asChild>
        <AppButton label="Reject invitation" variant="danger" />
      </Link>
    </Screen>
  );
}
