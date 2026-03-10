import { Link } from "expo-router";
import { Text } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { mockCoaches } from "@/features/mockData";

export default function CoachesListScreen() {
  return (
    <Screen>
      <AppSectionHeader title="Coaches" subtitle="Assign staff to your institution and keep their contact details current." />
      {mockCoaches.map((coach) => (
        <AppCard key={coach.id}>
          <Text>{coach.firstName} {coach.lastName}</Text>
          <Text>{coach.email}</Text>
        </AppCard>
      ))}
      <Link href="/coaches/create" asChild>
        <AppButton label="Create coach" />
      </Link>
      <Link href="/coaches/edit" asChild>
        <AppButton label="Edit coach" variant="secondary" />
      </Link>
    </Screen>
  );
}
