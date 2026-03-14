import { Link, Redirect, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { colors, spacing } from "@/constants/theme";
import { getAgeLabelFromBirthDate } from "@/features/athletes/categoryResolver";
import { listAthletesByInstitution } from "@/features/athletes/service";
import { StatePanel } from "@/features/institutions/components/StatePanel";
import { useInstitutionStore } from "@/store/institution-store";
import { Athlete } from "@/types/domain";

export default function AthletesListScreen() {
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAthletes = useCallback(async () => {
    if (!activeInstitution) {
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const nextAthletes = await listAthletesByInstitution(activeInstitution.id);
      setAthletes(nextAthletes);
    } catch {
      setError("We could not load athletes for this institution.");
    } finally {
      setLoading(false);
    }
  }, [activeInstitution]);

  useFocusEffect(
    useCallback(() => {
      void loadAthletes();
    }, [loadAthletes]),
  );

  if (!activeInstitution) {
    return <Redirect href="/institutions/select" />;
  }

  return (
    <Screen>
      <AppSectionHeader
        title="Athletes"
        subtitle={`Roster for ${activeInstitution.name}. Each institution keeps its own local athlete list.`}
      />

      {loading ? <StatePanel title="Loading athletes" message="Preparing the roster for the selected institution." loading /> : null}
      {!loading && error ? <StatePanel title="Something went wrong" message={error} /> : null}

      {!loading && !error && athletes.length === 0 ? (
        <StatePanel
          title="No athletes registered"
          message="Add the first athlete for this institution from the button below."
        />
      ) : null}

      {!loading && !error && athletes.length > 0 ? (
        <View style={styles.list}>
          {athletes.map((athlete) => (
            <AppCard key={athlete.id}>
              <Text style={styles.name}>{athlete.firstName} {athlete.lastName}</Text>
              <Text style={styles.meta}>Age: {getAgeLabelFromBirthDate(athlete.birthDate)}</Text>
              <Text style={styles.meta}>Gender: {athlete.gender}</Text>
              <Text style={styles.meta}>Birth date: {athlete.birthDate}</Text>
              <Link href={{ pathname: "/athletes/edit", params: { id: athlete.id } }} asChild>
                <AppButton label="Edit athlete" variant="secondary" />
              </Link>
            </AppCard>
          ))}
        </View>
      ) : null}

      <Link href="/athletes/create" asChild>
        <AppButton label="Create athlete" />
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  meta: {
    color: colors.textMuted,
  },
});
