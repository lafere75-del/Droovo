import Link from "next/link";
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
                  Vous pouvez consulter votre espace, mais vous devez faire
                  vérifier votre identité avant de publier un colis ou déclarer
                  un trajet.
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
          <Stat icon={Package} label="Mes colis" value="0" />
          <Stat icon={Car} label="Mes trajets" value="0" />
          <Stat icon={CreditCard} label="Paiements" value="0 €" />
          <Stat icon={BadgeCheck} label="Statut" value="À vérifier" />
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
            icon={FileCheck2}
            title="Vérification d’identité"
            text="Ajoutez votre pièce d’identité et une photo du visage."
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
            text="Modifier mes informations personnelles et mon rôle."
            href="/dashboard/profil"
          />
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
