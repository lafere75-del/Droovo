import { getGoogleReverseGeocode, mapsError, requireUser } from "../../../../lib/mapsServer";

export async function GET(request) {
  if (!(await requireUser(request))) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const latitude = Number(params.get("latitude"));
  const longitude = Number(params.get("longitude"));
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return Response.json({ error: "Position invalide." }, { status: 400 });
  }
  try {
    return Response.json(await getGoogleReverseGeocode(latitude, longitude));
  } catch (error) {
    return mapsError(error);
  }
}
