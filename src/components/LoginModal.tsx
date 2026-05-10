import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, User as UserIcon, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [error, setError] = useState('');
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('تکایە ناوەکەت بنوسە');
      return;
    }
    if (!email.trim()) {
      setError('تکایە ئیمێڵەکەت بنوسە');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await loginWithEmail(name, email, !isLoginMode);
      onClose();
    } catch (err: any) {
      setError(err.message || 'هەڵەیەک ڕوویدا');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-right" dir="rtl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-8">
              <button 
                onClick={onClose}
                className="absolute top-4 left-4 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-black mb-2">
                  {isLoginMode ? 'بەخێرهاتیتەوە' : 'بەخێرهاتیت'}
                </h2>
                <p className="text-gray-400">
                  {isLoginMode ? 'بۆ چوونەژوورەوە زانیارییەکانت بنوسە' : 'بۆ دروستکردنی ئەکاونت زانیارییەکانت بنوسە'}
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-600/10 border border-red-600/20 text-red-500 p-3 rounded-xl text-sm font-bold mb-6 text-center"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-300 mr-1 block text-right">ناو</label>
                  <div className="relative">
                    <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-800/50 border border-white/5 rounded-xl py-3 pr-12 pl-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold text-right"
                      placeholder="ناوەکەت لێرە بنوسە"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-300 mr-1 block text-right">ئیمێڵ</label>
                  <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-800/50 border border-white/5 rounded-xl py-3 pr-12 pl-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold text-right"
                      placeholder="ئیمێڵەکەت لێرە بنوسە"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? 'خەریکە ئەنجام دەدرێت...' : (isLoginMode ? 'چوونەژوورەوە' : 'دروستکردنی ئەکاونت')}
                    {!isSubmitting && <ArrowRight size={20} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLoginMode(!isLoginMode)}
                    className="w-full text-sm font-bold text-gray-400 hover:text-white transition-colors py-2"
                  >
                    {isLoginMode ? 'ئەکاونتم نییە؟ دروستی بکە' : 'ئەکاونتم هەیە؟ بچۆ ژوورەوە'}
                  </button>
                </div>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-zinc-900 px-2 text-gray-500 font-bold">یان</span>
                </div>
              </div>

              <button
                onClick={() => { loginWithGoogle(); onClose(); }}
                className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:bg-gray-200 active:scale-95"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.01.67-2.28 1.05-3.71 1.05-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                بەردەوامبە بە گووگڵ
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
