import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { AuthSession, Institution, User } from "@/types/domain";

interface AuthState extends AuthSession {
  hydrated: boolean;
  setSession: (user: User | null, institution: Institution | null) => void;
  clearSession: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      institution: null,
      hydrated: false,
      setSession: (user, institution) => set({ user, institution }),
      clearSession: () => set({ user: null, institution: null }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "athlos-auth",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);
