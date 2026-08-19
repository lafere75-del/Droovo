"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CircleUserRound, House, LayoutList } from "lucide-react";
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
        .select("role,identity_status")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile?.role === "admin") {
        router.replace("/admin");
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

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-emerald-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <Link href="/dashboard" className="text-xl font-black tracking-tight text-slate-950">
            Droovo
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-200"
            >
              Site Droovo
            </Link>
          </div>
        </div>
      </nav>
      <div className="pb-24 md:pb-20">{children}</div>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-emerald-100 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mx-auto grid max-w-lg grid-cols-3 gap-1">
          <DashboardNavLink href="/dashboard" label="Accueil" icon={House} active={pathname === "/dashboard"} />
          <DashboardNavLink
            href="/dashboard/activite"
            label="Activité"
            icon={LayoutList}
            active={pathname === "/dashboard/activite" || pathname.startsWith("/dashboard/mes-colis") || pathname.startsWith("/dashboard/mes-trajets") || pathname.startsWith("/dashboard/suivi") || pathname === "/dashboard/demandes"}
          />
          <DashboardNavLink
            href="/dashboard/profil"
            label="Mon espace"
            icon={CircleUserRound}
            active={pathname === "/dashboard/profil" || pathname === "/dashboard/paiements" || pathname === "/dashboard/verification"}
          />
        </div>
      </nav>
    </>
  );
}

function DashboardNavLink({ href, label, icon: Icon, active }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-black transition ${active ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>
      <Icon size={20} />
      {label}
    </Link>
  );
}
