"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function CreatePackagePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Vous devez être connecté.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("packages").insert({
      user_id: user.id,
      title,
      description,
      from_city: fromCity,
      to_city: toCity,
      weight,
      price,
    });

    setLoading(false);

    if (error) {
      alert("Erreur : " + error.message);
      return;
    }

    alert("Colis publié avec succès.");

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#F4F7F5] px-6 py-10">
      <div className="mx-auto max-w-3xl">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
              Dashboard
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
              Envoyer un colis
            </h1>

            <p className="mt-2 text-slate-600">
              Publiez votre demande de livraison sur Droovo.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-2xl border border-emerald-100 bg-white px-5 py-3 font-black text-slate-900"
          >
            Retour dashboard
          </button>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100">
          <form onSubmit={handleSubmit} className="grid gap-5">

            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                Titre du colis
              </label>

              <input
                required
                type="text"
                placeholder="Ex : Colis vêtements"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-emerald-100 px-5 py-4 outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                Description
              </label>

              <textarea
                placeholder="Ajoutez des détails sur le colis..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] w-full rounded-2xl border border-emerald-100 px-5 py-4 outline-none focus:border-emerald-600"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Ville de départ
                </label>

                <input
                  required
                  type="text"
                  placeholder="Marseille"
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  className="w-full rounded-2xl border border-emerald-100 px-5 py-4 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Ville d’arrivée
                </label>

                <input
                  required
                  type="text"
                  placeholder="Paris"
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  className="w-full rounded-2xl border border-emerald-100 px-5 py-4 outline-none focus:border-emerald-600"
                />
              </div>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Poids estimé (kg)
                </label>

                <input
                  type="number"
                  placeholder="3"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full rounded-2xl border border-emerald-100 px-5 py-4 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Prix proposé (€)
                </label>

                <input
                  type="number"
                  placeholder="12"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-2xl border border-emerald-100 px-5 py-4 outline-none focus:border-emerald-600"
                />
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 rounded-2xl bg-emerald-600 px-5 py-4 font-black text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "Publication..." : "Publier le colis"}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}
