"use client";

import Link from "next/link";
import { useState } from "react";

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(1);
  const [newMessage, setNewMessage] = useState("");

  // Plus tard → connecté à Supabase
  const conversations = [
    {
      id: 1,
      name: "Thomas",
      verified: true,
      trajet: "Paris → Lyon",
      unread: 2,
      lastMessage: "Le colis sera remis demain matin.",
      time: "12:42",
      messages: [
        {
          id: 1,
          sender: "Thomas",
          text: "Bonjour, êtes-vous toujours disponible pour la livraison ?",
          mine: false,
          time: "11:20",
        },
        {
          id: 2,
          sender: "Moi",
          text: "Oui, le trajet est confirmé.",
          mine: true,
          time: "11:35",
        },
        {
          id: 3,
          sender: "Thomas",
          text: "Le colis sera remis demain matin.",
          mine: false,
          time: "12:42",
        },
      ],
    },

    {
      id: 2,
      name: "Sarah",
      verified: false,
      trajet: "Marseille → Nice",
      unread: 0,
      lastMessage: "Merci pour les informations.",
      time: "Hier",
      messages: [
        {
          id: 1,
          sender: "Sarah",
          text: "Merci pour les informations.",
          mine: false,
          time: "18:10",
        },
      ],
    },
  ];

  const activeConversation = conversations.find(
    (conv) => conv.id === selectedConversation
  );

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    alert(
      "Message envoyé localement. La connexion Supabase sera ajoutée ensuite."
    );

    setNewMessage("");
  };

  return (
    <main className="min-h-screen bg-[#f6f7fb] p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-950">
              Messages
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Échangez avec les expéditeurs et transporteurs.
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
          {/* Sidebar conversations */}
          <section className="rounded-[32px] bg-white p-4 shadow-sm">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Rechercher une conversation..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

            <div className="space-y-3">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() =>
                    setSelectedConversation(conversation.id)
                  }
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedConversation === conversation.id
                      ? "border-black bg-black text-white"
                      : "border-gray-100 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          {conversation.name}
                        </p>

                        {conversation.verified && (
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                              selectedConversation === conversation.id
                                ? "bg-white/20 text-white"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            Vérifié
                          </span>
                        )}
                      </div>

                      <p
                        className={`mt-1 text-xs ${
                          selectedConversation === conversation.id
                            ? "text-gray-300"
                            : "text-gray-500"
                        }`}
                      >
                        {conversation.trajet}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-xs ${
                          selectedConversation === conversation.id
                            ? "text-gray-300"
                            : "text-gray-400"
                        }`}
                      >
                        {conversation.time}
                      </p>

                      {conversation.unread > 0 && (
                        <div className="mt-2 flex justify-end">
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">
                            {conversation.unread}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p
                    className={`mt-3 truncate text-sm ${
                      selectedConversation === conversation.id
                        ? "text-gray-200"
                        : "text-gray-500"
                    }`}
                  >
                    {conversation.lastMessage}
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* Chat */}
          <section className="flex h-[78vh] flex-col rounded-[32px] bg-white shadow-sm">
            {activeConversation ? (
              <>
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-950">
                        {activeConversation.name}
                      </h2>

                      {activeConversation.verified && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Profil vérifié
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      Livraison liée au trajet :
                      {" "}
                      {activeConversation.trajet}
                    </p>
                  </div>

                  <button className="rounded-2xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Voir le trajet
                  </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                  {activeConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.mine
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-3xl px-5 py-4 ${
                          message.mine
                            ? "bg-black text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm leading-6">
                          {message.text}
                        </p>

                        <p
                          className={`mt-2 text-[11px] ${
                            message.mine
                              ? "text-gray-300"
                              : "text-gray-500"
                          }`}
                        >
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 p-5">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) =>
                        setNewMessage(e.target.value)
                      }
                      placeholder="Écrire un message..."
                      className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm outline-none focus:border-black"
                    />

                    <button
                      onClick={handleSendMessage}
                      className="rounded-2xl bg-black px-5 py-4 text-sm font-semibold text-white hover:opacity-90"
                    >
                      Envoyer
                    </button>
                  </div>

                  <p className="mt-3 text-xs text-gray-500">
                    Ne partagez jamais d’informations sensibles ou de paiement en dehors de Droovo.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-gray-500">
                  Sélectionnez une conversation.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
