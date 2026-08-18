import { createUserClient, requireUser } from "./mapsServer";

export async function requireApiUser(request) {
  const user = await requireUser(request);
  if (!user) {
    return { response: Response.json({ error: "Non autorisé" }, { status: 401 }) };
  }
  return { user, client: createUserClient(request) };
}
