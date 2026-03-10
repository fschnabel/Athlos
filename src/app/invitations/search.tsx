import { Link } from "expo-router";
import { Text } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";

const institutions = [
  { id: "inst-2", name: "North Peak School", city: "Cuenca" },
  { id: "inst-3", name: "Sprint Club", city: "Guayaquil" },
];

export default function SearchInstitutionsScreen() {
  return (
    <Screen>
      <AppSectionHeader title="Search Institutions" subtitle="Select institutions to invite to your event." />
      {institutions.map((institution) => (
        <AppCard key={institution.id}>
          <Text>{institution.name}</Text>
          <Text>{institution.city}</Text>
        </AppCard>
      ))}
      <Link href="/invitations/send" asChild>
        <AppButton label="Continue to send invitations" />
      </Link>
    </Screen>
  );
}
