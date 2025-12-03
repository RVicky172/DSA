import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastContainer } from './components/ToastContainer'
import { Header } from './components/Header'
import { PrivateRoute } from './components/PrivateRoute'
import { ProtectedRoute } from './components/ProtectedRoute'
import AdminDashboard from './pages/AdminDashboard'
import ManageLessonsPage from './pages/ManageLessonsPage'
import ManageProblemsPage from './pages/ManageProblemsPage'
import LessonForm from './components/LessonForm'
import ProblemForm from './components/ProblemForm'
import { HomePage } from './pages/HomePage'
import { AuthPage } from './pages/AuthPage'
import { LessonsPage } from './pages/LessonsPage'
import { LessonDetailPage } from './pages/LessonDetailPage'
import { ProblemsListPage } from './pages/ProblemsListPage'
import { ProblemPage } from './pages/ProblemPage'
import { DashboardPage } from './pages/DashboardPage'
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
        <Route
          path="/problems"
          element={
            <PrivateRoute>
              <ProblemsListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/problems/:id"
          element={
            <PrivateRoute>
              <ProblemPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        {/* Admin routes - protected by role */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="INSTRUCTOR">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/lessons"
          element={
            <ProtectedRoute requiredRole="INSTRUCTOR">
              <ManageLessonsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/lessons/new"
          element={
            <ProtectedRoute requiredRole="INSTRUCTOR">
              <LessonForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/lessons/:id/edit"
          element={
            <ProtectedRoute requiredRole="INSTRUCTOR">
              <LessonForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/problems"
          element={
            <ProtectedRoute requiredRole="INSTRUCTOR">
              <ManageProblemsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/problems/new"
          element={
            <ProtectedRoute requiredRole="INSTRUCTOR">
              <ProblemForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/problems/:id/edit"
          element={
            <ProtectedRoute requiredRole="INSTRUCTOR">
              <ProblemForm />
            </ProtectedRoute>
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
