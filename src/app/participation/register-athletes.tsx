import { Link, Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { colors, spacing } from "@/constants/theme";
import { getAgeFromBirthDate } from "@/features/athletes/categoryResolver";
import { listAthletesByInstitution } from "@/features/athletes/service";
import { acceptInvitationWithAthletes, getEventById, rejectInvitation } from "@/features/events/service";
import { StatePanel } from "@/features/institutions/components/StatePanel";
import { useI18n } from "@/i18n";
import { useInstitutionStore } from "@/store/institution-store";
import { Athlete } from "@/types/domain";
import { CompetitionEvent, EventInvitation } from "@/types/events";

const selectionKey = (categoryId: string, discipline: string, athleteId: string) => `${categoryId}::${discipline}::${athleteId}`;

export default function RegisterAthletesScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { eventId, invitationId } = useLocalSearchParams<{ eventId?: string; invitationId?: string }>();
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);
  const [event, setEvent] = useState<CompetitionEvent | null>(null);
  const [invitation, setInvitation] = useState<EventInvitation | null>(null);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!eventId || !invitationId || !activeInstitution) {
        setLoading(false);
        return;
      }

      const [nextEvent, nextAthletes] = await Promise.all([getEventById(eventId), listAthletesByInstitution(activeInstitution.id)]);

      if (!nextEvent) {
        setLoading(false);
        return;
      }

      const nextInvitation = nextEvent.invitations.find((item) => item.id === invitationId && item.institutionId === activeInstitution.id) ?? null;
      const existingSelections = nextEvent.registrations
        .filter((registration) => registration.invitationId === invitationId)
        .map((registration) => selectionKey(registration.categoryId, registration.discipline, registration.athleteId));

      setEvent(nextEvent);
      setInvitation(nextInvitation);
      setAthletes(nextAthletes);
      setSelectedKeys(existingSelections);
      setLoading(false);
    };

    void loadData();
  }, [activeInstitution, eventId, invitationId]);

  const groupedSelections = useMemo(() => {
    if (!event) {
      return [];
    }

    return event.categories.map((category) => {
      const eligibleAthletes = athletes.filter((athlete) => {
        const age = getAgeFromBirthDate(athlete.birthDate);
        const matchesAge = age >= category.minAge && age <= category.maxAge;
        const matchesGender = category.gender === "mixed" || athlete.gender === category.gender;
        return matchesAge && matchesGender;
      });

      return {
        category,
        disciplines: category.disciplines.map((discipline) => ({
          discipline,
          athletes: eligibleAthletes,
        })),
      };
    });
  }, [athletes, event]);

  if (!activeInstitution) {
    return <Redirect href="/institutions/select" />;
  }

  if (!eventId || !invitationId) {
    return <Redirect href="/invitations/received" />;
  }

  if (loading) {
    return (
      <Screen>
        <StatePanel title={t("invitations.registerLoadingTitle")} message={t("invitations.registerLoadingMessage")} loading />
      </Screen>
    );
  }

  if (!event || !invitation) {
    return (
      <Screen>
        <StatePanel title={t("invitations.invitationNotFoundTitle")} message={t("invitations.invitationNotFoundMessage")} />
      </Screen>
    );
  }

  const isLocked = event.status === "in_progress" || event.status === "completed";

  const toggleSelection = (categoryId: string, discipline: string, athleteId: string) => {
    if (isLocked) {
      return;
    }

    const key = selectionKey(categoryId, discipline, athleteId);
    setSelectedKeys((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));
  };

  const selectedCount = selectedKeys.length;

  const handleAccept = async () => {
    setSaving(true);
    setErrorMessage(null);
    try {
      const payload = selectedKeys.map((key) => {
        const [categoryId, discipline, athleteId] = key.split("::");
        const athlete = athletes.find((item) => item.id === athleteId);

        return {
          athleteId,
          athleteName: athlete ? `${athlete.firstName} ${athlete.lastName}` : athleteId,
          categoryId,
          discipline,
        };
      });

      const updatedEvent = await acceptInvitationWithAthletes(event.id, invitation.id, activeInstitution.id, payload);
      const updatedInvitation = updatedEvent.invitations.find((item) => item.id === invitation.id) ?? null;
      setEvent(updatedEvent);
      setInvitation(updatedInvitation);
      router.replace("/invitations/received");
    } catch {
      setErrorMessage("El evento ya esta en ejecucion. No se pueden modificar registros de atletas.");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await rejectInvitation(event.id, invitation.id);
      router.replace("/invitations/received");
    } finally {
      setRejecting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Screen contentContainerStyle={styles.content}>
        <AppSectionHeader title={event.name} subtitle={t("invitations.registerSubtitle", { institution: activeInstitution.name })} />

        <AppCard>
          <Text style={styles.eventMeta}>{event.venue}</Text>
          <Text style={styles.eventMeta}>{event.startDate} {event.startTime}</Text>
          <Text style={styles.eventMeta}>{t("invitations.invitationStatus", { status: invitation.status })}</Text>
          <Text style={styles.eventMeta}>{t("invitations.selectedRegistrations", { count: selectedCount })}</Text>
          <Text style={styles.eventMeta}>Estado del evento: {event.status}</Text>
        </AppCard>

        {isLocked ? (
          <StatePanel title="Registro bloqueado" message="Este evento esta en ejecucion, asi que la institucion ya no puede modificar el registro de atletas." />
        ) : null}
        {errorMessage ? <StatePanel title="No fue posible actualizar" message={errorMessage} /> : null}

        <View style={styles.stack}>
          {groupedSelections.map(({ category, disciplines }) => (
            <AppCard key={category.id}>
              <Text style={styles.categoryTitle}>{category.name}</Text>
              <Text style={styles.categoryMeta}>{t("events.agesRange", { min: category.minAge, max: category.maxAge })}</Text>
              <Text style={styles.categoryMeta}>{t("events.genderLabel")}: {t(`events.genders.${category.gender}`)}</Text>

              {disciplines.map(({ discipline, athletes: eligibleAthletes }) => (
                <View key={`${category.id}-${discipline}`} style={styles.disciplineBlock}>
                  <Text style={styles.disciplineTitle}>{discipline}</Text>
                  {eligibleAthletes.length === 0 ? (
                    <Text style={styles.emptyText}>{t("invitations.noEligibleAthletes")}</Text>
                  ) : (
                    <View style={styles.optionList}>
                      {eligibleAthletes.map((athlete) => {
                        const key = selectionKey(category.id, discipline, athlete.id);
                        const checked = selectedKeys.includes(key);

                        return (
                          <Pressable
                            key={key}
                            onPress={() => toggleSelection(category.id, discipline, athlete.id)}
                            disabled={isLocked}
                            style={[styles.optionRow, checked && styles.optionRowChecked, isLocked && styles.optionRowLocked]}
                          >
                            <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                              {checked ? <Text style={styles.checkboxMark}>X</Text> : null}
                            </View>
                            <View style={styles.optionCopy}>
                              <Text style={styles.optionTitle}>{athlete.firstName} {athlete.lastName}</Text>
                              <Text style={styles.optionMeta}>{t("events.genders." + athlete.gender)} • {t("athletes.age")}: {getAgeFromBirthDate(athlete.birthDate)}</Text>
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </View>
              ))}
            </AppCard>
          ))}
        </View>
      </Screen>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
        {!isLocked && invitation.status !== "accepted" ? <AppButton label={t("invitations.reject")} variant="danger" onPress={() => void handleReject()} loading={rejecting} /> : null}
        {!isLocked ? <AppButton label={invitation.status === "accepted" ? t("invitations.updateRegistrations") : t("invitations.accept")} onPress={() => void handleAccept()} loading={saving} /> : null}
        <Link href="/invitations/received" asChild>
          <AppButton label={t("invitations.backToInvitations")} variant="ghost" />
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 160,
  },
  stack: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  eventMeta: {
    color: colors.textMuted,
  },
  categoryTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  categoryMeta: {
    color: colors.textMuted,
  },
  disciplineBlock: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  disciplineTitle: {
    color: colors.primary,
    fontWeight: "700",
  },
  optionList: {
    gap: spacing.sm,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
  },
  optionRowChecked: {
    borderColor: colors.success,
    backgroundColor: "#E3F5EC",
  },
  optionRowLocked: {
    opacity: 0.7,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  checkboxMark: {
    color: colors.white,
    fontWeight: "800",
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    color: colors.text,
    fontWeight: "600",
  },
  optionMeta: {
    color: colors.textMuted,
  },
  emptyText: {
    color: colors.textMuted,
  },
  footer: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: 0,
    gap: spacing.sm,
    backgroundColor: colors.background,
    paddingTop: spacing.sm,
    zIndex: 20,
  },
});
