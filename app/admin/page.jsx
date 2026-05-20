import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import {
  Users,
  ShieldAlert,
  BadgeCheck,
  CreditCard,
  Search,
  Clock3,
  UserX,
  Package,
  Car,
  TrendingUp,
} from "lucide-react";

export default async function AdminPage({ searchParams }) {
  const status = searchParams?.status || "all";
  const q = searchParams?.q || "";
  const page = Number(searchParams?.page || 1);
  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status !== "all") {
    query = query.eq("identity_status", status);
  }

  if (q) {
    query = query.or(`fullname.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: profiles = [], count = 0 } = await query;

  const { count: totalUsers = 0 } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: pendingUsers = 0 } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("identity_status", "pending");

  const { count: verifiedUsers = 0 } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("identity_status", "verified");

  const totalPages = Math.max(1, Math.ceil((count || 0) / limit));

  return (
    <main className="min-h-screen bg-[#F4F7F5] px-6 py-8 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-emerald-100">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
                Back-office
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight">
                Admin Droovo
              </h1>
              <p className="mt-2 text-slate-600">
                Vue rapide des utilisateurs, vérifications, colis, trajets et flux financiers.
              </p>
            </div>

            <Link
              href="/"
              className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-black text-white"
            >
              Retour accueil
            </Link>
          </div>
        </header>

        <section className="mt-6 grid gap-5 md:grid-cols-4">
          <Stat icon={Users} label="Utilisateurs" value={totalUsers} />
          <Stat icon={ShieldAlert} label="À vérifier" value={pendingUsers} warning />
          <Stat icon={BadgeCheck} label="Comptes validés" value={verifiedUsers} />
          <Stat icon={CreditCard} label="Commissions" value="0 €" />
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-4">
          <QuickCard icon={Package} title="Colis actifs" value="0" text="Table packages à connecter" />
          <QuickCard icon={Car} title="Trajets actifs" value="0" text="Table trips à connecter" />
          <QuickCard icon={TrendingUp} title="Volume brut" value="0 €" text="Stripe à connecter" />
          <QuickCard icon={Clock3} title="Aujourd’hui" value="0" text="Activité du jour" />
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-emerald-100">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Gestion des utilisateurs
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Recherche, filtre et suivi des statuts d’identité.
              </p>
            </div>

            <form className="flex flex-col gap-3 md:flex-row">
              <div className="flex items-center gap-2 rounded-full bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                <Search size={18} className="text-slate-400" />
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Rechercher nom ou email"
                  className="bg-transparent text-sm outline-none"
                />
              </div>

              <select
                name="status"
                defaultValue={status}
                className="rounded-full bg-slate-50 px-4 py-3 text-sm font-bold outline-none ring-1 ring-slate-200"
              >
                <option value="all">Tous</option>
                <option value="pending">À vérifier</option>
                <option value="verified">Vérifiés</option>
                <option value="rejected">Refusés</option>
              </select>

              <button className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white">
                Filtrer
              </button>
            </form>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl ring-1 ring-slate-100">
            <div className="grid grid-cols-5 bg-slate-950 px-4 py-3 text-sm font-black text-white">
              <span>Utilisateur</span>
              <span>Email</span>
              <span>Statut identité</span>
              <span>Inscription</span>
              <span>Action</span>
            </div>

            {profiles.length === 0 ? (
              <div className="p-6 text-sm font-bold text-slate-500">
                Aucun utilisateur trouvé.
              </div>
            ) : (
              profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="grid grid-cols-5 items-center border-t border-slate-100 px-4 py-4 text-sm"
                >
                  <div>
                    <p className="font-black text-slate-950">
                      {profile.fullname || "Nom non renseigné"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      ID : {profile.id.slice(0, 8)}...
                    </p>
                  </div>

                  <span className="text-slate-600">{profile.email}</span>

                  <span>
                    <Status status={profile.identity_status} />
                  </span>

                  <span className="text-slate-500">
                    {profile.created_at
                      ? new Date(profile.created_at).toLocaleDateString("fr-FR")
                      : "-"}
                  </span>

                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-700">
                      Voir
                    </button>
                    <button className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">
                      Détail
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-500">
              Page {page} / {totalPages} · {count || 0} résultat(s)
            </p>

            <div className="flex gap-2">
              <PageLink page={page - 1} disabled={page <= 1} q={q} status={status}>
                Précédent
              </PageLink>
              <PageLink page={page + 1} disabled={page >= totalPages} q={q} status={status}>
                Suivant
              </PageLink>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel title="Comptes à vérifier" icon={ShieldAlert}>
            {profiles.filter((p) => p.identity_status === "pending").length === 0 ? (
              <Empty text="Aucun compte à vérifier sur cette page." />
            ) : (
              profiles
                .filter((p) => p.identity_status === "pending")
                .map((profile) => (
                  <AdminRow
                    key={profile.id}
                    title={profile.fullname || "Utilisateur"}
                    text={`${profile.email} · pièce d’identité à contrôler`}
                    tag="En attente"
                    warning
                  />
                ))
            )}
          </Panel>

          <Panel title="Alertes de gestion" icon={UserX}>
            <AdminRow
              title="Accès admin non sécurisé"
              text="Il faudra limiter /admin aux comptes ayant le rôle admin."
              tag="Important"
              warning
            />
            <AdminRow
              title="Paiements non connectés"
              text="Stripe doit être ajouté pour suivre commissions et reversements."
              tag="À faire"
            />
          </Panel>
        </section>
      </div>
    </main>
  );
}

function Stat({ icon: Icon, label, value, warning }) {
  return (
    <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-emerald-100">
      <Icon className={warning ? "text-amber-600" : "text-emerald-700"} size={24} />
      <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function QuickCard({ icon: Icon, title, value, text }) {
  return (
    <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-emerald-100">
      <div className="flex items-center justify-between">
        <Icon className="text-emerald-700" size={23} />
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
          Bientôt
        </span>
      </div>
      <p className="mt-4 text-sm font-bold text-slate-500">{title}</p>
      <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-2 text-xs font-bold text-slate-400">{text}</p>
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

function Status({ status }) {
  const config = {
    verified: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    pending: "bg-amber-100 text-amber-700",
  };

  const label = {
    verified: "Vérifié",
    rejected: "Refusé",
    pending: "À vérifier",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black ${
        config[status] || config.pending
      }`}
    >
      {label[status] || "À vérifier"}
    </span>
  );
}

function AdminRow({ title, text, tag, warning }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
      <div>
        <p className="font-black text-slate-950">{title}</p>
        <p className="mt-1 text-sm text-slate-600">{text}</p>
      </div>
      <span
        className={`rounded-full px-3 py-1 text-xs font-black ${
          warning
            ? "bg-amber-100 text-amber-700"
            : "bg-emerald-100 text-emerald-700"
        }`}
      >
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

function PageLink({ page, disabled, q, status, children }) {
  const href = `/admin?page=${page}&q=${encodeURIComponent(q)}&status=${status}`;

  if (disabled) {
    return (
      <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-400">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white"
    >
      {children}
    </Link>
  );
}
