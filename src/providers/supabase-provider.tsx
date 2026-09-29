"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type SupabaseContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
};

const SupabaseContext = createContext<SupabaseContextValue | undefined>(
  undefined
);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SupabaseContext.Provider
      value={{ session, user: session?.user ?? null, isLoading }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}

function useSupabaseContext() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error(
      "useSession/useUser must be used within a <SupabaseProvider>"
    );
  }
  return context;
}

export function useSession() {
  const { session, isLoading } = useSupabaseContext();
  return { session, isLoading };
}

export function useUser() {
  const { user, isLoading } = useSupabaseContext();
  return { user, isLoading };
}
