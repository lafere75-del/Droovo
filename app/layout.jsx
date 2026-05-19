import './globals.css';

export const metadata = {
  title: 'Droovo - Livraison collaborative',
  description: 'Droovo met en relation expéditeurs et particuliers qui effectuent déjà le bon trajet.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
