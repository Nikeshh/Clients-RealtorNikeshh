type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: HeadersInit;
};

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { method = 'GET', body, headers = {} } = options;

  const response = await fetch(`/api${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

// Client API functions
export const clientApi = {
  getAll: () => fetchApi('/clients'),
  getById: (id: string) => fetchApi(`/clients/${id}`),
  create: (data: any) => fetchApi('/clients', { method: 'POST', body: data }),
  update: (id: string, data: any) => fetchApi(`/clients/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => fetchApi(`/clients/${id}`, { method: 'DELETE' }),
  addInteraction: (clientId: string, data: any) => 
    fetchApi(`/clients/${clientId}/interactions`, { method: 'POST', body: data }),
};

// Property API functions
export const propertyApi = {
  getAll: () => fetchApi('/properties'),
  getById: (id: string) => fetchApi(`/properties/${id}`),
  create: (data: any) => fetchApi('/properties', { method: 'POST', body: data }),
  update: (id: string, data: any) => fetchApi(`/properties/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => fetchApi(`/properties/${id}`, { method: 'DELETE' }),
  search: (params: URLSearchParams) => fetchApi(`/properties/search?${params}`),
  share: (id: string, data: any) => 
    fetchApi(`/properties/${id}/share`, { method: 'POST', body: data }),
}; 