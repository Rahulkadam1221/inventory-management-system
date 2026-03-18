import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, Mail, ArrowRight, Github, Chrome, AlertCircle, Package, ShieldCheck, Users } from 'lucide-react'
import { gsap } from 'gsap'
import { useAuth } from '../context/AuthContext'

const AuthPage = () => {
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'User' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const cardRef = useRef(null)

  // 3D Tilt Effect
  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    gsap.to(cardRef.current, {
      rotateX: -y * 12,
      rotateY: x * 12,
      duration: 0.5,
      ease: "power2.out"
    })
  }

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: "power2.out"
    })
  }

  // Validation Logic
  const validate = () => {
    let newErrors = {}
    if (!isLogin && !formData.name.trim()) newErrors.name = "Full name is required"
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    if (validate()) {
      setIsSubmitting(true)
      
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password)
      } else {
        result = await register(formData)
      }

      setIsSubmitting(false)
      if (!result.success) {
        setSubmitError(result.message)
      }
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null })
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setErrors({})
    setSubmitError('')
    setFormData({ ...formData, name: '', email: '', password: '' })
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#050505] selection:bg-primary/30">
      
      {/* Background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full"
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 60, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full"
        />
      </div>

      <div className="perspective w-full max-w-md px-4 relative z-10 py-10">
        {/* IMS Branding */}
        <div className="flex justify-center items-center gap-2 mb-8 animate-reveal">
           <div className={`p-2 rounded-xl shadow-lg transition-colors duration-500 ${formData.role === 'Admin' ? 'bg-blue-600 shadow-blue-600/20' : 'bg-primary shadow-primary/20'}`}>
              <Package className="w-6 h-6 text-white" />
           </div>
           <span className="text-2xl font-bold tracking-tight text-white">StockFlow <span className={formData.role === 'Admin' ? 'text-blue-400 italic' : 'text-primary italic'}>Pro</span></span>
        </div>

        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="preserve-3d relative w-full h-[700px] cursor-default"
          animate={{ rotateY: isLogin ? 0 : 180 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
        >
          {/* Card Face (Reusable structure) */}
          <AuthCardFace 
            isLogin={isLogin} 
            isBack={false} 
            formData={formData} 
            errors={errors} 
            submitError={submitError}
            onChange={handleChange} 
            onSubmit={handleSubmit}
            onToggle={toggleMode}
            isSubmitting={isSubmitting}
          />
          <AuthCardFace 
            isLogin={isLogin} 
            isBack={true} 
            formData={formData} 
            errors={errors} 
            submitError={submitError}
            onChange={handleChange} 
            onSubmit={handleSubmit}
            onToggle={toggleMode}
            isSubmitting={isSubmitting}
          />
        </motion.div>
      </div>
    </div>
  )
}

const AuthCardFace = ({ isLogin, isBack, formData, errors, submitError, onChange, onSubmit, onToggle, isSubmitting }) => {
  const isRegisterFace = isBack

  return (
    <div className={`backface-hidden absolute inset-0 w-full h-full glass-dark rounded-[2.5rem] p-8 md:p-10 flex flex-col border border-white/10 shadow-2xl ${isBack ? 'rotate-y-180' : ''}`}>
      <div className="flex-1 flex flex-col justify-center space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            {isRegisterFace ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-gray-400 text-sm">
            {isRegisterFace ? "Join StockFlow Pro for efficient tracking" : `Please login as ${formData.role}`}
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          {submitError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3 text-red-400 text-xs"
            >
              <AlertCircle className="w-4 h-4" />
              {submitError}
            </motion.div>
          )}
          {/* Role Selection */}
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            {['User', 'Admin'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => onChange({ target: { name: 'role', value: role } })}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                  formData.role === role 
                   ? (role === 'Admin' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-primary text-white shadow-lg shadow-primary/30')
                   : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {role === 'Admin' ? <ShieldCheck className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                {role}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {isRegisterFace && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1"
              >
                <div className="group relative">
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.name ? 'text-red-400' : 'text-gray-500 group-focus-within:text-primary'}`} />
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={onChange}
                    placeholder="Full Name"
                    className={`w-full bg-white/5 border ${errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary/50'} rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-white text-sm`}
                  />
                </div>
                {errors.name && <p className="text-[10px] text-red-400 ml-2 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.name}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            <div className="group relative">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.email ? 'text-red-400' : 'text-gray-500 group-focus-within:text-primary'}`} />
              <input 
                type="text" 
                name="email"
                value={formData.email}
                onChange={onChange}
                placeholder="Email Address"
                className={`w-full bg-white/5 border ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary/50'} rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-white text-sm`}
              />
            </div>
            {errors.email && <p className="text-[10px] text-red-400 ml-2 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.email}</p>}
          </div>

          <div className="space-y-1">
            <div className="group relative">
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.password ? 'text-red-400' : 'text-gray-500 group-focus-within:text-primary'}`} />
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={onChange}
                placeholder="Password"
                className={`w-full bg-white/5 border ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary/50'} rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-white text-sm`}
              />
            </div>
            {errors.password && <p className="text-[10px] text-red-400 ml-2 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.password}</p>}
          </div>

          {!isRegisterFace && (
            <div className="flex items-center justify-end">
              <button type="button" className="text-xs text-primary hover:text-primary/80 transition-colors">Forgot password?</button>
            </div>
          )}

          <button 
            disabled={isSubmitting}
            className={`w-full disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group mt-2 overflow-hidden relative ${
              formData.role === 'Admin' ? 'bg-blue-600 shadow-blue-600/20' : 'bg-primary shadow-primary/20'
            }`}
          >
            {isSubmitting ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                {isRegisterFace ? "Create Account" : "Sign In"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
          </button>
        </form>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-[#0c0c0c] px-4 text-gray-500">Or continue with</span></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/5 hover:bg-white/5 transition-all text-white text-xs font-semibold group">
            <Chrome className="w-4 h-4 group-hover:text-primary transition-colors" /> Google
          </button>
          <button className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/5 hover:bg-white/5 transition-all text-white text-xs font-semibold group">
            <Github className="w-4 h-4 group-hover:text-primary transition-colors" /> Github
          </button>
        </div>

        <p className="text-center text-gray-400 text-xs mt-2">
          {isRegisterFace ? "Already have an account?" : "Don't have an account yet?"}{' '}
          <button 
            type="button"
            onClick={onToggle}
            className="text-primary font-bold hover:underline"
          >
            {isRegisterFace ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  )
}

export default AuthPage
