import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import AdminPage from '../pages/AdminPage'
import DashboardPage from '../pages/DashboardPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import MealPage from '../pages/MealPage'
import NoticePage from '../pages/NoticePage'
import ResetPasswordPage from '../pages/ResetPasswordPage'
import SignupPage from '../pages/SignupPage'
import SurveyPage from '../pages/SurveyPage'

type ProtectedState = 'loading' | 'no-auth' | 'ok'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProtectedState>('loading')

  useEffect(() => {
    let active = true

    async function check(session: Session | null) {
      const user = session?.user
      if (!user) {
        if (active) setState('no-auth')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_active')
        .eq('id', user.id)
        .maybeSingle()

      if (!active) return

      if (profile && profile.is_active === false) {
        await supabase.auth.signOut()
        if (active) setState('no-auth')
        return
      }

      setState('ok')
    }

    supabase.auth.getSession().then(({ data }) => check(data.session))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      check(session)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  if (state === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7]">
        <span className="text-sm text-slate-500">불러오는 중...</span>
      </div>
    )
  }

  if (state === 'no-auth') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

type AdminState = 'loading' | 'no-auth' | 'no-admin' | 'admin'

function AdminRoute({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminState>('loading')

  useEffect(() => {
    let active = true

    async function check() {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user
      if (!user) {
        if (active) setState('no-auth')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', user.id)
        .maybeSingle()

      if (!active) return

      if (profile && profile.is_active === false) {
        await supabase.auth.signOut()
        if (active) setState('no-auth')
        return
      }

      setState(profile?.role === 'admin' ? 'admin' : 'no-admin')
    }

    check()

    return () => {
      active = false
    }
  }, [])

  if (state === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7]">
        <span className="text-sm text-slate-500">불러오는 중...</span>
      </div>
    )
  }

  if (state === 'no-auth') {
    return <Navigate to="/login" replace />
  }

  if (state === 'no-admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
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
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />
    </Routes>
  )
}
