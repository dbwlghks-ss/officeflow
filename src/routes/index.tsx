import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AdminPage from '../pages/AdminPage'
import DashboardPage from '../pages/DashboardPage'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import MealPage from '../pages/MealPage'
import NoticePage from '../pages/NoticePage'
import SurveyPage from '../pages/SurveyPage'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (active) setAuthed(Boolean(data.session))
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setAuthed(Boolean(session))
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7]">
        <span className="text-sm text-slate-500">불러오는 중...</span>
      </div>
    )
  }

  if (!authed) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meal"
        element={
          <ProtectedRoute>
            <MealPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/survey"
        element={
          <ProtectedRoute>
            <SurveyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notice"
        element={
          <ProtectedRoute>
            <NoticePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
