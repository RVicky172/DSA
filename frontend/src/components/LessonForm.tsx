import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createLesson, updateLesson, getLessonById } from '../services/api'
import { MarkdownEditor } from './MarkdownEditor'
import '../styles/admin.css'

export default function LessonForm() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const isEditMode = !!id

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'EASY' as 'EASY' | 'MEDIUM' | 'HARD',
        category: '',
        content: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loadingLesson, setLoadingLesson] = useState(false)

    useEffect(() => {
        if (isEditMode) {
            loadLesson()
        }
    }, [id])

    async function loadLesson() {
        try {
            setLoadingLesson(true)
            const lesson = await getLessonById(Number(id))
            setFormData({
                title: lesson.title,
                description: lesson.description,
                difficulty: lesson.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
                category: lesson.category,
                content: lesson.content
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load lesson')
        } finally {
            setLoadingLesson(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        if (!formData.title || !formData.description || !formData.category || !formData.content) {
            setError('All fields are required')
            return
        }

        try {
            setLoading(true)
            if (isEditMode) {
                await updateLesson(id!, formData)
            } else {
                await createLesson(formData)
            }
            navigate('/admin/lessons')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save lesson')
        } finally {
            setLoading(false)
        }
    }

    if (loadingLesson) {
        return <div className="admin-container"><p>Loading lesson...</p></div>
    }

    return (
        <div className="admin-container">
            <h1>{isEditMode ? 'Edit Lesson' : 'Create New Lesson'}</h1>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="lesson-form">
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
                    <label htmlFor="description">Description *</label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        required
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
                        <label htmlFor="category">Category *</label>
                        <input
                            type="text"
                            id="category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            placeholder="e.g., Arrays, Trees, Graphs"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Content (Markdown) *</label>
                    <MarkdownEditor
                        value={formData.content}
                        onChange={(content) => setFormData({ ...formData, content })}
                        placeholder="Write your lesson content in markdown format..."
                    />
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/admin/lessons')} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="btn btn-primary">
                        {loading ? 'Saving...' : isEditMode ? 'Update Lesson' : 'Create Lesson'}
                    </button>
                </div>
            </form>
        </div>
    )
}
