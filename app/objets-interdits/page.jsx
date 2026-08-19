import LegalPage, { LegalSection } from "../../components/LegalPage";

export const metadata = { title: "Objets interdits | Droovo" };

export default function ProhibitedItemsPage() {
  return (
    <LegalPage eyebrow="Sécurité" title="Objets interdits" intro="Cette liste protège l’expéditeur, le transporteur, le destinataire et les tiers.">
      <LegalSection title="Toujours interdits">
        <p>Armes, munitions, explosifs, stupéfiants, produits volés ou contrefaits, espèces et titres, animaux vivants, déchets dangereux, substances toxiques, inflammables, corrosives ou radioactives.</p>
      </LegalSection>
      <LegalSection title="Interdits sans dispositif spécialisé">
        <p>Médicaments réglementés, denrées nécessitant une température contrôlée, alcool ou tabac soumis à restrictions, batteries endommagées, objets très fragiles, biens précieux et documents d’identité originaux.</p>
      </LegalSection>
      <LegalSection title="Contrôle et refus">
        <p>Le transporteur peut refuser un colis dont le contenu, l’emballage, le poids ou les dimensions ne correspondent pas à la déclaration. Un contenu suspect doit être signalé à Droovo et, si nécessaire, aux autorités.</p>
      </LegalSection>
    </LegalPage>
  );
}
