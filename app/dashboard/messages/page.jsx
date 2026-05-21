"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation?.id) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  async function fetchConversations() {
    setLoading(true);

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur conversations :", error);
      setConversations([]);
    } else {
      setConversations(data || []);
    }

    setLoading(false);
  }

  async function fetchMessages(conversationId) {
    setLoadingMessages(true);

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
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
    if (!newMessage.trim() || !selectedConversation?.id) return;

    setSending(true);

    const { error } = await supabase.from("messages").insert([
      {
        conversation_id: selectedConversation.id,
        content: newMessage.trim(),
        sender_type: "me",
      },
    ]);

    if (error) {
      console.error("Erreur envoi message :", error);
      alert("Le message n’a pas pu être envoyé.");
    } else {
      setNewMessage("");
      await fetchMessages(selectedConversation.id);
    }

    setSending(false);
  }

  function getTrajetLink(conversation) {
    if (!conversation) return "/dashboard/mes-trajets";

    if (conversation.trajet_id) {
      return `/dashboard/mes-trajets/${conversation.trajet_id}`;
    }

    if (conversation.colis_id) {
      return `/dashboard/mes-colis/${conversation.colis_id}`;
    }

    return "/dashboard/mes-trajets";
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-950">Messages</h1>
            <p className="mt-1 text-sm text-gray-500">
              Retrouvez vos échanges liés aux colis et aux trajets.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            ← Retour au dashboard
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <section className="rounded-[32px] bg-white p-4 shadow-sm">
            <h2 className="mb-4 px-2 text-lg font-bold text-gray-950">
              Conversations
            </h2>

            {loading ? (
              <p className="px-2 text-sm text-gray-500">Chargement...</p>
            ) : conversations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-center">
                <p className="font-semibold text-gray-900">
                  Aucune conversation
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Les conversations apparaîtront lorsqu’un échange sera créé
                  autour d’un colis ou d’un trajet.
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
                      {conversation.title || "Conversation"}
                    </p>

                    <p
                      className={`mt-1 text-sm ${
                        selectedConversation?.id === conversation.id
                          ? "text-gray-300"
                          : "text-gray-500"
                      }`}
                    >
                      {conversation.subtitle || "Échange lié à une livraison"}
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
                      {selectedConversation.title || "Conversation"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {selectedConversation.subtitle ||
                        "Discussion liée à une livraison"}
                    </p>
                  </div>

                  <Link
                    href={getTrajetLink(selectedConversation)}
                    className="rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Voir le trajet
                  </Link>
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
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_type === "me"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-3xl px-5 py-4 ${
                            message.sender_type === "me"
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm leading-6">
                            {message.content}
                          </p>

                          {message.created_at && (
                            <p
                              className={`mt-2 text-[11px] ${
                                message.sender_type === "me"
                                  ? "text-gray-300"
                                  : "text-gray-500"
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
                    ))
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
                    Ne partagez pas de paiement ou d’informations sensibles en
                    dehors de Droovo.
                  </p>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
