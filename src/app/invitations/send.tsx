import { Alert, Text } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";

export default function SendInvitationsScreen() {
  return (
    <Screen>
      <AppSectionHeader title="Send Invitations" subtitle="Issue invitations to other institutions for a selected event." />
      <AppCard>
        <Text>Selected event: Inter-Schools Sprint Meet</Text>
        <Text>Recipients: North Peak School, Sprint Club</Text>
        <AppButton label="Send invitations" onPress={() => Alert.alert("Invitations sent")} />
      </AppCard>
    </Screen>
  );
}
