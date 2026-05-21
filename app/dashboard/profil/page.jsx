"use client";

import Link from "next/link";
import { useState } from "react";

export default function ProfilPage() {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "Eulalie",
    lastName: "Zegzula",
    email: "eulaliezegzula@gmail.com",
    phone: "",
    city: "Avignon",
    travelMode: "Mixte selon le trajet",
    bio: "Je peux envoyer ou transporter des colis selon mes trajets disponibles.",
    photo: "",
  });

  const reviews = [
    {
      name: "Thomas",
      rating: 5,
      text: "Livraison rapide, communication claire et colis remis en parfait état.",
    },
    {
      name: "Sarah",
      rating: 5,
      text: "Très sérieuse, m’a tenue informée à chaque étape du trajet.",
    },
    {
      name: "Nadia",
      rating: 4,
      text: "Bonne expérience, échange simple et rassurant.",
    },
  ];

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          ← Retour au dashboard
        </Link>

        <section className="rounded-[32px] bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-4xl font-bold text-gray-500">
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt="Photo de profil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`
                )}
              </div>

              {isEditing && (
                <input
                  type="text"
                  placeholder="URL de la photo"
                  value={profile.photo}
                  onChange={(e) => handleChange("photo", e.target.value)}
                  className="w-52 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-black"
                />
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-950">
                  {profile.firstName} {profile.lastName}
                </h1>

                <span className="rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-700">
                  Profil vérifié
                </span>
              </div>

              <p className="mt-2 text-gray-500">
                {profile.city || "Ville non renseignée"} · {profile.travelMode}
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
                {profile.bio}
              </p>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              {isEditing ? "Terminer" : "Modifier le profil"}
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <InfoCard title="Note moyenne" value="4.8/5" />
          <InfoCard title="Avis reçus" value="18" />
          <InfoCard title="Statut du compte" value="Actif" />
        </section>

        <section className="rounded-[32px] bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-gray-950">
            Informations personnelles
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Ces informations aident les autres utilisateurs à identifier un
            profil fiable avant une livraison.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <ProfileInput
              label="Prénom"
              value={profile.firstName}
              disabled={!isEditing}
              onChange={(value) => handleChange("firstName", value)}
            />

            <ProfileInput
              label="Nom"
              value={profile.lastName}
              disabled={!isEditing}
              onChange={(value) => handleChange("lastName", value)}
            />

            <ProfileInput
              label="Email"
              value={profile.email}
              disabled={!isEditing}
              onChange={(value) => handleChange("email", value)}
            />

            <ProfileInput
              label="Téléphone"
              value={profile.phone}
              placeholder="Ajouter un numéro"
              disabled={!isEditing}
              onChange={(value) => handleChange("phone", value)}
            />

            <ProfileInput
              label="Ville"
              value={profile.city}
              disabled={!isEditing}
              onChange={(value) => handleChange("city", value)}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600">
                Déplacements habituels
              </label>

              <select
                value={profile.travelMode}
                disabled={!isEditing}
                onChange={(e) => handleChange("travelMode", e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-900 outline-none focus:border-black disabled:cursor-not-allowed disabled:text-gray-500"
              >
                <option>Voiture</option>
                <option>Train</option>
                <option>Bus</option>
                <option>Vélo</option>
                <option>Scooter</option>
                <option>À pied</option>
                <option>Mixte selon le trajet</option>
              </select>

              <p className="mt-2 text-xs text-gray-500">
                Le moyen de déplacement peut varier selon le trajet déclaré. Il
                sera confirmé pour chaque livraison.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-600">
                Présentation
              </label>

              <textarea
                value={profile.bio}
                disabled={!isEditing}
                onChange={(e) => handleChange("bio", e.target.value)}
                rows={4}
                className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-900 outline-none focus:border-black disabled:cursor-not-allowed disabled:text-gray-500"
              />
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white"
              >
                Enregistrer les modifications
              </button>

              <button
                onClick={() => setIsEditing(false)}
                className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700"
              >
                Annuler
              </button>
            </div>
          )}
        </section>

        <section className="rounded-[32px] bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-gray-950">
            Vérifications
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <VerificationItem title="Identité vérifiée" status="Validé" />
            <VerificationItem title="Email confirmé" status="Validé" />
            <VerificationItem
              title="Téléphone"
              status={profile.phone ? "Renseigné" : "À compléter"}
            />
            <VerificationItem title="Profil public" status="Actif" />
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-950">
                Avis clients
              </h2>

              <p className="text-sm text-gray-500">
                Les avis permettent de rassurer les utilisateurs avant de
                confier un colis.
              </p>
            </div>

            <p className="text-sm font-semibold text-gray-700">
              4.8/5 sur 18 avis
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {reviews.map((review) => (
              <div
                key={review.name}
                className="rounded-2xl border border-gray-100 p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-gray-950">{review.name}</p>
                  <p className="text-sm text-yellow-500">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </p>
                </div>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {review.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-gray-950">{value}</p>
    </div>
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

function VerificationItem({ title, status }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
      <p className="font-medium text-gray-800">{title}</p>
      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
        {status}
      </span>
    </div>
  );
}
