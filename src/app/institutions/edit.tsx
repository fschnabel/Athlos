import { useState } from "react";
import { Href, Redirect, useRouter } from "expo-router";

import { Screen } from "@/components/Screen";
import { InstitutionForm } from "@/features/institutions/components/InstitutionForm";
import { InstitutionFormValues } from "@/features/institutions/schemas/institutionSchema";
import { institutionService } from "@/features/institutions/services/institutionService";
import { useInstitutionStore } from "@/store/institution-store";

const selectRoute = "/institutions/select" as Href;
const profileRoute = "/institutions/profile" as Href;

export default function EditInstitutionScreen() {
  const router = useRouter();
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);
  const setActiveInstitution = useInstitutionStore((state) => state.setActiveInstitution);
  const [submitting, setSubmitting] = useState(false);

  if (!activeInstitution) {
    return <Redirect href={selectRoute} />;
  }

  const defaultValues: InstitutionFormValues = {
    name: activeInstitution.name,
    type: activeInstitution.type,
    city: activeInstitution.city,
    province: activeInstitution.province,
    email: activeInstitution.email,
    phone: activeInstitution.phone,
    mainContactName: activeInstitution.mainContactName,
    logoUrl: activeInstitution.logoUrl ?? "",
  };

  const handleSubmit = async (values: InstitutionFormValues) => {
    setSubmitting(true);

    try {
      const institution = await institutionService.updateInstitution(activeInstitution.id, values);
      await setActiveInstitution(institution);
      router.replace(profileRoute);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <InstitutionForm
        title="Edit Institution"
        subtitle="Update the profile that will be shared across future athlete, coach, and event modules."
        submitLabel="Save Changes"
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      />
    </Screen>
  );
}
