import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import Artplayer from 'artplayer';
import { 
  Play, Star, Calendar, Clock, ChevronLeft, Share2, Bookmark, Film, Tv
} from 'lucide-react';
import './Anime.css';

// Supabase konfiguratsiyasi
const supabase = createClient(
  'https://rxynseqxmfjjindbttdt.supabase.co', 
  'sb_publishable_C4oGHcS1aTQcaZ87PbQQLw_M7JSCNoz'
);

// Artplayer komponenti (Alohida ajratib oldik)
const Player = ({ option, getInstance, ...rest }) => {
  const artRef = useRef();

  useEffect(() => {
    const art = new Artplayer({
      ...option,
      container: artRef.current,
    });

    if (getInstance && typeof getInstance === 'function') {
      getInstance(art);
    }

    return () => {
      if (art && art.destroy) {
        art.destroy(false);
      }
    };
  }, [option]);

  return <div ref={artRef} {...rest} className="artplayer-container"></div>;
};

const Anime = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [currentEp, setCurrentEp] = useState(null);
  const [randomAnimes, setRandomAnimes] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0); // Sahifa ochilganda tepaga otish
    fetchAnimeDetails();
    fetchRandomAnimes();
  }, [id]);

  const fetchAnimeDetails = async () => {
    setLoading(true);
    // Anime ma'lumotlarini olish
    const { data: animeData, error } = await supabase
      .from('anime_list')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Xatolik:", error);
      setLoading(false);
      return;
    }

    setAnime(animeData);

    // Qismlarni olish
    const { data: epData } = await supabase
      .from('episodes')
      .select('*')
      .eq('anime_id', id)
      .order('episode_number', { ascending: true });

    setEpisodes(epData || []);
    if (epData?.length > 0) setCurrentEp(epData[0]);
    
    setLoading(false);
  };

  const fetchRandomAnimes = async () => {
    const { data } = await supabase.from('anime_list').select('*').limit(20);
    if (data) {
      const shuffled = data.sort(() => 0.5 - Math.random());
      setRandomAnimes(shuffled.slice(0, 10)); // 10 ta tavsiya
    }
  };

  if (loading) {
    return (
      <div className="anime-loader">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!anime) return <div className="error-msg">Anime topilmadi!</div>;

  return (
    <div className="anime-page">
      {/* Orqa fon (Blur effektli) */}
      <div className="anime-bg-overlay" style={{ backgroundImage: `url(${anime.poster_url || anime.image_url})` }}></div>
      <div className="anime-bg-gradient"></div>

      <div className="container">
        {/* Navigatsiya */}
       <button className="back-btn" onClick={() => navigate("/")}>
  <ChevronLeft size={24} /> Ortga qaytish
</button>


        {/* Asosiy Info Qismi */}
        <div className="anime-hero">
          <div className="poster-wrapper">
            <img src={anime.image_url} alt={anime.title} className="main-poster" />
          </div>

          <div className="anime-info">
            <h1 className="title">{anime.title}</h1>
            
            <div className="meta-tags">
              <span className="rating-tag"><Star size={14} fill="#FFD700" color="#FFD700"/> {anime.rating}</span>
              <span className="year-tag"><Calendar size={14} /> {anime.year}</span>
              <span className="ep-count-tag"><Tv size={14} /> {episodes.length} qism</span>
            </div>

            <div className="genres">
              {anime.genres?.split(',').map((g, i) => (
                <span key={i} className="genre-badge">{g.trim()}</span>
              ))}
            </div>

            <p className="description">{anime.description}</p>

            <div className="action-buttons">
              <button className="btn-primary" onClick={() => document.getElementById('player-area').scrollIntoView({behavior: 'smooth'})}>
                <Play fill="currentColor" /> Tomosha qilish
              </button>
              <button className="btn-secondary"><Bookmark /> Saqlash</button>
              <button className="btn-secondary"><Share2 /> Ulashish</button>
            </div>
          </div>
        </div>

        {/* Player va Qismlar */}
        <div className="player-section" id="player-area">
          <div className="player-wrapper">
            <div className="player-header">
              <Film size={20} color="#3b82f6" />
              <h3>{currentEp ? (episodes.length === 1 ? 'Film' : `${currentEp.episode_number}-qism`) : "Treyler"}</h3>
            </div>

            <div className="video-box">
              {currentEp ? (
                <Player
                  key={currentEp.video_url} // URL o'zgarganda playerni yangilash
                  option={{
                    url: currentEp.video_url,
                    title: episodes.length === 1 ? anime.title : `${anime.title} - ${currentEp.episode_number} qism`,
                    poster: anime.poster_url || anime.image_url,
                    volume: 0.7,
                    isLive: false,
                    muted: false,
                    autoplay: false,
                    pip: true,
                    autoSize: true,
                    autoMini: false,
                    screenshot: true,
                    setting: true,
                    loop: false,
                    flip: true,
                    playbackRate: true,
                    aspectRatio: true,
                    fullscreen: true,
                    fullscreenWeb: true,
                    subtitleOffset: true,
                    miniProgressBar: true,
                    mutex: true,
                    backdrop: true,
                    playsInline: true,
                    autoPlayback: true,
                    airplay: true,
                    theme: '#3b82f6', // Moviy rang mavzusi
                    lang: 'uz',
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '16px',
                    overflow: 'hidden'
                  }}
                />
              ) : (
                <div className="no-video">Video mavjud emas</div>
              )}
            </div>
          </div>

          <div className="episodes-list-wrapper">
            <div className="episodes-header">
              <h3>Qismlar ro'yxati</h3>
              <span>{episodes.length} ta video</span>
            </div>
            <div className="episodes-grid">
              {episodes.map((ep) => (
                <div 
                  key={ep.id} 
                  className={`episode-card ${currentEp?.id === ep.id ? 'active' : ''}`}
                  onClick={() => setCurrentEp(ep)}
                >
                  <div className="ep-info">
                    <span>{episodes.length === 1 ? 'Film' : `${ep.episode_number}-qism`}</span>
                    <small>Dublyaj</small>
                  </div>
                  {currentEp?.id === ep.id && <div className="playing-indicator"></div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tavsiyalar */}
        <div className="recommendations">
          <div className="rec-header">
            <h2>Tavsiya etamiz</h2>
          </div>
          <div className="rec-grid">
            {randomAnimes.map((item) => (
              <div key={item.id} className="rec-card" onClick={() => navigate(`/anime/${item.id}`)}>
                <div className="rec-img-wrapper">
                  <img src={item.image_url} alt={item.title} loading="lazy" />
                  <div className="rec-overlay">
                    <Play size={32} fill="white" />
                  </div>
                  <span className="rec-rating"><Star size={10} fill="gold" /> {item.rating}</span>
                </div>
                <h4 className="rec-title">{item.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Anime;