import Link from "next/link";
import { supabase } from "../../../../lib/supabaseClient";

export default async function ColisDetailPage({ params }) {
  const { id } = params;

  const { data: colis, error } = await supabase
    .from("packages")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !colis) {
    return (
      <main className="min-h-screen bg-[#F4F7F5] p-8">
        <Link href="/dashboard/mes-colis" className="font-bold text-emerald-700">
          ← Retour
        </Link>
        <div className="mt-8 rounded-[2rem] bg-white p-8">
          <h1 className="text-2xl font-black">Colis introuvable</h1>
          <p className="mt-2 text-slate-600">
            Ce colis n’existe pas ou n’est plus disponible.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F7F5] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard/mes-colis"
          className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200"
        >
          ← Retour aux colis
        </Link>

        <section className="mt-8 rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
            Détail du colis
          </p>

          <h1 className="mt-3 text-4xl font-black text-slate-950">
            {colis.title || "Colis"}
          </h1>

          <p className="mt-3 text-slate-600">
            {colis.departure_city || "Départ à compléter"} →{" "}
            {colis.arrival_city || "Arrivée à compléter"}
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Info label="Ville de départ" value={colis.departure_city} />
            <Info label="Ville d’arrivée" value={colis.arrival_city} />
            <Info label="Date souhaitée" value={formatDate(colis.delivery_date)} />
            <Info label="Prix proposé" value={colis.price ? `${colis.price} €` : null} />
            <Info label="Taille" value={colis.size} />
            <Info label="Poids" value={colis.weight ? `${colis.weight} kg` : null} />
            <Info label="Statut" value={colis.status || "Publié"} />
            <Info label="Urgence" value={colis.urgency} />
          </div>

          {colis.description && (
            <div className="mt-8 rounded-2xl bg-slate-50 p-5">
              <h2 className="font-black text-slate-950">Description</h2>
              <p className="mt-2 text-slate-600">{colis.description}</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-black text-slate-950">
        {value || "Non renseigné"}
      </p>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "Non renseigné";
  return new Date(date).toLocaleDateString("fr-FR");
}
