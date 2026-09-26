import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, FolderOpen, Bot, Bell, Users, Sparkles, ShieldCheck, Fingerprint, WifiOff } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import './index.css';

// --- API Service (Production Mode) ---
const API_URL = "http://localhost:8000";

const api = {
  login: async (aadhaar_id) => {
    const res = await fetch(`${API_URL}/users/login?aadhaar_id=${aadhaar_id}`, { method: 'POST' });
    if (!res.ok) throw new Error("Invalid User");
    return await res.json();
  },
  getDashboard: async (id) => {
    const res = await fetch(`${API_URL}/users/${id}/dashboard`);
    return await res.json();
  },
  getAlerts: async (id) => {
    const res = await fetch(`${API_URL}/users/${id}/alerts`);
    return await res.json();
  },
  getMentors: async () => {
    const res = await fetch(`${API_URL}/mentors`);
    return await res.json();
  },
  getVouchers: async (id) => {
    const res = await fetch(`${API_URL}/users/${id}/vouchers`);
    return await res.json();
  },
  getChatHistory: async (id) => {
    const res = await fetch(`${API_URL}/users/${id}/chat`);
    return await res.json();
  },
  sendChatMessage: async (id, text) => {
    const timestamp = new Date().toISOString();
    const res = await fetch(`${API_URL}/users/${id}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: 'user', text, timestamp })
    });
    return await res.json();
  }
};

function BottomNav() {
  const location = useLocation();
  const path = location.pathname;
  
  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${path === '/' ? 'active' : ''}`}><Home size={22} /><span>Home</span></Link>
      <Link to="/wallet" className={`nav-item ${path === '/wallet' ? 'active' : ''}`}><FolderOpen size={22} /><span>Wallet</span></Link>
      <Link to="/jago" className={`nav-item ${path === '/jago' ? 'active' : ''}`}><Bot size={22} /><span>JAGO AI</span></Link>
      <Link to="/mentors" className={`nav-item ${path === '/mentors' ? 'active' : ''}`}><Users size={22} /><span>Eklavya</span></Link>
      <Link to="/alerts" className={`nav-item ${path === '/alerts' ? 'active' : ''}`}><Bell size={22} /><span>Alerts</span></Link>
    </nav>
  );
}

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    window.addEventListener('offline', () => setIsOffline(true));
    window.addEventListener('online', () => setIsOffline(false));
    return () => {
      window.removeEventListener('offline', () => setIsOffline(true));
      window.removeEventListener('online', () => setIsOffline(false));
    }
  }, []);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        {isOffline && (
          <div style={{background: '#FCA5A5', color: '#7F1D1D', padding: '6px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px'}}>
            <WifiOff size={14} /> Offline Mode: Changes saved locally
          </div>
        )}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/wallet" element={<Wallet user={user} />} />
            <Route path="/jago" element={<JagoAI user={user} />} />
            <Route path="/alerts" element={<Alerts user={user} />} />
            <Route path="/mentors" element={<Mentorship user={user} />} />
            <Route path="/profile" element={<div className="p-4"><h2>Profile</h2><p>{user.full_name}</p><button onClick={() => setUser(null)} className="btn-primary mt-4">Logout</button></div>} />
          </Routes>
        </main>
        <BottomNav />
      </div>
      <Toaster position="top-center" />
    </BrowserRouter>
  );
}

// --- Login Component ---
function Login({ onLogin }) {
  const [aadhaar, setAadhaar] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = await api.login(aadhaar);
      toast.success(`Welcome, ${userData.full_name}!`);
      onLogin(userData);
    } catch (err) {
      toast.error('Login failed. Use 123456789012');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Gov Logo" width="40" />
          </div>
          <h1 className="login-title">MoTA Scholar</h1>
          <p className="login-subtitle">Unified Tribal Scholarship Portal with AI & Blockchain capabilities.</p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input 
              type="text" 
              value={aadhaar} 
              onChange={(e) => setAadhaar(e.target.value)} 
              placeholder="Enter 12-digit Aadhaar"
              className="input-field"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Authenticating...' : 'Login with OTP →'}
          </button>
          
          <button type="button" className="btn-outline" onClick={() => toast('Face Auth initialized...', {icon: '📱'})}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
              <Fingerprint size={18} />
              <span>Face/Biometric Auth (OTR)</span>
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Dashboard Component ---
function Dashboard({ user }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getDashboard(user.id).then(setStats);
  }, [user.id]);

  return (
    <div className="dashboard">
      <header className="dashboard-header" style={{display: 'flex', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', alignItems: 'center', flex: 1}}>
          <Link to="/profile" style={{textDecoration: 'none'}}>
            <div className="avatar">{user.full_name.charAt(0)}</div>
          </Link>
          <div>
            <p className="greeting">Good day,</p>
            <h2>{user.full_name}</h2>
          </div>
        </div>
        <span className="status-badge" style={{background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0'}}>Sync Active</span>
      </header>

      {/* USP 1: Pre-Flight DBT Health Check */}
      {!user.npci_mapped && (
        <div style={{padding: '24px 24px 0 24px'}}>
          <div className="feature-box" style={{background: 'linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 100%)', borderColor: '#FCA5A5'}}>
            <div className="section-header" style={{marginBottom: '8px'}}>
              <h4 style={{fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px'}}><ShieldCheck size={16} color="#DC2626"/> DBT Health Alert</h4>
              <span className="status-badge" style={{background: '#FEE2E2', color: '#DC2626'}}>NPCI Unlinked</span>
            </div>
            <p className="text-sm text-gray" style={{marginBottom: '12px'}}>Your Aadhaar is not mapped to NPCI. Your scholarship funds will fail to transfer.</p>
            <button className="btn-primary" style={{padding: '10px', fontSize: '0.9rem'}}>Open IPPB Account Instantly</button>
          </div>
        </div>
      )}

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value text-primary">₹{stats.total_received.toLocaleString('en-IN')}</div>
            <div className="stat-label">Total Received</div>
          </div>
          <div className="stat-card">
            <div className="stat-value text-secondary">{stats.active_applications}</div>
            <div className="stat-label">Active Apps</div>
          </div>
          <div className="stat-card">
            <div className="stat-value text-accent">{stats.documents_verified}/{stats.total_documents}</div>
            <div className="stat-label">Docs Verified</div>
          </div>
        </div>
      )}

      <div className="section">
        <div className="section-header">
          <h3 className="section-title">AI Eligibility Engine</h3>
          <span className="ai-badge"><Sparkles size={12} /> AI Predictor</span>
        </div>
        
        <div className="app-card" style={{border: '1.5px solid var(--accent)'}}>
          <div className="app-card-header">
            <h4>Top Class Education Scheme</h4>
            <span className="status-badge pending">Eligible</span>
          </div>
          <p className="text-sm text-gray">Based on your XII marks and PVTG status, you have a high probability of selection.</p>
          <div className="match-score">
            <span className="text-xs font-medium">Match Score: 92%</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '92%'}}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h3 className="section-title">Active Applications</h3>
        </div>
        <div className="app-list">
          {user.applications.map(app => (
            <div key={app.id} className="app-card">
              <div className="app-card-header">
                <h4>{app.scheme_name}</h4>
                <span className={`status-badge ${app.status}`}>{app.status}</span>
              </div>
              <p className="text-sm text-gray">{app.academic_year} • {app.id}</p>
              {app.status === 'disbursed' && (
                <div style={{marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#047857', background: '#ECFDF5', padding: '4px 8px', borderRadius: '4px'}}>
                  <ShieldCheck size={14} /> Smart Contract Disbursed
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Wallet Component (Blockchain) ---
function Wallet({ user }) {
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    api.getVouchers(user.id).then(setVouchers);
  }, [user.id]);

  return (
    <div className="dashboard">
      <header className="dashboard-header" style={{flexDirection: 'column', alignItems: 'flex-start'}}>
        <h2>Immutable Vault</h2>
        <p className="text-sm text-gray" style={{marginTop: '4px'}}>Blockchain-secured academic credentials</p>
      </header>

      <div className="section" style={{marginTop: '24px'}}>
        <div className="feature-box">
          <div className="section-header" style={{marginBottom: '8px'}}>
            <h4 style={{fontSize: '1rem'}}>DigiLocker Node Connected</h4>
            <span className="blockchain-badge"><ShieldCheck size={12} /> Verified</span>
          </div>
          <p className="text-sm text-gray">Your identity and certificates are cryptographically verified and cannot be tampered with.</p>
        </div>

        {/* USP 3: e-RUPI Vouchers */}
        <h3 className="section-title" style={{marginTop: '24px'}}>e-RUPI Smart Vouchers</h3>
        {vouchers.map(v => (
          <div key={v.id} className="feature-box" style={{background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)', borderColor: '#BBF7D0', marginBottom: '12px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
              <div>
                <h4 style={{fontSize: '1rem', color: '#166534'}}>{v.title}</h4>
                <p className="text-xs" style={{color: '#15803D'}}>{v.status}</p>
              </div>
              <span style={{fontSize: '1.25rem', fontWeight: 800, color: '#166534'}}>₹{v.amount.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-gray" style={{marginBottom: '12px'}}>{v.description}</p>
            <button className="btn-primary" style={{padding: '8px', fontSize: '0.85rem', background: '#166534'}}>View QR Code</button>
          </div>
        ))}

        <h3 className="section-title" style={{marginTop: '24px'}}>Verified Documents</h3>
        {user.documents.map(doc => (
          <div key={doc.id} className="feature-box" style={{padding: '12px 16px', marginBottom: '8px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <p className="font-medium" style={{fontSize: '0.9rem'}}>{doc.name}</p>
                <p className="text-xs text-gray">{doc.source} • {doc.file_size}</p>
              </div>
              <span className="status-badge verified" style={{background: '#ECFDF5', color: '#047857'}}>Verified</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Alerts Component ---
function Alerts({ user }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api.getAlerts(user.id).then(setAlerts);
  }, [user.id]);

  return (
    <div className="dashboard">
      <header className="dashboard-header" style={{flexDirection: 'column', alignItems: 'flex-start'}}>
        <h2>Notifications</h2>
      </header>
      <div className="section" style={{marginTop: '24px'}}>
        {alerts.map(a => (
          <div key={a.id} className="feature-box" style={{padding: '16px', marginBottom: '12px', border: a.type === 'error' ? '1.5px solid #FCA5A5' : ''}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
              <h4 style={{fontSize: '1rem', color: a.type === 'success' ? '#047857' : a.type === 'error' ? '#DC2626' : '#1D4ED8'}}>{a.title}</h4>
              <span className="text-xs text-gray">{a.time}</span>
            </div>
            <p className="text-sm text-gray">{a.text}</p>
            {a.action && (
               <button className="btn-primary" style={{marginTop: '12px', padding: '8px', fontSize: '0.85rem', background: '#DC2626'}}>{a.action}</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- JAGO AI Chatbot ---
function JagoAI({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    api.getChatHistory(user.id).then(setMessages);
  }, [user.id]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    
    const botReply = await api.sendChatMessage(user.id, userText);
    setMessages(prev => [...prev, botReply]);
  };

  return (
    <div className="dashboard" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      <header className="dashboard-header" style={{display: 'flex', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <div className="avatar" style={{width: 36, height: 36, fontSize: '1rem', marginRight: '12px'}}>🤖</div>
          <div><h2>JAGO AI</h2></div>
        </div>
        <span className="ai-badge" style={{background: '#FFF7ED', color: '#C2410C', borderColor: '#FFEDD5'}}>🎙️ Bhashini Voice</span>
      </header>
      
      <div style={{flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px'}}>
        {messages.map((m, i) => (
          <div key={i} style={{alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', background: m.sender === 'user' ? 'var(--primary)' : 'var(--card-bg)', color: m.sender === 'user' ? 'white' : 'var(--text-main)', padding: '12px 16px', borderRadius: '16px', border: m.sender === 'bot' ? '1px solid var(--border-color)' : 'none', maxWidth: '85%', fontSize: '0.9rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)'}}>
            {m.text}
          </div>
        ))}
      </div>

      <div style={{padding: '16px', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)'}}>
        <form onSubmit={send} style={{display: 'flex', gap: '8px'}}>
          <button type="button" className="btn-outline" style={{width: 'auto', margin: 0, padding: '12px', border: 'none', background: '#F3F4F6', color: '#4B5563', borderRadius: '50%'}}>🎤</button>
          <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type or speak in Santhali..." className="input-field" style={{padding: '12px'}} />
          <button type="submit" className="btn-primary" style={{width: 'auto', padding: '12px 20px'}}>Send</button>
        </form>
      </div>
    </div>
  );
}

// --- Eklavya Mentorship Hub ---
function Mentorship({ user }) {
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    api.getMentors().then(setMentors);
  }, []);

  return (
    <div className="dashboard">
      <header className="dashboard-header" style={{flexDirection: 'column', alignItems: 'flex-start'}}>
        <h2>Eklavya Hub</h2>
        <p className="text-sm text-gray" style={{marginTop: '4px'}}>Connect with tribal alumni & scholars</p>
      </header>
      <div className="section" style={{marginTop: '24px'}}>
        
        <div className="feature-box" style={{background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)', borderColor: '#BFDBFE'}}>
          <h4 style={{fontSize: '1rem', color: '#1D4ED8', marginBottom: '8px'}}>Peer-to-Peer Guidance</h4>
          <p className="text-sm text-gray" style={{marginBottom: '12px'}}>Learn how to craft winning essays and prepare for interviews from students who successfully secured MoTA scholarships.</p>
        </div>

        <h3 className="section-title" style={{marginTop: '24px'}}>Recommended Mentors</h3>
        {mentors.map((m, i) => (
          <div key={i} className="app-card" style={{borderLeft: '4px solid var(--accent)'}}>
            <div className="app-card-header">
              <h4>{m.name}</h4>
              <span className={`status-badge ${m.status === 'Busy' ? 'pending' : 'disbursed'}`}>{m.status}</span>
            </div>
            <p className="text-sm font-medium" style={{color: 'var(--primary)', marginBottom: '4px'}}>{m.scheme}</p>
            <p className="text-xs text-gray" style={{marginBottom: '12px'}}>{m.location} • <Sparkles size={10}/> {m.match}</p>
            <button className="btn-outline" style={{padding: '8px', fontSize: '0.85rem', width: 'auto'}}>Connect</button>
          </div>
        ))}
      </div>
    </div>
  );
}
