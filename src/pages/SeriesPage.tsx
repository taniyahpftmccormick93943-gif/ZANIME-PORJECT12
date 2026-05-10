import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import firebaseConfig from '../../firebase-applet-config.json';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieGrid from '../components/MovieGrid';
import { Movie } from '../types';
import { Layers, Search, SlidersHorizontal } from 'lucide-react';
import { motion } from 'motion/react';

import { useLocation, useNavigate } from 'react-router-dom';

const SeriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [series, setSeries] = useState<Movie[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('هەمووی');
  const location = useLocation();

  const genreList = [
    { id: 'all', title: 'هەمووی' },
    { id: 'Action', title: 'ئەکشن', kurdish: 'ئاکشن' },
    { id: 'Drama', title: 'دراما', kurdish: 'دراما' },
    { id: 'Comedy', title: 'کۆمیدی', kurdish: 'کۆمێدی' },
    { id: 'Horror', title: 'ترسناک', kurdish: 'تیرۆر' },
    { id: 'Sci-Fi', title: 'سای-فای', kurdish: 'زانستی خەیاڵی' },
    { id: 'Animation', title: 'ئەنیمەیشن', kurdish: 'کاتۆن' },
    { id: 'Adventure', title: 'سەرکێشی', kurdish: 'کەشف' },
    { id: 'Crime', title: 'تاوان', kurdish: 'جەریمە' },
    { id: 'Mystery', title: 'نهێنی', kurdish: 'غەموز' },
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const genreParam = params.get('genre');
    if (genreParam) {
      const foundGenre = genreList.find(g => 
        g.title === genreParam || 
        g.id === genreParam || 
        g.kurdish === genreParam
      );
      
      if (foundGenre) {
        setSelectedGenre(foundGenre.title);
      }
    }
  }, [location.search]);

  useEffect(() => {
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

    const unsubscribe = onSnapshot(query(collection(db, 'series')), (snapshot) => {
      const seriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Movie[];
      setSeries(seriesData);
      setFilteredSeries(seriesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = series;
    
    if (searchTerm) {
      result = result.filter(m => 
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGenre !== 'هەمووی') {
      const genreObj = genreList.find(g => g.title === selectedGenre);
      if (genreObj && genreObj.id !== 'all') {
        result = result.filter(m => 
          m.genre?.includes(genreObj.id) || 
          m.genre?.includes(genreObj.title) || 
          (genreObj.kurdish && m.genre?.includes(genreObj.kurdish))
        );
      }
    }

    setFilteredSeries(result);
  }, [searchTerm, selectedGenre, series]);

  const handleMovieSelect = (movie: Movie) => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      
      <main className="pt-32 pb-20">
        {/* Header Section */}
        <div className="max-w-[1500px] mx-auto px-6 md:px-12 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10"
          >
            <div>
              <div className="flex items-center gap-3 text-red-500 mb-4">
                <Layers size={24} />
                <span className="text-xs font-black uppercase tracking-[0.2em]">بەرنامەی زنجیرەکان</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight">زنجیرەکان</h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative group flex-1 sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-500 transition-colors" size={18} />
                <input 
                  type="text"
                  placeholder="گەڕان بۆ زنجیرە..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:border-red-600 transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <div className="mt-10 flex flex-wrap gap-3" dir="rtl">
            <div className="flex items-center gap-3 ml-4 bg-white/5 px-4 py-2 rounded-xl text-zinc-500">
              <SlidersHorizontal size={14} />
              <span className="text-[10px] font-black uppercase">جۆرەکان:</span>
            </div>
            {genreList.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGenre(g.title)}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all border ${
                  selectedGenre === g.title 
                  ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20' 
                  : 'bg-white/5 border-white/10 text-zinc-500 hover:border-red-600/50 hover:text-white'
                }`}
              >
                {g.title}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-zinc-500 font-bold text-sm">تکایە چاوەڕێ بکە...</p>
          </div>
        ) : filteredSeries.length > 0 ? (
          <MovieGrid 
            title="" 
            movies={filteredSeries} 
            isSeries={true}
            onSelect={handleMovieSelect}
          />
        ) : (
          <div className="py-40 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-700">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-black mb-2">هیچ زنجیرەیەک نەدۆزرایەوە</h3>
            <p className="text-zinc-500 font-medium">هیچ ئەنجامێک بۆ گەڕانەکەت نییە</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SeriesPage;
