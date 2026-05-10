import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User,
  updateProfile 
} from 'firebase/auth';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  addDoc as firestoreAddDoc,
  serverTimestamp,
  getDocFromServer,
  increment,
  updateDoc,
  Firestore
} from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

interface AuthContextType {
  user: User | { displayName: string | null; email: string | null; photoURL: string | null; uid: string } | null;
  loading: boolean;
  myList: any[];
  reviews: any[];
  watchlists: any[];
  viewingHistory: any[];
  addToMyList: (movie: any) => Promise<void>;
  removeFromMyList: (movieId: string) => Promise<void>;
  createWatchlist: (name: string) => Promise<void>;
  deleteWatchlist: (watchlistId: string) => Promise<void>;
  addToWatchlist: (watchlistId: string, movie: any) => Promise<void>;
  removeFromWatchlist: (watchlistId: string, movieId: string) => Promise<void>;
  addToHistory: (movie: any, progress?: number) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL: string) => Promise<void>;
  addReview: (review: any) => Promise<void>;
  incrementMovieView: (movieId: string, isSeries?: boolean) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (name: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import firebaseConfig from '../../firebase-applet-config.json';

// Define a placeholder config
let app: FirebaseApp | null = null;
let auth: any = null;
let db: Firestore | null = null;

const setupFirebase = async () => {
  if (app && auth && db) return { app, auth, db };
  
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

    // Validate connection
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
       // Ignore connection errors during setup, but log them
       if(error instanceof Error && error.message.includes('the client is offline')) {
         console.error("Please check your Firebase configuration.");
       }
    }

    return { app, auth, db };
  } catch (e) {
    console.warn('Firebase config error:', e);
    return { app: null, auth: null, db: null };
  }
};

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null, firebaseAuth: any) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: firebaseAuth?.currentUser?.uid,
      email: firebaseAuth?.currentUser?.email,
      emailVerified: firebaseAuth?.currentUser?.emailVerified,
      isAnonymous: firebaseAuth?.currentUser?.isAnonymous,
      tenantId: firebaseAuth?.currentUser?.tenantId,
      providerInfo: firebaseAuth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [myList, setMyList] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [watchlists, setWatchlists] = useState<any[]>([]);
  const [viewingHistory, setViewingHistory] = useState<any[]>([]);

  useEffect(() => {
    let unsubscribeAuth: any = null;
    let unsubscribeList: any = null;
    let unsubscribeReviews: any = null;
    let unsubscribeWatchlists: any = null;
    let unsubscribeHistory: any = null;

    const init = async () => {
      const { auth: firebaseAuth, db: firestoreDb } = await setupFirebase();
      
      // Manual user as fallback if Firebase is not ready or used
      const savedUser = localStorage.getItem('manual_user');
      if (savedUser && !user) {
        setUser(JSON.parse(savedUser));
        setLoading(false);
      }

      if (!firebaseAuth || !firestoreDb) {
        setLoading(false);
        // Fallback to local storage for local users
        const savedList = localStorage.getItem('my_list');
        if (savedList) setMyList(JSON.parse(savedList));
        const savedReviewLocal = localStorage.getItem('movie_reviews');
        if (savedReviewLocal) setReviews(JSON.parse(savedReviewLocal));
        return;
      }

      unsubscribeAuth = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          
          // Setup User Profile listener in Firestore
          const profilePath = `users/${firebaseUser.uid}/profile/data`;
          
          // CRITICAL: First check if profile already exists in Firestore 
          // before writing default Auth data to prevent overwriting custom large photos
          try {
            const profileSnap = await getDocFromServer(doc(firestoreDb, profilePath));
            if (!profileSnap.exists()) {
              // Only create if it doesn't exist
              await setDoc(doc(firestoreDb, profilePath), {
                displayName: firebaseUser.displayName || '',
                photoURL: firebaseUser.photoURL || '',
              });
            }
          } catch (e) {
            console.error('Initial profile check failed', e);
          }

          // Listen to profile changes (to get the large photoURL and latest name)
          const unsubscribeProfile = onSnapshot(doc(firestoreDb, profilePath), (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              setUser((prev: any) => {
                if (!prev) return { ...firebaseUser, ...data };
                return {
                  ...prev,
                  displayName: data.displayName || prev?.displayName || firebaseUser.displayName,
                  photoURL: data.photoURL || prev?.photoURL || firebaseUser.photoURL
                };
              });
            }
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, profilePath, firebaseAuth);
          });

          // Set role for Owner if email matches
          if (firebaseUser.email === 'taniyahpftmccormick93943@gmail.com') {
            setDoc(doc(firestoreDb, `users/${firebaseUser.uid}`), {
              role: 'Owner',
              status: 'Active',
              name: firebaseUser.displayName,
              email: firebaseUser.email
            }, { merge: true }).catch(e => console.error('Error setting owner role', e));
          }

          // Listen to user metadata (role, status, subscription)
          const metaPath = `users/${firebaseUser.uid}`;
          const unsubscribeMeta = onSnapshot(doc(firestoreDb, metaPath), (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              setUser((prev: any) => ({
                ...prev,
                role: data.role || 'User',
                status: data.status || 'Active',
                subscriptionPlan: data.subscriptionPlan || 'none',
                subscriptionExpiry: data.subscriptionExpiry || null
              }));
            }
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, metaPath, firebaseAuth);
          });

          const privatePath = `users/${firebaseUser.uid}/private/info`;
          setDoc(doc(firestoreDb, privatePath), {
            email: firebaseUser.email,
          }, { merge: true }).catch(err => console.error('Error saving private info', err));

          // Listen to My List
          const listPath = `users/${firebaseUser.uid}/myList`;
          unsubscribeList = onSnapshot(collection(firestoreDb, listPath), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMyList(list);
          }, (error) => {
            handleFirestoreError(error, OperationType.LIST, listPath, firebaseAuth);
          });

          // Listen to Watchlists
          const watchlistsPath = `users/${firebaseUser.uid}/watchlists`;
          unsubscribeWatchlists = onSnapshot(collection(firestoreDb, watchlistsPath), (snapshot) => {
            const lists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setWatchlists(lists);
          }, (error) => {
            handleFirestoreError(error, OperationType.LIST, watchlistsPath, firebaseAuth);
          });

          // Listen to History
          const historyPath = `users/${firebaseUser.uid}/history`;
          unsubscribeHistory = onSnapshot(collection(firestoreDb, historyPath), (snapshot) => {
            const hist = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setViewingHistory(hist);
          }, (error) => {
            handleFirestoreError(error, OperationType.LIST, historyPath, firebaseAuth);
          });

        } else {
          const currentManual = localStorage.getItem('manual_user');
          if (!currentManual) {
            setUser(null);
            setMyList([]);
            setWatchlists([]);
            setViewingHistory([]);
          }
        }
        setLoading(false);
      });

      // Global Reviews Listen (only most recent 50)
      const reviewsPath = 'reviews';
      unsubscribeReviews = onSnapshot(collection(firestoreDb, reviewsPath), (snapshot) => {
        const revs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReviews(revs.sort((a: any, b: any) => {
           const timeA = a.createdAt?.seconds || 0;
           const timeB = b.createdAt?.seconds || 0;
           return timeB - timeA;
        }));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, reviewsPath, firebaseAuth);
      });
    };

    init();

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeList) unsubscribeList();
      if (unsubscribeReviews) unsubscribeReviews();
      if (unsubscribeWatchlists) unsubscribeWatchlists();
      if (unsubscribeHistory) unsubscribeHistory();
    };
  }, []);

  const incrementMovieView = async (movieId: string, isSeries: boolean = false) => {
    const { db: firestoreDb } = await setupFirebase();
    if (firestoreDb) {
      const collectionName = isSeries ? 'series' : 'movies';
      const statsPath = `${collectionName}/${movieId}/stats/data`;
      try {
        const statsRef = doc(firestoreDb, statsPath);
        const statsSnap = await getDocFromServer(statsRef);
        if (statsSnap.exists()) {
          await updateDoc(statsRef, {
            viewCount: increment(1)
          });
        } else {
          // Initialize if it doesn't exist
          await setDoc(doc(firestoreDb, statsPath), {
            viewCount: 13728
          });
        }
      } catch (error) {
        console.error('Error incrementing view count', error);
      }
    }
  };

  const loginWithGoogle = async () => {
    const { auth: firebaseAuth } = await setupFirebase();
    if (!firebaseAuth) {
      alert('بەستەری فایەربەیس ئامادە نییە. تکایە سەرەتا فایەربەیس چالاک بکە.');
      return;
    }
    localStorage.removeItem('manual_user');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(firebaseAuth, provider);
    } catch (error) {
      console.error('Error logging in with Google:', error);
      throw error;
    }
  };

  const loginWithEmail = async (name: string, email: string, isSignup: boolean = false) => {
    // Manual login still works as a local fallback or side-by-side
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const existingUser = registeredUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (isSignup) {
      if (existingUser) throw new Error('ئەم ئیمێڵە پێشتر بەکارهاتووە');
      const newUser = {
        displayName: name,
        email: email,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        uid: `manual_${Date.now()}`
      };
      const updatedUsers = [...registeredUsers, newUser];
      localStorage.setItem('registered_users', JSON.stringify(updatedUsers));
      localStorage.setItem('manual_user', JSON.stringify(newUser));
      setUser(newUser);
    } else {
      if (!existingUser) throw new Error('ئەم ئەکاونتە بوونی نییە، تکایە سەرەتا دروستی بکە');
      localStorage.setItem('manual_user', JSON.stringify(existingUser));
      setUser(existingUser);
    }
  };

  const logout = async () => {
    const { auth: firebaseAuth } = await setupFirebase();
    if (firebaseAuth) {
      try {
        await signOut(firebaseAuth);
      } catch (error) {
        console.error('Error logging out:', error);
      }
    }
    localStorage.removeItem('manual_user');
    setUser(null);
  };

  const addToMyList = async (movie: any) => {
    const { auth: firebaseAuth, db: firestoreDb } = await setupFirebase();
    if (firebaseAuth?.currentUser && firestoreDb) {
      const path = `users/${firebaseAuth.currentUser.uid}/myList/${movie.id}`;
      try {
        await setDoc(doc(firestoreDb, path), {
          id: movie.id,
          title: movie.title,
          imageUrl: movie.imageUrl,
          year: movie.year || 2026
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path, firebaseAuth);
      }
    } else {
      // Local fallback
      setMyList(prev => {
        if (prev.find(m => m.id === movie.id)) return prev;
        const newList = [...prev, movie];
        localStorage.setItem('my_list', JSON.stringify(newList));
        return newList;
      });
    }
  };

  const removeFromMyList = async (movieId: string) => {
    const { auth: firebaseAuth, db: firestoreDb } = await setupFirebase();
    if (firebaseAuth?.currentUser && firestoreDb) {
      const path = `users/${firebaseAuth.currentUser.uid}/myList/${movieId}`;
      try {
        await deleteDoc(doc(firestoreDb, path));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path, firebaseAuth);
      }
    } else {
      // Local fallback
      setMyList(prev => {
        const newList = prev.filter(m => m.id !== movieId);
        localStorage.setItem('my_list', JSON.stringify(newList));
        return newList;
      });
    }
  };

  const addReview = async (reviewData: { movieId: string; rating: number; comment: string }) => {
    if (!user) throw new Error('تکایە سەرەتا بچۆ ژوورەوە بۆ نوسینی ڕا');
    
    const { auth: firebaseAuth, db: firestoreDb } = await setupFirebase();
    if (firebaseAuth?.currentUser && firestoreDb) {
      const path = 'reviews';
      try {
        await firestoreAddDoc(collection(firestoreDb, path), {
          movieId: reviewData.movieId,
          userId: firebaseAuth.currentUser.uid,
          userName: firebaseAuth.currentUser.displayName || 'بەکارهێنەر',
          userPhoto: firebaseAuth.currentUser.photoURL,
          rating: reviewData.rating,
          comment: reviewData.comment,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path, firebaseAuth);
      }
    } else {
      // Local fallback
      const newReview = {
        ...reviewData,
        id: `rev_${Date.now()}`,
        userId: user.uid,
        userName: (user as any).displayName || 'بەکارهێنەر',
        userPhoto: (user as any).photoURL,
        createdAt: new Date().toISOString()
      };

      setReviews(prev => {
        const newList = [newReview, ...prev];
        localStorage.setItem('movie_reviews', JSON.stringify(newList));
        return newList;
      });
    }
  };

  const createWatchlist = async (name: string) => {
    const { auth: firebaseAuth, db: firestoreDb } = await setupFirebase();
    if (firebaseAuth?.currentUser && firestoreDb) {
      const path = `users/${firebaseAuth.currentUser.uid}/watchlists`;
      try {
        await firestoreAddDoc(collection(firestoreDb, path), {
          name,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path, firebaseAuth);
      }
    }
  };

  const deleteWatchlist = async (watchlistId: string) => {
    const { auth: firebaseAuth, db: firestoreDb } = await setupFirebase();
    if (firebaseAuth?.currentUser && firestoreDb) {
      const path = `users/${firebaseAuth.currentUser.uid}/watchlists/${watchlistId}`;
      try {
        await deleteDoc(doc(firestoreDb, path));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path, firebaseAuth);
      }
    }
  };

  const addToWatchlist = async (watchlistId: string, movie: any) => {
    const { auth: firebaseAuth, db: firestoreDb } = await setupFirebase();
    if (firebaseAuth?.currentUser && firestoreDb) {
      const path = `users/${firebaseAuth.currentUser.uid}/watchlists/${watchlistId}/movies/${movie.id}`;
      try {
        await setDoc(doc(firestoreDb, path), {
          id: movie.id,
          title: movie.title,
          imageUrl: movie.imageUrl,
          year: movie.year || 2026
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path, firebaseAuth);
      }
    }
  };

  const removeFromWatchlist = async (watchlistId: string, movieId: string) => {
    const { auth: firebaseAuth, db: firestoreDb } = await setupFirebase();
    if (firebaseAuth?.currentUser && firestoreDb) {
      const path = `users/${firebaseAuth.currentUser.uid}/watchlists/${watchlistId}/movies/${movieId}`;
      try {
        await deleteDoc(doc(firestoreDb, path));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path, firebaseAuth);
      }
    }
  };

  const addToHistory = async (movie: any, progress: number = 0) => {
    const { auth: firebaseAuth, db: firestoreDb } = await setupFirebase();
    if (firebaseAuth?.currentUser && firestoreDb) {
      const path = `users/${firebaseAuth.currentUser.uid}/history/${movie.id}`;
      try {
        await setDoc(doc(firestoreDb, path), {
          movieId: movie.id,
          movieTitle: movie.title,
          movieImage: movie.imageUrl,
          lastWatched: serverTimestamp(),
          progress
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path, firebaseAuth);
      }
    }
  };

  const updateUserProfile = async (displayName: string, photoURL: string) => {
    const { auth: firebaseAuth, db: firestoreDb } = await setupFirebase();
    if (firebaseAuth?.currentUser && firestoreDb) {
      try {
        // Update Firebase Auth - only update photoURL if it's NOT a large data URL
        // Firebase Auth has a ~2KB limit for photoURL
        const isDataUrl = photoURL.startsWith('data:');
        
        await updateProfile(firebaseAuth.currentUser, { 
          displayName,
          photoURL: isDataUrl ? (firebaseAuth.currentUser.photoURL || '') : photoURL
        });
        
        // Update Firestore Profile (Firestore allows up to 1MB per document)
        const profilePath = `users/${firebaseAuth.currentUser.uid}/profile/data`;
        await setDoc(doc(firestoreDb, profilePath), {
          displayName,
          photoURL,
        }, { merge: true });

        // Update local state by forcing a manual set with the new data
        setUser((prev: any) => ({
          ...prev,
          displayName,
          photoURL
        }));
      } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      myList, 
      reviews, 
      watchlists, 
      viewingHistory, 
      addToMyList, 
      removeFromMyList, 
      createWatchlist,
      deleteWatchlist,
      addToWatchlist,
      removeFromWatchlist,
      addToHistory,
      incrementMovieView,
      updateUserProfile,
      addReview, 
      loginWithGoogle, 
      loginWithEmail, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
