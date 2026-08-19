import LegalPage, { LegalSection } from "../../components/LegalPage";

export const metadata = { title: "Assistance | Droovo" };

export default function SupportPage() {
  return (
    <LegalPage eyebrow="Assistance" title="Besoin d’aide ?" intro="Pour protéger les paiements, indiquez toujours l’adresse e-mail du compte et la référence de la livraison, sans envoyer de numéro de carte complet.">
      <LegalSection title="Contacter Droovo">
        <p><a className="font-bold text-emerald-700" href="mailto:contact@droovo.fr">contact@droovo.fr</a></p>
      </LegalSection>
      <LegalSection title="Urgence ou contenu dangereux">
        <p>En cas de danger immédiat, contactez d’abord les services d’urgence compétents. N’acceptez pas le colis et ne communiquez aucun code de remise.</p>
      </LegalSection>
      <LegalSection title="Paiement ou litige">
        <p>Signalez l’incident avant de confirmer la livraison afin que les fonds restent bloqués pendant l’examen.</p>
      </LegalSection>
    </LegalPage>
  );
}
