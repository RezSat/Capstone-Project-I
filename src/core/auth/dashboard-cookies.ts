export function isDashboardAuthCookieName(name: string) {
  if (!name.startsWith("sb-")) {
    return false;
  }

  return name.includes("auth-token") || name.includes("code-verifier");
}

export function hasDashboardAuthCookie(cookieNames: string[]) {
  return cookieNames.some(isDashboardAuthCookieName);
}
