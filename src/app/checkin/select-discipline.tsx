import { Link } from "expo-router";
import { Text } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { mockEventDisciplines } from "@/features/mockData";

export default function SelectDisciplineScreen() {
  return (
    <Screen>
      <AppSectionHeader title="Select Discipline" subtitle="Choose the event discipline to open check-in for competition day." />
      {mockEventDisciplines.map((discipline) => (
        <AppCard key={discipline.id}>
          <Text>{discipline.name}</Text>
          <Text>{discipline.isOpen ? "Open" : "Closed"}</Text>
        </AppCard>
      ))}
      <Link href="/checkin/athletes" asChild>
        <AppButton label="Open check-in list" />
      </Link>
    </Screen>
  );
}
