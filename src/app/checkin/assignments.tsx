import { Text } from "react-native";

import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { mockCheckins, mockEventDisciplines } from "@/features/mockData";
import { generateHeatsOrGroups } from "@/utils/heatGeneration";

export default function HeatAssignmentsScreen() {
  const result = generateHeatsOrGroups("event-1", "ed-1", mockEventDisciplines[0], mockCheckins);

  return (
    <Screen>
      <AppSectionHeader title="Heat Assignments" subtitle="Review generated lanes or participation order and edit manually if needed." />
      {result.assignments.map((assignment) => (
        <AppCard key={assignment.id}>
          <Text>Registration: {assignment.registrationId}</Text>
          <Text>{assignment.assignmentType === "lane" ? "Lane" : "Order"} {assignment.position}</Text>
        </AppCard>
      ))}
    </Screen>
  );
}
