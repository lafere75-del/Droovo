"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

import {
  Users,
  ShieldAlert,
  BadgeCheck,
  CreditCard,
  Search,
  Clock3,
  UserX,
  Package,
  Car,
  TrendingUp,
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();

  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [profiles, setProfiles] = useState([]);
  const [count, setCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingUsers, setPendingUsers] = useState(0);
  const [verifiedUsers, setVerifiedUsers] = useState(0);

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (authorized) loadAdminData();
  }, [authorized, status, q, page]);

  async function checkAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    setAuthorized(true);
    setCheckingAuth(false);
  }

  async function loadAdminData() {
    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status !== "all") {
      query = query.eq("identity_status", status);
    }

    if (q) {
      query = query.or(`fullname.ilike.%${q}%,email.ilike.%${q}%`);
    }

    const { data: profilesData = [], count: profilesCount = 0 } = await query;

    const { count: total = 0 } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: pending = 0 } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .or("identity_status.eq.pending,identity_status.is.null");

    const { count: verified = 0 } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("identity_status", "verified");

    setProfiles(profilesData || []);
    setCount(profilesCount || 0);
    setTotalUsers(total || 0);
    setPendingUsers(pending || 0);
    setVerifiedUsers(verified || 0);
  }

  async function openVerification(userId) {
    const newWindow = window.open("", "_blank");

    if (!newWindow) {
      alert("Le navigateur bloque la fenêtre.");
      return;
    }

    newWindow.document.write(`
      <html>
        <body style="font-family:Arial;padding:30px;background:#f8fafc;">
          <h2>Chargement des documents...</h2>
        </body>
      </html>
    `);

    const { data, error } = await supabase
      .from("identity_verifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      newWindow.document.body.innerHTML = `
        <p style="font-family:Arial;color:red;">
          Erreur : ${error.message}
        </p>
      `;
      return;
    }

    if (!data) {
      newWindow.document.body.innerHTML = `
        <p style="font-family:Arial;">
          Aucun document trouvé.
        </p>
      `;
      return;
    }

    const files = [
      { label: "Carte identité recto", path: data.id_front_url },
      { label: "Carte identité verso", path: data.id_back_url },
      { label: "Selfie", path: data.selfie_url },
      { label: "RIB", path: data.rib_url },
    ].filter((file) => file.path);

    const links = [];

    for (const file of files) {
      let finalUrl = file.path;

      if (!file.path.startsWith("http")) {
        const { data: signedData, error: signedError } = await supabase.storage
          .from("identity-documents")
          .createSignedUrl(file.path, 60 * 5);

        if (signedError) {
          console.error(signedError);
          continue;
        }

        finalUrl = signedData?.signedUrl;
      }

      if (finalUrl) {
        links.push(`
          <div style="margin-bottom:16px;padding:16px;background:white;border-radius:16px;border:1px solid #d1fae5;">
            <p style="font-weight:bold;margin-bottom:10px;color:#0f172a;">
              ${file.label}
            </p>

            <a
              href="${finalUrl}"
              target="_blank"
              style="color:#059669;font-weight:bold;text-decoration:none;"
            >
              Ouvrir le document
            </a>
          </div>
        `);
      }
    }

    newWindow.document.body.innerHTML = `
      <body style="font-family:Arial;padding:30px;background:#f8fafc;">
        <h1 style="margin-bottom:25px;color:#0f172a;">
          Documents utilisateur
        </h1>

        ${
          links.length > 0
            ? links.join("")
            : "<p>Aucun document exploitable trouvé.</p>"
        }
      </body>
    `;
  }

  async function validateProfile(userId) {
    await supabase
      .from("profiles")
      .update({ identity_status: "verified" })
      .eq("id", userId);

    await loadAdminData();
  }

  async function rejectProfile(userId) {
    await supabase
      .from("profiles")
      .update({ identity_status: "rejected" })
      .eq("id", userId);

    await loadAdminData();
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7F5]">
        <p className="text-xl font-black text-slate-700">
          Vérification accès admin...
        </p>
      </main>
    );
  }

  if (!authorized) return null;

  const totalPages = Math.max(1, Math.ceil((count || 0) / limit));

  return (
    <main className="min-h-screen bg-[#F4F7F5] px-6 py-8 text-slate-950">
      <div className="mx-auto max-w-7xl">

        <header className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-emerald-100">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
                Back-office
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-tight">
                Admin Droovo
              </h1>
            </div>

            <Link
              href="/"
              className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-black text-white"
            >
              Retour accueil
            </Link>

          </div>
        </header>

        <section className="mt-6 grid gap-5 md:grid-cols-4">

          <Stat icon={Users} label="Utilisateurs" value={totalUsers} />

          <Stat
            icon={ShieldAlert}
            label="À vérifier"
            value={pendingUsers}
            warning
          />

          <Stat
            icon={BadgeCheck}
            label="Comptes validés"
            value={verifiedUsers}
          />

          <Stat
            icon={CreditCard}
            label="Commissions"
            value="0 €"
          />

        </section>

      </div>
    </main>
  );
}

function Stat({ icon: Icon, label, value, warning }) {
  return (
    <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-emerald-100">

      <Icon
        className={warning ? "text-amber-600" : "text-emerald-700"}
        size={24}
      />

      <p className="mt-4 text-sm font-bold text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-3xl font-black text-slate-950">
        {value}
      </p>

    </div>
  );
}
