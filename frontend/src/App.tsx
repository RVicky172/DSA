import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastContainer } from './components/ToastContainer'
import { Header } from './components/Header'
import { PrivateRoute } from './components/PrivateRoute'
import { HomePage } from './pages/HomePage'
import { AuthPage } from './pages/AuthPage'
import { LessonsPage } from './pages/LessonsPage'
import { LessonDetailPage } from './pages/LessonDetailPage'
import { NotFoundPage } from './pages/NotFoundPage'
import './styles.css'

const AppContent: React.FC = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/lessons"
          element={
            <PrivateRoute>
              <LessonsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/lessons/:id"
          element={
            <PrivateRoute>
              <LessonDetailPage />
            </PrivateRoute>
          }
        />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </>
  )
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <AuthProvider>
            <AppContent />
            <ToastContainer />
          </AuthProvider>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App;
