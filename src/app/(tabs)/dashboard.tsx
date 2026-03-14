import { Link } from "expo-router";
import { Text } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { mockAthletes, mockCoaches, mockEvents, mockInvitations } from "@/features/mockData";
import { useInstitutionStore } from "@/store/institution-store";

export default function DashboardScreen() {
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);

  return (
    <Screen>
      <AppSectionHeader
        title={activeInstitution?.name ?? "Athlos"}
        subtitle="Institution control center for events, invitations, registration, and competition-day operations."
      />
      <AppCard>
        <Text>{mockEvents.length} active events</Text>
        <Text>{mockInvitations.length} invitation records</Text>
        <Text>{mockAthletes.length} athletes in roster</Text>
        <Text>{mockCoaches.length} coaches registered</Text>
      </AppCard>
      <Link href="/institution/profile" asChild>
        <AppButton label="View institution profile" />
      </Link>
      <Link href="/institutions/select" asChild>
        <AppButton label="Switch institution" variant="secondary" />
      </Link>
    </Screen>
  );
}
