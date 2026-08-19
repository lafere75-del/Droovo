"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CarFront, ChevronRight, Package } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import { formatDeliveryStatus } from "../../../lib/droovoUi";

function getCreatedTimestamp(item) {
  return new Date(item.created_at || item.trip_date || 0).getTime();
}

export default function ActivitePage() {
  const [filter, setFilter] = useState("all");
  const [packages, setPackages] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadActivity() {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user || !active) {
        if (active) setLoading(false);
        return;
      }
      const [packagesResult, tripsResult] = await Promise.all([
        supabase.from("packages").select("id,title,departure_city,arrival_city,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("trips").select("id,departure_city,arrival_city,status,trip_date,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      if (!active) return;
      setPackages(packagesResult.data || []);
      setTrips(tripsResult.data || []);
      setLoading(false);
    }
    loadActivity();
    return () => { active = false; };
  }, []);

  const activities = useMemo(() => {
    const packageItems = packages.map((item) => ({ ...item, kind: "package" }));
    const tripItems = trips.map((item) => ({ ...item, kind: "trip" }));
    return [...packageItems, ...tripItems]
      .filter((item) => filter === "all" || item.kind === filter)
      .sort((a, b) => getCreatedTimestamp(b) - getCreatedTimestamp(a));
  }, [filter, packages, trips]);

  return (
    <main className="min-h-screen bg-[#F4F7F5] px-4 py-6 text-slate-950 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">Activité</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Mes colis et mes trajets</h1>
        <p className="mt-2 text-slate-600">Retrouvez toutes vos opérations au même endroit.</p>

        <div className="mt-6 flex flex-wrap gap-2" aria-label="Filtrer l’activité">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>Tout</FilterButton>
          <FilterButton active={filter === "package"} onClick={() => setFilter("package")}>Mes colis</FilterButton>
          <FilterButton active={filter === "trip"} onClick={() => setFilter("trip")}>Mes trajets</FilterButton>
        </div>

        <section className="mt-6 overflow-hidden rounded-[2rem] bg-white px-5 shadow-sm ring-1 ring-emerald-100 sm:px-7">
          {loading ? <p className="py-8 text-sm text-slate-500">Chargement de l’activité…</p> : activities.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-bold text-slate-700">Aucune activité pour le moment.</p>
              <Link href="/dashboard" className="mt-3 inline-flex text-sm font-black text-emerald-700">Commencer sur l’accueil</Link>
            </div>
          ) : activities.map((item) => <ActivityRow key={`${item.kind}-${item.id}`} item={item} />)}
        </section>
      </div>
    </main>
  );
}

function FilterButton({ active, children, onClick }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={`rounded-full px-4 py-2 text-sm font-black transition ${active ? "bg-emerald-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"}`}>{children}</button>;
}

function ActivityRow({ item }) {
  const isPackage = item.kind === "package";
  const href = isPackage ? `/dashboard/mes-colis/${item.id}` : `/dashboard/mes-trajets/${item.id}`;
  const Icon = isPackage ? Package : CarFront;
  return (
    <Link href={href} className="grid grid-cols-[44px_1fr_auto] items-center gap-3 border-b border-emerald-100 py-5 last:border-b-0 hover:text-emerald-800">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon size={20} /></span>
      <span className="min-w-0">
        <strong className="block truncate font-black">{item.departure_city || "Départ"} → {item.arrival_city || "Arrivée"}</strong>
        <span className="mt-1 block text-sm text-slate-500">{isPackage ? item.title || "Colis" : item.trip_date ? new Date(item.trip_date).toLocaleDateString("fr-FR") : "Date à confirmer"}</span>
      </span>
      <span className="flex items-center gap-2">
        <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 sm:inline-flex">{formatDeliveryStatus(item.status || "active")}</span>
        <ChevronRight size={18} className="text-slate-400" />
      </span>
    </Link>
  );
}
