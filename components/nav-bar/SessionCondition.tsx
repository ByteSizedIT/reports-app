"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/utils/supabase/clients/browserClient";
import { Session } from "@supabase/supabase-js";

import WithSession from "./WithSession";
import WithoutSession from "./WithoutSession";

export const SessionCondition = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setIsLoading(false);
    }
    fetchSession();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return session ? <WithSession session={session} /> : <WithoutSession />;
};

export default SessionCondition;
