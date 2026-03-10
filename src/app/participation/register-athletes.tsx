import { Alert, Text } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { mockAthletes } from "@/features/mockData";

export default function RegisterAthletesScreen() {
  return (
    <Screen>
      <AppSectionHeader title="Register Athletes" subtitle="Register existing athletes or add new ones during event participation." />
      {mockAthletes.map((athlete) => (
        <AppCard key={athlete.id}>
          <Text>{athlete.firstName} {athlete.lastName}</Text>
          <Text>Eligible category: {athlete.categoryId}</Text>
        </AppCard>
      ))}
      <AppButton label="Submit registrations" onPress={() => Alert.alert("Athletes registered")} />
    </Screen>
  );
}
