import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { AppTextField } from "@/components/AppTextField";
import { Screen } from "@/components/Screen";
import { colors, spacing } from "@/constants/theme";
import { buildEmailInvitation, getEventById, updateEvent } from "@/features/events/service";
import { InvitationEmailFormValues, invitationEmailSchema } from "@/features/events/validation";
import { StatePanel } from "@/features/institutions/components/StatePanel";
import { institutionService } from "@/features/institutions/services/institutionService";
import { useI18n } from "@/i18n";
import { useInstitutionStore } from "@/store/institution-store";
import { CompetitionEvent, CreateEventInvitationInput } from "@/types/events";
import { Institution } from "@/types/institutions";

export default function SendInvitationsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { t, formatDate } = useI18n();
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);
  const [event, setEvent] = useState<CompetitionEvent | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const emailForm = useForm<InvitationEmailFormValues>({
    resolver: zodResolver(invitationEmailSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    const load = async () => {
      if (!id || !activeInstitution) {
        setLoading(false);
        return;
      }

      const [nextEvent, allInstitutions] = await Promise.all([
        getEventById(id),
        institutionService.getInstitutions(),
      ]);

      if (!nextEvent || nextEvent.institutionId !== activeInstitution.id) {
        setEvent(null);
        setLoading(false);
        return;
      }

      setEvent(nextEvent);
      setInstitutions(allInstitutions.filter((institution) => institution.id !== activeInstitution.id));
      setLoading(false);
    };

    void load();
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
        <StatePanel title={t("invitations.loadingTitle")} message={t("invitations.loadingMessage")} loading />
      </Screen>
    );
  }

  if (!event) {
    return (
      <Screen>
        <StatePanel title={t("events.detailNotFoundTitle")} message={t("invitations.eventNotFound")} />
      </Screen>
    );
  }

  const persistInvitations = async (nextInvitations: CreateEventInvitationInput[]) => {
    setSaving(true);
    try {
      const updatedEvent = await updateEvent(event.id, { invitations: nextInvitations });
      setEvent(updatedEvent);
    } finally {
      setSaving(false);
    }
  };

  const baseInvitations: CreateEventInvitationInput[] = event.invitations.map((invitation) => ({
    recipientType: invitation.recipientType,
    institutionId: invitation.institutionId,
    institutionName: invitation.institutionName,
    email: invitation.email,
  }));

  const handleAddInstitution = async (institution: Institution) => {
    if (baseInvitations.some((item) => item.recipientType === "registered_institution" && item.institutionId === institution.id)) {
      return;
    }

    await persistInvitations([
      ...baseInvitations,
      {
        recipientType: "registered_institution",
        institutionId: institution.id,
        institutionName: institution.name,
      },
    ]);
  };

  const handleAddEmail = emailForm.handleSubmit(async (values) => {
    if (baseInvitations.some((item) => item.recipientType === "email" && item.email?.toLowerCase() === values.email.toLowerCase())) {
      return;
    }

    await persistInvitations([...baseInvitations, buildEmailInvitation(values.email)]);
    emailForm.reset({ email: "" });
  });

  return (
    <Screen>
      <AppSectionHeader title={t("invitations.manageTitle")} subtitle={`${t("events.eventLabel")}: ${event.name}`} />

      <AppCard>
        <Text style={styles.sectionTitle}>{t("invitations.registeredInstitutions")}</Text>
        <View style={styles.chipWrap}>
          {institutions.map((institution) => (
            <Pressable key={institution.id} onPress={() => void handleAddInstitution(institution)} style={styles.chip}>
              <Text style={styles.chipText}>{institution.name}</Text>
            </Pressable>
          ))}
        </View>
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>{t("events.inviteEmail")}</Text>
        <AppTextField control={emailForm.control} name="email" label={t("invitations.institutionEmail")} placeholder="sports@institution.org" autoCapitalize="none" keyboardType="email-address" />
        <AppButton label={t("events.addEmailInvitation")} variant="secondary" onPress={() => void handleAddEmail()} loading={saving} />
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>{t("events.currentInvitations")}</Text>
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
            <Text style={styles.line}>{t("invitations.noInvitationsYet")}</Text>
          )}
        </View>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  chipText: { color: colors.text, fontWeight: "600" },
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
