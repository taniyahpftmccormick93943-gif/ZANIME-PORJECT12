import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Play, 
  ChevronRight, 
  Info, 
  ArrowRight,
  Maximize2,
  Volume2,
  Settings,
  Share2,
  Server,
  Zap,
  Globe,
  Sparkles,
  Lock,
  List
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import { collection, doc, getDoc, getDocs, getFirestore, query, orderBy } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

import { Movie, Episode, Season } from '../types';

import firebaseConfig from '../../firebase-applet-config.json';

const WatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, myList, watchlists, incrementMovieView } = useAuth();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [activeServer, setActiveServer] = useState<'s1' | 's2'>('s1');
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        let app;
        if (getApps().length === 0) {
          app = initializeApp(firebaseConfig);
        } else {
          app = getApps()[0];
        }
        const firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
        setDb(firestoreDb);

        // Try movies collection
        let isSeries = false;
        let docRef = doc(firestoreDb, 'movies', id);
        let docSnap = await getDoc(docRef);
        
        // If not in movies, try series
        if (!docSnap.exists()) {
          docRef = doc(firestoreDb, 'series', id);
          docSnap = await getDoc(docRef);
          if (docSnap.exists()) isSeries = true;
        }

        if (docSnap.exists()) {
          const movieData = { id: docSnap.id, ...docSnap.data() } as Movie;
          setMovie(movieData);
          incrementMovieView(movieData.id, isSeries);

          if (isSeries) {
            const seasonsRef = collection(firestoreDb, 'series', id, 'seasons');
            const ssSnap = await getDocs(query(seasonsRef, orderBy('number', 'asc')));
            const ss = ssSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Season[];
            setSeasons(ss);
            if (ss.length > 0) {
              setSelectedSeason(ss[0]);
            }
          }
        }
      } catch (e) {
        console.error('Data fetch failed', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!selectedSeason || !id || !db) return;
    
    const fetchEpisodes = async () => {
      try {
        const episodesRef = collection(db, 'series', id, 'seasons', selectedSeason.id, 'episodes');
        const epsSnap = await getDocs(query(episodesRef, orderBy('order', 'asc')));
        const eps = epsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Episode[];
        setEpisodes(eps);
        if (eps.length > 0 && !selectedEpisode) setSelectedEpisode(eps[0]);
      } catch (e) {
        console.error("Failed to fetch episodes", e);
      }
    };
    
    fetchEpisodes();
  }, [selectedSeason, id, db]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie) return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-black">ناوەڕۆکەکە نەدۆزرایەوە</h2>
      <button onClick={() => navigate('/')} className="text-red-500 font-bold">گەڕانەوە بۆ سەرەتا</button>
    </div>
  );

  const videoUrl = selectedEpisode 
    ? (activeServer === 's1' ? selectedEpisode.server1Url : selectedEpisode.server2Url)
    : (activeServer === 's1' ? movie.server1Url : movie.server2Url);

  const isProUser = user?.role === 'Admin' || user?.role === 'Owner' || (user?.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date());
  const hasAccess = !movie.isPro || isProUser;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 font-sans" dir="rtl">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        
        {/* Player Header */}
        <div className="flex items-center gap-3 mb-6 text-zinc-400">
          <Link to="/" className="hover:text-red-500 transition-colors">سەرەتا</Link>
          <ChevronRight size={14} className="rotate-180" />
          <Link to={`/movie/${movie.id}`} className="hover:text-red-500 transition-colors">{movie.title}</Link>
          <ChevronRight size={14} className="rotate-180" />
          <span className="text-white font-bold">سەیرکردن</span>
        </div>

        {/* Video Player Section */}
        <div className="space-y-6 mb-12">
          {/* Server Selector */}
          <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl w-fit border border-white/5">
            <span className="text-xs font-black text-zinc-500 uppercase px-3">سێرڤەرەکان</span>
            <button 
              onClick={() => setActiveServer('s1')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeServer === 's1' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'hover:bg-white/5 text-zinc-400'
              }`}
            >
              <Zap size={14} />
              سێرڤەری یەکەم
            </button>
            <button 
              onClick={() => setActiveServer('s2')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeServer === 's2' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'hover:bg-white/5 text-zinc-400'
              }`}
            >
              <Globe size={14} />
              سێرڤەری دووەم
            </button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative aspect-video w-full rounded-[32px] overflow-hidden bg-black border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] group"
          >
            {!hasAccess ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <div className="absolute inset-0 z-0">
                  <img src={movie.backdropUrl || movie.imageUrl} className="w-full h-full object-cover opacity-20 blur-xl" alt="" />
                </div>
                <div className="relative z-10 space-y-8 max-w-xl">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-[32px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 mb-4 animate-bounce">
                    <Lock size={40} />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight">ئەم فیلمە تەنها بۆ <span className="text-yellow-500">بەشداربووانی پرۆ</span>یە</h2>
                    <p className="text-zinc-500 font-bold text-lg leading-relaxed">
                      بۆ ئەوەی بتوانیت سەیری ئەم فیلمە و دەیان فیلمی تری ناوازە بکەیت، تکایە یەکێک لە پلانەکانمان کڕە.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/pricing" className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-2xl shadow-yellow-500/30">
                      <Sparkles size={24} />
                      ئێستا بەشداری بکە
                    </Link>
                    <button onClick={() => navigate('/')} className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 px-10 py-5 rounded-2xl font-black text-lg transition-all">
                      گەڕانەوە
                    </button>
                  </div>
                </div>
              </div>
            ) : videoUrl ? (
              <iframe 
                src={videoUrl} 
                className="w-full h-full border-none" 
                allowFullScreen={true}
                allow="autoplay; encrypted-media"
                title={movie.title}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                 <img 
                  src={movie.backdropUrl || movie.imageUrl} 
                  className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" 
                  alt={movie.title}
                />
                <div className="relative z-10 p-10 bg-red-600/10 rounded-full"><Server size={48} className="text-red-500" /></div>
                <p className="relative z-10 text-xl font-bold text-zinc-500">هیچ لینکێک بۆ ئەم سێرڤەرە بەردەست نییە</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Content Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-600/20 text-red-500 px-3 py-1 rounded-lg flex items-center gap-2 text-sm font-black">
                <Info size={16} />
                کورتە
              </div>
            </div>
            <p className="text-xl text-zinc-400 leading-relaxed font-medium mb-10">
              {movie.description}
            </p>

            {seasons.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <List className="text-red-500" />
                    وەرزەکان و هەڵقەکان
                  </h2>
                </div>
                
                {/* Season Pills */}
                <div className="flex flex-wrap gap-3 mb-8">
                  {seasons.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedSeason(s);
                        setSelectedEpisode(null); // Reset when changing season
                      }}
                      className={`px-8 py-3 rounded-2xl font-black text-sm transition-all border ${
                        selectedSeason?.id === s.id 
                        ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-600/20' 
                        : 'bg-white/5 border-white/10 text-zinc-500 hover:border-red-600/50 hover:text-white'
                      }`}
                    >
                      {s.title || `Season ${s.number}`}
                    </button>
                  ))}
                </div>

                {/* Episode Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {episodes.map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => setSelectedEpisode(ep)}
                      className={`relative group transition-all p-4 rounded-2xl border ${
                        selectedEpisode?.id === ep.id 
                        ? 'bg-white/10 border-white/20 text-white shadow-xl' 
                        : 'bg-white/5 border-white/10 text-zinc-400 hover:border-red-600/50 hover:text-white'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-black uppercase opacity-60">هەڵقەی {ep.order}</span>
                        <span className="font-bold text-sm truncate w-full text-center">{ep.title}</span>
                      </div>
                      {selectedEpisode?.id === ep.id && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-[#050505]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="h-px bg-white/10 mb-10" />

            {/* Similar Movies */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <span className="w-2 h-8 bg-red-600 rounded-full" />
                  فیلمی هاوشێوە
                </h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {similarMovies.length > 0 ? (
                  similarMovies.map((m: Movie) => (
                    <div key={m.id}>
                      <MovieCard movie={m} onSelect={(movie: Movie) => navigate(`/watch/${movie.id}`)} />
                    </div>
                  ))
                ) : (
                  // Mock placeholders if none found
                  [1,2,3,4].map(i => (
                    <div key={i} className="aspect-[2/3] bg-zinc-900 rounded-2xl animate-pulse" />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-10">
            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
              <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-red-600 rounded-full" />
                زانیاری زیاتر
              </h3>
              <div className="space-y-4 text-zinc-400 text-sm font-bold">
                <div className="flex justify-between">
                  <span>ساڵی دەرچوون</span>
                  <span className="text-white">{movie.year}</span>
                </div>
                <div className="flex justify-between">
                  <span>ژانەر</span>
                  <div className="flex gap-2">
                    {movie.genre?.map((g: string) => (
                      <span key={g} className="text-white bg-white/5 px-2 py-0.5 rounded-md">{g}</span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>نمرە</span>
                  <span className="text-yellow-500">★ {movie.rating}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-red-600 rounded-full" />
                زۆرترین بینراو
              </h3>
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="flex gap-4 group cursor-pointer">
                    <div className="w-24 h-32 bg-zinc-900 rounded-xl overflow-hidden flex-shrink-0">
                      <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="most watched" />
                    </div>
                    <div className="py-2">
                      <h4 className="font-bold group-hover:text-red-500 transition-colors">نەهێنی خـۆشـتـن</h4>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mt-2">
                        <span>2024</span>
                        <span>•</span>
                        <span>ئەکشن</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
