import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HeroIMS3D } from '../components/ThreeComponents'
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Bell, 
  CheckCircle2, 
  ArrowRight, 
  Menu, 
  X,
  Layers,
  ShieldCheck,
  TrendingDown
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

gsap.registerPlugin(ScrollTrigger)

const LandingPage = () => {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const containerRef = useRef(null)

  // Section Scroll Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".reveal-up", {
        scrollTrigger: {
          trigger: ".reveal-up",
          start: "top 85%",
          toggleActions: "play none none reverse"
        },
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power4.out"
      })

      gsap.from(".reveal-left", {
        scrollTrigger: {
          trigger: ".reveal-left",
          start: "top 80%",
          toggleActions: "play none none reverse"
        },
        x: -50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  // Mouse tilt effect for cards
  const handleTilt = (e, ref) => {
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    gsap.to(ref.current, {
      rotateX: -y * 10,
      rotateY: x * 10,
      duration: 0.4
    })
  }

  const resetTilt = (ref) => {
    gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.4 })
  }

  const handleEnter = () => navigate('/auth')

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-white font-sans selection:bg-primary/30">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="p-2 bg-primary rounded-lg shadow-lg shadow-primary/20">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">StockFlow <span className="text-primary italic">Pro</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <button onClick={handleEnter} className="hover:text-white transition-colors">Login</button>
            <button onClick={handleEnter} className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-[72px] z-40 bg-black/95 backdrop-blur-xl border-b border-white/5 p-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-center">
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <button onClick={handleEnter}>Login</button>
              <button onClick={handleEnter} className="bg-primary text-white py-4 rounded-2xl">Get Started</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <HeroIMS3D />
        
        <div className="relative z-10 text-center space-y-8 max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-6">
              The Next Gen Inventory System
            </span>
            <h1 className="heading-xl mb-6">
              Smart Inventory & <br />
              <span className="text-primary">Order Management</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Manage stock, track sales, and fulfill orders efficiently with our all-in-one cloud platform designed for small businesses.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button onClick={handleEnter} className="w-full sm:w-auto px-10 py-4 rounded-full bg-primary hover:bg-primary-dark font-bold text-lg shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-2 group">
              Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={handleEnter} className="w-full sm:w-auto px-10 py-4 rounded-full glass border border-white/10 hover:bg-white/5 font-bold text-lg transition-all">
              View Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding relative z-10">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">Powerful Features</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Everything you need to scale your retail or wholesale business.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          {[
            { icon: <Package className="w-8 h-8" />, title: "Stock Tracking", desc: "Live updates on your inventory levels across multiple locations." },
            { icon: <ShoppingCart className="w-8 h-8" />, title: "Order Processing", desc: "Streamline your sales flow from purchase to delivery." },
            { icon: <BarChart3 className="w-8 h-8" />, title: "Sales Reports", desc: "Deep insights into your best sellers and monthly performance." },
            { icon: <Bell className="w-8 h-8" />, title: "Real-time Alerts", desc: "Get notified immediately when stock levels are running low." }
          ].map((feature, i) => {
            const cardRef = useRef(null)
            return (
              <div 
                key={i} 
                ref={cardRef}
                onMouseMove={(e) => handleTilt(e, cardRef)}
                onMouseLeave={() => resetTilt(cardRef)}
                className="reveal-up preserve-3d glass-dark p-8 rounded-[2rem] border border-white/5 hover:border-primary/30 transition-all card-hover group cursor-pointer"
              >
                <div className="p-4 rounded-2xl bg-white/5 text-primary w-fit mb-6 group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding relative z-10 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 space-y-10 reveal-left">
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">
              Scale Faster, <br />
              <span className="text-primary italic">Stress Less.</span>
            </h2>
            
            <div className="space-y-8">
              {[
                { icon: <Layers />, title: "Efficient Inventory Management", text: "Automate your restocking cycles and save hours every week." },
                { icon: <CheckCircle2 />, title: "Improved Order Fulfillment", text: "Drastically reduce shipping errors with integrated tracking." },
                { icon: <TrendingDown />, title: "Reduced Losses", text: "Prevent overstocking and eliminate dead stock cost." }
              ].map((benefit, i) => (
                <div key={i} className="flex gap-5 group">
                  <div className="flex-shrink-0 p-3 rounded-xl bg-primary/10 text-primary h-fit group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">{benefit.title}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{benefit.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2 relative group reveal-left">
            <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-colors" />
            <motion.div 
              whileHover={{ y: -10, rotateX: 2, rotateY: -2 }}
              className="relative p-3 rounded-[2.5rem] glass-dark border border-white/10"
            >
              <div className="aspect-square md:aspect-video bg-gradient-to-br from-[#111] to-primary/10 rounded-[1.8rem] flex items-center justify-center p-8 overflow-hidden">
                <div className="relative w-full h-full flex items-center justify-center">
                   {/* Decorative Dashboard mock elements */}
                   <div className="absolute top-0 right-0 p-4 glass rounded-xl border border-white/10 animate-float">
                      <BarChart3 className="text-primary w-6 h-6" />
                   </div>
                   <div className="absolute bottom-4 left-4 p-4 glass rounded-xl border border-white/10 animate-float" style={{ animationDelay: '2s' }}>
                      <ShoppingCart className="text-purple-400 w-6 h-6" />
                   </div>
                   <Package className="w-32 h-32 text-primary/50 opacity-50" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <Package className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold tracking-tighter">StockFlow Pro</span>
            </div>
            <p className="text-gray-400 max-w-sm">
              Empowering small businesses with enterprise-grade inventory intelligence. 
              Built for speed, efficiency, and reliability.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full glass flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-all">
                <Bell className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-full glass flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-all">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-bold">Product</h4>
            <ul className="space-y-4 text-gray-500 text-sm font-medium">
              <li className="hover:text-primary cursor-pointer transition-colors">Integrations</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Premium API</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Mobile App</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-bold">Contact</h4>
            <ul className="space-y-4 text-gray-500 text-sm font-medium">
              <li>support@stockflowpro.com</li>
              <li>+1 (800) 123-4567</li>
              <li>Mumbai, Maharashtra</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center text-gray-600 text-sm">
           © 2026 StockFlow Pro. All rights reserved. Built for Rahul.
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
