import { Href, Redirect, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { colors, spacing } from "@/constants/theme";
import { InstitutionDetailsCard } from "@/features/institutions/components/InstitutionDetailsCard";
import { useInstitutionStore } from "@/store/institution-store";

const selectRoute = "/institutions/select" as Href;
const dashboardRoute = "/institutions/dashboard" as Href;
const editRoute = "/institutions/edit" as Href;

export default function InstitutionProfileScreen() {
  const router = useRouter();
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);

  if (!activeInstitution) {
    return <Redirect href={selectRoute} />;
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Institution Profile</Text>
        <AppSectionHeader
          title={activeInstitution.name}
          subtitle="Review the profile information currently powering this MVP workspace."
        />
      </View>
      <InstitutionDetailsCard institution={activeInstitution} />
      <AppButton label="Edit Institution" onPress={() => router.push(editRoute)} />
      <AppButton label="Back to Dashboard" variant="ghost" onPress={() => router.replace(dashboardRoute)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  kicker: {
    color: colors.info,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
});
