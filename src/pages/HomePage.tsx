import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import MovieRow from '../components/MovieRow';
import MovieGrid from '../components/MovieGrid';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CATEGORIES } from '../data';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Movie } from '../types';
import { collection, onSnapshot, query, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

import firebaseConfig from '../../firebase-applet-config.json';

export default function HomePage() {
  const { myList } = useAuth();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initDb = async () => {
      try {
        let app;
        if (getApps().length === 0) {
          app = initializeApp(firebaseConfig);
        } else {
          app = getApps()[0];
        }
        const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

        const unsubscribeMovies = onSnapshot(query(collection(db, 'movies')), (snapshot) => {
          setMovies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Movie[]);
          setLoading(false);
        });

        const unsubscribeSeries = onSnapshot(query(collection(db, 'series')), (snapshot) => {
          setSeries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Movie[]);
        });

        return () => {
          unsubscribeMovies();
          unsubscribeSeries();
        };
      } catch (e) {
        console.error("Firebase load failed", e);
        setLoading(false);
      }
    };

    initDb();
  }, []);

  const handleMovieSelect = (movie: Movie) => {
    // Determine if it's a series to use correct route if needed, 
    // but WatchPage already handles both.
    navigate(`/movie/${movie.id}`);
  };

  const handleSeriesSelect = (item: Movie) => {
    navigate(`/movie/${item.id}`);
  };

  return (
    <div className="min-h-screen bg-[#1a0505] font-sans text-white overflow-x-hidden">
      <Navbar />
      
      <main>
        {/* Cinematic Hero */}
        {movies.length > 0 && (
          <Hero 
            movies={[
              ...movies.filter(m => m.isBanner),
              ...series.filter(m => m.isBanner)
            ].length > 0 ? [
              ...movies.filter(m => m.isBanner),
              ...series.filter(m => m.isBanner)
            ] : [movies[0]]} 
            onSelect={handleMovieSelect} 
          />
        )}

        {/* Categories Pills */}
        <div className="max-w-[1400px] mx-auto px-10 -mt-10 relative z-20 flex flex-wrap gap-3">
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * idx }}
              onClick={() => navigate(`/movies?genre=${cat.name}`)}
              className={`px-8 py-2.5 rounded-full text-sm font-bold cursor-pointer transition-all border ${
                idx === 0 
                ? 'bg-red-600/20 border-red-600/40 text-red-500' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white hover:border-red-600/50'
              }`}
            >
              {cat.name}
            </motion.div>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          </div>
        ) : (
          <section className="mt-16 space-y-4">
            {myList && myList.length > 0 && (
              <MovieRow 
                title="لیستەکەی من" 
                movies={myList} 
                onSelect={handleMovieSelect}
              />
            )}


            {/* Be Pro CTA Section */}
            <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-10">
              <Link to="/pricing">
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="relative overflow-hidden rounded-[40px] bg-gradient-to-r from-red-900/40 via-zinc-900 to-zinc-900 border border-white/5 p-10 md:p-16"
                >
                  <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="text-center md:text-right space-y-4">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/10 border border-red-600/20 text-red-500 mb-4">
                        <Sparkles size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">تایبەتمەندی نوێ</span>
                      </div>
                      <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                        ئەتەوێت <span className="text-red-600">بە بێ ڕیکلام </span> <br />
                        سەیری فیلمەکان بکەیت؟
                      </h2>
                      <p className="text-zinc-500 font-bold max-w-xl mx-auto md:mx-0">
                        ببە بە پرۆ و لە باشترین سێرڤەرەکان بەبێ بڕانی ڕیکلام و بەرزترین کوالێتی سەیری نوێترین فیلمەکان بکە.
                      </p>
                    </div>
                    <div className="shrink-0">
                      <div className="bg-red-600 hover:bg-red-700 w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-all shadow-2xl shadow-red-600/30 group">
                        <ArrowRight size={40} className="group-hover:translate-x-2 transition-transform rtl:rotate-180" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </section>

            {movies.length > 0 && (
              <MovieGrid 
                title="هەموو فیلمەکان" 
                movies={movies} 
                onSelect={handleMovieSelect}
              />
            )}

            {series.length > 0 && (
              <MovieGrid 
                title="هەموو زنجیرەکان" 
                movies={series} 
                onSelect={handleSeriesSelect}
                isSeries={true}
              />
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
