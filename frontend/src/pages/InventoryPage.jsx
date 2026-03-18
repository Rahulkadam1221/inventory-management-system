import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Filter, 
  ChevronDown, 
  AlertCircle,
  X,
  CheckCircle2,
  MoreVertical,
  Loader2
} from 'lucide-react'
import { gsap } from 'gsap'
import toast from 'react-hot-toast'
import socket from '../utils/socket'
import API from '../api/axios'

const InventoryPage = ({ role }) => {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [purchasingItem, setPurchasingItem] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isAdmin = role === 'Admin'

  useEffect(() => {
    fetchProducts()

    // Socket listeners for real-time updates
    socket.on('productCreated', (newProduct) => {
      setInventory(prev => [newProduct, ...prev])
      toast.success(`New product added: ${newProduct.name}`, { icon: '📦' })
    })

    socket.on('productUpdated', (updatedProduct) => {
      setInventory(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p))
    })

    socket.on('productDeleted', (productId) => {
      setInventory(prev => prev.filter(p => p._id !== productId))
    })

    socket.on('stockAdjusted', (data) => {
      setInventory(prev => prev.map(p => 
        p._id === data.productId ? { ...p, quantity: data.newQuantity } : p
      ))
      if (isAdmin) {
        toast(`${data.name} stock ${data.type.toLowerCase()}ed by ${data.amount}`, { icon: '🔄' })
      }
    })

    return () => {
      socket.off('productCreated')
      socket.off('productUpdated')
      socket.off('productDeleted')
      socket.off('stockAdjusted')
    }
  }, [isAdmin])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data } = await API.get('/products')
      setInventory(data.data)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch inventory')
      toast.error('Failed to sync inventory')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = inventory.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.SKU.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenModal = (item = null) => {
    if (!isAdmin) return
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!isAdmin) return
    if (window.confirm('Are you sure you want to delete this item?')) {
      const loadingToast = toast.loading('Deleting product...')
      try {
        await API.delete(`/products/${id}`)
        toast.success('Product deleted successfully', { id: loadingToast })
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to delete product', { id: loadingToast })
      }
    }
  }

  const handleSave = async (data) => {
    setIsSubmitting(true)
    const loadingToast = toast.loading(editingItem ? 'Updating product...' : 'Creating product...')
    try {
      if (editingItem) {
        await API.put(`/products/${editingItem._id}`, data)
        toast.success('Product updated successfully', { id: loadingToast })
      } else {
        await API.post('/products', data)
        toast.success('Product created successfully', { id: loadingToast })
      }
      setIsModalOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save product', { id: loadingToast })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePurchase = async (productId, quantity) => {
    const loadingToast = toast.loading('Placing order...')
    setIsSubmitting(true)
    try {
       await API.post('/orders', {
         products: [{ product: productId, quantity }]
       })
       toast.success('Order placed successfully!', { id: loadingToast, icon: '🎉' })
       setPurchasingItem(null)
    } catch (err) {
       toast.error(err.response?.data?.error || 'Failed to place order', { id: loadingToast })
    } finally {
       setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Inventory Management 
            <span className={`text-xs px-2 py-0.5 rounded-full border ${isAdmin ? 'bg-blue-500/10 text-blue-400 border-blue-400/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
              {isAdmin ? 'Admin View' : 'User View'}
            </span>
          </h1>
          <p className="text-gray-500 mt-1">Manage and track your warehouse products.</p>
        </div>

        {isAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 w-fit"
          >
            <Plus size={20} /> Add Product
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-primary/50 transition-all"
          />
        </div>
        <button className="glass border border-white/10 px-6 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 hover:bg-white/5 transition-all">
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* Inventory Table Container */}
      <div className="glass-dark rounded-[2.5rem] border border-white/5 overflow-hidden perspective">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-gray-400 text-xs font-bold tracking-widest uppercase">
              <th className="px-8 py-5">Product Details</th>
              <th className="px-8 py-5">SKU</th>
              <th className="px-8 py-5 text-center">Stock</th>
              <th className="px-8 py-5">Price</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-gray-500 text-sm font-medium">Synchronizing stock data...</p>
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {filteredItems.map((item, index) => (
                  <InventoryRow 
                    key={item._id} 
                    item={item} 
                    index={index} 
                    isAdmin={isAdmin}
                    onEdit={() => handleOpenModal(item)}
                    onDelete={() => handleDelete(item._id)}
                    onBuyRequest={() => setPurchasingItem(item)}
                  />
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>

        {filteredItems.length === 0 && !loading && (
          <div className="p-20 text-center space-y-4">
             <div className="p-4 rounded-3xl bg-white/5 w-fit mx-auto">
               <Package className="w-12 h-12 text-gray-600" />
             </div>
             <p className="text-gray-500 font-medium italic">
               {error ? error : 'No products matched your search.'}
             </p>
             {error && (
               <button 
                 onClick={fetchProducts}
                 className="text-primary text-sm font-bold hover:underline"
                >
                   Try again
                </button>
             )}
          </div>
        )}
      </div>

      {/* Inventory Management Modal */}
      {isModalOpen && (
        <InventoryModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
          editingItem={editingItem} 
          isSubmitting={isSubmitting}
        />
      )}

      {/* Purchase Modal */}
      {purchasingItem && (
        <PurchaseModal
          item={purchasingItem}
          onClose={() => setPurchasingItem(null)}
          onConfirm={(qty) => handlePurchase(purchasingItem._id, qty)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}

const InventoryRow = ({ item, index, isAdmin, onEdit, onDelete, onBuyRequest }) => {
  const rowRef = useRef(null)

  return (
    <motion.tr
      ref={rowRef}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group hover:bg-white/5 transition-all duration-300 cursor-default preserve-3d"
      whileHover={{ translateZ: 10 }}
    >
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center border border-white/5 shadow-inner">
            <Package size={20} className="text-primary group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <p className="font-bold text-sm tracking-tight">{item.name}</p>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{item.category}</p>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <span className="text-xs font-mono text-gray-400 font-medium">{item.SKU}</span>
      </td>
      <td className="px-8 py-6 text-center">
        <div className="inline-flex flex-col items-center">
          <span className={`text-sm font-black ${item.quantity <= 10 ? 'text-red-400' : 'text-gray-200'}`}>
            {item.quantity}
          </span>
          <div className="w-8 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
             <div className="h-full bg-primary" style={{ width: `${Math.min(item.quantity, 100)}%` }} />
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <span className="text-sm font-bold">${item.price.toFixed(2)}</span>
      </td>
      <td className="px-8 py-6 text-right">
        {!isAdmin && (
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={onBuyRequest}
              disabled={item.quantity === 0}
              className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white px-6 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-30 disabled:hover:bg-primary/10 disabled:hover:text-primary shadow-sm shadow-primary/5"
            >
              Buy Now
            </button>
          </div>
        )}
        <div className={`flex items-center justify-end gap-2 transition-opacity ${isAdmin ? 'opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0' : 'hidden'}`}>
          <button 
            onClick={onEdit}
            className="p-2.5 rounded-xl bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
          >
            <Edit3 size={16} />
          </button>
          <button 
            onClick={onDelete}
            className="p-2.5 rounded-xl bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-90"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </motion.tr>
  )
}

const InventoryModal = ({ onClose, onSave, editingItem, isSubmitting }) => {
  const [formData, setFormData] = useState(
    editingItem ? {
      name: editingItem.name,
      SKU: editingItem.SKU,
      category: editingItem.category,
      quantity: editingItem.quantity,
      price: editingItem.price
    } : { name: '', SKU: '', category: 'General', quantity: 0, price: 0 }
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-lg glass-dark rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
           <h2 className="text-2xl font-bold">{editingItem ? 'Edit Product' : 'Add New Product'}</h2>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X/></button>
        </div>

        <form className="p-8 space-y-5" onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="space-y-1.5">
             <label className="text-[10px] font-black tracking-widest uppercase text-gray-500 ml-1">Product Name</label>
             <input 
               required
               type="text" 
               value={formData.name} 
               onChange={e => setFormData({...formData, name: e.target.value})}
               className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 outline-none focus:border-blue-500/50 transition-all text-sm"
               placeholder="e.g. Warehouse Rack B2"
             />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-[10px] font-black tracking-widest uppercase text-gray-500 ml-1">SKU Code</label>
                <input 
                  required
                  type="text"
                  value={formData.SKU}
                  onChange={e => setFormData({...formData, SKU: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 outline-none focus:border-blue-500/50 transition-all text-sm font-mono"
                  placeholder="WH-XXX"
                />
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-black tracking-widest uppercase text-gray-500 ml-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 outline-none focus:border-blue-500/50 transition-all text-sm"
                >
                  <option className="bg-black">Storage</option>
                  <option className="bg-black">Electronics</option>
                  <option className="bg-black">Safety</option>
                  <option className="bg-black">General</option>
                </select>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-[10px] font-black tracking-widest uppercase text-gray-500 ml-1">Quantity</label>
                <input 
                  required
                  type="number"
                  value={formData.quantity}
                  onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 outline-none focus:border-blue-500/50 transition-all text-sm"
                />
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-black tracking-widest uppercase text-gray-500 ml-1">Price per Unit</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-10 pr-5 outline-none focus:border-blue-500/50 transition-all text-sm"
                  />
                </div>
             </div>
          </div>

          <div className="pt-4 flex gap-4">
             <button 
               type="button" 
               onClick={onClose}
               className="flex-1 py-4 rounded-2xl glass border border-white/10 font-bold text-sm hover:bg-white/5 transition-all outline-none"
             >
               Cancel
             </button>
             <button 
               disabled={isSubmitting}
               className="flex-1 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold text-sm text-white shadow-xl shadow-blue-600/20 transition-all active:scale-95 outline-none flex items-center justify-center gap-2"
             >
               {isSubmitting ? (
                 <Loader2 className="w-4 h-4 animate-spin" />
               ) : (
                 editingItem ? 'Update Item' : 'Create Entry'
               )}
             </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const PurchaseModal = ({ item, onClose, onConfirm, isSubmitting }) => {
  const [qty, setQty] = useState(1)

  const handleQtyChange = (e) => {
    let val = parseInt(e.target.value) || 1
    if (val > item.quantity) val = item.quantity
    if (val < 1) val = 1
    setQty(val)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-sm glass-dark rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-transparent">
           <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="text-blue-400 w-5 h-5"/> Place Order</h2>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"><X size={20}/></button>
        </div>

        <div className="p-6 space-y-6">
           <div className="space-y-1 text-center">
             <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
               <Package className="w-8 h-8 text-blue-400" />
             </div>
             <h3 className="text-lg font-bold">{item.name}</h3>
             <p className="text-xs text-gray-400 font-mono">{item.SKU} • {item.category}</p>
           </div>

           <div className="glass p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Purchase Quantity</label>
             <input 
               type="number" 
               min="1" 
               max={item.quantity} 
               value={qty}
               onChange={handleQtyChange}
               className="w-24 bg-black/50 border border-white/10 rounded-xl py-2 px-3 outline-none text-center text-xl font-extrabold text-white focus:border-blue-500/50 transition-all"
             />
             <p className="text-[10px] text-gray-500">{item.quantity} items available in stock</p>
           </div>

           <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
             <span className="text-sm font-bold text-gray-400">Total Price:</span>
             <span className="text-2xl font-black text-white">${(item.price * qty).toFixed(2)}</span>
           </div>

           <button 
             onClick={() => onConfirm(qty)}
             disabled={isSubmitting}
             className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-xl shadow-blue-600/20 transition-all active:scale-95 outline-none flex items-center justify-center gap-2"
           >
             {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Order'}
           </button>
        </div>
      </motion.div>
    </div>
  )
}

export default InventoryPage
