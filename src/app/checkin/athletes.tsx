import { Text } from "react-native";

import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { StatusBadge } from "@/components/StatusBadge";
import { mockCheckins } from "@/features/mockData";

export default function CheckinAthletesScreen() {
  return (
    <Screen>
      <AppSectionHeader title="Check-in Athletes" subtitle="Mark each registered athlete as present, absent, assigned, or finished." />
      {mockCheckins.map((checkin) => (
        <AppCard key={checkin.id}>
          <Text>Registration: {checkin.registrationId}</Text>
          <StatusBadge label={checkin.status} tone={checkin.status === "present" ? "success" : "default"} />
        </AppCard>
      ))}
    </Screen>
  );
}
