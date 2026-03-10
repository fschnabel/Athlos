import { Link } from "expo-router";
import { Text } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { mockAthletes, mockCategories } from "@/features/mockData";

export default function AthletesListScreen() {
  return (
    <Screen>
      <AppSectionHeader title="Athletes" subtitle="Build your institution roster and assign each athlete to an age category." />
      {mockAthletes.map((athlete) => (
        <AppCard key={athlete.id}>
          <Text>{athlete.firstName} {athlete.lastName}</Text>
          <Text>{mockCategories.find((category) => category.id === athlete.categoryId)?.name}</Text>
          <Text>{athlete.birthDate}</Text>
        </AppCard>
      ))}
      <Link href="/athletes/create" asChild>
        <AppButton label="Create athlete" />
      </Link>
      <Link href="/athletes/edit" asChild>
        <AppButton label="Edit athlete" variant="secondary" />
      </Link>
    </Screen>
  );
}
