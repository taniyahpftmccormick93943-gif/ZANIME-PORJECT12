import { Play, Plus, Star, Check, Eye, Layers, Tv, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { Movie } from '../types';
import { useAuth } from '../context/AuthContext';

import firebaseConfig from '../../firebase-applet-config.json';

interface MovieCardProps {
  movie: Movie;
  showProgress?: boolean;
  onSelect?: (movie: Movie) => void;
  isSeries?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, showProgress, onSelect, isSeries: isSeriesProp }) => {
  const { myList, addToMyList, removeFromMyList } = useAuth();
  const [viewCount, setViewCount] = useState<number | null>(null);
  const isSeries = isSeriesProp || movie.isSeries || !!movie.seasonsCount;
  const isInList = myList?.some(m => m.id === movie.id);

  useEffect(() => {
    let unsubscribe: any = null;
    
    const setupListener = async () => {
      try {
        let app;
        if (getApps().length === 0) {
          app = initializeApp(firebaseConfig);
        } else {
          app = getApps()[0];
        }
        const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
        
        const statsPath = isSeries ? `series/${movie.id}/stats/data` : `movies/${movie.id}/stats/data`;
        unsubscribe = onSnapshot(doc(db, statsPath), (snapshot) => {
          if (snapshot.exists()) {
            setViewCount(snapshot.data().viewCount);
          }
        });
      } catch (e) {
        // Fallback silently
      }
    };

    setupListener();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [movie.id, isSeries]);

  const toggleList = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInList) {
      removeFromMyList(movie.id);
    } else {
      addToMyList(movie);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="relative group/card cursor-pointer"
      onClick={() => onSelect?.(movie)}
    >
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-zinc-900" dir="rtl">
        <img
          src={movie.imageUrl || movie.backdropUrl || undefined}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
        />
        
        {/* Type Labels */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 pointer-events-none z-10">
          {/* Series Label */}
          {isSeries && (
            <div className="bg-red-600 text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xl border border-red-500/30">
              <Tv size={10} className="fill-white" />
              <span className="text-[10px] font-black uppercase tracking-wider">زنجیرە</span>
            </div>
          )}

          {/* Pro Label */}
          {movie.isPro && (
            <div className="bg-yellow-500 text-black px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xl border border-yellow-600/30">
              <Sparkles size={10} className="fill-black" />
              <span className="text-[10px] font-black uppercase tracking-wider">PRO</span>
            </div>
          )}
        </div>

        {/* Seasons Count Badge (For Series) */}
        {isSeries && movie.seasonsCount && (
          <div className="absolute top-3 left-3 pointer-events-none z-10">
            <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
              <Layers size={10} className="text-zinc-400" />
              <span className="text-[10px] font-black text-white">{movie.seasonsCount} وەرز</span>
            </div>
          </div>
        )}
        
        {/* Simple Hover Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300 bg-black/60 backdrop-blur-[4px]">
           <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center transform scale-75 group-hover/card:scale-100 transition-transform duration-300 shadow-2xl shadow-red-600/40 mb-4">
              <Play className="fill-white w-8 h-8 ml-1" />
           </div>
           {isSeries && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               whileHover={{ scale: 1.05 }}
               className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md px-5 py-2 rounded-xl text-[11px] font-black tracking-wide"
             >
               سەیرکردنی کۆتا ئەڵقە
             </motion.div>
           )}
        </div>

        {/* View Count (Small & Minimal) */}
        {!isSeries && (
          <div className="absolute top-3 left-3 pointer-events-none">
            <div className="bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1.5 border border-white/10 opacity-0 group-hover/card:opacity-100 transition-opacity">
              <Eye size={10} className="text-white/60" />
              <span className="text-[9px] font-black text-white/80">{viewCount !== null ? viewCount.toLocaleString() : '...'}</span>
            </div>
          </div>
        )}

        {showProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div 
              className="h-full bg-red-600" 
              style={{ width: `${Math.floor(Math.random() * 80) + 10}%` }} 
            />
          </div>
        )}
      </div>

      {/* Modern Metadata Below Poster */}
      <div className="mt-4 px-1 space-y-1.5" dir="rtl">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-black text-sm text-white truncate group-hover:text-red-500 transition-colors flex-1 text-right">
            {movie.title} {isSeries && (
              <span className="text-[10px] text-zinc-500 font-bold mr-1">
                ({movie.year}{movie.endYear ? `-${movie.endYear}` : ''})
              </span>
            )}
          </h3>
          <div className="flex items-center gap-1 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20 shrink-0">
            <Star size={10} className="fill-yellow-500 text-yellow-500" />
            <span className="text-[10px] font-black text-yellow-500">{movie.rating || '0.0'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 justify-start">
          {movie.status && isSeries && (
            <>
              <span className={movie.status === 'Ongoing' ? 'text-green-500' : 'text-red-500'}>
                {movie.status === 'Ongoing' ? 'بەردەوامە' : 'کۆتایی هاتووە'}
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
            </>
          )}
          {!isSeries && <span>{movie.year}</span>}
          {!isSeries && <span className="w-1 h-1 rounded-full bg-zinc-700" />}
          <span className="truncate">{movie.genre?.[0] || (isSeries ? 'زنجیرە' : 'فیلم')}</span>
          {movie.duration && !isSeries && (
            <>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span>{movie.duration}</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
