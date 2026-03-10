import { Link } from "expo-router";
import { Text } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { mockAthletes, mockCoaches, mockEvents, mockInstitution, mockInvitations } from "@/features/mockData";

export default function DashboardScreen() {
  return (
    <Screen>
      <AppSectionHeader
        title={mockInstitution.name}
        subtitle="Institution control center for events, invitations, registration, and competition-day operations."
      />
      <AppCard>
        <Text>{mockEvents.length} active events</Text>
        <Text>{mockInvitations.length} invitation records</Text>
        <Text>{mockAthletes.length} athletes in roster</Text>
        <Text>{mockCoaches.length} coaches registered</Text>
      </AppCard>
      <Link href="/auth/login" asChild>
        <AppButton label="Open authentication flow" />
      </Link>
      <Link href="/institution/profile" asChild>
        <AppButton label="Edit institution profile" variant="secondary" />
      </Link>
    </Screen>
  );
}
