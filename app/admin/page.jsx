import Link from "next/link";
import {
  BadgeCheck,
  Box,
  Car,
  CreditCard,
  FileCheck2,
  ShieldAlert,
  TrendingUp,
  Users,
} from "lucide-react";

export default function AdminPage() {
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
              Suivi des utilisateurs, colis, trajets, vérifications et commissions.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white"
          >
            Retour accueil
          </Link>
        </header>

        <section className="mt-6 grid gap-5 md:grid-cols-4">
          <Stat icon={Users} label="Utilisateurs" value="0" />
          <Stat icon={ShieldAlert} label="À vérifier" value="0" />
          <Stat icon={Box} label="Colis actifs" value="0" />
          <Stat icon={CreditCard} label="Commissions" value="0 €" />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel title="Nouveaux inscrits" icon={Users}>
            <Empty text="Aucun nouvel utilisateur pour le moment." />
          </Panel>

          <Panel title="Vérifications d’identité" icon={FileCheck2}>
            <AdminRow
              title="Exemple utilisateur"
              text="Pièce d’identité + photo visage en attente"
              tag="En attente"
            />
          </Panel>

          <Panel title="Colis publiés" icon={Box}>
            <AdminRow
              title="Colis exemple"
              text="Ville de départ → Ville d’arrivée · 3 kg · 12,90 €"
              tag="Actif"
            />
          </Panel>

          <Panel title="Trajets déclarés" icon={Car}>
            <AdminRow
              title="Trajet exemple"
              text="Ville de départ → Ville d’arrivée · volume disponible"
              tag="Disponible"
            />
          </Panel>

          <Panel title="Flux financiers" icon={TrendingUp}>
            <AdminRow
              title="Transaction exemple"
              text="Client 12,90 € · livreur 10,06 € · commission 2,84 €"
              tag="Simulation"
            />
          </Panel>

          <Panel title="Actions admin" icon={BadgeCheck}>
            <div className="grid gap-3">
              <button className="rounded-2xl bg-emerald-600 px-5 py-4 text-left font-black text-white">
                Valider une identité
              </button>
              <button className="rounded-2xl bg-slate-950 px-5 py-4 text-left font-black text-white">
                Voir tous les paiements
              </button>
              <button className="rounded-2xl bg-white px-5 py-4 text-left font-black text-slate-950 ring-1 ring-emerald-100">
                Exporter les données
              </button>
            </div>
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

function Panel({ title, icon: Icon, children }) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-emerald-100">
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

function AdminRow({ title, text, tag }) {
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
