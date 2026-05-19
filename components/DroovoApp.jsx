"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  Box,
  Car,
  CheckCircle2,
  CreditCard,
  MapPin,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Star,
  TrendingUp,
  UserRound,
  Wallet,
} from "lucide-react";

export default function DroovoApp() {
  const [weight, setWeight] = useState(2);
  const [distance, setDistance] = useState(690);

  const pricing = useMemo(() => {
    const base = 5;
    const weightCost = weight * 0.8;
    const distanceCost = distance * 0.02;
    const total = Math.max(8.9, base + weightCost + distanceCost);
    const commission = total * 0.2;
    const driver = total - commission;

    return {
      total: total.toFixed(2),
      commission: commission.toFixed(2),
      driver: driver.toFixed(2),
    };
  }, [weight, distance]);

  const routes = [
    { from: "Avignon", to: "Paris", time: "Aujourd’hui · 17:30", gain: "42 €", rating: "4.9" },
    { from: "Montpellier", to: "Lyon", time: "Demain · 08:00", gain: "31 €", rating: "4.8" },
    { from: "Marseille", to: "Toulouse", time: "Vendredi · 14:15", gain: "24 €", rating: "5.0" },
  ];

  return (
    <main className="min-h-screen bg-[#070A0F] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-120px] h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute right-[-120px] top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black">
              <PackageCheck size={22} />
            </div>
            <div>
              <p className="text-lg font-semibold">Droovo</p>
              <p className="text-xs text-white/50">Livraison entre particuliers</p>
            </div>
          </div>

          <nav className="hidden gap-7 text-sm text-white/60 md:flex">
            <a href="#fonctionnement">Fonctionnement</a>
            <a href="#tarifs">Tarifs</a>
            <a href="#dashboard">Dashboard</a>
          </nav>

          <button className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">
            Se connecter
          </button>
        </header>

        <section className="grid items-center gap-12 py-20 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/70">
              <TrendingUp size={16} className="text-emerald-300" />
              Rentabilisez vos trajets. Envoyez vos colis plus vite.
            </div>

            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.05em] md:text-7xl">
              Le covoiturage du colis, simple, sécurisé et rentable.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/60">
              Droovo connecte les personnes qui veulent envoyer un colis avec des voyageurs déjà en route. Le prix, le gain livreur et la commission Droovo sont calculés automatiquement.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="rounded-full bg-emerald-300 px-6 py-4 text-sm font-semibold text-black">
                Publier un colis <ArrowRight className="ml-2 inline" size={16} />
              </button>
              <button className="rounded-full border border-white/10 bg-white/10 px-6 py-4 text-sm font-semibold text-white">
                Proposer un trajet
              </button>
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-semibold">20%</p>
                <p className="mt-1 text-xs text-white/50">Commission Droovo</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-semibold">24h</p>
                <p className="mt-1 text-xs text-white/50">Livraison rapide</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-semibold">4.9</p>
                <p className="mt-1 text-xs text-white/50">Note moyenne</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="rounded-[1.5rem] bg-[#0B1018] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-white/40">Live dashboard</p>
                  <h2 className="mt-2 text-2xl font-semibold">Trajets disponibles</h2>
                </div>
                <div className="rounded-2xl bg-emerald-300/10 p-3 text-emerald-300">
                  <Car size={24} />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {routes.map((route) => (
                  <div key={`${route.from}-${route.to}`} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold">
                          {route.from} → {route.to}
                        </p>
                        <p className="mt-1 text-sm text-white/45">{route.time}</p>
                        <p className="mt-2 flex items-center gap-1 text-xs text-white/45">
                          <Star size={13} className="text-yellow-300" /> {route.rating} · Livreur vérifié
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-emerald-300">+{route.gain}</p>
                        <p className="text-xs text-white/40">gain estimé</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="tarifs" className="grid gap-6 py-10 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Simulateur</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Calcul prix + commission</h2>
            <p className="mt-3 max-w-2xl text-white/55">
              Ce bloc sert de base au futur moteur de prix : le client voit le prix, le livreur voit son gain, Droovo voit sa commission.
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <div className="mb-2 flex justify-between text-sm text-white/70">
                  <span>Poids du colis</span>
                  <span>{weight} kg</span>
                </div>
                <input className="w-full accent-emerald-300" type="range" min="1" max="20" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm text-white/70">
                  <span>Distance estimée</span>
                  <span>{distance} km</span>
                </div>
                <input className="w-full accent-emerald-300" type="range" min="20" max="900" step="10" value={distance} onChange={(e) => setDistance(Number(e.target.value))} />
              </div>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-black/25 p-5">
                <p className="text-sm text-white/45">Prix client</p>
                <p className="mt-2 text-3xl font-semibold">{pricing.total} €</p>
              </div>
              <div className="rounded-2xl bg-black/25 p-5">
                <p className="text-sm text-white/45">Gain livreur</p>
                <p className="mt-2 text-3xl font-semibold">{pricing.driver} €</p>
              </div>
              <div className="rounded-2xl bg-emerald-300/10 p-5">
                <p className="text-sm text-emerald-200/70">Commission Droovo</p>
                <p className="mt-2 text-3xl font-semibold text-emerald-200">{pricing.commission} €</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.25em] text-blue-300">Sécurité</p>
            <h2 className="mt-2 text-2xl font-semibold">Workflow prévu</h2>
            <div className="mt-6 space-y-5">
              <Feature icon={MapPin} title="Adresses validées" text="Départ et arrivée confirmés avant mise en relation." />
              <Feature icon={CreditCard} title="Paiement sécurisé" text="Paiement bloqué jusqu’à validation de livraison." />
              <Feature icon={MessageCircle} title="Chat intégré" text="L’expéditeur et le livreur échangent dans l’app." />
              <Feature icon={ShieldCheck} title="Livreurs notés" text="Avis et historique pour sécuriser la communauté." />
            </div>
          </div>
        </section>

        <section id="dashboard" className="grid gap-4 py-10 md:grid-cols-4">
          <Metric icon={UserRound} label="Utilisateurs" value="1 284" />
          <Metric icon={Box} label="Colis actifs" value="342" />
          <Metric icon={Wallet} label="Volume brut" value="8 740 €" />
          <Metric icon={CheckCircle2} label="Livraisons" value="218" />
        </section>
      </div>
    </main>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10">
        <Icon size={19} />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm leading-6 text-white/50">{text}</p>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
      <Icon className="text-emerald-300" size={22} />
      <p className="mt-5 text-sm text-white/45">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}
