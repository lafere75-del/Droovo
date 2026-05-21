"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  BadgeCheck,
  Box,
  Car,
  CreditCard,
  FileCheck2,
  MessageCircle,
  Package,
  ShieldAlert,
  UserRound,
} from "lucide-react";

export default function DashboardPage() {
  const identityStatus = "verified";

  const [packages, setPackages] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: userPackages } = await supabase
      .from("packages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const { data: userTrips } = await supabase
      .from("trips")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setPackages(userPackages || []);
    setTrips(userTrips || []);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#F4F7F5] px-6 py-8 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-emerald-100">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
              Espace utilisateur
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Tableau de bord Droovo
            </h1>
            <p className="mt-2 text-slate-600">
              Gérez vos colis, vos trajets, votre vérification et vos paiements.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white"
          >
            Retour accueil
          </Link>
        </header>

        {identityStatus !== "verified" && (
          <section className="mt-6 rounded-[2rem] bg-amber-50 p-6 ring-1 ring-amber-100">
            <div className="flex items-start gap-4">
              <ShieldAlert className="mt-1 text-amber-700" />
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Vérification d’identité requise
                </h2>
                <p className="mt-2 text-slate-700">
                  Vous devez faire vérifier votre identité avant de publier un
                  colis ou déclarer un trajet.
                </p>
                <Link
                  href="/dashboard/verification"
                  className="mt-4 inline-block rounded-full bg-amber-600 px-5 py-3 text-sm font-black text-white"
                >
                  Vérifier mon identité
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className="mt-6 grid gap-5 md:grid-cols-4">
          <Stat
            icon={Package}
            label="Mes colis"
            value={loading ? "..." : packages.length}
          />

          <Stat
            icon={Car}
            label="Mes trajets"
            value={loading ? "..." : trips.length}
          />

          <Stat icon={CreditCard} label="Paiements" value="0 €" />

          <Stat icon={BadgeCheck} label="Statut" value="Vérifié" />
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            icon={Package}
            title="Envoyer un colis"
            text="Publier un colis à envoyer sur un trajet compatible."
            href="/dashboard/publier-colis"
            locked={identityStatus !== "verified"}
          />

          <ActionCard
            icon={Car}
            title="Déclarer un trajet"
            text="Proposer un trajet et recevoir des demandes de transport."
            href="/dashboard/declarer-trajet"
            locked={identityStatus !== "verified"}
          />

          <ActionCard
            icon={Car}
            title="Mes trajets"
            text="Voir mes trajets publiés et les colis compatibles."
            href="/dashboard/mes-trajets"
          />

          <ActionCard
            icon={FileCheck2}
            title="Vérification d’identité"
            text="Ajoutez votre pièce d’identité, un selfie et un RIB."
            href="/dashboard/verification"
          />

          <ActionCard
            icon={Box}
            title="Mes colis"
            text="Suivre les colis publiés, acceptés ou livrés."
            href="/dashboard/mes-colis"
          />

          <ActionCard
            icon={MessageCircle}
            title="Messages"
            text="Échanger avec un expéditeur ou un livreur."
            href="/dashboard/messages"
          />

          <ActionCard
            icon={UserRound}
            title="Mon profil"
            text="Modifier mes informations personnelles."
            href="/dashboard/profil"
          />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel title="Mes derniers trajets">
            {trips.length === 0 ? (
              <Empty text="Aucun trajet déclaré pour le moment." />
            ) : (
              trips.slice(0, 3).map((trip) => (
                <Row
                  key={trip.id}
                  title={`${trip.departure_city} → ${trip.arrival_city}`}
                  text={`Date : ${
                    trip.trip_date
                      ? new Date(trip.trip_date).toLocaleDateString("fr-FR")
                      : "Date non renseignée"
                  }`}
                  tag={`${trip.available_weight || 0} kg dispo`}
                />
              ))
            )}
          </Panel>

          <Panel title="Mes derniers colis">
            {packages.length === 0 ? (
              <Empty text="Aucun colis publié pour le moment." />
            ) : (
              packages.slice(0, 3).map((pkg) => (
                <Row
                  key={pkg.id}
                  title={`${pkg.departure_city} → ${pkg.arrival_city}`}
                  text={pkg.title || "Colis sans titre"}
                  tag={`${pkg.weight || 0} kg · ${pkg.price || 0} €`}
                />
              ))
            )}
          </Panel>
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

function ActionCard({ icon: Icon, title, text, href, locked }) {
  return (
    <div className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-emerald-100">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
        <Icon size={24} />
      </div>

      <h3 className="mt-5 text-xl font-black">{title}</h3>

      <p className="mt-2 min-h-[48px] text-slate-600">{text}</p>

      {locked ? (
        <Link
          href="/dashboard/verification"
          className="mt-5 inline-block rounded-full bg-amber-600 px-5 py-3 text-sm font-black text-white"
        >
          Vérification requise
        </Link>
      ) : (
        <Link
          href={href}
          className="mt-5 inline-block rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white"
        >
          Ouvrir
        </Link>
      )}
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-emerald-100">
      <h2 className="text-xl font-black text-slate-950">{title}</h2>

      <div className="mt-5 grid gap-3">{children}</div>
    </div>
  );
}

function Row({ title, text, tag }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
      <div>
        <p className="font-black text-slate-950">{title}</p>

        <p className="mt-1 text-sm text-slate-600">{text}</p>
      </div>

      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
        {tag}
      </span>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500 ring-1 ring-slate-100">
      {text}
    </div>
  );
}
