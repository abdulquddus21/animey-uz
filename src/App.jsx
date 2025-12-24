import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { createClient } from '@supabase/supabase-js';
import Groq from "groq-sdk";
import { 
  Search, Bell, User, Play, Star, Clock, 
  Instagram, Send, Facebook, ChevronRight, ChevronLeft,
  Settings, LogIn, X, Loader2, LogOut, CheckCircle, AlertCircle, Film
} from 'lucide-react';

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

  useEffect(() => {
    fetchAllData();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (carousels.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carousels.length);
      }, 5000);
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
    } catch (err) {
      console.error("Notification xatosi:", err);
    }
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
          const prompt = `Sen anime ekspertisan. Berilgan animelar ro'yxatini tahlil qilib, har bir animeni eng mos toifaga joylashtir. 
FAQAT JSON formatda qaytar: 
{
  "yangi": [id1, id2, ...],
  "mashhur": [id3, id4, ...], 
  "top": [id5, id6, ...],
  "tavsiya": [id7, id8, ...]
}`;

          const res = await groq.chat.completions.create({
            messages: [
              { role: "system", content: prompt },
              { 
                role: "user", 
                content: JSON.stringify(animData.map(a => ({ 
                  id: a.id, 
                  title: a.title, 
                  year: a.year,
                  rating: a.rating,
                  description: a.description 
                }))) 
              }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
          });

          const content = res.choices[0]?.message?.content;
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          const aiMap = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
          
          if (aiMap) {
            setCategorized({
              yangi: animData.filter(a => aiMap.yangi?.includes(a.id)),
              mashhur: animData.filter(a => aiMap.mashhur?.includes(a.id)),
              top: animData.filter(a => aiMap.top?.includes(a.id)),
              tavsiya: animData.filter(a => aiMap.tavsiya?.includes(a.id))
            });
          }
        } catch (aiErr) {
          console.error("AI xatosi:", aiErr);
          setCategorized({
            yangi: animData.slice(0, 6),
            mashhur: animData.slice(6, 12),
            top: animData.slice(12, 18),
            tavsiya: animData.slice(18, 24)
          });
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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carousels.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carousels.length) % carousels.length);
  };

  const handleAnimeClick = (id) => {
    navigate(`/anime/${id}`);
    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="app">
      {notification.show && (
        <div className={`toast ${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{notification.msg}</span>
        </div>
      )}

      <header className="header">
        <div className="container header-flex">
          <div className="logo" onClick={() => navigate('/')}>ANIMEY<span>.UZ</span></div>
          
          <div className="search-wrapper desktop-search">
            <Search size={18} className="s-icon" />
            <input 
              type="text" 
              placeholder="Anime qidirish..." 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.slice(0, 5).map(anime => (
                  <div key={anime.id} className="search-item" onClick={() => handleAnimeClick(anime.id)}>
                    <img src={anime.image_url} alt={anime.title} />
                    <div>
                      <h4>{anime.title}</h4>
                      <p>{anime.year || 'N/A'} • ⭐ {anime.rating}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                <div className="avatar-circle">{user.name[0]}</div>
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

      <section className="carousel-section">
        {loading ? (
          <div className="container"><div className="carousel-skeleton"></div></div>
        ) : carousels.length > 0 ? (
          <div className="carousel-wrapper">
            <div 
              className="hero-banner" 
              style={{
                backgroundImage: `linear-gradient(to right, var(--bg) 10%, transparent), url(${carousels[currentSlide].image_url})`
              }}
            >
              <div className="hero-content container">
                <span className="tag">Trendda</span>
                <h1>{carousels[currentSlide].anime_list?.title || 'Anime'}</h1>
                <div className="hero-meta">
                  <span className="year">{carousels[currentSlide].anime_list?.year || 'N/A'}</span>
                  <span className="rating">⭐ {carousels[currentSlide].anime_list?.rating || 'N/A'}</span>
                </div>
                <p>{carousels[currentSlide].anime_list?.description || ''}</p>
                <div className="hero-btns">
                  <button className="p-btn" onClick={() => handleAnimeClick(carousels[currentSlide].anime_id)}>
                    <Play size={20} fill="currentColor" /> Ko'rish
                  </button>
                  {user?.isAdmin && (
                    <button className="admin-btn" onClick={() => navigate('/admin')}>
                      <Settings size={20} /> <span className="desktop-only">Admin Panel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            {carousels.length > 1 && (
              <>
                <button className="carousel-btn prev" onClick={prevSlide}><ChevronLeft size={30} /></button>
                <button className="carousel-btn next" onClick={nextSlide}><ChevronRight size={30} /></button>
                <div className="carousel-dots">
                  {carousels.map((_, idx) => (
                    <span 
                      key={idx} 
                      className={`dot ${idx === currentSlide ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(idx)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="container">
            <div className="empty-carousel">
              <Film size={40} />
              <p>Karusel bo'sh</p>
            </div>
          </div>
        )}
      </section>

      <main className="container">
        {Object.entries({
          "Yangi Animelar": categorized.yangi,
          "Trenddagi": categorized.mashhur,
          "Eng Yuqori Reyting": categorized.top,
          "Tavsiya Etiladi": categorized.tavsiya
        }).map(([title, list]) => (
          <section key={title} className="anime-section">
            <div className="section-head">
              <h2>{title}</h2>
              <a href="#">Barchasi <ChevronRight size={16} /></a>
            </div>
            <div className="scroll-container">
              {loading ? (
                [1,2,3,4,5,6].map(i => <div key={i} className="skel-card"></div>)
              ) : (
                list.map(anime => (
                  <div className="anime-item" key={anime.id} onClick={() => handleAnimeClick(anime.id)}>
                    <div className="anime-img">
                      <span className="anime-year">{anime.year || 'N/A'}</span>
                      <img src={anime.image_url} alt={anime.title} loading="lazy" />
                      <div className="anime-rating"><Star size={10} fill="gold" /> {anime.rating}</div>
                      <div className="hover-play"><Play fill="white" size={30} /></div>
                    </div>
                    <h4>{anime.title}</h4>
                  </div>
                ))
              )}
            </div>
          </section>
        ))}
      </main>

      {showSearchModal && (
        <div className="modal-overlay" onClick={() => setShowSearchModal(false)}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header">
              <h3>Anime Qidirish</h3>
              <button className="close-btn" onClick={() => setShowSearchModal(false)}><X /></button>
            </div>
            <div className="search-input-wrapper">
              <Search size={20} />
              <input 
                type="text" placeholder="Anime nomini kiriting..." value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)} autoFocus
              />
            </div>
            <div className="search-results-list">
              {searchResults.map(anime => (
                <div key={anime.id} className="search-result-item" onClick={() => handleAnimeClick(anime.id)}>
                  <img src={anime.image_url} alt={anime.title} />
                  <div className="search-result-info">
                    <h4>{anime.title}</h4>
                    <p>{anime.year || 'N/A'} • ⭐ {anime.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showNotifications && (
        <div className="modal-overlay" onClick={() => setShowNotifications(false)}>
          <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
            <div className="notification-header">
              <h3>Bildirishnomalar</h3>
              <button className="close-btn" onClick={() => setShowNotifications(false)}><X /></button>
            </div>
            <div className="notification-list">
              {notifications.map(notif => (
                <div key={notif.id} className="notification-item">
                  <Bell size={18} className="notif-icon" />
                  <div>
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                    <span className="notif-time">{new Date(notif.created_at).toLocaleDateString('uz-UZ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAuth && (
        <div className="modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="auth-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowAuth(false)}><X /></button>
            <h2>{authMode === 'login' ? 'Xush kelibsiz!' : 'Ro\'yxatdan o\'tish'}</h2>
            <form onSubmit={handleAuth}>
              <div className="input-group"><label>Username</label>
                <input type="text" required onChange={(e) => setAuthForm({...authForm, username: e.target.value})} />
              </div>
              <div className="input-group"><label>Parol</label>
                <input type="password" required onChange={(e) => setAuthForm({...authForm, password: e.target.value})} />
              </div>
              {authMode === 'register' && (
                <div className="input-group"><label>Parolni takrorlang</label>
                  <input type="password" required onChange={(e) => setAuthForm({...authForm, confirmPassword: e.target.value})} />
                </div>
              )}
              <button type="submit" className="login-btn">{authMode === 'login' ? 'Kirish' : 'Ro\'yxatdan o\'tish'}</button>
            </form>
            <p className="auth-toggle" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
              {authMode === 'login' ? "Hisobingiz yo'qmi? Ro'yxatdan o'ting" : "Hisobingiz bormi? Kiring"}
            </p>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="logo">ANIMEY<span>.UZ</span></div>
              <p>O'zbek tilidagi eng tezkor va sifatli anime portali</p>
              <div className="f-social">
                <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
                <a href="#" aria-label="Telegram"><Send size={20} /></a>
                <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
              </div>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Bosh sahifa</h4>
                <ul>
                  <li><a href="#">Yangi Animelar</a></li>
                  <li><a href="#">Trenddagi</a></li>
                  <li><a href="#">Top Reyting</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Haqida</h4>
                <ul>
                  <li><a href="#">Biz haqida</a></li>
                  <li><a href="#">Shartlar</a></li>
                  <li><a href="#">Maxfiyliq</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Animey.uz. Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;