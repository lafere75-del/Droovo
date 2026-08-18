"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile?.role === "admin") {
        router.replace("/admin");
        return;
      }

      if (pathname !== "/dashboard/paiements") {
        const { data: paymentSettings } = await supabase
          .from("payment_settings")
          .select("stripe_payment_method_id,card_consent_at")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (!paymentSettings?.stripe_payment_method_id || !paymentSettings?.card_consent_at) {
          router.replace("/dashboard/paiements?setup=required");
          return;
        }
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

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-emerald-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <Link href="/" className="text-xl font-black tracking-tight text-slate-950">
            Droovo
          </Link>
          <div className="flex items-center gap-2">
            {pathname !== "/dashboard" && (
              <Link
                href="/dashboard"
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-200"
              >
                ← Mon espace
              </Link>
            )}
            <Link
              href="/"
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-black text-white hover:bg-emerald-700"
            >
              Accueil
            </Link>
          </div>
        </div>
      </nav>
      {children}
    </>
  );
}
