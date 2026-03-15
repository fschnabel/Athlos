import { Link, Redirect, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { colors, spacing } from "@/constants/theme";
import { getAgeLabelFromBirthDate } from "@/features/athletes/categoryResolver";
import { listAthletesByInstitution } from "@/features/athletes/service";
import { StatePanel } from "@/features/institutions/components/StatePanel";
import { useI18n } from "@/i18n";
import { useInstitutionStore } from "@/store/institution-store";
import { Athlete } from "@/types/domain";

export default function AthletesListScreen() {
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAthletes = useCallback(async () => {
    if (!activeInstitution) return;
    try {
      setError(null);
      setLoading(true);
      setAthletes(await listAthletesByInstitution(activeInstitution.id));
    } catch {
      setError("Error");
    } finally {
      setLoading(false);
    }
  }, [activeInstitution]);

  useFocusEffect(
    useCallback(() => {
      void loadAthletes();
    }, [loadAthletes]),
  );

  if (!activeInstitution) return <Redirect href="/institutions/select" />;

  return (
    <View style={styles.container}>
      <Screen contentContainerStyle={styles.content}>
        <AppSectionHeader title={t("athletes.title")} subtitle={t("athletes.subtitle", { institution: activeInstitution.name })} />
        {loading ? <StatePanel title={t("athletes.loadingTitle")} message={t("athletes.loadingMessage")} loading /> : null}
        {!loading && error ? <StatePanel title="Error" message={error} /> : null}
        {!loading && !error && athletes.length === 0 ? <StatePanel title={t("athletes.noAthletesTitle")} message={t("athletes.noAthletesMessage")} /> : null}
        {!loading && !error && athletes.length > 0 ? (
          <View style={styles.list}>
            {athletes.map((athlete) => (
              <AppCard key={athlete.id}>
                <Text style={styles.name}>{athlete.firstName} {athlete.lastName}</Text>
                <Text style={styles.meta}>{t("athletes.age")}: {getAgeLabelFromBirthDate(athlete.birthDate)}</Text>
                <Text style={styles.meta}>{t("athletes.fields.gender")}: {athlete.gender}</Text>
                <Text style={styles.meta}>{t("athletes.fields.birthDate")}: {athlete.birthDate}</Text>
                <Link href={{ pathname: "/athletes/edit", params: { id: athlete.id } }} asChild>
                  <AppButton label={t("athletes.edit")} variant="secondary" />
                </Link>
              </AppCard>
            ))}
          </View>
        ) : null}
      </Screen>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}> 
        <AppButton label={t("athletes.create")} onPress={() => router.push("/athletes/create")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 128 },
  list: { gap: spacing.md },
  name: { color: colors.text, fontSize: 18, fontWeight: "700" },
  meta: { color: colors.textMuted },
  footer: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: 0,
    backgroundColor: colors.background,
    paddingTop: spacing.sm,
    zIndex: 20,
  },
});
