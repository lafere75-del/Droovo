'use client';

import { useMemo, useState } from 'react';
import {
  Search,
  MapPin,
  Package,
  Euro,
  Clock,
  ShieldCheck,
  Truck,
  UserCheck,
  Star,
  ArrowRight,
  CheckCircle2,
  Navigation,
  CalendarDays,
  Send,
  Route,
} from 'lucide-react';

const initialParcels = [
  {
    id: 1,
    title: 'Petit colis — documents et accessoires',
    from_city: 'Avignon Centre',
    to_city: 'Paris 11e',
    delivery_date: 'Aujourd’hui',
    weight_kg: 1.2,
    size_label: 'Petit',
    distance_match: '98%',
    droovo_price: 9.2,
    driver_reward: 6.4,
    platform_commission: 2.8,
    reference_carrier: 'Colissimo 2 kg',
    reference_price: 11.19,
    pickup_window: '18:00 - 20:00',
    delivery_window: 'Demain avant 12:00',
  },
  {
    id: 2,
    title: 'Colis vêtements — sac souple',
    from_city: 'Le Pontet',
    to_city: 'Paris Gare de Lyon',
    delivery_date: 'Demain',
    weight_kg: 3,
    size_label: 'Moyen',
    distance_match: '91%',
    droovo_price: 13.9,
    driver_reward: 9.7,
    platform_commission: 4.2,
    reference_carrier: 'Colissimo 5 kg',
    reference_price: 17.39,
    pickup_window: '08:00 - 10:00',
    delivery_window: 'Demain soir',
  },
  {
    id: 3,
    title: 'Carton fragile — objet déco',
    from_city: 'Avignon TGV',
    to_city: 'Boulogne-Billancourt',
    delivery_date: 'Vendredi',
    weight_kg: 2.4,
    size_label: 'Moyen fragile',
    distance_match: '87%',
    droovo_price: 15.5,
    driver_reward: 10.4,
    platform_commission: 5.1,
    reference_carrier: 'Colissimo 5 kg + option service',
    reference_price: 19.9,
    pickup_window: 'Flexible',
    delivery_window: 'Sous 48h',
  },
];

function Card({ children, className = '' }) {
  return <div className={`rounded-3xl bg-white shadow-sm ${className}`}>{children}</div>;
}

function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles =
    variant === 'primary'
      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
      : 'border border-slate-300 bg-white text-slate-950 hover:bg-slate-50';

  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}

function getReferencePrice(weight) {
  if (weight <= 1) return 9.59;
  if (weight <= 2) return 11.19;
  if (weight <= 5) return 17.39;
  if (weight <= 10) return 25.29;
  return 39.59;
}

function PriceSimulator({ selectedParcel }) {
  const [weight, setWeight] = useState(2);
  const [urgent, setUrgent] = useState(true);
  const [fragile, setFragile] = useState(false);

  const referencePrice = useMemo(() => getReferencePrice(weight), [weight]);
  const droovoPrice = useMemo(() => {
    let price = referencePrice * 0.78;
    if (urgent) price += 1.5;
    if (fragile) price += 2.2;
    return Math.round(price * 10) / 10;
  }, [referencePrice, urgent, fragile]);

  const driverReward = Math.round(droovoPrice * 0.7 * 10) / 10;
  const platformCommission = Math.round((droovoPrice - driverReward) * 10) / 10;
  const saving = Math.max(0, Math.round((referencePrice - droovoPrice) * 10) / 10);
  const monthlyRevenue = Math.round(platformCommission * 100 * 30);

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-600">Modèle économique Droovo</p>
          <h3 className="text-xl font-semibold text-slate-950">Prix, gain et commission</h3>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
          <Euro size={24} />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Poids du colis : {weight} kg</label>
          <input
            type="range"
            min="1"
            max="10"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setUrgent(!urgent)} className={`rounded-xl border p-3 text-left text-sm ${urgent ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
            <Clock className="mb-2" size={18} /> Livraison rapide
          </button>
          <button onClick={() => setFragile(!fragile)} className={`rounded-xl border p-3 text-left text-sm ${fragile ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
            <ShieldCheck className="mb-2" size={18} /> Colis fragile
          </button>
        </div>

        <div className="rounded-2xl bg-slate-950 p-5 text-white">
          <p className="text-sm text-slate-300">Prix client Droovo estimé</p>
          <div className="mt-1 flex flex-wrap items-end gap-2">
            <span className="text-4xl font-bold">{droovoPrice.toFixed(2)} €</span>
            <span className="mb-1 text-sm text-slate-300">référence colis : {referencePrice.toFixed(2)} €</span>
          </div>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-slate-300">Gain livreur</p>
              <strong className="text-lg">{driverReward.toFixed(2)} €</strong>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-slate-300">Commission Droovo</p>
              <strong className="text-lg">{platformCommission.toFixed(2)} €</strong>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-slate-300">Économie client</p>
              <strong className="text-lg">{saving.toFixed(2)} €</strong>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-950">
          <strong>Projection créateur :</strong><br />
          Avec 100 transactions/jour et une commission moyenne de {platformCommission.toFixed(2)} €, Droovo génère environ <strong>{monthlyRevenue.toLocaleString('fr-FR')} € de CA mensuel</strong> avant frais de paiement, assurance, support et marketing.
        </div>

        {selectedParcel && (
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            Colis sélectionné : <strong>{selectedParcel.title}</strong><br />
            Prix client : <strong>{selectedParcel.droovo_price.toFixed(2)} €</strong> — Gain livreur : <strong>{selectedParcel.driver_reward.toFixed(2)} €</strong> — Commission Droovo : <strong>{selectedParcel.platform_commission.toFixed(2)} €</strong>
          </div>
        )}
      </div>
    </Card>
  );
}

function CreateParcelForm() {
  const [weight, setWeight] = useState(2);
  const referencePrice = getReferencePrice(weight);
  const droovoPrice = Math.round(referencePrice * 0.82 * 10) / 10;
  const driverReward = Math.round(droovoPrice * 0.7 * 10) / 10;
  const commission = Math.round((droovoPrice - driverReward) * 10) / 10;

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><Send size={22} /></div>
        <div>
          <p className="text-sm font-medium text-emerald-600">Créer une demande</p>
          <h3 className="text-xl font-bold">Envoyer un colis</h3>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <input className="rounded-xl border p-3" placeholder="Ville de départ" defaultValue="Avignon" />
        <input className="rounded-xl border p-3" placeholder="Ville d’arrivée" defaultValue="Paris" />
        <input className="rounded-xl border p-3" placeholder="Titre du colis" defaultValue="Petit colis" />
        <input className="rounded-xl border p-3" type="date" />
      </div>
      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium">Poids : {weight} kg</label>
        <input type="range" min="1" max="10" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full accent-emerald-600" />
      </div>
      <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white">
        <div className="grid gap-3 md:grid-cols-3">
          <div><p className="text-xs text-slate-300">Prix Droovo</p><strong>{droovoPrice.toFixed(2)} €</strong></div>
          <div><p className="text-xs text-slate-300">Gain livreur</p><strong>{driverReward.toFixed(2)} €</strong></div>
          <div><p className="text-xs text-slate-300">Commission</p><strong>{commission.toFixed(2)} €</strong></div>
        </div>
      </div>
      <Button className="mt-5 w-full">Publier la demande</Button>
    </Card>
  );
}

function CreateTripForm() {
  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><Route size={22} /></div>
        <div>
          <p className="text-sm font-medium text-emerald-600">Livreur Droovo</p>
          <h3 className="text-xl font-bold">Déclarer un trajet</h3>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <input className="rounded-xl border p-3" placeholder="Départ" defaultValue="Avignon" />
        <input className="rounded-xl border p-3" placeholder="Arrivée" defaultValue="Paris" />
        <input className="rounded-xl border p-3" type="date" />
        <select className="rounded-xl border p-3" defaultValue="Moyen">
          <option>Petit</option>
          <option>Moyen</option>
          <option>Grand</option>
        </select>
      </div>
      <Button className="mt-5 w-full">Trouver des colis compatibles</Button>
    </Card>
  );
}

export default function DroovoApp() {
  const [selectedParcel, setSelectedParcel] = useState(initialParcels[0]);
  const [mode, setMode] = useState('driver');

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
              <Truck size={24} />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight">Droovo</div>
              <div className="text-xs text-slate-500">Livraison collaborative entre particuliers</div>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#trajet">Trouver un colis</a>
            <a href="#comparatif">Comparatif</a>
            <a href="#demo">Démo</a>
          </nav>
          <Button className="bg-slate-950 hover:bg-slate-800">Créer un compte</Button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-white">
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-emerald-100 blur-3xl" />
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.05fr_0.95fr] md:py-20">
            <div>
              <Pill>Avignon → Paris • livraison plus rapide • prix réduit</Pill>
              <h1 className="mt-6 max-w-3xl text-5xl font-black leading-tight tracking-tight md:text-6xl">
                Transporte un colis sur ton trajet et gagne de l’argent.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Droovo met en relation une personne qui doit envoyer un colis avec une personne qui fait déjà le même trajet. Le client paie moins cher, le colis arrive plus vite, et le transporteur rentabilise son déplacement.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button>Je déclare mon trajet <ArrowRight className="ml-2" size={18} /></Button>
                <Button variant="secondary">Envoyer un colis</Button>
              </div>
              <div className="mt-9 grid max-w-xl grid-cols-3 gap-4">
                <div><div className="text-2xl font-black">-15 à -30%</div><p className="text-sm text-slate-500">vs prix colis classique</p></div>
                <div><div className="text-2xl font-black">24/48h</div><p className="text-sm text-slate-500">livraison moyenne</p></div>
                <div><div className="text-2xl font-black">70%</div><p className="text-sm text-slate-500">du prix au livreur</p></div>
              </div>
            </div>

            <Card className="relative bg-slate-950 p-6 text-white shadow-2xl md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-300">Trajet déclaré</p>
                  <h2 className="text-2xl font-bold">Avignon → Paris</h2>
                </div>
                <div className="rounded-2xl bg-white/10 p-3"><Navigation size={24} /></div>
              </div>
              <div className="rounded-2xl bg-white p-4 text-slate-950">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Départ</p><p className="font-semibold">Avignon</p></div>
                  <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Arrivée</p><p className="font-semibold">Paris</p></div>
                  <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Date</p><p className="font-semibold">Aujourd’hui</p></div>
                  <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Place disponible</p><p className="font-semibold">Petit / moyen colis</p></div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {initialParcels.slice(0, 2).map((parcel) => (
                  <div key={parcel.id} className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                    <div>
                      <p className="font-semibold">{parcel.from_city} → {parcel.to_city}</p>
                      <p className="text-sm text-slate-300">{parcel.weight_kg} kg • match {parcel.distance_match}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-emerald-300">+{parcel.driver_reward.toFixed(2)} €</p>
                      <p className="text-xs text-slate-400">gain livreur</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section id="demo" className="mx-auto grid max-w-7xl gap-6 px-4 py-12 lg:grid-cols-2">
          <CreateTripForm />
          <CreateParcelForm />
        </section>

        <section id="trajet" className="mx-auto max-w-7xl px-4 py-12">
          <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold text-emerald-600">Matching trajet / colis</p>
              <h2 className="text-3xl font-black tracking-tight">Colis disponibles sur ton itinéraire</h2>
              <p className="mt-2 max-w-2xl text-slate-600">Exemple : tu pars d’Avignon vers Paris. Droovo propose les colis compatibles avec ton trajet, ton horaire et ton volume disponible.</p>
            </div>
            <div className="flex rounded-full bg-white p-1 shadow-sm">
              <button onClick={() => setMode('driver')} className={`rounded-full px-5 py-2 text-sm font-medium ${mode === 'driver' ? 'bg-slate-950 text-white' : 'text-slate-600'}`}>Je transporte</button>
              <button onClick={() => setMode('sender')} className={`rounded-full px-5 py-2 text-sm font-medium ${mode === 'sender' ? 'bg-slate-950 text-white' : 'text-slate-600'}`}>J’envoie</button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              {initialParcels.map((parcel) => (
                <Card key={parcel.id} className={`cursor-pointer p-5 transition hover:-translate-y-1 hover:shadow-lg ${selectedParcel.id === parcel.id ? 'ring-2 ring-emerald-600' : ''}`}>
                  <button className="w-full text-left" onClick={() => setSelectedParcel(parcel)}>
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div className="flex gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Package size={26} /></div>
                        <div>
                          <h3 className="text-lg font-bold">{parcel.title}</h3>
                          <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-600">
                            <span className="inline-flex items-center gap-1"><MapPin size={15} /> {parcel.from_city} → {parcel.to_city}</span>
                            <span className="inline-flex items-center gap-1"><CalendarDays size={15} /> {parcel.delivery_date}</span>
                            <span>{parcel.weight_kg} kg</span>
                            <span>{parcel.size_label}</span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Pill>Match trajet {parcel.distance_match}</Pill>
                            <Pill>Retrait {parcel.pickup_window}</Pill>
                            <Pill>Livraison {parcel.delivery_window}</Pill>
                          </div>
                        </div>
                      </div>
                      <div className="min-w-36 text-left md:text-right">
                        <p className="text-sm text-slate-500">Gain livreur</p>
                        <p className="text-3xl font-black text-emerald-600">+{parcel.driver_reward.toFixed(2)} €</p>
                        <p className="text-xs text-slate-400">Prix client {parcel.droovo_price.toFixed(2)} €</p>
                        <p className="text-xs text-slate-400">Réf. {parcel.reference_carrier} : {parcel.reference_price.toFixed(2)} €</p>
                        <p className="text-xs text-emerald-600">Commission Droovo : {parcel.platform_commission.toFixed(2)} €</p>
                      </div>
                    </div>
                  </button>
                </Card>
              ))}
            </div>
            <PriceSimulator selectedParcel={selectedParcel} />
          </div>
        </section>

        <section id="comparatif" className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-10 max-w-3xl">
              <p className="text-sm font-semibold text-emerald-600">Pourquoi Droovo ?</p>
              <h2 className="text-3xl font-black tracking-tight">Plus rapide, moins cher et plus rentable</h2>
              <p className="mt-3 text-slate-600">Droovo exploite les trajets déjà effectués par des particuliers pour réduire les coûts et accélérer certaines livraisons.</p>
            </div>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="grid grid-cols-4 border-b bg-slate-950 text-sm font-semibold text-white">
                <div className="p-5">Critères</div><div className="p-5">Droovo</div><div className="p-5">La Poste / Colissimo</div><div className="p-5">Transport express</div>
              </div>
              {[
                ['Prix moyen Avignon → Paris (2-3kg)', '9 à 15 €', '11 à 20 €', '25 à 60 €'],
                ['Délai moyen', '24h à 48h', '48h à 72h', '24h'],
                ['Livraison flexible', 'Oui', 'Limitée', 'Oui'],
                ['Rentabilisation trajet particulier', 'Oui', 'Non', 'Non'],
                ['Impact écologique', 'Trajet déjà prévu', 'Transport dédié', 'Transport dédié'],
              ].map((row) => (
                <div key={row[0]} className="grid grid-cols-4 border-b text-sm last:border-0">
                  <div className="bg-slate-50 p-5 font-semibold text-slate-800">{row[0]}</div>
                  <div className="p-5 font-medium text-emerald-700">{row[1]}</div>
                  <div className="p-5 text-slate-600">{row[2]}</div>
                  <div className="p-5 text-slate-600">{row[3]}</div>
                </div>
              ))}
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <Card className="bg-emerald-600 p-8 text-white shadow-xl">
                <p className="text-sm font-semibold text-emerald-100">Intérêt client expéditeur</p>
                <h3 className="mt-2 text-3xl font-black">Envoyer un colis moins cher et plus rapidement</h3>
                <div className="mt-7 space-y-4">
                  {['Prix inférieur aux solutions classiques', 'Livraison parfois le jour même ou le lendemain', 'Suivi temps réel du transporteur', 'Remise en main propre possible'].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-xl bg-white/10 p-4"><CheckCircle2 className="mt-0.5 shrink-0" size={20} /><span>{item}</span></div>
                  ))}
                </div>
              </Card>
              <Card className="bg-slate-950 p-8 text-white shadow-xl">
                <p className="text-sm font-semibold text-emerald-300">Intérêt livreur Droovo</p>
                <h3 className="mt-2 text-3xl font-black">Rentabiliser ses trajets quotidiens</h3>
                <div className="mt-6 rounded-2xl bg-white/10 p-5">
                  <p className="text-sm text-slate-300">Exemple concret</p>
                  <div className="mt-3 text-4xl font-black text-emerald-300">+ 180 à 450 €/mois</div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Un particulier qui effectue régulièrement des trajets peut transporter plusieurs colis par semaine et générer un complément de revenu sans modifier son trajet principal.</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 lg:grid-cols-3">
          <Card className="p-7 lg:col-span-2">
            <p className="text-sm font-semibold text-emerald-600">Sécurité et confiance</p>
            <h2 className="mt-2 text-3xl font-black">Un modèle qui rassure les deux côtés</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {['Vérification d’identité', 'Paiement bloqué jusqu’à confirmation', 'Code de remise au retrait et à la livraison', 'Photos du colis avant départ et à l’arrivée', 'Assurance selon valeur déclarée', 'Notation réciproque'].map((item) => (
                <div key={item} className="flex gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700"><CheckCircle2 className="shrink-0 text-emerald-600" size={20} /> {item}</div>
              ))}
            </div>
          </Card>
          <Card className="bg-slate-950 p-7 text-white">
            <UserCheck className="mb-5 text-emerald-300" size={32} />
            <h3 className="text-2xl font-bold">Profil livreur</h3>
            <div className="mt-5 rounded-2xl bg-white/10 p-4">
              <p className="font-semibold">Julie M.</p>
              <p className="mt-1 text-sm text-slate-300">Trajet régulier : Avignon → Paris</p>
              <div className="mt-3 flex items-center gap-1 text-emerald-300"><Star size={18} fill="currentColor" /> 4.9 / 5</div>
            </div>
            <Button className="mt-6 w-full">Valider ce transport</Button>
          </Card>
        </section>
      </main>
    </div>
  );
}
