import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { AppTextField } from "@/components/AppTextField";
import { DEFAULT_DISCIPLINES } from "@/constants/disciplines";
import { colors, spacing } from "@/constants/theme";
import {
  EventCategoryFormValues,
  eventCategorySchema,
  EventFormValues,
  eventSchema,
  InvitationEmailFormValues,
  invitationEmailSchema,
} from "@/features/events/validation";
import { CreateEventCategoryInput, CreateEventInvitationInput } from "@/types/events";
import { Institution } from "@/types/institutions";

interface EventBuilderFormProps {
  institutions: Institution[];
  onSubmit: (data: {
    event: EventFormValues;
    categories: CreateEventCategoryInput[];
    invitations: CreateEventInvitationInput[];
  }) => Promise<void>;
  isSubmitting?: boolean;
}

const DISCIPLINE_OPTIONS = DEFAULT_DISCIPLINES.map((discipline) => discipline.name);

const parseDateString = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

const parseTimeString = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
};

const formatDate = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTime = (value: Date) => {
  const hours = `${value.getHours()}`.padStart(2, "0");
  const minutes = `${value.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
};

const formatDisplayDate = (value: string) => parseDateString(value).toLocaleDateString();
const formatDisplayTime = (value: string) => formatTime(parseTimeString(value));

export const EventBuilderForm = ({ institutions, onSubmit, isSubmitting = false }: EventBuilderFormProps) => {
  const eventForm = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      venue: "",
      startDate: "2026-06-12",
      startTime: "08:00",
      durationDays: 1,
      description: "",
    },
  });

  const categoryForm = useForm<EventCategoryFormValues>({
    resolver: zodResolver(eventCategorySchema),
    defaultValues: {
      name: "",
      minAge: 10,
      maxAge: 12,
      disciplines: [],
    },
  });

  const emailForm = useForm<InvitationEmailFormValues>({
    resolver: zodResolver(invitationEmailSchema),
    defaultValues: { email: "" },
  });

  const [categories, setCategories] = useState<CreateEventCategoryInput[]>([]);
  const [invitations, setInvitations] = useState<CreateEventInvitationInput[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDisciplineModal, setShowDisciplineModal] = useState(false);

  const startDate = eventForm.watch("startDate");
  const startTime = eventForm.watch("startTime");
  const selectedDisciplines = categoryForm.watch("disciplines");

  const toggleDiscipline = (disciplineName: string) => {
    const current = categoryForm.getValues("disciplines");
    const next = current.includes(disciplineName)
      ? current.filter((item) => item !== disciplineName)
      : [...current, disciplineName];

    categoryForm.setValue("disciplines", next, { shouldValidate: true });
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }

    if (event.type === "set" && selectedDate) {
      eventForm.setValue("startDate", formatDate(selectedDate), { shouldValidate: true });
    }
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS !== "ios") {
      setShowTimePicker(false);
    }

    if (event.type === "set" && selectedDate) {
      eventForm.setValue("startTime", formatTime(selectedDate), { shouldValidate: true });
    }
  };

  const handleAddCategory = categoryForm.handleSubmit((values) => {
    const nextCategory: CreateEventCategoryInput = {
      name: values.name,
      minAge: values.minAge,
      maxAge: values.maxAge,
      disciplines: values.disciplines,
    };

    setCategories((current) => [...current, nextCategory]);
    categoryForm.reset({ name: "", minAge: 10, maxAge: 12, disciplines: [] });
  });

  const handleAddInstitutionInvitation = (institution: Institution) => {
    setInvitations((current) => {
      if (current.some((item) => item.recipientType === "registered_institution" && item.institutionId === institution.id)) {
        return current;
      }

      return [
        ...current,
        {
          recipientType: "registered_institution",
          institutionId: institution.id,
          institutionName: institution.name,
        },
      ];
    });
  };

  const handleAddEmailInvitation = emailForm.handleSubmit((values) => {
    setInvitations((current) => {
      if (current.some((item) => item.recipientType === "email" && item.email?.toLowerCase() === values.email.toLowerCase())) {
        return current;
      }

      return [...current, { recipientType: "email", email: values.email }];
    });
    emailForm.reset({ email: "" });
  });

  const removeCategory = (index: number) => setCategories((current) => current.filter((_, currentIndex) => currentIndex !== index));
  const removeInvitation = (index: number) => setInvitations((current) => current.filter((_, currentIndex) => currentIndex !== index));

  const handleSave = eventForm.handleSubmit(async (values) => {
    if (categories.length === 0) {
      categoryForm.setError("name", { message: "Add at least one category before saving the event." });
      return;
    }

    await onSubmit({ event: values, categories, invitations });
  });

  return (
    <View style={styles.container}>
      <AppSectionHeader
        title="Create Event"
        subtitle="Define schedule, duration, categories, disciplines, and invitations for the competition."
      />

      <AppCard>
        <AppTextField control={eventForm.control} name="name" label="Event name" placeholder="Guayaquil Athletics Cup" />
        <AppTextField control={eventForm.control} name="venue" label="Venue" placeholder="Olympic Stadium" />

        <View style={styles.field}>
          <Text style={styles.label}>Start date</Text>
          <Pressable onPress={() => setShowDatePicker(true)} style={styles.pickerButton}>
            <Text style={styles.pickerValue}>{formatDisplayDate(startDate)}</Text>
            <Text style={styles.pickerHint}>Tap to choose date</Text>
          </Pressable>
          {eventForm.formState.errors.startDate ? <Text style={styles.error}>{eventForm.formState.errors.startDate.message}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Start time</Text>
          <Pressable onPress={() => setShowTimePicker(true)} style={styles.pickerButton}>
            <Text style={styles.pickerValue}>{formatDisplayTime(startTime)}</Text>
            <Text style={styles.pickerHint}>Tap to choose time</Text>
          </Pressable>
          {eventForm.formState.errors.startTime ? <Text style={styles.error}>{eventForm.formState.errors.startTime.message}</Text> : null}
        </View>

        {showDatePicker ? (
          <DateTimePicker value={parseDateString(startDate)} mode="date" display="default" onChange={handleDateChange} />
        ) : null}

        {showTimePicker ? (
          <DateTimePicker value={parseTimeString(startTime)} mode="time" display="default" onChange={handleTimeChange} />
        ) : null}

        <AppTextField control={eventForm.control} name="durationDays" label="Duration in days" placeholder="2" keyboardType="number-pad" autoCapitalize="none" />
        <AppTextField control={eventForm.control} name="description" label="Description" placeholder="Competition summary" />
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>Categories and ages</Text>
        <AppTextField control={categoryForm.control} name="name" label="Category name" placeholder="Under 12" />
        <AppTextField control={categoryForm.control} name="minAge" label="Minimum age" placeholder="10" keyboardType="number-pad" autoCapitalize="none" />
        <AppTextField control={categoryForm.control} name="maxAge" label="Maximum age" placeholder="12" keyboardType="number-pad" autoCapitalize="none" />

        <View style={styles.field}>
          <Text style={styles.label}>Disciplines</Text>
          <Pressable onPress={() => setShowDisciplineModal(true)} style={styles.pickerButton}>
            <Text style={styles.pickerValue}>
              {selectedDisciplines.length > 0 ? `${selectedDisciplines.length} selected` : "Select disciplines"}
            </Text>
            <Text style={styles.pickerHint}>
              {selectedDisciplines.length > 0 ? selectedDisciplines.join(", ") : "Open modal to choose disciplines with checks"}
            </Text>
          </Pressable>
          {categoryForm.formState.errors.disciplines ? <Text style={styles.error}>{categoryForm.formState.errors.disciplines.message}</Text> : null}
        </View>

        <AppButton label="Add category" variant="secondary" onPress={() => void handleAddCategory()} />

        {categories.length > 0 ? (
          <View style={styles.stack}>
            {categories.map((category, index) => (
              <View key={`${category.name}-${index}`} style={styles.itemCard}>
                <Text style={styles.itemTitle}>{category.name}</Text>
                <Text style={styles.itemMeta}>Ages {category.minAge} to {category.maxAge}</Text>
                <Text style={styles.itemMeta}>{category.disciplines.join(", ")}</Text>
                <AppButton label="Remove" variant="ghost" onPress={() => removeCategory(index)} />
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>Add at least one category with its age range and disciplines.</Text>
        )}
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>Invite registered institutions</Text>
        <View style={styles.chipWrap}>
          {institutions.map((institution) => {
            const isSelected = invitations.some(
              (item) => item.recipientType === "registered_institution" && item.institutionId === institution.id,
            );

            return (
              <Pressable
                key={institution.id}
                onPress={() => handleAddInstitutionInvitation(institution)}
                style={[styles.chip, isSelected && styles.chipSelected]}
                disabled={isSelected}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {isSelected ? `? ${institution.name}` : institution.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>Invite by email</Text>
        <AppTextField control={emailForm.control} name="email" label="Institution email" placeholder="sports@institution.org" autoCapitalize="none" keyboardType="email-address" />
        <AppButton label="Add email invitation" variant="secondary" onPress={() => void handleAddEmailInvitation()} />

        {invitations.length > 0 ? (
          <View style={styles.stack}>
            {invitations.map((invitation, index) => (
              <View key={`${invitation.recipientType}-${invitation.institutionId ?? invitation.email ?? index}`} style={styles.itemCard}>
                <Text style={styles.itemTitle}>{invitation.institutionName ?? invitation.email}</Text>
                <Text style={styles.itemMeta}>{invitation.recipientType === "registered_institution" ? "Registered institution" : "Email invitation"}</Text>
                <AppButton label="Remove" variant="ghost" onPress={() => removeInvitation(index)} />
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No invitations added yet.</Text>
        )}
      </AppCard>

      <AppButton label="Save event" onPress={() => void handleSave()} loading={isSubmitting} />

      <Modal visible={showDisciplineModal} animationType="slide" transparent onRequestClose={() => setShowDisciplineModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select disciplines</Text>
            <Text style={styles.modalSubtitle}>Choose the disciplines that belong to this category.</Text>
            <ScrollView contentContainerStyle={styles.modalList}>
              {DISCIPLINE_OPTIONS.map((disciplineName) => {
                const selected = selectedDisciplines.includes(disciplineName);

                return (
                  <Pressable key={disciplineName} onPress={() => toggleDiscipline(disciplineName)} style={[styles.disciplineRow, selected && styles.disciplineRowSelected]}>
                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                      {selected ? <Text style={styles.checkboxMark}>?</Text> : null}
                    </View>
                    <Text style={[styles.disciplineText, selected && styles.disciplineTextSelected]}>{disciplineName}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <AppButton label="Done" onPress={() => setShowDisciplineModal(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  field: { gap: 8 },
  label: { color: colors.text, fontWeight: "600" },
  pickerButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: 4,
  },
  pickerValue: { color: colors.text, fontSize: 16, fontWeight: "700" },
  pickerHint: { color: colors.textMuted, fontSize: 12 },
  error: { color: colors.danger, fontSize: 12 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  stack: { gap: spacing.sm },
  itemCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 6,
    backgroundColor: colors.surfaceMuted,
  },
  itemTitle: { color: colors.text, fontWeight: "700" },
  itemMeta: { color: colors.textMuted },
  emptyText: { color: colors.textMuted },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  chipSelected: {
    borderColor: colors.success,
    backgroundColor: "#E3F5EC",
  },
  chipText: { color: colors.text, fontWeight: "600" },
  chipTextSelected: { color: colors.success },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    gap: spacing.md,
    maxHeight: "75%",
  },
  modalTitle: { color: colors.text, fontSize: 22, fontWeight: "800" },
  modalSubtitle: { color: colors.textMuted },
  modalList: { gap: spacing.sm, paddingBottom: spacing.sm },
  disciplineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  disciplineRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceMuted,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxMark: {
    color: colors.white,
    fontWeight: "800",
  },
  disciplineText: {
    color: colors.text,
    fontWeight: "600",
    flex: 1,
  },
  disciplineTextSelected: {
    color: colors.primary,
  },
});
