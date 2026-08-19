"use client";

import { Capacitor } from "@capacitor/core";

export function getAuthRedirectUrl(path) {
  if (Capacitor.isNativePlatform()) return `droovo://${path.replace(/^\//, "")}`;
  return `${window.location.origin}${path}`;
}
