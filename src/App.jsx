import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { createClient } from '@supabase/supabase-js';
import Groq from "groq-sdk";
import { 
  Search, Bell, User, Play, Star, 
  Instagram, Send, Facebook, ChevronRight, ChevronLeft,
  Settings, LogIn, X, LogOut, CheckCircle, AlertCircle, Film, Info
} from 'lucide-react';

// Supabase va Groq sozlamalari
const supabase = createClient(
  'https://rxynseqxmfjjindbttdt.supabase.co', 
  'sb_publishable_C4oGHcS1aTQcaZ87PbQQLw_M7JSCNoz'
);

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

const App = () => {
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [carousels, setCarousels] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categorized, setCategorized] = useState({ yangi: [], mashhur: [], top: [], tavsiya: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [allAnime, setAllAnime] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('animeyUser')) || null);
  const [authForm, setAuthForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [notification, setNotification] = useState({ show: false, msg: '', type: 'success' });

  // Refs for scrolling
  const scrollRefs = useRef({});

  useEffect(() => {
    fetchAllData();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (carousels.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carousels.length);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [carousels]);

  const notify = (msg, type = 'success') => {
    setNotification({ show: true, msg, type });
    setTimeout(() => setNotification({ show: false, msg: '', type: 'success' }), 4000);
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(10);
      setNotifications(data || []);
    } catch (err) { console.error(err); }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const { data: carData } = await supabase
        .from('carousel_list')
        .select('*, anime_list(*)')
        .order('created_at', { ascending: false });
      
      setCarousels(carData || []);

      const { data: animData, error: animErr } = await supabase.from('anime_list').select('*');
      if (animErr) throw animErr;
      
      setAllAnime(animData || []);

      if (animData && animData.length > 0) {
        try {
          setCategorized({
            yangi: animData.sort((a,b) => b.year - a.year).slice(0, 15),
            mashhur: animData.sort(() => 0.5 - Math.random()).slice(0, 15),
            top: animData.filter(a => a.rating > 8.0).slice(0, 15),
            tavsiya: animData.slice(0, 15)
          });
        } catch (aiErr) {
          console.error("AI xatosi:", aiErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const results = allAnime.filter(anime => 
        anime.title.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const { username, password, confirmPassword } = authForm;

    if (authMode === 'register') {
      if (password !== confirmPassword) return notify("Parollar mos kelmadi!", "error");
      const { data: checkUser } = await supabase.from('users_list').select('*').eq('username', username).single();
      if (checkUser) return notify("Bu username band!", "error");

      const role = (username === "Malika" && password === "123456") ? "admin" : "user";
      const { error } = await supabase.from('users_list').insert([{ username, password, role }]);
      
      if (!error) {
        const userData = { name: username, isAdmin: role === 'admin' };
        setUser(userData);
        localStorage.setItem('animeyUser', JSON.stringify(userData));
        setShowAuth(false);
        notify("Xush kelibsiz!");
      }
    } else {
      const { data: foundUser } = await supabase.from('users_list').select('*').eq('username', username).eq('password', password).single();
      if (foundUser) {
        const userData = { name: foundUser.username, isAdmin: foundUser.role === 'admin' };
        setUser(userData);
        localStorage.setItem('animeyUser', JSON.stringify(userData));
        setShowAuth(false);
        notify("Tizimga kirildi!");
      } else {
        notify("Username yoki parol noto'g'ri!", "error");
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('animeyUser');
    notify("Tizimdan chiqildi.");
  };

  const scrollRow = (category, direction) => {
    if (scrollRefs.current[category]) {
      const { current } = scrollRefs.current[category];
      const scrollAmount = direction === 'left' ? -500 : 500;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleAnimeClick = (id) => {
    navigate(`/anime/${id}`);
    setShowSearchModal(false);
  };

  // Touch handlers for mobile swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      // Swipe left
      setCurrentSlide((prev) => (prev + 1) % carousels.length);
    }
    if (touchStartX.current - touchEndX.current < -50) {
      // Swipe right
      setCurrentSlide((prev) => (prev - 1 + carousels.length) % carousels.length);
    }
  };

  return (
    <div className="app">
      {/* Toast Notification */}
      {notification.show && (
        <div className={`toast ${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header */}
      <header className="header glass-header">
        <div className="container header-flex">
          <div className="logo" onClick={() => navigate('/')}>
            ANIMEY<span>.UZ</span>
          </div>
          
          <div className="search-wrapper desktop-search">
            <Search size={18} className="s-icon" />
            <input 
              type="text" 
              placeholder="Anime qidirish..." 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowSearchModal(true)}
            />
          </div>

          <div className="header-actions">
            <button className="icon-btn mobile-search-btn" onClick={() => setShowSearchModal(true)}>
              <Search size={22} />
            </button>
            <button className="icon-btn" onClick={() => setShowNotifications(true)}>
              <Bell size={22} />
              {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
            </button>
            {user ? (
              <div className="user-control">
                <div className="avatar-circle">{user.name[0].toUpperCase()}</div>
                <button className="logout-btn" onClick={handleLogout}><LogOut size={18} /></button>
              </div>
            ) : (
              <button className="login-trigger" onClick={() => setShowAuth(true)}>
                <User size={20} /> <span className="desktop-only">Kirish</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Carousel - Mobile Responsive */}
      <section className="carousel-section">
        {loading ? (
          <div className="carousel-skeleton">
            <div className="skeleton-content">
              <div className="skeleton-line skeleton-title"></div>
              <div className="skeleton-line skeleton-desc"></div>
              <div className="skeleton-line skeleton-desc short"></div>
              <div className="skeleton-buttons">
                <div className="skeleton-btn"></div>
                <div className="skeleton-btn"></div>
              </div>
            </div>
          </div>
        ) : carousels.length > 0 ? (
          <div 
            className="carousel-wrapper"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {carousels.map((item, index) => (
              <div 
                key={item.id}
                className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
              >
                {/* Background Image (Blurred) */}
                <div className="carousel-bg">
                  <img src={item.image_url} alt="bg" />
                  <div className="bg-overlay"></div>
                </div>

                {/* Content */}
                <div className="carousel-content container">
                  <div className="carousel-info">
                    <div className="meta-tags">
                      <span className="quality-tag">HD</span>
                      <span className="rating-tag">⭐ {item.anime_list?.rating || 'N/A'}</span>
                      <span className="year-tag">{item.anime_list?.year || '2024'}</span>
                    </div>
                    <h1 className="title-animate">{item.anime_list?.title || 'Anime Title'}</h1>
                    <p className="desc-animate">
                      {item.anime_list?.description 
                        ? item.anime_list.description.slice(0, 150) + '...' 
                        : 'Anime tavsifi mavjud emas...'}
                    </p>
                    <div className="carousel-actions">
                      <button className="primary-btn" onClick={() => handleAnimeClick(item.anime_id)}>
                        <Play fill="currentColor" size={20} /> 
                        <span>Tomosha</span>
                      </button>
                      <button className="secondary-btn" onClick={() => handleAnimeClick(item.anime_id)}>
                        <Info size={20} /> 
                        <span>Batafsil</span>
                      </button>
                    </div>
                  </div>
                  <div className="carousel-poster">
                    <img src={item.image_url} alt={item.anime_list?.title} />
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              className="carousel-nav prev" 
              onClick={() => setCurrentSlide((prev) => (prev - 1 + carousels.length) % carousels.length)}
              aria-label="Previous slide"
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              className="carousel-nav next" 
              onClick={() => setCurrentSlide((prev) => (prev + 1) % carousels.length)}
              aria-label="Next slide"
            >
              <ChevronRight size={32} />
            </button>
            
            <div className="carousel-dots">
              {carousels.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`dot ${idx === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-carousel">
            <Film size={40} /> 
            <p>Karusel bo'sh</p>
          </div>
        )}
      </section>

      {/* Main Content - Horizontal Lists */}
      <main className="main-content">
        {Object.entries({
          "Yangi Qo'shilganlar": categorized.yangi,
          "Trenddagi Animelar": categorized.mashhur,
          "Eng Yuqori Reyting": categorized.top,
          "Tavsiya Etamiz": categorized.tavsiya
        }).map(([title, list]) => (
          list.length > 0 && (
            <section key={title} className="category-section">
              <div className="container">
                <div className="section-header">
                  <h2>{title}</h2>
                  <div className="section-controls">
                    <button onClick={() => scrollRow(title, 'left')} aria-label="Scroll left">
                      <ChevronLeft />
                    </button>
                    <button onClick={() => scrollRow(title, 'right')} aria-label="Scroll right">
                      <ChevronRight />
                    </button>
                  </div>
                </div>
              </div>
              
              <div 
                className="scroll-container" 
                ref={el => scrollRefs.current[title] = { current: el }}
              >
                {list.map((anime, i) => (
                  <div 
                    className="anime-card" 
                    key={`${anime.id}-${i}`}
                    onClick={() => handleAnimeClick(anime.id)}
                  >
                    <div className="card-image">
                      <img src={anime.image_url} alt={anime.title} loading="lazy" />
                      <div className="card-overlay">
                        <button className="play-circle" aria-label="Play">
                          <Play fill="white" size={24} />
                        </button>
                      </div>
                      <span className="card-rating">⭐ {anime.rating}</span>
                    </div>
                    <div className="card-info">
                      <h4>{anime.title}</h4>
                      <p>{anime.year} • Anime</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        ))}
      </main>

      {/* Search Modal */}
      {showSearchModal && (
        <div className="modal-overlay" onClick={() => setShowSearchModal(false)}>
          <div className="search-modal" onClick={e => e.stopPropagation()}>
            <div className="search-header">
              <Search size={24} className="search-icon-lg" />
              <input 
                type="text" 
                placeholder="Qidirayotgan anime nomini yozing..." 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
              />
              <button className="close-icon" onClick={() => setShowSearchModal(false)}>
                <X />
              </button>
            </div>
            <div className="search-body">
              {searchResults.length > 0 ? (
                <div className="search-grid">
                  {searchResults.map(anime => (
                    <div key={anime.id} className="search-card" onClick={() => handleAnimeClick(anime.id)}>
                      <img src={anime.image_url} alt={anime.title} />
                      <div className="search-info">
                        <h5>{anime.title}</h5>
                        <span>{anime.year}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <Search size={48} style={{ opacity: 0.3 }} />
                  <p>Natijalar topilmadi</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="modal-overlay" onClick={() => setShowNotifications(false)}>
          <div className="notification-panel" onClick={e => e.stopPropagation()}>
            <div className="panel-header">
              <h3>Bildirishnomalar</h3>
              <button onClick={() => setShowNotifications(false)}>
                <X />
              </button>
            </div>
            <div className="panel-list">
              {notifications.length === 0 ? (
                <p className="empty-msg">Bildirishnomalar yo'q</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="notif-item">
                    <div className="notif-icon-box">
                      <Bell size={16} />
                    </div>
                    <div>
                      <h4>{n.title}</h4>
                      <p>{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuth && (
        <div className="modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="auth-box" onClick={e => e.stopPropagation()}>
            <button className="close-abs" onClick={() => setShowAuth(false)}>
              <X />
            </button>
            <h2>{authMode === 'login' ? 'Kirish' : 'Ro\'yxatdan o\'tish'}</h2>
            <form onSubmit={handleAuth}>
              <div className="field">
                <input 
                  type="text" 
                  placeholder="Username" 
                  required 
                  onChange={(e) => setAuthForm({...authForm, username: e.target.value})} 
                />
              </div>
              <div className="field">
                <input 
                  type="password" 
                  placeholder="Parol" 
                  required 
                  onChange={(e) => setAuthForm({...authForm, password: e.target.value})} 
                />
              </div>
              {authMode === 'register' && (
                <div className="field">
                  <input 
                    type="password" 
                    placeholder="Parolni tasdiqlash" 
                    required 
                    onChange={(e) => setAuthForm({...authForm, confirmPassword: e.target.value})} 
                  />
                </div>
              )}
              <button type="submit" className="submit-btn">
                {authMode === 'login' ? 'Kirish' : 'Yaratish'}
              </button>
            </form>
            <p className="switch-auth" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
              {authMode === 'login' ? "Akkaunt yo'qmi? Yaratish" : "Akkaunt bormi? Kirish"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;