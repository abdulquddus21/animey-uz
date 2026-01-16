import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import Groq from "groq-sdk";
import {
  Search, Bell, User, Play,
  ChevronRight, ChevronLeft,
  X, LogOut, CheckCircle, AlertCircle, Film, Info
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

  const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
:root{
  --bg-dark:#0f1014;
  --bg-card:#181a20;
  --primary:#e50914;
  --accent:#46d369;
  --text-main:#ffffff;
  --text-gray:#a3a3a3;
  --glass:rgba(22,22,24,.85);
  --glass-border:rgba(255,255,255,.1);
  --nav-height:70px;
  --shadow:0 20px 60px rgba(0,0,0,.55);
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{
  font-family:'Outfit',sans-serif;
  background:var(--bg-dark);
  color:var(--text-main);
  overflow-x:hidden;
}
.container{max-width:1400px;margin:0 auto;padding:0 20px}

/* header */
.header{
  position:fixed;top:0;left:0;width:100%;height:var(--nav-height);
  z-index:1000;background:var(--glass);backdrop-filter:blur(12px);
  border-bottom:1px solid var(--glass-border);display:flex;align-items:center;
}
.header-flex{display:flex;justify-content:space-between;align-items:center;width:100%;gap:14px}
.logo{
  font-size:28px;font-weight:800;letter-spacing:-1px;cursor:pointer;user-select:none;
  background:linear-gradient(90deg,#fff,var(--primary));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
}
.logo span{font-size:14px;margin-left:2px}
.search-wrapper{position:relative;width:400px;max-width:44vw}
.desktop-search input{
  width:100%;background:rgba(255,255,255,.1);
  border:1px solid transparent;padding:10px 40px;border-radius:999px;color:#fff;
  transition:.25s ease;
}
.desktop-search input::placeholder{color:rgba(255,255,255,.6)}
.desktop-search input:focus{
  background:rgba(0,0,0,.5);border-color:var(--primary);outline:none;
  box-shadow:0 0 0 3px rgba(229,9,20,.18);
}
.s-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-gray);pointer-events:none}
.header-actions{display:flex;gap:12px;align-items:center}
.icon-btn{
  background:transparent;border:none;color:#fff;cursor:pointer;position:relative;
  transition:.2s;padding:6px;border-radius:10px;
}
.icon-btn:hover{color:var(--primary);background:rgba(255,255,255,.06)}
.badge{
  position:absolute;top:-5px;right:-5px;background:var(--primary);
  font-size:10px;width:16px;height:16px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 8px 20px rgba(229,9,20,.35);
}
.login-trigger{
  display:flex;align-items:center;gap:8px;background:var(--primary);
  color:#fff;border:none;padding:8px 18px;border-radius:999px;
  font-weight:800;cursor:pointer;transition:.25s ease;
}
.login-trigger:hover{transform:translateY(-1px);box-shadow:0 0 18px rgba(229,9,20,.45)}
.user-control{display:flex;align-items:center;gap:10px}
.avatar-circle{
  width:35px;height:35px;border-radius:50%;
  background:linear-gradient(45deg,var(--primary),#ff6b6b);
  display:flex;align-items:center;justify-content:center;font-weight:900;
}
.logout-btn{
  background:transparent;border:1px solid var(--glass-border);
  color:var(--text-gray);padding:6px;border-radius:10px;
  display:inline-flex;align-items:center;justify-content:center;cursor:pointer;
  transition:.2s ease;
}
.logout-btn:hover{border-color:rgba(229,9,20,.4);color:#fff;background:rgba(229,9,20,.12)}

/* carousel */
.carousel-section{position:relative;height:100vh;width:100%;overflow:hidden;margin-bottom:40px}
.carousel-wrapper{position:relative;height:100%;width:100%}
.carousel-slide{
  position:absolute;inset:0;opacity:0;visibility:hidden;
  transition:opacity .8s ease-in-out, visibility .8s;
}
.carousel-slide.active{opacity:1;visibility:visible}
.carousel-bg{position:absolute;inset:0;z-index:1}
.carousel-bg img{width:100%;height:100%;object-fit:cover;filter:blur(8px) brightness(.42);transform:scale(1.1)}
.bg-overlay{position:absolute;inset:0;background:linear-gradient(to bottom, transparent 70%, var(--bg-dark) 100%)}
.carousel-content{
  position:relative;z-index:2;height:100%;
  display:flex;align-items:center;justify-content:space-between;
  padding-top:var(--nav-height);gap:30px;
}
.carousel-info{width:54%}
.meta-tags{display:flex;gap:12px;margin-bottom:18px;font-size:14px;font-weight:800;flex-wrap:wrap}
.quality-tag{background:#fff;color:#000;padding:2px 8px;border-radius:6px}
.rating-tag{color:#ffd700}
.title-animate{font-size:62px;line-height:1.05;font-weight:900;margin-bottom:18px;text-transform:uppercase;animation:slideUp .7s ease forwards}
.desc-animate{
  font-size:18px;color:#ccc;line-height:1.6;margin-bottom:26px;max-width:680px;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;
}
.carousel-actions{display:flex;gap:14px;flex-wrap:wrap}
.primary-btn{
  background:var(--primary);color:#fff;border:none;padding:12px 28px;
  font-size:16px;font-weight:900;border-radius:12px;
  display:inline-flex;align-items:center;gap:10px;cursor:pointer;transition:.25s ease;
}
.primary-btn:hover{background:#c20811;transform:translateY(-1px)}
.secondary-btn{
  background:rgba(255,255,255,.16);color:#fff;border:1px solid rgba(255,255,255,.12);
  padding:12px 22px;font-size:16px;font-weight:900;border-radius:12px;
  display:inline-flex;align-items:center;gap:10px;cursor:pointer;
  backdrop-filter:blur(6px);transition:.25s ease;
}
.secondary-btn:hover{background:rgba(255,255,255,.24);transform:translateY(-1px)}
.carousel-poster{
  width:350px;height:520px;border-radius:20px;overflow:hidden;
  box-shadow:0 20px 50px rgba(0,0,0,.55);
  transform:perspective(1000px) rotateY(-15deg);
  transition:transform .5s;flex-shrink:0;
}
.carousel-poster:hover{transform:perspective(1000px) rotateY(0deg) scale(1.02)}
.carousel-poster img{width:100%;height:100%;object-fit:cover}
.carousel-nav{
  position:absolute;top:50%;transform:translateY(-50%);
  background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.2);color:#fff;
  width:50px;height:50px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;z-index:10;transition:.25s ease;
}
.carousel-nav:hover{background:var(--primary);border-color:var(--primary)}
.prev{left:26px}.next{right:26px}
.carousel-dots{
  position:absolute;bottom:18px;left:50%;transform:translateX(-50%);
  display:flex;gap:8px;z-index:12;
}
.dot{width:8px;height:8px;border-radius:999px;background:rgba(255,255,255,.35);cursor:pointer;transition:.2s ease}
.dot.active{width:22px;background:rgba(229,9,20,.95)}

/* lists */
.category-section{margin-bottom:46px}
.section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
.section-header h2{font-size:24px;border-left:4px solid var(--primary);padding-left:15px}
.section-controls button{
  background:rgba(255,255,255,.1);border:none;color:#fff;
  width:34px;height:34px;border-radius:50%;margin-left:10px;cursor:pointer;transition:.2s ease;
}
.section-controls button:hover{background:rgba(229,9,20,.18);transform:translateY(-1px)}
.scroll-container{
  display:flex;gap:20px;overflow-x:auto;padding:10px 4% 26px 4%;
  scroll-behavior:smooth;scrollbar-width:none;-webkit-overflow-scrolling:touch;
  scroll-snap-type:x mandatory;
}
.scroll-container::-webkit-scrollbar{display:none}
.anime-card{
  min-width:200px;max-width:200px;cursor:pointer;transition:transform .25s ease;
  scroll-snap-align:start;
}
.anime-card:hover{transform:translateY(-3px)}
.card-image{
  position:relative;height:300px;border-radius:14px;overflow:hidden;margin-bottom:10px;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);
}
.card-image img{width:100%;height:100%;object-fit:cover;transition:transform .3s}
.anime-card:hover .card-image img{transform:scale(1.1)}
.card-overlay{
  position:absolute;inset:0;background:rgba(0,0,0,.45);
  display:flex;align-items:center;justify-content:center;opacity:0;transition:.25s;
}
.anime-card:hover .card-overlay{opacity:1}
.play-circle{
  background:rgba(255,255,255,.18);backdrop-filter:blur(6px);
  border:1px solid rgba(255,255,255,.18);
  border-radius:50%;width:54px;height:54px;display:flex;align-items:center;justify-content:center;
}
.card-rating{
  position:absolute;top:10px;right:10px;background:rgba(0,0,0,.7);
  padding:4px 8px;border-radius:8px;font-size:12px;font-weight:900;
}
.card-info h4{
  font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px;
}
.card-info p{font-size:14px;color:var(--text-gray)}

/* MODALS - mobile bug FIX (bottom-sheet + safe scroll) */
.modal-overlay{
  position:fixed;inset:0;
  background:linear-gradient(135deg, rgba(139,0,0,.92) 0%, rgba(0,0,0,.98) 100%);
  backdrop-filter:blur(10px);
  display:flex;justify-content:center;align-items:center;
  z-index:2000;animation:fadeIn .18s ease;
  padding:14px;
}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}

.search-modal,.notification-panel,.auth-box{
  box-shadow:var(--shadow);
  overflow:hidden;
}

/* Search modal */
.search-modal{
  background:var(--bg-card);
  width:min(860px,100%);
  height:min(80vh,860px);
  border-radius:18px;border:1px solid rgba(255,255,255,.10);
  display:flex;flex-direction:column;
}
.search-header{
  padding:18px;border-bottom:1px solid rgba(255,255,255,.08);
  display:flex;align-items:center;gap:12px;flex-shrink:0;
}
.search-header input{
  flex:1;background:transparent;border:none;font-size:18px;color:#fff;outline:none;
}
.search-body{
  padding:18px;overflow:auto;-webkit-overflow-scrolling:touch;
  overscroll-behavior:contain;
}
.search-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:16px}
.search-card{cursor:pointer;transition:.2s ease}
.search-card:hover{transform:translateY(-2px)}
.search-card img{
  width:100%;height:220px;object-fit:cover;border-radius:12px;
  border:1px solid rgba(255,255,255,.08);
}
.search-info h5{
  margin-top:10px;font-size:14px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.search-info span{font-size:12px;color:var(--text-gray)}
.no-results{
  min-height:46vh;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:12px;color:rgba(255,255,255,.85);text-align:center;
}
.close-icon,.close-abs{
  background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);color:#fff;cursor:pointer;
  width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;
  transition:.2s ease;
}
.close-icon:hover,.close-abs:hover{background:rgba(229,9,20,.14);border-color:rgba(229,9,20,.22)}

/* Notification panel */
.notification-panel{
  background:linear-gradient(145deg,#1a0000 0%, #0a0a0a 100%);
  border:2px solid #8b0000;border-radius:18px;
  width:min(520px,100%);max-height:min(85vh,860px);
  display:flex;flex-direction:column;overflow:hidden;
}
.panel-header{
  display:flex;justify-content:space-between;align-items:center;
  padding:20px 18px;border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0;
}
.panel-header h3{font-size:18px;font-weight:900}
.panel-header button{
  background:rgba(139,0,0,.2);border:1px solid rgba(220,38,38,.4);
  border-radius:12px;color:#ff6b6b;min-width:40px;min-height:40px;
  display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.2s ease;
}
.panel-header button:hover{background:rgba(220,38,38,.28);transform:rotate(90deg)}
.panel-list{
  padding:16px;overflow:auto;-webkit-overflow-scrolling:touch;
  overscroll-behavior:contain;
}
.empty-msg{text-align:center;padding:60px 20px;color:#777;font-size:14px;font-style:italic}
.notif-item{
  display:flex;gap:12px;padding:14px;border-radius:12px;margin-bottom:12px;
  background:linear-gradient(135deg, rgba(139,0,0,.15) 0%, rgba(0,0,0,.4) 100%);
  border:1px solid rgba(139,0,0,.3);transition:.2s ease;
}
.notif-icon-box{
  width:44px;height:44px;border-radius:12px;flex-shrink:0;
  background:linear-gradient(135deg,#dc2626 0%, #8b0000 100%);
  display:flex;align-items:center;justify-content:center;
}
.notif-text h4{margin:0 0 6px;font-size:14px;font-weight:900;color:#ff6b6b}
.notif-text p{margin:0;font-size:12px;line-height:1.55;color:#ddd}

/* Auth */
.auth-box{
  background:var(--bg-card);
  width:min(420px,100%);
  border-radius:18px;border:1px solid rgba(255,255,255,.10);
  padding:34px 28px;position:relative;
}
.auth-box h2{text-align:center;margin-bottom:26px;font-size:24px;font-weight:900}
.field{margin-bottom:16px}
.field input{
  width:100%;padding:12px;background:#2a2d35;border:1px solid rgba(255,255,255,.10);
  border-radius:12px;color:#fff;outline:none;transition:.2s ease;
}
.field input:focus{border-color:rgba(229,9,20,.55);box-shadow:0 0 0 3px rgba(229,9,20,.14)}
.submit-btn{
  width:100%;padding:12px;background:var(--primary);border:none;color:#fff;
  border-radius:12px;font-weight:900;cursor:pointer;transition:.2s ease;
}
.submit-btn:hover{transform:translateY(-1px);box-shadow:0 12px 30px rgba(229,9,20,.25)}
.switch-auth{text-align:center;margin-top:16px;color:var(--text-gray);cursor:pointer;font-size:14px}
.switch-auth:hover{text-decoration:underline;color:#fff}

/* Toast */
.toast{
  position:fixed;bottom:24px;right:24px;
  background:rgba(20,20,24,.92);border:1px solid rgba(255,255,255,.08);
  padding:14px 18px;border-radius:14px;display:flex;align-items:center;gap:10px;
  z-index:3000;animation:slideIn .2s ease;box-shadow:var(--shadow);
}
.toast.success{border-left:4px solid var(--accent)}
.toast.error{border-left:4px solid var(--primary)}
@keyframes slideIn{from{transform:translateX(40px);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes slideUp{from{transform:translateY(18px);opacity:0}to{transform:translateY(0);opacity:1}}

/* Footer */
.footer{
  margin-top:40px;padding:26px 0 0;
  border-top:1px solid rgba(255,255,255,.08);
  background:rgba(0,0,0,.18);
}
.footer-grid{
  display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:18px;padding-bottom:18px;
}
.footer-brand{cursor:pointer;user-select:none}
.footer-logo{
  font-size:20px;font-weight:900;letter-spacing:.5px;
  background:linear-gradient(90deg,#fff,var(--primary));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
}
.footer-desc{margin-top:10px;opacity:.86;line-height:1.55;color:rgba(255,255,255,.86)}
.footer-links h4{margin:0 0 10px;font-size:14px;opacity:.95}
.f-link{
  width:100%;text-align:left;background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.10);color:#fff;
  padding:10px 12px;border-radius:12px;cursor:pointer;margin-bottom:10px;transition:.2s ease;
}
.f-link:hover{transform:translateY(-1px);background:rgba(255,255,255,.10);border-color:rgba(229,9,20,.22)}
.footer-bottom{
  padding:14px 0;border-top:1px solid rgba(255,255,255,.08);
  text-align:center;opacity:.8;font-size:12px;
}

/* responsive */
@media (max-width:1024px){
  .carousel-poster{display:none}
  .carousel-info{width:100%;text-align:center;padding:0 14px}
  .carousel-actions{justify-content:center}
  .meta-tags{justify-content:center}
  .title-animate{font-size:40px}
  .search-wrapper{max-width:54vw}
}
@media (max-width:768px){
  .desktop-search{display:none}
  .logo{font-size:22px}
  .carousel-nav{width:40px;height:40px}
  .prev{left:10px}.next{right:10px}
  .anime-card{min-width:140px;max-width:140px}
  .card-image{height:210px}
  .scroll-container{gap:14px;padding:10px 14px 22px}
  .toast{right:12px;left:12px;bottom:12px;justify-content:center}
  .footer-grid{grid-template-columns:1fr}
}
@media (max-width:480px){
  /* MOBILE MODAL FIX: true bottom sheet + safe scroll */
  .modal-overlay{
    padding:0;
    align-items:flex-end;
  }
  .search-modal,.notification-panel,.auth-box{
    width:100%;max-width:100%;
    border-radius:18px 18px 0 0;
    max-height:92vh;
    animation:slideUpMobile .22s ease;
  }
  @keyframes slideUpMobile{
    from{transform:translateY(20%);opacity:0}
    to{transform:translateY(0);opacity:1}
  }
  .search-header{padding:14px}
  .search-header input{font-size:16px}
  .search-body{padding:14px}
  .search-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
  .search-card img{height:160px;border-radius:10px}
  .close-icon,.close-abs{width:40px;height:40px}
  .auth-box{padding:22px 18px}
  .auth-box h2{font-size:22px}
}
@media (max-width:360px){
  .search-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .search-card img{height:150px}
  .title-animate{font-size:32px}
}
@media (prefers-reduced-motion: reduce){
  *{animation:none !important;transition:none !important;scroll-behavior:auto !important;}
}
  `;

  // State management
  const [loading, setLoading] = useState(true);
  const [carousels, setCarousels] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [categorized, setCategorized] = useState({
    drama: []
  });

  // ✅ faqat drama
  const [activeTab, setActiveTab] = useState('drama'); // doim drama
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const [allAnime, setAllAnime] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('mochitvUser')) || null);
  const [authForm, setAuthForm] = useState({ username: '', password: '', confirmPassword: '' });

  const [notification, setNotification] = useState({ show: false, msg: '', type: 'success' });

  // Refs
  const scrollRefs = useRef({});
  const searchInputRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const notify = useCallback((msg, type = 'success') => {
    setNotification({ show: true, msg, type });
    window.clearTimeout(window.__toastTimer);
    window.__toastTimer = window.setTimeout(() => {
      setNotification({ show: false, msg: '', type: 'success' });
    }, 3500);
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);

      const { data: carData } = await supabase
        .from('carousel_list')
        .select('*, anime_list(*)')
        .order('created_at', { ascending: false });

      setCarousels(carData || []);

      const { data: animData, error: animErr } = await supabase.from('anime_list').select('*');
      if (animErr) throw animErr;

      const list = animData || [];
      setAllAnime(list);

      // ✅ faqat drama ajratamiz
      const drama15 = [...list].filter(a => {
        const g = (a.genre || a.genres || '').toString().toLowerCase();
        const t = (a.type || '').toString().toLowerCase();
        return g.includes('drama') || t === 'drama';
      });

      setCategorized({ drama: drama15.slice(0, 40) });
    } catch (e) {
      console.error(e);
      notify("Ma'lumotlarni yuklashda xatolik!", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchAllData();
    fetchNotifications();
  }, [fetchAllData, fetchNotifications]);

  // Auto slide
  useEffect(() => {
    if (carousels.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % carousels.length);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [carousels.length]);

  // modal open => scroll lock
  useEffect(() => {
    const anyModalOpen = showSearchModal || showNotifications || showAuth;
    document.body.style.overflow = anyModalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showSearchModal, showNotifications, showAuth]);

  // ESC close
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowSearchModal(false);
        setShowNotifications(false);
        setShowAuth(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (showSearchModal) setTimeout(() => searchInputRef.current?.focus?.(), 50);
  }, [showSearchModal]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const q = query.trim().toLowerCase();
    if (!q) return setSearchResults([]);

    // ✅ qidiruv ham faqat drama ichidan
    const results = allAnime.filter(anime => {
      const titleOk = (anime.title || '').toLowerCase().includes(q);
      const g = (anime.genre || anime.genres || '').toString().toLowerCase();
      const t = (anime.type || '').toString().toLowerCase();
      const isDrama = g.includes('drama') || t === 'drama';
      return titleOk && isDrama;
    });

    setSearchResults(results);
  };

  const resetAuthForm = () => setAuthForm({ username: '', password: '', confirmPassword: '' });

  const handleAuth = async (e) => {
    e.preventDefault();
    const username = (authForm.username || '').trim();
    const password = (authForm.password || '').trim();
    const confirmPassword = (authForm.confirmPassword || '').trim();

    if (!username || !password) return notify("Username va parolni kiriting!", "error");

    try {
      if (authMode === 'register') {
        if (password !== confirmPassword) return notify("Parollar mos kelmadi!", "error");

        const { data: checkUser } = await supabase
          .from('users_list')
          .select('*')
          .eq('username', username)
          .maybeSingle();

        if (checkUser) return notify("Bu username band!", "error");

        const role = (username === "Malika" && password === "123456") ? "admin" : "user";
        const { error } = await supabase.from('users_list').insert([{ username, password, role }]);

        if (!error) {
          const userData = { name: username, isAdmin: role === 'admin' };
          setUser(userData);
          localStorage.setItem('mochitvUser', JSON.stringify(userData));
          setShowAuth(false);
          resetAuthForm();
          notify("Xush kelibsiz!");
        } else {
          notify("Ro'yxatdan o'tishda xatolik!", "error");
        }
      } else {
        const { data: foundUser } = await supabase
          .from('users_list')
          .select('*')
          .eq('username', username)
          .eq('password', password)
          .maybeSingle();

        if (foundUser) {
          const userData = { name: foundUser.username, isAdmin: foundUser.role === 'admin' };
          setUser(userData);
          localStorage.setItem('mochitvUser', JSON.stringify(userData));
          setShowAuth(false);
          resetAuthForm();
          notify("Tizimga kirildi!");
        } else {
          notify("Username yoki parol noto'g'ri!", "error");
        }
      }
    } catch (err) {
      console.error(err);
      notify("Auth jarayonida xatolik!", "error");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mochitvUser');
    notify("Tizimdan chiqildi.");
  };

  const scrollRow = (category, direction) => {
    const el = scrollRefs.current?.[category]?.current;
    if (!el) return;
    const scrollAmount = direction === 'left' ? -520 : 520;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleDramaClick = (id) => {
    navigate(`/anime/${id}`); // sizda route anime/id bo‘lsa shu qoladi
    setShowSearchModal(false);
  };

  const handleTouchStart = (e) => {
    if (!carousels.length) return;
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!carousels.length) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!carousels.length) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) setCurrentSlide(prev => (prev + 1) % carousels.length);
    if (diff < -50) setCurrentSlide(prev => (prev - 1 + carousels.length) % carousels.length);
  };

  const openSite = () => window.open('https://mochitv.uz', '_blank', 'noopener,noreferrer');

  const sections = {
    "Yangi Dramalar": categorized.drama,
    "Trenddagi Dramalar": categorized.drama,
    "Eng Yuqori Reyting (Drama)": categorized.drama,
    "Tavsiya Drama": categorized.drama
  };

  return (
    <div className="app">
      <style>{CSS}</style>

      {/* Toast */}
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
            MOCHITV<span>.UZ</span>
          </div>

          <div className="search-wrapper desktop-search">
            <Search size={18} className="s-icon" />
            <input
              type="text"
              placeholder="Drama qidirish..."
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
                <div className="avatar-circle">{(user.name?.[0] || 'U').toUpperCase()}</div>
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

      {/* Carousel */}
      <section className="carousel-section">
        {loading ? (
          <div className="empty-carousel" style={{ paddingTop: '90px', textAlign: 'center' }}>
            <Film size={40} />
            <p style={{ marginTop: 12, opacity: 0.8 }}>Yuklanmoqda...</p>
          </div>
        ) : carousels.length > 0 ? (
          <div
            className="carousel-wrapper"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {carousels.map((item, index) => (
              <div key={item.id} className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}>
                <div className="carousel-bg">
                  <img src={item.image_url} alt="bg" />
                  <div className="bg-overlay"></div>
                </div>

                <div className="carousel-content container">
                  <div className="carousel-info">
                    <div className="meta-tags">
                      <span className="quality-tag">HD</span>
                      <span className="rating-tag">⭐ {item.anime_list?.rating || 'N/A'}</span>
                      <span className="year-tag">{item.anime_list?.year || '2024'}</span>
                    </div>

                    <h1 className="title-animate">{item.anime_list?.title || 'Drama'}</h1>

                    <p className="desc-animate">
                      {item.anime_list?.description
                        ? item.anime_list.description.slice(0, 150) + '...'
                        : 'Tavsif mavjud emas...'}
                    </p>

                    <div className="carousel-actions">
                      <button className="primary-btn" onClick={() => handleDramaClick(item.anime_id)}>
                        <Play fill="currentColor" size={20} />
                        <span>Tomosha</span>
                      </button>
                      <button className="secondary-btn" onClick={() => handleDramaClick(item.anime_id)}>
                        <Info size={20} />
                        <span>Batafsil</span>
                      </button>
                    </div>
                  </div>

                  <div className="carousel-poster">
                    <img src={item.image_url} alt={item.anime_list?.title || 'poster'} />
                  </div>
                </div>
              </div>
            ))}

            <button
              className="carousel-nav prev"
              onClick={() => setCurrentSlide(prev => (prev - 1 + carousels.length) % carousels.length)}
              aria-label="Previous slide"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              className="carousel-nav next"
              onClick={() => setCurrentSlide(prev => (prev + 1) % carousels.length)}
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
          <div className="empty-carousel" style={{ paddingTop: '90px', textAlign: 'center' }}>
            <Film size={40} />
            <p style={{ marginTop: 12, opacity: 0.8 }}>Karusel bo'sh</p>
          </div>
        )}
      </section>

      {/* Lists */}
      <main className="main-content">
        {Object.entries(sections).map(([title, list]) => (
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

              <div className="scroll-container" ref={el => { scrollRefs.current[title] = { current: el }; }}>
                {list.map((drama, i) => (
                  <div
                    className="anime-card"
                    key={`${drama.id}-${i}`}
                    onClick={() => handleDramaClick(drama.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' ? handleDramaClick(drama.id) : null)}
                  >
                    <div className="card-image">
                      <img src={drama.image_url} alt={drama.title} loading="lazy" />
                      <div className="card-overlay">
                        <button className="play-circle" aria-label="Play" onClick={(e) => e.stopPropagation()}>
                          <Play fill="white" size={24} />
                        </button>
                      </div>
                      <span className="card-rating">⭐ {drama.rating}</span>
                    </div>
                    <div className="card-info">
                      <h4>{drama.title}</h4>
                      <p>{drama.year} • Drama</p>
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
              <Search size={24} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Qidirayotgan drama nomini yozing..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <button className="close-icon" onClick={() => setShowSearchModal(false)} aria-label="Close">
                <X />
              </button>
            </div>

            <div className="search-body">
              {searchQuery.trim().length === 0 ? (
                <div className="no-results">
                  <Search size={48} style={{ opacity: 0.3 }} />
                  <p>Qidirish uchun nom yozing</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="search-grid">
                  {searchResults.map(drama => (
                    <div key={drama.id} className="search-card" onClick={() => handleDramaClick(drama.id)}>
                      <img src={drama.image_url} alt={drama.title} />
                      <div className="search-info">
                        <h5>{drama.title}</h5>
                        <span>{drama.year}</span>
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
              <button onClick={() => setShowNotifications(false)} aria-label="Close">
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
                    <div className="notif-text">
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
            <button className="close-abs" onClick={() => setShowAuth(false)} aria-label="Close">
              <X />
            </button>

            <h2>{authMode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}</h2>

            <form onSubmit={handleAuth}>
              <div className="field">
                <input
                  type="text"
                  placeholder="Username"
                  required
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                />
              </div>

              <div className="field">
                <input
                  type="password"
                  placeholder="Parol"
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                />
              </div>

              {authMode === 'register' && (
                <div className="field">
                  <input
                    type="password"
                    placeholder="Parolni tasdiqlash"
                    required
                    value={authForm.confirmPassword}
                    onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                  />
                </div>
              )}

              <button type="submit" className="submit-btn">
                {authMode === 'login' ? 'Kirish' : 'Yaratish'}
              </button>
            </form>

            <p
              className="switch-auth"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                resetAuthForm();
              }}
              role="button"
              tabIndex={0}
            >
              {authMode === 'login' ? "Akkaunt yo'qmi? Yaratish" : "Akkaunt bormi? Kirish"}
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand" onClick={openSite} role="button" tabIndex={0}>
            <div className="footer-logo">MOCHITV<span>.UZ</span></div>
            <p className="footer-desc">
              Eng sifatli dramalarni bir joyda tomosha qiling. Tez, qulay va mobilga mos.
            </p>
          </div>

          <div className="footer-links">
            <h4>Dramalar</h4>
            <button className="f-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Dramalarni ko‘rish
            </button>
            <button className="f-link" onClick={() => setShowSearchModal(true)}>
              Drama qidirish
            </button>
          </div>

          <div className="footer-links">
            <h4>Ajoyib ma’lumotlar</h4>
            <button className="f-link" onClick={openSite}>
              mochitv.uz ga o‘tish
            </button>
            <button className="f-link" onClick={openSite}>
              Yangiliklar va tavsiyalar
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} MOCHITV.UZ • Barcha huquqlar himoyalangan</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
