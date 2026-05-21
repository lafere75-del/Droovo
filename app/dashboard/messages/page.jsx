"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function MessagesPage() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchUserAndConversations();
  }, []);

  useEffect(() => {
    if (!selectedConversation?.id) return;

    fetchMessages(selectedConversation.id);

    const channel = supabase
      .channel(`messages-booking-${selectedConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `booking_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === payload.new.id);
            if (exists) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  async function fetchUserAndConversations() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUser(null);
      setConversations([]);
      setLoading(false);
      return;
    }

    setUser(user);

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        packages (*),
        trips (*)
      `)
      .or(`sender_id.eq.${user.id},driver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur conversations :", error);
      setConversations([]);
    } else {
      setConversations(data || []);
      if (data && data.length > 0) {
        setSelectedConversation(data[0]);
      }
    }

    setLoading(false);
  }

  async function fetchMessages(bookingId) {
    setLoadingMessages(true);

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erreur messages :", error);
      setMessages([]);
    } else {
      setMessages(data || []);
    }

    setLoadingMessages(false);
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || !selectedConversation?.id || !user?.id) return;

    const receiverId =
      selectedConversation.sender_id === user.id
        ? selectedConversation.driver_id
        : selectedConversation.sender_id;

    setSending(true);

    const { error } = await supabase.from("messages").insert({
      booking_id: selectedConversation.id,
      sender_id: user.id,
      receiver_id: receiverId,
      message: newMessage.trim(),
    });

    if (error) {
      console.error("Erreur envoi message :", error);
      alert("Le message n’a pas pu être envoyé.");
    } else {
      setNewMessage("");
    }

    setSending(false);
  }

  function getConversationTitle(conversation) {
    return conversation.packages?.title || "Conversation livraison";
  }

  function getConversationSubtitle(conversation) {
    const departure =
      conversation.packages?.departure_city ||
      conversation.trips?.departure_city ||
      "Départ";

    const arrival =
      conversation.packages?.arrival_city ||
      conversation.trips?.arrival_city ||
      "Arrivée";

    return `${departure} → ${arrival}`;
  }

  function getTrajetLink(conversation) {
    if (conversation.trip_id) {
      return `/dashboard/mes-trajets/${conversation.trip_id}`;
    }

    if (conversation.package_id) {
      return `/dashboard/mes-colis/${conversation.package_id}`;
    }

    return "/dashboard/mes-trajets";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f7fb] p-6">
        <p className="text-sm text-gray-500">Chargement...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-950">Messages</h1>
            <p className="mt-1 text-sm text-gray-500">
              Échanges liés à vos colis, trajets et réservations.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            ← Retour au dashboard
          </Link>
        </div>

        {!user ? (
          <div className="rounded-[32px] bg-white p-8 text-center shadow-sm">
            <p className="font-semibold text-gray-900">
              Vous devez être connecté pour accéder aux messages.
            </p>
            <Link
              href="/login"
              className="mt-5 inline-block rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white"
            >
              Se connecter
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
            <section className="rounded-[32px] bg-white p-4 shadow-sm">
              <h2 className="mb-4 px-2 text-lg font-bold text-gray-950">
                Conversations
              </h2>

              {conversations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-center">
                  <p className="font-semibold text-gray-900">
                    Aucune conversation
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Les conversations apparaîtront après une réservation.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        selectedConversation?.id === conversation.id
                          ? "border-black bg-black text-white"
                          : "border-gray-100 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <p className="font-semibold">
                        {getConversationTitle(conversation)}
                      </p>

                      <p
                        className={`mt-1 text-sm ${
                          selectedConversation?.id === conversation.id
                            ? "text-gray-300"
                            : "text-gray-500"
                        }`}
                      >
                        {getConversationSubtitle(conversation)}
                      </p>

                      <p
                        className={`mt-2 text-xs ${
                          selectedConversation?.id === conversation.id
                            ? "text-gray-400"
                            : "text-gray-400"
                        }`}
                      >
                        Statut : {conversation.status || "pending"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="flex h-[78vh] flex-col rounded-[32px] bg-white shadow-sm">
              {!selectedConversation ? (
                <div className="flex flex-1 items-center justify-center p-6 text-center">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Sélectionnez une conversation
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Vos messages apparaîtront ici.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-6 py-5">
                    <div>
                      <h2 className="text-xl font-bold text-gray-950">
                        {getConversationTitle(selectedConversation)}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {getConversationSubtitle(selectedConversation)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={getTrajetLink(selectedConversation)}
                        className="rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Voir détail
                      </Link>

                      <Link
                        href={`/dashboard/suivi/${selectedConversation.id}`}
                        className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                      >
                        Suivi
                      </Link>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                    {loadingMessages ? (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-gray-500">
                          Chargement des messages...
                        </p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-center">
                        <div>
                          <p className="font-semibold text-gray-900">
                            Aucun message
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Envoyez le premier message.
                          </p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isMine = message.sender_id === user.id;

                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              isMine ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[75%] rounded-3xl px-5 py-4 ${
                                isMine
                                  ? "bg-black text-white"
                                  : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <p className="text-sm leading-6">
                                {message.message}
                              </p>

                              {message.created_at && (
                                <p
                                  className={`mt-2 text-[11px] ${
                                    isMine ? "text-gray-300" : "text-gray-500"
                                  }`}
                                >
                                  {new Date(message.created_at).toLocaleString(
                                    "fr-FR",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="border-t border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendMessage();
                        }}
                        placeholder="Écrire un message..."
                        className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm outline-none focus:border-black"
                      />

                      <button
                        onClick={handleSendMessage}
                        disabled={sending || !newMessage.trim()}
                        className="rounded-2xl bg-black px-5 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {sending ? "Envoi..." : "Envoyer"}
                      </button>
                    </div>

                    <p className="mt-3 text-xs text-gray-500">
                      Les nouveaux messages apparaissent en temps réel.
                    </p>
                  </div>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
