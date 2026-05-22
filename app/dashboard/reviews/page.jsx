"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

export default function ReviewsPage() {
  const [profiles, setProfiles] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    const { data } = await supabase
      .from("profiles")
      .select("id,email")
      .neq("role", "admin");

    setProfiles(data || []);
  }

  async function submitReview(e) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("reviews")
      .insert({
        reviewer_id: user.id,
        reviewed_user_id: selectedUser,
        rating,
        comment,
      });

    if (!error) {
      setSuccess(true);
      setComment("");
      setRating(5);
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F7F5] px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-emerald-100">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
          Avis utilisateurs
        </p>

        <h1 className="mt-2 text-4xl font-black text-slate-950">
          Laisser un avis
        </h1>

        {success && (
          <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm font-black text-emerald-700">
            Avis envoyé avec succès.
          </div>
        )}

        <form onSubmit={submitReview} className="mt-8 space-y-5">
          <select
            required
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 outline-none"
          >
            <option value="">
              Sélectionner un utilisateur
            </option>

            {profiles.map((profile) => (
              <option
                key={profile.id}
                value={profile.id}
              >
                {profile.email}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
              >
                <Star
                  size={32}
                  className={
                    star <= rating
                      ? "fill-emerald-500 text-emerald-500"
                      : "text-slate-300"
                  }
                />
              </button>
            ))}
          </div>

          <textarea
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Votre commentaire..."
            rows={5}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 outline-none"
          />

          <button
            type="submit"
            className="rounded-2xl bg-emerald-600 px-6 py-4 font-black text-white"
          >
            Envoyer l’avis
          </button>
        </form>
      </div>
    </main>
  );
}
