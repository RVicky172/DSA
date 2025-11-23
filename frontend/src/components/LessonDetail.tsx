import React, { useState, useEffect } from 'react'
import apiService from '../services/api'
import type { Lesson } from '../types/index'
import '../styles/lesson.css'

interface LessonDetailProps {
  lessonId: number
  onBack?: () => void
}

export const LessonDetail: React.FC<LessonDetailProps> = ({ lessonId, onBack }) => {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLesson = async (): Promise<void> => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiService.getLessonById(lessonId)
        setLesson(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load lesson'
        setError(errorMessage)
        console.error('Error fetching lesson:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLesson()
  }, [lessonId])

  if (loading) {
    return <div className="lesson-detail-loading">Loading lesson...</div>
  }

  if (error) {
    return (
      <div className="lesson-detail-error">
        <p>Error: {error}</p>
        {onBack && (
          <button className="btn-secondary" onClick={onBack}>
            ← Back to Lessons
          </button>
        )}
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="lesson-detail-error">
        <p>Lesson not found</p>
        {onBack && (
          <button className="btn-secondary" onClick={onBack}>
            ← Back to Lessons
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="lesson-detail-container">
      <div className="lesson-detail-header">
        {onBack && (
          <button className="btn-back" onClick={onBack}>
            ← Back to Lessons
          </button>
        )}
      </div>

      <article className="lesson-detail-content">
        <div className="lesson-detail-title">
          <h1>{lesson.title}</h1>
          <div className="lesson-metadata">
            <span className={`badge difficulty ${lesson.difficulty.toLowerCase()}`}>
              {lesson.difficulty}
            </span>
            <span className="badge category">{lesson.category}</span>
          </div>
        </div>

        <div className="lesson-description">
          <h2>Overview</h2>
          <p>{lesson.description}</p>
        </div>

        <div className="lesson-body">
          <h2>Content</h2>
          <div className="lesson-markdown">
            {lesson.content.split('\n').map((paragraph, index) => 
              paragraph.trim() ? (
                <p key={index}>{paragraph}</p>
              ) : (
                <br key={index} />
              )
            )}
          </div>
        </div>

        <div className="lesson-actions">
          <button className="btn-primary">Start Practice Problems</button>
          <button className="btn-secondary">Save for Later</button>
        </div>
      </article>
    </div>
  )
}
