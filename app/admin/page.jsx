import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { Users, ShieldAlert, Box, CreditCard } from "lucide-react";

export default async function AdminPage() {
  const { data: profiles = [] } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#F4F7F5] px-6 py-8 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-emerald-100">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
              Back-office
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Admin Droovo
            </h1>
            <p className="mt-2 text-slate-600">
              Suivi des utilisateurs inscrits sur l’application.
            </p>
          </div>

          <Link href="/" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">
            Retour accueil
          </Link>
        </header>

        <section className="mt-6 grid gap-5 md:grid-cols-4">
          <Stat icon={Users} label="Utilisateurs" value={profiles.length} />
          <Stat icon={ShieldAlert} label="À vérifier" value={profiles.filter(p => p.identity_status === "pending").length} />
          <Stat icon={Box} label="Colis actifs" value="0" />
          <Stat icon={CreditCard} label="Commissions" value="0 €" />
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-emerald-100">
          <h2 className="text-2xl font-black text-slate-950">
            Nouveaux utilisateurs
          </h2>

          <div className="mt-5 grid gap-3">
            {profiles.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                Aucun utilisateur pour le moment.
              </p>
            ) : (
              profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"
                >
                  <div>
                    <p className="font-black text-slate-950">
                      {profile.fullname || "Nom non renseigné"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {profile.email}
                    </p>
                  </div>

                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                    {profile.identity_status || "pending"}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-emerald-100">
      <Icon className="text-emerald-700" size={24} />
      <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}
