import { useEffect } from "react";
import { Href, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { colors, spacing } from "@/constants/theme";
import { useInstitutionBootstrap } from "@/features/institutions/hooks/useInstitutionBootstrap";
import { useI18n } from "@/i18n";

const appHomeRoute = "/(tabs)/events" as Href;

export default function IndexRoute() {
  const router = useRouter();
  const { hasBootstrapped, isBootstrapping } = useInstitutionBootstrap();
  const { t } = useI18n();

  useEffect(() => {
    if (!hasBootstrapped || isBootstrapping) {
      return;
    }

    router.replace(appHomeRoute);
  }, [hasBootstrapped, isBootstrapping, router]);

  return (
    <Screen scrollable={false} contentContainerStyle={styles.container}>
      <View style={styles.panel}>
        <Text style={styles.kicker}>Athlos</Text>
        <Text style={styles.title}>{t("common.loading")}</Text>
        <Text style={styles.subtitle}>Loading workspace...</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  panel: {
    gap: spacing.md,
    borderRadius: 28,
    backgroundColor: colors.primary,
    padding: spacing.xl,
  },
  kicker: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  title: {
    color: colors.white,
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: "#D7E3F7",
    lineHeight: 22,
  },
});
