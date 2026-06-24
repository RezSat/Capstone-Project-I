export function getApiKey(headers: Headers) {
  return headers.get("x-api-key")?.trim() || null;
}