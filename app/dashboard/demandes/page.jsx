"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function DemandesPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        packages (*),
        trips (*)
      `)
      .eq("driver_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      alert("Erreur : " + error.message);
    }

    setRequests(data || []);
    setLoading(false);
  }

  async function updateRequest(id, status) {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert("Erreur : " + error.message);
      return;
    }

    alert(status === "accepted" ? "Demande acceptée." : "Demande refusée.");
    loadRequests();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F4F7F5] p-10">
        <p className="text-xl font-black">Chargement...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F7F5] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
            Demandes
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            Demandes de transport reçues
          </h1>

          <p className="mt-2 text-slate-600">
            Acceptez ou refusez les demandes liées à vos trajets.
          </p>
        </div>

        <div className="grid gap-6">
          {requests.length === 0 && (
            <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-emerald-100">
              <p className="text-lg font-bold text-slate-700">
                Aucune demande reçue pour le moment.
              </p>
            </div>
          )}

          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">
                    {request.packages?.title || "Colis"}
                  </h2>

                  <p className="mt-2 text-slate-600">
                    {request.packages?.departure_city} →{" "}
                    {request.packages?.arrival_city}
                  </p>

                  <p className="mt-2 text-slate-500">
                    {request.packages?.weight} kg · {request.packages?.price} €
                  </p>

                  <p className="mt-2 text-slate-500">
                    Date :{" "}
                    {request.packages?.desired_date
                      ? new Date(request.packages.desired_date).toLocaleDateString("fr-FR")
                      : "Non renseignée"}
                  </p>
                </div>

                <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">
                  {request.status}
                </span>
              </div>

              {request.status === "pending" && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => updateRequest(request.id, "accepted")}
                    className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700"
                  >
                    Accepter
                  </button>

                  <button
                    onClick={() => updateRequest(request.id, "rejected")}
                    className="rounded-full border border-red-200 bg-white px-5 py-3 text-sm font-black text-red-600 hover:bg-red-50"
                  >
                    Refuser
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
