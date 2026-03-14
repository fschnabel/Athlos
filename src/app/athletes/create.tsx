import { Href, Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

import { Screen } from "@/components/Screen";
import { AthleteForm } from "@/features/athletes/components/AthleteForm";
import { createAthlete } from "@/features/athletes/service";
import { AthleteFormValues } from "@/features/athletes/validation";
import { useInstitutionStore } from "@/store/institution-store";

const scanRoute = "/athletes/scan-id" as Href;

export default function CreateAthleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    gender?: "male" | "female";
  }>();
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);
  const [submitting, setSubmitting] = useState(false);

  if (!activeInstitution) {
    return <Redirect href="/institutions/select" />;
  }

  const defaultValues: AthleteFormValues = {
    firstName: params.firstName ?? "",
    lastName: params.lastName ?? "",
    gender: params.gender === "female" ? "female" : "male",
    birthDate: params.birthDate ?? "2013-01-01",
    emergencyContactName: "",
    emergencyContactPhone: "",
  };

  const handleSubmit = async (values: AthleteFormValues) => {
    setSubmitting(true);

    try {
      await createAthlete(activeInstitution.id, values);
      router.replace("/athletes");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <AthleteForm
        title="Create Athlete"
        subtitle={`Add a new athlete to ${activeInstitution.name}. Category will be assigned automatically from age.`}
        submitLabel="Save athlete"
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onScanIdPress={() =>
          router.push({ pathname: scanRoute, params: { returnTo: "/athletes/create" } } as never)
        }
        isSubmitting={submitting}
      />
    </Screen>
  );
}
