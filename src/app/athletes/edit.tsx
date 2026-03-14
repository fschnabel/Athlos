import { Href, Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { Screen } from "@/components/Screen";
import { AthleteForm } from "@/features/athletes/components/AthleteForm";
import { getAthleteById, updateAthlete } from "@/features/athletes/service";
import { AthleteFormValues } from "@/features/athletes/validation";
import { StatePanel } from "@/features/institutions/components/StatePanel";
import { useInstitutionStore } from "@/store/institution-store";
import { Athlete } from "@/types/domain";

const scanRoute = "/athletes/scan-id" as Href;

export default function EditAthleteScreen() {
  const router = useRouter();
  const { id, firstName, lastName, birthDate, gender } = useLocalSearchParams<{
    id?: string;
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    gender?: "male" | "female";
  }>();
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadAthlete = async () => {
      if (!id || !activeInstitution) {
        setLoading(false);
        return;
      }

      const nextAthlete = await getAthleteById(id);

      if (!nextAthlete || nextAthlete.institutionId !== activeInstitution.id) {
        setAthlete(null);
        setLoading(false);
        return;
      }

      setAthlete(nextAthlete);
      setLoading(false);
    };

    void loadAthlete();
  }, [activeInstitution, id]);

  if (!activeInstitution) {
    return <Redirect href="/institutions/select" />;
  }

  if (!id) {
    return <Redirect href="/athletes" />;
  }

  if (loading) {
    return (
      <Screen>
        <StatePanel title="Loading athlete" message="Preparing athlete details for editing." loading />
      </Screen>
    );
  }

  if (!athlete) {
    return (
      <Screen>
        <StatePanel title="Athlete not found" message="This athlete does not belong to the active institution or no longer exists." />
      </Screen>
    );
  }

  const defaultValues: AthleteFormValues = {
    firstName: firstName ?? athlete.firstName,
    lastName: lastName ?? athlete.lastName,
    gender: gender === "female" ? "female" : firstName || lastName || birthDate ? "male" : athlete.gender === "female" ? "female" : "male",
    birthDate: birthDate ?? athlete.birthDate,
    emergencyContactName: athlete.emergencyContactName ?? "",
    emergencyContactPhone: athlete.emergencyContactPhone ?? "",
  };

  const handleSubmit = async (values: AthleteFormValues) => {
    setSubmitting(true);

    try {
      await updateAthlete(athlete.id, values);
      router.replace("/athletes");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <AthleteForm
        title="Edit Athlete"
        subtitle={`Update ${athlete.firstName} ${athlete.lastName}. Category will be recalculated automatically from age.`}
        submitLabel="Save changes"
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onScanIdPress={() =>
          router.push({ pathname: scanRoute, params: { returnTo: "/athletes/edit", id } } as never)
        }
        isSubmitting={submitting}
      />
    </Screen>
  );
}
