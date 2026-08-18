"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !data.user) {
        router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
        return;
      }

      setAuthorized(true);
    }

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setAuthorized(false);
        router.replace("/login");
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (!authorized) {
    return (
      <main className="min-h-screen bg-[#F4F7F5] px-6 py-10">
        <p className="text-sm text-slate-500">Vérification de la connexion...</p>
      </main>
    );
  }

  return children;
}

