/**
 * Centralized API client for all backend communication
 * Handles authentication, error handling, and request/response types
 */

import type {
  ApiResponse,
  Lesson,
  LessonsData,
  User,
} from '../types/index'

const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000'

console.log('🔌 API_URL configured as:', API_URL)

/**
 * Generic fetch wrapper with error handling and typing
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`
  
  console.log(`📡 API Call: ${options.method || 'GET'} ${url}`)

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
    console.log('✓ Authorization token added')
  }

  try {
    console.log('📤 Sending request with headers:', headers)
    
    const response = await fetch(url, {
      ...options,
      headers,
    })

    console.log(`📥 Response status: ${response.status}`)

    // Handle network errors
    if (!response.ok) {
      let errorMessage = 'Request failed'
      
      try {
        const errorData: ApiResponse<null> = await response.json()
        errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`
      }

      console.error(`❌ HTTP error! status: ${response.status}, message: ${errorMessage}`)
      throw new Error(errorMessage)
    }

    const data: ApiResponse<T> = await response.json()
    
    console.log('✅ Response received:', data)

    if (!data.success) {
      const error = data.error || 'Request failed'
      console.error('❌ API returned error:', error)
      throw new Error(error)
    }

    console.log('✓ API call successful')
    return data.data as T
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    console.error(`❌ API call failed for ${endpoint}:`, errorMessage)
    throw new Error(errorMessage)
  }
}

/**
 * Health check endpoint
 */
export async function checkHealth(): Promise<{ ok: boolean }> {
  try {
    const response = await fetch(`${API_URL}/api/health`)
    const data = await response.json()
    return data.data || { ok: response.ok }
  } catch (error) {
    console.error('Health check failed:', error)
    throw error
  }
}

/**
 * Get all lessons
 */
export async function getLessons(): Promise<LessonsData> {
  return apiCall('/api/v1/lessons')
}

/**
 * Get single lesson by ID
 */
export async function getLessonById(id: number): Promise<Lesson> {
  return apiCall(`/api/v1/lessons/${id}`)
}

/**
 * Authentication endpoints
 */
export async function login(
  email: string,
  password: string
): Promise<{ token: string; user: User }> {
  return apiCall('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function signup(
  email: string,
  username: string,
  password: string
): Promise<{ token: string; user: User }> {
  return apiCall('/api/v1/auth/signup', {
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
  return apiCall('/api/v1/auth/me')
}

/**
 * Problem endpoints
 */
export async function getProblemsByLessonId(
  lessonId: number
): Promise<Array<{ id: number; title: string }>> {
  return apiCall(`/api/v1/lessons/${lessonId}/problems`)
}

export async function submitSolution(
  problemId: number,
  code: string,
  language: string
): Promise<{ passed: boolean; output: string }> {
  return apiCall('/api/v1/problems/submit', {
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
