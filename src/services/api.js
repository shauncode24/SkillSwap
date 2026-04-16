export const BASE_URL = 'http://localhost:5000';

/**
 * apiFetch - Utility for making API calls to the SkillSwap backend.
 * @param {string} path - The API endpoint path (e.g. '/api/auth/login')
 * @param {object} options - Fetch options (method, body, etc.)
 * @param {string|null} token - Optional JWT token for authenticated requests
 * @returns {Promise<object>} Parsed JSON response
 * @throws {Error} If the response indicates failure (success: false)
 */
export async function apiFetch(path, options = {}, token = null) {
  const url = `${BASE_URL}${path}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}
