import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus, Trash2, Image as ImageIcon, Star, LogOut, 
  Loader2, LayoutDashboard, Film, Tv, AlertTriangle, 
  MessageSquare, PlayCircle, Menu, X, Users, Calendar, Tags
} from 'lucide-react';
import './Admin.css';

const supabase = createClient(
  'https://rxynseqxmfjjindbttdt.supabase.co', 
  'sb_publishable_C4oGHcS1aTQcaZ87PbQQLw_M7JSCNoz'
);

const Admin = () => {
  // Sahifa holatlari
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Ma'lumotlar
  const [list, setList] = useState({ animes: [], carousels: [], episodes: [], messages: [] });
  const [stats, setStats] = useState({ users: 0, animes: 0 });

  // Formlar uchun holatlar
  const [animeForm, setAnimeForm] = useState({ title: '', rating: '', year: '', genres: '', desc: '', file: null });
  const [episodeForm, setEpisodeForm] = useState({ anime_id: '', number: '', url: '' });
  const [msgForm, setMsgForm] = useState({ title: '', text: '' });
  const [posterForm, setPosterForm] = useState({ anime_id: '', file: null });

  // 1. AUTH TEKSHIRUV: Malika ekanligini localStorage-dan tekshirish
  const loggedUser = JSON.parse(localStorage.getItem('animeyUser'));
  const isMalika = loggedUser?.name === "Malika" && loggedUser?.isAdmin === true;

  useEffect(() => {
    if (isMalika) {
      fetchData();
    }
  }, [isMalika]);

  const fetchData = async () => {
    const { data: animes } = await supabase.from('anime_list').select('*');
    const { data: carousels } = await supabase.from('carousel_list').select('*');
    const { data: episodes } = await supabase.from('episodes').select('*, anime_list(title)');
    const { data: messages } = await supabase.from('notifications').select('*');
    const { count: userCount } = await supabase.from('users_list').select('*', { count: 'exact', head: true });

    setList({ animes: animes || [], carousels: carousels || [], episodes: episodes || [], messages: messages || [] });
    setStats({ users: userCount || 0, animes: animes?.length || 0 });
  };

  if (!isMalika) {
    return (
      <div className="error-404">
        <AlertTriangle size={80} color="#ff3b30" />
        <h1>404</h1>
        <p>Kechirasiz, ushbu sahifa faqat Admin (Malika) uchun!</p>
        <button onClick={() => window.location.href = '/'}>Bosh sahifaga qaytish</button>
      </div>
    );
  }

  // Fayl yuklash funksiyasi
  const uploadFile = async (file, bucket) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw error;
    const { data: url } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return url.publicUrl;
  };

  // --- AMALLAR ---
  const handleAddAnime = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = await uploadFile(animeForm.file, 'anime-images');
      await supabase.from('anime_list').insert([{ 
        title: animeForm.title, rating: animeForm.rating, 
        year: animeForm.year, genres: animeForm.genres, 
        description: animeForm.desc, image_url: url 
      }]);
      setAnimeForm({ title: '', rating: '', year: '', genres: '', desc: '', file: null });
      fetchData();
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  const handleAddEpisode = async (e) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from('episodes').insert([{ 
      anime_id: episodeForm.anime_id, 
      episode_number: episodeForm.number, 
      video_url: episodeForm.url 
    }]);
    setEpisodeForm({ anime_id: '', number: '', url: '' });
    fetchData();
    setLoading(false);
  };

  const handleAddPoster = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = await uploadFile(posterForm.file, 'anime-images');
      await supabase.from('anime_list').update({ poster_url: url }).eq('id', posterForm.anime_id);
      alert("Poster yangilandi!");
      fetchData();
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    await supabase.from('notifications').insert([{ title: msgForm.title, message: msgForm.text }]);
    setMsgForm({ title: '', text: '' });
    fetchData();
  };

  const deleteItem = async (id, table) => {
    if (window.confirm("O'chirilsinmi?")) {
      await supabase.from(table).delete().eq('id', id);
      fetchData();
    }
  };

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">ANIMEY<span>.UZ</span></div>
          <button className="close-menu" onClick={() => setIsSidebarOpen(false)}><X /></button>
        </div>
        <nav>
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => {setActiveTab('dashboard'); setIsSidebarOpen(false)}}><LayoutDashboard /> Dashboard</button>
          <button className={activeTab === 'anime' ? 'active' : ''} onClick={() => {setActiveTab('anime'); setIsSidebarOpen(false)}}><Tv /> Animelar</button>
          <button className={activeTab === 'episodes' ? 'active' : ''} onClick={() => {setActiveTab('episodes'); setIsSidebarOpen(false)}}><PlayCircle /> Qismlar</button>
          <button className={activeTab === 'posters' ? 'active' : ''} onClick={() => {setActiveTab('posters'); setIsSidebarOpen(false)}}><ImageIcon /> Posterlar</button>
          <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => {setActiveTab('messages'); setIsSidebarOpen(false)}}><MessageSquare /> Xabarlar</button>
          <button className="logout" onClick={() => {localStorage.clear(); window.location.href='/';}}><LogOut /> Chiqish</button>
        </nav>
      </aside>

      <main className="admin-content">
        <header className="content-header">
          <button className="hamburger" onClick={() => setIsSidebarOpen(true)}><Menu /></button>
          <h1>{activeTab.toUpperCase()}</h1>
          <div className="admin-badge">Admin: Malika</div>
        </header>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-view">
            <div className="stats-grid">
              <div className="stat-card"><Users /> <div><h3>{stats.users}</h3><p>Foydalanuvchilar</p></div></div>
              <div className="stat-card"><Tv /> <div><h3>{stats.animes}</h3><p>Jami Animelar</p></div></div>
              <div className="stat-card"><PlayCircle /> <div><h3>{list.episodes.length}</h3><p>Jami Qismlar</p></div></div>
            </div>
          </div>
        )}

        {/* ANIME QO'SHISH */}
        {activeTab === 'anime' && (
          <div className="anime-view">
            <form className="admin-form-card" onSubmit={handleAddAnime}>
              <h3>Yangi Anime</h3>
              <div className="form-grid">
                <input type="text" placeholder="Nomi" required value={animeForm.title} onChange={e => setAnimeForm({...animeForm, title: e.target.value})} />
                <input type="number" step="0.1" placeholder="Reyting" required value={animeForm.rating} onChange={e => setAnimeForm({...animeForm, rating: e.target.value})} />
                <input type="number" placeholder="Yili" required value={animeForm.year} onChange={e => setAnimeForm({...animeForm, year: e.target.value})} />
                <input type="text" placeholder="Janrlar (Komediya, Ekshn)" required value={animeForm.genres} onChange={e => setAnimeForm({...animeForm, genres: e.target.value})} />
                <textarea placeholder="Tavsif..." className="full-width" value={animeForm.desc} onChange={e => setAnimeForm({...animeForm, desc: e.target.value})} />
                <input type="file" required onChange={e => setAnimeForm({...animeForm, file: e.target.files[0]})} />
                <button type="submit" disabled={loading}>{loading ? <Loader2 className="spin" /> : "Saqlash"}</button>
              </div>
            </form>

            <div className="card-grid">
              {list.animes.map(a => (
                <div key={a.id} className="data-card">
                  <img src={a.image_url} alt="" />
                  <div className="card-info">
                    <h4>{a.title}</h4>
                    <p><Star size={12} fill="gold" /> {a.rating} | <Calendar size={12} /> {a.year}</p>
                    <button onClick={() => deleteItem(a.id, 'anime_list')} className="del-btn"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QISM QO'SHISH */}
        {activeTab === 'episodes' && (
          <div className="episodes-view">
            <form className="admin-form-card" onSubmit={handleAddEpisode}>
              <h3>Qism Qo'shish (Hotlink)</h3>
              <div className="form-grid">
                <select required value={episodeForm.anime_id} onChange={e => setEpisodeForm({...episodeForm, anime_id: e.target.value})}>
                  <option value="">Animeni tanlang</option>
                  {list.animes.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                </select>
                <input type="number" placeholder="Nechanchi qism?" required value={episodeForm.number} onChange={e => setEpisodeForm({...episodeForm, number: e.target.value})} />
                <input type="text" placeholder="Video URL (Hotlink)" className="full-width" required value={episodeForm.url} onChange={e => setEpisodeForm({...episodeForm, url: e.target.value})} />
                <button type="submit">Qismni Qo'shish</button>
              </div>
            </form>

            <div className="card-grid">
              {list.episodes.map(ep => (
                <div key={ep.id} className="data-card ep-card">
                  <div className="card-info">
                    <h4>{ep.anime_list?.title}</h4>
                    <p className="ep-num">{ep.episode_number}-qism</p>
                    <small>{ep.video_url.substring(0, 30)}...</small>
                    <button onClick={() => deleteItem(ep.id, 'episodes')} className="del-btn"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* POSTERLAR */}
        {activeTab === 'posters' && (
          <div className="posters-view">
            <form className="admin-form-card" onSubmit={handleAddPoster}>
              <h3>Animega Poster (Banner) Qo'shish</h3>
              <div className="form-grid">
                <select required onChange={e => setPosterForm({...posterForm, anime_id: e.target.value})}>
                  <option value="">Animeni tanlang</option>
                  {list.animes.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                </select>
                <input type="file" required onChange={e => setPosterForm({...posterForm, file: e.target.files[0]})} />
                <button type="submit">Posterni Saqlash</button>
              </div>
            </form>
            <div className="card-grid">
              {list.animes.filter(a => a.poster_url).map(a => (
                <div key={a.id} className="data-card poster-card">
                  <img src={a.poster_url} className="poster-img" alt="" />
                  <div className="card-info"><h4>{a.title}</h4></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* XABARLAR */}
        {activeTab === 'messages' && (
          <div className="messages-view">
            <form className="admin-form-card" onSubmit={handleSendMessage}>
              <h3>Xabar yuborish</h3>
              <div className="form-grid">
                <input type="text" placeholder="Sarlavha" className="full-width" required value={msgForm.title} onChange={e => setMsgForm({...msgForm, title: e.target.value})} />
                <textarea placeholder="Xabar matni..." className="full-width" required value={msgForm.text} onChange={e => setMsgForm({...msgForm, text: e.target.value})} />
                <button type="submit">Yuborish</button>
              </div>
            </form>
            <div className="card-grid">
              {list.messages.map(m => (
                <div key={m.id} className="data-card msg-card">
                  <div className="card-info">
                    <h4>{m.title}</h4>
                    <p>{m.message}</p>
                    <button onClick={() => deleteItem(m.id, 'notifications')} className="del-btn"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;