import React, { useState, useEffect } from 'react'
import apiService from './services/api.js'
import type { LessonsData } from './types/index.js'
import './styles.css'

const App: React.FC = () => {
  const [lessons, setLessons] = useState<LessonsData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLessons = async (): Promise<void> => {
      try {
        setLoading(true)
        const data = await apiService.getLessons()
        setLessons(data)
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

  return (
    <div className="app">
      <header className="header">
        <h1>📚 DSA Learning Platform</h1>
        <p>Master Data Structures and Algorithms</p>
      </header>

      <main className="main-content">
        {loading ? (
          <div className="loading">Loading lessons...</div>
        ) : error ? (
          <div className="error">Error: {error}</div>
        ) : lessons ? (
          <div className="lessons-grid">
            <h2>Available Lessons</h2>
            <div className="lessons-list">
              {lessons.lessons.map((lesson) => (
                <div key={lesson.id} className="lesson-card">
                  <h3>{lesson.title}</h3>
                  <p>{lesson.description}</p>
                  <span className={`difficulty ${lesson.difficulty.toLowerCase()}`}>
                    {lesson.difficulty}
                  </span>
                  <span className="category">{lesson.category}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>No lessons available</div>
        )}
      </main>
    </div>
  )
}

export default App
