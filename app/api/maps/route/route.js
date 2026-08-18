import { getGoogleRoute, mapsError, requireUser } from "../../../../lib/mapsServer";

export async function POST(request) {
  if (!(await requireUser(request))) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const { originPlaceId, destinationPlaceId } = await request.json();
  if (!originPlaceId || !destinationPlaceId) return Response.json({ error: "Trajet incomplet" }, { status: 400 });
  try {
    return Response.json(await getGoogleRoute(originPlaceId, destinationPlaceId));
  } catch (error) {
    return mapsError(error);
  }
}
