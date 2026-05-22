"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadNotifications() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    setNotifications(data || []);
    setLoading(false);
  }

  async function markAsRead(id) {
    await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("id", id);

    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, is_read: true } : notif
      )
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F7F5] px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
              Centre de notifications
            </p>

            <h1 className="mt-2 text-4xl font-black text-slate-950">
              Notifications
            </h1>
          </div>

          <Link
            href="/dashboard"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white"
          >
            Retour dashboard
          </Link>
        </div>

        {loading ? (
          <div className="rounded-[2rem] bg-white p-8">
            <p className="font-black text-slate-600">Chargement...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm ring-1 ring-emerald-100">
            <Bell size={42} className="mx-auto text-emerald-600" />

            <h2 className="mt-5 text-2xl font-black text-slate-950">
              Aucune notification
            </h2>

            <p className="mt-2 text-slate-500">
              Vos notifications apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`w-full rounded-[2rem] p-6 text-left shadow-sm ring-1 transition ${
                  notif.is_read
                    ? "bg-white ring-slate-100"
                    : "bg-emerald-50 ring-emerald-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-black text-slate-950">
                      {notif.title || "Notification"}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      {notif.message}
                    </p>

                    <p className="mt-4 text-xs font-bold text-slate-400">
                      {new Date(notif.created_at).toLocaleString("fr-FR")}
                    </p>
                  </div>

                  {!notif.is_read && (
                    <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white">
                      Nouveau
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
