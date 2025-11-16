/**
 * Common TypeScript types and interfaces for the DSA backend
 */

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface User {
  id: string
  email: string
  username: string
  role: 'student' | 'instructor' | 'admin'
  createdAt: Date
  updatedAt: Date
}

export interface Lesson {
  id: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  category: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface Problem {
  id: string
  lessonId: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  testCases: TestCase[]
  initialCode: string
  createdAt: Date
  updatedAt: Date
}

export interface TestCase {
  id: string
  input: string
  output: string
  problemId: string
  createdAt: Date
  updatedAt: Date
}

export interface JwtPayload {
  userId: string
  email: string
  role: string
  iat: number
  exp: number
}

export interface AuthRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LessonRequest {
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  category: string
  content: string
}

export interface ProblemRequest {
  lessonId: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  initialCode: string
  testCases: Array<{ input: string; output: string }>
}
