import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusCircle, 
  MinusCircle, 
  History, 
  ChevronDown, 
  CheckCircle2, 
  AlertCircle,
  Package,
  ArrowRight,
  TrendingUp,
  FileText,
  Loader2
} from 'lucide-react'
import { gsap } from 'gsap'
import toast from 'react-hot-toast'
import socket from '../utils/socket'
import API from '../api/axios'

const StockUpdatePage = ({ role }) => {
  const [products, setProducts] = useState([])
  const [history, setHistory] = useState([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [adjustmentType, setAdjustmentType] = useState('Add')
  const [amount, setAmount] = useState(0)
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const formRef = useRef(null)

  useEffect(() => {
    fetchInitialData()

    socket.on('stockAdjusted', (data) => {
      // Update inventory levels locally
      setProducts(prev => prev.map(p => 
        p._id === data.productId ? { ...p, quantity: data.newQuantity } : p
      ))
      
      // Add to history log
      const logEntry = {
        id: Date.now(),
        product: data.name,
        type: data.type,
        amount: data.amount,
        date: new Date(data.timestamp).toLocaleString(),
        note: data.note
      }
      setHistory(prev => [logEntry, ...prev].slice(0, 10))
    })

    socket.on('productUpdated', (updatedProduct) => {
      setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p))
    })

    return () => {
      socket.off('stockAdjusted')
      socket.off('productUpdated')
    }
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const { data } = await API.get('/products')
      setProducts(data.data)
    } catch (err) {
      toast.error('Failed to fetch product list')
    } finally {
      setLoading(false)
    }
  }

  // 3D Tilt Effect for Form Card
  const handleMouseMove = (e) => {
    if (!formRef.current) return
    const rect = formRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    gsap.to(formRef.current, {
      rotateX: -y * 6,
      rotateY: x * 6,
      duration: 0.5,
      ease: "power2.out"
    })
  }

  const handleMouseLeave = () => {
    gsap.to(formRef.current, { rotateX: 0, rotateY: 0, duration: 0.5 })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProduct || amount <= 0) {
      toast.error('Please select a product and valid amount')
      return
    }

    setIsSubmitting(true)
    const loadingToast = toast.loading('Processing adjustment...')

    try {
      await API.post('/stock/adjust', {
        productId: selectedProduct,
        type: adjustmentType,
        amount: amount,
        note: note
      })

      toast.success('Stock updated successfully', { id: loadingToast })
      
      // Reset form
      setAmount(0)
      setNote('')
      setSelectedProduct('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update stock', { id: loadingToast })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center p-20 glass-dark rounded-[2.5rem] border border-red-500/10 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-red-500/50" />
        <h2 className="text-2xl font-bold">Access Restricted</h2>
        <p className="text-gray-500">Only administrators are authorized to update manual stock levels.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-10">
      {/* Left side: Adjustment Form */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Stock Adjustment</h1>
          <p className="text-gray-500">Manually add or reduce inventory stock levels.</p>
        </div>

        <motion.div
          ref={formRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="preserve-3d glass-dark p-8 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUp size={120} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-black tracking-widest uppercase text-gray-500 ml-1">Select Product</label>
              <div className="relative group">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                <select 
                  required
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500/50 transition-all text-sm appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="" className="bg-black">
                    {loading ? 'Syncing products...' : 'Choose a product...'}
                  </option>
                  {products.map(p => (
                    <option key={p._id} value={p._id} className="bg-black">
                      {p.name} (Stock: {p.quantity})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button 
                 type="button" 
                 onClick={() => setAdjustmentType('Add')}
                 className={`py-4 rounded-2xl border flex items-center justify-center gap-2 font-bold transition-all ${
                   adjustmentType === 'Add' 
                    ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/20' 
                    : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
                 }`}
               >
                 <PlusCircle size={20} /> Add
               </button>
               <button 
                 type="button" 
                 onClick={() => setAdjustmentType('Reduce')}
                 className={`py-4 rounded-2xl border flex items-center justify-center gap-2 font-bold transition-all ${
                   adjustmentType === 'Reduce' 
                    ? 'bg-red-600/10 border-red-500 text-red-400 shadow-lg shadow-red-500/20' 
                    : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
                 }`}
               >
                 <MinusCircle size={20} /> Reduce
               </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black tracking-widest uppercase text-gray-500 ml-1">Quantity</label>
              <input 
                required
                type="number" 
                min="1"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                placeholder="Enter amount..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-lg font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black tracking-widest uppercase text-gray-500 ml-1">Adjustment Note (Optional)</label>
              <textarea 
                rows="3"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Why is this stock being changed?"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 transition-all text-sm resize-none"
              />
            </div>

            <button 
              disabled={isSubmitting || loading}
              className={`w-full py-5 rounded-2xl font-bold text-lg shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 ${
                adjustmentType === 'Add' ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-red-600 shadow-red-600/20'
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Confirm Adjustment <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Right side: Adjustment History */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <History size={24} className="text-blue-500" /> Recent Activity Log
            </h2>
            <p className="text-gray-500">Review the latest manual stock overrides.</p>
          </div>
          <button className="text-xs text-gray-500 hover:text-white transition-colors">View full logs</button>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {history.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
              <p className="text-gray-500 italic">No recent adjustments logged.</p>
            </div>
          ) : (
            history.map((log, i) => (
              <HistoryItem key={log.id} log={log} index={i} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const HistoryItem = ({ log, index }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ x: -4, translateZ: 10, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)' }}
    className="glass-dark p-6 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all flex items-start gap-4 cursor-default group"
  >
    <div className={`p-3 rounded-2xl flex-shrink-0 ${log.type === 'Add' ? 'bg-emerald-600/10 text-emerald-400' : 'bg-red-600/10 text-red-400'}`}>
      <FileText size={20} />
    </div>
    <div className="flex-1 space-y-1">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">{log.product}</h4>
        <span className="text-[10px] text-gray-500 font-medium">{log.date}</span>
      </div>
      <div className="flex items-center gap-2">
         <span className={`text-xs font-black uppercase tracking-widest ${log.type === 'Add' ? 'text-emerald-500' : 'text-red-500'}`}>
           {log.type === 'Add' ? '+' : '-'}{log.amount} Units
         </span>
         <span className="text-gray-600">•</span>
         <p className="text-xs text-gray-400 italic">"{log.note}"</p>
      </div>
    </div>
  </motion.div>
)

export default StockUpdatePage
