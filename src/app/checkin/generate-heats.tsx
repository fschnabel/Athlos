import { Link } from "expo-router";
import { Text } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { mockCheckins, mockEventDisciplines } from "@/features/mockData";
import { generateHeatsOrGroups } from "@/utils/heatGeneration";

export default function GenerateHeatsScreen() {
  const result = generateHeatsOrGroups("event-1", "ed-1", mockEventDisciplines[0], mockCheckins);

  return (
    <Screen>
      <AppSectionHeader title="Generate Heats" subtitle="Balanced heat generation follows the MVP rule to avoid undersized final heats." />
      {result.heatsOrGroups.map((heat) => (
        <AppCard key={heat.id}>
          <Text>{heat.name}</Text>
          <Text>{result.assignments.filter((assignment) => assignment.heatOrGroupId === heat.id).length} athletes assigned</Text>
        </AppCard>
      ))}
      <Link href="/checkin/assignments" asChild>
        <AppButton label="View heat assignments" />
      </Link>
    </Screen>
  );
}
