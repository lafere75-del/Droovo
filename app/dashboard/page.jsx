"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, CarFront, ChevronRight, CreditCard, Package, Route, ShieldAlert } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { formatDeliveryStatus } from "../../lib/droovoUi";

const ACTIVE_STATUSES = new Set(["active", "pending", "accepted", "authorized", "paid", "picked_up", "in_transit"]);

function formatRoute(item) {
  return `${item.departure_city || "Départ"} → ${item.arrival_city || "Arrivée"}`;
}

export default function DashboardPage() {
  const [mode, setMode] = useState("sender");
  const [firstName, setFirstName] = useState("");
  const [identityStatus, setIdentityStatus] = useState("pending");
  const [packages, setPackages] = useState([]);
  const [trips, setTrips] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [paymentReady, setPaymentReady] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user || !active) {
        if (active) setLoading(false);
        return;
      }

      const [profileResult, packagesResult, tripsResult, notificationsResult, paymentResult] = await Promise.all([
        supabase.from("profiles").select("first_name,identity_status").eq("id", user.id).maybeSingle(),
        supabase.from("packages").select("id,title,departure_city,arrival_city,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
        supabase.from("trips").select("id,departure_city,arrival_city,status,trip_date,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
        supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false),
        supabase.from("payment_settings").select("stripe_payment_method_id,card_consent_at").eq("user_id", user.id).maybeSingle(),
      ]);

      if (!active) return;
      setFirstName(profileResult.data?.first_name || "");
      setIdentityStatus(profileResult.data?.identity_status || "pending");
      setPackages(packagesResult.data || []);
      setTrips(tripsResult.data || []);
      setUnreadCount(notificationsResult.count || 0);
      setPaymentReady(Boolean(paymentResult.data?.stripe_payment_method_id && paymentResult.data?.card_consent_at));
      setLoading(false);
    }

    loadDashboard();
    const channel = supabase.channel("dashboard-notifications").on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications" },
      loadDashboard
    ).subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const isSender = mode === "sender";
  const currentItem = isSender
    ? packages.find((item) => ACTIVE_STATUSES.has(item.status)) || packages[0]
    : trips.find((item) => ACTIVE_STATUSES.has(item.status)) || trips[0];

  return (
    <main className="min-h-screen bg-[#F4F7F5] px-4 py-6 text-slate-950 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">Espace Droovo</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Bonjour{firstName ? ` ${firstName}` : ""} 👋</h1>
          </div>
          <Link href="/dashboard/notifications" aria-label="Ouvrir les notifications" className="relative rounded-full bg-white p-3 shadow-sm ring-1 ring-emerald-100 hover:bg-emerald-50">
            <Bell size={21} />
            {unreadCount > 0 ? <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-600 px-1 text-xs font-black text-white">{unreadCount}</span> : null}
          </Link>
        </header>

        <div className="mt-7 grid grid-cols-2 gap-2 rounded-2xl bg-emerald-50 p-1.5 ring-1 ring-emerald-100">
          <ModeButton active={isSender} onClick={() => setMode("sender")}>J’envoie</ModeButton>
          <ModeButton active={!isSender} onClick={() => setMode("driver")}>Je transporte</ModeButton>
        </div>

        <p className="mt-5 text-slate-600">{isSender ? "Que souhaitez-vous envoyer aujourd’hui ?" : "Rentabilisez un trajet que vous avez déjà prévu."}</p>

        {identityStatus !== "verified" ? (
          <section className="mt-5 flex gap-4 rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-100">
            <ShieldAlert className="mt-0.5 shrink-0 text-amber-700" size={22} />
            <div>
              <h2 className="font-black">Vérification d’identité requise</h2>
              <p className="mt-1 text-sm text-slate-600">Vérifiez votre identité avant votre première opération.</p>
              <Link href="/dashboard/verification" className="mt-3 inline-flex rounded-full bg-amber-600 px-4 py-2 text-sm font-black text-white">Vérifier mon identité</Link>
            </div>
          </section>
        ) : null}

        {!paymentReady ? (
          <section className="mt-5 flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-emerald-100">
            <CreditCard className="mt-0.5 shrink-0 text-emerald-700" size={22} />
            <div>
              <h2 className="font-black">Moyen de paiement à ajouter</h2>
              <p className="mt-1 text-sm text-slate-600">Vous pouvez découvrir votre espace maintenant et enregistrer votre carte avant de choisir un transporteur.</p>
              <Link href="/dashboard/paiements" className="mt-3 inline-flex rounded-full bg-emerald-600 px-4 py-2 text-sm font-black text-white">Ajouter ma carte</Link>
            </div>
          </section>
        ) : null}

        <section className="mt-5 overflow-hidden rounded-[2rem] bg-white px-5 shadow-sm ring-1 ring-emerald-100 sm:px-7">
          {isSender ? (
            <>
              <DashboardAction icon={Package} title="Envoyer un colis" description="Indiquez le départ, la destination et les dimensions." href="/dashboard/publier-colis" />
              <DashboardAction icon={CarFront} title="Trouver un transporteur" description="Consultez les trajets compatibles avec vos colis." href="/dashboard/mes-colis" />
            </>
          ) : (
            <>
              <DashboardAction icon={Route} title="Déclarer un trajet" description="Indiquez votre départ et votre destination." href="/dashboard/declarer-trajet" />
              <DashboardAction icon={Package} title="Voir les colis compatibles" description="Acceptez uniquement ceux qui vous conviennent." href="/dashboard/mes-trajets" />
            </>
          )}
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">{isSender ? "Mon envoi récent" : "Mon trajet récent"}</h2>
            <Link href="/dashboard/activite" className="text-sm font-black text-emerald-700 hover:text-emerald-800">Voir tout</Link>
          </div>
          <div className="mt-3 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-emerald-100 sm:p-6">
            {loading ? <p className="text-sm text-slate-500">Chargement…</p> : currentItem ? (
              <Link href={isSender ? `/dashboard/mes-colis/${currentItem.id}` : `/dashboard/mes-trajets/${currentItem.id}`} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-black">{formatRoute(currentItem)}</p>
                  <p className="mt-1 text-sm text-slate-500">{isSender ? currentItem.title || "Colis" : currentItem.trip_date ? new Date(currentItem.trip_date).toLocaleDateString("fr-FR") : "Date à confirmer"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">{formatDeliveryStatus(currentItem.status || "active")}</span>
                  <ChevronRight size={18} className="text-slate-400" />
                </div>
              </Link>
            ) : (
              <div>
                <p className="font-bold text-slate-700">{isSender ? "Aucun colis publié." : "Aucun trajet déclaré."}</p>
                <Link href={isSender ? "/dashboard/publier-colis" : "/dashboard/declarer-trajet"} className="mt-3 inline-flex text-sm font-black text-emerald-700">{isSender ? "Envoyer mon premier colis" : "Déclarer mon premier trajet"}</Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ModeButton({ active, children, onClick }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={`rounded-xl px-4 py-3 text-sm font-black transition ${active ? "bg-emerald-600 text-white shadow-sm" : "text-emerald-900 hover:bg-white"}`}>{children}</button>;
}

function DashboardAction({ icon: Icon, title, description, href }) {
  return (
    <Link href={href} className="grid grid-cols-[44px_1fr_auto] items-center gap-3 border-b border-emerald-100 py-5 last:border-b-0 hover:text-emerald-800">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon size={21} /></span>
      <span><strong className="block font-black">{title}</strong><span className="mt-1 block text-sm text-slate-500">{description}</span></span>
      <ChevronRight size={20} className="text-slate-400" />
    </Link>
  );
}
