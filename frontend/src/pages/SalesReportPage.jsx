import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  ArrowUpRight, 
  Calendar, 
  Filter, 
  PieChart as PieChartIcon, 
  Activity,
  Award,
  Loader2
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts'
import { gsap } from 'gsap'
import API from '../api/axios'

const adminSalesData = [
  { name: 'Jan', revenue: 4500, orders: 120 },
  { name: 'Feb', revenue: 5200, orders: 145 },
  { name: 'Mar', revenue: 4800, orders: 132 },
  { name: 'Apr', revenue: 6100, orders: 170 },
  { name: 'May', revenue: 5900, orders: 155 },
  { name: 'Jun', revenue: 7200, orders: 195 },
]

const categoryData = [
  { name: 'Storage', value: 400, color: '#6366f1' },
  { name: 'Electronics', value: 300, color: '#ec4899' },
  { name: 'Machinery', value: 200, color: '#8b5cf6' },
  { name: 'Safety', value: 100, color: '#10b981' },
]

const userPurchaseData = [
  { month: 'Jan', amount: 120 },
  { month: 'Feb', amount: 350 },
  { month: 'Mar', amount: 80 },
  { month: 'Apr', amount: 420 },
  { month: 'May', amount: 200 },
  { month: 'Jun', amount: 150 },
]

const SalesReportPage = ({ role }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isAdmin = role === 'Admin'

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const endpoint = isAdmin ? '/sales/summary' : '/sales/user'
      const { data } = await API.get(endpoint)
      setData(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-gray-500 font-medium">Aggregating real-time analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {isAdmin ? 'Sales Analytics' : 'Purchase Report'}
            <span className={`text-xs px-2 py-0.5 rounded-full border ${isAdmin ? 'bg-blue-500/10 text-blue-400 border-blue-400/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
              {role}
            </span>
          </h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? 'Analyze store-wide revenue and product performance.' : 'Review your personal spending and purchase history.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm text-gray-400">
            <Calendar size={16} />
            <span>Real-time Data</span>
          </div>
          <button onClick={fetchReport} className="glass border border-white/10 p-2.5 rounded-2xl hover:bg-white/5 transition-all text-gray-400 hover:text-white">
            <Activity size={18} />
          </button>
        </div>
      </div>

      {isAdmin ? <AdminAnalytics data={data} /> : <UserAnalytics data={data} />}
    </div>
  )
}

const AdminAnalytics = ({ data }) => {
  const { totalRevenue, totalOrders, averageOrderValue, totalCustomers, salesByMonth, categoryDistribution } = data

  return (
    <div className="space-y-8">
      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CountUpCard title="Total Revenue" value={totalRevenue || 0} prefix="$" trend="+Live" up={true} icon={<DollarSign/>} color="blue" />
        <CountUpCard title="Total Orders" value={totalOrders || 0} trend="+Live" up={true} icon={<ShoppingBag/>} color="purple" />
        <CountUpCard title="Average Order" value={averageOrderValue || 0} prefix="$" trend="Avg" up={true} icon={<Activity/>} color="emerald" />
        <CountUpCard title="Active Customers" value={totalCustomers || 0} trend="Live" up={true} icon={<Users/>} color="pink" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Revenue Chart */}
        <ChartCard title="Revenue Growth" className="lg:col-span-2">
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesByMonth || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '12px'}}
                  itemStyle={{color: '#6366f1'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Category Breakdown */}
        <ChartCard title="Category Distribution">
          <div className="h-[300px] w-full mt-4 relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                    data={categoryDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="count"
                    nameKey="category"
                 >
                   {(categoryDistribution || []).map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={['#6366f1', '#ec4899', '#8b5cf6', '#10b981'][index % 4]} stroke="none" />
                   ))}
                 </Pie>
                 <Tooltip 
                   contentStyle={{backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '12px'}}
                 />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Inventory</p>
                <p className="text-lg font-black text-white">Mix</p>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
             {(categoryDistribution || []).map((cat, index) => (
               <div key={cat.category} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#6366f1', '#ec4899', '#8b5cf6', '#10b981'][index % 4] }} />
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{cat.category}</span>
               </div>
             ))}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}

const UserAnalytics = ({ data }) => {
  const { totalSpent, totalItems, monthlySpending } = data

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CountUpCard title="Total Spent" value={totalSpent || 0} prefix="$" trend="Lifetime" up={true} icon={<DollarSign/>} color="primary" />
        <CountUpCard title="Items Purchased" value={totalItems || 0} trend="Total Units" up={true} icon={<ShoppingBag/>} color="purple" />
      </div>

      <ChartCard title="Monthly Spending Trends">
        <div className="h-[300px] w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlySpending || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
              <Tooltip 
                 contentStyle={{backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '12px'}}
                 cursor={{fill: '#ffffff05'}}
              />
              <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="glass-dark p-8 rounded-[2.5rem] border border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="p-5 rounded-3xl bg-primary/10 text-primary border border-primary/20">
               <Award size={32} />
            </div>
            <div>
               <h3 className="text-xl font-bold">Loyalty Status: Platinum</h3>
               <p className="text-gray-500">You've unlocked 15% discount on all machinery orders.</p>
            </div>
         </div>
         <button className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-primary/20">
            View Perks
         </button>
      </div>
    </div>
  )
}

const ChartCard = ({ title, children, className }) => {
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    gsap.to(cardRef.current, {
      rotateX: -y * 4,
      rotateY: x * 4,
      duration: 0.5,
      ease: "power2.out"
    })
  }

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, duration: 0.5 })
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className={`preserve-3d glass-dark p-8 rounded-[2.5rem] border border-white/5 shadow-2xl ${className}`}
    >
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      {children}
    </motion.div>
  )
}

const CountUpCard = ({ title, value, prefix = '', trend, up, icon, color }) => {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let start = 0
    const end = value
    const duration = 1500
    const increment = end / (duration / 16)
    
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)
    
    return () => clearInterval(timer)
  }, [value])

  const colors = {
    blue: 'border-blue-500/20 text-blue-400 bg-blue-500/10',
    purple: 'border-purple-500/20 text-purple-400 bg-purple-500/10',
    emerald: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10',
    pink: 'border-pink-500/20 text-pink-400 bg-pink-500/10',
    primary: 'border-primary/20 text-primary bg-primary/10',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="glass-dark p-6 rounded-[2rem] border border-white/5 relative group overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colors[color]} border group-hover:scale-110 transition-transform`}>
           {icon}
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${up ? 'text-emerald-400' : 'text-red-400'}`}>
          {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {trend}
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{title}</p>
        <h4 className="text-3xl font-black mt-1">
          {prefix}{count.toLocaleString(undefined, { minimumFractionDigits: value % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}
        </h4>
      </div>
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-[40px] opacity-20 ${colors[color].split(' ')[2]}`} />
    </motion.div>
  )
}

export default SalesReportPage
