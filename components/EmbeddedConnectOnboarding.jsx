"use client";

import { loadConnectAndInitialize } from "@stripe/connect-js/pure";
import { ConnectAccountOnboarding, ConnectComponentsProvider } from "@stripe/react-connect-js";
import { useMemo, useRef, useState } from "react";

export default function EmbeddedConnectOnboarding({ initialClientSecret, publishableKey, fetchClientSecret, onExit }) {
  const firstSecret = useRef(initialClientSecret);
  const [error, setError] = useState("");

  const connectInstance = useMemo(
    () =>
      loadConnectAndInitialize({
        publishableKey,
        locale: "fr-FR",
        fetchClientSecret: async () => {
          if (firstSecret.current) {
            const secret = firstSecret.current;
            firstSecret.current = null;
            return secret;
          }
          return fetchClientSecret();
        },
        appearance: {
          variables: {
            colorPrimary: "#059669",
            colorBackground: "#ffffff",
            colorText: "#0f172a",
            borderRadius: "16px",
            fontFamily: "inherit",
          },
        },
      }),
    [fetchClientSecret, publishableKey]
  );

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-2">
      <ConnectComponentsProvider connectInstance={connectInstance}>
        <ConnectAccountOnboarding
          onExit={onExit}
          onLoadError={({ error: loadError }) =>
            setError(loadError?.message || "Le formulaire bancaire n’a pas pu être chargé.")
          }
        />
      </ConnectComponentsProvider>
      {error ? <p className="p-3 text-sm font-bold text-red-600">{error}</p> : null}
    </div>
  );
}
