import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createProblem, updateProblem, getProblemById, getLessons } from '../services/api'
import { MarkdownEditor } from './MarkdownEditor'
import { Lesson } from '../types'
import '../styles/admin.css'

export default function ProblemForm() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const isEditMode = !!id

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'EASY' as 'EASY' | 'MEDIUM' | 'HARD',
        initialCode: '',
        lessonId: '',
        language: 'javascript'
    })
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loadingData, setLoadingData] = useState(true)

    useEffect(() => {
        loadInitialData()
    }, [id])

    async function loadInitialData() {
        try {
            setLoadingData(true)

            // Load available lessons
            const lessonsData = await getLessons()
            setLessons(lessonsData.lessons)

            // If edit mode, load the problem
            if (isEditMode) {
                const problem = await getProblemById(id!)
                setFormData({
                    title: problem.title,
                    description: problem.description,
                    difficulty: problem.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
                    initialCode: problem.initialCode,
                    lessonId: problem.lessonId,
                    language: problem.language || 'javascript'
                })
            } else if (lessonsData.lessons.length > 0) {
                // Set first lesson as default for create mode
                setFormData(prev => ({ ...prev, lessonId: lessonsData.lessons[0].id }))
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data')
        } finally {
            setLoadingData(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        if (!formData.title || !formData.description || !formData.initialCode || !formData.lessonId) {
            setError('All fields are required')
            return
        }

        try {
            setLoading(true)
            if (isEditMode) {
                await updateProblem(id!, {
                    title: formData.title,
                    description: formData.description,
                    difficulty: formData.difficulty,
                    initialCode: formData.initialCode
                })
            } else {
                await createProblem(formData)
            }
            navigate('/admin/problems')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save problem')
        } finally {
            setLoading(false)
        }
    }

    if (loadingData) {
        return <div className="admin-container"><p>Loading...</p></div>
    }

    if (lessons.length === 0) {
        return (
            <div className="admin-container">
                <p>No lessons available. Please create a lesson first before creating problems.</p>
                <button onClick={() => navigate('/admin/lessons/new')} className="btn btn-primary">
                    Create Lesson
                </button>
            </div>
        )
    }

    return (
        <div className="admin-container">
            <h1>{isEditMode ? 'Edit Problem' : 'Create New Problem'}</h1>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="problem-form">
                <div className="form-group">
                    <label htmlFor="title">Title *</label>
                    <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Description (Markdown) *</label>
                    <MarkdownEditor
                        value={formData.description}
                        onChange={(description) => setFormData({ ...formData, description })}
                        placeholder="Describe the problem in markdown format..."
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="difficulty">Difficulty *</label>
                        <select
                            id="difficulty"
                            value={formData.difficulty}
                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'EASY' | 'MEDIUM' | 'HARD' })}
                            required
                        >
                            <option value="EASY">Easy</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HARD">Hard</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="lessonId">Lesson *</label>
                        <select
                            id="lessonId"
                            value={formData.lessonId}
                            onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
                            required
                            disabled={isEditMode}
                        >
                            {lessons.map((lesson) => (
                                <option key={lesson.id} value={lesson.id}>
                                    {lesson.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="language">Language *</label>
                        <select
                            id="language"
                            value={formData.language}
                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                            required
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="cpp">C++</option>
                            <option value="java">Java</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="initialCode">Initial Code *</label>
                    <textarea
                        id="initialCode"
                        value={formData.initialCode}
                        onChange={(e) => setFormData({ ...formData, initialCode: e.target.value })}
                        rows={10}
                        className="code-textarea"
                        placeholder="function solve() {\n  // Your code here\n}"
                        required
                    />
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/admin/problems')} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="btn btn-primary">
                        {loading ? 'Saving...' : isEditMode ? 'Update Problem' : 'Create Problem'}
                    </button>
                </div>
            </form>
        </div>
    )
}
