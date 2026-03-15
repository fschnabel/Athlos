import { Redirect, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { StatusBadge } from "@/components/StatusBadge";
import { colors, spacing } from "@/constants/theme";
import {
  enableAthletesForCompetition,
  listCheckinAthletesForInstitution,
  listCheckinEventsByInstitution,
  listCheckinInstitutionsForEvent,
} from "@/features/checkin/service";
import { StatePanel } from "@/features/institutions/components/StatePanel";
import { useInstitutionStore } from "@/store/institution-store";
import { CheckinStatus } from "@/types/domain";

interface CheckinEventSummary {
  eventId: string;
  eventName: string;
  startDate: string;
  startTime: string;
  venue: string;
  institutionCount: number;
}

interface CheckinInstitutionSummary {
  institutionId: string;
  institutionName: string;
  athleteCount: number;
}

interface CheckinAthleteSummary {
  athleteId: string;
  athleteName: string;
  institutionId: string;
  institutionName: string;
  registrationIds: string[];
  categoryNames: string[];
  disciplines: string[];
  status: CheckinStatus;
}

const getStatusTone = (status: CheckinStatus) => {
  if (status === "present") return "success" as const;
  if (status === "absent" || status === "dq") return "danger" as const;
  return "default" as const;
};

const getStatusLabel = (status: CheckinStatus) => {
  switch (status) {
    case "present":
      return "Habilitado";
    case "assigned":
      return "Parcial";
    case "registered":
      return "Pendiente";
    default:
      return status;
  }
};

export default function CheckinAthletesScreen() {
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<CheckinEventSummary[]>([]);
  const [institutions, setInstitutions] = useState<CheckinInstitutionSummary[]>([]);
  const [athletes, setAthletes] = useState<CheckinAthleteSummary[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string | null>(null);
  const [selectedAthleteIds, setSelectedAthleteIds] = useState<string[]>([]);
  const [institutionModalVisible, setInstitutionModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    if (!activeInstitution) return;

    try {
      setLoading(true);
      setError(null);
      const nextEvents = await listCheckinEventsByInstitution(activeInstitution.id);
      setEvents(nextEvents);
      setSelectedEventId((current) => (current && nextEvents.some((event) => event.eventId === current) ? current : nextEvents[0]?.eventId ?? null));
    } catch {
      setError("No pudimos cargar los eventos para check-in.");
    } finally {
      setLoading(false);
    }
  }, [activeInstitution]);

  useFocusEffect(
    useCallback(() => {
      void loadEvents();
    }, [loadEvents]),
  );

  useEffect(() => {
    const loadInstitutions = async () => {
      if (!selectedEventId) {
        setInstitutions([]);
        setSelectedInstitutionId(null);
        return;
      }

      const nextInstitutions = await listCheckinInstitutionsForEvent(selectedEventId);
      setInstitutions(nextInstitutions);
      setSelectedInstitutionId((current) =>
        current && nextInstitutions.some((institution) => institution.institutionId === current)
          ? current
          : nextInstitutions[0]?.institutionId ?? null,
      );
    };

    void loadInstitutions();
  }, [selectedEventId]);

  useEffect(() => {
    const loadAthletes = async () => {
      if (!selectedEventId || !selectedInstitutionId) {
        setAthletes([]);
        return;
      }

      const nextAthletes = await listCheckinAthletesForInstitution(selectedEventId, selectedInstitutionId);
      setAthletes(nextAthletes);
      setSelectedAthleteIds([]);
    };

    void loadAthletes();
  }, [selectedEventId, selectedInstitutionId]);

  const selectedCount = selectedAthleteIds.length;

  const selectedInstitution = useMemo(
    () => institutions.find((institution) => institution.institutionId === selectedInstitutionId) ?? null,
    [institutions, selectedInstitutionId],
  );

  const toggleAthlete = (athleteId: string) => {
    setSelectedAthleteIds((current) =>
      current.includes(athleteId) ? current.filter((item) => item !== athleteId) : [...current, athleteId],
    );
  };

  const handleEnableSelected = async () => {
    if (!selectedEventId || !selectedInstitutionId || selectedAthleteIds.length === 0) {
      return;
    }

    try {
      setSaving(true);
      const nextAthletes = await enableAthletesForCompetition(selectedEventId, selectedInstitutionId, selectedAthleteIds);
      setAthletes(nextAthletes);
      setSelectedAthleteIds([]);
    } finally {
      setSaving(false);
    }
  };

  if (!activeInstitution) {
    return <Redirect href="/institutions/select" />;
  }

  return (
    <View style={styles.container}>
      <Screen contentContainerStyle={styles.content}>
        <AppSectionHeader
          title="Check-in de atletas"
          subtitle="Selecciona el evento, luego la institucion y habilita a los atletas registrados para competir."
        />

        {loading ? <StatePanel title="Cargando check-in" message="Preparando eventos e inscripciones registradas." loading /> : null}
        {!loading && error ? <StatePanel title="Error" message={error} /> : null}
        {!loading && !error && events.length === 0 ? (
          <StatePanel title="No hay eventos para check-in" message="Crea un evento y registra atletas aceptando invitaciones para abrir el check-in." />
        ) : null}

        {!loading && !error && events.length > 0 ? (
          <View style={styles.stack}>
            <AppCard>
              <Text style={styles.sectionTitle}>Seleccionar evento</Text>
              <View style={styles.chipWrap}>
                {events.map((event) => {
                  const selected = event.eventId === selectedEventId;
                  return (
                    <Pressable key={event.eventId} onPress={() => setSelectedEventId(event.eventId)} style={[styles.chip, selected && styles.chipSelected]}>
                      <Text style={[styles.chipTitle, selected && styles.chipTitleSelected]}>{event.eventName}</Text>
                      <Text style={[styles.chipMeta, selected && styles.chipMetaSelected]}>{event.startDate} {event.startTime}</Text>
                      <Text style={[styles.chipMeta, selected && styles.chipMetaSelected]}>{event.venue}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </AppCard>

            <AppCard>
              <Text style={styles.sectionTitle}>Seleccionar institucion</Text>
              {institutions.length === 0 ? (
                <Text style={styles.emptyText}>Este evento todavia no tiene atletas registrados por institucion.</Text>
              ) : (
                <Pressable style={styles.selectorButton} onPress={() => setInstitutionModalVisible(true)}>
                  <View>
                    <Text style={styles.selectorLabel}>Institucion participante</Text>
                    <Text style={styles.selectorValue}>{selectedInstitution?.institutionName ?? "Selecciona una institucion"}</Text>
                    {selectedInstitution ? <Text style={styles.selectorMeta}>{selectedInstitution.athleteCount} atletas registrados</Text> : null}
                  </View>
                  <Text style={styles.selectorArrow}>Ver</Text>
                </Pressable>
              )}
            </AppCard>

            {selectedInstitution ? (
              <AppSectionHeader title={selectedInstitution.institutionName} subtitle="Lista de atletas registrados para habilitar en competencia" />
            ) : null}

            {selectedInstitutionId && athletes.length === 0 ? (
              <StatePanel title="Sin atletas registrados" message="La institucion seleccionada todavia no tiene atletas listos para check-in." />
            ) : null}

            {athletes.map((athlete) => {
              const selected = selectedAthleteIds.includes(athlete.athleteId);
              const enabled = athlete.status === "present";

              return (
                <Pressable key={athlete.athleteId} onPress={() => toggleAthlete(athlete.athleteId)} style={[styles.athleteCard, selected && styles.athleteCardSelected]}>
                  <View style={styles.checkboxRow}>
                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                      {selected ? <Text style={styles.checkboxMark}>✓</Text> : null}
                    </View>
                    <View style={styles.athleteInfo}>
                      <Text style={styles.athleteName}>{athlete.athleteName}</Text>
                      <Text style={styles.athleteMeta}>Categorias: {athlete.categoryNames.join(", ")}</Text>
                      <Text style={styles.athleteMeta}>Disciplinas: {athlete.disciplines.join(", ")}</Text>
                    </View>
                    <StatusBadge label={getStatusLabel(athlete.status)} tone={getStatusTone(athlete.status)} />
                  </View>
                  <Text style={styles.helperText}>{enabled ? "Ya esta habilitado para competir." : "Selecciona este atleta para habilitarlo en la competencia."}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </Screen>

      {selectedInstitutionId ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}> 
          <AppButton
            label={selectedCount > 0 ? `Habilitar seleccionados (${selectedCount})` : "Habilitar seleccionados"}
            onPress={() => void handleEnableSelected()}
            disabled={selectedCount === 0}
            loading={saving}
          />
        </View>
      ) : null}

      <Modal visible={institutionModalVisible} transparent animationType="slide" onRequestClose={() => setInstitutionModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}> 
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar institucion</Text>
              <Pressable onPress={() => setInstitutionModalVisible(false)}>
                <Text style={styles.modalClose}>Cerrar</Text>
              </Pressable>
            </View>

            <View style={styles.modalList}>
              {institutions.map((institution) => {
                const selected = institution.institutionId === selectedInstitutionId;
                return (
                  <Pressable
                    key={institution.institutionId}
                    onPress={() => {
                      setSelectedInstitutionId(institution.institutionId);
                      setInstitutionModalVisible(false);
                    }}
                    style={[styles.modalItem, selected && styles.modalItemSelected]}
                  >
                    <View style={styles.modalItemInfo}>
                      <Text style={[styles.modalItemTitle, selected && styles.modalItemTitleSelected]}>{institution.institutionName}</Text>
                      <Text style={[styles.modalItemMeta, selected && styles.modalItemMetaSelected]}>{institution.athleteCount} atletas registrados</Text>
                    </View>
                    {selected ? <Text style={styles.modalCheck}>✓</Text> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 132 },
  stack: { gap: spacing.md },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "700", marginBottom: spacing.sm },
  chipWrap: { gap: spacing.sm },
  chip: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: 4,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipTitle: { color: colors.text, fontWeight: "700" },
  chipTitleSelected: { color: colors.white },
  chipMeta: { color: colors.textMuted, fontSize: 12 },
  chipMetaSelected: { color: colors.white },
  emptyText: { color: colors.textMuted },
  selectorButton: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  selectorLabel: { color: colors.textMuted, fontSize: 12, textTransform: "uppercase", fontWeight: "700" },
  selectorValue: { color: colors.text, fontSize: 16, fontWeight: "700" },
  selectorMeta: { color: colors.textMuted, marginTop: 2 },
  selectorArrow: { color: colors.primary, fontWeight: "700" },
  athleteCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  athleteCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  checkboxRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    backgroundColor: colors.surface,
  },
  checkboxSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  checkboxMark: { color: colors.white, fontWeight: "800" },
  athleteInfo: { flex: 1, gap: 4 },
  athleteName: { color: colors.text, fontSize: 16, fontWeight: "700" },
  athleteMeta: { color: colors.textMuted },
  helperText: { color: colors.textMuted, fontSize: 12 },
  footer: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: 0,
    backgroundColor: colors.background,
    paddingTop: spacing.sm,
    zIndex: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(16, 26, 43, 0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    gap: spacing.md,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  modalClose: { color: colors.primary, fontWeight: "700" },
  modalList: { gap: spacing.sm },
  modalItem: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  modalItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceMuted,
  },
  modalItemInfo: { flex: 1, gap: 4 },
  modalItemTitle: { color: colors.text, fontWeight: "700" },
  modalItemTitleSelected: { color: colors.primary },
  modalItemMeta: { color: colors.textMuted, fontSize: 12 },
  modalItemMetaSelected: { color: colors.primary },
  modalCheck: { color: colors.primary, fontWeight: "800", fontSize: 18 },
});
