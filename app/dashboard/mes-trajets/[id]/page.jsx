"use client";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

export default function TrajetDetailPage({ params }) {
  const { id } = use(params);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { async function load() { const { data } = await supabase.from("trips").select("*").eq("id", id).maybeSingle(); setTrip(data || null); setLoading(false); } load(); }, [id]);
  if (loading) return <main className="min-h-screen bg-[#F4F7F5] p-10"><p className="text-xl font-black">Chargement...</p></main>;
  if (!trip) return <main className="min-h-screen bg-[#F4F7F5] p-8"><Link href="/dashboard/mes-trajets" className="font-bold text-emerald-700">← Retour</Link><div className="mt-8 rounded-[2rem] bg-white p-8"><h1 className="text-2xl font-black">Trajet introuvable</h1></div></main>;
  return <main className="min-h-screen bg-[#F4F7F5] px-6 py-10"><div className="mx-auto max-w-5xl"><Link href="/dashboard/mes-trajets" className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200">← Retour</Link><section className="mt-8 rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100"><p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">Détail du trajet</p><h1 className="mt-3 text-4xl font-black text-slate-950">{trip.departure_city} → {trip.arrival_city}</h1><div className="mt-8 grid gap-5 md:grid-cols-2"><Info label="Ville de départ" value={trip.departure_city}/><Info label="Ville d’arrivée" value={trip.arrival_city}/><Info label="Date" value={trip.trip_date ? new Date(trip.trip_date).toLocaleDateString("fr-FR") : null}/><Info label="Capacité disponible" value={trip.available_weight ? `${trip.available_weight} kg` : null}/><Info label="Statut" value={trip.status}/><Info label="Prix proposé" value={trip.price ? `${trip.price} €` : null}/></div>{trip.notes && <div className="mt-8 rounded-2xl bg-slate-50 p-5"><h2 className="font-black">Informations</h2><p className="mt-2 text-slate-600">{trip.notes}</p></div>}</section></div></main>;
}
function Info({ label, value }) { return <div className="rounded-2xl bg-slate-50 p-5"><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 text-lg font-black text-slate-950">{value || "Non renseigné"}</p></div>; }
