import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-10 px-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center bg-[#050505]">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="text-red-600 font-black text-xl tracking-tighter">KURDFLIX</div>
        <p className="text-gray-600 text-[10px] uppercase tracking-widest font-bold">
          © {new Date().getFullYear()} کوردفلێکس - هەموو مافەکان پارێزراوە
        </p>
      </div>
      <div className="flex items-center gap-8 mt-6 md:mt-0">
        <div className="flex gap-6 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
          <a href="#" className="hover:text-white transition-colors">بارودۆخی بەکارهێنان</a>
          <a href="#" className="hover:text-white transition-colors">پاراستنی نهێنی</a>
          <a href="#" className="hover:text-white transition-colors">هاوکاری</a>
        </div>
      </div>
    </footer>
  );
}
