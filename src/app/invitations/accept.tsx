import { Alert } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";

export default function AcceptInvitationScreen() {
  return (
    <Screen>
      <AppSectionHeader title="Accept Invitation" subtitle="Confirm participation so your institution can register athletes." />
      <AppButton label="Confirm acceptance" onPress={() => Alert.alert("Invitation accepted")} />
    </Screen>
  );
}
