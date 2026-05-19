import "./globals.css";

export const metadata = {
  title: "Droovo",
  description: "Livraison collaborative entre particuliers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
