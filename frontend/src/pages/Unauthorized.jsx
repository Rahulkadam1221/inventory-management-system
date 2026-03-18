import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-dark border border-white/10 p-10 rounded-[2.5rem] max-w-md w-full text-center space-y-6 shadow-2xl"
      >
        <div className="flex justify-center">
          <div className="p-5 bg-red-500/10 rounded-full border border-red-500/20">
            <ShieldAlert size={60} className="text-red-500" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">Access Restricted</h1>
          <p className="text-gray-400">
            You don't have the necessary permissions to view this page. Please contact your administrator if you believe this is an error.
          </p>
        </div>

        <button 
          onClick={() => navigate(-1)}
          className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Go Back
        </button>
      </motion.div>
    </div>
  );
};

export default Unauthorized;
