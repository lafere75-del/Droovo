"use client";
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Box,
  CalendarDays,
  Car,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  MapPin,
  MessageCircle,
  PackageCheck,
  Route,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserRound,
  WalletCards,
} from "lucide-react";

const routes = [
  {
    from: "Avignon",
    to: "Paris",
    date: "Aujourd’hui · 17:30",
    driver: "Sami",
    rating: 4.9,
    parcels: 3,
    payout: 42,
    status: "Disponible",
  },
  {
    from: "Montpellier",
    to: "Lyon",
    date: "Demain · 08:00",
    driver: "Inès",
    rating: 4.8,
    parcels: 2,
    payout: 31,
    status: "Rapide",
  },
  {
    from: "Marseille",
    to: "Toulouse",
    date: "Vendredi · 14:15",
    driver: "Nora",
    rating: 5.0,
    parcels: 1,
    payout: 24,
    status: "Premium",
  },
];

const pricingRows = [
  { label: "Prix client estimé", value: "18,90 €", detail: "Colis 2 kg · Avignon → Paris" },
  { label: "Gain livreur", value: "14,90 €", detail: "Versement après livraison validée" },
  { label: "Commission Droovo", value: "4,00 €", detail: "20 % de la transaction" },
];

const activity = [
  { icon: Box, title: "Colis publié", text: "MacBook · Avignon → Paris", time: "Il y a 3 min" },
  { icon: Car, title: "Trajet proposé", text: "Départ demain à 08:00", time: "Il y a 12 min" },
  { icon: CreditCard, title: "Paiement sécurisé", text: "Transaction en attente de validation", time: "Il y a 28 min" },
];

function StatCard({ icon: Icon, label, value, trend }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-2xl bg-white/10 p-3">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">{trend}</span>
      </div>
      <p className="text-sm text-white/55">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-white">{value}</p>
    </div>
  );
}

function Pill({ children }) {
  return <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/70">{children}</span>;
}

function PricingSimulator() {
  const [weight, setWeight] = useState(2);
  const [distance, setDistance] = useState(690);

  const price = useMemo(() => {
    const base = 5;
    const kg = weight * 0.8;
    const km = distance * 0.02;
    const total = Math.max(8.9, base + kg + km);
    const commission = total * 0.2;
    const driver = total - commission;
    return { total, commission, driver };
  }, [weight, distance]);

  return (
    <div className="rounded-[2rem] border border-white/10 bg-neutral-950/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-2xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-emerald-300">Simulation</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Prix automatique</h3>
          <p className="mt-1 text-sm text-white/55">Le client voit le prix, le livreur voit son gain, Droovo garde la commission.</p>
        </div>
        <div className="rounded-2xl bg-emerald-400/10 p-3">
          <CircleDollarSign className="h-6 w-6 text-emerald-300" />
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <div className="mb-2 flex justify-between text-sm text-white/70">
            <span>Poids du colis</span>
            <span>{weight} kg</span>
          </div>
          <input className="w-full accent-emerald-300" min="1" max="20" type="range" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
        </div>
        <div>
          <div className="mb-2 flex justify-between text-sm text-white/70">
            <span>Distance estimée</span>
            <span>{distance} km</span>
          </div>
          <input className="w-full accent-emerald-300" min="20" max="900" step="10" type="range" value={distance} onChange={(e) => setDistance(Number(e.target.value))} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white/[0.06] p-4">
          <p className="text-xs text-white/45">Client</p>
          <p className="mt-1 text-lg font-semibold text-white">{price.total.toFixed(2)} €</p>
        </div>
        <div className="rounded-2xl bg-white/[0.06] p-4">
          <p className="text-xs text-white/45">Livreur</p>
          <p className="mt-1 text-lg font-semibold text-white">{price.driver.toFixed(2)} €</p>
        </div>
        <div className="rounded-2xl bg-emerald-400/10 p-4">
          <p className="text-xs text-emerald-200/70">Droovo</p>
          <p className="mt-1 text-lg font-semibold text-emerald-200">{price.commission.toFixed(2)} €</p>
        </div>
      </div>
    </div>
  );
}

export default function DroovoPremiumAppPreview() {
  return (
    <div className="min-h-screen bg-[#070A0F] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute right-0 top-24 h-[32rem] w-[32rem] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black shadow-lg shadow-emerald-500/10">
            <Route className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">Droovo</p>
            <p className="text-xs text-white/45">Livraison entre particuliers</p>
          </div>
        </div>
        <nav className="hidden items-center gap-7 text-sm text-white/60 md:flex">
          <a>Publier un colis</a>
          <a>Proposer un trajet</a>
          <a>Tarifs</a>
          <a>Sécurité</a>
        </nav>
        <button className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-200">Se connecter</button>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-16 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/70 backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              Rentabilisez vos trajets. Livrez plus vite qu’un transporteur classique.
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-white md:text-7xl">
              Envoyer un colis devient aussi simple qu’un trajet partagé.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              Droovo connecte les personnes qui ont un colis à envoyer avec des voyageurs déjà en route. Prix calculé automatiquement, paiement sécurisé, suivi clair et commission intégrée.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="group rounded-full bg-emerald-300 px-6 py-4 text-sm font-semibold text-black shadow-2xl shadow-emerald-500/20">
                Publier un colis
                <ArrowRight className="ml-2 inline h-4 w-4 transition group-hover:translate-x-1" />
              </button>
              <button className="rounded-full border border-white/10 bg-white/[0.06] px-6 py-4 text-sm font-semibold text-white backdrop-blur-xl">
                Proposer mon trajet
              </button>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <Pill>Paiement sécurisé</Pill>
              <Pill>Commission automatique</Pill>
              <Pill>Matching colis/trajets</Pill>
              <Pill>Dashboard admin</Pill>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }} className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-emerald-400/20 to-blue-500/10 blur-2xl" />
            <div className="relative rounded-[2.25rem] border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-black/50 backdrop-blur-2xl">
              <div className="rounded-[1.75rem] bg-[#0A0F16] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-white/35">Dashboard</p>
                    <h2 className="mt-1 text-2xl font-semibold">Pilotage Droovo</h2>
                  </div>
                  <button className="rounded-full bg-white/10 p-3"><Bell className="h-5 w-5" /></button>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <StatCard icon={UserRound} label="Utilisateurs" value="1 284" trend="+18%" />
                  <StatCard icon={PackageCheck} label="Colis actifs" value="342" trend="+11%" />
                  <StatCard icon={WalletCards} label="CA brut" value="8 740 €" trend="+24%" />
                  <StatCard icon={TrendingUp} label="Commission" value="1 748 €" trend="20%" />
                </div>
                <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="font-medium">Trajets disponibles</p>
                    <span className="text-xs text-emerald-300">Live</span>
                  </div>
                  <div className="space-y-3">
                    {routes.map((route) => (
                      <div key={`${route.from}-${route.to}`} className="rounded-2xl bg-white/[0.06] p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm font-semibold">
                              <span>{route.from}</span><ChevronRight className="h-4 w-4 text-white/35" /><span>{route.to}</span>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/45">
                              <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{route.date}</span>
                              <span className="flex items-center gap-1"><Star className="h-3 w-3" />{route.rating}</span>
                              <span>{route.parcels} colis</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-emerald-300">+{route.payout} €</p>
                            <p className="mt-1 text-xs text-white/45">{route.status}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PricingSimulator />
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-blue-300">Sécurité</p>
            <h3 className="mt-2 text-xl font-semibold">Workflow de livraison</h3>
            <div className="mt-6 space-y-4">
              {[
                [MapPin, "Adresse validée", "Départ et arrivée confirmés avant paiement."],
                [ShieldCheck, "Paiement bloqué", "Le livreur est payé après validation de réception."],
                [MessageCircle, "Chat intégré", "Expéditeur et livreur peuvent échanger dans l’app."],
                [BadgeCheck, "Avis vérifiés", "Notes après livraison pour sécuriser la communauté."],
              ].map(([Icon, title, text]) => (
                <div className="flex gap-4" key={title}>
                  <div className="h-10 w-10 shrink-0 rounded-2xl bg-white/10 p-2.5"><Icon className="h-5 w-5 text-white" /></div>
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/50">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-fuchsia-300">Activité</p>
                <h3 className="mt-2 text-xl font-semibold">Temps réel</h3>
              </div>
              <Clock3 className="h-6 w-6 text-white/40" />
            </div>
            <div className="mt-6 space-y-3">
              {activity.map((item) => (
                <div key={item.title} className="flex items-center gap-4 rounded-2xl bg-white/[0.05] p-4">
                  <div className="rounded-2xl bg-white/10 p-3"><item.icon className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="truncate text-sm text-white/45">{item.text}</p>
                  </div>
                  <p className="text-xs text-white/35">{item.time}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-emerald-300">MVP exploitable</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight">La prochaine version doit transformer Droovo en vrai tunnel de conversion.</h3>
              <p className="mt-4 text-white/55 leading-7">
                L’objectif n’est plus d’avoir une simple maquette. Il faut une app claire : un utilisateur publie un colis, obtient un prix, paie, est matché avec un livreur et suit la livraison.
              </p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {pricingRows.map((row) => (
                <div key={row.label} className="rounded-2xl bg-black/25 p-4">
                  <p className="text-sm text-white/45">{row.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{row.value}</p>
                  <p className="mt-2 text-xs leading-5 text-white/40">{row.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
