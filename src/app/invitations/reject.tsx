import { Alert } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";

export default function RejectInvitationScreen() {
  return (
    <Screen>
      <AppSectionHeader title="Reject Invitation" subtitle="Decline this invitation if your institution will not participate." />
      <AppButton label="Confirm rejection" variant="danger" onPress={() => Alert.alert("Invitation rejected")} />
    </Screen>
  );
}
