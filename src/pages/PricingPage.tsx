import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Send, Sparkles, Zap, Shield, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import firebaseConfig from '../../firebase-applet-config.json';
import { AppSettings } from '../types';

export default function PricingPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        let app;
        if (getApps().length === 0) {
          app = initializeApp(firebaseConfig);
        } else {
          app = getApps()[0];
        }
        const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
        const docRef = doc(db, 'settings', 'app');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setSettings(docSnap.data() as AppSettings);
        } else {
          // Fallback defaults
          setSettings({
            telegramLink: 'https://t.me/mov_hd_0',
            plan_1day: 2000,
            plan_1month: 5000,
            plan_3months: 12000,
            plan_6months: 20000,
            plan_1year: 35000
          });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const plans = [
    {
      id: '1day',
      name: '١ ڕۆژ',
      price: settings?.plan_1day || 2000,
      icon: <Clock className="text-zinc-400" />,
      features: ['سەیکردنی هەموو فیلمەکان', 'یەک سێرڤەری خێرا', 'بێ ڕیکلام', 'کوالیتی FHD']
    },
    {
      id: '1month',
      name: '١ مانگ',
      price: settings?.plan_1month || 5000,
      icon: <Zap className="text-blue-500" />,
      features: ['سەیکردنی هەموو فیلمەکان', 'هەموو سێرڤەرەکان', 'بێ ڕیکلام', 'کوالیتی 4K', 'داگرتنی فیلم']
    },
    {
      id: '3months',
      name: '٣ مانگ',
      price: settings?.plan_3months || 12000,
      icon: <Shield className="text-green-500" />,
      features: ['سەیکردنی هەموو فیلمەکان', 'هەموو سێرڤەرەکان', 'بێ ڕیکلام', 'کوالیتی 4K', 'داگرتنی فیلم', 'پشتیوانی خێرا']
    },
    {
      id: '6months',
      name: '٦ مانگ',
      price: settings?.plan_6months || 20000,
      icon: <Shield className="text-purple-500" />,
      features: ['سەیکردنی هەموو فیلمەکان', 'هەموو سێرڤەرەکان', 'بێ ڕیکلام', 'کوالیتی 4K', 'داگرتنی فیلم', 'پشتیوانی ٢٤ کاتژمێر']
    },
    {
      id: '1year',
      name: '١ ساڵ',
      price: settings?.plan_1year || 35000,
      icon: <Sparkles className="text-yellow-500" />,
      isBestValue: true,
      features: ['هەموو تایبەتمەندییەکان', 'نرخی گونجاوتر', 'ئیمتیازاتی تایبەت', 'ئەوەی بۆ داهاتوو دێت']
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 font-sans relative" dir="rtl">
      {/* Back Button */}
      <Link 
        to="/" 
        className="fixed top-8 right-8 z-50 bg-white/10 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full flex items-center gap-3 font-black text-sm hover:bg-white/20 transition-all group shadow-2xl"
      >
        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        <span>گەڕانەوە بۆ سەرەتا</span>
      </Link>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tight"
          >
            باشترین پلان <span className="text-red-600">هەڵبژێرە</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-500 font-bold max-w-2xl mx-auto"
          >
            بۆ بینینی باشترین و نوێترین فیلمەکان بەبێ ڕیکلام و بەرزترین کوالیتی، یەکێک لەم پلانانە هەڵبژێرە و لەگەڵمان بەردەوام بە.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className={`relative p-8 rounded-[32px] border transition-all ${
                plan.isBestValue 
                ? 'bg-red-600/5 border-red-600 shadow-[0_20px_50px_rgba(220,38,38,0.15)]环' 
                : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              {plan.isBestValue && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/40">
                  باشترین نرخ
                </div>
              )}

              <div className="mb-8">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                  {React.cloneElement(plan.icon as React.ReactElement, { size: 30 })}
                </div>
                <h3 className="text-xl font-black mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{plan.price.toLocaleString()}</span>
                  <span className="text-xs font-bold text-zinc-500 uppercase">IQD</span>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-bold text-zinc-400">
                    <div className="w-5 h-5 rounded-full bg-red-600/10 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-red-500" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <a 
                href={settings?.telegramLink || 'https://t.me/mov_hd_0'}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-sm transition-all ${
                  plan.isBestValue 
                  ? 'bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/30' 
                  : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <Send size={18} />
                ئێستا بەشداربە
              </a>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 p-10 rounded-[40px] bg-white/5 border border-white/10 text-center">
            <h2 className="text-2xl font-black mb-4">پێویستت بە هاوکارییە؟</h2>
            <p className="text-zinc-500 font-bold mb-8 max-w-xl mx-auto">
                ئەگەر هەر پرسیارێکی ترت هەیە یان دەتەوێت بە شێوەیەکی تر پارە بدەیت، پەیوەندیمان پێوە بکە لە ڕێگەی تەلەگرامەوە.
            </p>
            <a 
                href={settings?.telegramLink || 'https://t.me/mov_hd_0'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-10 py-4 bg-white text-black rounded-2xl font-black transition-transform hover:scale-105"
            >
                <Send size={20} />
                پەیوەندیمان پێوە بکە
            </a>
        </div>
      </div>
    </div>
  );
}
