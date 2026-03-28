import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, AlertTriangle, FileText, Mic, Image as ImageIcon, 
  Send, ShieldAlert, HeartPulse, Navigation2, CheckCircle, 
  UploadCloud, Menu, Zap, Fingerprint, MapPin, Clock, Search, MessageSquare, X,
  Trophy, Medal, Star, Target, Flag, Download, HelpCircle
} from 'lucide-react';
import './App.css';

// --- MOCK DEFINITIONS ---
const PROCESSING_STEPS = {
  GENERAL_QUESTION: [
    { id: 1, text: "Parsing natural language query...", icon: <Zap size={18} /> },
    { id: 2, text: "Retrieving official verified protocols...", icon: <FileText size={18} /> },
    { id: 3, text: "Structuring readable answer...", icon: <CheckCircle size={18} /> }
  ],
  WEATHER: [
    { id: 1, text: "Fetching Hyper-local meteorological API data...", icon: <Zap size={18} /> },
    { id: 2, text: "Cross-referencing satellite imagery...", icon: <Activity size={18} /> },
    { id: 3, text: "Compiling actionable impact forecast...", icon: <CheckCircle size={18} /> },
  ],
  COMPLAINT: [
    { id: 1, text: "Categorizing unstructured civic complaint...", icon: <FileText size={18} /> },
    { id: 2, text: "Identifying responsible jurisdiction...", icon: <Navigation2 size={18} /> },
    { id: 3, text: "Routing to Public Works dashboard...", icon: <CheckCircle size={18} /> },
  ],
  AWARENESS: [
    { id: 1, text: "Structuring community awareness post...", icon: <Zap size={18} /> },
    { id: 2, text: "Validating non-spam / credibility metrics...", icon: <ShieldAlert size={18} /> },
    { id: 3, text: "Publishing to local community feed...", icon: <CheckCircle size={18} /> },
  ],
  REPORT_ISSUE: [
    { id: 1, text: "Analyzing ongoing issue parameters...", icon: <Activity size={18} /> },
    { id: 2, text: "Correlating with historical infrastructure logs...", icon: <FileText size={18} /> },
    { id: 3, text: "Generating verified public alert...", icon: <CheckCircle size={18} /> },
  ]
};

const MOCK_RESULTS = {
  GENERAL_QUESTION: {
    type: 'QUESTION',
    title: "Civic Code: Noise Ordinance Regulations",
    shortAnswer: "Loud construction noise is prohibited between 10:00 PM and 7:00 AM within residential zones in this municipality.",
    explanation: "According to City Code Section 14.2, operation of heavy machinery, prolonged construction, and excessively loud music are restricted. This aligns with standard quiet hours to ensure public well-being. Exceptions require an emergency structural permit from the Department of Buildings.",
    suggestions: ["File a noise complaint", "View full civic code section", "Contact non-emergency police"],
    timestamp: new Date().toLocaleTimeString()
  },
  WEATHER: { type: 'INCIDENT', urgency: 'INFO', title: 'Severe Rainfall Alert', details: 'Predicting 3 inches of rain within the next 2 hours causing localized flooding.', location: 'Downtown Sector 4', recommendation: 'Avoid low-lying underpasses during commute.', actions: ['Broadcast Alert', 'View Radar'], confidence: '99%', timestamp: new Date().toLocaleTimeString() },
  COMPLAINT: { type: 'INCIDENT', urgency: 'WARNING', title: 'Civic Infrastructure Complaint Logged', details: 'Massive pothole causing tire damage requested for repair.', location: 'Main St & 5th Ave', recommendation: 'Routed to Department of Transportation (Priority Level 3).', actions: ['Track Status', 'Notify Reporter'], confidence: '91%', timestamp: new Date().toLocaleTimeString() },
  AWARENESS: { type: 'INCIDENT', urgency: 'INFO', title: 'Community Awareness Broadcast', details: 'Public health camp setup for free vaccinations this weekend.', location: 'City Hall Plaza', recommendation: 'Boosted visibility algorithmically to residents within 5 miles.', actions: ['View Engagement', 'Amplify'], confidence: '100%', timestamp: new Date().toLocaleTimeString() },
  REPORT_ISSUE: { type: 'INCIDENT', urgency: 'CRITICAL', title: 'Live Infrastructure Hazard', details: 'Downed power line observed sparking near residential complex.', location: 'Oakwood Neighborhood', recommendation: 'Immediate utility shutoff requested. Fire department notified.', actions: ['Dispatch Tech', 'Evacuate Zone'], confidence: '96%', timestamp: new Date().toLocaleTimeString() }
};

const INITIAL_LEADERBOARD = [
  { id: 1, name: "@sarah_md", role: "First Responder", score: 14500, trust: 99, reports: 142, streak: 12 },
  { id: 2, name: "@civic_hero_88", role: "Verified Reporter", score: 12200, trust: 97, reports: 84, streak: 5 },
  { id: 3, name: "@night_watch", role: "Top Helper", score: 9800, trust: 95, reports: 110, streak: 8 },
  { id: 4, name: "@traffic_hawk", role: "Contributor", score: 7600, trust: 96, reports: 60, streak: 3 },
  { id: 5, name: "@random_user42", role: "Novice", score: 1200, trust: 65, reports: 15, streak: 1 }
];

// --- COMPONENTS ---

// 1. Search Engine Result Card (For Questions)
const SERPcard = ({ data }) => (
  <div className="action-card glass-panel animate-fade-in-up" style={{ '--card-color': 'var(--color-primary)' }}>
    <div style={{ padding: '1.5rem' }}>
      <div className="card-header">
        <div className="tag tag-info"><HelpCircle size={14} /> Knowledge Base</div>
      </div>
      <h3 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{data.title}</h3>
      
      <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: '3px solid var(--color-primary)' }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#e2e8f0' }}>{data.shortAnswer}</p>
      </div>

      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
        {data.explanation}
      </p>

      <div>
        <span className="data-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Helpful Suggestions</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {data.suggestions.map((sug, i) => (
            <button key={i} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>{sug}</button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// 2. Structured Report Card (For Incidents)
const StructuredReportCard = ({ data }) => {
  if (!data) return null;
  const isCritical = data.urgency === 'CRITICAL';
  const isWarning = data.urgency === 'WARNING';
  const tagClass = isCritical ? 'tag-critical' : (isWarning ? 'tag-warning' : (data.urgency === 'INFO' ? 'tag-info' : 'tag-safe'));
  const cardColor = isCritical ? 'var(--color-danger)' : (isWarning ? 'var(--color-warning)' : (data.urgency === 'INFO' ? 'var(--color-primary)' : 'var(--color-success)'));

  const handleDownload = () => {
    const reportContent = `
========================================
OFFICIAL BRIDGE AI INCIDENT REPORT
========================================
Title: ${data.title}
Urgency Level: ${data.urgency}
Timestamp: ${data.timestamp}
Confidence: ${data.confidence}

--- ISSUE SUMMARY & USER INPUT ---
Location: ${data.location || 'N/A'}
Description: ${data.userDescription || data.details}

--- AI-BASED ANALYSIS ---
${data.recommendation}

--- SUGGESTED ACTIONS ---
1. ${data.actions[0]}
2. ${data.actions[1]}
    `;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IncidentReport_${data.timestamp.replace(/[: ]/g, '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="action-card glass-panel animate-fade-in-up" style={{ '--card-color': cardColor }}>
      {data.thumbnail && (
        <div style={{ width: '100%', height: '160px', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <img src={data.thumbnail} alt="Context" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div className="verification-badge" style={{ top: data.thumbnail ? '1rem' : '1rem' }}>
        <CheckCircle size={14} /> AI Verified • {data.confidence}
      </div>
      <div style={{ padding: '1.5rem' }}>
        <div className="card-header"><div className={`tag ${tagClass}`}>{data.urgency}</div></div>
        
        <h3 className="card-title">{data.title}</h3>
        <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
          {data.userDescription || data.details}
        </p>
        
        <div className="data-grid" style={{ margin: '1rem 0' }}>
          {data.location && <div className="data-item"><span className="data-label">Location</span><span className="data-value"><MapPin size={14} /> {data.location}</span></div>}
          <div className="data-item"><span className="data-label">Timestamp</span><span className="data-value"><Clock size={14} /> {data.timestamp}</span></div>
        </div>
        
        <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '8px', borderLeft: `3px solid ${cardColor}` }}>
          <span className="data-label">AI Analysis & Action Plan</span>
          <p style={{ margin: '0.25rem 0 0 0', fontWeight: 500, color: '#e2e8f0', fontSize: '0.875rem' }}>{data.recommendation}</p>
        </div>
      </div>
      <div className="card-actions glass-card" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, border: 'none', display: 'flex', flexWrap: 'wrap' }}>
        <button className={`btn ${isCritical ? 'btn-danger' : 'btn-primary'}`} style={{ flex: 1 }}>{data.actions[0]}</button>
        <button className="btn btn-outline" onClick={handleDownload} title="Download Report for Admin Review"><Download size={16} /></button>
      </div>
    </div>
  );
};


function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginInput, setLoginInput] = useState("");
  
  const [activeView, setActiveView] = useState('COMMAND'); 
  const [activeIntent, setActiveIntent] = useState('GENERAL_QUESTION');
  
  // Wizard State
  const [showWizard, setShowWizard] = useState(false);
  const [wizardData, setWizardData] = useState({ location: '', description: '', linkedIncident: '' });

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState([]);
  
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [leaderboard, setLeaderboard] = useState(INITIAL_LEADERBOARD);

  // Chat/Copilot States
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Bridge System online. I can route reports or answer general inquiries directly in this chat.' }
  ]);

  const handleLogin = (e) => {
    e.preventDefault();
    if(loginInput.trim().length > 0) setCurrentUser(loginInput.trim());
  };

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      setActiveIntent('REPORT_ISSUE');
      setFilePreview(URL.createObjectURL(file));
      setShowWizard(true); // Pop open the wizard when an image is uploaded representing an issue
    } else {
      setActiveIntent('COMPLAINT');
      setFilePreview('document-icon');
    }
  };

  const submitWizard = () => {
    setShowWizard(false);
    processInput(true);
  };

  const processInput = (isFromWizard = false) => {
    if (!isFromWizard && !inputText && activeIntent === 'GENERAL_QUESTION') return;
    
    setIsProcessing(true);
    setCurrentStep(0);
    const finalThumbnail = filePreview !== 'document-icon' ? filePreview : null;
    const activeType = activeIntent;
    
    const steps = PROCESSING_STEPS[activeType].length;
    let step = 0;
    
    const interval = setInterval(() => {
      step++;
      setCurrentStep(step);
      
      if (step >= steps) {
        clearInterval(interval);
        setTimeout(() => {
          setIsProcessing(false);
          let newResult;

          if (activeType === 'GENERAL_QUESTION') {
            // It's a question, use SERP object + what they typed
            newResult = { ...MOCK_RESULTS.GENERAL_QUESTION, id: Date.now() + Math.random(), title: `Query: ${inputText}` };
          } else {
            // It's an incident, structure it with Wizard / User input
            newResult = { 
              ...MOCK_RESULTS[activeType], 
              id: Date.now() + Math.random(), 
              thumbnail: finalThumbnail,
              userDescription: isFromWizard ? wizardData.description : inputText,
              location: isFromWizard && wizardData.location ? wizardData.location : MOCK_RESULTS[activeType].location
            };
          }

          setResults(prev => [newResult, ...prev]);
          setInputText("");
          setWizardData({ location: '', description: '', linkedIncident: '' });
          setSelectedFile(null);
          setFilePreview(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          
          if (activeType !== 'GENERAL_QUESTION') {
            alert(`Success! You earned +50 Impact Points for submitting a verified Report!`);
          }
        }, 800);
      }
    }, 1200);
  };

  const flagFakeReport = (targetId) => {
    setLeaderboard(prev => prev.map(u => {
      if(u.id === targetId) return { ...u, trust: Math.max(10, u.trust - 15), score: Math.max(0, u.score - 500) };
      return u;
    }).sort((a,b) => b.score - a.score));
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { role: 'user', text: chatInput }]);
    setChatInput("");
    
    setTimeout(() => {
      let reply = "I've ingested that context. If this is an actionable issue, please consider logging it specifically via the main Intent Dropdown.";
      setChatMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    }, 1000);
  };

  if (!currentUser) {
    return (
      <div className="login-container">
        <div className="login-card glass-panel">
          <div className="gemini-orb" style={{ width: '80px', height: '80px', margin: '0 auto 1rem' }}></div>
          <h1 style={{ background: 'linear-gradient(90deg, #38bdf8, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2rem', marginBottom: '0.5rem' }}>
            Bridge AI Access
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Identify yourself to enter the Command Center and community records.
          </p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" className="login-input" 
              placeholder="Username (e.g. Shetty)" 
              value={loginInput} onChange={(e) => setLoginInput(e.target.value)} autoFocus
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Authenticate</button>
          </form>
        </div>
      </div>
    );
  }

  const isIncidentIntent = ['COMPLAINT', 'REPORT_ISSUE', 'AWARENESS'].includes(activeIntent);

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon-wrapper"><Fingerprint size={24} color="#ffffff" /></div>
          <span>Bridge AI</span>
        </div>
        <nav className="nav-menu">
          <div className={`nav-item ${activeView === 'COMMAND' ? 'active' : ''}`} onClick={() => setActiveView('COMMAND')}><Activity size={20} /><span>Command Center</span></div>
          <div className={`nav-item ${activeView === 'LEADERBOARD' ? 'gold-active' : ''}`} onClick={() => setActiveView('LEADERBOARD')}><Trophy size={20} /><span>Community Rankings</span></div>
        </nav>
      </aside>
      
      {/* MAIN CONTENT */}
      <main className="main-content" style={{ overflowY: 'auto' }}>
        <header className="header">
          <h2>{activeView === 'COMMAND' ? 'Bridge Central' : 'Community Leaderboard'}</h2>
          <div className="user-profile">
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>@{currentUser}</span>
            <div className="avatar"><Zap size={20} color="var(--color-primary)" /></div>
          </div>
        </header>

        {activeView === 'COMMAND' ? (
          <div className="dashboard-scroll">
            <div className="omni-input-wrapper">
              <div style={{ textAlign: 'center', margin: '0 0 2rem' }}>
                <h1 style={{ background: 'linear-gradient(90deg, #38bdf8, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
                  What do you need assistance with?
                </h1>
              </div>

              <div className="intent-selector">
                <select className="intent-dropdown" value={activeIntent} onChange={(e) => setActiveIntent(e.target.value)}>
                  <option value="GENERAL_QUESTION">❓ Ask a general question</option>
                  <option value="WEATHER">☁️ Check weather information</option>
                  <option value="COMPLAINT">🏛️ File a civic / public works complaint</option>
                  <option value="AWARENESS">📢 Create awareness for an event/initiative</option>
                  <option value="REPORT_ISSUE">🚨 Highlight or report a live issue</option>
                </select>
              </div>

              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => { if (e.target.files?.length) handleFileSelected(e.target.files[0]); }} />

              {/* Dynamic Input Zone */}
              {isIncidentIntent ? (
                <div style={{ textAlign: 'center', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '2rem', borderRadius: '12px' }}>
                  <AlertTriangle size={32} color="var(--color-warning)" style={{marginBottom: '1rem'}} />
                  <h3 style={{marginBottom: '0.5rem'}}>Structured Incident Reporting</h3>
                  <p style={{color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem'}}>When reporting complaints or hazards, please provide accurate, structured details for our analysis engine.</p>
                  <button className="btn btn-primary" onClick={() => setShowWizard(true)}>
                    Open Reporting Wizard
                  </button>
                </div>
              ) : (
                <div className="input-bar" style={{ padding: '0.25rem' }}>
                  <Search size={20} color="var(--text-secondary)" style={{ marginLeft: '1rem' }} />
                  <input 
                    type="text" 
                    placeholder="E.g., What are the zoning laws for residential areas?" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && processInput()}
                  />
                  <button className="icon-btn primary" onClick={() => processInput()} disabled={!inputText} style={{ opacity: !inputText ? 0.5 : 1 }}>
                    <Send size={18} />
                  </button>
                </div>
              )}
            </div>

            {results.length > 0 && (
              <div style={{marginTop: '2rem'}}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={20} color="var(--color-primary)" /> Processed Intents & Output
                </h3>
                <div className="output-grid">
                  {results.map((res) => {
                    return res.type === 'QUESTION' ? <SERPcard key={res.id} data={res} /> : <StructuredReportCard key={res.id} data={res} />;
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="dashboard-scroll">
            <div className="impact-profile-section animate-fade-in-up">
              <div className="impact-hero-card">
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
                  <h3 style={{fontSize: '1.5rem', margin: 0}}>@{currentUser}'s Imprint</h3>
                  <div className="tag tag-safe"><Medal size={14} /> Global Rank: #142</div>
                </div>
                <div className="impact-stats">
                  <div className="stat-box"><span className="data-label">Impact Score</span><span className="stat-val">3,450 XP</span></div>
                  <div className="stat-box"><span className="data-label">Verified Reports</span><span className="stat-val" style={{color:'var(--text-primary)'}}>28</span></div>
                  <div className="stat-box"><span className="data-label">Active Streak</span><span className="stat-val" style={{color:'var(--color-primary)'}}>🔥 4 Days</span></div>
                </div>
                <div style={{marginTop: '2rem'}}>
                  <span className="data-label">Earned Authority Badges</span>
                  <div className="badges-container">
                    <span className="impact-badge gold"><Target size={16} /> First Responder</span>
                    <span className="impact-badge blue"><Star size={16} /> Trusted Contributor</span>
                  </div>
                </div>
              </div>
            </div>

            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap:'0.5rem' }}><Trophy color="var(--color-gold)" size={24} /> Top Community Contributors</h3>
            <table className="leaderboard-table animate-fade-in-up">
              <thead>
                <tr>
                  <th>Rank</th><th>Hero Profile</th><th>Score</th><th>Trust Rating</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user, index) => {
                  const trustColor = user.trust >= 95 ? 'success' : (user.trust >= 80 ? 'warning' : 'danger');
                  return (
                    <tr key={user.id} className={`rank-${index + 1}`}>
                      <td><div className="rank-circle">{index + 1}</div></td>
                      <td>
                        <div className="user-cell">
                          <div><div style={{fontWeight: 700}}>{user.name}</div><div className="tag tag-info" style={{fontSize: '0.6rem'}}>{user.role}</div></div>
                        </div>
                      </td>
                      <td style={{fontWeight: 800, color: index===0 ? 'var(--color-gold)' : 'var(--text-primary)'}}>{user.score.toLocaleString()} XP</td>
                      <td style={{width: '200px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem'}}><span>Trust</span><span style={{color: `var(--color-${trustColor})`}}>{user.trust}%</span></div>
                        <div className="trust-bar-bg"><div className={`trust-bar-fill ${trustColor}`} style={{width: `${user.trust}%`}}></div></div>
                      </td>
                      <td><button className="btn-report" onClick={() => flagFakeReport(user.id)}><Flag size={14} /> Flag</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* INCIDENT REPORTING WIZARD MODAL */}
        {showWizard && (
          <div className="wizard-overlay">
            <div className="wizard-card">
              <div className="wizard-header">
                <h3>Structured Reporting Form</h3>
                <button onClick={() => setShowWizard(false)} style={{ background: 'transparent', border:'none', color:'white', cursor:'pointer' }}><X size={20} /></button>
              </div>
              
              <div className="wizard-field">
                <label>Incident Category</label>
                <input className="wizard-input" type="text" value={activeIntent} disabled />
              </div>

              <div className="wizard-field">
                <label>Precise Location (Lat/Long or Street)</label>
                <input className="wizard-input" type="text" placeholder="E.g., Main St & 5th Ave" value={wizardData.location} onChange={(e) => setWizardData({...wizardData, location: e.target.value})} />
              </div>

              <div className="wizard-field">
                <label>Detailed Description</label>
                <textarea className="wizard-textarea" placeholder="Provide raw observations..." value={wizardData.description} onChange={(e) => setWizardData({...wizardData, description: e.target.value})}></textarea>
              </div>

              <div className="wizard-field">
                <label>Link to Existing Incident (Optional)</label>
                <select className="wizard-select" value={wizardData.linkedIncident} onChange={(e) => setWizardData({...wizardData, linkedIncident: e.target.value})}>
                  <option value="">None - New Independent Incident</option>
                  <option value="INC-142">INC-142: Ongoing Powergrid Outage Area</option>
                  <option value="INC-099">INC-099: City Hall Protest / Traffic Block</option>
                </select>
              </div>

              <div className="wizard-field">
                <label>Attach Evidence (Images/Video)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()}><UploadCloud size={16} /> Choose File</button>
                  {selectedFile && <span style={{fontSize: '0.875rem'}}>{selectedFile.name}</span>}
                </div>
              </div>

              <div className="wizard-actions">
                <button className="btn btn-outline" onClick={() => setShowWizard(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={submitWizard} disabled={!wizardData.description}>Submit Structurally</button>
              </div>
            </div>
          </div>
        )}

        {/* PROCESSING OVERLAY */}
        <div className={`processing-overlay ${isProcessing ? 'active' : ''}`}>
          <div className="processing-card glass-panel">
            <div className="gemini-orb"></div>
            <h3 style={{ marginBottom: '1.5rem' }}>AI Analyzing Request...</h3>
            <div className="processing-steps">
              {PROCESSING_STEPS[activeIntent]?.map((step, idx) => (
                <div key={step.id} className={`step-item ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}>
                  <div className="step-icon">
                    {idx < currentStep ? <CheckCircle size={18} color="var(--color-success)" /> : step.icon}
                  </div>
                  <span>{step.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* RIGHT COPILOT */}
      <aside className="chat-panel">
        <div className="chat-header">
          <MessageSquare size={18} color="#38bdf8" />
          General AI Assistant
        </div>
        <div className="chat-messages">
          {chatMessages.map((msg, idx) => (<div key={idx} className={`chat-message ${msg.role}`}>{msg.text}</div>))}
        </div>
        <div className="chat-input-container">
          <div className="chat-input-bar">
            <input type="text" placeholder="Ask anything to Gemini..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChatSend()} />
            <button className="send-btn" onClick={handleChatSend}><Send size={14} /></button>
          </div>
        </div>
      </aside>

    </div>
  );
}

export default App;
