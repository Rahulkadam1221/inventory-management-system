import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  Package, 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  X, 
  ArrowRight,
  ShieldCheck,
  Check,
  Loader2
} from 'lucide-react'
import API from '../api/axios'

// Backend Notification Model mapping
const mapNotif = (notif) => ({
  id: notif._id,
  type: notif.message.toLowerCase().includes('stock') ? 'low_stock' : 
        notif.message.toLowerCase().includes('order') ? 'new_order' : 'system',
  title: notif.message.toLowerCase().includes('stock') ? 'Stock Update' : 
         notif.message.toLowerCase().includes('order') ? 'Order Alert' : 'System Note',
  message: notif.message,
  time: new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  unread: !notif.isRead,
  role: notif.role
})

const NotificationsPage = ({ role }) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isAdmin = role === 'Admin'

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const { data } = await API.get('/notifications')
      setNotifications(data.data.map(mapNotif))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`)
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, unread: false } : n
      ))
    } catch (err) {
      console.error(err)
    }
  }

  const markAllAsRead = async () => {
    // Sequentially mark all unread as read (or optimized if backend supported bulk)
    const unread = notifications.filter(n => n.unread)
    for (const n of unread) {
      markAsRead(n.id)
    }
  }

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Notifications Center 
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {notifications.filter(n => n.unread).length} Unread
            </span>
          </h1>
          <p className="text-gray-500 mt-1">Stay updated with system alerts and order progress.</p>
        </div>

        <button 
          onClick={markAllAsRead}
          className="text-sm font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <Check size={16} /> Mark all read
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 glass-dark rounded-[2.5rem] border border-white/5">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-gray-500">Connecting to alert server...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {notifications.map((notif, index) => (
              <NotificationCard 
                key={notif.id} 
                notif={notif} 
                index={index}
                onRead={() => markAsRead(notif.id)}
                onDelete={() => deleteNotification(notif.id)}
              />
            ))}
          </AnimatePresence>
        )}

        {notifications.length === 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-20 text-center space-y-4 glass-dark rounded-[2.5rem] border border-white/5"
          >
             <div className="p-4 rounded-3xl bg-white/5 w-fit mx-auto">
               <Bell className="w-12 h-12 text-gray-600" />
             </div>
             <p className="text-gray-500 font-medium italic">
               {error ? error : 'Your inbox is empty.'}
             </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

const NotificationCard = ({ notif, index, onRead, onDelete }) => {
  const iconConfigs = {
    low_stock: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    new_order: { icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    order_update: { icon: Truck, color: 'text-primary', bg: 'bg-primary/10' },
    delivered: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    security: { icon: ShieldCheck, color: 'text-red-400', bg: 'bg-red-400/10' }
  }

  const { icon: Icon, color, bg } = iconConfigs[notif.type] || { icon: Bell, color: 'text-gray-400', bg: 'bg-white/5' }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
      onMouseEnter={onRead}
      whileHover={{ scale: 1.01, z: 10 }}
      className={`preserve-3d relative flex items-start gap-4 p-6 rounded-3xl border transition-all cursor-default group shadow-lg ${
        notif.unread 
          ? 'glass-dark border-primary/30 shadow-primary/5' 
          : 'bg-white/[0.02] border-white/5 saturate-50'
      }`}
    >
      {/* Unread Indicator Pulse */}
      {notif.unread && (
        <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full blur-[2px] animate-pulse shadow-glow shadow-primary" />
      )}

      <div className={`p-4 rounded-2xl ${bg} ${color} flex-shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>

      <div className="flex-1 space-y-1 pr-8">
        <div className="flex items-center justify-between">
          <h4 className={`font-bold text-sm tracking-tight ${notif.unread ? 'text-white' : 'text-gray-400'}`}>
            {notif.title}
          </h4>
          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">{notif.time}</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed font-medium">
          {notif.message}
        </p>
        
        {notif.type === 'low_stock' && (
          <button className="flex items-center gap-1 text-[10px] text-amber-400 font-black uppercase mt-3 tracking-widest hover:gap-2 transition-all">
            Update Stock <ArrowRight size={10} />
          </button>
        )}
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-6 right-6 p-1.5 rounded-lg hover:bg-white/5 text-gray-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
      >
        <X size={14} />
      </button>

      {/* Modern Depth Shadow */}
      <div className="absolute inset-0 -z-10 bg-black/20 rounded-3xl blur-xl group-hover:opacity-100 opacity-0 transition-opacity" />
    </motion.div>
  )
}

export default NotificationsPage
