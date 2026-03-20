import { Redirect, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { colors, spacing } from "@/constants/theme";
import { listEventsByInstitution } from "@/features/events/service";
import { StatePanel } from "@/features/institutions/components/StatePanel";
import { useInstitutionStore } from "@/store/institution-store";
import { CompetitionEvent } from "@/types/events";

export default function HeatAssignmentsScreen() {
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);
  const [events, setEvents] = useState<CompetitionEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    if (!activeInstitution) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const nextEvents = await listEventsByInstitution(activeInstitution.id);
      setEvents(nextEvents.filter((event) => event.status === "in_progress"));
    } finally {
      setLoading(false);
    }
  }, [activeInstitution]);

  useFocusEffect(
    useCallback(() => {
      void loadEvents();
    }, [loadEvents]),
  );

  if (!activeInstitution) {
    return <Redirect href="/institutions/select" />;
  }

  return (
    <Screen>
      <AppSectionHeader title="Resultados y asignaciones" subtitle="Revision rapida de posiciones asignadas por manga para los eventos en ejecucion." />

      {loading ? <StatePanel title="Cargando asignaciones" message="Preparando posiciones y heats generados." loading /> : null}
      {!loading && events.length === 0 ? (
        <StatePanel title="Sin asignaciones" message="Habilita un evento para generar posiciones y ver resultados del momento." />
      ) : null}

      {!loading && events.length > 0 ? (
        <View style={styles.stack}>
          {events.map((event) => (
            <AppCard key={event.id}>
              <Text style={styles.eventTitle}>{event.name}</Text>
              <View style={styles.innerStack}>
                {event.heats.map((heat) => {
                  const assignments = event.heatAssignments.filter((assignment) => assignment.heatId === heat.id);

                  return (
                    <View key={heat.id} style={styles.assignmentCard}>
                      <Text style={styles.heatTitle}>{heat.name}</Text>
                      {assignments.map((assignment) => (
                        <Text key={assignment.id} style={styles.assignmentText}>
                          Puesto {assignment.position}: {assignment.athleteName}
                        </Text>
                      ))}
                    </View>
                  );
                })}
              </View>
            </AppCard>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  innerStack: { gap: spacing.sm },
  eventTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  assignmentCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    gap: 4,
  },
  heatTitle: { color: colors.primary, fontWeight: "800" },
  assignmentText: { color: colors.text },
});
