import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Plyr } from 'plyr-react';
import 'plyr-react/plyr.css';
import { 
  Play, Star, Calendar, Clock, ChevronLeft, Share2, Bookmark
} from 'lucide-react';
import './Anime.css';

const supabase = createClient(
  'https://rxynseqxmfjjindbttdt.supabase.co', 
  'sb_publishable_C4oGHcS1aTQcaZ87PbQQLw_M7JSCNoz'
);

const Anime = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [currentEp, setCurrentEp] = useState(null);
  const [randomAnimes, setRandomAnimes] = useState([]);
  
  const user = JSON.parse(localStorage.getItem('animeyUser'));

  useEffect(() => {
    fetchAnimeDetails();
    fetchRandomAnimes();
  }, [id]);

  const fetchAnimeDetails = async () => {
    setLoading(true);
    const { data: animeData } = await supabase.from('anime_list').select('*').eq('id', id).single();
    setAnime(animeData);

    const { data: epData } = await supabase.from('episodes').select('*').eq('anime_id', id).order('episode_number', { ascending: true });
    setEpisodes(epData || []);
    if (epData?.length > 0) setCurrentEp(epData[0]);
    
    setLoading(false);
  };

  const fetchRandomAnimes = async () => {
    const { data } = await supabase.from('anime_list').select('*').limit(16);
    if (data) {
      const shuffled = data.sort(() => 0.5 - Math.random());
      setRandomAnimes(shuffled.slice(0, 16));
    }
  };

  const plyrOptions = {
    controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'],
    settings: ['quality', 'speed'],
  };

  if (loading) {
    return (
      <div className="anime-details-page">
        <div className="skeleton-hero"></div>
        <div className="container anime-content-wrapper">
          <div className="skeleton-back-btn"></div>
          <div className="anime-main-info">
            <div className="anime-poster-side">
              <div className="skeleton-poster"></div>
              <div className="skeleton-buttons"></div>
            </div>
            <div className="anime-text-side">
              <div className="skeleton-title"></div>
              <div className="skeleton-meta"></div>
              <div className="skeleton-genres"></div>
              <div className="skeleton-description"></div>
            </div>
          </div>
          <div className="player-section">
            <div className="skeleton-section-title"></div>
            <div className="skeleton-player"></div>
            <div className="skeleton-episodes"></div>
          </div>
          <div className="random-section">
            <div className="skeleton-section-title"></div>
            <div className="skeleton-random-grid">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="skeleton-card"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!anime) return <div className="error-msg">Anime topilmadi!</div>;

  return (
    <div className="anime-details-page">
      <div className="anime-hero-bg" style={{ backgroundImage: `url(${anime.poster_url || anime.image_url})` }}>
        <div className="hero-overlay"></div>
      </div>

      <div className="container anime-content-wrapper">
        <button className="back-btn" onClick={() => navigate(-1)}><ChevronLeft /> Orqaga qaytish</button>

        <div className="anime-main-info">
          <div className="anime-poster-side">
            <img src={anime.image_url} alt={anime.title} className="main-img" />
            <div className="action-btns">
              <button className="btn-save"><Bookmark /> Saqlab qo'shish</button>
              <button className="btn-share"><Share2 /> Ulashish</button>
            </div>
          </div>

          <div className="anime-text-side">
            <h1 className="anime-title">{anime.title}</h1>
            <div className="anime-meta-row">
              <span className="meta-item rating"><Star size={16} fill="gold" /> {anime.rating}</span>
              <span className="meta-item"><Calendar size={16} /> {anime.year}</span>
              <span className="meta-item"><Clock size={16} /> {episodes.length} qism</span>
            </div>
            <div className="genre-list">
              {anime.genres?.split(',').map((g, i) => <span key={i} className="genre-tag">{g.trim()}</span>)}
            </div>
            <p className="anime-description">{anime.description}</p>
          </div>
        </div>

        <div className="player-section">
          <div className="section-title">
            <Play size={24} color="#007aff" />
            <h2>{currentEp ? `${currentEp.episode_number}-qism` : "Qismlar mavjud emas"}</h2>
          </div>

          <div className="video-player-container">
            {currentEp ? (
              <Plyr
                source={{
                  type: 'video',
                  sources: [{ src: currentEp.video_url, provider: 'html5' }]
                }}
                options={plyrOptions}
              />
            ) : (
              <div className="no-video">Video yuklanmagan</div>
            )}
          </div>

          <div className="episodes-grid-wrapper">
            <h3>Qismlar:</h3>
            <div className="episodes-grid">
              {episodes.map((ep) => (
                <button 
                  key={ep.id} 
                  className={`ep-btn ${currentEp?.id === ep.id ? 'active' : ''}`}
                  onClick={() => setCurrentEp(ep)}
                >
                  {`${ep.episode_number}-qism`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="random-anime-section">
          <div className="section-title">
            <Star size={24} color="#007aff" />
            <h2>Boshqa Animeler</h2>
          </div>
          <div className="random-grid">
            {randomAnimes.map((item) => (
              <div key={item.id} className="random-card" onClick={() => navigate(`/anime/${item.id}`)}>
                <img src={item.image_url} alt={item.title} />
                <div className="random-card-info">
                  <h4>{item.title}</h4>
                  <span className="random-rating"><Star size={14} fill="gold" /> {item.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Anime;