"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import InfoTile from "../../../../components/InfoTile";
import { supabase } from "../../../../lib/supabaseClient";

export default function ColisDetailPage({ params }) {
  const { id } = use(params);
  const [colis, setColis] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("packages").select("*").eq("id", id).maybeSingle();
      setColis(data || null);
      setLoading(false);
    }
    load();
  }, [id]);
  if (loading) return <main className="min-h-screen bg-[#F4F7F5] p-10"><p className="text-xl font-black">Chargement...</p></main>;
  if (!colis) return <main className="min-h-screen bg-[#F4F7F5] p-8"><Link href="/dashboard/mes-colis" className="font-bold text-emerald-700">← Retour</Link><div className="mt-8 rounded-[2rem] bg-white p-8"><h1 className="text-2xl font-black">Colis introuvable</h1></div></main>;
  return (
    <main className="min-h-screen bg-[#F4F7F5] px-6 py-10"><div className="mx-auto max-w-5xl">
      <Link href="/dashboard/mes-colis" className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200">← Retour</Link>
      <section className="mt-8 rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">Détail du colis</p><h1 className="mt-3 text-4xl font-black text-slate-950">{colis.title || "Colis"}</h1><p className="mt-3 text-slate-600">{colis.departure_city} → {colis.arrival_city}</p></div><div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">{colis.status || "Publié"}</div></div>
        <div className="mt-8 grid gap-5 md:grid-cols-2"><InfoTile label="Ville de départ" value={colis.departure_city}/><InfoTile label="Ville d’arrivée" value={colis.arrival_city}/><InfoTile label="Date souhaitée" value={colis.desired_date ? new Date(colis.desired_date).toLocaleDateString("fr-FR") : null}/><InfoTile label="Prix proposé" value={colis.price ? `${colis.price} €` : null}/><InfoTile label="Taille" value={colis.size}/><InfoTile label="Poids" value={colis.weight ? `${colis.weight} kg` : null}/></div>
        {colis.description ? <div className="mt-8 rounded-2xl bg-slate-50 p-5"><h2 className="font-black">Description</h2><p className="mt-2 text-slate-600">{colis.description}</p></div> : null}
      </section>
    </div></main>
  );
}
