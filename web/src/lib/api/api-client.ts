import { client } from './client.gen';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export { client };

export function configureApiClient() {
  client.setConfig({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  });

  // Add auth token to requests
  client.interceptors.request.use((request) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        request.headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return request;
  });

  // Handle 401 - try refresh, then redirect
  client.interceptors.response.use(async (response) => {
    if (response.status === 401 && typeof window !== 'undefined') {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
          // SDK paths already include /api/v1, but refresh is called manually
          method: 'POST',
          credentials: 'include',
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          const newToken = data?.data?.access_token ?? data?.access_token;
          if (newToken) {
            localStorage.setItem('access_token', newToken);
            // Retry original request
            const retryRes = await fetch(response.url, {
              ...response,
              headers: {
                ...Object.fromEntries(new Headers(response.headers as any)),
                Authorization: `Bearer ${newToken}`,
              },
            });
            return retryRes;
          }
        }
      } catch {
        // Refresh failed
      }

      localStorage.removeItem('access_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_context');
      window.location.href = '/login';
    }
    return response;
  });
}
