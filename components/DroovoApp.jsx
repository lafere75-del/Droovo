"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Box,
  Car,
  CheckCircle2,
  Clock3,
  CreditCard,
  Euro,
  MapPin,
  Package,
  Route,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";

const parcels = [
  {
    title: "Petit colis — documents",
    from: "Marseille Centre",
    to: "Paris 11e",
    weight: "1 kg",
    droovoPrice: "7,20 €",
    postePrice: "9,59 €",
    driverGain: "5,62 €",
    commission: "1,58 €",
    delay: "24h",
  },
  {
    title: "Colis vêtements",
    from: "Bordeaux",
    to: "Paris Gare de Lyon",
    weight: "3 kg",
    droovoPrice: "12,90 €",
    postePrice: "17,39 €",
    driverGain: "10,06 €",
    commission: "2,84 €",
    delay: "24h - 48h",
  },
  {
    title: "Petit matériel pro",
    from: "Marseille TGV",
    to: "Paris Bercy",
    weight: "5 kg",
    droovoPrice: "12,90 €",
    postePrice: "17,39 €",
    driverGain: "10,06 €",
    commission: "2,84 €",
    delay: "24h",
  },
];

const comparison = [
  ["Prix 1 kg", "7,20 €", "9,59 €", "20 € et +"],
  ["Prix 5 kg", "12,90 €", "17,39 €", "30 € et +"],
  ["Économie client", "Environ -25%", "Tarif standard", "Souvent plus cher"],
  ["Gain livreur", "5 à 12 € / colis", "Non", "Non"],
  ["Impact", "Trajet déjà prévu", "Réseau logistique", "Transport dédié"],
];

export default function DroovoApp() {
  const [weight, setWeight] = useState(3);
  const [distance, setDistance] = useState(690);

  const pricing = useMemo(() => {
    const laposteRates = [
      { maxWeight: 0.5, price: 7.59 },
      { maxWeight: 1, price: 9.59 },
      { maxWeight: 2, price: 11.19 },
      { maxWeight: 5, price: 17.39 },
      { maxWeight: 10, price: 25.29 },
      { maxWeight: 15, price: 31.99 },
      { maxWeight: 30, price: 39.59 },
    ];

    const poste =
      laposteRates.find((rate) => weight <= rate.maxWeight)?.price || 39.59;

    let droovoRate = 0.75;

    if (distance < 150) {
      droovoRate = 0.7;
    } else if (distance > 700) {
      droovoRate = 0.8;
    }

    const total = Math.max(4.9, poste * droovoRate);
    const commission = total * 0.22;
    const driver = total - commission;
    const saving = poste - total;
    const savingPercent = (saving / poste) * 100;

    return {
      total: total.toFixed(2),
      commission: commission.toFixed(2),
      driver: driver.toFixed(2),
      poste: poste.toFixed(2),
      saving: saving.toFixed(2),
      savingPercent: savingPercent.toFixed(0),
    };
  }, [weight, distance]);

  return (
    <main className="min-h-screen bg-[#F4F7F5] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-emerald-100 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
              <Truck size={24} />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight text-slate-950">
                Droovo
              </p>
              <p className="text-xs font-semibold text-slate-500">
                Livraison collaborative entre particuliers
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-7 text-sm font-bold text-slate-600 md:flex">
            <a href="#trajets" className="hover:text-emerald-700">
              Colis disponibles
            </a>
            <a href="#prix" className="hover:text-emerald-700">
              Prix & commission
            </a>
            <a href="#comparaison" className="hover:text-emerald-700">
              Comparaison
            </a>
            <a href="#securite" className="hover:text-emerald-700">
              Sécurité
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:border-emerald-600 hover:text-emerald-700"
            >
              Se connecter
            </a>

            <a
              href="/signup"
              className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
            >
              Créer un compte
            </a>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-white">
        <div className="absolute left-[-150px] top-[-150px] h-96 w-96 rounded-full bg-emerald-200/70 blur-3xl" />
        <div className="absolute bottom-[-180px] right-[-140px] h-96 w-96 rounded-full bg-lime-200/80 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-800 ring-1 ring-emerald-200">
              <Route size={16} /> Marseille → Paris · Trajet exemple
            </div>

            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.02] tracking-[-0.055em] text-slate-950 md:text-7xl">
              Transporte un colis sur ton trajet et gagne de l’argent.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Droovo connecte une personne qui veut envoyer un colis avec une
              personne qui fait déjà le même trajet. Le client paie moins cher,
              le colis arrive plus vite, et le livreur rentabilise son
              déplacement.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#declarer-trajet"
                className="rounded-full bg-emerald-600 px-7 py-4 text-sm font-black text-white shadow-xl shadow-emerald-600/25 transition hover:bg-emerald-700"
              >
                Déclarer mon trajet{" "}
                <ArrowRight className="ml-2 inline" size={16} />
              </a>
              <a
                href="#envoyer-colis"
                className="rounded-full border border-emerald-200 bg-white px-7 py-4 text-sm font-black text-slate-950 shadow-sm transition hover:border-emerald-600 hover:text-emerald-700"
              >
                Envoyer un colis
              </a>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              <MiniStat value="jusqu’à -30%" label="Économie client" />
              <MiniStat value="22%" label="Commission app" />
              <MiniStat value="5 à 12 €" label="Gain / colis" />
            </div>
          </div>

          <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/25 ring-4 ring-emerald-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black text-emerald-300">
                  Trajet déclaré
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  Marseille → Paris
                </h2>
                <p className="mt-2 text-sm text-white/50">
                  Conducteur vérifié · Départ aujourd’hui 17:30
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-400/15 p-3 text-emerald-300">
                <Car size={26} />
              </div>
            </div>

            <div className="mt-7 rounded-3xl bg-white p-5 text-slate-950">
              <div className="space-y-4">
                <RouteLine icon={MapPin} title="Départ" value="Marseille Centre" />
                <RouteLine icon={MapPin} title="Arrivée" value="Paris 11e" />
                <RouteLine
                  icon={Box}
                  title="Volume disponible"
                  value="Petit / moyen colis"
                />
                <RouteLine icon={Clock3} title="Livraison estimée" value="24h" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
                <p className="text-sm text-white/55">Gain livreur estimé</p>
                <p className="mt-2 text-3xl font-black text-emerald-300">
                  +10,06 €
                </p>
                <p className="mt-1 text-xs text-white/40">
                  pour un colis de 3 à 5 kg
                </p>
              </div>
              <div className="rounded-3xl bg-emerald-400/15 p-5 ring-1 ring-emerald-300/20">
                <p className="text-sm text-emerald-100/70">
                  Économie client
                </p>
                <p className="mt-2 text-3xl font-black text-emerald-200">
                  -25%
                </p>
                <p className="mt-1 text-xs text-emerald-100/50">
                  vs La Poste, selon le poids
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="trajets" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
              Marketplace
            </p>
            <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
              Colis disponibles sur ton trajet
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Une interface claire pour aider le livreur à comprendre
              immédiatement son gain, le prix client et la commission Droovo.
            </p>
          </div>
          <a
            href="/signup"
            className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-900 shadow-sm ring-1 ring-emerald-200 hover:bg-emerald-50"
          >
            Voir tous les colis
          </a>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {parcels.map((parcel) => (
            <ParcelCard key={parcel.title} parcel={parcel} />
          ))}
        </div>
      </section>

      <section id="prix" className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
              Moteur de prix
            </p>
            <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
              Prix client, gain livreur, commission app.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Le simulateur compare un tarif Droovo avec les prix Colissimo
              France métropolitaine. Le client voit son économie, le livreur
              voit son gain et Droovo conserve sa commission.
            </p>

            <div className="mt-8 rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
              <div className="space-y-6">
                <Slider
                  label="Poids du colis"
                  value={`${weight} kg`}
                  min={1}
                  max={20}
                  current={weight}
                  onChange={setWeight}
                />
                <Slider
                  label="Distance estimée"
                  value={`${distance} km`}
                  min={20}
                  max={900}
                  step={10}
                  current={distance}
                  onChange={setDistance}
                />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/20 ring-4 ring-emerald-100">
            <div className="grid gap-4 sm:grid-cols-2">
              <PriceBox
                label="Prix Droovo client"
                value={`${pricing.total} €`}
                icon={Euro}
                highlight
              />
              <PriceBox
                label="Prix La Poste estimé"
                value={`${pricing.poste} €`}
                icon={Package}
              />
              <PriceBox
                label="Gain livreur"
                value={`${pricing.driver} €`}
                icon={Car}
              />
              <PriceBox
                label="Commission Droovo"
                value={`${pricing.commission} €`}
                icon={CreditCard}
                highlight
              />
            </div>

            <div className="mt-5 rounded-3xl bg-emerald-400/15 p-5 ring-1 ring-emerald-300/20">
              <p className="text-sm text-emerald-100/70">
                Économie estimée pour le client
              </p>
              <p className="mt-2 text-5xl font-black text-emerald-200">
                -{pricing.savingPercent}%
              </p>
              <p className="mt-2 text-sm text-emerald-100/60">
                soit environ {pricing.saving} € économisés vs La Poste
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="comparaison" className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
          Positionnement
        </p>
        <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
          Droovo vs solutions classiques
        </h2>

        <div className="mt-8 overflow-hidden rounded-[1.75rem] bg-white shadow-xl shadow-slate-200/70 ring-1 ring-emerald-100">
          <div className="grid grid-cols-4 bg-slate-950 px-5 py-4 text-sm font-black text-white">
            <span>Critère</span>
            <span className="text-emerald-300">Droovo</span>
            <span>La Poste</span>
            <span>Express</span>
          </div>
          {comparison.map((row) => (
            <div
              key={row[0]}
              className="grid grid-cols-4 border-t border-slate-100 px-5 py-4 text-sm text-slate-700 odd:bg-white even:bg-emerald-50/35"
            >
              {row.map((cell, index) => (
                <span
                  key={cell}
                  className={
                    index === 1
                      ? "font-black text-emerald-700"
                      : index === 0
                      ? "font-black text-slate-950"
                      : ""
                  }
                >
                  {cell}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section id="securite" className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-emerald-600 p-8 text-white shadow-2xl shadow-emerald-600/25">
            <Euro size={34} />
            <h2 className="mt-5 text-4xl font-black tracking-tight">
              Pour le livreur
            </h2>
            <p className="mt-4 text-lg leading-8 text-emerald-50">
              Un particulier qui fait déjà un trajet peut gagner entre 5 € et
              12 € par colis. Sur plusieurs colis, le trajet devient réellement
              rentable sans créer un déplacement supplémentaire.
            </p>
            <div className="mt-7 rounded-3xl bg-white/15 p-5 ring-1 ring-white/20">
              <p className="text-sm text-emerald-50/80">
                Exemple de rentabilité
              </p>
              <p className="mt-2 text-3xl font-black">
                20 colis/mois = 110 € à 240 €
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-emerald-50 p-8 ring-1 ring-emerald-100">
            <ShieldCheck className="text-emerald-700" size={34} />
            <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950">
              Sécurité et confiance
            </h2>
            <div className="mt-7 grid gap-4">
              {[
                "Vérification d’identité",
                "Paiement sécurisé avant mise en relation",
                "Code de remise à la livraison",
                "Validation par l’expéditeur",
                "Notation des utilisateurs",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-emerald-100"
                >
                  <CheckCircle2 className="text-emerald-600" size={20} />
                  <span className="font-black text-slate-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-900/20 md:p-10">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-300">
                Prochaine étape
              </p>
              <h2 className="mt-2 text-4xl font-black tracking-tight">
                Transformer cette maquette en vraie application connectée.
              </h2>
              <p className="mt-4 max-w-2xl text-white/60">
                La prochaine version doit connecter les formulaires à Supabase,
                créer les vrais colis, enregistrer les trajets, calculer les
                prix et préparer Stripe.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FinalStat icon={Users} value="Users" label="Auth Supabase" />
              <FinalStat icon={Package} value="Colis" label="Base de données" />
              <FinalStat icon={CreditCard} value="Stripe" label="Paiements" />
              <FinalStat icon={BadgeCheck} value="Admin" label="Suivi plateforme" />
            </div>
          </div>
        </div>
      </section>

      <section id="connexion" className="mx-auto max-w-3xl px-6 py-24">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
            Connexion
          </p>

          <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            Accéder à son compte Droovo
          </h2>

          <p className="mt-4 text-slate-600">
            Connectez-vous pour publier un trajet, accepter un colis ou suivre
            vos livraisons.
          </p>

          <div className="mt-8 grid gap-4">
            <input
              type="email"
              placeholder="Adresse e-mail"
              className="rounded-2xl border border-emerald-100 px-5 py-4 outline-none focus:border-emerald-600"
            />

            <input
              type="password"
              placeholder="Mot de passe"
              className="rounded-2xl border border-emerald-100 px-5 py-4 outline-none focus:border-emerald-600"
            />

            <a
              href="/login"
              className="rounded-2xl bg-emerald-600 px-5 py-4 text-center font-black text-white hover:bg-emerald-700"
            >
              Se connecter
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function MiniStat({ value, label }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-emerald-100">
      <p className="text-2xl font-black text-emerald-700">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}

function RouteLine({ icon: Icon, title, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
        <Icon size={17} />
      </div>
      <div>
        <p className="text-xs font-black uppercase text-slate-400">{title}</p>
        <p className="font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function ParcelCard({ parcel }) {
  return (
    <div className="rounded-[1.75rem] bg-white p-6 shadow-xl shadow-slate-200/60 ring-1 ring-emerald-100 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-100">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
          <Package size={26} />
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
          {parcel.delay}
        </span>
      </div>
      <h3 className="text-xl font-black tracking-tight text-slate-950">
        {parcel.title}
      </h3>
      <p className="mt-2 text-sm font-bold text-slate-500">
        {parcel.from} → {parcel.to}
      </p>
      <p className="mt-1 text-sm text-slate-500">Poids : {parcel.weight}</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Data label="Prix Droovo" value={parcel.droovoPrice} green />
        <Data label="Prix La Poste" value={parcel.postePrice} />
        <Data label="Gain livreur" value={parcel.driverGain} green />
        <Data label="Commission app" value={parcel.commission} />
      </div>

      <a
        href="/signup"
        className="mt-6 block w-full rounded-full bg-emerald-600 px-5 py-4 text-center text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
      >
        Accepter ce colis
      </a>
    </div>
  );
}

function Data({ label, value, green }) {
  return (
    <div
      className={`rounded-2xl p-4 ring-1 ${
        green ? "bg-emerald-50 ring-emerald-100" : "bg-slate-50 ring-slate-100"
      }`}
    >
      <p className="text-xs font-black text-slate-400">{label}</p>
      <p
        className={`mt-1 text-lg font-black ${
          green ? "text-emerald-700" : "text-slate-950"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Slider({ label, value, min, max, step = 1, current, onChange }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm font-black text-slate-700">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <input
        className="w-full accent-emerald-600"
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function PriceBox({ label, value, icon: Icon, highlight }) {
  return (
    <div
      className={`rounded-3xl p-5 ${
        highlight
          ? "bg-emerald-400/15 text-emerald-100 ring-1 ring-emerald-300/20"
          : "bg-white/10 text-white ring-1 ring-white/10"
      }`}
    >
      <Icon size={22} />
      <p className="mt-4 text-sm opacity-65">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function FinalStat({ icon: Icon, value, label }) {
  return (
    <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
      <Icon className="text-emerald-300" size={22} />
      <p className="mt-4 text-lg font-black">{value}</p>
      <p className="mt-1 text-xs text-white/45">{label}</p>
    </div>
  );
}
