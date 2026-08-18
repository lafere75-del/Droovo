import { createClient } from "@supabase/supabase-js";
import { supabase, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./supabaseClient";

export function getBearerToken(request) {
  const authorization = request.headers.get("authorization") || "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
}

export async function requireUser(request) {
  const token = getBearerToken(request);
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  return error ? null : data.user;
}

export function createUserClient(request) {
  const token = getBearerToken(request);
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function googleMapsFetch(path, options = {}) {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_MAPS_NOT_CONFIGURED");

  return fetch(`https://places.googleapis.com/${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
}

export async function getGooglePlace(placeId) {
  if (!process.env.GOOGLE_MAPS_SERVER_API_KEY && placeId?.startsWith("test:")) {
    const label = decodeURIComponent(placeId.slice(5));
    return {
      placeId,
      address: label,
      city: label,
      latitude: null,
      longitude: null,
    };
  }

  const response = await googleMapsFetch(`v1/places/${encodeURIComponent(placeId)}?languageCode=fr`, {
    headers: { "X-Goog-FieldMask": "id,formattedAddress,addressComponents,location" },
  });
  if (!response.ok) throw new Error("GOOGLE_MAPS_REQUEST_FAILED");
  const place = await response.json();
  const components = place.addressComponents || [];
  const cityComponent = components.find((part) => part.types?.includes("locality"))
    || components.find((part) => part.types?.includes("postal_town"))
    || components.find((part) => part.types?.includes("administrative_area_level_2"));
  return {
    placeId: place.id,
    address: place.formattedAddress,
    city: cityComponent?.longText || place.formattedAddress,
    latitude: place.location?.latitude,
    longitude: place.location?.longitude,
  };
}

export async function getGoogleRoute(originPlaceId, destinationPlaceId) {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!apiKey && originPlaceId?.startsWith("test:") && destinationPlaceId?.startsWith("test:")) {
    return {
      distanceMeters: 100000,
      durationSeconds: 5400,
      encodedPolyline: null,
    };
  }
  if (!apiKey) throw new Error("GOOGLE_MAPS_NOT_CONFIGURED");
  const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline",
    },
    body: JSON.stringify({
      origin: { placeId: originPlaceId }, destination: { placeId: destinationPlaceId },
      travelMode: "DRIVE", routingPreference: "TRAFFIC_UNAWARE",
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("GOOGLE_MAPS_REQUEST_FAILED");
  const route = (await response.json()).routes?.[0];
  if (!route) throw new Error("ROUTE_NOT_FOUND");
  return {
    distanceMeters: route.distanceMeters,
    durationSeconds: Number(String(route.duration || "0s").replace("s", "")),
    encodedPolyline: route.polyline?.encodedPolyline || null,
  };
}

export function mapsError(error) {
  if (error?.message === "GOOGLE_MAPS_NOT_CONFIGURED") {
    return Response.json({ error: "La géolocalisation est en cours de configuration." }, { status: 503 });
  }
  return Response.json({ error: "Service de géolocalisation indisponible." }, { status: 502 });
}
