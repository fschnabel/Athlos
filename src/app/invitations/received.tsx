import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { StatusBadge } from "@/components/StatusBadge";
import { colors, spacing } from "@/constants/theme";
import { listReceivedInvitationsByInstitution } from "@/features/events/service";
import { StatePanel } from "@/features/institutions/components/StatePanel";
import { useI18n } from "@/i18n";
import { useInstitutionStore } from "@/store/institution-store";
import { CompetitionEvent, EventInvitation } from "@/types/events";

export default function ReceivedInvitationsScreen() {
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);
  const { t } = useI18n();
  const [received, setReceived] = useState<Array<{ event: CompetitionEvent; invitation: EventInvitation }>>([]);
  const [loading, setLoading] = useState(true);

  const loadReceived = useCallback(async () => {
    if (!activeInstitution) {
      return;
    }

    setLoading(true);
    try {
      setReceived(await listReceivedInvitationsByInstitution(activeInstitution.id));
    } finally {
      setLoading(false);
    }
  }, [activeInstitution]);

  useFocusEffect(
    useCallback(() => {
      void loadReceived();
    }, [loadReceived]),
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
      <AppSectionHeader title={t("invitations.receivedInvitations")} subtitle={t("invitations.reviewSubtitle")} />

      {loading ? <StatePanel title={t("invitations.loadingTitle")} message={t("invitations.preparingInstitutionInvitations")} loading /> : null}

      {!loading && received.length === 0 ? (
        <StatePanel title={t("invitations.noInvitationsTitle")} message={t("invitations.receivedEmpty")} />
      ) : null}

      {!loading && received.length > 0 ? (
        <View style={styles.list}>
          {received.map(({ event, invitation }) => {
            const registrations = event.registrations.filter((registration) => registration.invitationId === invitation.id);

            return (
              <AppCard key={invitation.id}>
                <Text style={styles.title}>{event.name}</Text>
                <Text style={styles.meta}>{event.venue} • {event.startDate} {event.startTime}</Text>
                <Text style={styles.meta}>{t("invitations.invitedInstitution", { name: activeInstitution.name })}</Text>
                <Text style={styles.meta}>{t("invitations.registeredAthletes", { count: registrations.length })}</Text>
                <View style={styles.actions}>
                  <StatusBadge label={invitation.status} tone={invitation.status === "accepted" ? "success" : "default"} />
                  <Link href={{ pathname: "/participation/register-athletes", params: { eventId: event.id, invitationId: invitation.id } }} asChild>
                    <AppButton label={invitation.status === "accepted" ? t("invitations.reviewRegistration") : t("invitations.openInvitation")} variant="secondary" />
                  </Link>
                </View>
              </AppCard>
            );
          })}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  meta: {
    color: colors.textMuted,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
});
