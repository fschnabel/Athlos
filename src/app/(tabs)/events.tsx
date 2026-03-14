import { Link, Redirect, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { colors, spacing } from "@/constants/theme";
import { listEventsByInstitution } from "@/features/events/service";
import { StatePanel } from "@/features/institutions/components/StatePanel";
import { useInstitutionStore } from "@/store/institution-store";
import { CompetitionEvent } from "@/types/events";

export default function EventsTabScreen() {
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);
  const [events, setEvents] = useState<CompetitionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    if (!activeInstitution) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setEvents(await listEventsByInstitution(activeInstitution.id));
    } catch {
      setError("We could not load events for this institution.");
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
      <AppSectionHeader title="My Events" subtitle={`Events created by ${activeInstitution.name}.`} />

      {loading ? <StatePanel title="Loading events" message="Preparing your competition calendar." loading /> : null}
      {!loading && error ? <StatePanel title="Something went wrong" message={error} /> : null}
      {!loading && !error && events.length === 0 ? <StatePanel title="No events yet" message="Create your first event with categories, disciplines, and invitations." /> : null}

      {!loading && !error && events.length > 0 ? (
        <View style={styles.list}>
          {events.map((event) => (
            <AppCard key={event.id}>
              <Text style={styles.title}>{event.name}</Text>
              <Text style={styles.meta}>{event.venue}</Text>
              <Text style={styles.meta}>{event.startDate} at {event.startTime}</Text>
              <Text style={styles.meta}>{event.durationDays} day(s) • {event.categories.length} categories</Text>
              <Link href={{ pathname: "/events/detail", params: { id: event.id } }} asChild>
                <AppButton label="Open event" variant="secondary" />
              </Link>
            </AppCard>
          ))}
        </View>
      ) : null}

      <Link href="/events/create" asChild>
        <AppButton label="Create event" />
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  title: { color: colors.text, fontSize: 18, fontWeight: "700" },
  meta: { color: colors.textMuted },
});
