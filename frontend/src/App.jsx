import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import LandingPage from './pages/LandingPage'
import DashboardLayout from './components/DashboardLayout'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'
import InventoryPage from './pages/InventoryPage'
import StockUpdatePage from './pages/StockUpdatePage'
import OrdersPage from './pages/OrdersPage'
import SalesReportPage from './pages/SalesReportPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'
import StorefrontPage from './pages/StorefrontPage'
import Unauthorized from './pages/Unauthorized'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import './App.css'

// Helper component to sync DashboardLayout tabs with URL
const DashboardHeader = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Extract active tab from URL path
  const currentPath = location.pathname.split('/').pop() || (user?.role === 'Admin' ? 'overview' : 'store')
  
  const handleTabChange = (tabId) => {
    navigate(`/dashboard/${tabId}`)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <DashboardLayout 
      role={user?.role} 
      activeTab={currentPath} 
      onTabChange={handleTabChange} 
      onLogout={handleLogout}
    >
      <Routes>
        {/* Admin and Shared Routes */}
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          <Route path="overview" element={<AdminDashboard />} />
          <Route path="inventory" element={<InventoryPage role="Admin" />} />
          <Route path="stock-update" element={<StockUpdatePage role="Admin" />} />
          <Route path="analytics" element={<SalesReportPage role="Admin" />} />
        </Route>

        {/* User and Shared Routes */}
        <Route element={<ProtectedRoute allowedRoles={['User']} />}>
          <Route path="user-overview" element={<UserDashboard />} />
          <Route path="user-orders" element={<OrdersPage role="User" />} />
          <Route path="store" element={<StorefrontPage />} />
          <Route path="purchased" element={<InventoryPage role="User" />} />
          <Route path="account-analytics" element={<SalesReportPage role="User" />} />
        </Route>

        {/* Both Admin and User Routes */}
        <Route path="orders" element={<OrdersPage role={user?.role} />} />
        <Route path="notifications" element={<NotificationsPage role={user?.role} />} />
        <Route path="settings" element={<SettingsPage role={user?.role} />} />
        <Route path="account" element={<SettingsPage role={user?.role} />} />
        
        {/* Default redirect for /dashboard */}
        <Route path="" element={<Navigate to={user?.role === 'Admin' ? "overview" : "store"} replace />} />
      </Routes>
    </DashboardLayout>
  )
}

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="p-8 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <div className="text-blue-500 text-lg font-bold tracking-widest animate-pulse">STOCKFLOW PRO</div>
          <div className="text-gray-500 text-xs uppercase tracking-tighter">Initializing Secure Session</div>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#0c0c0c',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1rem',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600'
          },
          success: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="App dark overflow-x-hidden min-h-screen bg-[#050505] text-white">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage onEnter={() => {}} />} />
          <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <DashboardHeader />
            </ProtectedRoute>
          } />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
