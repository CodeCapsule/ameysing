import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, QrCode, Play, Pause, SkipForward,
  Volume2, Search, Maximize, Minimize, ListVideo,
  Settings, X, Mic, Trash2, Square, Smartphone,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { useSocketSession } from '../hooks/useSocketSession';
import { searchKaraoke, LOCAL_SONGS } from '../lib/searchYouTube';
import type { Song, RoomUser, RoomSettings } from '../types';

export default function RoomPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const duration = queryParams.get('duration');
  const [userName, setUserName] = useState(queryParams.get('name') ?? '');
  const [tempName, setTempName] = useState('');

  const [activeTab, setActiveTab] = useState<'search' | 'queue' | 'users'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>(LOCAL_SONGS);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFallback, setSearchFallback] = useState(false);

  const [queue, setQueue] = useState<Song[]>([]);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [videoError, setVideoError] = useState(false);

  const [score, setScore] = useState<number | null>(null);
  const [isScoring, setIsScoring] = useState(false);

  const [hoveredSongId, setHoveredSongId] = useState<string | null>(null);

  const [settings, setSettings] = useState<RoomSettings>({
    guestsCanAddSongs: true,
    guestsCanControlPlayer: true,
  });

  const playerRef = useRef<HTMLDivElement>(null);
  const uniqueCounter = useRef(0);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [nowPlayingSongId, setNowPlayingSongId] = useState<number | undefined>(undefined);

  const showNowPlaying =
    currentSong?.uniqueId !== undefined &&
    currentSong.uniqueId === nowPlayingSongId;

  // ─── YouTube player ─────────────────────────────────────────
  // Use refs to break the circular dependency between handleSongFinish and socket functions
  const syncQueueRef = useRef<(q: Song[]) => void>(() => {});
  const syncCurrentSongRef = useRef<(s: Song | null) => void>(() => {});
  const isHostRef = useRef(false);

  const handleSongFinish = useCallback(() => {
    if (!isHostRef.current) return;
    if (isScoring) return;
    setIsScoring(true);
    const newScore = Math.floor(Math.random() * 21) + 80;
    setScore(newScore);
    setTimeout(() => {
      setIsScoring(false);
      setScore(null);
      setQueue((prev) => {
        const nextQueue = prev.slice(1);
        syncQueueRef.current(nextQueue);
        const nextSong = nextQueue[0] || null;
        setCurrentSong(nextSong);
        syncCurrentSongRef.current(nextSong);
        return nextQueue;
      });
    }, 4000);
  }, [isScoring]);

  const handleVideoError = useCallback(() => {
    setVideoError(true);
    setTimeout(() => {
      setVideoError(false);
      setQueue((prev) => {
        const next = prev.slice(1);
        syncQueueRef.current(next);
        return next;
      });
    }, 2000);
  }, []);

  const { ytContainerRef, isPlaying, volume, togglePlayPause: localTogglePlayPause, setVolume } =
    useYouTubePlayer({ currentSong, onSongEnd: handleSongFinish, onVideoError: handleVideoError });

  // ── Socket.io session ──
  const handleRemoteControl = useCallback(
    (action: string) => {
      if (action === 'play') localTogglePlayPause(true);
      else if (action === 'pause') localTogglePlayPause(false);
      else if (action === 'stop') setCurrentSong(null);
      else if (action === 'skip') setQueue((prev) => prev.slice(1));
    },
    [localTogglePlayPause]
  );

  const {
    sessionEndMessage,
    timeLeft,
    isHost,
    syncQueue,
    syncCurrentSong,
    sendPlayerControl,
    sendAddToQueue,
  } = useSocketSession({
    roomId: id,
    userName,
    duration,
    shouldBeHost: queryParams.get('host') === 'true',
    onQueueUpdate: (newQueue) => setQueue(newQueue),
    onCurrentSongUpdate: (song) => setCurrentSong(song),
    onPlayerControl: handleRemoteControl,
    onUsersUpdate: (users) => setRoomUsers(users),
  });

  // Keep refs updated for use in setTimeout callbacks
  useEffect(() => { syncQueueRef.current = syncQueue; }, [syncQueue]);
  useEffect(() => { syncCurrentSongRef.current = syncCurrentSong; }, [syncCurrentSong]);
  useEffect(() => { isHostRef.current = isHost; }, [isHost]);

  // Auto-start: if queue has songs but nothing is playing, start the first one
  useEffect(() => {
    if (isHost && queue.length > 0 && !currentSong) {
      const firstSong = queue[0];
      setCurrentSong(firstSong);
      syncCurrentSongRef.current(firstSong);
    }
  }, [isHost, queue, currentSong]);

  // Wrapped togglePlayPause to handle sync
  const togglePlayPause = useCallback(() => {
    const newState = !isPlaying;
    localTogglePlayPause();
    sendPlayerControl(newState ? 'play' : 'pause');
  }, [isPlaying, localTogglePlayPause, sendPlayerControl]);

  const stopSong = useCallback(() => {
    if (isHost) {
      setIsScoring(false);
      setScore(null);
      setCurrentSong(null);
      syncCurrentSong(null);
      setQueue((prev) => {
        if (prev.length === 0) return prev;
        const next = prev.slice(1);
        syncQueue(next);
        return next;
      });
      sendPlayerControl('stop');
    } else if (settings.guestsCanControlPlayer) {
      sendPlayerControl('stop');
    }
  }, [isHost, syncQueue, sendPlayerControl, settings.guestsCanControlPlayer, syncCurrentSong]);

  const skipSong = useCallback(() => {
    if (isHost) {
      if (queue.length > 0) handleSongFinish();
    } else if (settings.guestsCanControlPlayer) {
      sendPlayerControl('skip');
    }
  }, [isHost, queue.length, handleSongFinish, sendPlayerControl, settings.guestsCanControlPlayer]);

  // ─── Fullscreen (with landscape lock on mobile) ──────────────
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await playerRef.current?.requestFullscreen();
        // Lock to landscape on mobile if supported
        const orientation = screen.orientation;
        if (orientation?.lock) {
          try { await orientation.lock('landscape'); } catch { /* not supported */ }
        }
      } else {
        // Unlock orientation before exiting fullscreen
        const orientation = screen.orientation;
        if (orientation?.unlock) {
          try { orientation.unlock(); } catch { /* ignore */ }
        }
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      // Unlock orientation when exiting fullscreen via Escape key
      if (!fs && screen.orientation?.unlock) {
        try { screen.orientation.unlock(); } catch { /* ignore */ }
      }
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ─── Search handler ────────────────────────────────────────────
  const fetchSongs = useCallback(async (query: string) => {
    setIsSearching(true);
    setSearchFallback(false);
    const { results, usedFallback } = await searchKaraoke(query);
    setSearchResults(results);
    setSearchFallback(usedFallback);
    setIsSearching(false);
  }, []);

  // ─── Initial search load ──────────────────────────────────────
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchSongs('karaoke philippines'); }, [fetchSongs]);

  // ─── "Now Playing" flash — show banner for 3 s on song change ─
  useEffect(() => {
    if (!currentSong) return;
    const show = setTimeout(() => setNowPlayingSongId(currentSong.uniqueId), 0);
    const hide = setTimeout(() => setNowPlayingSongId(undefined), 3000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.uniqueId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) fetchSongs(searchQuery);
  };

  // ─── Queue management ────────────────────────────────────────
  const addToQueue = (song: Song) => {
    uniqueCounter.current += 1;
    const newSong: Song = { ...song, uniqueId: uniqueCounter.current };
    if (isHost) {
      setQueue((prev) => {
        const next = [...prev, newSong];
        syncQueue(next);
        if (prev.length === 0) setActiveTab('queue');
        return next;
      });
      if (!currentSong) {
        setCurrentSong(newSong);
        syncCurrentSong(newSong);
      }
    } else if (settings.guestsCanAddSongs) {
      sendAddToQueue(newSong);
      setActiveTab('queue');
    }
  };

  const removeFromQueue = (uniqueId: number) => {
    if (!isHost) return;
    setQueue((prev) => {
      const next = prev.filter((s) => s.uniqueId !== uniqueId);
      syncQueue(next);
      return next;
    });
  };

  const roomUrl = `${window.location.origin}/room/${id}`;

  // ─── Name gate for direct URL joins ─────────────────────────
  if (!userName) {
    return (
      <div className="landing-container">
        <div className="landing-orb landing-orb-1" />
        <div className="landing-orb landing-orb-2" />
        <div className="modal-overlay name-gate-overlay">
          <div className="modal-content name-gate-modal">
            <div className="modal-header name-gate-header">
              <div className="name-gate-hero">
                <div className="landing-logo-icon name-gate-logo">
                  <Mic size={24} strokeWidth={2} />
                </div>
                <h2 className="name-gate-title">Join Karaoke Room</h2>
              </div>
            </div>
            <div className="modal-body name-gate-body">
              <div className="name-gate-field">
                <label className="field-label">Your Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="landing-room-input name-gate-input"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  maxLength={15}
                  autoFocus
                />
              </div>
              <div className="name-gate-field name-gate-field-room">
                <label className="field-label">Room Code</label>
                <input
                  type="text"
                  className="landing-room-input name-gate-input name-gate-input-disabled"
                  value={id}
                  disabled
                />
              </div>
              <button
                className="landing-join-btn name-gate-btn"
                disabled={!tempName.trim()}
                onClick={() => {
                  if (tempName.trim()) {
                    setUserName(tempName.trim());
                    navigate(`/room/${id}?name=${encodeURIComponent(tempName.trim())}`, { replace: true });
                  }
                }}
              >
                Join Room Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Room UI ────────────────────────────────────────────
  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/')} aria-label="Back to home">
            <ArrowLeft size={20} />
          </button>
          <div className="logo">Amey<span className="logo-tv">Sing</span></div>
          {isHost && <div className="host-badge">HOST</div>}
          <div className="session-id-badge responsive-badge">
            <span className="label-text">SESSION:</span> {id}
          </div>
          {timeLeft && (
            <div className={`session-timer responsive-badge ${timeLeft.startsWith('00:05') ? 'critical' : ''}`}>
              <span className="label-text">TIME:</span>
              <span className="time-value">{timeLeft}</span>
            </div>
          )}
        </div>
        <div className="header-actions">
          <button className="icon-btn" onClick={() => setShowSettings(true)} aria-label="Settings">
            <Settings size={20} />
          </button>
          <button className="room-code-btn" onClick={() => setShowQR(true)}>
            <QrCode size={16} /> {id}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={`main-content${!showSidebar ? ' sidebar-hidden' : ''}`}>

        {/* ── Player ── */}
        <div className="player-container" ref={playerRef}>
          {currentSong ? (
            <div className="playing-state">
              <img src={currentSong.thumb} alt="backdrop" className="player-backdrop" />
              <div ref={ytContainerRef} className="yt-container" />

              {videoError && (
                <div className="video-error-overlay">
                  <X size={48} color="#ef4444" />
                  <p className="video-error-text">Video unavailable — skipping...</p>
                </div>
              )}

              {score !== null && (
                <div className="score-overlay">
                  <span className="score-label">YOUR SCORE</span>
                  <span className="score-value">{score}</span>
                </div>
              )}

              <div className="player-gradient" />

              {showNowPlaying && (
                <div className="now-playing-bar">
                  <div className="now-playing-info">
                    <span className="now-playing-label">NOW PLAYING</span>
                    <span className="now-playing-title">{currentSong.title}</span>
                    <span className="now-playing-artist">{currentSong.subtitle}</span>
                  </div>
                </div>
              )}


              <div className="player-top-controls player-top-controls-bg">
                <button className={`icon-btn${!showSidebar ? ' toggle-active' : ''}`} onClick={() => setShowSidebar(!showSidebar)} aria-label="Toggle sidebar"><ListVideo size={18} color="#fff" /></button>
                <button className="icon-btn mobile-only-btn" onClick={toggleFullscreen} aria-label="Landscape fullscreen" title="Landscape Fullscreen">
                  <Smartphone size={18} color="#fff" style={{ transform: 'rotate(90deg)' }} />
                </button>
                <button className="icon-btn" onClick={toggleFullscreen} aria-label="Fullscreen">
                  {isFullscreen ? <Minimize size={18} color="#fff" /> : <Maximize size={18} color="#fff" />}
                </button>
              </div>

              {/* Fullscreen playback controls overlay */}
              {isFullscreen && (
                <div className="fs-controls-overlay">
                  <div className="fs-controls-bar">
                    <button className="fs-control-btn" onClick={togglePlayPause}>
                      {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
                    </button>
                    <button className="fs-control-btn fs-control-stop" onClick={stopSong}>
                      <Square size={18} fill="currentColor" />
                    </button>
                    <button className="fs-control-btn" onClick={skipSong}>
                      <SkipForward size={22} fill="currentColor" />
                    </button>
                    <div className="fs-volume-row">
                      <Volume2 size={16} />
                      <input type="range" min={0} max={100} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="volume-slider" />
                    </div>
                    <button className="fs-control-btn fs-exit-btn" onClick={toggleFullscreen}>
                      <Minimize size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <img src="/default-bg.jpg" alt="background" className="player-default-bg" />
              <div className="player-default-gradient" />
              <div className="player-top-controls">
                <button className={`icon-btn${!showSidebar ? ' toggle-active' : ''}`} onClick={() => setShowSidebar(!showSidebar)}><ListVideo size={18} /></button>
                <button className="icon-btn" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </div>
              <div className="player-empty-state" style={{ zIndex: 2 }}>
                <div className="player-icon"><Mic size={64} strokeWidth={1.5} /></div>
                <h2 className="player-title">Waiting for a song...</h2>
                <p className="player-subtitle">Reserve a song to start singing!</p>
              </div>
            </>
          )}
        </div>

        {/* ── Sidebar / Interactive Area ── */}
        <div className={`interactive-area${!showSidebar ? ' hidden' : ''}`}>

          {(isHost || settings.guestsCanControlPlayer) && (
            <div className="remote-hub-mobile-only remote-hub-panel">
              <div className="remote-hub-buttons">
                <button className="remote-btn" onClick={togglePlayPause}>
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                  <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                </button>
                <div className="remote-divider" />
                <button className="remote-btn remote-btn-stop" onClick={stopSong}>
                  <Square size={14} fill="currentColor" />
                  <span>STOP</span>
                </button>
                <div className="remote-divider" />
                <button className="remote-btn" onClick={skipSong}>
                  <SkipForward size={18} fill="currentColor" />
                  <span>NEXT</span>
                </button>
              </div>
              <div className="volume-row">
                <Volume2 size={16} color="#a855f7" />
                <input type="range" min={0} max={100} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="volume-slider" aria-label="Volume" />
              </div>
            </div>
          )}

          <div className="tabs-container">
            <button className={`tab-btn${activeTab === 'search' ? ' active' : ''}`} onClick={() => setActiveTab('search')}>Search</button>
            <button className={`tab-btn${activeTab === 'queue' ? ' active' : ''}`} onClick={() => setActiveTab('queue')}>
              <span className="tab-btn-content">
                Reserved
                {queue.length > 0 && <span className="tab-badge">{queue.length}</span>}
              </span>
            </button>
            <button className={`tab-btn${activeTab === 'users' ? ' active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
          </div>

          {activeTab === 'search' && (
            <>
              <form className="search-wrapper" onSubmit={handleSearch}>
                <div className="search-input-container">
                  <input type="text" className="search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search songs..." />
                </div>
                <button type="submit" className="search-btn"><Search size={20} /></button>
              </form>
              {searchFallback && <div className="search-fallback-notice">⚠ Showing local library — search API unavailable</div>}
              <div className="results-list">
                {isSearching ? (
                  <div className="loader-wrapper"><div className="loader" /></div>
                ) : (
                  searchResults.map((result) => (
                    <div key={result.id} className="result-card" onMouseEnter={() => setHoveredSongId(result.id)} onMouseLeave={() => setHoveredSongId(null)}>
                      <div className="result-thumb-container">
                        <img src={result.thumb} alt={result.title} className="result-thumb" />
                        {hoveredSongId === result.id && (
                          <div className="preview-overlay">
                            <iframe src={`https://www.youtube.com/embed/${result.videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0`} title="Preview" className="preview-iframe" />
                          </div>
                        )}
                      </div>
                      <div className="result-info">
                        <h4 className="result-title">{result.title}</h4>
                        <p className="result-subtitle">{result.subtitle}</p>
                      </div>
                      <button className="play-btn-styled" onClick={() => addToQueue(result)}>
                        <Play size={14} fill="currentColor" /> Play
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'queue' && (
            <>
              <div className="queue-header"><h3>Reserved Songs</h3><span className="queue-badge">{queue.length}</span></div>
              <div className="results-list">
                {queue.length === 0 ? (
                  <div className="queue-empty-state">
                    <div className="queue-empty-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                      </svg>
                    </div>
                    <h3 className="queue-empty-title">Queue is empty</h3>
                    <p className="queue-empty-subtitle">Search for your favourite songs to add them here</p>
                  </div>
                ) : (
                  queue.map((song, index) => (
                    <div key={song.uniqueId} className="result-card queue-card">
                      <div className="queue-thumb-container">
                        <img src={song.thumb} alt={song.title} className="result-thumb" />
                        <span className="queue-number-badge">{index + 1}</span>
                      </div>
                      <div className="result-info">
                        <h4 className="result-title">{song.title}</h4>
                        <p className="queue-admin-text">{index === 0 ? '♫ Now Playing' : 'Up Next'}</p>
                      </div>
                      {index > 0 && isHost && (
                        <button className="icon-btn queue-remove-btn" onClick={() => removeFromQueue(song.uniqueId!)} title="Remove from queue"><Trash2 size={16} /></button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <>
              <div className="queue-header"><h3>Users</h3><span className="queue-badge">{roomUsers.length || 1}</span></div>
              <div className="results-list">
                {(roomUsers.length > 0 ? roomUsers : [{ id: 'self', name: userName, isHost }]).map((user) => (
                  <div className="result-card" key={user.id}>
                    <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                    <div className="result-info">
                      <h4 className="result-title">{user.name}{user.name === userName ? ' (You)' : ''}</h4>
                      <p className="queue-admin-text">{user.isHost ? 'Room Admin' : 'Guest'}</p>
                    </div>
                    {user.isHost && <div className="host-badge host-badge-sm">HOST</div>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {showQR && (
        <div className="modal-overlay" onClick={() => setShowQR(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>📱 Remote Control</h3><button className="icon-btn" onClick={() => setShowQR(false)}><X size={20} /></button></div>
            <div className="modal-body qr-modal-body">
              <p className="qr-description">Scan the QR code or visit the link to control the karaoke from your phone.</p>
              <div className="qr-code-wrapper"><QRCodeSVG value={roomUrl} size={200} /></div>
              <div className="qr-url">{roomUrl}</div>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>⚙️ Karaoke Settings</h3><button className="icon-btn" onClick={() => setShowSettings(false)}><X size={20} /></button></div>
            <div className="modal-body">
              <h4 className="settings-section-title">Remote Permissions</h4>
              {([
                { key: 'guestsCanAddSongs', label: 'Allow guests to add songs' },
                { key: 'guestsCanControlPlayer', label: 'Allow guests to control player' },
              ] as { key: keyof RoomSettings; label: string }[]).map(({ key, label }) => (
                <div key={key} className="settings-row">
                  <span>{label}</span>
                  <input type="checkbox" checked={settings[key]} onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.checked }))} className="settings-checkbox" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(isHost || settings.guestsCanControlPlayer) && (
        <div className="floating-remote-hub desktop-only-hub">
          <button className="remote-btn" onClick={togglePlayPause}>
            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>
          <div className="remote-divider" />
          <button className="remote-btn remote-btn-stop" onClick={stopSong}>
            <Square size={14} fill="currentColor" /><span>STOP</span>
          </button>
          <div className="remote-divider" />
          <button className="remote-btn" onClick={skipSong}>
            <SkipForward size={16} fill="currentColor" /><span>NEXT</span>
          </button>
          <div className="remote-divider" />
          <div className="volume-row">
            <Volume2 size={14} color="rgba(255,255,255,0.6)" />
            <input type="range" min={0} max={100} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="volume-slider volume-slider-sm" aria-label="Volume" />
          </div>
        </div>
      )}

      {sessionEndMessage && (
        <div className="modal-overlay session-end-overlay">
          <div className="modal-content session-end-modal">
            <div className="modal-body session-end-body">
              <div className="session-end-icon"><Square size={40} color="#ef4444" fill="#ef4444" /></div>
              <h2 className="session-end-title">Session Over</h2>
              <p className="session-end-text">{sessionEndMessage}</p>
              <button className="landing-join-btn session-end-btn" onClick={() => navigate('/')}>Back to Home</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
