# Checklist de publication mobile

## À fournir par le propriétaire de Droovo

- raison sociale, adresse, SIREN/SIRET et représentant légal de l’entité exploitante ;
- compte Apple Developer Organisation et identifiant d’équipe Apple ;
- compte Google Play Console Organisation ;
- clé Google Maps serveur avec Places, Routes et Geocoding activés ;
- projet Firebase et fichier `google-services.json` pour Android ;
- clé APNs reliée au projet de notifications pour iOS ;
- certificat/signature Android de production et empreinte SHA-256 ;
- compte de démonstration App Review ;
- plafonds d’indemnisation, assurance et procédure définitive de litige.

## Configuration à terminer dans les services

- Supabase Auth : autoriser `https://droovo.fr/**` et `droovo://**` comme URL de redirection ;
- Stripe : webhook `https://droovo.fr/api/stripe/webhook` avec tous les événements PaymentIntent utilisés ;
- Vercel : variables Google Maps, Stripe, Supabase et URL publique de production ;
- Apple : Push Notifications, Associated Domains et déclarations App Privacy ;
- Google : Data safety, politique de confidentialité, accès test et classification du contenu.

## Tests obligatoires

- inscription et confirmation d’e-mail ;
- récupération du mot de passe depuis un lien mobile ;
- suppression du compte ;
- refus des permissions caméra, localisation et notifications ;
- expéditeur → proposition → acceptation → préautorisation → prise en charge → livraison → débit → versement ;
- carte/RIB enregistrés avant vérification, avec blocage financier jusqu’à validation ;
- noms bancaire et identité non concordants ;
- 3D Secure ;
- réseau interrompu pendant chaque étape ;
- petit et grand écran iOS/Android ;
- liens Conditions, Confidentialité, Objets interdits et Assistance.

## Commandes

```bash
npm install
npm run build
npm run mobile:sync
npm run mobile:android
npm run mobile:ios
```

La compilation iOS doit être réalisée sur macOS avec Xcode. La compilation Android nécessite Android Studio/JDK et l’accès au téléchargement de Gradle.
