import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Settings, 
  Heart, 
  History, 
  List, 
  Plus, 
  Trash2, 
  PlayCircle,
  LogOut,
  ChevronRight,
  Camera,
  X,
  Check,
  Home
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, myList, watchlists, viewingHistory, logout, createWatchlist, deleteWatchlist, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'watchlist' | 'history' | 'lists'>('overview');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  
  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || '');
  const [editPhoto, setEditPhoto] = useState(user?.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setEditName(user.displayName || '');
      setEditPhoto(user.photoURL || '');
    }
  }, [user]);

  if (!user) {
    navigate('/');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    await createWatchlist(newListName);
    setNewListName('');
    setIsCreatingList(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile(editName, editPhoto);
      setIsEditingProfile(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 pb-20 px-4 md:px-8 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/5 rounded-[48px] p-8 md:p-12 mb-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-600/10 to-transparent pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-red-600 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || '')}&background=random`} 
                alt={user.displayName || ''} 
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-zinc-800 object-cover relative z-10"
              />
            </div>
            
            <div className="text-center md:text-right flex-1">
              <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">{user.displayName}</h1>
              <p className="text-zinc-500 font-medium mb-2">{user.email}</p>
              
              {((user as any).role === 'Admin' || (user as any).role === 'Owner' || (user.subscriptionPlan !== 'none' && user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date())) && (
                <div className="flex items-center justify-center md:justify-start gap-3 mb-6 bg-red-600/10 w-fit px-4 py-2 rounded-2xl border border-red-600/20 mx-auto md:mx-0">
                  <div className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg uppercase">PRO</div>
                  <span className="text-red-500 text-xs font-bold">
                    {(user as any).role === 'Owner' || (user as any).role === 'Admin' || (user as any).subscriptionPlan === 'pro_lifetime' ? 'هەمیشەیی' : `بەسەردەچێت لە: ${(() => {
                      try {
                        const expiry = (user as any).subscriptionExpiry;
                        if (!expiry) return '---';
                        // Handle both string and Firestore Timestamp
                        const date = expiry.seconds ? new Date(expiry.seconds * 1000) : new Date(expiry);
                        return date.toLocaleDateString('ku-IQ');
                      } catch (e) {
                        return '---';
                      }
                    })()}`}
                  </span>
                </div>
              )}
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <Link 
                  to="/"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-all font-black text-sm uppercase tracking-widest shadow-lg shadow-red-600/20"
                >
                  <Home size={16} />
                  گەڕانەوە بۆ سایت
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-white/5 hover:bg-red-600/10 hover:text-red-500 border border-white/5 px-6 py-3 rounded-full flex items-center gap-2 transition-all font-black text-sm uppercase tracking-widest"
                >
                  <LogOut size={16} />
                  چوونە دەرەوە
                </button>
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="bg-white/5 hover:bg-white/10 border border-white/5 px-6 py-3 rounded-full flex items-center gap-2 transition-all font-black text-sm uppercase tracking-widest text-zinc-400"
                >
                  <Settings size={16} />
                  ڕێکخستنەکان
                </button>
              </div>
            </div>

            <div className="hidden lg:flex gap-12 text-center">
              <div>
                <div className="text-3xl font-black mb-1">{myList.length}</div>
                <div className="text-zinc-500 text-xs font-black uppercase tracking-widest">پەسەندکراو</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div>
                <div className="text-3xl font-black mb-1">{watchlists.length}</div>
                <div className="text-zinc-500 text-xs font-black uppercase tracking-widest">لیستەکان</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div>
                <div className="text-3xl font-black mb-1">{viewingHistory.length}</div>
                <div className="text-zinc-500 text-xs font-black uppercase tracking-widest">بینراو</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-12 p-2 bg-white/5 rounded-full w-fit mx-auto md:mx-0">
          {[
            { id: 'overview', label: 'گشتی', icon: User },
            { id: 'watchlist', label: 'پەسەندکراوەکان', icon: Heart },
            { id: 'lists', label: 'لیستەکان', icon: List },
            { id: 'history', label: 'مێژووی بینین', icon: History },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-full transition-all font-black text-sm uppercase tracking-widest
                ${activeTab === tab.id ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/5 text-zinc-500'}
              `}
            >
              <tab.icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {/* Recent History Preview */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-[40px] p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black">دوایین بینراو</h3>
                    <button onClick={() => setActiveTab('history')} className="text-zinc-500 hover:text-white transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {viewingHistory.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
                        <img src={item.movieImage} className="w-16 h-20 object-cover rounded-xl" alt="" />
                        <div>
                          <div className="font-black mb-1">{item.movieTitle}</div>
                          <div className="text-zinc-500 text-xs">{new Date(item.lastWatched?.seconds * 1000).toLocaleDateString('ku-IQ')}</div>
                        </div>
                      </div>
                    ))}
                    {viewingHistory.length === 0 && (
                      <div className="text-zinc-600 text-center py-8">هیچ فیلمێک نییە</div>
                    )}
                  </div>
                </div>

                {/* Popular from My List */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-[40px] p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black">پەسەندکراوەکان</h3>
                    <button onClick={() => setActiveTab('watchlist')} className="text-zinc-500 hover:text-white transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {myList.slice(0, 6).map((movie, i) => (
                      <img key={i} src={movie.imageUrl} className="aspect-[2/3] object-cover rounded-xl border border-white/5" alt="" />
                    ))}
                    {myList.length === 0 && (
                      <div className="col-span-3 text-zinc-600 text-center py-8">هیچ فیلمێک نییە</div>
                    )}
                  </div>
                </div>

                {/* Watchlist Summary */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-[40px] p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black">لیستە تایبەتەکان</h3>
                    <button onClick={() => setActiveTab('lists')} className="text-zinc-500 hover:text-white transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {watchlists.slice(0, 3).map((list, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/5 px-6 py-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                          <List size={20} className="text-red-500" />
                          <span className="font-black">{list.name}</span>
                        </div>
                        <ChevronRight size={16} className="text-zinc-600" />
                      </div>
                    ))}
                    {watchlists.length === 0 && (
                      <div className="text-zinc-600 text-center py-8">هیچ لیستێک نییە</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'watchlist' && (
              <motion.div
                key="watchlist"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
              >
                {myList.map((movie) => (
                  <div key={movie.id} className="group relative">
                    <div className="aspect-[2/3] rounded-3xl overflow-hidden border border-white/10 relative">
                      <img src={movie.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <button 
                          onClick={() => navigate(`/movie/${movie.id}`)}
                          className="bg-white text-black w-full py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <PlayCircle size={14} />
                          سەیرکردن
                        </button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="font-black text-sm mb-1 truncate">{movie.title}</div>
                      <div className="text-zinc-500 text-xs font-black">{movie.year}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'lists' && (
              <motion.div
                key="lists"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black">لیستە تایبەتەکان</h2>
                  <button 
                    onClick={() => setIsCreatingList(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all transform active:scale-95"
                  >
                    <Plus size={18} />
                    لیستی نوێ
                  </button>
                </div>

                <AnimatePresence>
                  {isCreatingList && (
                    <motion.form 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleCreateList}
                      className="bg-white/5 border border-white/10 rounded-[40px] p-8 flex flex-col md:flex-row gap-4 items-center"
                    >
                      <input 
                        type="text" 
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="ناوی لیستەکەت بنووسە..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-red-600 transition-colors font-medium text-lg"
                        autoFocus
                      />
                      <div className="flex gap-4 w-full md:w-auto">
                        <button type="submit" className="flex-1 md:flex-none bg-white text-black px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest">دروستکردن</button>
                        <button type="button" onClick={() => setIsCreatingList(false)} className="bg-white/5 hover:bg-white/10 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest">پاشگەزبوونەوە</button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {watchlists.map((list) => (
                    <div key={list.id} className="bg-zinc-900 border border-white/5 rounded-[40px] p-8 hover:border-white/20 transition-all group overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-[80px] pointer-events-none" />
                      
                      <div className="flex items-start justify-between mb-8 relative z-10">
                        <div>
                          <div className="bg-red-600/20 text-red-500 p-3 rounded-2xl mb-6 w-fit">
                            <List size={24} />
                          </div>
                          <h3 className="text-2xl font-black mb-2">{list.name}</h3>
                          <p className="text-zinc-500 text-sm font-medium">دروستکراوە لە {new Date(list.createdAt?.seconds * 1000).toLocaleDateString('ku-IQ')}</p>
                        </div>
                        <button 
                          onClick={() => deleteWatchlist(list.id)}
                          className="text-zinc-600 hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      
                      <div className="flex -space-x-3 space-x-reverse relative z-10 mb-8 opacity-50 group-hover:opacity-100 transition-opacity">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-zinc-600">
                             <PlayCircle size={20} />
                          </div>
                        ))}
                      </div>

                      <button className="w-full bg-white/5 hover:bg-white/10 border border-white/5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                        بینینی لیستەکە
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {viewingHistory.sort((a, b) => b.lastWatched?.seconds - a.lastWatched?.seconds).map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 rounded-[32px] p-6 hover:bg-white/[0.08] transition-all flex flex-col md:flex-row items-center gap-8 group">
                    <div className="relative overflow-hidden rounded-2xl aspect-[16/9] w-full md:w-64">
                      <img src={item.movieImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <PlayCircle size={48} className="text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1 text-center md:text-right">
                       <h3 className="text-2xl font-black mb-2">{item.movieTitle}</h3>
                       <div className="flex items-center justify-center md:justify-start gap-4 text-zinc-500 font-medium mb-6">
                          <span>{new Date(item.lastWatched?.seconds * 1000).toLocaleDateString('ku-IQ')}</span>
                          <span className="opacity-30">•</span>
                          <span>بەرەوپێشچوون: {item.progress}%</span>
                       </div>
                       
                       <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            className="h-full bg-red-600 rounded-full" 
                          />
                       </div>
                    </div>

                    <button 
                      onClick={() => navigate(`/movie/${item.movieId}`)}
                      className="bg-white text-black px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest w-full md:w-auto"
                    >
                      بەردەوامبوون
                    </button>
                  </div>
                ))}
                {viewingHistory.length === 0 && (
                  <div className="text-center py-20 text-zinc-600 font-black text-2xl">تائێستا هیچ فیلمێکت تەمەش نەکردووە</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingProfile(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[48px] p-8 md:p-12 z-[60] shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/10 blur-[80px] pointer-events-none" />
              
              <div className="flex items-center justify-between mb-10 relative z-10">
                <h2 className="text-3xl font-black">دەسکاری پرۆفایل</h2>
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-8 relative z-10">
                <div className="flex flex-col items-center gap-6 mb-8">
                  <div className="relative group">
                    <img 
                      src={editPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(editName || '')}&background=random`} 
                      className="w-32 h-32 rounded-full border-4 border-zinc-800 object-cover shadow-2xl"
                      alt="Preview"
                    />
                    <label className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Camera size={24} />
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 1024 * 1024) {
                              alert('تکایە وێنەیەک هەڵبژێرە کە قەبارەکەی لە ١ مێگابایت کەمتر بێت');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditPhoto(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="text-center">
                    <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">وێنەی پرۆفایل</p>
                    <p className="text-[10px] text-zinc-600">کرتە لە وێنەکە بکە بۆ گۆڕینی</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-zinc-500 text-xs font-black uppercase tracking-widest mb-3 mr-4">ناوی نوێ</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="ناوەکەت بنووسە..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-red-600 transition-colors font-medium text-lg"
                      required
                    />
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check size={18} />
                        پاشەکەوتکردنی گۆڕانکارییەکان
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
