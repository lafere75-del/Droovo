import LegalPage, { LegalSection } from "../../components/LegalPage";

export const metadata = { title: "Confidentialité | Droovo" };

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Protection des données" title="Politique de confidentialité" intro="Cette page décrit les données utilisées par Droovo et les droits des utilisateurs. Dernière mise à jour : 19 août 2026.">
      <LegalSection title="Responsable et contact">
        <p>Service Droovo — contact : <a className="font-bold text-emerald-700" href="mailto:contact@droovo.fr">contact@droovo.fr</a>. Les coordonnées juridiques complètes de l’entité exploitante seront publiées avant l’ouverture commerciale.</p>
      </LegalSection>
      <LegalSection title="Données traitées">
        <p>Compte et profil, coordonnées de contact, documents de vérification, trajets, colis, messages, preuves de remise, localisation utilisée pendant l’action demandée, données techniques et historique des paiements.</p>
        <p>Les numéros complets de carte et les coordonnées bancaires sont traités par Stripe et ne sont pas stockés par Droovo.</p>
      </LegalSection>
      <LegalSection title="Finalités et bases légales">
        <p>Création et exécution du service, sécurisation des remises, prévention de la fraude, paiement des transporteurs, assistance, respect des obligations légales et amélioration du service.</p>
      </LegalSection>
      <LegalSection title="Destinataires et conservation">
        <p>Les données sont accessibles uniquement aux participants concernés, aux administrateurs habilités et aux prestataires nécessaires, notamment Supabase, Vercel, Stripe et les services cartographiques.</p>
        <p>Les données sont conservées pendant la durée du compte puis supprimées ou archivées pendant les durées imposées par la loi, notamment pour les paiements et litiges.</p>
      </LegalSection>
      <LegalSection title="Vos droits">
        <p>Vous pouvez demander l’accès, la rectification, la limitation, l’opposition, la portabilité ou la suppression de vos données. La suppression du compte peut être déclenchée directement depuis « Mon profil ».</p>
      </LegalSection>
    </LegalPage>
  );
}
