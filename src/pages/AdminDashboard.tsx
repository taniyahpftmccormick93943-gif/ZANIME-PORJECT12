import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Shield, 
  ShieldCheck, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  Search,
  Filter,
  Ban,
  Home,
  Film,
  Tv,
  BarChart3,
  Plus,
  Pencil,
  X,
  Upload,
  Link as LinkIcon,
  Zap,
  Globe,
  Star as StarIcon,
  Settings as SettingsIcon,
  DollarSign,
  Send,
  Sparkles,
  Layers
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, addDoc, setDoc, getDoc, getDocs, writeBatch } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Movie, AppSettings, UserData, Episode, Season } from '../types';

type AdminTab = 'users' | 'movies' | 'series' | 'stats' | 'settings';

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, x: '-50%' }}
    animate={{ opacity: 1, y: 0, x: '-50%' }}
    exit={{ opacity: 0, y: 20, x: '-50%' }}
    className={`fixed bottom-10 left-1/2 z-50 px-6 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl border ${
      type === 'success' ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-red-500/20 border-red-500/40 text-red-400'
    } shadow-2xl`}
  >
    {type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
    <span className="font-bold text-sm">{message}</span>
  </motion.div>
);

import firebaseConfig from '../../firebase-applet-config.json';

const AdminDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Movie[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ id: string, type: 'user' | 'movie' | 'series' } | null>(null);
  const [contentModal, setContentModal] = useState<{ type: 'movie' | 'series', data?: Movie } | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [db, setDb] = useState<any>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [expandedSeason, setExpandedSeason] = useState<number | null>(0);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    telegramLink: '',
    plan_1day: 0,
    plan_1month: 0,
    plan_6months: 0,
    plan_1year: 0
  });

  const GENRES_LIST = ['ئاکشن', 'ترسناک', 'رۆمانسی', 'دراما', 'کۆمیدی', 'زانستی', 'تاوان', 'سەرکێشی', 'ئەنیمەیشن', 'دۆکۆمێنتاری'];

  // Form State
  const [formData, setFormData] = useState<Partial<Movie>>({});

  const OWNER_EMAIL = 'taniyahpftmccormick93943@gmail.com';

  useEffect(() => {
    if (!loading && !authLoading && (!user || (user.role !== 'Admin' && user.role !== 'Owner'))) {
      navigate('/');
    }
  }, [user, loading, authLoading, navigate]);

  useEffect(() => {
    const initDb = async () => {
      try {
        let app;
        if (getApps().length === 0) {
          app = initializeApp(firebaseConfig);
        } else {
          app = getApps()[0];
        }
        const firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
        setDb(firestoreDb);

        // Users
        const unsubscribeUsers = onSnapshot(query(collection(firestoreDb, 'users')), (snapshot) => {
          setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserData[]);
        }, (error) => {
          console.error("Users list error:", error);
          showToast('هەڵەیەک لە خوێندنەوەی یوزەرەکان ڕوویدا', 'error');
        });

        // Movies
        const unsubscribeMovies = onSnapshot(query(collection(firestoreDb, 'movies')), (snapshot) => {
          setMovies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Movie[]);
        }, (error) => {
          console.error("Movies list error:", error);
        });

        // Series
        const unsubscribeSeries = onSnapshot(query(collection(firestoreDb, 'series')), (snapshot) => {
          setSeries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Movie[]);
        }, (error) => {
          console.error("Series list error:", error);
        });

        // App Settings
        const settingsDoc = await getDoc(doc(firestoreDb, 'settings', 'app'));
        if (settingsDoc.exists()) {
          setAppSettings(settingsDoc.data() as AppSettings);
        }

        setLoading(false);
        return () => {
          unsubscribeUsers();
          unsubscribeMovies();
          unsubscribeSeries();
        };
      } catch (e) {
        console.error("Firebase load failed", e);
      }
    };

    initDb();
  }, []);

  useEffect(() => {
    if (contentModal?.data && contentModal.type === 'series' && db) {
      const fetchData = async () => {
        try {
          const seasonsSnap = await getDocs(collection(db, 'series', contentModal.data!.id, 'seasons'));
          const seasonsData = seasonsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), episodes: [] })) as Season[];
          
          // Sort seasons by number
          seasonsData.sort((a, b) => a.number - b.number);

          for (const season of seasonsData) {
            const epsSnap = await getDocs(collection(db, 'series', contentModal.data!.id, 'seasons', season.id, 'episodes'));
            const seasonEps = epsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Episode[];
            season.episodes = seasonEps.sort((a, b) => a.order - b.order);
          }
          
          setSeasons(seasonsData);
        } catch (e) {
          console.error("Failed to fetch seasons/episodes", e);
        }
      };
      fetchData();
    } else {
      setSeasons([]);
    }
  }, [contentModal, db]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      showToast('قەبارەی وێنە نابێت لە ١ مێگابایت زیاتر بێت', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const toggleGenre = (genre: string) => {
    const currentGenres = formData.genre || [];
    if (currentGenres.includes(genre)) {
      setFormData({ ...formData, genre: currentGenres.filter(g => g !== genre) });
    } else {
      setFormData({ ...formData, genre: [...currentGenres, genre] });
    }
  };

  const handleRoleChange = async (id: string, newRole: UserData['role']) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'users', id), { role: newRole });
      showToast('پلەی بەکارهێنەر گۆڕدرا');
    } catch (e) {
      showToast('هەڵەیەک ڕوویدا', 'error');
    }
  };

  const handleSubscriptionChange = async (id: string, plan: UserData['subscriptionPlan']) => {
    if (!db || !plan) return;
    try {
      let expiry = new Date();
      if (plan === '1day') expiry.setDate(expiry.getDate() + 1);
      else if (plan === '1month') expiry.setMonth(expiry.getMonth() + 1);
      else if (plan === '3months') expiry.setMonth(expiry.getMonth() + 3);
      else if (plan === '6months') expiry.setMonth(expiry.getMonth() + 6);
      else if (plan === '1year') expiry.setFullYear(expiry.getFullYear() + 1);
      else expiry = new Date(0); // For 'none'

      await updateDoc(doc(db, 'users', id), { 
        subscriptionPlan: plan,
        subscriptionExpiry: plan === 'none' ? null : expiry.toISOString()
      });
      showToast('بۆ پلانی پرۆ چالاک کرا');
    } catch (e) {
      showToast('هەڵەیەک ڕوویدا', 'error');
    }
  };

  const handleStatusToggle = async (id: string) => {
    if (!db) return;
    const user = users.find(u => u.id === id);
    if (!user) return;
    try {
      const newStatus = user.status === 'Active' ? 'Banned' : 'Active';
      await updateDoc(doc(db, 'users', id), { status: newStatus });
      showToast(newStatus === 'Banned' ? 'بلۆک کرا' : 'چالاک کرایەوە', newStatus === 'Banned' ? 'error' : 'success');
    } catch (e) {
      showToast('هەڵەیەک ڕوویدا', 'error');
    }
  };

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !contentModal) return;

    try {
      const collectionName = contentModal.type === 'movie' ? 'movies' : 'series';
      const data = {
        ...formData,
        year: Number(formData.year),
        rating: Number(formData.rating || 0),
        duration: formData.duration || '',
        genre: Array.isArray(formData.genre) ? formData.genre : (formData.genre as unknown as string || '').split(',').map(s => s.trim()),
      };

      if (contentModal.data?.id) {
        const docId = contentModal.data.id;
        await updateDoc(doc(db, collectionName, docId), data);
        
        // Handle Seasons and Episodes for series
        if (contentModal.type === 'series') {
          for (const season of seasons) {
            const seasonData = {
              number: Number(season.number),
              title: season.title || `وەرزی ${season.number}`,
              imageUrl: season.imageUrl || ''
            };
            
            let seasonId = season.id;
            if (seasonId) {
              await updateDoc(doc(db, 'series', docId, 'seasons', seasonId), seasonData);
            } else {
              const sRef = await addDoc(collection(db, 'series', docId, 'seasons'), seasonData);
              seasonId = sRef.id;
            }

            // Episodes for this season
            if (season.episodes) {
              for (const ep of season.episodes) {
                const epData = {
                  title: ep.title,
                  order: Number(ep.order),
                  duration: ep.duration || '',
                  server1Url: ep.server1Url || '',
                  server2Url: ep.server2Url || '',
                  seasonId: seasonId
                };
                if (ep.id) {
                  await updateDoc(doc(db, 'series', docId, 'seasons', seasonId, 'episodes', ep.id), epData);
                } else {
                  await addDoc(collection(db, 'series', docId, 'seasons', seasonId, 'episodes'), epData);
                }
              }
            }
          }
        }
        
        showToast('بە سەرکەوتوویی نوێکرایەوە');
      } else {
        const newDoc = await addDoc(collection(db, collectionName), data);
        
        // Handle Seasons and Episodes for new series
        if (contentModal.type === 'series') {
          for (const season of seasons) {
            const sRef = await addDoc(collection(db, 'series', newDoc.id, 'seasons'), {
              number: Number(season.number),
              title: season.title || `وەرزی ${season.number}`,
              imageUrl: season.imageUrl || ''
            });

            if (season.episodes) {
              for (const ep of season.episodes) {
                await addDoc(collection(db, 'series', newDoc.id, 'seasons', sRef.id, 'episodes'), {
                  title: ep.title,
                  order: Number(ep.order),
                  duration: ep.duration || '',
                  server1Url: ep.server1Url || '',
                  server2Url: ep.server2Url || '',
                  seasonId: sRef.id
                });
              }
            }
          }
        }
        
        showToast('بە سەرکەوتوویی زیادکرا');
      }
      setContentModal(null);
      setFormData({});
      setSeasons([]);
    } catch (e) {
      showToast('هەڵەیەک ڕوویدا', 'error');
    }
  };

  const handleDelete = async () => {
    if (!db || !deleteModal) return;
    const { id, type } = deleteModal;

    try {
      if (type === 'user') {
        const user = users.find(u => u.id === id);
        if (user?.role === 'Owner') {
          showToast('ناتوانیت خاوەن بسڕێتەوە!', 'error');
        } else {
          await deleteDoc(doc(db, 'users', id));
          showToast('بەکارهێنەر سڕایەوە');
        }
      } else {
        await deleteDoc(doc(db, type === 'movie' ? 'movies' : 'series', id));
        showToast('ناوەڕۆکەکە سڕایەوە');
      }
    } catch (e) {
      showToast('هەڵەیەک ڕوویدا', 'error');
    }
    setDeleteModal(null);
  };

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    try {
      await setDoc(doc(db, 'settings', 'app'), appSettings);
      showToast('ڕێکخستنەکان پاشەکەوت کران');
    } catch (e) {
      showToast('هەڵەیەک ڕوویدا یان دەسەڵاتت نییە', 'error');
    }
  };

  const filteredUsers = users.filter(u => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = u.name?.toLowerCase().includes(searchLower) || false;
    const emailMatch = u.email?.toLowerCase().includes(searchLower) || false;
    return nameMatch || emailMatch;
  });

  const filteredMovies = movies.filter(m => m.title?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredSeries = series.filter(s => s.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans" dir="rtl">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-4 md:px-10 lg:px-20 max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black mb-2 flex items-center gap-4">
              <Shield className="text-red-600" size={32} />
              داشبۆردی بەڕێوەبەر
            </h1>
            <p className="text-zinc-500 font-medium whitespace-nowrap">بەڕێوەبردنی بەکارهێنەران و ناوەڕۆکی سایت</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <Link to="/" className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-2 transition-all">
              <Home size={18} />
              ماڵەوە
            </Link>
            <div className="relative flex-grow md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" 
                placeholder="گەڕان..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-red-600 transition-all text-right"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-4 mb-12">
          {[
            { id: 'users', label: 'بەکارهێنەران', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { id: 'movies', label: 'فیلمەکان', icon: Film, color: 'text-red-500', bg: 'bg-red-500/10' },
            { id: 'series', label: 'زنجیرەکان', icon: Tv, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { id: 'stats', label: 'ئامار', icon: BarChart3, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
            { id: 'settings', label: 'ڕێکخستن', icon: SettingsIcon, color: 'text-zinc-400', bg: 'bg-white/5' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all border ${
                activeTab === tab.id ? `${tab.bg} ${tab.color} border-current` : 'bg-white/5 text-zinc-500 border-white/5'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-40 text-center">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-500 font-bold">بۆ ساتێک چاوەڕوان بە...</p>
          </div>
        ) : (
          <div className="space-y-10">
            {activeTab === 'users' && (
              <div className="bg-zinc-900/20 border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5 whitespace-nowrap">
                        <th className="px-8 py-6 text-zinc-500 text-xs font-black uppercase">بەکارهێنەر</th>
                        <th className="px-8 py-6 text-zinc-500 text-xs font-black uppercase">ئیمەیڵ</th>
                        <th className="px-8 py-6 text-zinc-500 text-xs font-black uppercase text-center">پلە</th>
                        <th className="px-8 py-6 text-zinc-500 text-xs font-black uppercase text-center">پلانی پرۆ</th>
                        <th className="px-8 py-6 text-zinc-500 text-xs font-black uppercase text-center">بارودۆخ</th>
                        <th className="px-8 py-6 text-zinc-500 text-xs font-black uppercase text-center">کردارەکان</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center font-black text-red-500">
                                {user.name?.charAt(0) || user.email?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-black text-white">{user.name}</p>
                                <p className="text-[10px] text-zinc-600">ID: #{user.id.slice(0,8)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-zinc-400 font-medium text-sm">{user.email}</td>
                          <td className="px-8 py-6">
                            <div className="flex justify-center">
                              <select 
                                className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs font-black text-white cursor-pointer"
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                              >
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                                <option value="Owner">Owner</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex justify-center">
                              <select 
                                className={`bg-black/50 border rounded-xl px-4 py-2 text-xs font-black cursor-pointer transition-all ${
                                  user.subscriptionPlan && user.subscriptionPlan !== 'none' ? 'border-yellow-500/50 text-yellow-500' : 'border-white/10 text-white'
                                }`}
                                value={user.subscriptionPlan || 'none'}
                                onChange={(e) => handleSubscriptionChange(user.id, e.target.value as any)}
                              >
                                <option value="none">هیچ (Free)</option>
                                <option value="1day">١ رۆژ (PRO)</option>
                                <option value="1month">١ مانگ (PRO)</option>
                                <option value="3months">٣ مانگ (PRO)</option>
                                <option value="6months">٦ مانگ (PRO)</option>
                                <option value="1year">١ ساڵ (PRO)</option>
                              </select>
                            </div>
                            {user.subscriptionExpiry && user.subscriptionPlan !== 'none' && (
                              <p className="text-[9px] text-zinc-600 text-center mt-1 font-bold">
                                بەسەردەچێت: {new Date(user.subscriptionExpiry).toLocaleDateString('en-GB')}
                              </p>
                            )}
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex justify-center">
                              <button 
                                onClick={() => handleStatusToggle(user.id)}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${
                                  user.status !== 'Banned' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                                }`}
                              >
                                {user.status !== 'Banned' ? 'Active' : 'Banned'}
                              </button>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => setDeleteModal({ id: user.id, type: 'user' })} className="w-10 h-10 rounded-xl bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(activeTab === 'movies' || activeTab === 'series') && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black">{activeTab === 'movies' ? 'فیلمەکان' : 'زنجیرەکان'}</h2>
                  <button 
                    onClick={() => {
                      setFormData({});
                      setContentModal({ type: activeTab === 'movies' ? 'movie' : 'series' });
                    }}
                    className="bg-red-600 hover:bg-red-700 px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-2 transition-all shadow-xl shadow-red-600/20"
                  >
                    <Plus size={18} />
                    زيادکردنی نوێ
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {(activeTab === 'movies' ? filteredMovies : filteredSeries).map(item => (
                    <div key={item.id} className="bg-zinc-900/40 border border-white/5 rounded-3xl p-5 group flex flex-col gap-4">
                      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden">
                        <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-60" />
                        <div className="absolute top-4 left-4">
                          {item.isPro && (
                            <div className="bg-yellow-500 text-black px-3 py-1 rounded-lg font-black text-[10px] flex items-center gap-1">
                              <Sparkles size={10} />
                              PRO
                            </div>
                          )}
                        </div>
                        <div className="absolute top-4 right-4 flex gap-2">
                          <button 
                            onClick={() => {
                              setFormData(item);
                              setContentModal({ type: activeTab === 'movies' ? 'movie' : 'series', data: item });
                            }}
                            className="bg-black/80 p-2.5 rounded-xl hover:bg-red-600 transition-colors"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => setDeleteModal({ id: item.id, type: activeTab === 'movies' ? 'movie' : 'series' })}
                            className="bg-black/80 p-2.5 rounded-xl hover:bg-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-black text-lg line-clamp-1">{item.title}</h3>
                        <p className="text-zinc-500 text-xs mt-1 font-bold">{item.year} • {item.duration || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: 'بەکارهێنەران', value: users.length, icon: Users, color: 'text-blue-500' },
                  { label: 'فیلمەکان', value: movies.length, icon: Film, color: 'text-red-500' },
                  { label: 'زنجیرەکان', value: series.length, icon: Tv, color: 'text-purple-500' },
                ].map((stat, i) => (
                  <div key={i} className="bg-zinc-900/40 border border-white/5 rounded-[40px] p-10 text-center flex flex-col items-center">
                    <div className={`w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center ${stat.color} mb-6`}>
                      <stat.icon size={40} />
                    </div>
                    <p className="text-zinc-500 font-bold uppercase text-xs mb-2">{stat.label}</p>
                    <p className="text-5xl font-black">{stat.value}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-4xl">
                <div className="mb-8">
                  <h2 className="text-2xl font-black mb-2">بەڕێوەبردنی پلانەکان و نرخ</h2>
                  <p className="text-zinc-500">لێرەوە دەتوانیت نرخی بەشداریکردن و لینکی تەلەگرام بگۆڕیت</p>
                </div>

                <form onSubmit={handleSettingsSave} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[32px] space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-500">
                          <DollarSign size={20} />
                        </div>
                        <h3 className="font-black text-lg">نرخی پلانەکان</h3>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-zinc-500 uppercase px-1">١ ڕۆژ (IQD)</label>
                          <input 
                            type="number"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-red-600 transition-all outline-none"
                            value={appSettings.plan_1day}
                            onChange={e => setAppSettings({...appSettings, plan_1day: Number(e.target.value)})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-zinc-500 uppercase px-1">١ مانگ (IQD)</label>
                          <input 
                            type="number"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-red-600 transition-all outline-none"
                            value={appSettings.plan_1month}
                            onChange={e => setAppSettings({...appSettings, plan_1month: Number(e.target.value)})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-zinc-500 uppercase px-1">٣ مانگ (IQD)</label>
                          <input 
                            type="number"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-red-600 transition-all outline-none"
                            value={appSettings.plan_3months}
                            onChange={e => setAppSettings({...appSettings, plan_3months: Number(e.target.value)})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-zinc-500 uppercase px-1">٦ مانگ (IQD)</label>
                          <input 
                            type="number"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-red-600 transition-all outline-none"
                            value={appSettings.plan_6months}
                            onChange={e => setAppSettings({...appSettings, plan_6months: Number(e.target.value)})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-zinc-500 uppercase px-1">١ ساڵ (IQD)</label>
                          <input 
                            type="number"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-red-600 transition-all outline-none"
                            value={appSettings.plan_1year}
                            onChange={e => setAppSettings({...appSettings, plan_1year: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[32px] space-y-6 flex flex-col">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                          <Send size={20} />
                        </div>
                        <h3 className="font-black text-lg">پەیوەندی</h3>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-500 uppercase px-1">لینکی تەلەگرام (یان یوزەرنەیم)</label>
                        <input 
                          type="text"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-red-600 transition-all outline-none"
                          placeholder="https://t.me/your_username"
                          value={appSettings.telegramLink}
                          onChange={e => setAppSettings({...appSettings, telegramLink: e.target.value})}
                        />
                        <p className="text-[10px] text-zinc-500 px-2 font-medium">ئەم لینکە بەکاردێت کاتێک بەکارهێنەر کلیک لەسەر "Subscribe Now" دەکات</p>
                      </div>

                      <div className="mt-auto pt-8">
                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-2xl">
                          <div className="flex items-center gap-2 text-yellow-500 mb-2">
                            <AlertCircle size={14} />
                            <span className="text-[10px] font-black uppercase">تێبینی</span>
                          </div>
                          <p className="text-[11px] text-yellow-500/80 font-bold leading-relaxed">
                            تەنها کەسێک کە پلەی 'Owner' بێت دەتوانێت ئەم گۆڕانکارییانە بکات. هەر گۆڕانکارییەک بکەیت ڕاستەوخۆ لە لاپەڕەی نرخەکان نیشان دەدرێت.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full md:w-auto bg-red-600 hover:bg-red-700 px-12 py-5 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-red-600/20 flex items-center justify-center gap-3"
                  >
                    <CheckCircle2 size={24} />
                    پاشەکەوتکردنی گۆڕانکارییەکان
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />

      {/* Content Create/Edit Modal */}
      <AnimatePresence>
        {contentModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setContentModal(null)} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-zinc-900 border border-white/10 rounded-[40px] p-8 md:p-12 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black">
                  {contentModal.data ? 'دەستکاری ناوەڕۆک' : `زیادکردنی ${contentModal.type === 'movie' ? 'فیلم' : 'زنجیرە'}`}
                </h2>
                <button onClick={() => setContentModal(null)} className="bg-white/5 p-3 rounded-full hover:bg-white/10 transition-colors"><X size={20}/></button>
              </div>

              <form onSubmit={handleContentSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-zinc-500 uppercase px-1">بۆ بەکارهێنەرانی PRO؟</label>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, isPro: !formData.isPro})}
                      className={`w-full flex items-center justify-between p-6 rounded-3xl border transition-all ${
                        formData.isPro ? 'bg-yellow-600/10 border-yellow-600 text-yellow-500' : 'bg-white/5 border-white/10 text-zinc-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles size={24} className={formData.isPro ? 'fill-current' : ''} />
                        <span className="font-black">فیلمی پرۆ - PRO ONLY</span>
                      </div>
                      <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.isPro ? 'bg-yellow-600' : 'bg-zinc-700'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isPro ? 'left-7' : 'left-1'}`} />
                      </div>
                    </button>
                    <p className="text-[10px] text-zinc-600 px-2 font-medium italic">ئەگەر ئەمە هەڵبژێریت تەنها ئەو کەسانەی پلانیان کڕیوە دەتوانن بیبینن</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <label className="text-xs font-black text-zinc-500 uppercase px-1">وەرزەکان</label>
                        <input 
                          type="number"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-red-600 transition-all outline-none"
                          value={formData.seasonsCount || ''}
                          onChange={e => setFormData({...formData, seasonsCount: Number(e.target.value)})}
                          placeholder="ژمارەی وەرزەکان"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-xs font-black text-zinc-500 uppercase px-1">بارودۆخی زنجیرە</label>
                        <select 
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-red-600 transition-all outline-none"
                          value={formData.status || 'Ongoing'}
                          onChange={e => setFormData({...formData, status: e.target.value as any})}
                        >
                          <option value="Ongoing">بەردەوامە (Ongoing)</option>
                          <option value="Finished">کۆتایی هاتووە (Finished)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-black text-zinc-500 uppercase px-1">ساڵی کۆتایی (ئەگەر تەواو بووە)</label>
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-red-600 transition-all outline-none"
                        value={formData.endYear || ''}
                        onChange={e => setFormData({...formData, endYear: e.target.value})}
                        placeholder="2024"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black text-zinc-500 uppercase px-1">وێنەی پۆستەر</label>
                    <div className="flex flex-col gap-4">
                      {formData.imageUrl && (
                        <div className="relative aspect-[2/3] w-32 rounded-2xl overflow-hidden border border-white/10 mx-auto md:mx-0">
                          <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                          <button 
                            type="button" onClick={() => setFormData({...formData, imageUrl: ''})}
                            className="absolute top-1 right-1 bg-black/60 p-1.5 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <label className="flex-grow bg-white/5 border border-white/10 border-dashed hover:border-red-600/50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all group">
                          <Upload className="text-zinc-500 group-hover:text-red-500 transition-colors mb-2" size={20} />
                          <span className="text-[10px] font-black text-zinc-500 group-hover:text-red-500 uppercase">ئپلۆدکردن</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                        <div className="flex-grow space-y-2">
                          <input 
                            placeholder="یاخود لینک دابنێ..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-red-600 transition-all outline-none"
                            value={formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black text-zinc-500 uppercase px-1">بۆ بانەری سەرەکی؟</label>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, isBanner: !formData.isBanner})}
                      className={`w-full flex items-center justify-between p-6 rounded-3xl border transition-all ${
                        formData.isBanner ? 'bg-red-600/10 border-red-600 text-red-500' : 'bg-white/5 border-white/10 text-zinc-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <StarIcon size={24} className={formData.isBanner ? 'fill-current' : ''} />
                        <span className="font-black">نیشاندان لە بانەری سەرەکی</span>
                      </div>
                      <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.isBanner ? 'bg-red-600' : 'bg-zinc-700'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isBanner ? 'left-7' : 'left-1'}`} />
                      </div>
                    </button>
                    <p className="text-[10px] text-zinc-600 px-2 font-medium italic">ئەگەر ئەمە هەڵبژێریت لە بەشی گەورەی لاپەرەی سەرەکی دەردەکەوێت</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-zinc-500 uppercase px-1">ژانەرەکان (Genre)</label>
                  <div className="flex flex-wrap gap-2">
                    {GENRES_LIST.map(genre => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all border ${
                          formData.genre?.includes(genre) 
                          ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20' 
                          : 'bg-white/5 text-zinc-500 border-white/5 hover:border-zinc-700'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                {contentModal.type === 'movie' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-500 uppercase px-1 flex items-center gap-2">
                        <Zap size={12} className="text-yellow-500" />
                        سێرڤەری یەکەم
                      </label>
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-red-600 transition-all outline-none"
                        value={formData.server1Url || ''} onChange={e => setFormData({...formData, server1Url: e.target.value})}
                        placeholder="لینک لێرە دابنێ..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-500 uppercase px-1 flex items-center gap-2">
                        <Zap size={12} className="text-blue-500" />
                        سێرڤەری دووەم
                      </label>
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-red-600 transition-all outline-none"
                        value={formData.server2Url || ''} onChange={e => setFormData({...formData, server2Url: e.target.value})}
                        placeholder="لینک لێرە دابنێ..."
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase px-1">ناوی {contentModal.type === 'movie' ? 'فیلم' : 'زنجیرە'}</label>
                    <input 
                      required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-red-600 transition-all outline-none"
                      value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase px-1">ساڵی دەرچوون</label>
                    <input 
                      required type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-red-600 transition-all outline-none"
                      value={formData.year || ''} onChange={e => setFormData({...formData, year: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase px-1">ماوە (Duration)</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-red-600 transition-all"
                      value={formData.duration || ''} onChange={e => setFormData({...formData, duration: e.target.value})}
                      placeholder="نمونە: 2h 15m"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase px-1">نمرە (Rating)</label>
                    <input 
                      type="number" step="0.1" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-red-600 transition-all outline-none"
                      value={formData.rating || ''} onChange={e => setFormData({...formData, rating: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-500 uppercase px-1">چیڕۆک (Description)</label>
                  <textarea 
                    rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-red-600 transition-all outline-none resize-none"
                    value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-500 uppercase px-1">لینکی باکدراپ (Backdrop URL)</label>
                  <input 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-red-600 transition-all outline-none"
                    value={formData.backdropUrl || ''} onChange={e => setFormData({...formData, backdropUrl: e.target.value})}
                  />
                </div>

                {contentModal.type === 'series' && (
                  <div className="space-y-6 pt-10 border-t border-white/5">
                    <div className="flex justify-between items-center px-1">
                      <div>
                        <h3 className="font-black text-xl text-red-500">وەرزەکان و هەڵقەکان</h3>
                        <p className="text-xs text-zinc-500 font-medium">بەڕێوەبردنی وەرزەکان و هەڵقەکانی ئەم زنجیرەیە</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          const nextNum = seasons.length + 1;
                          setSeasons([...seasons, { id: '', number: nextNum, title: `وەرزی ${nextNum}`, episodes: [] }]);
                          setExpandedSeason(seasons.length);
                        }}
                        className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 border border-red-600/20 transition-all"
                      >
                        <Plus size={16} />
                        زیادکردنی وەرز (Season)
                      </button>
                    </div>

                    <div className="space-y-4">
                      {seasons.map((season, sIdx) => (
                        <div key={sIdx} className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden">
                          {/* Season Header (Accordion Trigger) */}
                          <div 
                            onClick={() => setExpandedSeason(expandedSeason === sIdx ? null : sIdx)}
                            className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center font-black text-white shadow-lg shadow-red-600/20">
                                {season.number}
                              </div>
                              <div>
                                <h4 className="font-black text-lg">{season.title || `وەرزی ${season.number}`}</h4>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase">{season.episodes?.length || 0} ئەڵقە بڵاوکراوەتەوە</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('ئایا دڵنیایت لە سڕینەوەی ئەم وەرزە و هەموو هەڵقەکانی؟')) {
                                    setSeasons(seasons.filter((_, i) => i !== sIdx));
                                  }
                                }}
                                className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                              <div className={`transition-transform duration-300 ${expandedSeason === sIdx ? 'rotate-180' : ''}`}>
                                <Plus size={20} className="text-zinc-500" />
                              </div>
                            </div>
                          </div>

                          {/* Season Content (Accordion Body) */}
                          <AnimatePresence>
                            {expandedSeason === sIdx && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-t border-white/5"
                              >
                                <div className="p-8 space-y-8 bg-black/20">
                                  {/* Season Info */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black text-zinc-500 uppercase px-1 focus-within:text-red-500 transition-colors">ناونیشانی وەرز</label>
                                      <input 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-red-600 transition-all outline-none"
                                        value={season.title || ''}
                                        onChange={(e) => {
                                          const newSeasons = [...seasons];
                                          newSeasons[sIdx].title = e.target.value;
                                          setSeasons(newSeasons);
                                        }}
                                        placeholder="وەرزی یەکەم..."
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black text-zinc-500 uppercase px-1">وێنەی وەرز (Optional)</label>
                                      <input 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-red-600 transition-all outline-none"
                                        value={season.imageUrl || ''}
                                        onChange={(e) => {
                                          const newSeasons = [...seasons];
                                          newSeasons[sIdx].imageUrl = e.target.value;
                                          setSeasons(newSeasons);
                                        }}
                                        placeholder="لینک لێرە دابنێ..."
                                      />
                                    </div>
                                  </div>

                                  {/* Episode Management */}
                                  <div className="space-y-6 pt-4">
                                    <div className="flex justify-between items-center px-1">
                                      <h5 className="font-black text-sm flex items-center gap-2">
                                        <Film size={14} className="text-red-500" />
                                        هەڵقەکانی ئەم وەرزی
                                      </h5>
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          const newSeasons = [...seasons];
                                          const eps = newSeasons[sIdx].episodes || [];
                                          newSeasons[sIdx].episodes = [...eps, { id: '', title: `هەڵقەی ${eps.length + 1}`, order: eps.length + 1, server1Url: '', server2Url: '', duration: '' }];
                                          setSeasons(newSeasons);
                                        }}
                                        className="text-[10px] font-black uppercase text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 px-4 py-2 rounded-xl border border-red-500/20 transition-all"
                                      >
                                        + زیادکردنی هەڵقە
                                      </button>
                                    </div>

                                    <div className="space-y-4">
                                      {(season.episodes || []).map((ep, eIdx) => (
                                        <div key={eIdx} className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4 relative group/ep">
                                          <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                              <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center font-black text-[10px] text-zinc-400">
                                                {ep.order}
                                              </div>
                                              <input 
                                                className="bg-transparent border-none font-black text-sm outline-none w-60 focus:text-red-500 transition-colors"
                                                value={ep.title}
                                                onChange={(e) => {
                                                  const newSeasons = [...seasons];
                                                  newSeasons[sIdx].episodes![eIdx].title = e.target.value;
                                                  setSeasons(newSeasons);
                                                }}
                                              />
                                            </div>
                                            <button 
                                              type="button"
                                              onClick={() => {
                                                const newSeasons = [...seasons];
                                                newSeasons[sIdx].episodes = newSeasons[sIdx].episodes!.filter((_, i) => i !== eIdx);
                                                setSeasons(newSeasons);
                                              }}
                                              className="p-2 text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover/ep:opacity-100"
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                              <label className="text-[9px] font-black text-zinc-600 uppercase px-2">سێرڤەری یەکەم</label>
                                              <input 
                                                className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs font-bold outline-none focus:border-red-600 transition-all"
                                                value={ep.server1Url || ''}
                                                onChange={(e) => {
                                                  const newSeasons = [...seasons];
                                                  newSeasons[sIdx].episodes![eIdx].server1Url = e.target.value;
                                                  setSeasons(newSeasons);
                                                }}
                                                placeholder="Link..."
                                              />
                                            </div>
                                            <div className="space-y-1">
                                              <label className="text-[9px] font-black text-zinc-600 uppercase px-2">سێرڤەری دووەم</label>
                                              <input 
                                                className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs font-bold outline-none focus:border-red-600 transition-all"
                                                value={ep.server2Url || ''}
                                                onChange={(e) => {
                                                  const newSeasons = [...seasons];
                                                  newSeasons[sIdx].episodes![eIdx].server2Url = e.target.value;
                                                  setSeasons(newSeasons);
                                                }}
                                                placeholder="Link..."
                                              />
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                              <label className="text-[9px] font-black text-zinc-600 uppercase px-2">ماوە</label>
                                              <input 
                                                className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs font-bold outline-none focus:border-red-600 transition-all"
                                                value={ep.duration || ''}
                                                onChange={(e) => {
                                                  const newSeasons = [...seasons];
                                                  newSeasons[sIdx].episodes![eIdx].duration = e.target.value;
                                                  setSeasons(newSeasons);
                                                }}
                                                placeholder="45m"
                                              />
                                            </div>
                                            <div className="space-y-1">
                                              <label className="text-[9px] font-black text-zinc-600 uppercase px-2">ڕیزبەندی</label>
                                              <input 
                                                type="number"
                                                className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs font-bold outline-none focus:border-red-600 transition-all"
                                                value={ep.order}
                                                onChange={(e) => {
                                                  const newSeasons = [...seasons];
                                                  newSeasons[sIdx].episodes![eIdx].order = Number(e.target.value);
                                                  setSeasons(newSeasons);
                                                }}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                      {(season.episodes?.length === 0) && (
                                        <div className="py-10 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                          <p className="text-zinc-600 text-xs font-bold">هیچ ئەڵقەیەک زیاد نەکراوە</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                      {seasons.length === 0 && (
                        <div className="py-20 text-center bg-white/[0.02] border border-dashed border-white/5 rounded-[40px]">
                          <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4 text-zinc-600">
                            <Layers size={32} />
                          </div>
                          <p className="text-zinc-500 font-bold">هیچ وەرزێک تائێستا زیاد نەکراوە</p>
                          <button 
                            type="button"
                            onClick={() => {
                              setSeasons([{ id: '', number: 1, title: 'وەرزی ١', episodes: [] }]);
                              setExpandedSeason(0);
                            }}
                            className="mt-4 text-red-500 text-xs font-black uppercase hover:underline"
                          >
                            + وەرزی یەکەم دروست بکە
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 py-5 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-red-600/30">
                  {contentModal.data ? 'پاشەکەوتکردنی گۆڕانکارییەکان' : 'زیادکردنی ناوەڕۆک'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteModal(null)} className="absolute inset-0 bg-black/95 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-zinc-900 border border-white/10 rounded-[40px] p-10 max-w-md w-full text-center">
              <div className="w-20 h-20 bg-red-600/10 rounded-3xl flex items-center justify-center text-red-600 mx-auto mb-8"><AlertCircle size={40}/></div>
              <h2 className="text-2xl font-black mb-4">دلنیایت لە سڕینەوە؟</h2>
              <p className="text-zinc-500 font-medium mb-10">ئەم کرداری سڕینەوەیە ناگەڕێتەوە و هەموو داتاکانی پەیوەندیدار دەسڕێنەوە.</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setDeleteModal(null)} className="bg-white/5 py-4 rounded-2xl font-black">پاشگەزبوونەوە</button>
                <button onClick={handleDelete} className="bg-red-600 py-4 rounded-2xl font-black shadow-xl shadow-red-600/20">سڕینەوە</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
