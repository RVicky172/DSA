# Frontend API Service Guide

Create a centralized API client for all backend communications.

---

## Create API Service

**`frontend/src/services/api.js`**

```javascript
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Token management
let accessToken = null
let refreshToken = null

// Load tokens from localStorage on app start
const initializeTokens = () => {
  accessToken = localStorage.getItem('accessToken')
  refreshToken = localStorage.getItem('refreshToken')
}

initializeTokens()

// Request interceptor - attach token to headers
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // If 401 and we have a refresh token, try to refresh
    if (error.response?.status === 401 && refreshToken && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const response = await axios.post(`${API_URL}/v1/auth/refresh`, {
          refreshToken
        })
        
        accessToken = response.data.accessToken
        localStorage.setItem('accessToken', accessToken)
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout user
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// Token setters
const setTokens = (newAccessToken, newRefreshToken) => {
  accessToken = newAccessToken
  refreshToken = newRefreshToken
  localStorage.setItem('accessToken', newAccessToken)
  localStorage.setItem('refreshToken', newRefreshToken)
}

const clearTokens = () => {
  accessToken = null
  refreshToken = null
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

// ============ AUTH ENDPOINTS ============

const auth = {
  signup: async (email, password, firstName, lastName) => {
    const response = await api.post('/v1/auth/signup', {
      email,
      password,
      firstName,
      lastName
    })
    
    if (response.data.accessToken && response.data.refreshToken) {
      setTokens(response.data.accessToken, response.data.refreshToken)
    }
    
    return response.data
  },
  
  login: async (email, password) => {
    const response = await api.post('/v1/auth/login', {
      email,
      password
    })
    
    if (response.data.accessToken && response.data.refreshToken) {
      setTokens(response.data.accessToken, response.data.refreshToken)
    }
    
    return response.data
  },
  
  logout: () => {
    clearTokens()
  },
  
  refreshAccessToken: async () => {
    const response = await api.post('/v1/auth/refresh', {
      refreshToken
    })
    
    accessToken = response.data.accessToken
    localStorage.setItem('accessToken', accessToken)
    
    return response.data
  }
}

// ============ LESSON ENDPOINTS ============

const lessons = {
  getAll: async (params = {}) => {
    const response = await api.get('/v1/lessons', { params })
    return response.data
  },
  
  getById: async (id) => {
    const response = await api.get(`/v1/lessons/${id}`)
    return response.data
  },
  
  create: async (data) => {
    const response = await api.post('/v1/lessons', data)
    return response.data
  },
  
  update: async (id, data) => {
    const response = await api.put(`/v1/lessons/${id}`, data)
    return response.data
  },
  
  delete: async (id) => {
    const response = await api.delete(`/v1/lessons/${id}`)
    return response.data
  }
}

// ============ USER ENDPOINTS ============

const users = {
  getProfile: async () => {
    const response = await api.get('/v1/users/profile')
    return response.data
  },
  
  updateProfile: async (data) => {
    const response = await api.put('/v1/users/profile', data)
    return response.data
  },
  
  getProgress: async () => {
    const response = await api.get('/v1/users/progress')
    return response.data
  }
}

// ============ PROBLEM ENDPOINTS ============

const problems = {
  getByLessonId: async (lessonId, params = {}) => {
    const response = await api.get(`/v1/lessons/${lessonId}/problems`, { params })
    return response.data
  },
  
  getById: async (id) => {
    const response = await api.get(`/v1/problems/${id}`)
    return response.data
  },
  
  submit: async (id, code, language) => {
    const response = await api.post(`/v1/problems/${id}/submit`, {
      code,
      language
    })
    return response.data
  }
}

// ============ SUBSCRIPTION ENDPOINTS ============

const subscription = {
  upgrade: async (plan) => {
    const response = await api.post('/v1/subscription/upgrade', { plan })
    return response.data
  },
  
  cancel: async () => {
    const response = await api.post('/v1/subscription/cancel')
    return response.data
  }
}

// ============ TESTIMONIAL ENDPOINTS ============

const testimonials = {
  getAll: async (params = {}) => {
    const response = await api.get('/v1/testimonials', { params })
    return response.data
  },
  
  submit: async (rating, text) => {
    const response = await api.post('/v1/testimonials', {
      rating,
      text
    })
    return response.data
  }
}

export default {
  auth,
  lessons,
  users,
  problems,
  subscription,
  testimonials,
  api
}
```

---

## Create Auth Context

**`frontend/src/context/AuthContext.jsx`**

```javascript
import React, { createContext, useState, useEffect } from 'react'
import apiService from '../services/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize from localStorage
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      // Could load user profile here
      setUser({ isAuthenticated: true })
    }
    setLoading(false)
  }, [])

  const signup = async (email, password, firstName, lastName) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.auth.signup(email, password, firstName, lastName)
      setUser({
        ...response.user,
        isAuthenticated: true
      })
      return response
    } catch (err) {
      const message = err.response?.data?.message || err.message
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.auth.login(email, password)
      setUser({
        ...response.user,
        isAuthenticated: true
      })
      return response
    } catch (err) {
      const message = err.response?.data?.message || err.message
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    apiService.auth.logout()
    setUser(null)
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    isAuthenticated: !!user?.isAuthenticated
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

---

## Create Auth Hook

**`frontend/src/hooks/useAuth.js`**

```javascript
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  
  return context
}
```

---

## Create Fetch Hook

**`frontend/src/hooks/useFetch.js`**

```javascript
import { useState, useEffect } from 'react'

export function useFetch(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await fn()
        if (isMounted) {
          setData(result)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'An error occurred')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, deps)

  return { data, loading, error }
}
```

---

## Update main.jsx

**`frontend/src/main.jsx`**

```javascript
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)
```

---

## Update package.json

Add axios to `frontend/package.json`:

```bash
npm install axios
```

---

## Usage Examples

### In a Component

```javascript
import { useAuth } from '../hooks/useAuth'
import { useFetch } from '../hooks/useFetch'
import apiService from '../services/api'

function LessonsPage() {
  const { user } = useAuth()
  const { data, loading, error } = useFetch(() => 
    apiService.lessons.getAll({ skip: 0, take: 10 })
  )

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Lessons</h1>
      {data?.lessons?.map(lesson => (
        <div key={lesson.id}>
          <h2>{lesson.title}</h2>
          <p>{lesson.description}</p>
        </div>
      ))}
    </div>
  )
}

export default LessonsPage
```

### Authentication Flow

```javascript
import apiService from '../services/api'

// Signup
const response = await apiService.auth.signup(
  'user@example.com',
  'password123',
  'John',
  'Doe'
)

// Login
const response = await apiService.auth.login(
  'user@example.com',
  'password123'
)

// Logout
apiService.auth.logout()
```

---

## Environment Variables

Create `frontend/.env.local`:

```
VITE_API_URL=http://localhost:4000/api
```

---

## Next: Folder Structure

```
frontend/src/
├── services/
│   └── api.js          ✅ Created
├── context/
│   └── AuthContext.jsx ✅ Created
├── hooks/
│   ├── useAuth.js      ✅ Created
│   └── useFetch.js     ✅ Created
├── components/
│   └── ... (to be created)
├── pages/
│   └── ... (to be created)
├── App.jsx             ✅ Updated
├── main.jsx            ✅ Updated
└── styles.css          ✅ Enhanced
```
