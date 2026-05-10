import MovieCard from './MovieCard';
import { Movie } from '../types';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useRef } from 'react';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  showProgress?: boolean;
  onSelect?: (movie: Movie) => void;
  isSeries?: boolean;
}

export default function MovieRow({ title, movies, showProgress, onSelect, isSeries }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left'
        ? scrollLeft - clientWidth / 1.5
        : scrollLeft + clientWidth / 1.5;

      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 group" dir="rtl">
      <div className="max-w-[1500px] mx-auto px-8 md:px-16 mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-black text-white tracking-tight">
          {title}
        </h2>
        <button className="flex items-center gap-2 text-yellow-500/50 hover:text-yellow-500 font-bold transition-all text-sm group/all">
          <ArrowLeft size={18} className="transition-transform group-hover/all:-translate-x-1" />
          <span>بینینی هەمووی</span>
        </button>
      </div>

      <div className="relative">
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#1a0505] to-transparent z-10 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#1a0505] to-transparent z-10 pointer-events-none" />

        <button
          onClick={() => scroll('right')}
          className="absolute right-4 top-1/3 -translate-y-1/2 z-20 bg-black/50 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 blur-none backdrop-blur-md"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        <button
          onClick={() => scroll('left')}
          className="absolute left-4 top-1/3 -translate-y-1/2 z-20 bg-black/50 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 blur-none backdrop-blur-md"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div
          ref={rowRef}
          className="flex gap-6 md:gap-8 overflow-x-auto scrollbar-hide px-4 md:px-16 pb-12 snap-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie) => (
            <div key={movie.id} className="min-w-[130px] sm:min-w-[150px] md:min-w-[180px] snap-start">
              <MovieCard movie={movie} showProgress={showProgress} onSelect={onSelect} isSeries={isSeries} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
