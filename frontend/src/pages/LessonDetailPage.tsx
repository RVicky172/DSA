import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LessonDetail } from '../components/LessonDetail'
import '../styles/lesson-detail-page.css'

export const LessonDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const lessonId = id ? parseInt(id, 10) : 0

  const handleStartProblems = (): void => {
    navigate(`/problems/${lessonId}`)
  }

  return (
    <div className="lesson-detail-page">
      <LessonDetail
        lessonId={lessonId}
        onBack={() => navigate('/lessons')}
      />
      <div className="lesson-actions-extended">
        <button className="btn-primary" onClick={handleStartProblems}>
          Start Practice Problems →
        </button>
      </div>
    </div>
  )
}
