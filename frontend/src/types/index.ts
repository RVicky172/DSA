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

export interface TestCase {
  id: string
  input: string
  output: string
  isHidden: boolean
}

export interface Problem {
  id: string
  title: string
  description: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  initialCode: string
  language: string
  lessonId: string
  testCases?: TestCase[]
}

export interface ExecutionResult {
  stdout: string
  stderr: string
  exitCode: number
  executionTime: number
  memoryUsage: number
  error?: string
}

export interface TestResult {
  input: string
  expectedOutput: string
  actualOutput: string
  status: 'PASSED' | 'FAILED' | 'ERROR'
  executionTime: number
}

export interface SubmissionResult {
  submissionId: string
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR'
  score: number
  testResults: TestResult[]
}

export interface Submission {
  id: string
  code: string
  language: string
  status: string
  result: string | null
  score: number
  createdAt: string
}

export interface ProblemSolution {
  code: string
  language: string
  output: string
  passed: boolean
}
