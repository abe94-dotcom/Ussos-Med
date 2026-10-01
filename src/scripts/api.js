export async function api(action, data) {
  const method = data === undefined ? 'GET' : 'POST';
  const url = method === 'GET' ? `/api/commerce?action=${encodeURIComponent(action)}` : '/api/commerce';
  const response = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: method === 'POST' ? { 'Content-Type': 'application/json' } : {},
    body: method === 'POST' ? JSON.stringify({ action, ...data }) : undefined,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Request failed');
  return result;
}
