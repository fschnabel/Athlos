import { Link, Redirect, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { colors, spacing } from "@/constants/theme";
import { getEventById } from "@/features/events/service";
import { StatePanel } from "@/features/institutions/components/StatePanel";
import { useI18n } from "@/i18n";
import { useInstitutionStore } from "@/store/institution-store";
import { CompetitionEvent } from "@/types/events";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { t, formatDate } = useI18n();
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);
  const [event, setEvent] = useState<CompetitionEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvent = async () => {
      if (!id || !activeInstitution) {
        setLoading(false);
        return;
      }

      const nextEvent = await getEventById(id);
      if (!nextEvent || nextEvent.institutionId !== activeInstitution.id) {
        setEvent(null);
        setLoading(false);
        return;
      }

      setEvent(nextEvent);
      setLoading(false);
    };

    void loadEvent();
  }, [activeInstitution, id]);

  if (!activeInstitution) {
    return <Redirect href="/institutions/select" />;
  }

  if (!id) {
    return <Redirect href="/(tabs)/events" />;
  }

  if (loading) {
    return (
      <Screen>
        <StatePanel title={t("events.detailLoadingTitle")} message={t("events.detailLoadingMessage")} loading />
      </Screen>
    );
  }

  if (!event) {
    return (
      <Screen>
        <StatePanel title={t("events.detailNotFoundTitle")} message={t("events.detailNotFoundMessage")} />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppSectionHeader title={event.name} subtitle={event.description || t("events.overview")} />

      <AppCard>
        <Text style={styles.line}>{t("events.venueLabel")}: {event.venue}</Text>
        <Text style={styles.line}>{t("events.startsLabel")}: {event.startDate} {event.startTime}</Text>
        <Text style={styles.line}>
          {t("events.durationLabel")}: {event.durationDays} {event.durationDays === 1 ? t("events.daySingular") : t("events.dayPlural")}
        </Text>
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>{t("events.categoriesHeader")}</Text>
        <View style={styles.stack}>
          {event.categories.map((category) => (
            <View key={category.id} style={styles.innerCard}>
              <Text style={styles.cardTitle}>{category.name}</Text>
              <Text style={styles.line}>{t("events.agesRange", { min: category.minAge, max: category.maxAge })}</Text>
              <Text style={styles.line}>{t("events.genderLabel")}: {t(`events.genders.${category.gender}`)}</Text>
              <Text style={styles.line}>{t("events.disciplinesLabel")}: {category.disciplines.join(", ")}</Text>
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>{t("events.invitationsHeader")}</Text>
        <View style={styles.stack}>
          {event.invitations.length > 0 ? (
            event.invitations.map((invitation) => (
              <View key={invitation.id} style={styles.innerCard}>
                <Text style={styles.cardTitle}>{invitation.institutionName ?? invitation.email}</Text>
                <Text style={styles.line}>{invitation.recipientType === "registered_institution" ? t("invitations.registeredInstitution") : t("invitations.emailInvitation")}</Text>
                <Text style={styles.line}>{formatDate(invitation.sentAt)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.line}>{t("events.noInvitationsYet")}</Text>
          )}
        </View>
      </AppCard>

      <Link href={{ pathname: "/invitations/send", params: { id: event.id } }} asChild>
        <AppButton label={t("events.manageInvitations")} />
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  stack: { gap: spacing.sm },
  innerCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    gap: 4,
  },
  cardTitle: { color: colors.text, fontWeight: "700" },
  line: { color: colors.textMuted },
});
