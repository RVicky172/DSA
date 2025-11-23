import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiService from '../services/api'
import type { LessonsData } from '../types/index'
import '../styles/lessons-page.css'

export const LessonsPage: React.FC = () => {
  const navigate = useNavigate()
  const [lessons, setLessons] = useState<LessonsData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')

  useEffect(() => {
    const fetchLessons = async (): Promise<void> => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiService.getLessons()
        setLessons(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch lessons'
        setError(errorMessage)
        console.error('Error fetching lessons:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [])

  const getFilteredLessons = () => {
    if (!lessons) return []

    return lessons.lessons.filter((lesson) => {
      const categoryMatch = filterCategory === 'all' || lesson.category.toLowerCase() === filterCategory
      const difficultyMatch = filterDifficulty === 'all' || lesson.difficulty.toLowerCase() === filterDifficulty
      return categoryMatch && difficultyMatch
    })
  }

  const filteredLessons = getFilteredLessons()
  const categories = [...new Set(lessons?.lessons.map((l) => l.category) || [])]
  const difficulties = ['Easy', 'Medium', 'Hard']

  return (
    <div className="lessons-page">
      <div className="lessons-header">
        <h1>📚 Available Lessons</h1>
        <p>Master Data Structures and Algorithms</p>
      </div>

      {loading ? (
        <div className="loading">Loading lessons...</div>
      ) : error ? (
        <div className="error">Error: {error}</div>
      ) : (
        <>
          <div className="filters">
            <div className="filter-group">
              <label htmlFor="category">Category:</label>
              <select 
                id="category"
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="difficulty">Difficulty:</label>
              <select 
                id="difficulty"
                value={filterDifficulty} 
                onChange={(e) => setFilterDifficulty(e.target.value)}
              >
                <option value="all">All Levels</option>
                {difficulties.map((diff) => (
                  <option key={diff} value={diff.toLowerCase()}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lessons-grid">
            {filteredLessons.length > 0 ? (
              filteredLessons.map((lesson) => (
                <div 
                  key={lesson.id} 
                  className="lesson-card"
                  onClick={() => navigate(`/lessons/${lesson.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') navigate(`/lessons/${lesson.id}`)
                  }}
                >
                  <h3>{lesson.title}</h3>
                  <p>{lesson.description}</p>
                  <div className="lesson-footer">
                    <span className={`difficulty ${lesson.difficulty.toLowerCase()}`}>
                      {lesson.difficulty}
                    </span>
                    <span className="category">{lesson.category}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-lessons">No lessons found matching your filters</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
