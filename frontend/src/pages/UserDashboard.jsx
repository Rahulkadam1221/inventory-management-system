import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { 
  ShoppingCart, 
  Package, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight,
  Truck
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts'
import API from '../api/axios'

const orderData = [
  { month: 'Jan', orders: 4 },
  { month: 'Feb', orders: 7 },
  { month: 'Mar', orders: 5 },
  { month: 'Apr', orders: 12 },
  { month: 'May', orders: 8 },
  { month: 'Jun', orders: 15 },
]

const UserDashboard = () => {
  const [stats, setStats] = useState({ totalOrders: 0, itemsBought: 0, activeShipments: 0 })
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('/orders')
        const ords = data.data
        
        let itemsCount = 0
        ords.forEach(o => {
          o.products.forEach(p => itemsCount += p.quantity)
        })
        
        const active = ords.filter(o => o.status !== 'Delivered').length
        
        setStats({
          totalOrders: ords.length,
          itemsBought: itemsCount,
          activeShipments: active
        })
        
        setRecentOrders(ords.slice(0, 3))
      } catch (err) {
        console.error('Failed to load user orders', err)
      }
    }
    fetchOrders()
  }, [])

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <p className="text-gray-500">Track your order history and active shipments.</p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatItem 
          icon={<ShoppingCart className="text-primary" />} 
          title="My Orders" 
          value={stats.totalOrders} 
          detail="Total orders placed"
        />
        <StatItem 
          icon={<Package className="text-purple-400" />} 
          title="Purchased Items" 
          value={stats.itemsBought} 
          detail="Units delivered or in transit"
        />
        <StatItem 
          icon={<Clock className="text-orange-400" />} 
          title="Active Shipments" 
          value={stats.activeShipments} 
          detail="En route to destination"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Simple Analytics */}
        <div className="lg:col-span-2 glass-dark p-8 rounded-[2.5rem] border border-white/5 space-y-6">
          <h3 className="text-xl font-bold">Purchase Trends</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={orderData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '12px'}}
                />
                <Line type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={4} dot={{r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#050505'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Cards */}
        <div className="space-y-4">
           <h3 className="text-xl font-bold mb-6">Recent Order Status</h3>
           {recentOrders.length === 0 ? (
             <p className="text-gray-500 text-sm">No recent orders found. Visit the inventory to place an order!</p>
           ) : recentOrders.map(order => (
             <StatusCard 
               key={order._id}
               icon={order.status === 'Delivered' ? <CheckCircle2 className="text-emerald-400" /> : <Truck className="text-blue-400" />} 
               title={`Order #${order._id.substring(order._id.length - 6).toUpperCase()}`} 
               status={order.status} 
               time={new Date(order.createdAt).toLocaleDateString()}
               progress={order.status === 'Delivered' ? 100 : order.status === 'Shipped' ? 65 : 20}
               color={order.status === 'Delivered' ? 'emerald' : 'blue'}
             />
           ))}
        </div>
      </div>
    </div>
  )
}

const StatItem = ({ icon, title, value, detail }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -5 }}
    className="glass-dark p-6 rounded-[2rem] border border-white/5 flex gap-5 items-center hover:border-white/10 transition-all"
  >
    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-2xl font-bold mb-1">{value}</h4>
      <p className="text-[10px] text-gray-500">{detail}</p>
    </div>
  </motion.div>
)

const StatusCard = ({ icon, title, status, time, progress, color }) => {
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    gsap.to(cardRef.current, {
      rotateX: -y * 10,
      rotateY: x * 10,
      duration: 0.4
    })
  }

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, duration: 0.4 })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="preserve-3d glass-dark p-5 rounded-3xl border border-white/5 group cursor-pointer hover:border-primary/20 transition-all"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-xl bg-${color}-500/10`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm">{title}</h4>
          <p className="text-xs text-gray-500">{time}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-${color}-500/10 text-${color}-400 border border-${color}-400/20`}>
          {status}
        </span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className={`h-full bg-${color}-500`} 
        />
      </div>
    </div>
  )
}

export default UserDashboard
