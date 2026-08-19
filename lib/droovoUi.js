export function isRouteCompatible(trip, pkg) {
  const normalize = (value) => String(value || "").toLowerCase().trim();
  return normalize(trip.departure_city) === normalize(pkg.departure_city)
    && normalize(trip.arrival_city) === normalize(pkg.arrival_city)
    && trip.trip_date === pkg.desired_date
    && Number(trip.available_weight) >= Number(pkg.weight);
}

export function formatDeliveryStatus(status) {
  return {
    booking_created: "Demande créée",
    accepted: "Acceptée",
    authorized: "Préautorisé",
    paid: "Payée",
    picked_up: "Colis récupéré",
    in_transit: "En cours de livraison",
    delivered: "Livré",
    payout: "Versement effectué",
    completed: "Terminée",
    cancelled: "Annulé",
    dispute: "Litige",
  }[status] || status;
}
