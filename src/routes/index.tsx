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
import { OfficeFlowLogo } from '../components/ui/Logo'
import PageTransition from '../components/layout/PageTransition'

function RouteLoadingScreen() {
  return (
    <div className="animate-page-in flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas">
      <OfficeFlowLogo />
      <span className="text-sm text-slate-500">불러오는 중...</span>
    </div>
  )
}

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
    return <RouteLoadingScreen />
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
    return <RouteLoadingScreen />
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
      <Route
        path="/"
        element={
          <PageTransition>
            <HomePage />
          </PageTransition>
        }
      />
      <Route
        path="/login"
        element={
          <PageTransition>
            <LoginPage />
          </PageTransition>
        }
      />
      <Route
        path="/signup"
        element={
          <PageTransition>
            <SignupPage />
          </PageTransition>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PageTransition>
            <ForgotPasswordPage />
          </PageTransition>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PageTransition>
            <ResetPasswordPage />
          </PageTransition>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <PageTransition>
              <DashboardPage />
            </PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/meal"
        element={
          <ProtectedRoute>
            <PageTransition>
              <MealPage />
            </PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/survey"
        element={
          <ProtectedRoute>
            <PageTransition>
              <SurveyPage />
            </PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notice"
        element={
          <ProtectedRoute>
            <PageTransition>
              <NoticePage />
            </PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <PageTransition>
              <AdminPage />
            </PageTransition>
          </AdminRoute>
        }
      />
    </Routes>
  )
}
