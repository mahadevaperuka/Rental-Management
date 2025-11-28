import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import { authClient } from './lib/auth-client'

function App() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <Routes>
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!session ? <Register /> : <Navigate to="/" />} />
      <Route path="/" element={
        session ? (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Welcome, {session.user.name}</h1>
            <p>Role: {(session.user as any).role || 'Tenant'}</p>
            <button
              onClick={() => authClient.signOut()}
              className="mt-4 px-4 py-2 border border-black text-black rounded hover:bg-gray-100 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Navigate to="/login" />
        )
      } />
    </Routes>
  )
}

export default App
