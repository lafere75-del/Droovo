import Link from "next/link";

export default function LegalPage({ eyebrow, title, intro, children }) {
  return (
    <main className="min-h-screen bg-[#F4F7F5] px-6 py-10 text-slate-950">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200">
          ← Retour à l’accueil
        </Link>
        <article className="mt-6 rounded-[2rem] bg-white p-7 shadow-xl ring-1 ring-emerald-100 md:p-10">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">{eyebrow}</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">{title}</h1>
          <p className="mt-4 leading-7 text-slate-600">{intro}</p>
          <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">{children}</div>
        </article>
      </div>
    </main>
  );
}

export function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}
