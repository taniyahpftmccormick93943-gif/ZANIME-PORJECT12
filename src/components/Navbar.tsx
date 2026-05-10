import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, User, Menu, X, LogOut, Shield, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      // Focus first focusable element
      const focusable = mobileMenuRef.current?.querySelectorAll('button, a');
      if (focusable && focusable.length > 0) {
        (focusable[0] as HTMLElement).focus();
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
          mobileToggleRef.current?.focus();
        }
        if (isUserMenuOpen) setIsUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, isUserMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled ? 'glass-dark py-2 md:py-3 backdrop-blur-md border-b border-white/5' : 'nav-gradient py-4 md:py-6'
        }`}
      >
        <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-12">
            {/* Logo */}
            <Link to="/" className="text-red-600 font-black text-xl md:text-3xl tracking-tighter cursor-pointer select-none">
              KURDFLIX
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-white/60">
              <Link to="/" className="hover:text-white transition-colors">سەرەکی</Link>
              <Link to="/pricing" className="hover:text-white transition-colors">نرخەکان</Link>
              <Link to="/movies" className="hover:text-white transition-colors">فیلمەکان</Link>
              <Link to="/series" className="hover:text-white transition-colors">زنجیرەکان</Link>
              <a href="#" className="hover:text-white transition-colors">نوێترین</a>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {/* Pro Button Small */}
            <Link 
              to="/pricing"
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-yellow-600/20 to-red-600/20 border border-yellow-500/30 px-4 py-1.5 rounded-full hover:from-yellow-600/30 hover:to-red-600/30 transition-all group active:scale-95"
            >
              <Sparkles size={14} className="text-yellow-500 group-hover:scale-125 transition-transform" />
              <span className="text-[11px] font-black text-yellow-500 uppercase tracking-wider">پلانی پرۆ</span>
            </Link>

            {/* Search bar */}
            <div className="hidden sm:flex items-center bg-white/5 px-4 py-2 rounded-full border border-white/10 focus-within:border-red-600/50 transition-all group">
              <Search className="w-4 h-4 text-gray-500 group-focus-within:text-red-500" />
              <input
                type="text"
                placeholder="گەڕان..."
                className="bg-transparent border-none focus:outline-none text-xs px-3 w-40 text-white placeholder:text-gray-500"
              />
            </div>

            <button className="text-gray-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full border border-black"></span>
            </button>

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 bg-white/5 pr-1 pl-3 py-1 rounded-full border border-white/10 hover:border-red-600/50 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                    <img 
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || '')}&background=random`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="hidden md:block text-xs font-black text-gray-300 group-hover:text-white">
                    {user.displayName?.split(' ')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute top-full left-0 mt-3 w-56 bg-zinc-900 border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-white/5 mb-1">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">پرۆفایل</p>
                        <p className="text-sm font-bold truncate text-white">{user.displayName}</p>
                        <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                      </div>
                      
                      <Link 
                        to="/profile" 
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-sm text-gray-300 hover:text-white text-right"
                      >
                        <User size={16} />
                        <span>پرۆفایلەکەم</span>
                      </Link>

                      {user && (user.role === 'Admin' || user.role === 'Owner') && (
                        <Link 
                          to="/admin" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-sm text-gray-300 hover:text-white text-right"
                        >
                          <Shield size={16} />
                          <span>ئەدمین داشبۆرد</span>
                        </Link>
                      )}

                      <div className="h-[1px] bg-white/5 my-1" />

                      <button 
                        onClick={() => logout()}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-600/10 transition-colors text-sm text-red-500 text-right"
                      >
                        <LogOut size={16} />
                        <span>چوونەدەرەوە</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="hidden md:block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl text-sm font-black transition-all shadow-lg active:scale-95"
              >
                چوونەژوورەوە
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              ref={mobileToggleRef}
              className="lg:hidden text-white p-2 glass rounded-lg transition-transform active:scale-90"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMobileMenuOpen ? "داخستنی مینیو" : "کردنەوەی مینیو"}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="mobile-navigation"
              ref={mobileMenuRef}
              role="dialog"
              aria-modal="true"
              aria-label="مینیۆی گەڕان"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden glass-dark absolute top-full left-0 right-0 p-6 flex flex-col gap-4 text-center border-t border-white/10 overflow-hidden"
            >
              {!user && (
                <button 
                  onClick={() => { setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }}
                  className="w-full bg-red-600 text-white py-4 rounded-2xl font-black mb-2"
                >
                  چوونەژوورەوە
                </button>
              )}
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-300 hover:text-white">سەرەکی</Link>
              <Link to="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-gray-300 hover:text-white">نرخەکان</Link>
              <Link to="/movies" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-gray-300 hover:text-white">فیلمەکان</Link>
              {user && (
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-gray-300 hover:text-white">پرۆفایلەکەم</Link>
              )}
              <Link to="/series" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-gray-300 hover:text-white">زنجیرەکان</Link>
              <a href="#" className="text-lg text-gray-300 hover:text-white">نوێترین</a>
              <a href="#" className="text-lg text-gray-300 hover:text-white">پۆپۆلەری</a>
              
              {user && (
                <button 
                  onClick={() => logout()}
                  className="mt-4 text-red-500 font-bold"
                >
                  چوونەدەرەوە
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
