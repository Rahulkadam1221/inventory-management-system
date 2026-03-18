import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Settings, 
  Globe, 
  Lock, 
  Bell, 
  Shield, 
  DollarSign, 
  CheckCircle2, 
  Save,
  ArrowRight,
  Mail,
  Building,
  Clock
} from 'lucide-react'
import { gsap } from 'gsap'

const SettingsPage = ({ role }) => {
  const [activeSection, setActiveSection] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const isAdmin = role === 'Admin'

  const handleSave = (e) => {
    e.preventDefault()
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }, 1500)
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 space-y-2">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>
          
          <NavButton 
            active={activeSection === 'profile'} 
            onClick={() => setActiveSection('profile')}
            icon={<User size={18} />}
            label="My Profile"
          />
          {isAdmin && (
            <NavButton 
              active={activeSection === 'business'} 
              onClick={() => setActiveSection('business')}
              icon={<Building size={18} />}
              label="Business Info"
            />
          )}
          <NavButton 
            active={activeSection === 'notifications'} 
            onClick={() => setActiveSection('notifications')}
            icon={<Bell size={18} />}
            label="Preferences"
          />
          <NavButton 
            active={activeSection === 'security'} 
            onClick={() => setActiveSection('security')}
            icon={<Shield size={18} />}
            label="Security"
          />
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SettingsFormSection 
                section={activeSection} 
                isAdmin={isAdmin} 
                onSave={handleSave} 
                isSaving={isSaving}
                showSuccess={showSuccess}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

const NavButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-semibold ${
      active 
        ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5' 
        : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
)

const SettingsFormSection = ({ section, isAdmin, onSave, isSaving, showSuccess }) => {
  const containerRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    gsap.to(containerRef.current, {
      rotateX: -y * 3,
      rotateY: x * 3,
      duration: 0.5,
      ease: "power2.out"
    })
  }

  const handleMouseLeave = () => {
    gsap.to(containerRef.current, { rotateX: 0, rotateY: 0, duration: 0.5 })
  }

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="preserve-3d glass-dark p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden"
    >
      <form onSubmit={onSave} className="space-y-8 relative z-10">
        {section === 'profile' && (
          <>
            <div>
              <h2 className="text-2xl font-bold">Profile Settings</h2>
              <p className="text-gray-500 text-sm mt-1">Manage your public information and account details.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Full Name" placeholder="Rahul Kumar" icon={<User size={18} />} />
              <InputField label="Email Address" placeholder="rahul@example.com" icon={<Mail size={18} />} type="email" />
            </div>

            <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/5">
               <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-bold text-xl border border-primary/20">
                 RK
               </div>
               <div>
                  <h4 className="font-bold text-sm">Profile Avatar</h4>
                  <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 2MB.</p>
                  <button type="button" className="text-primary text-xs font-black uppercase tracking-widest mt-2 hover:underline">Change Photo</button>
               </div>
            </div>
          </>
        )}

        {section === 'business' && (
          <>
            <div>
              <h2 className="text-2xl font-bold">Business Configuration</h2>
              <p className="text-gray-500 text-sm mt-1">Control your enterprise-wide settings and preferences.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Business Name" placeholder="StockFlow Pro Ltd." icon={<Building size={18} />} />
              <SelectField label="Base Currency" options={['USD ($)', 'INR (₹)', 'EUR (€)', 'GBP (£)']} icon={<DollarSign size={18} />} />
              <SelectField label="System Timezone" options={['(GMT+05:30) India', '(GMT-08:00) Pacific', '(GMT+00:00) London']} icon={<Globe size={18} />} />
              <InputField label="Contact Phone" placeholder="+91 98765 43210" icon={<Clock size={18} />} />
            </div>
          </>
        )}

        {section === 'notifications' && (
          <>
            <div>
              <h2 className="text-2xl font-bold">Preferences</h2>
              <p className="text-gray-500 text-sm mt-1">Customize your dashboard experience and alert settings.</p>
            </div>
            <div className="space-y-4">
               <ToggleField label="Email Notifications" description="Receive daily summaries of your inventory status." />
               <ToggleField label="Real-time Alerts" description="Get instant desktop browser notifications." />
               <ToggleField label="Marketing Emails" description="Stay in the loop with new features and updates." />
               <ToggleField label="Dark Mode (Auto)" description="Switch between themes based on system time." defaultCheck={true} />
            </div>
          </>
        )}

        {section === 'security' && (
          <>
            <div>
              <h2 className="text-2xl font-bold">Security</h2>
              <p className="text-gray-500 text-sm mt-1">Ensure your account remains safe with advanced protection.</p>
            </div>
            <div className="space-y-6">
               <InputField label="Current Password" type="password" placeholder="••••••••" icon={<Lock size={18} />} />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="New Password" type="password" placeholder="••••••••" icon={<Lock size={18} />} />
                  <InputField label="Confirm New Password" type="password" placeholder="••••••••" icon={<Lock size={18} />} />
               </div>
            </div>
          </>
        )}

        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
            <button 
              disabled={isSaving}
              className="relative group overflow-hidden bg-primary text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 active:translate-y-1 transition-all shadow-xl shadow-primary/20"
            >
               {isSaving ? (
                 <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
               ) : (
                 <>
                   <Save size={18} /> Save Changes
                 </>
               )}
               {/* Click feedback */}
               <div className="absolute inset-0 bg-white/20 translate-y-full group-active:translate-y-0 transition-transform duration-100" />
            </button>

            <AnimatePresence>
              {showSuccess && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-emerald-400 font-bold"
                >
                  <CheckCircle2 size={18} /> Settings saved!
                </motion.div>
              )}
            </AnimatePresence>
        </div>
      </form>
    </motion.div>
  )
}

const InputField = ({ label, type = 'text', placeholder, icon }) => (
  <div className="space-y-2 group">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1 group-focus-within:text-primary transition-colors">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
        {icon}
      </div>
      <input 
        type={type}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium"
      />
    </div>
  </div>
)

const SelectField = ({ label, options, icon }) => (
  <div className="space-y-2 group">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1 group-focus-within:text-primary transition-colors">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
        {icon}
      </div>
      <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-10 outline-none focus:border-primary/50 transition-all text-sm font-medium appearance-none cursor-pointer">
        {options.map(opt => <option key={opt} value={opt} className="bg-[#111]">{opt}</option>)}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
         <ArrowRight size={14} className="rotate-90" />
      </div>
    </div>
  </div>
)

const ToggleField = ({ label, description, defaultCheck = false }) => {
  const [checked, setChecked] = useState(defaultCheck)
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
      <div>
        <h4 className="text-sm font-bold">{label}</h4>
        <p className="text-[10px] text-gray-500">{description}</p>
      </div>
      <button 
        type="button"
        onClick={() => setChecked(!checked)}
        className={`w-12 h-6 rounded-full relative transition-colors ${checked ? 'bg-primary' : 'bg-white/10'}`}
      >
         <motion.div 
           animate={{ x: checked ? 26 : 4 }}
           className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg"
         />
      </button>
    </div>
  )
}

export default SettingsPage
