export function ok<T>(data: T) {
  return { success: true, data, error: null };
}

export function fail(code: string, message: string) {
  return {
    success: false,
    data: null,
    error: { code, message },
  };
}