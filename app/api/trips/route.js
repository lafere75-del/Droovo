import { calculatePricing } from "../../../lib/pricing";
import { createUserClient, getGooglePlace, getGoogleRoute, mapsError, requireUser } from "../../../lib/mapsServer";

export async function POST(request) {
  const user = await requireUser(request);
  if (!user) return Response.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const availableWeight = Number(body.availableWeight);
    const today = new Date().toISOString().slice(0, 10);
    if (!body.originPlaceId || !body.destinationPlaceId
      || !/^\d{4}-\d{2}-\d{2}$/.test(body.tripDate) || body.tripDate < today
      || !Number.isFinite(availableWeight) || availableWeight < 1 || availableWeight > 30) {
      return Response.json({ error: "Informations du trajet invalides." }, { status: 400 });
    }

    const [origin, destination, route] = await Promise.all([
      getGooglePlace(body.originPlaceId),
      getGooglePlace(body.destinationPlaceId),
      getGoogleRoute(body.originPlaceId, body.destinationPlaceId),
    ]);
    const pricing = calculatePricing(availableWeight, route.distanceMeters / 1000);
    const client = createUserClient(request);
    const { data, error } = await client.from("trips").insert({
      user_id: user.id,
      departure_city: origin.city,
      arrival_city: destination.city,
      departure_address: origin.address,
      arrival_address: destination.address,
      departure_place_id: origin.placeId,
      arrival_place_id: destination.placeId,
      departure_latitude: origin.latitude,
      departure_longitude: origin.longitude,
      arrival_latitude: destination.latitude,
      arrival_longitude: destination.longitude,
      distance_meters: route.distanceMeters,
      duration_seconds: route.durationSeconds,
      route_polyline: route.encodedPolyline,
      trip_date: body.tripDate,
      available_weight: availableWeight,
      estimated_gain: Number(pricing.driverGain),
      status: "active",
    }).select("id,estimated_gain,distance_meters,duration_seconds").single();

    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json(data, { status: 201 });
  } catch (error) {
    return mapsError(error);
  }
}
