import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import '../styles/admin.css'

interface MarkdownEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

    return (
        <div className="markdown-editor">
            <div className="markdown-tabs">
                <button
                    className={`markdown-tab ${activeTab === 'edit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('edit')}
                >
                    Edit
                </button>
                <button
                    className={`markdown-tab ${activeTab === 'preview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preview')}
                >
                    Preview
                </button>
            </div>

            <div className="markdown-content">
                {activeTab === 'edit' ? (
                    <textarea
                        className="markdown-textarea"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder || 'Write your markdown here...'}
                    />
                ) : (
                    <div className="markdown-preview">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {value || '*No content to preview*'}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    )
}
