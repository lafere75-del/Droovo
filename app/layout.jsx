import "./globals.css";

export const metadata = {
  title: "Droovo",
  description: "Livraison collaborative entre particuliers",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Droovo",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
