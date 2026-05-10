import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Plus, Check, Star, MessageSquare, Send, ArrowRight, Eye, ThumbsUp, Clock, Calendar, User } from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { Movie, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MoviePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, myList, addToMyList, removeFromMyList, reviews, addReview, addToHistory, incrementMovieView } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (!id) return;

    let unsubscribeStats: any = null;
    
    const fetchData = async () => {
      try {
        const configPath = '../../firebase-applet-config.json';
        const configModule = await import(/* @vite-ignore */ configPath);
        const firebaseConfig = configModule.default || configModule;
        
        let app;
        if (getApps().length === 0) {
          app = initializeApp(firebaseConfig);
        } else {
          app = getApps()[0];
        }
        const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
        
        // Try movies collection
        let docRef = doc(db, 'movies', id);
        let docSnap = await getDoc(docRef);
        
        // If not in movies, try series
        if (!docSnap.exists()) {
          docRef = doc(db, 'series', id);
          docSnap = await getDoc(docRef);
        }

        if (docSnap.exists()) {
          const movieData = { id: docSnap.id, ...docSnap.data() } as Movie;
          setMovie(movieData);

          // Listen for stats
          const statsPath = `movies/${id}/stats/data`;
          unsubscribeStats = onSnapshot(doc(db, statsPath), (snapshot) => {
            if (snapshot.exists()) {
              setViewCount(snapshot.data().viewCount);
            }
          });
        }
      } catch (e) {
        console.error('Data fetch failed', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => {
      if (unsubscribeStats) unsubscribeStats();
    };
  }, [id]);

  const handlePlay = async () => {
    if (movie) {
      setIsPulsing(true);
      await incrementMovieView(movie.id);
      addToHistory(movie, 0);
      setTimeout(() => {
        setIsPulsing(false);
        navigate(`/watch/${movie.id}`);
      }, 500);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const movieReviews = useMemo(() => 
    reviews.filter((r: Review) => r.movieId === movie?.id),
    [reviews, movie?.id]
  );

  const isInList = useMemo(() => 
    myList?.some(m => m.id === movie?.id),
    [myList, movie?.id]
  );

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !movie) return;
    if (rating === 0) {
        alert('تکایە سەرەتا ئەستێرەیەک هەڵبژێرە');
        return;
    }
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      addReview({
        movieId: movie.id,
        rating,
        comment: comment.trim()
      });
      setRating(0);
      setComment('');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleList = () => {
    if (!movie) return;
    if (isInList) {
      removeFromMyList(movie.id);
    } else {
      addToMyList(movie);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0101] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0a0101] text-white flex flex-col items-center justify-center pt-20" dir="rtl">
        <Navbar />
        <h1 className="text-4xl font-black mb-6">بۆردەکە نەدۆزرایەوە</h1>
        <button onClick={() => navigate('/')} className="text-red-600 font-bold flex items-center gap-2">
            گەڕانەوە بۆ سەرەتا <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0101] text-white overflow-x-hidden" dir="rtl">
      <Navbar />
      
      <div className="relative w-full h-auto min-h-screen lg:h-[90vh] flex items-center justify-center pt-20 lg:pt-0">
        <div className="absolute inset-0 z-0">
          <img 
            src={movie.backdropUrl || movie.imageUrl} 
            alt={movie.title}
            className="w-full h-full object-cover opacity-30 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0101] via-[#0a0101]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0101]/60 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8 flex flex-col items-center lg:items-center text-center lg:text-center order-2 lg:order-1">
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                <h1 className="text-3xl md:text-6xl font-black mb-6 tracking-tight drop-shadow-2xl">{movie.title}</h1>

                <div className="flex items-center justify-center flex-wrap gap-6 text-[11px] font-black text-gray-300 mb-8 uppercase tracking-widest bg-black/20 backdrop-blur-md px-8 py-3 rounded-2xl border border-white/5 mx-auto w-fit">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-zinc-500 text-[9px]">ساڵ</span>
                    <span>{movie.year}</span>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-zinc-500 text-[9px]">کاتی فیلم</span>
                    <span>{movie.duration || 'N/A'}</span>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-zinc-500 text-[9px]">زمان</span>
                    <span className="text-white">کوردی / ئینگلیزی</span>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <span className="bg-red-600 px-2 py-0.5 rounded text-[10px] text-white">PG-13</span>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-4 mb-10">
                   <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-lg">
                      <span className="text-[10px] font-black text-yellow-500 uppercase">IMDb</span>
                      <span className="text-sm font-black text-white">{movie.rating || '0.0'}</span>
                   </div>
                   <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg transition-colors group">
                      <Eye size={14} className={`transition-colors ${isPulsing ? 'text-green-500' : 'text-gray-400'}`} />
                      <motion.span animate={isPulsing ? { scale: [1, 1.2, 1], color: ["#fff", "#22c55e", "#fff"] } : {}} transition={{ duration: 0.6 }} className="text-sm font-black text-white">
                        {viewCount.toLocaleString()}
                      </motion.span>
                   </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2 mb-12">
                   {(movie.genre || []).map(tag => (
                      <span key={tag} className="px-5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black text-gray-400 transition-colors pointer-events-none lowercase">
                         {tag}
                      </span>
                   ))}
                </div>

                <div className="flex flex-wrap justify-center items-center gap-3">
                   <button onClick={handlePlay} className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl font-black text-sm flex items-center gap-3 transition-all transform active:scale-95 shadow-xl shadow-red-600/20">
                      <Play className="fill-current" size={18} />
                      <span>سەیرکردن</span>
                   </button>
                   <button onClick={toggleList} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 transition-all">
                      {isInList ? <Check size={18} className="text-green-500" /> : <Plus size={18} />}
                      <span>لیستی دڵخواز</span>
                   </button>
                </div>
             </motion.div>
          </div>

          <div className="lg:col-span-4 order-1 lg:order-2 flex justify-center">
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative aspect-[2/3] w-56 md:w-64 lg:w-[75%] rounded-[40px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10">
                <img src={movie.imageUrl} alt={movie.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-[48px]" />
             </motion.div>
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-6 md:px-12 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-8 space-y-24">
             <section>
                <div className="text-3xl font-black mb-10 flex items-center gap-4">
                  <div className="w-1.5 h-10 bg-red-600 rounded-full" />
                  چیڕۆکی فیلم
                </div>
                <p className="text-xl md:text-3xl text-gray-300 leading-[1.6] font-medium opacity-90">{movie.description}</p>
             </section>

             <section className="pt-24 border-t border-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                   <div className="flex items-center gap-4">
                      <div className="p-4 bg-red-600/10 rounded-3xl"><MessageSquare className="text-red-600" size={32} /></div>
                      <div>
                         <h3 className="text-4xl font-black text-white">هەڵسەنگاندنەکان</h3>
                         <p className="text-zinc-500 font-bold mt-1">تا ئێستا {movieReviews.length} کەس ڕای خۆیان نوسیوە</p>
                      </div>
                   </div>
                   {user && (
                      <div className="bg-white/5 border border-white/10 p-5 rounded-[32px] flex items-center gap-4">
                         <p className="text-xs font-black text-gray-500">نمرە لۆ ئەم فیلمە دابنێ</p>
                         <StarRating rating={rating} onRatingChange={setRating} interactive={true} size={32} />
                      </div>
                   )}
                </div>

                {user ? (
                   <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-[48px] p-12 mb-20 shadow-2xl relative overflow-hidden focus-within:ring-2 focus-within:ring-red-600/20 transition-all">
                      <form onSubmit={handleSubmitReview} className="relative z-10 space-y-8">
                         <textarea placeholder="چی لە دڵتە لێرە لۆمان بنوسە..." value={comment} onChange={(e) => setComment(e.target.value)} className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-zinc-700 min-h-[160px] resize-none text-2xl font-medium" />
                         <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-10 border-t border-white/5">
                            <div className="flex items-center gap-5">
                               <img src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || '')}&background=random`} alt="Me" className="w-16 h-16 rounded-full border-2 border-red-600/30" />
                               <div>
                                  <span className="text-white text-xl font-black block">{user.displayName}</span>
                                  <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">ئێستا چالاکە</span>
                               </div>
                            </div>
                            <button type="submit" disabled={isSubmitting || !comment.trim() || rating === 0} className="w-full sm:w-auto bg-red-600 text-white px-16 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-4 hover:bg-red-700 transition-all shadow-xl shadow-red-600/30 disabled:opacity-20">
                               <span>ناردنی هەڵسەنگاندن</span>
                               <Send size={22} />
                            </button>
                         </div>
                      </form>
                   </div>
                ) : (
                   <div className="bg-red-600/5 border border-red-600/10 rounded-[48px] p-20 text-center mb-20 group cursor-pointer hover:bg-red-600/10 transition-colors">
                      <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-8"><User size={40} className="text-red-500" /></div>
                      <h4 className="text-white text-3xl font-black mb-4">پەیوەست بە بە کۆمەڵگاکەمان</h4>
                      <p className="text-red-500/60 font-bold text-xl max-w-lg mx-auto">تکایە بچۆ ژوورەوە بۆ ئەوەی بتوانیت ڕاو سەرنجی خۆت لەگەڵ بینەرانی تر دابمەزرێنیت</p>
                   </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   {movieReviews.length > 0 ? (
                      movieReviews.map((rev: Review) => (
                         <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} key={rev.id} className="bg-white/[0.02] border border-white/5 p-10 rounded-[50px] flex flex-col justify-between hover:bg-white/[0.05] transition-all group">
                            <div>
                               <div className="flex items-center justify-between mb-8">
                                  <StarRating rating={rev.rating} size={14} />
                                  <img src={rev.userPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.userName)}&background=random`} alt={rev.userName} className="w-14 h-14 rounded-2xl border border-white/10 transition-transform group-hover:scale-110" />
                               </div>
                               <p className="text-zinc-300 font-medium text-xl leading-relaxed mb-10 italic">"{rev.comment}"</p>
                            </div>
                            <div className="flex items-center justify-between pt-8 border-t border-white/5">
                               <div className="flex flex-col">
                                  <span className="text-white text-lg font-black">{rev.userName}</span>
                                  <span className="text-zinc-600 text-xs font-bold mt-1">ئێستا</span>
                               </div>
                               <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/5 px-4 py-2 rounded-2xl"><ThumbsUp size={14} className="fill-current" /><span className="text-xs font-black">بەسوود بوو</span></div>
                            </div>
                         </motion.div>
                      ))
                   ) : (
                      <div className="col-span-full py-40 text-center opacity-10">
                         <MessageSquare size={100} className="mx-auto mb-8 opacity-20" />
                         <p className="text-4xl font-black tracking-[10px] uppercase">بێدەنگی باڵ کێشاوە</p>
                      </div>
                   )}
                </div>
             </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
