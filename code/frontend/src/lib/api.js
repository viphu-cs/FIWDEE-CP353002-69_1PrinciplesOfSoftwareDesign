/**
 * API Client Abstraction Layer (DIP: High-level UI relies on API abstraction)
 * Base URL: import.meta.env.VITE_API_URL || '/api'
 * Supports JWT Bearer token from localStorage
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export async function apiClient(endpoint, options = {}) {
  const token = localStorage.getItem('fiwdee_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  try {
    const res = await fetch(url, { ...options, headers })
    const data = await res.json().catch(() => null)

    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        message: data?.message || `Request failed with status ${res.status}`,
        errors: data?.errors,
      }
    }

    return {
      success: true,
      data: data?.data ?? data,
      message: data?.message || 'Success',
    }
  } catch (err) {
    return {
      success: false,
      message: err.message || 'Network connection error',
    }
  }
}

export const api = {
  get: (endpoint, headers) => apiClient(endpoint, { method: 'GET', headers }),
  post: (endpoint, body, headers) =>
    apiClient(endpoint, { method: 'POST', body: JSON.stringify(body), headers }),
  put: (endpoint, body, headers) =>
    apiClient(endpoint, { method: 'PUT', body: JSON.stringify(body), headers }),
  patch: (endpoint, body, headers) =>
    apiClient(endpoint, { method: 'PATCH', body: JSON.stringify(body), headers }),
  delete: (endpoint, headers) => apiClient(endpoint, { method: 'DELETE', headers }),
}
