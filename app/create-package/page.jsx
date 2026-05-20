"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

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
    <main className="min-h-screen bg-[#F4F7F5] px-6 py-12">
      <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100">
        <h1 className="text-4xl font-black tracking-tight text-slate-950">
          Envoyer un colis
        </h1>

        <p className="mt-3 text-slate-600">
          Publiez votre demande de livraison sur Droovo.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-4">

          <input
            required
            type="text"
            placeholder="Titre du colis"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-2xl border border-emerald-100 px-5 py-4"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-2xl border border-emerald-100 px-5 py-4"
          />

          <input
            required
            type="text"
            placeholder="Ville de départ"
            value={fromCity}
            onChange={(e) => setFromCity(e.target.value)}
            className="rounded-2xl border border-emerald-100 px-5 py-4"
          />

          <input
            required
            type="text"
            placeholder="Ville d'arrivée"
            value={toCity}
            onChange={(e) => setToCity(e.target.value)}
            className="rounded-2xl border border-emerald-100 px-5 py-4"
          />

          <input
            type="number"
            placeholder="Poids (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="rounded-2xl border border-emerald-100 px-5 py-4"
          />

          <input
            type="number"
            placeholder="Prix proposé (€)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="rounded-2xl border border-emerald-100 px-5 py-4"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-emerald-600 px-5 py-4 font-black text-white"
          >
            {loading ? "Publication..." : "Publier le colis"}
          </button>
        </form>
      </div>
    </main>
  );
}
