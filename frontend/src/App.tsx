import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import { authClient } from './lib/auth-client'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import ManagerLayout from './layouts/ManagerLayout'
import TenantLayout from './layouts/TenantLayout'
import TenantSearch from './pages/tenant/Search'
import TenantApplications from './pages/tenant/Applications'
import TenantLease from './pages/tenant/Lease'
import TenantPayments from './pages/tenant/Payments'
import TenantMaintenance from './pages/tenant/Maintenance'
import ManagerApplications from './pages/manager/Applications'
import ManagerCommunity from './pages/manager/Community'
import ManagerMaintenance from './pages/manager/Maintenance'
import ManagerTenants from './pages/manager/Tenants'
import ManagerUnits from './pages/manager/Units'
import AdminOverview from './pages/admin/Overview'
import AdminCommunities from './pages/admin/Communities'
import AdminUsers from './pages/admin/Users'
import Landing from './pages/Landing'
import ChangePassword from './pages/ChangePassword'

function App() {
  const { data: session, isPending } = authClient.useSession()
  const location = useLocation()

  if (isPending) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // Check for temporary password
  if (session?.user && (session.user as any).is_temp_password && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  const role = session?.user ? (session.user as any).role : null

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!session ? <Register /> : <Navigate to="/dashboard" />} />
      <Route path="/change-password" element={session ? <ChangePassword /> : <Navigate to="/login" />} />

      <Route path="/dashboard" element={
        session ? (
          (session.user as any).role === 'Admin' ? <Navigate to="/admin" /> :
            (session.user as any).role === 'Manager' ? <Navigate to="/manager" /> :
              <Navigate to="/tenant" />
        ) : <Navigate to="/login" />
      } />

      <Route element={session ? <MainLayout /> : <Navigate to="/login" />}>
        {/* Admin Routes */}
        {role === 'Admin' && (
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="communities" element={<AdminCommunities />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<div>Settings</div>} />
          </Route>
        )}

        {/* Manager Routes */}
        {role === 'Manager' && (
          <Route path="/manager" element={<ManagerLayout />}>
            <Route index element={<ManagerApplications />} />
            <Route path="community" element={<ManagerCommunity />} />
            <Route path="units" element={<ManagerUnits />} />
            <Route path="maintenance" element={<ManagerMaintenance />} />
            <Route path="tenants" element={<ManagerTenants />} />
          </Route>
        )}

        {/* Tenant Routes */}
        {(role === 'Tenant' || !role) && (
          <Route path="/tenant" element={<TenantLayout />}>
            <Route index element={<TenantSearch />} />
            <Route path="applications" element={<TenantApplications />} />
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
