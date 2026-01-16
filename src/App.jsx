import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import Groq from "groq-sdk";
import {
  Search, Bell, User, Play,
  ChevronRight, ChevronLeft,
  X, LogOut, CheckCircle, AlertCircle, Film, Info,
  Facebook, Instagram, Twitter, Globe
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

  // ------------------------- CSS STYLES -------------------------
  const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --bg-dark: #0f1014;
  --bg-card: #181a20;
  --primary: #e50914; /* Netflix Red */
  --primary-hover: #b20710;
  --accent: #46d369;
  --text-main: #ffffff;
  --text-gray: #a3a3a3;
  --glass: rgba(15, 16, 20, 0.92);
  --glass-border: rgba(255, 255, 255, 0.08);
  --nav-height: 65px;
  --shadow: 0 10px 40px rgba(0,0,0,0.6);
  --radius: 16px;
}

* { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
html, body { height: 100%; width: 100%; }

body {
  font-family: 'Outfit', sans-serif;
  background: var(--bg-dark);
  color: var(--text-main);
  overflow-x: hidden;
  padding-top: var(--nav-height); /* Header fixed bo'lgani uchun joy tashlaymiz */
}

.container { max-width: 1440px; margin: 0 auto; padding: 0 24px; }

/* --- HEADER --- */
.header {
  position: fixed; top: 0; left: 0; width: 100%; height: var(--nav-height);
  z-index: 1000; background: var(--glass); backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--glass-border);
  display: flex; align-items: center; transition: background 0.3s;
}
.header-flex { display: flex; justify-content: space-between; align-items: center; width: 100%; }

.logo {
  font-size: 26px; font-weight: 900; letter-spacing: -0.5px; cursor: pointer;
  background: linear-gradient(90deg, #fff 0%, var(--primary) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  display: flex; align-items: center;
}
.logo span { font-size: 14px; font-weight: 600; margin-left: 2px; opacity: 0.8; -webkit-text-fill-color: #fff; }

.search-wrapper { position: relative; width: 360px; display: none; } /* Desktop search */
@media(min-width: 768px) { .search-wrapper { display: block; } }

.search-input {
  width: 100%; background: rgba(255,255,255,0.06); border: 1px solid transparent;
  padding: 10px 14px 10px 44px; border-radius: 99px; color: #fff; font-size: 14px;
  transition: 0.3s ease;
}
.search-input:focus {
  background: rgba(0,0,0,0.4); border-color: var(--primary); outline: none;
  box-shadow: 0 0 0 3px rgba(229, 9, 20, 0.2);
}
.s-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-gray); }

.header-actions { display: flex; gap: 10px; align-items: center; }
.icon-btn {
  background: transparent; border: none; color: #fff; cursor: pointer;
  padding: 8px; border-radius: 50%; transition: 0.2s; position: relative;
  display: flex; align-items: center; justify-content: center;
}
.icon-btn:hover { background: rgba(255,255,255,0.1); color: var(--primary); }
.badge {
  position: absolute; top: 2px; right: 2px; background: var(--primary);
  font-size: 9px; width: 14px; height: 14px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-weight: bold;
}

.login-btn {
  background: var(--primary); color: #fff; border: none;
  padding: 8px 20px; border-radius: 99px; font-weight: 700; font-size: 14px;
  cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 6px;
}
.login-btn:hover { background: var(--primary-hover); transform: translateY(-1px); box-shadow: 0 4px 15px rgba(229,9,20,0.4); }

.user-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), #ff6b6b);
  display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px;
}

/* --- CAROUSEL (Mobile Optimized) --- */
.carousel-section { position: relative; height: 85vh; width: 100%; overflow: hidden; margin-top: -var(--nav-height); }
.carousel-wrapper { position: relative; height: 100%; width: 100%; }

.carousel-slide {
  position: absolute; inset: 0; opacity: 0; visibility: hidden;
  transition: opacity 0.8s ease-in-out, visibility 0.8s;
}
.carousel-slide.active { opacity: 1; visibility: visible; }

.carousel-bg { position: absolute; inset: 0; z-index: 1; }
.carousel-bg img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.6); }
/* Mobile gradient overlay for text readability */
.bg-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, var(--bg-dark) 5%, rgba(15,16,20,0.8) 25%, transparent 60%);
}

.carousel-content {
  position: relative; z-index: 2; height: 100%;
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 60px;
}

.carousel-info { max-width: 600px; width: 100%; display: flex; flex-direction: column; justify-content: center; }

.meta-row { display: flex; gap: 10px; margin-bottom: 12px; font-size: 13px; font-weight: 700; align-items: center; }
.tag { padding: 2px 8px; border-radius: 4px; }
.tag-hd { background: #fff; color: #000; }
.tag-star { color: #ffd700; }
.tag-year { color: var(--text-gray); }

.hero-title {
  font-size: 56px; line-height: 1.1; font-weight: 900; margin-bottom: 16px;
  text-transform: uppercase; animation: fadeInUp 0.8s ease forwards;
}
.hero-desc {
  font-size: 16px; color: #ddd; line-height: 1.6; margin-bottom: 24px;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
  max-width: 500px;
}

.hero-actions { display: flex; gap: 14px; }
.btn-play {
  background: var(--primary); color: #fff; border: none; padding: 12px 32px;
  font-size: 16px; font-weight: 700; border-radius: 8px; cursor: pointer;
  display: flex; align-items: center; gap: 8px; transition: 0.2s;
}
.btn-play:hover { background: var(--primary-hover); transform: scale(1.02); }

.btn-info {
  background: rgba(255,255,255,0.2); color: #fff; border: none; padding: 12px 24px;
  font-size: 16px; font-weight: 700; border-radius: 8px; cursor: pointer;
  display: flex; align-items: center; gap: 8px; backdrop-filter: blur(4px); transition: 0.2s;
}
.btn-info:hover { background: rgba(255,255,255,0.3); }

.carousel-poster {
  width: 320px; height: 480px; border-radius: 12px; overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.6); transform: perspective(1000px) rotateY(-10deg);
  display: none; /* Mobileda yashiramiz */
}
@media(min-width: 1024px) { .carousel-poster { display: block; } }

.nav-btn {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);
  color: #fff; display: flex; align-items: center; justify-content: center;
  cursor: pointer; z-index: 10; transition: 0.2s;
}
.nav-btn:hover { background: var(--primary); border-color: var(--primary); }
.nav-prev { left: 24px; } .nav-next { right: 24px; }

/* --- LISTS & CARDS --- */
.category-section { margin-bottom: 40px; padding-top: 10px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-title { font-size: 22px; font-weight: 700; padding-left: 12px; border-left: 4px solid var(--primary); }

.scroll-container {
  display: flex; gap: 16px; overflow-x: auto; padding: 10px 4px 20px 4px;
  scroll-behavior: smooth; -webkit-overflow-scrolling: touch; scrollbar-width: none;
}
.scroll-container::-webkit-scrollbar { display: none; }

.anime-card {
  min-width: 160px; max-width: 160px; cursor: pointer; transition: transform 0.2s;
  position: relative;
}
.anime-card:hover { transform: translateY(-5px); }

.card-img-box {
  position: relative; height: 240px; border-radius: 12px; overflow: hidden;
  background: #222; border: 1px solid rgba(255,255,255,0.05);
}
.card-img-box img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
.anime-card:hover .card-img-box img { transform: scale(1.08); }

.card-overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.2s;
}
.anime-card:hover .card-overlay { opacity: 1; }

.card-content { margin-top: 8px; }
.card-title { font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-meta { font-size: 13px; color: var(--text-gray); margin-top: 2px; }

/* --- MODALS (UNIVERSAL & MOBILE FIXED) --- */
.modal-overlay {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; animation: fadeIn 0.2s forwards;
}

/* Modals Common Style */
.modal-box {
  background: var(--bg-card); width: 600px; max-width: 90%;
  border-radius: var(--radius); border: 1px solid var(--glass-border);
  box-shadow: var(--shadow); overflow: hidden; display: flex; flex-direction: column;
  max-height: 85vh; position: relative;
}

/* Mobile Bottom Sheet Animation */
@media (max-width: 768px) {
  .modal-overlay { align-items: flex-end; padding: 0; }
  .modal-box {
    width: 100%; max-width: 100%; border-radius: 24px 24px 0 0;
    max-height: 90vh; animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    border-bottom: none;
  }
}

/* Specific Modal Styles */
.search-modal-header { padding: 18px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; gap: 12px; align-items: center; }
.search-modal-input { flex: 1; background: transparent; border: none; font-size: 18px; color: #fff; outline: none; }
.search-results { padding: 18px; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; }

.notif-header { padding: 18px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
.notif-list { padding: 0; overflow-y: auto; }
.notif-item { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; gap: 12px; }
.notif-item:last-child { border: none; }
.notif-icon { width: 40px; height: 40px; border-radius: 50%; background: rgba(229,9,20,0.15); color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

.auth-form { padding: 30px; display: flex; flex-direction: column; gap: 16px; }
.auth-input { width: 100%; padding: 14px; background: #262a34; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; outline: none; }
.auth-input:focus { border-color: var(--primary); }

/* --- FOOTER --- */
.footer { background: #0b0c0f; padding: 50px 0 20px; margin-top: 60px; border-top: 1px solid var(--glass-border); }
.footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 40px; margin-bottom: 40px; }
.f-col h4 { font-size: 16px; color: #fff; margin-bottom: 20px; font-weight: 700; }
.f-link { display: block; color: var(--text-gray); margin-bottom: 12px; text-decoration: none; transition: 0.2s; font-size: 14px; cursor: pointer; }
.f-link:hover { color: var(--primary); transform: translateX(4px); }
.socials { display: flex; gap: 16px; margin-top: 20px; }
.social-icon { color: #fff; opacity: 0.7; transition: 0.2s; cursor: pointer; }
.social-icon:hover { opacity: 1; color: var(--primary); }
.copyright { text-align: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; color: #666; font-size: 13px; }

/* --- TOAST --- */
.toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: #222; color: #fff; padding: 12px 24px; border-radius: 50px;
  display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  z-index: 3000; animation: slideUpToast 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(255,255,255,0.1);
}
.toast-success { color: var(--accent); } .toast-error { color: var(--primary); }

/* --- ANIMATIONS --- */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes slideUpToast { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* --- RESPONSIVE TWEAKS --- */
@media (max-width: 768px) {
  .logo { font-size: 22px; }
  .carousel-info { text-align: center; align-items: center; padding: 0 20px; margin-top: auto; margin-bottom: 60px; }
  .hero-title { font-size: 32px; margin-bottom: 10px; }
  .hero-desc { font-size: 14px; -webkit-line-clamp: 2; margin-bottom: 20px; }
  .nav-btn { display: none; } /* Mobileda tugmasiz swipe bo'ladi */
  .anime-card { min-width: 130px; max-width: 130px; }
  .card-img-box { height: 190px; }
  .footer-grid { grid-template-columns: 1fr; gap: 30px; text-align: center; }
  .socials { justify-content: center; }
  .f-link:hover { transform: none; color: var(--primary); }
}
  `;

  // ------------------------- STATES -------------------------
  const [loading, setLoading] = useState(true);
  const [carousels, setCarousels] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Kategoriya ma'lumotlari
  const [dramaList, setDramaList] = useState([]);
  
  // Qidiruv va Modallar
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  
  // User Auth
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('mochitvUser')) || null);
  const [authForm, setAuthForm] = useState({ username: '', password: '', confirmPassword: '' });

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  // Refs
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // ------------------------- HELPERS -------------------------
  const notify = useCallback((msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
  }, []);

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  // ------------------------- FETCH DATA -------------------------
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Karusel uchun
      const { data: carData } = await supabase
        .from('carousel_list')
        .select('*, anime_list(*)')
        .order('created_at', { ascending: false });
      
      if (carData) setCarousels(carData);

      // 2. Dramalar ro'yxati
      const { data: allData } = await supabase.from('anime_list').select('*');
      
      if (allData) {
        // Faqat "Drama" janridagilarni olamiz
        const dramas = allData.filter(a => {
          const g = (a.genre || a.genres || '').toLowerCase();
          const t = (a.type || '').toLowerCase();
          return g.includes('drama') || t === 'drama';
        });
        setDramaList(dramas);
      }
      
      // 3. Bildirishnomalar
      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (notifData) setNotifications(notifData);

    } catch (error) {
      console.error("Error fetching data:", error);
      notify("Internet bilan aloqa yo'q!", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Karusel avto-aylanishi
  useEffect(() => {
    if (carousels.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % carousels.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [carousels.length]);

  // Body scroll lock modal ochilganda
  useEffect(() => {
    document.body.style.overflow = (showSearchModal || showNotifications || showAuth) ? 'hidden' : '';
  }, [showSearchModal, showNotifications, showAuth]);

  // ------------------------- HANDLERS -------------------------
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const lowerQ = query.toLowerCase();
    const results = dramaList.filter(d => d.title?.toLowerCase().includes(lowerQ));
    setSearchResults(results);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const { username, password, confirmPassword } = authForm;
    
    if (!username || !password) return notify("Barcha maydonlarni to'ldiring", "error");

    if (authMode === 'register') {
      if (password !== confirmPassword) return notify("Parollar mos kelmadi", "error");
      // Oddiy register logic (real loyihada Supabase Auth ishlating)
      const userData = { name: username, role: 'user' };
      setUser(userData);
      localStorage.setItem('mochitvUser', JSON.stringify(userData));
      setShowAuth(false);
      notify(`Xush kelibsiz, ${username}!`);
    } else {
      // Login logic simulation
      if (username.length > 2) {
        const userData = { name: username, role: 'user' };
        setUser(userData);
        localStorage.setItem('mochitvUser', JSON.stringify(userData));
        setShowAuth(false);
        notify("Tizimga muvaffaqiyatli kirildi");
      } else {
        notify("Login yoki parol xato", "error");
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mochitvUser');
    notify("Tizimdan chiqildi");
  };

  const handleDramaClick = (id) => {
    setShowSearchModal(false);
    navigate(`/anime/${id}`);
  };

  // Swipe logic for Carousel
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setCurrentSlide(prev => (prev + 1) % carousels.length); // Next
      else setCurrentSlide(prev => (prev - 1 + carousels.length) % carousels.length); // Prev
    }
  };

  // Har xil rowlar uchun ma'lumotni bo'lish (Duplicate bo'lmasligi uchun)
  // Real loyihada bular backenddan alohida kategoriya bo'lib kelishi kerak
  const newDramas = dramaList.slice(0, 10);
  const trendingDramas = dramaList.slice(10, 20);
  const topRatedDramas = [...dramaList].sort((a,b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);

  return (
    <div className="app">
      <style>{CSS}</style>

      {/* --- TOAST --- */}
      {toast.show && (
        <div className="toast">
          {toast.type === 'success' ? <CheckCircle size={20} className="toast-success"/> : <AlertCircle size={20} className="toast-error"/>}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="header">
        <div className="container header-flex">
          <div className="logo" onClick={() => navigate('/')}>
            MOCHITV<span>.UZ</span>
          </div>

          <div className="search-wrapper">
            <Search size={18} className="s-icon" />
            <input 
              className="search-input" 
              placeholder="Drama, kino, serial qidirish..." 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowSearchModal(true)}
            />
          </div>

          <div className="header-actions">
            <button className="icon-btn" onClick={() => setShowSearchModal(true)}>
              <Search size={22} />
            </button>
            <button className="icon-btn" onClick={() => setShowNotifications(true)}>
              <Bell size={22} />
              {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
            </button>
            
            {user ? (
              <div className="icon-btn" onClick={handleLogout} title="Chiqish">
                <div className="user-avatar">{user.name[0].toUpperCase()}</div>
              </div>
            ) : (
              <button className="login-btn" onClick={() => setShowAuth(true)}>
                <User size={18} /> Kirish
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- CAROUSEL --- */}
      <section className="carousel-section" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {loading ? (
          <div style={{height:'100%', display:'flex', justifyContent:'center', alignItems:'center', color:'#555'}}>Yuklanmoqda...</div>
        ) : carousels.map((item, index) => (
          <div key={item.id} className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}>
            <div className="carousel-bg">
              <img src={item.image_url} alt="bg" />
              <div className="bg-overlay"></div>
            </div>

            <div className="carousel-content container">
              <div className="carousel-info">
                <div className="meta-row">
                  <span className="tag tag-hd">HD</span>
                  <span className="tag tag-star">⭐ {item.anime_list?.rating || '7.5'}</span>
                  <span className="tag tag-year">{item.anime_list?.year || '2024'}</span>
                  <span className="tag">Drama</span>
                </div>
                
                <h1 className="hero-title">{item.anime_list?.title || 'Unknown Title'}</h1>
                <p className="hero-desc">
                  {item.anime_list?.description || "Ushbu drama haqida batafsil ma'lumot olish uchun pastdagi tugmani bosing."}
                </p>

                <div className="hero-actions">
                  <button className="btn-play" onClick={() => handleDramaClick(item.anime_id)}>
                    <Play fill="currentColor" size={20} /> Tomosha
                  </button>
                  <button className="btn-info" onClick={() => handleDramaClick(item.anime_id)}>
                    <Info size={20} /> Batafsil
                  </button>
                </div>
              </div>

              <div className="carousel-poster">
                <img src={item.image_url} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="poster" />
              </div>
            </div>
          </div>
        ))}

        <button className="nav-btn nav-prev" onClick={() => setCurrentSlide(prev => (prev - 1 + carousels.length) % carousels.length)}>
          <ChevronLeft size={28} />
        </button>
        <button className="nav-btn nav-next" onClick={() => setCurrentSlide(prev => (prev + 1) % carousels.length)}>
          <ChevronRight size={28} />
        </button>
      </section>

      {/* --- CONTENT LISTS --- */}
      <main className="container" style={{position:'relative', zIndex:5}}>
        
        {/* Row 1: Yangi */}
        {newDramas.length > 0 && (
          <section className="category-section">
            <div className="section-header">
              <h2 className="section-title">Yangi Dramalar</h2>
            </div>
            <div className="scroll-container">
              {newDramas.map(drama => (
                <div className="anime-card" key={drama.id} onClick={() => handleDramaClick(drama.id)}>
                  <div className="card-img-box">
                    <img src={drama.image_url} alt={drama.title} loading="lazy" />
                    <div className="card-overlay">
                      <Play fill="white" size={32} />
                    </div>
                  </div>
                  <div className="card-content">
                    <h4 className="card-title">{drama.title}</h4>
                    <p className="card-meta">{drama.year} • Drama</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Row 2: Trenddagi */}
        {trendingDramas.length > 0 && (
          <section className="category-section">
            <div className="section-header">
              <h2 className="section-title">Trenddagi Dramalar</h2>
            </div>
            <div className="scroll-container">
              {trendingDramas.map(drama => (
                <div className="anime-card" key={drama.id} onClick={() => handleDramaClick(drama.id)}>
                  <div className="card-img-box">
                    <img src={drama.image_url} alt={drama.title} loading="lazy" />
                    <div className="card-overlay"><Play fill="white" size={32} /></div>
                  </div>
                  <div className="card-content">
                    <h4 className="card-title">{drama.title}</h4>
                    <p className="card-meta">⭐ {drama.rating} • Mashhur</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Row 3: Top Reyting */}
        {topRatedDramas.length > 0 && (
          <section className="category-section">
            <div className="section-header">
              <h2 className="section-title">Eng Yuqori Reyting</h2>
            </div>
            <div className="scroll-container">
              {topRatedDramas.map(drama => (
                <div className="anime-card" key={drama.id} onClick={() => handleDramaClick(drama.id)}>
                  <div className="card-img-box">
                    <img src={drama.image_url} alt={drama.title} loading="lazy" />
                    <div className="card-overlay"><Play fill="white" size={32} /></div>
                  </div>
                  <div className="card-content">
                    <h4 className="card-title">{drama.title}</h4>
                    <p className="card-meta">Top 10 • HD</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* --- FOOTER --- */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="f-col" style={{textAlign:'left'}}>
              <div className="logo" style={{fontSize:'24px', marginBottom:'16px'}}>MOCHITV<span>.UZ</span></div>
              <p style={{color:'#888', fontSize:'14px', lineHeight:'1.6'}}>
                Osiyo dramalarini eng yuqori sifatda, o'zbek tilida tomosha qiling. Biz bilan zerikmaysiz!
              </p>
              <div className="socials">
                <Instagram size={20} className="social-icon" />
                <Facebook size={20} className="social-icon" />
                <Twitter size={20} className="social-icon" />
                <Globe size={20} className="social-icon" />
              </div>
            </div>

            <div className="f-col">
              <h4>Bo'limlar</h4>
              <span className="f-link">Bosh sahifa</span>
              <span className="f-link">Dramalar</span>
              <span className="f-link">Filmlar</span>
              <span className="f-link">Biz haqimizda</span>
            </div>

            <div className="f-col">
              <h4>Yordam</h4>
              <span className="f-link">Qoidalar</span>
              <span className="f-link">Maxfiylik siyosati</span>
              <span className="f-link">Aloqa</span>
              <span className="f-link">Reklama</span>
            </div>
          </div>
          <div className="copyright">
            © {new Date().getFullYear()} MOCHITV.UZ Barcha huquqlar himoyalangan.
          </div>
        </div>
      </footer>

      {/* --- SEARCH MODAL (Fixed for Mobile) --- */}
      {showSearchModal && (
        <div className="modal-overlay" onClick={() => setShowSearchModal(false)}>
          <div className="modal-box search-modal" onClick={e => e.stopPropagation()}>
            <div className="search-modal-header">
              <Search size={22} color="var(--primary)" />
              <input 
                autoFocus
                className="search-modal-input" 
                placeholder="Nima qidiramiz?"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
              />
              <button className="icon-btn" onClick={() => setShowSearchModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="search-results">
              {searchResults.length > 0 ? (
                searchResults.map(item => (
                  <div key={item.id} className="anime-card" onClick={() => handleDramaClick(item.id)}>
                    <div className="card-img-box" style={{height:'180px'}}>
                      <img src={item.image_url} alt={item.title} />
                    </div>
                    <div className="card-content">
                      <h5 style={{fontSize:'13px'}}>{item.title}</h5>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{gridColumn:'1/-1', textAlign:'center', padding:'40px', color:'#666'}}>
                  {searchQuery ? "Hech narsa topilmadi" : "Qidirish uchun yozing..."}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- NOTIFICATION MODAL --- */}
      {showNotifications && (
        <div className="modal-overlay" onClick={() => setShowNotifications(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="notif-header">
              <h3 style={{fontSize:'18px', fontWeight:'700'}}>Bildirishnomalar</h3>
              <button className="icon-btn" onClick={() => setShowNotifications(false)}><X size={22}/></button>
            </div>
            <div className="notif-list">
              {notifications.length > 0 ? notifications.map((n, i) => (
                <div key={i} className="notif-item">
                  <div className="notif-icon"><Bell size={18}/></div>
                  <div>
                    <h5 style={{fontSize:'14px', marginBottom:'4px', fontWeight:'700'}}>{n.title}</h5>
                    <p style={{fontSize:'12px', color:'#aaa'}}>{n.message}</p>
                  </div>
                </div>
              )) : (
                <div style={{padding:'40px', textAlign:'center', color:'#666'}}>Yangi xabarlar yo'q</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- AUTH MODAL --- */}
      {showAuth && (
        <div className="modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="modal-box" style={{maxWidth:'400px'}} onClick={e => e.stopPropagation()}>
            <div className="notif-header">
              <h3 style={{fontSize:'20px', fontWeight:'700'}}>{authMode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}</h3>
              <button className="icon-btn" onClick={() => setShowAuth(false)}><X size={22}/></button>
            </div>
            <form className="auth-form" onSubmit={handleAuth}>
              <input 
                className="auth-input" 
                placeholder="Username" 
                value={authForm.username}
                onChange={e => setAuthForm({...authForm, username: e.target.value})}
              />
              <input 
                className="auth-input" 
                type="password" 
                placeholder="Parol" 
                value={authForm.password}
                onChange={e => setAuthForm({...authForm, password: e.target.value})}
              />
              {authMode === 'register' && (
                <input 
                  className="auth-input" 
                  type="password" 
                  placeholder="Parolni tasdiqlash"
                  value={authForm.confirmPassword}
                  onChange={e => setAuthForm({...authForm, confirmPassword: e.target.value})} 
                />
              )}
              <button className="login-btn" style={{width:'100%', justifyContent:'center', padding:'14px'}}>
                {authMode === 'login' ? 'Kirish' : 'Hisob yaratish'}
              </button>
              
              <p style={{textAlign:'center', fontSize:'13px', color:'#888', marginTop:'10px', cursor:'pointer'}} 
                 onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
                {authMode === 'login' ? "Hali a'zo emasmisiz? Ro'yxatdan o'tish" : "Akkaunt bormi? Kirish"}
              </p>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;