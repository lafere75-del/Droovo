import { googleMapsFetch, mapsError, requireUser } from "../../../../lib/mapsServer";

export async function GET(request) {
  if (!(await requireUser(request))) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query || query.length < 3) return Response.json({ suggestions: [] });

  try {
    const response = await googleMapsFetch("v1/places:autocomplete", {
      method: "POST",
      body: JSON.stringify({ input: query, includedRegionCodes: ["fr"], languageCode: "fr" }),
    });
    if (!response.ok) throw new Error("GOOGLE_MAPS_REQUEST_FAILED");
    const data = await response.json();
    const suggestions = (data.suggestions || []).flatMap((item) => {
      const place = item.placePrediction;
      return place ? [{ placeId: place.placeId, label: place.text?.text || "" }] : [];
    });
    return Response.json({ suggestions });
  } catch (error) {
    return mapsError(error);
  }
}
