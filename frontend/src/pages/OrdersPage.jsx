import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Search, 
  Filter,
  MoreVertical,
  Calendar,
  User as UserIcon,
  CreditCard,
  Loader2
} from 'lucide-react'
import { gsap } from 'gsap'
import toast from 'react-hot-toast'
import socket from '../utils/socket'
import API from '../api/axios'

const OrdersPage = ({ role }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const isAdmin = role === 'Admin'

  useEffect(() => {
    fetchOrders()

    socket.on('orderCreated', (newOrder) => {
      setOrders(prev => [newOrder, ...prev])
      if (isAdmin) {
        toast.success(`New order received! Total: $${newOrder.totalPrice.toFixed(2)}`, { icon: '💰' })
      } else {
        toast.success(`Your order has been placed!`, { icon: '🛍️' })
      }
    })

    socket.on('orderUpdated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o))
      toast.success(`Order ${updatedOrder._id.slice(-6).toUpperCase()} status updated to ${updatedOrder.status}`, { icon: '🚚' })
    })

    return () => {
      socket.off('orderCreated')
      socket.off('orderUpdated')
    }
  }, [isAdmin])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data } = await API.get('/orders')
      setOrders(data.data)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const orderId = `ORD-${order._id.slice(-6).toUpperCase()}`
    const matchesSearch = orderId.toLowerCase().includes(search.toLowerCase()) || 
                          order.user?.name.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  const updateStatus = async (orderId, newStatus) => {
    if (!isAdmin) return
    setUpdatingOrderId(orderId)
    const loadingToast = toast.loading('Updating order status...')
    try {
      await API.put(`/orders/${orderId}`, { status: newStatus })
      toast.success('Status updated successfully', { id: loadingToast })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update order status', { id: loadingToast })
    } finally {
      setUpdatingOrderId(null)
    }
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Order Management 
            <span className={`text-xs px-2 py-0.5 rounded-full border ${isAdmin ? 'bg-blue-500/10 text-blue-400 border-blue-400/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
              {isAdmin ? 'Storewide' : 'My Orders'}
            </span>
          </h1>
          <p className="text-gray-500 mt-1">Track, manage and fulfill customer orders.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search Order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-12 pr-4 text-sm outline-none focus:border-primary/50 transition-all w-64"
            />
          </div>
          <button className="glass border border-white/10 p-2.5 rounded-2xl hover:bg-white/5 transition-all">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 glass-dark rounded-[2.5rem] border border-white/5">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-gray-400 font-medium">Retrieving order synchronization...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order, index) => (
              <OrderCard 
                key={order._id} 
                order={order} 
                index={index} 
                isAdmin={isAdmin}
                onUpdateStatus={updateStatus}
                isUpdating={updatingOrderId === order._id}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {filteredOrders.length === 0 && !loading && (
        <div className="p-20 text-center space-y-4 glass-dark rounded-[2.5rem] border border-white/5">
           <div className="p-4 rounded-3xl bg-white/5 w-fit mx-auto">
             <ShoppingBag className="w-12 h-12 text-gray-600" />
           </div>
           <p className="text-gray-500 font-medium italic">
             {error ? error : 'No orders found.'}
           </p>
        </div>
      )}
    </div>
  )
}

const OrderCard = ({ order, index, isAdmin, onUpdateStatus, isUpdating }) => {
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    gsap.to(cardRef.current, {
      rotateX: -y * 8,
      rotateY: x * 8,
      duration: 0.4,
      ease: "power2.out"
    })
  }

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, duration: 0.4 })
  }

  const orderIdLabel = `ORD-${order._id.slice(-6).toUpperCase()}`
  const orderDate = new Date(order.createdAt).toLocaleDateString()

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="preserve-3d glass-dark p-6 rounded-[2.5rem] border border-white/5 shadow-xl hover:border-white/10 transition-colors group cursor-default"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-primary">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-tight">{orderIdLabel}</h4>
            <p className="text-[10px] text-gray-500 flex items-center gap-1">
              <Calendar size={10} /> {orderDate}
            </p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="space-y-4 mb-6 relative z-10">
        <div className="flex items-center gap-3 text-sm">
          <UserIcon size={16} className="text-gray-500" />
          <span className="font-medium">{order.user?.name || 'Unknown User'}</span>
        </div>
        
        <div className="space-y-1 pl-7">
           {order.products.map((item, i) => (
             <p key={i} className="text-xs text-gray-400 flex items-center gap-2">
               <div className="w-1 h-1 rounded-full bg-gray-600" /> 
               {item.product?.name || 'Unknown Product'} x {item.quantity}
             </p>
           ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
           <div className="flex items-center gap-2 text-gray-400">
             <CreditCard size={16} />
             <span className="text-[10px] uppercase font-bold tracking-widest">Total Amount</span>
           </div>
           <span className="text-lg font-black text-white">${order.totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {isAdmin ? (
        <div className="flex items-center gap-2 mt-4 relative z-10">
          {order.status !== 'Delivered' && (
             <button 
               onClick={() => onUpdateStatus(order._id, order.status === 'Pending' ? 'Shipped' : 'Delivered')}
               disabled={isUpdating}
               className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-primary/20 hover:border-primary/30 text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
             >
               {isUpdating ? (
                 <Loader2 size={14} className="animate-spin" />
               ) : (
                 <>
                   {order.status === 'Pending' ? 'Ship Order' : 'Mark Delivered'}
                   <ChevronRight size={14} />
                 </>
               )}
             </button>
          )}
          <button className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all active:scale-90">
            <MoreVertical size={16} />
          </button>
        </div>
      ) : (
        <div className="mt-4 p-4 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between relative z-10">
           <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Track Status</span>
           <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase italic">
             Live Updates <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
           </div>
        </div>
      )}
    </motion.div>
  )
}

const StatusBadge = ({ status }) => {
  const configs = {
    'Pending': { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
    'Shipped': { icon: Truck, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    'Delivered': { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' }
  }

  const { icon: Icon, color, bg, border } = configs[status] || configs['Pending']

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${bg} ${border} ${color} transition-all duration-500`}>
      <Icon size={12} className="shrink-0" />
      <span className="text-[9px] font-black uppercase tracking-widest">{status}</span>
    </div>
  )
}

export default OrdersPage
