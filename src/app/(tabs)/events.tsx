import { Ionicons } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { Screen } from "@/components/Screen";
import { StatusBadge } from "@/components/StatusBadge";
import { colors, spacing } from "@/constants/theme";
import { listEventsByInstitution, listReceivedInvitationsByInstitution } from "@/features/events/service";
import { StatePanel } from "@/features/institutions/components/StatePanel";
import { useI18n } from "@/i18n";
import { useInstitutionStore } from "@/store/institution-store";
import { CompetitionEvent, EventInvitation } from "@/types/events";

const copy = {
  es: {
    greeting: "Panel principal",
    title: "Eventos",
    subtitleWithInstitution: "Crea, invita y administra las competencias de {{institution}}.",
    subtitleWithoutInstitution: "Organiza eventos, revisa invitaciones y prepara tus jornadas desde un solo lugar.",
    selectInstitution: "Seleccionar institucion",
    configureInstitution: "Configura tu institucion en Opciones para empezar a crear y recibir eventos.",
    createEvent: "Crear evento",
    reviewInvitations: "Aceptar invitacion",
    sentInvitations: "Invitaciones",
    registeredAthletes: "Registros",
    emptyTitle: "Todavia no hay eventos",
    emptyMessage: "Crea el primer evento de tu calendario y gestiona las invitaciones desde aqui.",
    loadingSummary: "Preparando tu centro de eventos.",
    pendingInvitation: "Tienes {{count}} invitacion(es) por revisar.",
    sentSummary: "{{count}} invitaciones enviadas en tus eventos.",
    openEvent: "Abrir evento",
    noInstitutionCta: "Ir a opciones",
    quickCreate: "Nuevo evento",
    quickInvitations: "Ver invitaciones",
    alertTitle: "Invitaciones pendientes",
    categories: "categorias",
    institutions: "instituciones",
    calendar: "calendario",
    noInvitations: "Sin invitaciones pendientes",
  },
  en: {
    greeting: "Main hub",
    title: "Events",
    subtitleWithInstitution: "Create, invite, and manage competitions for {{institution}}.",
    subtitleWithoutInstitution: "Organize events, review invitations, and prepare meet day from one place.",
    selectInstitution: "Select institution",
    configureInstitution: "Set your institution in Settings before creating or receiving events.",
    createEvent: "Create event",
    reviewInvitations: "Accept invitation",
    sentInvitations: "Invitations",
    registeredAthletes: "Entries",
    emptyTitle: "No events yet",
    emptyMessage: "Create the first event on your calendar and manage invitations here.",
    loadingSummary: "Preparing your event hub.",
    pendingInvitation: "You have {{count}} invitation(s) to review.",
    sentSummary: "{{count}} invitations sent across your events.",
    openEvent: "Open event",
    noInstitutionCta: "Go to settings",
    quickCreate: "New event",
    quickInvitations: "View invitations",
    alertTitle: "Pending invitations",
    categories: "categories",
    institutions: "institutions",
    calendar: "calendar",
    noInvitations: "No pending invitations",
  },
  de: {
    greeting: "Hauptbereich",
    title: "Events",
    subtitleWithInstitution: "Erstelle, lade ein und verwalte Wettbewerbe fur {{institution}}.",
    subtitleWithoutInstitution: "Organisiere Events, prufe Einladungen und bereite den Wettkampftag an einem Ort vor.",
    selectInstitution: "Institution auswahlen",
    configureInstitution: "Lege deine Institution zuerst in den Optionen fest.",
    createEvent: "Event erstellen",
    reviewInvitations: "Einladung annehmen",
    sentInvitations: "Einladungen",
    registeredAthletes: "Meldungen",
    emptyTitle: "Noch keine Events",
    emptyMessage: "Erstelle das erste Event in deinem Kalender und verwalte Einladungen hier.",
    loadingSummary: "Dein Event-Bereich wird vorbereitet.",
    pendingInvitation: "Du hast {{count}} Einladung(en) zu prufen.",
    sentSummary: "{{count}} Einladungen in deinen Events gesendet.",
    openEvent: "Event offnen",
    noInstitutionCta: "Zu Optionen",
    quickCreate: "Neues Event",
    quickInvitations: "Einladungen",
    alertTitle: "Offene Einladungen",
    categories: "Kategorien",
    institutions: "Institutionen",
    calendar: "Kalender",
    noInvitations: "Keine offenen Einladungen",
  },
} as const;

const interpolate = (template: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce((current, [key, value]) => current.replace(`{{${key}}}`, String(value)), template);

const formatEventDate = (event: CompetitionEvent) => `${event.startDate} ${event.startTime}`;

export default function EventsTabScreen() {
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);
  const { language } = useI18n();
  const text = copy[language];
  const [events, setEvents] = useState<CompetitionEvent[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<Array<{ event: CompetitionEvent; invitation: EventInvitation }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!activeInstitution) {
      setEvents([]);
      setReceivedInvitations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [nextEvents, nextInvitations] = await Promise.all([
        listEventsByInstitution(activeInstitution.id),
        listReceivedInvitationsByInstitution(activeInstitution.id),
      ]);
      setEvents(nextEvents);
      setReceivedInvitations(nextInvitations);
    } catch {
      setError("error");
    } finally {
      setLoading(false);
    }
  }, [activeInstitution]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const sentInvitationsCount = useMemo(
    () => events.reduce((total, event) => total + event.invitations.length, 0),
    [events],
  );
  const registrationsCount = useMemo(
    () => events.reduce((total, event) => total + event.registrations.length, 0),
    [events],
  );
  const pendingCount = receivedInvitations.filter(({ invitation }) => invitation.status !== "accepted").length;

  return (
    <Screen contentContainerStyle={styles.screenContent}>
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroKicker}>{text.greeting}</Text>
            <Text style={styles.heroTitle}>{text.title}</Text>
            <Text style={styles.heroSubtitle}>
              {activeInstitution
                ? interpolate(text.subtitleWithInstitution, { institution: activeInstitution.name })
                : text.subtitleWithoutInstitution}
            </Text>
          </View>
          <View style={styles.heroBadge}>
            <Ionicons name="notifications-outline" size={20} color={colors.primary} />
            <Text style={styles.heroBadgeText}>{pendingCount}</Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{events.length}</Text>
            <Text style={styles.metricLabel}>{text.calendar}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{sentInvitationsCount}</Text>
            <Text style={styles.metricLabel}>{text.sentInvitations}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{registrationsCount}</Text>
            <Text style={styles.metricLabel}>{text.registeredAthletes}</Text>
          </View>
        </View>
      </View>

      {!activeInstitution ? (
        <AppCard>
          <Text style={styles.cardTitle}>{text.selectInstitution}</Text>
          <Text style={styles.cardSubtitle}>{text.configureInstitution}</Text>
          <Link href="./settings" asChild>
            <AppButton label={text.noInstitutionCta} />
          </Link>
        </AppCard>
      ) : null}

      {activeInstitution ? (
        <AppCard>
          <View style={styles.alertHeader}>
            <View>
              <Text style={styles.cardTitle}>{text.alertTitle}</Text>
              <Text style={styles.cardSubtitle}>
                {pendingCount > 0
                  ? interpolate(text.pendingInvitation, { count: pendingCount })
                  : text.noInvitations}
              </Text>
            </View>
            <StatusBadge label={String(receivedInvitations.length)} tone={pendingCount > 0 ? "success" : "default"} />
          </View>
          <View style={styles.actionRow}>
            <Link href="/events/create" asChild>
              <AppButton label={text.quickCreate} />
            </Link>
            <Link href="/invitations/received" asChild>
              <AppButton label={text.quickInvitations} variant="secondary" />
            </Link>
          </View>
        </AppCard>
      ) : null}

      {loading ? <StatePanel title={text.title} message={text.loadingSummary} loading /> : null}
      {!loading && error ? <StatePanel title="Error" message="We could not load event data right now." /> : null}
      {!loading && !error && activeInstitution && events.length === 0 ? (
        <StatePanel title={text.emptyTitle} message={text.emptyMessage} />
      ) : null}

      {!loading && !error && events.length > 0 ? (
        <View style={styles.stack}>
          {events.map((event) => {
            const participantInstitutions = new Set(event.registrations.map((registration) => registration.institutionId)).size;

            return (
              <Pressable key={event.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <View style={styles.eventCopy}>
                    <Text style={styles.eventTitle}>{event.name}</Text>
                    <Text style={styles.eventMeta}>{event.venue}</Text>
                    <Text style={styles.eventMeta}>{formatEventDate(event)}</Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>{event.status}</Text>
                  </View>
                </View>

                <View style={styles.eventMetricsRow}>
                  <View style={styles.eventMetricTile}>
                    <Text style={styles.eventMetricValue}>{event.categories.length}</Text>
                    <Text style={styles.eventMetricLabel}>{text.categories}</Text>
                  </View>
                  <View style={styles.eventMetricTile}>
                    <Text style={styles.eventMetricValue}>{participantInstitutions}</Text>
                    <Text style={styles.eventMetricLabel}>{text.institutions}</Text>
                  </View>
                  <View style={styles.eventMetricTile}>
                    <Text style={styles.eventMetricValue}>{event.registrations.length}</Text>
                    <Text style={styles.eventMetricLabel}>{text.registeredAthletes}</Text>
                  </View>
                </View>

                <View style={styles.eventFooter}>
                  <Text style={styles.sentSummary}>{interpolate(text.sentSummary, { count: event.invitations.length })}</Text>
                  <Link href={{ pathname: "/events/detail", params: { id: event.id } }} asChild>
                    <AppButton label={text.openEvent} variant="secondary" />
                  </Link>
                </View>
              </Pressable>
            );
          })}
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
    gap: spacing.md,
    borderRadius: 30,
    backgroundColor: "#D9D4FF",
    padding: spacing.lg,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  heroKicker: {
    color: colors.primarySoft,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroTitle: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: "800",
  },
  heroSubtitle: {
    color: colors.primarySoft,
    lineHeight: 20,
  },
  heroBadge: {
    minWidth: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  heroBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  metricRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.55)",
    padding: spacing.md,
    gap: 4,
  },
  metricValue: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "800",
  },
  metricLabel: {
    color: colors.primarySoft,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  cardSubtitle: {
    color: colors.textMuted,
    lineHeight: 20,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  stack: {
    gap: spacing.md,
  },
  eventCard: {
    gap: spacing.md,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    shadowColor: colors.primary,
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  eventCopy: {
    flex: 1,
    gap: 4,
  },
  eventTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  eventMeta: {
    color: colors.textMuted,
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
  eventMetricsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  eventMetricTile: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    gap: 4,
  },
  eventMetricValue: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "800",
  },
  eventMetricLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  eventFooter: {
    gap: spacing.sm,
  },
  sentSummary: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
