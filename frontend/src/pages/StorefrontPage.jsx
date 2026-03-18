import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, 
  ShoppingCart, 
  Search, 
  Filter, 
  Loader2, 
  X, 
  CheckCircle2, 
  ArrowRight,
  TrendingDown,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import API from '../api/axios'
import socket from '../utils/socket'

const StorefrontPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [purchasingItem, setPurchasingItem] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchProducts()

    socket.on('productCreated', (newProduct) => {
      setProducts(prev => [newProduct, ...prev])
    })

    socket.on('productUpdated', (updatedProduct) => {
      setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p))
    })

    socket.on('productDeleted', (productId) => {
      setProducts(prev => prev.filter(p => p._id !== productId))
    })

    socket.on('stockAdjusted', (data) => {
      setProducts(prev => prev.map(p => 
        p._id === data.productId ? { ...p, quantity: data.newQuantity } : p
      ))
    })

    return () => {
      socket.off('productCreated')
      socket.off('productUpdated')
      socket.off('productDeleted')
      socket.off('stockAdjusted')
    }
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data } = await API.get('/products')
      setProducts(data.data)
    } catch (err) {
      toast.error('Failed to load store items')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (productId, quantity) => {
    const loadingToast = toast.loading('Processing your purchase...')
    setIsSubmitting(true)
    try {
       await API.post('/orders', {
         products: [{ product: productId, quantity }]
       })
       toast.success('Purchase successful! Check your orders.', { id: loadingToast, icon: '🛍️' })
       setPurchasingItem(null)
    } catch (err) {
       toast.error(err.response?.data?.error || 'Purchase failed', { id: loadingToast })
    } finally {
       setIsSubmitting(false)
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-blue-600/20 to-purple-600/5 border border-white/5 p-12">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black tracking-widest uppercase">
              Official Hardware Store
            </span>
            <h1 className="text-5xl font-black mt-4 leading-tight">
              Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Stock & Equipment</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Direct access to our centralized warehouse. Secure purchasing, real-time stock tracking, and instant fulfillment.
            </p>
          </motion.div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-2xl -z-0">
          <Package size={200} className="text-blue-500 rotate-12" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search for hardware, tools, components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all"
          />
        </div>
        <div className="flex gap-3">
          <button className="glass-dark border border-white/10 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-white/5 transition-all">
            <Filter size={18} /> Categories
          </button>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-4 text-gray-500">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="font-bold tracking-widest uppercase text-xs">Syncing Storefront...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence>
            {filteredProducts.map((product, i) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                index={i} 
                onBuy={() => setPurchasingItem(product)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredProducts.length === 0 && !loading && (
        <div className="py-20 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto border border-white/5">
             <AlertCircle size={40} className="text-gray-600" />
          </div>
          <p className="text-gray-500 font-medium">No items found matching your criteria.</p>
        </div>
      )}

      {/* Purchase Modal */}
      {purchasingItem && (
        <PurchaseModal 
          product={purchasingItem}
          onClose={() => setPurchasingItem(null)}
          onConfirm={(qty) => handlePurchase(purchasingItem._id, qty)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}

const ProductCard = ({ product, index, onBuy }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ y: -8 }}
    className="glass-dark rounded-[2.5rem] border border-white/5 overflow-hidden group hover:border-blue-500/30 transition-all flex flex-col h-full"
  >
    <div className="aspect-[4/3] relative bg-gradient-to-br from-white/5 to-transparent p-12 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Package size={60} className="text-blue-500/20 group-hover:text-blue-500/40 transition-colors group-hover:scale-110 duration-700" />
      <div className="absolute top-4 right-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${product.quantity <= 10 ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
          {product.quantity <= 10 ? 'Low Stock' : 'In Stock'}
        </span>
      </div>
    </div>

    <div className="p-8 flex flex-col flex-1 gap-6">
      <div className="space-y-1">
        <p className="text-[10px] text-blue-400 font-black tracking-widest uppercase">{product.category}</p>
        <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors uppercase tracking-tight">{product.name}</h3>
        <p className="text-xs text-gray-500 font-mono italic">{product.SKU}</p>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Price</span>
          <span className="text-2xl font-black">${product.price.toFixed(2)}</span>
        </div>
        <button 
          onClick={onBuy}
          disabled={product.quantity === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white p-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-90 group/btn"
        >
          <ShoppingCart size={20} className="group-hover/btn:rotate-12 transition-transform" />
        </button>
      </div>
    </div>
  </motion.div>
)

const PurchaseModal = ({ product, onClose, onConfirm, isSubmitting }) => {
  const [qty, setQty] = useState(1)

  const handleQtyChange = (e) => {
    let val = parseInt(e.target.value) || 1
    if (val > product.quantity) val = product.quantity
    if (val < 1) val = 1
    setQty(val)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md glass-dark rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden relative"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
           <h2 className="text-2xl font-black tracking-tight">Checkout</h2>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white">
             <X size={24} />
           </button>
        </div>

        <div className="p-10 space-y-8">
           <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/5">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-600/20 text-blue-400">
                <Package size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold uppercase tracking-tight">{product.name}</h3>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-black">{product.category}</p>
              </div>
           </div>

           <div className="grid grid-cols-1 gap-6">
             <div className="group space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Select Quantity</label>
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 focus-within:border-blue-500/50 transition-all">
                  <TrendingDown size={20} className="text-gray-500" />
                  <input 
                    type="number" 
                    min="1" 
                    max={product.quantity} 
                    value={qty}
                    onChange={handleQtyChange}
                    className="flex-1 bg-transparent text-xl font-black outline-none text-white text-center"
                  />
                  <div className="text-[10px] font-black uppercase bg-blue-500/10 text-blue-500 px-2 py-1 rounded">Max {product.quantity}</div>
                </div>
             </div>
           </div>

           <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/10 border border-blue-500/20 space-y-2">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
                <span className="text-sm font-mono">${(product.price * qty).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-white">
                <span className="text-sm font-bold uppercase tracking-widest">Total Amount</span>
                <span className="text-3xl font-black">${(product.price * qty).toFixed(2)}</span>
              </div>
           </div>

           <button 
             onClick={() => onConfirm(qty)}
             disabled={isSubmitting}
             className="w-full py-5 rounded-[2rem] bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-2xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
           >
             {isSubmitting ? (
               <Loader2 className="w-6 h-6 animate-spin" />
             ) : (
               <>Place Secured Order <ArrowRight size={20} /></>
             )}
           </button>
        </div>
      </motion.div>
    </div>
  )
}

export default StorefrontPage
