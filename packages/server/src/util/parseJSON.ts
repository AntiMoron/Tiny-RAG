export default function parseJSON<T>(jsonString?: string): T | undefined {
  if (!jsonString) {
    return undefined;
  }
  try {
    return JSON.parse(jsonString) as unknown as T;
  } catch {
    return undefined;
  }
}
