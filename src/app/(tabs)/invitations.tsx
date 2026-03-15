import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { StatusBadge } from "@/components/StatusBadge";
import { colors, spacing } from "@/constants/theme";
import { listEventsByInstitution, listReceivedInvitationsByInstitution } from "@/features/events/service";
import { StatePanel } from "@/features/institutions/components/StatePanel";
import { useI18n } from "@/i18n";
import { useInstitutionStore } from "@/store/institution-store";
import { CompetitionEvent, EventInvitation } from "@/types/events";

export default function InvitationsTabScreen() {
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);
  const { t } = useI18n();
  const [sentEvents, setSentEvents] = useState<CompetitionEvent[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<Array<{ event: CompetitionEvent; invitation: EventInvitation }>>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!activeInstitution) {
      return;
    }

    setLoading(true);
    try {
      const [events, received] = await Promise.all([
        listEventsByInstitution(activeInstitution.id),
        listReceivedInvitationsByInstitution(activeInstitution.id),
      ]);
      setSentEvents(events);
      setReceivedInvitations(received);
    } finally {
      setLoading(false);
    }
  }, [activeInstitution]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  if (!activeInstitution) {
    return (
      <Screen>
        <StatePanel title={t("invitations.selectInstitutionTitle")} message={t("invitations.selectInstitutionMessage")} />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppSectionHeader title={t("tabs.invitations")} subtitle={t("invitations.subtitle")} />

      {loading ? <StatePanel title={t("invitations.loadingTitle")} message={t("invitations.preparingActivity")} loading /> : null}

      {!loading ? (
        <>
          <AppCard>
            <Text style={styles.sectionTitle}>{t("invitations.sentTitle")}</Text>
            {sentEvents.length === 0 ? (
              <Text style={styles.muted}>{t("invitations.sentEmpty")}</Text>
            ) : (
              <View style={styles.stack}>
                {sentEvents.flatMap((event) =>
                  event.invitations.map((invitation) => (
                    <View key={invitation.id} style={styles.itemRow}>
                      <View style={styles.itemCopy}>
                        <Text style={styles.itemTitle}>{invitation.institutionName ?? invitation.email}</Text>
                        <Text style={styles.itemMeta}>{event.name}</Text>
                      </View>
                      <StatusBadge label={invitation.status} tone={invitation.status === "accepted" ? "success" : "default"} />
                    </View>
                  )),
                )}
              </View>
            )}
          </AppCard>

          <AppCard>
            <Text style={styles.sectionTitle}>{t("invitations.receivedTitle")}</Text>
            {receivedInvitations.length === 0 ? (
              <Text style={styles.muted}>{t("invitations.receivedEmpty")}</Text>
            ) : (
              <View style={styles.stack}>
                {receivedInvitations.map(({ event, invitation }) => {
                  const registrationCount = event.registrations.filter((registration) => registration.invitationId === invitation.id).length;

                  return (
                    <View key={invitation.id} style={styles.receivedCard}>
                      <Text style={styles.itemTitle}>{event.name}</Text>
                      <Text style={styles.itemMeta}>{event.venue} • {event.startDate}</Text>
                      <Text style={styles.itemMeta}>{t("invitations.fromLabel")} {invitation.institutionName ?? t("invitations.registeredInstitution")}</Text>
                      <Text style={styles.itemMeta}>{t("invitations.registeredAthletes", { count: registrationCount })}</Text>
                      <View style={styles.actions}>
                        <StatusBadge label={invitation.status} tone={invitation.status === "accepted" ? "success" : "default"} />
                        <Link href={{ pathname: "/participation/register-athletes", params: { eventId: event.id, invitationId: invitation.id } }} asChild>
                          <AppButton label={invitation.status === "accepted" ? t("invitations.reviewRegistration") : t("invitations.openInvitation")} variant="secondary" />
                        </Link>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </AppCard>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  stack: {
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
  },
  itemCopy: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    color: colors.text,
    fontWeight: "700",
  },
  itemMeta: {
    color: colors.textMuted,
  },
  receivedCard: {
    gap: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    justifyContent: "space-between",
  },
  muted: {
    color: colors.textMuted,
  },
});
