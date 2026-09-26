import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, FolderOpen, Bot, Bell, User as UserIcon, Sparkles, ShieldCheck, Fingerprint } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import './index.css';

// --- API Service with Resilient Mock Fallback ---
const API_URL = "http://localhost:8000";

const MOCK_USER = {
  id: 1,
  full_name: "Anita Birhor",
  aadhaar_id: "123456789012",
  applications: [
    { id: "APP-2026-PM-0847", scheme_name: "Pre-Matric Scholarship", academic_year: "2025-26", status: "disbursed" },
    { id: "APP-2026-POM-1234", scheme_name: "Post-Matric Scholarship", academic_year: "2026-27", status: "verified" }
  ],
  documents: [
    { id: "DOC-001", name: "Aadhaar Card", type: "identity", source: "UIDAI / DigiLocker", file_size: "245 KB" },
    { id: "DOC-002", name: "ST Certificate", type: "certificate", source: "State e-District / DigiLocker", file_size: "180 KB" }
  ],
  payments: [{ amount: 2625 }, { amount: 5250 }]
};

const api = {
  login: async (aadhaar_id) => {
    try {
      const res = await fetch(`${API_URL}/users/login?aadhaar_id=${aadhaar_id}`, { method: 'POST' });
      if (!res.ok) throw new Error("API failed");
      return await res.json();
    } catch (e) {
      console.warn("Using Mock Data");
      if (aadhaar_id === "123456789012") return MOCK_USER;
      throw new Error("Invalid User");
    }
  },
  getDashboard: async (id) => {
    try {
      const res = await fetch(`${API_URL}/users/${id}/dashboard`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      return { total_received: 7875, active_applications: 1, documents_verified: 2, total_documents: 2 };
    }
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
            <Route path="/jago" element={<JagoAI />} />
            <Route path="/alerts" element={<Alerts />} />
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
        <div style={{flex: 1}}>
          <p className="greeting">Good day,</p>
          <h2>{user.full_name}</h2>
        </div>
      </header>

      {/* USP 1: Pre-Flight DBT Health Check */}
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

        {/* USP 3: e-RUPI Vouchers */}
        <h3 className="section-title" style={{marginTop: '24px'}}>e-RUPI Smart Vouchers</h3>
        <div className="feature-box" style={{background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)', borderColor: '#BBF7D0'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
            <div>
              <h4 style={{fontSize: '1rem', color: '#166534'}}>Hostel Fee Voucher</h4>
              <p className="text-xs" style={{color: '#15803D'}}>Sanctioned Upfront</p>
            </div>
            <span style={{fontSize: '1.25rem', fontWeight: 800, color: '#166534'}}>₹12,500</span>
          </div>
          <p className="text-xs text-gray" style={{marginBottom: '12px'}}>This digital voucher can only be scanned and redeemed by your verified institution.</p>
          <button className="btn-primary" style={{padding: '8px', fontSize: '0.85rem', background: '#166534'}}>View QR Code</button>
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

// --- Alerts Component ---
function Alerts() {
  const alerts = [
    { id: 1, type: "error", title: "Action Required: Blurry Document", time: "Just now", text: "Your Income Certificate was flagged by the Nodal Officer as blurry.", action: "Open Camera & Fix Now" },
    { id: 2, type: "success", title: "Smart Contract Disbursed", time: "10 mins ago", text: "₹5,250 has been disbursed directly to your SBI account via smart contract." },
    { id: 3, type: "info", title: "DigiLocker Sync", time: "2 hours ago", text: "Your Class X Marksheet was automatically verified via DigiLocker node." }
  ];

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
function JagoAI() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Namaste! I am JAGO, your AI Scholarship Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');

  const send = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'user', text: input }]);
    const query = input.toLowerCase();
    setInput('');
    
    setTimeout(() => {
      let reply = "I'm sorry, I couldn't understand. I am still learning!";
      if (query.includes('status')) reply = "Your Pre-Matric Scholarship is currently Disbursed. Your Post-Matric application is Verified and awaiting Sanction.";
      else if (query.includes('eligible') || query.includes('apply')) reply = "Based on your AI Predictor score, you have a 92% match for the Top Class Education Scheme.";
      else if (query.includes('document')) reply = "You don't need to re-upload documents. Your Immutable Vault has already synced your Aadhaar and ST Certificate from DigiLocker.";
      setMessages(m => [...m, { sender: 'bot', text: reply }]);
    }, 600);
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
