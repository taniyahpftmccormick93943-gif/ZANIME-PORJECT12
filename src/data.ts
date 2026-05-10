import { Movie, Category } from './types';

export const FEATURED_MOVIE: Movie = {
  id: 'f1',
  title: 'جۆکەر: کاتژمێری شێتی',
  description: 'ئارتەر فلێک چاوەڕێی دادگایی کردنی دەکات، بەڵام لەوێدا لی کوینزی دەبینێت و هەموو شتێک دەگۆڕێت بە ڕیتمێکی موزیکیی شێتانە.',
  year: 2024,
  rating: 8.5,
  duration: '2h 18m',
  genre: ['دراما', 'تاوان', 'موزیکی'],
  imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1000',
  backdropUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=2000',
};

export const MOCK_MOVIES: Movie[] = [
  {
    id: '1',
    title: 'دەنکە خۆڵ',
    description: 'چیرۆکی نەوەیەکی نوێی پاڵەوانەکان...',
    year: 2021,
    rating: 8.2,
    duration: '2h 35m',
    genre: ['ئەکشن', 'سای-فای'],
    imageUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=500',
    backdropUrl: '',
    isTrending: true,
  },
  {
    id: '2',
    title: 'باتمان',
    description: 'بە دوای ڕاستیدا دەگەڕێت لە گۆسەم...',
    year: 2022,
    rating: 7.9,
    duration: '2h 56m',
    genre: ['تاوان', 'دراما'],
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=500',
    backdropUrl: '',
    isTrending: true,
  },
  {
    id: '3',
    title: 'هێڵە سوورەکە',
    description: 'جەنگێک کە هەموو مرۆڤایەتی دەگۆڕێت...',
    year: 2023,
    rating: 9.1,
    duration: '2h 10m',
    genre: ['جەنگی', 'مێژوویی'],
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=500',
    backdropUrl: '',
    isNew: true,
  },
  {
    id: '4',
    title: 'ماتریکس',
    description: 'ئایا ڕاستی چییە؟',
    year: 1999,
    rating: 8.7,
    duration: '2h 16m',
    genre: ['ئەکشن', 'سای-فای'],
    imageUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=500',
    backdropUrl: '',
  },
  {
    id: '5',
    title: 'ژیانی شێرزاد',
    description: 'خەونێک کە دەبێتە ڕاستی...',
    year: 2024,
    rating: 7.5,
    duration: '1h 45m',
    genre: ['کۆمیدی', 'دراما'],
    imageUrl: 'https://images.unsplash.com/photo-1542204172-3c1f0aed409f?auto=format&fit=crop&q=80&w=500',
    backdropUrl: '',
    isNew: true,
  },
  {
    id: '6',
    title: 'بەناو تەمدا',
    description: 'ترسێک کە هیچ کەس نایزانێت...',
    year: 2023,
    rating: 6.8,
    duration: '1h 30m',
    genre: ['ترسناک', 'نهێنی'],
    imageUrl: 'https://images.unsplash.com/photo-1505775561242-727b7fba20f0?auto=format&fit=crop&q=80&w=500',
    backdropUrl: '',
  }
];

export const TRENDING_MOVIES = MOCK_MOVIES.filter(m => m.isTrending);
export const NEW_MOVIES = MOCK_MOVIES.filter(m => m.isNew);
export const POPULAR_SERIES = MOCK_MOVIES.slice(0, 4);

export const CATEGORIES: Category[] = [
  { id: 'cat1', name: 'ئەکشن', movies: MOCK_MOVIES.slice(0, 5) },
  { id: 'cat2', name: 'ترسناک', movies: MOCK_MOVIES.slice(1, 6) },
  { id: 'cat3', name: 'دراما', movies: MOCK_MOVIES.slice(2, 4) },
  { id: 'cat4', name: 'سای-فای', movies: MOCK_MOVIES.slice(0, 3) },
];
