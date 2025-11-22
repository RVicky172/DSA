/**
 * Centralized API client for all backend communication
 * Handles authentication, error handling, and request/response types
 */

import type {
  ApiResponse,
  Lesson,
  LessonsData,
  User,
} from '../types/index.js'

const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000'

/**
 * Generic fetch wrapper with error handling and typing
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(typeof options.headers === 'object' && options.headers !== null
      ? Object.fromEntries(
          Object.entries(options.headers).map(([k, v]) => [k, String(v)])
        )
      : {}),
  }

  // Add auth token if available
  const token = localStorage.getItem('authToken')
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: ApiResponse<T> = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Request failed')
    }

    return data.data as T
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error)
    throw error
  }
}

/**
 * Health check endpoint
 */
export async function checkHealth(): Promise<{ ok: boolean }> {
  return apiCall('/api/health')
}

/**
 * Get all lessons
 */
export async function getLessons(): Promise<LessonsData> {
  return apiCall('/api/lessons')
}

/**
 * Get single lesson by ID
 */
export async function getLessonById(id: number): Promise<Lesson> {
  return apiCall(`/api/lessons/${id}`)
}

/**
 * Authentication endpoints (to be implemented)
 */
export async function login(
  email: string,
  password: string
): Promise<{ token: string; user: User }> {
  return apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function signup(
  email: string,
  username: string,
  password: string
): Promise<{ token: string; user: User }> {
  return apiCall('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, username, password }),
  })
}

export async function logout(): Promise<void> {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
}

/**
 * Get current user info
 */
export async function getCurrentUser(): Promise<User> {
  return apiCall('/api/auth/me')
}

/**
 * Problem endpoints (to be implemented)
 */
export async function getProblemsByLessonId(
  lessonId: number
): Promise<Array<{ id: number; title: string }>> {
  return apiCall(`/api/lessons/${lessonId}/problems`)
}

export async function submitSolution(
  problemId: number,
  code: string,
  language: string
): Promise<{ passed: boolean; output: string }> {
  return apiCall('/api/problems/submit', {
    method: 'POST',
    body: JSON.stringify({ problemId, code, language }),
  })
}

export default {
  checkHealth,
  getLessons,
  getLessonById,
  login,
  signup,
  logout,
  getCurrentUser,
  getProblemsByLessonId,
  submitSolution,
}
