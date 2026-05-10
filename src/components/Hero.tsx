import React from 'react';
import { Play, Info, Plus, Star, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Movie } from '../types';

interface HeroProps {
  movies: Movie[];
  onSelect?: (movie: Movie) => void;
}

export default function Hero({ movies, onSelect }: HeroProps) {
  const { myList, addToMyList, removeFromMyList } = useAuth();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  React.useEffect(() => {
    if (movies.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 8000);
    
    return () => clearInterval(timer);
  }, [movies.length]);

  if (!movies || movies.length === 0) return null;

  const movie = movies[currentIndex];
  const isInList = myList?.some(m => m.id === movie.id);

  const toggleList = () => {
    if (isInList) {
      removeFromMyList(movie.id);
    } else {
      addToMyList(movie);
    }
  };

  return (
    <section className="relative h-[95vh] w-full flex items-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={movie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={movie.backdropUrl || movie.imageUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 hero-gradient" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full h-full pt-20 flex items-center justify-center lg:justify-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="max-w-2xl text-center lg:text-right"
            >
              {/* Metadata */}
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <span className="bg-red-600 text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase italic shadow-lg shadow-red-600/20">Trending Now</span>
                <span className="flex items-center gap-1.5 text-yellow-500 font-bold text-sm">
                  <Star className="w-4 h-4 fill-current" />
                  {movie.rating || '8.5'} IMDb
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tight px-4 lg:px-0">
                {movie.title}
              </h1>

              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mb-8 lg:mb-10 leading-relaxed font-medium max-w-xl mx-auto lg:mx-0 px-4 lg:px-0">
                {movie.description}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 px-4 lg:px-0">
                <button 
                  onClick={() => onSelect?.(movie)}
                  className="flex items-center gap-2 sm:gap-3 bg-red-600 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-lg hover:bg-red-700 transition-all shadow-2xl active:scale-95 shadow-red-600/30"
                >
                  <Play className="fill-current w-4 h-4 sm:w-6 sm:h-6" />
                  <span>پەخشکردن</span>
                </button>
                <Link 
                  to="/pricing"
                  className="flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-md text-white px-6 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-lg hover:bg-white/20 transition-all border border-white/10 active:scale-95 group"
                >
                  <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-500 group-hover:scale-110 transition-transform" />
                  <span className="text-yellow-500">ببە پرۆ</span>
                </Link>
                <button 
                  onClick={() => onSelect?.(movie)}
                  className="flex items-center gap-2 sm:gap-3 bg-white/5 backdrop-blur-md text-white px-6 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-lg hover:bg-white/10 transition-all border border-white/5 active:scale-95"
                >
                  <Info className="w-4 h-4 sm:w-6 sm:h-6" />
                  <span>زانیاری</span>
                </button>
              </div>

              {/* Genres */}
              <div className="mt-8 flex justify-center lg:justify-start gap-3 px-4 lg:px-0">
                {(movie.genre || []).map((g) => (
                  <span key={g} className="text-gray-400 text-sm border-r border-gray-700 pr-3 last:border-none">
                    {g}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slider Indicators */}
      {movies.length > 1 && (
        <div className="absolute bottom-10 right-10 z-20 flex gap-2">
          {movies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-12 h-1 rounded-full transition-all ${
                currentIndex === idx ? 'bg-red-600 w-20' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      )}

      {/* Side Detail */}
      <div className="absolute bottom-10 left-10 z-10 hidden xl:block">
        <div className="flex flex-col items-center gap-2">
          <div className="w-1 h-32 bg-netflix-red/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: '100%' }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-full bg-netflix-red"
            />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-gray-500 rotate-90 my-8">نیشاندانی فیلمەکە</span>
        </div>
      </div>
    </section>
  );
}
