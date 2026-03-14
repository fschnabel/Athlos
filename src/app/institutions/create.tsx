import { useState } from "react";
import { Href, useRouter } from "expo-router";

import { Screen } from "@/components/Screen";
import { InstitutionForm } from "@/features/institutions/components/InstitutionForm";
import { InstitutionFormValues } from "@/features/institutions/schemas/institutionSchema";
import { institutionService } from "@/features/institutions/services/institutionService";
import { useInstitutionStore } from "@/store/institution-store";

const appHomeRoute = "/(tabs)/dashboard" as Href;

const defaultValues: InstitutionFormValues = {
  name: "",
  type: "school",
  city: "",
  province: "",
  email: "",
  phone: "",
  mainContactName: "",
  logoUrl: "",
};

export default function CreateInstitutionScreen() {
  const router = useRouter();
  const setActiveInstitution = useInstitutionStore((state) => state.setActiveInstitution);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: InstitutionFormValues) => {
    setSubmitting(true);

    try {
      const institution = await institutionService.createInstitution(values);
      await setActiveInstitution(institution);
      router.replace(appHomeRoute);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <InstitutionForm
        title="Create Institution"
        subtitle="Register a school, club, academy, or federation before managing events and athletes."
        submitLabel="Save Institution"
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      />
    </Screen>
  );
}
