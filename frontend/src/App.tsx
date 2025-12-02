import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import { authClient } from './lib/auth-client'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import ManagerLayout from './layouts/ManagerLayout'
import TenantLayout from './layouts/TenantLayout'
import TenantSearch from './pages/tenant/Search'
import TenantLease from './pages/tenant/Lease'
import TenantPayments from './pages/tenant/Payments'
import TenantMaintenance from './pages/tenant/Maintenance'
import ManagerApplications from './pages/manager/Applications'
import ManagerMaintenance from './pages/manager/Maintenance'
import ManagerTenants from './pages/manager/Tenants'

function App() {
  const { data: session, isPending } = authClient.useSession()

  // Only show loading screen on initial load, but allow public routes to render
  if (isPending && !session && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const role = session?.user ? (session.user as any).role : null

  return (
    <Routes>
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!session ? <Register /> : <Navigate to="/" />} />

      {/* Protected Routes */}
      <Route path="/" element={session ? <MainLayout /> : <Navigate to="/login" />}>
        {/* Redirect root based on role */}
        <Route index element={
          role === 'Admin' ? <Navigate to="/admin" /> :
            role === 'Manager' ? <Navigate to="/manager" /> :
              <Navigate to="/tenant" />
        } />

        {/* Admin Routes */}
        {role === 'Admin' && (
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<div>Admin Overview</div>} />
            <Route path="communities" element={<div>Communities Management</div>} />
            <Route path="users" element={<div>User Management</div>} />
            <Route path="settings" element={<div>Settings</div>} />
          </Route>
        )}

        {/* Manager Routes */}
        {role === 'Manager' && (
          <Route path="manager" element={<ManagerLayout />}>
            <Route index element={<ManagerApplications />} />
            <Route path="maintenance" element={<ManagerMaintenance />} />
            <Route path="tenants" element={<ManagerTenants />} />
          </Route>
        )}

        {/* Tenant Routes */}
        {(role === 'Tenant' || !role) && (
          <Route path="tenant" element={<TenantLayout />}>
            <Route index element={<TenantSearch />} />
            <Route path="lease" element={<TenantLease />} />
            <Route path="payments" element={<TenantPayments />} />
            <Route path="maintenance" element={<TenantMaintenance />} />
          </Route>
        )}
      </Route>
    </Routes>
  )
}

export default App
