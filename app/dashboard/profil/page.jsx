"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, CircleHelp, CreditCard, Landmark, ShieldCheck, UserRound } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

export default function ProfilPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState(null);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    city: "",
    photo_url: "",
    travel_mode: "",
    bio: "",
    verified_identity: false,
    verified_email: false,
    verified_phone: false,
  });

  const reviews = [];

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Erreur profil :", error);
    }

    if (data) {
      setProfileId(data.id);
      setProfile({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone: data.phone || "",
        city: data.city || "",
        photo_url: data.photo_url || "",
        travel_mode: data.travel_mode || "",
        bio: data.bio || "",
        verified_identity: data.verified_identity || false,
        verified_email: data.verified_email || false,
        verified_phone: data.verified_phone || false,
      });
    }

    setLoading(false);
  }

  async function saveProfile() {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      alert("Vous devez être connecté.");
      return;
    }

    const payload = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      phone: profile.phone,
      city: profile.city,
      photo_url: profile.photo_url,
      travel_mode: profile.travel_mode,
      bio: profile.bio,
    };

    let error;

    if (profileId) {
      const result = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", user.id);

      error = result.error;
    } else {
      const result = await supabase
        .from("profiles")
        .insert([{ ...payload, id: user.id }])
        .select()
        .single();

      error = result.error;

      if (result.data) {
        setProfileId(result.data.id);
      }
    }

    if (error) {
      console.error("Erreur sauvegarde profil :", error);
      alert("Impossible d’enregistrer le profil.");
      return;
    }

    setIsEditing(false);
  }

  function handleChange(field, value) {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function deleteAccount() {
    const confirmation = window.prompt(
      "Cette action est définitive. Tapez SUPPRIMER pour confirmer."
    );
    if (confirmation !== "SUPPRIMER") return;

    setDeletingAccount(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({ confirmation }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Suppression impossible.");
      await supabase.auth.signOut();
      window.location.assign("/");
    } catch (error) {
      alert(error.message);
      setDeletingAccount(false);
    }
  }

  const fullName =
    profile.first_name || profile.last_name
      ? `${profile.first_name} ${profile.last_name}`.trim()
      : "Profil utilisateur";

  const initials =
    profile.first_name || profile.last_name
      ? `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase()
      : "?";

  const completionItems = [
    profile.first_name,
    profile.last_name,
    profile.email,
    profile.phone,
    profile.city,
    profile.photo_url,
    profile.travel_mode,
    profile.bio,
  ];

  const completionRate = Math.round(
    (completionItems.filter(Boolean).length / completionItems.length) * 100
  );

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return null;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f7fb] p-6">
        <p className="text-sm text-gray-500">Chargement du profil...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
              Mon espace
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Profil et préférences
            </h1>
            <p className="mt-2 text-slate-600">
              Gérez vos informations, vos paiements et votre sécurité.
            </p>
          </div>
          <button
            onClick={() => (isEditing ? saveProfile() : setIsEditing(true))}
            className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            {isEditing ? "Enregistrer" : "Modifier le profil"}
          </button>
        </div>

        <section className="rounded-[32px] bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-4xl font-bold text-gray-500">
                {profile.photo_url ? (
                  <img
                    src={profile.photo_url}
                    alt="Photo de profil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              {isEditing && (
                <input
                  type="text"
                  value={profile.photo_url}
                  placeholder="URL de la photo"
                  onChange={(e) => handleChange("photo_url", e.target.value)}
                  className="w-56 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-black"
                />
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-950">
                  {fullName}
                </h1>

                {profile.verified_identity ? (
                  <span className="rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-700">
                    Identité vérifiée
                  </span>
                ) : (
                  <span className="rounded-full bg-orange-100 px-4 py-1 text-sm font-medium text-orange-700">
                    Identité à vérifier
                  </span>
                )}
              </div>

              <p className="mt-2 text-gray-500">
                {profile.city || "Ville à compléter"} ·{" "}
                {profile.travel_mode || "Déplacement à compléter"}
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
                {profile.bio ||
                  "Ajoutez une courte présentation pour rassurer les autres utilisateurs avant une livraison."}
              </p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[32px] bg-white px-5 shadow-sm ring-1 ring-emerald-100 md:px-8">
          <ProfileShortcut icon={UserRound} title="Informations personnelles" text="Nom, téléphone et adresses" href="#informations-personnelles" />
          <ProfileShortcut icon={CreditCard} title="Paiements" text="Carte enregistrée et autorisations" href="/dashboard/paiements" />
          <ProfileShortcut icon={Landmark} title="Versements transporteur" text="Compte bancaire et gains" href="/dashboard/paiements" />
          <ProfileShortcut icon={ShieldCheck} title="Identité et sécurité" text="Vérification du compte" href="/dashboard/verification" />
          <ProfileShortcut icon={CircleHelp} title="Aide et règles Droovo" text="Support, objets interdits et conditions" href="/support" />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <InfoCard
            title="Profil complété"
            value={`${completionRate}%`}
            description="Plus le profil est complet, plus il inspire confiance."
          />

          <InfoCard
            title="Avis reçus"
            value={reviews.length > 0 ? reviews.length : "Aucun"}
            description="Les avis apparaîtront après les premières livraisons."
          />

          <InfoCard
            title="Note moyenne"
            value={averageRating ? `${averageRating}/5` : "Non disponible"}
            description="Calculée uniquement à partir des vrais avis."
          />
        </section>

        <section id="informations-personnelles" className="scroll-mt-28 rounded-[32px] bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-gray-950">
            Informations personnelles
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <ProfileInput
              label="Prénom"
              value={profile.first_name}
              placeholder="À compléter"
              disabled={!isEditing}
              onChange={(value) => handleChange("first_name", value)}
            />

            <ProfileInput
              label="Nom"
              value={profile.last_name}
              placeholder="À compléter"
              disabled={!isEditing}
              onChange={(value) => handleChange("last_name", value)}
            />

            <ProfileInput
              label="Email"
              value={profile.email}
              placeholder="À compléter"
              disabled={!isEditing}
              onChange={(value) => handleChange("email", value)}
            />

            <ProfileInput
              label="Téléphone"
              value={profile.phone}
              placeholder="À compléter"
              disabled={!isEditing}
              onChange={(value) => handleChange("phone", value)}
            />

            <ProfileInput
              label="Ville principale"
              value={profile.city}
              placeholder="Ex : Paris, Lyon, Marseille..."
              disabled={!isEditing}
              onChange={(value) => handleChange("city", value)}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600">
                Déplacements habituels
              </label>

              <select
                value={profile.travel_mode}
                disabled={!isEditing}
                onChange={(e) => handleChange("travel_mode", e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-900 outline-none focus:border-black disabled:cursor-not-allowed disabled:text-gray-500"
              >
                <option value="">À compléter</option>
                <option value="Voiture">Voiture</option>
                <option value="Train">Train</option>
                <option value="Bus">Bus</option>
                <option value="Vélo">Vélo</option>
                <option value="Scooter">Scooter</option>
                <option value="À pied">À pied</option>
                <option value="Mixte selon le trajet">Mixte selon le trajet</option>
              </select>

              <p className="mt-2 text-xs text-gray-500">
                Le moyen de déplacement peut varier selon le trajet déclaré.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-600">
                Présentation
              </label>

              <textarea
                value={profile.bio}
                disabled={!isEditing}
                placeholder="Présentez-vous brièvement..."
                onChange={(e) => handleChange("bio", e.target.value)}
                rows={4}
                className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-900 outline-none focus:border-black disabled:cursor-not-allowed disabled:text-gray-500"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-red-100 md:p-8">
          <h2 className="text-2xl font-bold text-gray-950">Supprimer mon compte</h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Vos données personnelles seront supprimées, sauf celles que Droovo doit
            conserver pour respecter ses obligations légales. Cette action est définitive.
          </p>
          <button
            onClick={deleteAccount}
            disabled={deletingAccount}
            className="mt-5 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {deletingAccount ? "Suppression…" : "Supprimer définitivement mon compte"}
          </button>
        </section>
      </div>
    </main>
  );
}

function InfoCard({ title, value, description }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-gray-950">{value}</p>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
}

function ProfileShortcut({ icon: Icon, title, text, href }) {
  return (
    <Link
      href={href}
      className="grid grid-cols-[44px_1fr_auto] items-center gap-3 border-b border-emerald-100 py-5 last:border-b-0 hover:text-emerald-800"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
        <Icon size={20} />
      </span>
      <span>
        <strong className="block font-black text-slate-950">{title}</strong>
        <span className="mt-1 block text-sm text-slate-500">{text}</span>
      </span>
      <ChevronRight size={18} className="text-slate-400" />
    </Link>
  );
}

function ProfileInput({ label, value, placeholder, disabled, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-600">
        {label}
      </label>

      <input
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-900 outline-none focus:border-black disabled:cursor-not-allowed disabled:text-gray-500"
      />
    </div>
  );
}
