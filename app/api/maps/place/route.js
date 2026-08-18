import { getGooglePlace, mapsError, requireUser } from "../../../../lib/mapsServer";

export async function GET(request) {
  if (!(await requireUser(request))) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const placeId = new URL(request.url).searchParams.get("placeId")?.trim();
  if (!placeId) return Response.json({ error: "Lieu manquant" }, { status: 400 });

  try {
    return Response.json(await getGooglePlace(placeId));
  } catch (error) {
    return mapsError(error);
  }
}
