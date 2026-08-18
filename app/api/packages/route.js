import { calculatePricing } from "../../../lib/pricing";
import { createUserClient, getGooglePlace, getGoogleRoute, mapsError, requireUser } from "../../../lib/mapsServer";

export async function POST(request) {
  const user = await requireUser(request);
  if (!user) return Response.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const weight = Number(body.weight);
    const today = new Date().toISOString().slice(0, 10);
    const recipient = body.recipient || {};
    const recipientName = recipient.fullName?.trim() || "";
    const recipientEmail = recipient.email?.trim().toLowerCase() || "";
    const recipientPhone = recipient.phone?.trim() || "";
    const recipientContactValid = recipient.isSender === true || (
      recipient.isSender === false
      && recipientName.length > 1 && recipientName.length <= 120
      && (recipientEmail || recipientPhone)
      && recipientEmail.length <= 254 && recipientPhone.length <= 30
      && (!recipientEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail))
      && recipient.consentConfirmed === true
    );
    if (!body.originPlaceId || !body.destinationPlaceId || !body.title?.trim()
      || !/^\d{4}-\d{2}-\d{2}$/.test(body.desiredDate) || body.desiredDate < today
      || body.title.trim().length > 120 || (body.description?.length || 0) > 2000
      || !Number.isFinite(weight) || weight < 1 || weight > 20 || !recipientContactValid) {
      return Response.json({ error: "Informations du colis invalides." }, { status: 400 });
    }

    const [origin, destination, route] = await Promise.all([
      getGooglePlace(body.originPlaceId),
      getGooglePlace(body.destinationPlaceId),
      getGoogleRoute(body.originPlaceId, body.destinationPlaceId),
    ]);
    const pricing = calculatePricing(weight, route.distanceMeters / 1000);
    const client = createUserClient(request);
    const { data, error } = await client.from("packages").insert({
      user_id: user.id,
      title: body.title.trim(),
      description: body.description?.trim() || null,
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
      desired_date: body.desiredDate,
      weight,
      price: Number(pricing.droovoPrice),
      image_url: body.imageUrl || null,
      status: "active",
    }).select("id,price,distance_meters,duration_seconds").single();

    if (error) return Response.json({ error: error.message }, { status: 400 });

    const { error: recipientError } = await client.from("package_recipients").insert({
      package_id: data.id,
      sender_id: user.id,
      is_sender: recipient.isSender === true,
      full_name: recipient.isSender ? null : recipientName,
      email: recipient.isSender ? null : recipientEmail || null,
      phone: recipient.isSender ? null : recipientPhone || null,
      consent_confirmed_at: recipient.isSender ? null : new Date().toISOString(),
    });

    if (recipientError) {
      await client.from("packages").delete().eq("id", data.id);
      return Response.json({ error: "Impossible d’enregistrer le destinataire." }, { status: 400 });
    }
    return Response.json(data, { status: 201 });
  } catch (error) {
    return mapsError(error);
  }
}
