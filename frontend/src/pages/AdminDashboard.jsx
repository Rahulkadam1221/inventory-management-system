import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  AreaChart,
  Area
} from 'recharts'
import API from '../api/axios'
import { useNavigate } from 'react-router-dom'

const data = [
  { name: 'Mon', sales: 4000, revenue: 2400 },
  { name: 'Tue', sales: 3000, revenue: 1398 },
  { name: 'Wed', sales: 2000, revenue: 9800 },
  { name: 'Thu', sales: 2780, revenue: 3908 },
  { name: 'Fri', sales: 1890, revenue: 4800 },
  { name: 'Sat', sales: 2390, revenue: 3800 },
  { name: 'Sun', sales: 3490, revenue: 4300 },
]

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ products: 0, lowStock: 0, orders: 0, revenue: 0 })
  const [criticalStock, setCriticalStock] = useState([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [prodRes, ordRes] = await Promise.all([
          API.get('/products'),
          API.get('/orders')
        ])
        
        const prods = prodRes.data.data
        const ords = ordRes.data.data

        const lowStockItems = prods.filter(p => p.quantity <= 10)
        const revenue = ords.reduce((acc, order) => acc + order.totalPrice, 0)

        setStats({
          products: prods.length,
          lowStock: lowStockItems.length,
          orders: ords.length,
          revenue
        })
        
        setCriticalStock(lowStockItems.slice(0, 5))
      } catch (err) {
        console.error('Failed to load dashboard stats', err)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Inventory Overview</h1>
          <p className="text-gray-500">Monitor your warehouse and sales performance.</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/inventory')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Package />} 
          title="Total Products" 
          value={stats.products.toLocaleString()} 
          trend="Live Data" 
          up={true} 
          color="blue" 
        />
        <StatCard 
          icon={<AlertTriangle />} 
          title="Low Stock" 
          value={stats.lowStock.toLocaleString()} 
          trend={stats.lowStock > 0 ? "Action required" : "Healthy"} 
          up={stats.lowStock === 0} 
          color="red" 
        />
        <StatCard 
          icon={<ShoppingCart />} 
          title="Total Orders" 
          value={stats.orders.toLocaleString()} 
          trend="Live Data" 
          up={true} 
          color="purple" 
        />
        <StatCard 
          icon={<TrendingUp />} 
          title="Revenue" 
          value={`$${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          trend="Live Data" 
          up={true} 
          color="green" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-dark p-8 rounded-[2.5rem] border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Revenue Growth</h3>
            <select className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '12px'}}
                  itemStyle={{color: '#3b82f6'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-dark p-8 rounded-[2.5rem] border border-white/5 space-y-6">
          <h3 className="text-xl font-bold">Orders vs Sales</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip 
                   contentStyle={{backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '12px'}}
                   cursor={{fill: '#ffffff05'}}
                />
                <Bar dataKey="sales" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Low Stock Table Mock */}
      <div className="glass-dark rounded-[2.5rem] border border-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
           <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
             <AlertTriangle size={20} /> Critical Low Stock
           </h3>
           <button className="text-sm text-gray-500 hover:text-white transition-colors">See all alerts</button>
        </div>
        <div className="p-4">
          <table className="w-full text-sm text-left">
             <thead>
               <tr className="text-gray-500 border-b border-white/5">
                 <th className="px-4 py-3 font-medium">Product</th>
                 <th className="px-4 py-3 font-medium">Category</th>
                 <th className="px-4 py-3 font-medium">Current Stock</th>
                 <th className="px-4 py-3 font-medium">Required</th>
                 <th className="px-4 py-3 font-medium">Status</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
                {criticalStock.length === 0 ? (
                  <tr><td colSpan="5" className="py-8 text-center text-gray-500 font-medium">No critical low stock items! 🎉</td></tr>
                ) : criticalStock.map((row, i) => (
                  <tr key={i} className="group hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4 font-semibold">{row.name}</td>
                    <td className="px-4 py-4 text-gray-400">{row.category || 'General'}</td>
                    <td className="px-4 py-4 text-red-400 font-bold">{row.quantity}</td>
                    <td className="px-4 py-4">10</td>
                    <td className="px-4 py-4">
                      <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase rounded-full border border-red-500/20">Critical</span>
                    </td>
                  </tr>
                ))}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ icon, title, value, trend, up, color }) => {
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
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

  const colors = {
    blue: 'from-blue-600/20 to-blue-600/5 text-blue-400 border-blue-600/20',
    red: 'from-red-600/20 to-red-600/5 text-red-400 border-red-600/20',
    purple: 'from-purple-600/20 to-purple-600/5 text-purple-400 border-purple-600/20',
    green: 'from-emerald-600/20 to-emerald-600/5 text-emerald-400 border-emerald-600/20',
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`preserve-3d glass-dark p-6 rounded-[2rem] border overflow-hidden relative group transition-colors ${colors[color].split(' ').pop()}`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colors[color].split(' ').slice(0, 2).join(' ')} blur-[40px] -z-10 opacity-50`} />
      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform ${colors[color].split(' ')[2]}`}>
            {icon}
          </div>
          <div className={`flex items-center gap-1 text-xs font-bold ${up ? 'text-emerald-400' : 'text-gray-500'}`}>
            {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {trend}
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <h4 className="text-3xl font-extrabold tracking-tight">{value}</h4>
        </div>
      </div>
    </motion.div>
  )
}

export default AdminDashboard
