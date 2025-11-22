import React, { useState, useEffect } from 'react'
import { AuthProvider } from './context/AuthContext.js'
import { Header } from './components/Header.js'
import { Login } from './components/Login.js'
import { Signup } from './components/Signup.js'
import { LessonDetail } from './components/LessonDetail.js'
import apiService from './services/api.js'
import type { LessonsData, Lesson } from './types/index.js'
import './styles.css'

type ViewType = 'lessons' | 'login' | 'signup' | 'lesson-detail'

const AppContent: React.FC = () => {
  const [view, setView] = useState<ViewType>('lessons')
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)

  useEffect(() => {
    const fetchLessons = async (): Promise<void> => {
      try {
        setLoading(true)
        const data = await apiService.getLessons()
        setLessons(data.lessons)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch lessons'
        setError(errorMessage)
        console.error('Error fetching lessons:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [])

  const handleLessonClick = (lessonId: number): void => {
    setSelectedLessonId(lessonId)
    setView('lesson-detail')
  }

  const handleBackToLessons = (): void => {
    setSelectedLessonId(null)
    setView('lessons')
  }

  const handleAuthSuccess = (): void => {
    setView('lessons')
  }

  return (
    <div className="app">
      <Header
        onLoginClick={() => setView('login')}
        onSignupClick={() => setView('signup')}
      />

      <main className="main-content">
        {view === 'login' && (
          <Login
            onSuccess={handleAuthSuccess}
            onSwitchToSignup={() => setView('signup')}
          />
        )}

        {view === 'signup' && (
          <Signup
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setView('login')}
          />
        )}

        {view === 'lesson-detail' && selectedLessonId !== null && (
          <LessonDetail
            lessonId={selectedLessonId}
            onBack={handleBackToLessons}
          />
        )}

        {view === 'lessons' && (
          <>
            <div className="lessons-hero">
              <h1>Master Data Structures and Algorithms</h1>
              <p>Learn DSA fundamentals with interactive lessons and practice problems</p>
            </div>

            {loading ? (
              <div className="loading">Loading lessons...</div>
            ) : error ? (
              <div className="error">Error: {error}</div>
            ) : lessons.length > 0 ? (
              <div className="lessons-grid">
                <h2>Available Lessons</h2>
                <div className="lessons-list">
                  {lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="lesson-card"
                      onClick={() => handleLessonClick(lesson.id as unknown as number)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleLessonClick(lesson.id as unknown as number)
                        }
                      }}
                    >
                      <h3>{lesson.title}</h3>
                      <p>{lesson.description}</p>
                      <div className="lesson-card-footer">
                        <span className={`difficulty ${lesson.difficulty.toLowerCase()}`}>
                          {lesson.difficulty}
                        </span>
                        <span className="category">{lesson.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-lessons">No lessons available</div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
