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
import { useI18n } from "@/i18n";
import { useInstitutionStore } from "@/store/institution-store";
import { CompetitionEvent } from "@/types/events";

export default function EventsTabScreen() {
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);
  const { t } = useI18n();
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
      setError(t("common.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  }, [activeInstitution, t]);

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
      <AppSectionHeader title={t("events.title")} subtitle={t("events.subtitle", { institution: activeInstitution.name })} />

      {loading ? <StatePanel title={t("events.loadingTitle")} message={t("events.loadingMessage")} loading /> : null}
      {!loading && error ? <StatePanel title={t("common.somethingWentWrong")} message={error} /> : null}
      {!loading && !error && events.length === 0 ? <StatePanel title={t("events.noEventsTitle")} message={t("events.noEventsMessage")} /> : null}

      {!loading && !error && events.length > 0 ? (
        <View style={styles.list}>
          {events.map((event) => (
            <AppCard key={event.id}>
              <Text style={styles.title}>{event.name}</Text>
              <Text style={styles.meta}>{event.venue}</Text>
              <Text style={styles.meta}>{event.startDate} {event.startTime}</Text>
              <Text style={styles.meta}>
                {event.durationDays} {event.durationDays === 1 ? t("events.daySingular") : t("events.dayPlural")} • {event.categories.length} {t("events.categoriesHeader").toLowerCase()}
              </Text>
              <Link href={{ pathname: "/events/detail", params: { id: event.id } }} asChild>
                <AppButton label={t("events.open")} variant="secondary" />
              </Link>
            </AppCard>
          ))}
        </View>
      ) : null}

      <Link href="/events/create" asChild>
        <AppButton label={t("events.create")} />
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  title: { color: colors.text, fontSize: 18, fontWeight: "700" },
  meta: { color: colors.textMuted },
});
