import React, { useState, useEffect } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import '../styles/code-editor.css'

interface CodeEditorProps {
    initialCode?: string
    language?: string
    onChange?: (value: string | undefined) => void
    onRun?: () => void
    onSubmit?: () => void
    readOnly?: boolean
    isRunning?: boolean
    isSubmitting?: boolean
}

const LANGUAGES = [
    { id: 'javascript', name: 'JavaScript (Node.js)' },
    { id: 'python', name: 'Python 3' },
    { id: 'cpp', name: 'C++' },
    { id: 'java', name: 'Java' }
]


export const CodeEditor: React.FC<CodeEditorProps> = ({
    initialCode = '',
    language = 'javascript',
    onChange,
    onRun,
    onSubmit,
    readOnly = false,
    isRunning = false,
    isSubmitting = false
}) => {
    const [currentLanguage, setCurrentLanguage] = useState(language)
    const [theme, setTheme] = useState('vs-dark')
    const [code, setCode] = useState(initialCode)

    useEffect(() => {
        setCurrentLanguage(language)
    }, [language])

    useEffect(() => {
        if (initialCode) {
            setCode(initialCode)
        }
    }, [initialCode])

    const handleEditorChange = (value: string | undefined) => {
        setCode(value || '')
        if (onChange) {
            onChange(value)
        }
    }

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value
        setCurrentLanguage(newLang)
        // In a real app, we might want to switch to a template for that language
    }

    const handleThemeChange = () => {
        setTheme(prev => prev === 'vs-dark' ? 'light' : 'vs-dark')
    }

    const handleEditorDidMount: OnMount = (editor) => {
        // Configure editor settings if needed
        editor.focus()
    }

    return (
        <div className="code-editor-container">
            <div className="editor-toolbar">
                <div className="toolbar-left">
                    <select
                        value={currentLanguage}
                        onChange={handleLanguageChange}
                        className="language-select"
                        disabled={readOnly}
                    >
                        {LANGUAGES.map(lang => (
                            <option key={lang.id} value={lang.id}>
                                {lang.name}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleThemeChange}
                        className="theme-toggle"
                        title="Toggle Theme"
                    >
                        {theme === 'vs-dark' ? '☀️' : '🌙'}
                    </button>
                </div>

                <div className="toolbar-right">
                    {onRun && (
                        <button
                            className="run-btn"
                            onClick={onRun}
                            disabled={isRunning || isSubmitting}
                        >
                            {isRunning ? 'Running...' : '▶ Run Code'}
                        </button>
                    )}

                    {onSubmit && (
                        <button
                            className="submit-btn"
                            onClick={onSubmit}
                            disabled={isRunning || isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Solution'}
                        </button>
                    )}
                </div>
            </div>

            <div className="monaco-wrapper">
                <Editor
                    height="100%"
                    language={currentLanguage === 'c++' ? 'cpp' : currentLanguage}
                    value={code}
                    theme={theme}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        readOnly: readOnly,
                        tabSize: 2,
                        wordWrap: 'on'
                    }}
                />
            </div>
        </div>
    )
}
