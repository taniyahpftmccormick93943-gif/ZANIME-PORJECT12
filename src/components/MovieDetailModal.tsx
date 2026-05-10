import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Plus, Check, Star, Clock, Calendar, MessageSquare, Send } from 'lucide-react';
import { Movie, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';

interface MovieDetailModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MovieDetailModal({ movie, isOpen, onClose }: MovieDetailModalProps) {
  const { user, myList, addToMyList, removeFromMyList, reviews, addReview } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const movieReviews = useMemo(() => 
    reviews.filter((r: Review) => r.movieId === movie?.id),
    [reviews, movie?.id]
  );

  const averageRating = useMemo(() => {
    if (movieReviews.length === 0) return movie?.rating || 0;
    const sum = movieReviews.reduce((acc: number, curr: Review) => acc + curr.rating, 0);
    return (sum / movieReviews.length).toFixed(1);
  }, [movieReviews, movie?.rating]);

  const isInList = useMemo(() => 
    myList?.some(m => m.id === movie?.id),
    [myList, movie?.id]
  );

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (rating === 0) {
        alert('تکایە سەرەتا ئەستێرەیەک هەڵبژێرە');
        return;
    }
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      addReview({
        movieId: movie!.id,
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

  if (!movie) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-10 pointer-events-none" dir="rtl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md pointer-events-auto"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="relative w-full max-w-6xl h-full md:h-auto max-h-[100vh] md:max-h-[90vh] bg-[#1a0505] rounded-none md:rounded-[40px] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.8)] border-none md:border md:border-white/5 pointer-events-auto no-scrollbar"
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#2d0a0a] via-[#1a0505] to-[#120303] z-0" />

            {/* Back Button */}
            <button 
              onClick={onClose}
              className="absolute top-8 left-8 z-50 p-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/10"
            >
              <X size={20} />
            </button>

            <div className="relative z-10 px-6 py-10 md:px-16 md:py-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center lg:items-start transition-all">
                
                {/* Poster Content - Comes first on mobile */}
                <div className="lg:col-span-4 order-1 lg:order-2 flex justify-center lg:block">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group lg:pr-4 w-48 sm:w-64 lg:w-full"
                  >
                    <div className="relative aspect-[2/3] w-full rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
                      <img 
                        src={movie.imageUrl || movie.backdropUrl || undefined} 
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-[32px]" />
                    </div>
                  </motion.div>
                </div>

                {/* Left/Center Content - Comes second on mobile */}
                <div className="lg:col-span-8 order-2 lg:order-1 flex flex-col items-center lg:items-center text-center">
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight"
                  >
                    {movie.title}
                  </motion.h2>

                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-6">
                    <span className="bg-white/5 px-2 py-1 rounded">2024</span>
                    <span className="bg-white/5 px-2 py-1 rounded">1h 44m</span>
                    <span className="bg-white/5 px-2 py-1 rounded">18+</span>
                  </div>

                  <p className="text-yellow-500 font-bold mb-8 italic opacity-80">
                    "کاتێک سروشت بانگت دەکات"
                  </p>

                  {/* Icon Stats */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                      <Star size={14} className="fill-yellow-500 text-yellow-500" />
                      <span className="text-xs font-bold text-white">7.5</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                      <div className="w-4 h-4 bg-red-600 rounded-sm flex items-center justify-center text-[10px] font-black text-white">RT</div>
                      <span className="text-xs font-bold text-white">84%</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                      <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center text-[10px] font-black text-white">M</div>
                      <span className="text-xs font-bold text-white">72</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap justify-center gap-2 mb-10">
                    {['کۆمیدی', 'ئەنیمێشن', 'خێزانی'].map(tag => (
                      <span key={tag} className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold text-gray-300 transition-colors cursor-default">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Buttons Row */}
                  <div className="flex flex-wrap justify-center gap-4">
                    <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-black flex items-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-red-600/20">
                      <Play className="fill-current" size={18} />
                      <span>سەیرکردن</span>
                    </button>
                    <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all">
                      <span>داونڵۆدکردن</span>
                    </button>
                    <button 
                      onClick={toggleList}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all"
                    >
                      {isInList ? <Check size={20} /> : <Plus size={20} />}
                      <span>لیستی دڵخواز</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Stats Container */}
              <div className="mt-16 bg-black/30 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-6 pr-4">
                  <div className="flex -space-x-2 rtl:space-x-reverse">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1a0505] bg-zinc-800" />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-gray-500">بەردەستە بە کوالێتی 4K</p>
                </div>
                <div className="flex items-center gap-4 pl-4 overflow-hidden">
                   <div className="h-2 w-24 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-red-600 rounded-full" />
                   </div>
                   <p className="text-xs font-black text-gray-400">75% تەواوکراوە</p>
                </div>
              </div>

              {/* Main Detail Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mt-20">
                {/* Trailer Side */}
                <div className="lg:col-span-4 flex flex-col items-center">
                  <button className="group relative w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-white/10">
                    <Play className="fill-white w-10 h-10 ml-1 transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 rounded-full border-2 border-white/20 border-dashed animate-[spin_20s_linear_infinite]" />
                  </button>
                  <p className="mt-4 font-black text-white text-lg">بینینی تریلەر</p>
                </div>

                {/* Story/Details Side */}
                <div className="lg:col-span-8 space-y-12">
                  <section>
                    <h3 className="text-red-500 text-sm font-black mb-4 flex items-center gap-3">
                      <div className="w-1 h-4 bg-red-600 rounded-full" />
                      چیڕۆک
                    </h3>
                    <p className="text-xl text-gray-300 leading-relaxed font-medium">
                      {movie.description}
                    </p>
                  </section>

                  <section className="space-y-6">
                    <h3 className="text-red-500 text-sm font-black flex items-center gap-3">
                      <div className="w-1 h-4 bg-red-600 rounded-full" />
                      ئەو کەسانەی بەشدارن
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <span className="text-gray-500 text-sm font-bold">دەرھێنەر</span>
                          <span className="text-white font-black">Christopher Nolan</span>
                       </div>
                       <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <span className="text-gray-500 text-sm font-bold">نوسەر</span>
                          <span className="text-white font-black">Jonathan Nolan</span>
                       </div>
                    </div>

                    <div className="pt-4">
                       <p className="text-gray-500 text-sm font-bold mb-4">ئەکتەرەکان</p>
                       <div className="flex flex-wrap gap-4">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-full px-4 py-2">
                               <div className="w-8 h-8 rounded-full bg-zinc-800" />
                               <span className="text-xs font-black text-white">ئەکتەری {i}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* Review Section */}
              <div className="mt-20 pt-10 border-t border-white/5">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="text-red-600" />
                    <h3 className="text-3xl font-black text-white">هەڵسەنگاندنەکان</h3>
                    <span className="bg-red-600/20 text-red-500 text-xs px-3 py-1 rounded-full font-black">
                      {movieReviews.length} ڕا
                    </span>
                  </div>
                  
                  {user && (
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-2xl">
                       <StarRating 
                          rating={rating} 
                          onRatingChange={setRating} 
                          interactive={true} 
                          size={24}
                       />
                    </div>
                  )}
                </div>

                {/* Review Form */}
                {user ? (
                  <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 mb-12 transition-all focus-within:border-red-600/30">
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <textarea
                        placeholder="ڕاو سەرنجی خۆت لێرە بنوسە..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-600 min-h-[120px] resize-none text-xl font-medium"
                      />
                      <div className="flex justify-between items-center pt-4 border-t border-white/5">
                        <div className="flex items-center gap-3">
                           <img 
                            src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || '')}&background=random`} 
                            alt="Me" 
                            className="w-10 h-10 rounded-full"
                          />
                          <span className="text-white font-black">{user.displayName}</span>
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting || !comment.trim() || rating === 0}
                          className="bg-red-600 text-white px-8 py-3 rounded-full font-black flex items-center gap-2 hover:bg-red-700 transition-all disabled:opacity-30"
                        >
                          <span>ناردن</span>
                          <Send size={18} />
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="bg-red-600/10 border border-red-600/20 rounded-2xl p-8 mb-12 text-center">
                    <p className="text-red-500 font-black text-lg">تکایە بچۆ ژوورەوە بۆ ئەوەی ڕاو سەرنجی خۆت بنوسیت</p>
                  </div>
                )}

                {/* Reviews List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {movieReviews.length > 0 ? (
                    movieReviews.map((rev: Review) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={rev.id} 
                        className="bg-white/[0.03] border border-white/5 p-6 rounded-[30px] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                               <StarRating rating={rev.rating} size={12} />
                            </div>
                            <img 
                              src={rev.userPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.userName)}&background=random`} 
                              alt={rev.userName} 
                              className="w-8 h-8 rounded-full border border-white/10"
                            />
                          </div>
                          <p className="text-gray-300 font-bold text-sm leading-relaxed mb-4 line-clamp-3">
                             "{rev.comment}"
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                           <span className="text-white/60 text-[10px] font-black">{rev.userName}</span>
                           <div className="flex items-center gap-1 text-yellow-500">
                              <Star size={10} className="fill-current" />
                              <span className="text-[10px] font-black">{rev.rating}.0</span>
                           </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-20 opacity-20">
                      <MessageSquare size={64} className="mx-auto mb-4" />
                      <p className="text-2xl font-black">هیچ ڕایەک نییە</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
