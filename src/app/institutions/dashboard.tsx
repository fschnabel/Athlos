import { Href, Redirect, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { colors, spacing } from "@/constants/theme";
import { InstitutionCard } from "@/features/institutions/components/InstitutionCard";
import { useInstitutionStore } from "@/store/institution-store";

const selectRoute = "/institutions/select" as Href;
const profileRoute = "/institutions/profile" as Href;
const editRoute = "/institutions/edit" as Href;

export default function InstitutionDashboardScreen() {
  const router = useRouter();
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);

  if (!activeInstitution) {
    return <Redirect href={selectRoute} />;
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Active Institution</Text>
        <AppSectionHeader
          title={activeInstitution.name}
          subtitle={`${activeInstitution.city}, ${activeInstitution.province} • ${activeInstitution.type}`}
        />
      </View>

      <InstitutionCard institution={activeInstitution} />

      <AppCard>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.actions}>
          <AppButton label="View Profile" onPress={() => router.push(profileRoute)} />
          <AppButton label="Edit Institution" variant="secondary" onPress={() => router.push(editRoute)} />
          <AppButton label="Switch Institution" variant="ghost" onPress={() => router.replace(selectRoute)} />
        </View>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  hero: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
  },
  kicker: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  actions: {
    gap: spacing.sm,
  },
});
