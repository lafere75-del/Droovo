import DroovoApp from '../components/DroovoApp.jsx';

export default function Page() {
  return (
    <>
      <DroovoApp />
      <footer className="border-t border-emerald-100 bg-white px-6 py-8">
        <nav className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-bold text-slate-600">
          <a href="/conditions">Conditions</a>
          <a href="/confidentialite">Confidentialité</a>
          <a href="/objets-interdits">Objets interdits</a>
          <a href="/support">Assistance</a>
        </nav>
      </footer>
    </>
  );
}
