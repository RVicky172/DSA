/**
 * Frontend types and interfaces for the DSA learning platform
 */

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface Lesson {
  id: number
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  category: string
  description: string
  content: string
}

export interface LessonsData {
  lessons: Lesson[]
}

export interface User {
  id: string
  email: string
  username: string
  role: 'student' | 'instructor' | 'admin'
}

export interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  signup: (
    email: string,
    username: string,
    password: string
  ) => Promise<void>
}

export interface LessonContextType {
  lessons: Lesson[]
  loading: boolean
  error: string | null
  fetchLessons: () => Promise<void>
}

export interface ProblemSolution {
  code: string
  language: string
  output: string
  passed: boolean
}
