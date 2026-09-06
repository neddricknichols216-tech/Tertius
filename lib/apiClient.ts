export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = path.startsWith('/') ? path : `/${path}`;
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`apiFetch ${res.status}: ${text}`);
  }
  return res.json();
}
