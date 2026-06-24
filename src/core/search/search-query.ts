export const SEARCH_QUERY_PARAM = "q";

const LEGACY_SEARCH_QUERY_PARAM = "search";

export function normalizeSearchQuery(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export function readSearchQuery(searchParams: URLSearchParams) {
  const rawValue =
    searchParams.get(SEARCH_QUERY_PARAM) ??
    searchParams.get(LEGACY_SEARCH_QUERY_PARAM);

  return normalizeSearchQuery(rawValue);
}
