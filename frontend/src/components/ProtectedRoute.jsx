import { Navigate } from 'react-router-dom'
import { isAuthenticated, getStoredUser } from '../api/auth'

export default function ProtectedRoute({
  children,
  adminOnly = false,
  allowRoles,
}) {
  const authenticated = isAuthenticated()
  const user = getStoredUser()

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  if (allowRoles && (!user?.role || !allowRoles.includes(user.role))) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

