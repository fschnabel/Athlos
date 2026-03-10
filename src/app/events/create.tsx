import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { AppTextField } from "@/components/AppTextField";
import { Screen } from "@/components/Screen";
import { EventFormValues, eventSchema } from "@/features/events/validation";

export default function CreateEventScreen() {
  const { control, handleSubmit } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      venue: "",
      eventDate: "2026-05-20",
      registrationDeadline: "2026-05-10",
      description: "",
    },
  });

  return (
    <Screen>
      <AppSectionHeader title="Create Event" subtitle="Set the event schedule, venue, and registration deadline." />
      <AppCard>
        <AppTextField control={control} name="name" label="Event name" />
        <AppTextField control={control} name="venue" label="Venue" />
        <AppTextField control={control} name="eventDate" label="Event date" placeholder="YYYY-MM-DD" />
        <AppTextField control={control} name="registrationDeadline" label="Registration deadline" placeholder="YYYY-MM-DD" />
        <AppTextField control={control} name="description" label="Description" />
        <AppButton label="Save event" onPress={handleSubmit((values) => Alert.alert("Event created", JSON.stringify(values, null, 2)))} />
      </AppCard>
    </Screen>
  );
}
