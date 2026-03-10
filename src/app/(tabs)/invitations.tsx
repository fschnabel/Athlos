import { Link } from "expo-router";
import { Text } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { StatusBadge } from "@/components/StatusBadge";
import { mockInvitations } from "@/features/mockData";

export default function InvitationsTabScreen() {
  return (
    <Screen>
      <AppSectionHeader title="Invitations" subtitle="Send invitations to institutions and manage responses." />
      {mockInvitations.map((invitation) => (
        <AppCard key={invitation.id}>
          <Text>{invitation.eventId}</Text>
          <StatusBadge label={invitation.status} tone={invitation.status === "accepted" ? "success" : "default"} />
        </AppCard>
      ))}
      <Link href="/invitations/search" asChild>
        <AppButton label="Search institutions" />
      </Link>
      <Link href="/invitations/received" asChild>
        <AppButton label="Received invitations" variant="secondary" />
      </Link>
    </Screen>
  );
}
