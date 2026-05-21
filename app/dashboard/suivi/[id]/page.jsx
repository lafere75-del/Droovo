import Link from "next/link";
import { supabase } from "../../../../lib/supabaseClient";

export default async function SuiviPage({ params }) {
  const { id } = params;

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      *,
      packages (*),
      trips (*)
    `)
    .eq("id", id)
    .maybeSingle();

  const { data: events = [] } = await supabase
    .from("tracking_events")
    .select("*")
    .eq("booking_id", id)
    .order("created_at", { ascending: true });

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-[#F4F7F5] p-8">
        <Link href="/dashboard" className="font-bold text-emerald-700">
          ← Retour
        </Link>

        <div className="mt-8 rounded-[2rem] bg-white p-8">
          <h1 className="text-2xl font-black">Suivi introuvable</h1>
          <p className="mt-2 text-slate-600">
            Aucun suivi n’a été trouvé pour cette livraison.
          </p>
        </div>
      </main>
    );
  }

  const currentStatus = booking.tracking_status || "booking_created";

  return (
    <main className="min-h-screen bg-[#F4F7F5] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
        >
          ← Retour dashboard
        </Link>

        <section className="mt-8 rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
            Suivi de livraison
          </p>

          <h1 className="mt-3 text-4xl font-black text-slate-950">
            {booking.packages?.title || "Colis"}
          </h1>

          <p className="mt-3 text-slate-600">
            {booking.packages?.departure_city || "Départ"} →{" "}
            {booking.packages?.arrival_city || "Arrivée"}
          </p>

          <div className="mt-6 rounded-2xl bg-emerald-50 p-5">
            <p className="text-sm font-bold text-emerald-700">
              Statut actuel
            </p>
            <p className="mt-1 text-2xl font-black text-emerald-900">
              {formatStatus(currentStatus)}
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Info
              label="Expéditeur"
              value={booking.sender_id ? booking.sender_id.slice(0, 8) + "..." : null}
            />
            <Info
              label="Transporteur"
              value={booking.driver_id ? booking.driver_id.slice(0, 8) + "..." : null}
            />
            <Info label="Paiement" value={booking.payment_status || "pending"} />
            <Info label="Réservation" value={booking.status || "pending"} />
            <Info
              label="Prix"
              value={booking.packages?.price ? `${booking.packages.price} €` : null}
            />
            <Info
              label="Date souhaitée"
              value={formatDate(booking.packages?.desired_date)}
            />
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-emerald-100">
          <h2 className="text-2xl font-black text-slate-950">
            Historique du suivi
          </h2>

          <div className="mt-6 space-y-4">
            {events.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-5 text-slate-600">
                Aucun événement de suivi pour le moment.
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-emerald-100 bg-slate-50 p-5"
                >
                  <p className="font-black text-slate-950">
                    {formatStatus(event.status)}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {event.message || "Mise à jour du suivi"}
                  </p>

                  <p className="mt-2 text-xs font-bold text-slate-400">
                    {formatDateTime(event.created_at)}
                  </p>
                </div>
              ))
            )}
          </div>
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

function formatStatus(status) {
  const labels = {
    booking_created: "Demande créée",
    accepted: "Acceptée",
    paid: "Payée",
    picked_up: "Colis récupéré",
    in_transit: "En cours de livraison",
    delivered: "Livré",
    cancelled: "Annulé",
    dispute: "Litige",
  };

  return labels[status] || status;
}

function formatDate(date) {
  if (!date) return "Non renseigné";
  return new Date(date).toLocaleDateString("fr-FR");
}

function formatDateTime(date) {
  if (!date) return "Non renseigné";
  return new Date(date).toLocaleString("fr-FR");
}
