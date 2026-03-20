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

export default function GenerateHeatsScreen() {
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
      <AppSectionHeader title="Mangas" subtitle="Aqui aparece como quedaron asignadas las mangas de los eventos en ejecucion." />

      {loading ? <StatePanel title="Cargando mangas" message="Preparando las asignaciones del evento." loading /> : null}
      {!loading && events.length === 0 ? (
        <StatePanel title="No hay mangas generadas" message="Habilita un evento desde En curso para generar automaticamente sus mangas." />
      ) : null}

      {!loading && events.length > 0 ? (
        <View style={styles.stack}>
          {events.map((event) => (
            <AppCard key={event.id}>
              <Text style={styles.eventTitle}>{event.name}</Text>
              <Text style={styles.eventMeta}>{event.venue} • {event.startDate} {event.startTime}</Text>
              <View style={styles.innerStack}>
                {event.heats.map((heat) => {
                  const assignments = event.heatAssignments.filter((assignment) => assignment.heatId === heat.id);

                  return (
                    <View key={heat.id} style={styles.heatCard}>
                      <Text style={styles.heatTitle}>{heat.name}</Text>
                      <Text style={styles.heatMeta}>{heat.categoryName} • {heat.discipline}</Text>
                      {assignments.map((assignment) => (
                        <Text key={assignment.id} style={styles.assignmentLine}>
                          {assignment.position}. {assignment.athleteName}
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
  eventMeta: { color: colors.textMuted },
  heatCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    gap: 4,
  },
  heatTitle: { color: colors.primary, fontWeight: "800" },
  heatMeta: { color: colors.textMuted, marginBottom: 4 },
  assignmentLine: { color: colors.text },
});
