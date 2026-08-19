"use client";

import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function MobileBridge() {
  useEffect(() => {
    let disposed = false;
    let authSubscription;
    let pushRegistrationStarted = false;
    const listeners = [];

    async function initializeNativeApp() {
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isNativePlatform() || disposed) return;

      document.documentElement.classList.add("capacitor-native");
      const [{ App }, { PushNotifications }] = await Promise.all([
        import("@capacitor/app"),
        import("@capacitor/push-notifications"),
      ]);

      listeners.push(await App.addListener("appUrlOpen", ({ url }) => {
        const target = new URL(url);
        const nativePath = target.protocol === "droovo:" ? `/${target.hostname}${target.pathname}` : target.pathname;
        const route = `${nativePath || "/"}${target.search}${target.hash}`;
        window.location.assign(route);
      }));

      listeners.push(await App.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) window.history.back();
        else App.exitApp();
      }));

      listeners.push(await PushNotifications.addListener("registration", async ({ value }) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        await fetch("/api/mobile/device", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ token: value, platform: Capacitor.getPlatform() }),
        });
      }));

      listeners.push(await PushNotifications.addListener(
        "pushNotificationActionPerformed",
        ({ notification }) => {
          const path = notification.data?.path;
          if (typeof path === "string" && path.startsWith("/")) window.location.assign(path);
        }
      ));

      async function registerForPush(session) {
        if (!session || pushRegistrationStarted) return;
        pushRegistrationStarted = true;
        const permission = await PushNotifications.checkPermissions();
        const finalPermission = permission.receive === "prompt"
          ? await PushNotifications.requestPermissions()
          : permission;
        if (finalPermission.receive === "granted") await PushNotifications.register();
      }

      const { data: { session } } = await supabase.auth.getSession();
      await registerForPush(session);
      const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        registerForPush(nextSession).catch(() => null);
      });
      authSubscription = data.subscription;
    }

    initializeNativeApp().catch((error) => console.error("Initialisation mobile impossible", error));
    return () => {
      disposed = true;
      authSubscription?.unsubscribe();
      listeners.forEach((listener) => listener.remove());
    };
  }, []);

  return null;
}
