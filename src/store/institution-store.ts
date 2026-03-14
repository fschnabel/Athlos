import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { institutionService } from "@/features/institutions/services/institutionService";
import { Institution } from "@/types/institutions";

const ACTIVE_INSTITUTION_STORAGE_KEY = "athlos.activeInstitutionId";

interface InstitutionStore {
  activeInstitutionId: string | null;
  activeInstitution: Institution | null;
  isBootstrapping: boolean;
  hasBootstrapped: boolean;
  bootstrap: () => Promise<void>;
  setActiveInstitution: (institution: Institution) => Promise<void>;
  clearActiveInstitution: () => Promise<void>;
  refreshActiveInstitution: () => Promise<void>;
}

export const useInstitutionStore = create<InstitutionStore>((set, get) => ({
  activeInstitutionId: null,
  activeInstitution: null,
  isBootstrapping: false,
  hasBootstrapped: false,
  bootstrap: async () => {
    if (get().isBootstrapping || get().hasBootstrapped) {
      return;
    }

    set({ isBootstrapping: true });

    try {
      const activeInstitutionId = await AsyncStorage.getItem(ACTIVE_INSTITUTION_STORAGE_KEY);

      if (!activeInstitutionId) {
        set({
          activeInstitutionId: null,
          activeInstitution: null,
          isBootstrapping: false,
          hasBootstrapped: true,
        });
        return;
      }

      const institution = await institutionService.getInstitutionById(activeInstitutionId);

      if (!institution) {
        await AsyncStorage.removeItem(ACTIVE_INSTITUTION_STORAGE_KEY);
        set({
          activeInstitutionId: null,
          activeInstitution: null,
          isBootstrapping: false,
          hasBootstrapped: true,
        });
        return;
      }

      set({
        activeInstitutionId: institution.id,
        activeInstitution: institution,
        isBootstrapping: false,
        hasBootstrapped: true,
      });
    } catch {
      set({
        activeInstitutionId: null,
        activeInstitution: null,
        isBootstrapping: false,
        hasBootstrapped: true,
      });
    }
  },
  setActiveInstitution: async (institution) => {
    await AsyncStorage.setItem(ACTIVE_INSTITUTION_STORAGE_KEY, institution.id);
    set({
      activeInstitutionId: institution.id,
      activeInstitution: institution,
    });
  },
  clearActiveInstitution: async () => {
    await AsyncStorage.removeItem(ACTIVE_INSTITUTION_STORAGE_KEY);
    set({
      activeInstitutionId: null,
      activeInstitution: null,
    });
  },
  refreshActiveInstitution: async () => {
    const { activeInstitutionId } = get();

    if (!activeInstitutionId) {
      return;
    }

    const institution = await institutionService.getInstitutionById(activeInstitutionId);

    if (!institution) {
      await get().clearActiveInstitution();
      return;
    }

    set({ activeInstitution: institution });
  },
}));
