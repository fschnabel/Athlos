import { Ionicons } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { Screen } from "@/components/Screen";
import { colors, spacing } from "@/constants/theme";
import { listCheckinEventsByInstitution } from "@/features/checkin/service";
import { startEvent } from "@/features/events/service";
import { StatePanel } from "@/features/institutions/components/StatePanel";
import { useI18n } from "@/i18n";
import { useInstitutionStore } from "@/store/institution-store";
import { CompetitionEvent } from "@/types/events";

const copy = {
  es: {
    title: "Eventos en curso",
    subtitleWithInstitution: "Controla check-in, resultados y mangas activas para {{institution}}.",
    subtitleWithoutInstitution: "Este espacio concentra la operacion del dia del evento.",
    selectInstitution: "Necesitas una institucion activa para operar check-in y resultados.",
    openSettings: "Ir a opciones",
    loading: "Preparando los eventos activos.",
    noEventsTitle: "Sin eventos listos",
    noEventsMessage: "Cuando tengas eventos con registros apareceran aqui para operar check-in y mangas.",
    quickActions: "Acciones del momento",
    checkin: "Check-in",
    results: "Resultados",
    heats: "Mangas",
    openCheckin: "Abrir control",
    enableEvent: "Habilitar evento",
    enabling: "Habilitando...",
    institutions: "instituciones",
    statusPublished: "Publicado",
    statusInProgress: "En ejecucion",
    statusCompleted: "Completado",
  },
  en: {
    title: "Live events",
    subtitleWithInstitution: "Control check-in, results, and active heats for {{institution}}.",
    subtitleWithoutInstitution: "This area brings meet-day operations together.",
    selectInstitution: "You need an active institution to operate check-in and results.",
    openSettings: "Go to settings",
    loading: "Preparing active events.",
    noEventsTitle: "No events ready",
    noEventsMessage: "Events with registrations will appear here for check-in and heats.",
    quickActions: "Live actions",
    checkin: "Check-in",
    results: "Results",
    heats: "Heats",
    openCheckin: "Open control",
    enableEvent: "Enable event",
    enabling: "Enabling...",
    institutions: "institutions",
    statusPublished: "Published",
    statusInProgress: "In progress",
    statusCompleted: "Completed",
  },
  de: {
    title: "Laufende Events",
    subtitleWithInstitution: "Steuere Check-in, Ergebnisse und aktive Laufe fur {{institution}}.",
    subtitleWithoutInstitution: "Hier liegt die Wettkampforganisation des Tages.",
    selectInstitution: "Fur Check-in und Ergebnisse ist eine aktive Institution erforderlich.",
    openSettings: "Zu Optionen",
    loading: "Aktive Events werden vorbereitet.",
    noEventsTitle: "Keine aktiven Events",
    noEventsMessage: "Events mit Meldungen erscheinen hier fur Check-in und Laufe.",
    quickActions: "Aktuelle Aktionen",
    checkin: "Check-in",
    results: "Ergebnisse",
    heats: "Laufe",
    openCheckin: "Steuerung offnen",
    enableEvent: "Event aktivieren",
    enabling: "Aktiviere...",
    institutions: "Institutionen",
    statusPublished: "Veroffentlicht",
    statusInProgress: "In Bearbeitung",
    statusCompleted: "Abgeschlossen",
  },
} as const;

const interpolate = (template: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce((current, [key, value]) => current.replace(`{{${key}}}`, String(value)), template);

const getStatusLabel = (status: CompetitionEvent["status"], text: { statusPublished: string; statusInProgress: string; statusCompleted: string }) => {
  if (status === "in_progress") return text.statusInProgress;
  if (status === "completed") return text.statusCompleted;
  return text.statusPublished;
};

export default function CheckinTabScreen() {
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);
  const { language } = useI18n();
  const text = copy[language];
  const [events, setEvents] = useState<Array<{ eventId: string; eventName: string; startDate: string; startTime: string; venue: string; institutionCount: number; status: CompetitionEvent["status"] }>>([]);
  const [loading, setLoading] = useState(true);
  const [enablingEventId, setEnablingEventId] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    if (!activeInstitution) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      setEvents(await listCheckinEventsByInstitution(activeInstitution.id));
    } finally {
      setLoading(false);
    }
  }, [activeInstitution]);

  useFocusEffect(
    useCallback(() => {
      void loadEvents();
    }, [loadEvents]),
  );

  const handleEnableEvent = async (eventId: string) => {
    setEnablingEventId(eventId);
    try {
      await startEvent(eventId);
      await loadEvents();
    } finally {
      setEnablingEventId(null);
    }
  };

  return (
    <Screen contentContainerStyle={styles.screenContent}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{text.title}</Text>
        <Text style={styles.heroSubtitle}>
          {activeInstitution
            ? interpolate(text.subtitleWithInstitution, { institution: activeInstitution.name })
            : text.subtitleWithoutInstitution}
        </Text>
      </View>

      {!activeInstitution ? (
        <AppCard>
          <Text style={styles.sectionTitle}>{text.selectInstitution}</Text>
          <Link href="./settings" asChild>
            <AppButton label={text.openSettings} />
          </Link>
        </AppCard>
      ) : null}

      <AppCard>
        <Text style={styles.sectionTitle}>{text.quickActions}</Text>
        <View style={styles.metricRow}>
          <Link href="/checkin/athletes" asChild>
            <Pressable style={styles.quickTile}>
              <Ionicons name="checkmark-done-outline" size={22} color={colors.primary} />
              <Text style={styles.quickTitle}>{text.checkin}</Text>
            </Pressable>
          </Link>
          <Link href="/checkin/assignments" asChild>
            <Pressable style={styles.quickTile}>
              <Ionicons name="podium-outline" size={22} color={colors.primary} />
              <Text style={styles.quickTitle}>{text.results}</Text>
            </Pressable>
          </Link>
          <Link href="/checkin/generate-heats" asChild>
            <Pressable style={styles.quickTile}>
              <Ionicons name="stats-chart-outline" size={22} color={colors.primary} />
              <Text style={styles.quickTitle}>{text.heats}</Text>
            </Pressable>
          </Link>
        </View>
      </AppCard>

      {loading ? <StatePanel title={text.title} message={text.loading} loading /> : null}
      {!loading && activeInstitution && events.length === 0 ? (
        <StatePanel title={text.noEventsTitle} message={text.noEventsMessage} />
      ) : null}

      {!loading && events.length > 0 ? (
        <View style={styles.stack}>
          {events.map((event) => (
            <AppCard key={event.eventId}>
              <View style={styles.cardHeader}>
                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>{event.eventName}</Text>
                  <Text style={styles.cardSubtitle}>{event.venue}</Text>
                  <Text style={styles.cardSubtitle}>{event.startDate} {event.startTime}</Text>
                </View>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>{getStatusLabel(event.status, text)}</Text>
                </View>
              </View>
              <Text style={styles.infoText}>{event.institutionCount} {text.institutions}</Text>
              <View style={styles.actionStack}>
                <Link href={{ pathname: "/checkin/athletes", params: { eventId: event.eventId } }} asChild>
                  <AppButton label={text.openCheckin} variant="secondary" />
                </Link>
                {event.status !== "in_progress" ? (
                  <AppButton
                    label={enablingEventId === event.eventId ? text.enabling : text.enableEvent}
                    onPress={() => void handleEnableEvent(event.eventId)}
                    loading={enablingEventId === event.eventId}
                  />
                ) : null}
              </View>
            </AppCard>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  hero: {
    gap: 8,
    borderRadius: 30,
    backgroundColor: "#E7EFFC",
    padding: spacing.lg,
  },
  heroTitle: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "800",
  },
  heroSubtitle: {
    color: colors.primarySoft,
    lineHeight: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  metricRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  quickTile: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    alignItems: "center",
    gap: 8,
  },
  quickTitle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  stack: {
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  cardCopy: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  cardSubtitle: {
    color: colors.textMuted,
  },
  infoText: {
    color: colors.textMuted,
    fontWeight: "700",
  },
  statusPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: colors.accentMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusPillText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  actionStack: {
    gap: spacing.sm,
  },
});
