import { Href, Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { Screen } from "@/components/Screen";
import { EventBuilderForm } from "@/features/events/components/EventBuilderForm";
import { createEvent } from "@/features/events/service";
import { institutionService } from "@/features/institutions/services/institutionService";
import { useInstitutionStore } from "@/store/institution-store";
import { Institution } from "@/types/institutions";

const detailRoute = "/events/detail" as Href;

export default function CreateEventScreen() {
  const router = useRouter();
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadInstitutions = async () => {
      if (!activeInstitution) {
        return;
      }

      const allInstitutions = await institutionService.getInstitutions();
      setInstitutions(allInstitutions.filter((institution) => institution.id !== activeInstitution.id));
    };

    void loadInstitutions();
  }, [activeInstitution]);

  if (!activeInstitution) {
    return <Redirect href="/institutions/select" />;
  }

  const handleSubmit = async (payload: Parameters<typeof EventBuilderForm>[0]["onSubmit"] extends (arg: infer T) => Promise<void> ? T : never) => {
    setSubmitting(true);

    try {
      const event = await createEvent(activeInstitution.id, {
        ...payload.event,
        categories: payload.categories,
        invitations: payload.invitations,
      });

      router.replace({ pathname: detailRoute, params: { id: event.id } } as never);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <EventBuilderForm institutions={institutions} onSubmit={handleSubmit} isSubmitting={submitting} />
    </Screen>
  );
}
