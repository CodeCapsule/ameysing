import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Music, Users, Sparkles, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [duration, setDuration] = useState('1');
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    if (!userName.trim()) {
      alert("Please enter your name first!");
      return;
    }
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/room/${newRoomId}?name=${encodeURIComponent(userName)}&duration=${duration}&host=true`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert("Please enter your name first!");
      return;
    }
    if (roomId.trim()) {
      navigate(`/room/${roomId.toUpperCase()}?name=${encodeURIComponent(userName)}`);
    }
  };

  return (
    <div className="landing-container">
      {/* Animated background orbs */}
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />
      <div className="landing-orb landing-orb-3" />

      <div className="landing-content">
        {/* Logo & Hero */}
        <div className="landing-hero">
          <div className="landing-logo-icon">
            <Mic size={36} strokeWidth={2} />
          </div>
          <h1 className="landing-title">
            Amey<span className="landing-title-accent">Sing</span>
          </h1>
          <p className="landing-tagline">Your premium online karaoke room</p>
        </div>

        {/* User Name Input */}
        <div className="landing-card" style={{ marginBottom: '1.5rem', background: 'rgba(20, 20, 30, 0.6)' }}>
          <input
            type="text"
            placeholder="Enter Your Name"
            className="landing-room-input"
            style={{ width: '100%', textAlign: 'center', fontSize: '1.1rem' }}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            maxLength={15}
          />
        </div>

        {/* Create Room Card */}
        <div className="landing-card landing-card-primary">
          <div className="duration-selector" style={{ marginBottom: '1rem', width: '100%' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem', textAlign: 'left' }}>
              Session Duration
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {['1', '2', '3'].map((h) => (
                <button
                  key={h}
                  onClick={() => setDuration(h)}
                  className={`duration-btn ${duration === h ? 'active' : ''}`}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: duration === h ? 'rgba(100, 100, 255, 0.3)' : 'rgba(255,255,255,0.05)',
                    color: duration === h ? '#fff' : '#aaa',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.9rem'
                  }}
                >
                  {h}{h === '1' ? ' hr' : ' hrs'}
                </button>
              ))}
            </div>
          </div>

          <button
            className="landing-create-btn"
            onClick={handleCreateRoom}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <span className="landing-create-btn-content">
              <Sparkles size={20} className={isHovering ? 'sparkle-animate' : ''} />
              Create New Room
            </span>
            <ArrowRight size={20} className={`landing-arrow ${isHovering ? 'arrow-animate' : ''}`} />
          </button>
        </div>

        {/* Divider */}
        <div className="landing-divider">
          <div className="landing-divider-line" />
          <span className="landing-divider-text">or join a friend</span>
          <div className="landing-divider-line" />
        </div>

        {/* Join Room Card */}
        <div className="landing-card">
          <form onSubmit={handleJoinRoom} className="landing-join-form">
            <input
              type="text"
              placeholder="Enter Room Code"
              className="landing-room-input"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              maxLength={8}
            />
            <button type="submit" className="landing-join-btn" disabled={!roomId.trim() || !userName.trim()}>
              Join Room
            </button>
          </form>
        </div>

        {/* Features */}
        <div className="landing-features">
          <div className="landing-feature">
            <Music size={18} />
            <span>YouTube Karaoke</span>
          </div>
          <div className="landing-feature-dot" />
          <div className="landing-feature">
            <Users size={18} />
            <span>Room Sharing</span>
          </div>
          <div className="landing-feature-dot" />
          <div className="landing-feature">
            <Sparkles size={18} />
            <span>Live Scoring</span>
          </div>
        </div>
      </div>
    </div>
  );
}
