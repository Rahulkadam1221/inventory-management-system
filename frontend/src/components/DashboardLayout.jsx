import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Search, 
  User as UserIcon,
  ShieldCheck,
  TrendingUp
} from 'lucide-react'

const DashboardLayout = ({ children, role, activeTab, onTabChange, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const adminLinks = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', id: 'overview' },
    { icon: <Package size={20} />, label: 'Inventory', id: 'inventory' },
    { icon: <TrendingUp size={20} />, label: 'Stock Update', id: 'stock-update' },
    { icon: <ShoppingCart size={20} />, label: 'Orders', id: 'orders' },
    { icon: <BarChart3 size={20} />, label: 'Analytics', id: 'analytics' },
    { icon: <Settings size={20} />, label: 'Settings', id: 'settings' },
  ]

  const userLinks = [
    { icon: <LayoutDashboard size={20} />, label: 'My Dashboard', id: 'user-overview' },
    { icon: <ShoppingCart size={20} />, label: 'My Orders', id: 'user-orders' },
    { icon: <Package size={20} />, label: 'Hardware Storefront', id: 'store' },
    { icon: <Settings size={20} />, label: 'Account Settings', id: 'account' },
  ]

  const links = role === 'Admin' ? adminLinks : userLinks

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="glass-dark border-r border-white/5 flex flex-col z-50 relative"
      >
        <div className="p-6 flex items-center gap-3">
          <div className={`p-2 rounded-xl scale-90 ${role === 'Admin' ? 'bg-blue-600' : 'bg-primary'}`}>
            <Package className="text-white" size={20} />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-lg tracking-tight"
            >
              StockFlow <span className={role === 'Admin' ? 'text-blue-400 italic' : 'text-primary italic'}>Pro</span>
            </motion.span>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => onTabChange(link.id)}
              className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group ${
                activeTab === link.id
                  ? (role === 'Admin' ? 'bg-blue-600/10 text-blue-400' : 'bg-primary/10 text-primary')
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <div className="group-hover:scale-110 transition-transform">
                {link.icon}
              </div>
              {isSidebarOpen && <span className="text-sm font-semibold">{link.label}</span>}
              {link.id === 'low-stock' && isSidebarOpen && (
                <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">3</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 p-3.5 rounded-2xl text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            {isSidebarOpen && <span className="text-sm font-semibold">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Topbar */}
        <header className="h-20 glass border-b border-white/5 px-8 flex items-center justify-between z-40">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search inventory, orders..."
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-2.5 pl-12 pr-4 text-sm outline-none focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => onTabChange('notifications')}
              className={`relative p-2 transition-colors ${activeTab === 'notifications' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-[#050505] animate-pulse shadow-glow shadow-primary"></span>
            </button>
            
            <div className="h-8 w-[1px] bg-white/5 mx-2" />

            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">{role === 'Admin' ? 'Admin User' : 'Standard User'}</p>
                <p className="text-xs text-gray-500 uppercase tracking-tighter">{role}</p>
              </div>
              <div className={`p-2.5 rounded-2xl ${role === 'Admin' ? 'bg-blue-600/10 text-blue-400' : 'bg-primary/10 text-primary'} border border-white/5`}>
                {role === 'Admin' ? <ShieldCheck size={20} /> : <UserIcon size={20} />}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
