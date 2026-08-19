export function normalizeLegalName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .sort()
    .join(" ");
}

export function legalNamesMatch(first, second) {
  const normalizedFirst = normalizeLegalName(first);
  return Boolean(normalizedFirst) && normalizedFirst === normalizeLegalName(second);
}

export function getStripeIdentityName(account) {
  const individual = account?.identity?.individual;
  return [individual?.given_name, individual?.surname].filter(Boolean).join(" ");
}
