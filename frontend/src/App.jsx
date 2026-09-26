import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, FolderOpen, Bot, Bell, User as UserIcon, Sparkles, ShieldCheck, Fingerprint } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import './index.css';

// --- API Service ---
const API_URL = "http://localhost:8000";

const api = {
  login: async (aadhaar_id) => {
    const res = await fetch(`${API_URL}/users/login?aadhaar_id=${aadhaar_id}`, { method: 'POST' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  getUser: async (id) => {
    const res = await fetch(`${API_URL}/users/${id}`);
    return res.json();
  },
  getDashboard: async (id) => {
    const res = await fetch(`${API_URL}/users/${id}/dashboard`);
    return res.json();
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
      <Link to="/alerts" className={`nav-item ${path === '/alerts' ? 'active' : ''}`}><Bell size={22} /><span>Alerts</span></Link>
      <Link to="/profile" className={`nav-item ${path === '/profile' ? 'active' : ''}`}><UserIcon size={22} /><span>Profile</span></Link>
    </nav>
  );
}

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/wallet" element={<Wallet user={user} />} />
            <Route path="/jago" element={<div className="p-4"><h2>JAGO Chatbot</h2><p>Coming soon...</p></div>} />
            <Route path="/alerts" element={<div className="p-4"><h2>Notifications</h2><p>Coming soon...</p></div>} />
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
      <header className="dashboard-header">
        <div className="avatar">{user.full_name.charAt(0)}</div>
        <div>
          <p className="greeting">Good day,</p>
          <h2>{user.full_name}</h2>
        </div>
      </header>

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
