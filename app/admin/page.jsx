import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import {
  Users,
  ShieldAlert,
  Box,
  CreditCard,
  Car,
  PackageCheck,
  TrendingUp,
  Clock3,
  BadgeCheck,
  AlertTriangle,
  Eye,
} from "lucide-react";

export default async function AdminPage() {
  const { data: profiles = [] } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const totalUsers = profiles.length;
  const pendingUsers = profiles.filter((p) => p.identity_status === "pending").length;
  const verifiedUsers = profiles.filter((p) => p.identity_status === "verified").length;

  return (
    <main className="min-h-screen bg-[#F4F7F5] px-6 py-8 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-emerald-100 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
              Back-office
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Admin Droovo
            </h1>
            <p className="mt-2 text-slate-600">
              Pilotage des utilisateurs, vérifications, colis, trajets et commissions.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-black text-white"
          >
            Retour accueil
          </Link>
        </header>

        <section className="mt-6 grid gap-5 md:grid-cols-4">
          <Stat icon={Users} label="Utilisateurs" value={totalUsers} />
          <Stat icon={ShieldAlert} label="À vérifier" value={pendingUsers} />
          <Stat icon={BadgeCheck} label="Comptes validés" value={verifiedUsers} />
          <Stat icon={CreditCard} label="Commissions" value="0 €" />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <Panel title="Utilisateurs récents" icon={Users} className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl ring-1 ring-slate-100">
              <div className="grid grid-cols-4 bg-slate-950 px-4 py-3 text-sm font-black text-white">
                <span>Nom</span>
                <span>Email</span>
                <span>Statut</span>
                <span>Date</span>
              </div>

              {profiles.length === 0 ? (
                <div className="p-4 text-sm font-bold text-slate-500">
                  Aucun utilisateur pour le moment.
                </div>
              ) : (
                profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="grid grid-cols-4 border-t border-slate-100 px-4 py-4 text-sm"
                  >
                    <span className="font-black text-slate-950">
                      {profile.fullname || "Non renseigné"}
                    </span>
                    <span className="text-slate-600">{profile.email}</span>
                    <span>
                      <Status status={profile.identity_status} />
                    </span>
                    <span className="text-slate-500">
                      {profile.created_at
                        ? new Date(profile.created_at).toLocaleDateString("fr-FR")
                        : "-"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Panel>

          <Panel title="Actions rapides" icon={Eye}>
            <div className="grid gap-3">
              <AdminButton label="Voir les comptes à vérifier" />
              <AdminButton label="Valider une identité" dark />
              <AdminButton label="Exporter les utilisateurs" />
              <AdminButton label="Voir les paiements" />
            </div>
          </Panel>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel title="Vérifications d’identité" icon={ShieldAlert}>
            {pendingUsers === 0 ? (
              <Empty text="Aucune vérification en attente." />
            ) : (
              profiles
                .filter((p) => p.identity_status === "pending")
                .map((profile) => (
                  <AdminRow
                    key={profile.id}
                    title={profile.fullname || "Utilisateur"}
                    text={`${profile.email} · pièce d’identité à vérifier`}
                    tag="En attente"
                    warning
                  />
                ))
            )}
          </Panel>

          <Panel title="Flux financiers" icon={TrendingUp}>
            <AdminRow
              title="Volume transactions"
              text="Aucun paiement réel connecté pour le moment."
              tag="0 €"
            />
            <AdminRow
              title="Commissions Droovo"
              text="Stripe devra être connecté pour remonter les commissions."
              tag="À connecter"
            />
            <AdminRow
              title="Versements livreurs"
              text="Les reversements seront visibles après connexion Stripe."
              tag="À venir"
            />
          </Panel>

          <Panel title="Colis publiés" icon={Box}>
            <AdminRow
              title="Aucun colis réel"
              text="La table packages doit être connectée à Supabase."
              tag="0 actif"
            />
            <AdminRow
              title="Prochaine étape"
              text="Créer la table packages et le formulaire publier colis."
              tag="À faire"
            />
          </Panel>

          <Panel title="Trajets déclarés" icon={Car}>
            <AdminRow
              title="Aucun trajet réel"
              text="La table trips doit être connectée à Supabase."
              tag="0 actif"
            />
            <AdminRow
              title="Prochaine étape"
              text="Créer la table trips et le formulaire déclarer trajet."
              tag="À faire"
            />
          </Panel>
        </section>

        <section className="mt-8 rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl">
          <div className="flex items-start gap-4">
            <AlertTriangle className="mt-1 text-amber-300" />
            <div>
              <h2 className="text-2xl font-black">
                Ce tableau de bord est connecté aux utilisateurs.
              </h2>
              <p className="mt-2 max-w-3xl text-white/60">
                Les comptes remontent depuis Supabase. Pour afficher les colis,
                trajets, paiements et commissions réels, il faudra ensuite créer
                les tables packages, trips et payments.
              </p>
            </div>
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

function Panel({ title, icon: Icon, children, className = "" }) {
  return (
    <div className={`rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-emerald-100 ${className}`}>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Icon size={22} />
        </div>
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Status({ status }) {
  const isVerified = status === "verified";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black ${
        isVerified
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {isVerified ? "Vérifié" : "À vérifier"}
    </span>
  );
}

function AdminRow({ title, text, tag, warning }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
      <div>
        <p className="font-black text-slate-950">{title}</p>
        <p className="mt-1 text-sm text-slate-600">{text}</p>
      </div>
      <span
        className={`rounded-full px-3 py-1 text-xs font-black ${
          warning
            ? "bg-amber-100 text-amber-700"
            : "bg-emerald-100 text-emerald-700"
        }`}
      >
        {tag}
      </span>
    </div>
  );
}

function AdminButton({ label, dark }) {
  return (
    <button
      className={`rounded-2xl px-5 py-4 text-left font-black ${
        dark
          ? "bg-slate-950 text-white"
          : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"
      }`}
    >
      {label}
    </button>
  );
}

function Empty({ text }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500 ring-1 ring-slate-100">
      {text}
    </div>
  );
}
