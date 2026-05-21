"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function PropositionsPage() {
  const [propositions, setPropositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPropositions();
  }, []);

  async function loadPropositions() {
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
      .eq("sender_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      alert("Erreur : " + error.message);
    }

    setPropositions(data || []);
    setLoading(false);
  }

  async function updateProposal(proposal, status) {
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", proposal.id);

      if (error) {
        throw error;
      }

      if (status === "accepted") {
        await supabase
          .from("packages")
          .update({ status: "accepted" })
          .eq("id", proposal.package_id);
      }

      if (status === "rejected") {
        await supabase
          .from("packages")
          .update({ status: "active" })
          .eq("id", proposal.package_id);
      }

      alert(status === "accepted" ? "Proposition acceptée." : "Proposition refusée.");

      await loadPropositions();
    } catch (error) {
      alert("Erreur : " + error.message);
    }

    setActionLoading(false);
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
            Propositions
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            Transporteurs intéressés
          </h1>

          <p className="mt-2 text-slate-600">
            Acceptez ou refusez les propositions reçues pour vos colis.
          </p>
        </div>

        <div className="grid gap-6">
          {propositions.length === 0 && (
            <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-emerald-100">
              <p className="text-lg font-bold text-slate-700">
                Aucune proposition reçue pour le moment.
              </p>
            </div>
          )}

          {propositions.map((proposal) => (
            <div
              key={proposal.id}
              className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">
                    {proposal.packages?.title || "Colis"}
                  </h2>

                  <p className="mt-2 text-slate-600">
                    Colis : {proposal.packages?.departure_city} →{" "}
                    {proposal.packages?.arrival_city}
                  </p>

                  <p className="mt-2 text-slate-500">
                    Trajet proposé : {proposal.trips?.departure_city} →{" "}
                    {proposal.trips?.arrival_city}
                  </p>

                  <p className="mt-2 text-slate-500">
                    Date :{" "}
                    {proposal.trips?.trip_date
                      ? new Date(proposal.trips.trip_date).toLocaleDateString("fr-FR")
                      : "Non renseignée"}
                  </p>

                  <p className="mt-2 text-slate-500">
                    Prix : {proposal.packages?.price || 0} €
                  </p>
                </div>

                <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">
                  {proposal.status}
                </span>
              </div>

              {proposal.status === "pending" && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    disabled={actionLoading}
                    onClick={() => updateProposal(proposal, "accepted")}
                    className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {actionLoading ? "Traitement..." : "Accepter"}
                  </button>

                  <button
                    disabled={actionLoading}
                    onClick={() => updateProposal(proposal, "rejected")}
                    className="rounded-full border border-red-200 bg-white px-5 py-3 text-sm font-black text-red-600 hover:bg-red-50 disabled:opacity-60"
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
