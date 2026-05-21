"use client";

import { useState } from "react";

export default function ProfilPage() {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "Eulalie",
    lastName: "Zegzula",
    email: "eulaliezegzula@gmail.com",
    phone: "",
    city: "Avignon",
    bio: "Utilisateur Droovo. Disponible pour envoyer ou transporter des colis selon mes trajets.",
    vehicle: "Voiture",
    verified: true,
  });

  const handleChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[32px] bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-black text-4xl font-bold text-white">
              {profile.firstName.charAt(0)}
              {profile.lastName.charAt(0)}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-950">
                  {profile.firstName} {profile.lastName}
                </h1>

                {profile.verified && (
                  <span className="rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-700">
                    Profil vérifié
                  </span>
                )}
              </div>

              <p className="mt-2 text-gray-500">
                {profile.city || "Ville non renseignée"} · {profile.vehicle}
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
                {profile.bio}
              </p>
            </div>

            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {isEditing ? "Enregistrer" : "Modifier le profil"}
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Identité</p>
            <p className="mt-2 text-lg font-semibold text-gray-950">
              {profile.verified ? "Vérifiée" : "À vérifier"}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Moyen de transport</p>
            <p className="mt-2 text-lg font-semibold text-gray-950">
              {profile.vehicle}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Statut du compte</p>
            <p className="mt-2 text-lg font-semibold text-gray-950">
              Actif
            </p>
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-950">
              Informations personnelles
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Ces informations servent à sécuriser les échanges et les livraisons.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
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
                Moyen de transport
              </label>

              <select
                value={profile.vehicle}
                disabled={!isEditing}
                onChange={(e) => handleChange("vehicle", e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-900 outline-none transition focus:border-black disabled:cursor-not-allowed disabled:text-gray-500"
              >
                <option>Voiture</option>
                <option>Train</option>
                <option>Vélo</option>
                <option>Scooter</option>
                <option>À pied</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-600">
                Description
              </label>

              <textarea
                value={profile.bio}
                disabled={!isEditing}
                onChange={(e) => handleChange("bio", e.target.value)}
                rows={4}
                className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-900 outline-none transition focus:border-black disabled:cursor-not-allowed disabled:text-gray-500"
              />
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
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
            Sécurité du compte
          </h2>

          <div className="mt-5 space-y-4">
            <SecurityRow
              title="Identité"
              description="Pièce d’identité vérifiée pour sécuriser les livraisons."
              status="Validé"
            />

            <SecurityRow
              title="Email"
              description="Adresse email utilisée pour les notifications importantes."
              status="Validé"
            />

            <SecurityRow
              title="Téléphone"
              description="Numéro utile pour contacter l’utilisateur lors d’une livraison."
              status={profile.phone ? "Renseigné" : "À compléter"}
            />
          </div>
        </section>
      </div>
    </main>
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
        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-900 outline-none transition focus:border-black disabled:cursor-not-allowed disabled:text-gray-500"
      />
    </div>
  );
}

function SecurityRow({ title, description, status }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h3 className="font-semibold text-gray-950">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>

      <span className="w-fit rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
        {status}
      </span>
    </div>
  );
}
