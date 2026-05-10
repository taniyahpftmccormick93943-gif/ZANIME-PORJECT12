import MovieCard from './MovieCard';
import { Movie } from '../types';

interface MovieGridProps {
  title: string;
  movies: Movie[];
  onSelect?: (movie: Movie) => void;
  isSeries?: boolean;
}

export default function MovieGrid({ title, movies, onSelect, isSeries }: MovieGridProps) {
  return (
    <section className="py-12 max-w-[1500px] mx-auto px-6 md:px-12" dir="rtl">
      <div className="mb-10 flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-8 bg-red-600 rounded-full" />
          <h2 className="text-3xl font-black text-white tracking-tight">
            {title}
          </h2>
        </div>
        <span className="text-xs font-black text-zinc-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
          {movies.length} {isSeries ? 'زنجیرە' : 'فیلم'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onSelect={onSelect} isSeries={isSeries} />
        ))}
      </div>
    </section>
  );
}
