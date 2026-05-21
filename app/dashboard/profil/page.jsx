"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export default function ProfilPage() {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    photo: "",
    travelMode: "",
    bio: "",
    verifiedIdentity: false,
    verifiedEmail: false,
    verifiedPhone: false,
  });

  // Plus tard : remplacer par les vrais avis Supabase
  const reviews = [];

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return null;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const fullName =
    profile.firstName || profile.lastName
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : "Profil utilisateur";

  const initials =
    profile.firstName || profile.lastName
      ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()
      : "?";

  const completionItems = [
    Boolean(profile.firstName),
    Boolean(profile.lastName),
    Boolean(profile.email),
    Boolean(profile.phone),
    Boolean(profile.city),
    Boolean(profile.travelMode),
    Boolean(profile.bio),
    Boolean(profile.photo),
  ];

  const completionRate = Math.round(
    (completionItems.filter(Boolean).length / completionItems.length) * 100
  );

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            ← Retour au dashboard
          </Link>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/verification"
              className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Vérifications
            </Link>

            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              {isEditing ? "Enregistrer" : "Modifier le profil"}
            </button>
          </div>
        </div>

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
                  initials
                )}
              </div>

              {isEditing && (
                <input
                  type="text"
                  value={profile.photo}
                  placeholder="URL de la photo"
                  onChange={(e) => handleChange("photo", e.target.value)}
                  className="w-56 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-black"
                />
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-950">
                  {fullName}
                </h1>

                {profile.verifiedIdentity ? (
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
                {profile.travelMode || "Déplacement à compléter"}
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
                {profile.bio ||
                  "Ajoutez une courte présentation pour rassurer les autres utilisateurs avant une livraison."}
              </p>
            </div>
          </div>
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

        {completionRate < 100 && (
          <section className="rounded-[28px] border border-orange-100 bg-orange-50 p-5">
            <h2 className="font-semibold text-orange-900">
              Profil à compléter
            </h2>
            <p className="mt-1 text-sm text-orange-800">
              Ajoutez vos informations, une photo et vos moyens de déplacement
              habituels pour rassurer les autres utilisateurs.
            </p>
          </section>
        )}

        <section className="rounded-[32px] bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-gray-950">
            Informations personnelles
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Ces informations permettent d’identifier le profil et de sécuriser
            les échanges.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <ProfileInput
              label="Prénom"
              value={profile.firstName}
              placeholder="À compléter"
              disabled={!isEditing}
              onChange={(value) => handleChange("firstName", value)}
            />

            <ProfileInput
              label="Nom"
              value={profile.lastName}
              placeholder="À compléter"
              disabled={!isEditing}
              onChange={(value) => handleChange("lastName", value)}
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
                value={profile.travelMode}
                disabled={!isEditing}
                onChange={(e) => handleChange("travelMode", e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-900 outline-none focus:border-black disabled:cursor-not-allowed disabled:text-gray-500"
              >
                <option value="">À compléter</option>
                <option value="Voiture">Voiture</option>
                <option value="Train">Train</option>
                <option value="Bus">Bus</option>
                <option value="Vélo">Vélo</option>
                <option value="Scooter">Scooter</option>
                <option value="À pied">À pied</option>
                <option value="Mixte selon le trajet">
                  Mixte selon le trajet
                </option>
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
                placeholder="Présentez-vous brièvement : disponibilité, sérieux, type de trajets, manière de communiquer..."
                onChange={(e) => handleChange("bio", e.target.value)}
                rows={4}
                className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-900 outline-none focus:border-black disabled:cursor-not-allowed disabled:text-gray-500"
              />
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleSave}
                className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white"
              >
                Enregistrer les modifications
              </button>

              <button
                onClick={handleCancel}
                className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700"
              >
                Annuler
              </button>
            </div>
          )}
        </section>

        <section className="rounded-[32px] bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-gray-950">
            Vérifications du compte
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Les vérifications augmentent la confiance entre expéditeur et
            transporteur.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <VerificationItem
              title="Identité"
              description="Pièce d’identité ou vérification manuelle."
              status={profile.verifiedIdentity ? "Validé" : "À vérifier"}
            />

            <VerificationItem
              title="Email"
              description="Adresse email confirmée."
              status={profile.verifiedEmail ? "Validé" : "À vérifier"}
            />

            <VerificationItem
              title="Téléphone"
              description="Numéro utile pour les échanges liés à une livraison."
              status={profile.verifiedPhone ? "Validé" : "À compléter"}
            />

            <VerificationItem
              title="Photo de profil"
              description="Photo utile pour rassurer les utilisateurs."
              status={profile.photo ? "Ajoutée" : "À compléter"}
            />
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-950">
                Avis utilisateurs
              </h2>

              <p className="text-sm text-gray-500">
                Les avis apparaissent uniquement après des livraisons réalisées.
              </p>
            </div>

            <p className="text-sm font-semibold text-gray-700">
              {averageRating ? `${averageRating}/5` : "Aucune note pour le moment"}
            </p>
          </div>

          {reviews.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-6 text-center">
              <p className="font-semibold text-gray-900">
                Aucun avis pour le moment
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Les premiers avis seront visibles après les livraisons terminées.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border border-gray-100 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-gray-950">
                      {review.author}
                    </p>
                    <p className="text-sm text-yellow-500">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </p>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <ActionLink
            href="/dashboard/mes-colis"
            title="Mes colis"
            description="Voir les colis publiés ou suivis."
          />

          <ActionLink
            href="/dashboard/mes-trajets"
            title="Mes trajets"
            description="Gérer les trajets déclarés."
          />

          <ActionLink
            href="/dashboard/messages"
            title="Messages"
            description="Échanger avec les autres utilisateurs."
          />
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

function VerificationItem({ title, description, status }) {
  return (
    <div className="rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="font-semibold text-gray-900">{title}</p>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
          {status}
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
}

function ActionLink({ href, title, description }) {
  return (
    <Link
      href={href}
      className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <p className="font-semibold text-gray-950">{title}</p>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </Link>
  );
}
