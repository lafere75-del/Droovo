"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function VerificationPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");

  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [rib, setRib] = useState(null);

  const [loading, setLoading] = useState(false);

  async function uploadFile(file, path) {
    const { error } = await supabase.storage
      .from("identity-documents")
      .upload(path, file);

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from("identity-documents")
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Utilisateur non connecté.");
        return;
      }

      const timestamp = Date.now();

      const idFrontUrl = await uploadFile(
        idFront,
        `${user.id}/id-front-${timestamp}`
      );

      const idBackUrl = await uploadFile(
        idBack,
        `${user.id}/id-back-${timestamp}`
      );

      const selfieUrl = await uploadFile(
        selfie,
        `${user.id}/selfie-${timestamp}`
      );

      const ribUrl = await uploadFile(
        rib,
        `${user.id}/rib-${timestamp}`
      );

      const { error } = await supabase
        .from("identity_verifications")
        .insert({
          user_id: user.id,
          full_legal_name: fullName,
          id_front_url: idFrontUrl,
          id_back_url: idBackUrl,
          selfie_url: selfieUrl,
          rib_url: ribUrl,
          status: "pending",
        });

      if (error) {
        throw error;
      }

      alert("Documents envoyés avec succès.");

      router.push("/dashboard");

    } catch (error) {
      alert(error.message);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#F4F7F5] px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-emerald-100">

        <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
          Vérification
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
          Vérification d’identité
        </h1>

        <p className="mt-3 text-slate-600">
          Ajoutez vos documents pour débloquer toutes les fonctionnalités Droovo.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">

          <input
            required
            type="text"
            placeholder="Nom légal complet"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-2xl border border-emerald-100 px-5 py-4"
          />

          <FileInput
            label="Carte d’identité recto"
            onChange={setIdFront}
          />

          <FileInput
            label="Carte d’identité verso"
            onChange={setIdBack}
          />

          <SelfieInput
            label="Selfie en direct"
            onChange={setSelfie}
          />

          <FileInput
            label="RIB au même nom"
            onChange={setRib}
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-emerald-600 px-5 py-4 font-black text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Envoi..." : "Envoyer les documents"}
          </button>

        </form>
      </div>
    </main>
  );
}

function FileInput({ label, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </label>

      <input
        required
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => onChange(e.target.files[0])}
        className="w-full rounded-2xl border border-emerald-100 bg-white px-5 py-4"
      />
    </div>
  );
}

function SelfieInput({ label, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </label>

      <input
        required
        type="file"
        accept="image/*"
        capture="user"
        onChange={(e) => onChange(e.target.files[0])}
        className="w-full rounded-2xl border border-emerald-100 bg-white px-5 py-4"
      />

      <p className="mt-2 text-sm text-slate-500">
        Le selfie doit être pris en direct avec la caméra du téléphone.
      </p>
    </div>
  );
}
