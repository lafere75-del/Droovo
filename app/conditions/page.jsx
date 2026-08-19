import LegalPage, { LegalSection } from "../../components/LegalPage";

export const metadata = { title: "Conditions d’utilisation | Droovo" };

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Règles du service" title="Conditions générales d’utilisation" intro="Droovo met en relation un expéditeur et un transporteur effectuant un trajet compatible. Version de préparation au lancement — 19 août 2026.">
      <LegalSection title="Comptes et identité">
        <p>Chaque personne utilise un compte personnel et fournit des informations exactes. Les paiements et versements restent bloqués tant que l’identité n’est pas vérifiée.</p>
      </LegalSection>
      <LegalSection title="Colis et objets interdits">
        <p>L’expéditeur déclare exactement le contenu, le poids, les dimensions et la valeur. Les objets illégaux, dangereux, périssables non adaptés ou exclus par Droovo ne peuvent pas être transportés.</p>
      </LegalSection>
      <LegalSection title="Acceptation et paiement">
        <p>Le prix total est affiché avant le choix du transporteur. La carte enregistrée peut faire l’objet d’une préautorisation à ce moment. Le débit et le versement au transporteur interviennent seulement après confirmation de la livraison, sous réserve des contrôles et litiges.</p>
      </LegalSection>
      <LegalSection title="Remise et livraison">
        <p>L’expéditeur, le transporteur et le destinataire doivent vérifier l’identité de leur interlocuteur. Les codes ou preuves de remise ne doivent être communiqués qu’en présence du colis et après vérification de son état.</p>
      </LegalSection>
      <LegalSection title="Annulation, incident et litige">
        <p>Tout retard, perte, dommage, contenu non conforme ou désaccord doit être signalé depuis Droovo avant la libération des fonds. Droovo peut suspendre le paiement pendant l’examen du dossier.</p>
      </LegalSection>
      <LegalSection title="Responsabilité">
        <p>Les utilisateurs restent responsables de leurs déclarations, du respect de la loi, de l’emballage et de la bonne exécution de leurs engagements. Les garanties, plafonds et modalités d’indemnisation définitifs seront précisés avant l’ouverture commerciale.</p>
      </LegalSection>
    </LegalPage>
  );
}
