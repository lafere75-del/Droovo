"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
const ALLOWED_DOCUMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
]);

function getSafeExtension(file) {
  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "application/pdf": "pdf",
  };

  return extensions[file.type];
}

export default function VerificationPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");

  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [selfie, setSelfie] = useState(null);

  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    loadVerificationStatus();
  }, []);

  async function loadVerificationStatus() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("identity_status")
      .eq("id", user.id)
      .maybeSingle();

    setVerificationStatus(data?.identity_status || null);
  }

  async function uploadFile(file, path) {
    if (!file) {
      throw new Error("Fichier manquant.");
    }

    if (!ALLOWED_DOCUMENT_TYPES.has(file.type)) {
      throw new Error("Format refusé. Utilisez un fichier JPG, PNG ou PDF.");
    }

    if (file.size > MAX_DOCUMENT_SIZE) {
      throw new Error("Chaque document doit faire moins de 10 Mo.");
    }

    const finalPath = `${path}.${getSafeExtension(file)}`;

    const { error } = await supabase.storage
      .from("identity-documents")
      .upload(finalPath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      throw error;
    }

    return finalPath;
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
        setLoading(false);
        return;
      }

      const timestamp = Date.now();

      const idFrontPath = await uploadFile(
        idFront,
        `${user.id}/id-front-${timestamp}`
      );

      const idBackPath = await uploadFile(
        idBack,
        `${user.id}/id-back-${timestamp}`
      );

      const selfiePath = await uploadFile(
        selfie,
        `${user.id}/selfie-${timestamp}`
      );

      const { error } = await supabase
        .from("identity_verifications")
        .insert({
          user_id: user.id,
          full_legal_name: fullName,
          id_front_url: idFrontPath,
          id_back_url: idBackPath,
          selfie_url: selfiePath,
          status: "pending",
        });

      if (error) {
        throw error;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          identity_status: "pending",
          fullname: fullName,
        })
        .eq("id", user.id);

      if (profileError) {
        throw profileError;
      }

      setVerificationStatus("pending");

      alert(
        "Documents envoyés avec succès. Votre compte est en cours de vérification."
      );

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
          Votre carte et votre RIB seront ensuite associés à cette identité vérifiée.
        </p>

        {verificationStatus === "pending" && (
          <div className="mt-6 rounded-2xl bg-amber-100 p-4 text-sm font-black text-amber-700">
            Vos documents sont en cours de vérification.
          </div>
        )}

        {verificationStatus === "verified" && (
          <div className="mt-6 rounded-2xl bg-emerald-100 p-4 text-sm font-black text-emerald-700">
            Votre identité a été vérifiée.
          </div>
        )}

        {verificationStatus === "rejected" && (
          <div className="mt-6 rounded-2xl bg-red-100 p-4 text-sm font-black text-red-700">
            Votre vérification a été refusée. Merci de renvoyer des documents valides.
          </div>
        )}

        {verificationStatus !== "verified" && (
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
              capture="environment"
              onChange={setIdFront}
            />

            <FileInput
              label="Carte d’identité verso"
              capture="environment"
              onChange={setIdBack}
            />

            <SelfieInput label="Selfie" capture="user" onChange={setSelfie} />

            <button
              type="submit"
              disabled={loading || verificationStatus === "pending"}
              className="rounded-2xl bg-emerald-600 px-5 py-4 font-black text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading
                ? "Envoi..."
                : verificationStatus === "pending"
                ? "Documents en cours de vérification"
                : "Envoyer les documents"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

function FileInput({ label, capture, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </label>

      <input
        capture={capture}
        required
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="w-full rounded-2xl border border-emerald-100 bg-white px-5 py-4"
      />
    </div>
  );
}

function SelfieInput({ label, capture, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </label>

      <input
        capture={capture}
        required
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="w-full rounded-2xl border border-emerald-100 bg-white px-5 py-4"
      />

      <p className="mt-2 text-sm text-slate-500">
        Ajoutez une photo récente de vous pour confirmer votre identité.
      </p>
    </div>
  );
}
