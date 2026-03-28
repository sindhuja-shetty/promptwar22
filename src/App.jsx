import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, AlertTriangle, FileText, Mic, Image as ImageIcon, 
  Send, ShieldAlert, HeartPulse, Navigation2, CheckCircle, 
  UploadCloud, Menu, Zap, Fingerprint, MapPin, Clock, Search, MessageSquare, X
} from 'lucide-react';
import './App.css';

// Mocked Gemini Processing Steps
const PROCESSING_STEPS = {
  MEDICAL: [
    { id: 1, text: "Analyzing unstructured medical document...", icon: <FileText size={18} /> },
    { id: 2, text: "Extracting patient history & symptoms...", icon: <Zap size={18} /> },
    { id: 3, text: "Cross-referencing with clinical databases...", icon: <Activity size={18} /> },
    { id: 4, text: "Generating triage recommendations...", icon: <CheckCircle size={18} /> },
  ],
  EMERGENCY: [
    { id: 1, text: "Processing live incident image...", icon: <ImageIcon size={18} /> },
    { id: 2, text: "Detecting vehicle impact & risk level...", icon: <AlertTriangle size={18} /> },
    { id: 3, text: "Locating nearest medical facilities...", icon: <Navigation2 size={18} /> },
    { id: 4, text: "Drafting automated dispatch protocol...", icon: <CheckCircle size={18} /> },
  ],
  VOICE: [
    { id: 1, text: "Transcribing distressed audio signal...", icon: <Mic size={18} /> },
    { id: 2, text: "Performing sentiment & urgency analysis...", icon: <HeartPulse size={18} /> },
    { id: 3, text: "Extracting location entities...", icon: <MapPin size={18} /> },
    { id: 4, text: "Initiating emergency broadcast...", icon: <CheckCircle size={18} /> },
  ],
  COMMUTE: [
    { id: 1, text: "Parsing multi-intent query...", icon: <Zap size={18} /> },
    { id: 2, text: "Fetching live localized weather metrics...", icon: <Activity size={18} /> },
    { id: 3, text: "Analyzing real-time traffic route data...", icon: <Navigation2 size={18} /> },
    { id: 4, text: "Synthesizing actionable reroute options...", icon: <CheckCircle size={18} /> },
  ]
};

// Mocked Results
const MOCK_RESULTS = {
  MEDICAL: {
    id: 'm1',
    type: 'MEDICAL',
    urgency: 'WARNING',
    title: 'Medical Triage Summary',
    patient: 'John Doe, 64M',
    symptoms: 'Irregular heartbeat, shortness of breath, mild chest discomfort.',
    extractedConditions: ['Atrial Fibrillation (History)', 'Hypertension'],
    recommendation: 'Requires physician review within 24 hours. Not an immediate code blue, but high risk for cardiac event.',
    actions: ['Schedule Urgent Care', 'Notify Primary Care'],
    confidence: '94%',
    timestamp: new Date().toLocaleTimeString()
  },
  EMERGENCY: {
    id: 'e1',
    type: 'EMERGENCY',
    urgency: 'CRITICAL',
    title: 'Severe Traffic Collision detected',
    location: 'I-95 North, Mile Marker 42',
    details: 'Multiple vehicle pileup detected from image. High probability of trapped passengers.',
    weatherContext: 'Heavy rain, low visibility.',
    recommendation: 'Immediate dispatch required. 3 Ambulances, 1 Fire Unit.',
    actions: ['Dispatch EMS Now', 'Reroute Traffic'],
    confidence: '98%',
    timestamp: new Date().toLocaleTimeString()
  },
  VOICE: {
    id: 'v1',
    type: 'VOICE',
    urgency: 'CRITICAL',
    title: 'SOS Voice Activation',
    location: 'Central Park West & 81st St (Est.)',
    details: '"Help, I think someone is following me... I need help now." (Distress detected: High)',
    recommendation: 'Silent dispatch of patrol unit to estimated location. Keep line active, mute responses.',
    actions: ['Dispatch Patrol', 'Activate Live Tracking'],
    confidence: '89%',
    timestamp: new Date().toLocaleTimeString()
  },
  COMMUTE: {
    id: 'c1',
    type: 'COMMUTE',
    urgency: 'WARNING',
    title: 'Multi-Intent: Route & Weather Analysis',
    patient: 'User: Shetty',
    location: 'Electronic City → Marathalli Bridge (Bangalore, India)',
    details: 'Heavy localized rain in Bangalore has caused severe waterlogging on Outer Ring Road, resulting in a 45-minute delay from Electronic City to Marathalli.',
    recommendation: 'Delay departure by 30 mins to avoid peak gridlock, or take alternate route via HSR Layout (saves 15 mins). Expect reduced visibility.',
    actions: ['Send Alternate Route', 'Set Weather Alert'],
    confidence: '96%',
    timestamp: new Date().toLocaleTimeString()
  }
};

const Sidebar = () => (
  <aside className="sidebar">
    <div className="brand">
      <div className="brand-icon-wrapper">
        <Fingerprint size={24} color="#ffffff" />
      </div>
      <span>Bridge AI</span>
    </div>
    
    <nav className="nav-menu">
      <div className="nav-item active">
        <Activity size={20} />
        <span>Live Command</span>
      </div>
      <div className="nav-item">
        <ShieldAlert size={20} />
        <span>Action History</span>
      </div>
      <div className="nav-item">
        <Activity size={20} />
        <span>System Status</span>
      </div>
      <div style={{ marginTop: 'auto' }}>
        <div className="nav-item">
          <Zap size={20} />
          <span>GCP Provisioning</span>
        </div>
      </div>
    </nav>
  </aside>
);

const ProcessingOverlay = ({ active, steps, currentStepIndex }) => {
  return (
    <div className={`processing-overlay ${active ? 'active' : ''}`}>
      <div className="processing-card glass-panel">
        <div className="gemini-orb"></div>
        <h3 style={{ marginBottom: '1.5rem' }}>Gemini Intelligence Engine</h3>
        
        <div className="processing-steps">
          {steps.map((step, idx) => (
            <div 
              key={step.id} 
              className={`step-item ${idx === currentStepIndex ? 'active' : ''} ${idx < currentStepIndex ? 'completed' : ''}`}
            >
              <div className="step-icon">
                {idx < currentStepIndex ? <CheckCircle size={18} color="var(--color-success)" /> : step.icon}
              </div>
              <span>{step.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ActionCard = ({ data }) => {
  if (!data) return null;

  const isCritical = data.urgency === 'CRITICAL';
  const isWarning = data.urgency === 'WARNING';
  
  const tagClass = isCritical ? 'tag-critical' : (isWarning ? 'tag-warning' : 'tag-safe');
  const cardColor = isCritical ? 'var(--color-danger)' : (isWarning ? 'var(--color-warning)' : 'var(--color-primary)');

  return (
    <div className="action-card glass-panel animate-fade-in-up" style={{ '--card-color': cardColor }}>
      {data.thumbnail && (
        <div style={{ width: '100%', height: '160px', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <img src={data.thumbnail} alt="Incident Context" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      
      <div className="verification-badge" style={{ top: data.thumbnail ? '1rem' : '1rem' }}>
        <CheckCircle size={14} /> AI Verified • {data.confidence}
      </div>
      
      <div style={{ padding: '1.5rem' }}>
        <div className="card-header">
          <div className={`tag ${tagClass}`}>{data.urgency}</div>
        </div>
        
        <h3 className="card-title">{data.title}</h3>
        <p style={{ fontSize: '0.875rem' }}>{data.details || data.symptoms}</p>
        
        <div className="data-grid">
          {data.location && (
            <div className="data-item">
              <span className="data-label">Location</span>
              <span className="data-value"><MapPin size={14} /> {data.location}</span>
            </div>
          )}
          {data.patient && (
            <div className="data-item">
              <span className="data-label">User/Entity Profile</span>
              <span className="data-value">{data.patient}</span>
            </div>
          )}
          <div className="data-item">
            <span className="data-label">Timestamp</span>
            <span className="data-value"><Clock size={14} /> {data.timestamp}</span>
          </div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '8px', borderLeft: `3px solid ${cardColor}` }}>
          <span className="data-label">AI Recommendation</span>
          <p style={{ margin: '0.25rem 0 0 0', fontWeight: 500, color: '#e2e8f0', fontSize: '0.875rem' }}>
            {data.recommendation}
          </p>
        </div>
      </div>

      <div className="card-actions glass-card" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, border: 'none' }}>
        <button className={`btn ${isCritical ? 'btn-danger' : 'btn-primary'}`} style={{ flex: 1 }}>
          {data.actions[0]}
        </button>
        <button className="btn btn-outline" style={{ flex: 1 }}>
          {data.actions[1]}
        </button>
      </div>
    </div>
  );
};

function App() {
  const [activeDemo, setActiveDemo] = useState('MEDICAL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Bridge Copilot online. I can answer questions about the extracted insights or coordinate dispatch routines.' }
  ]);

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreview(url);
      setActiveDemo('EMERGENCY'); // Auto guess based on image upload usually being the accident photo in our mock
    } else {
      setFilePreview('document-icon');
      setActiveDemo('MEDICAL'); // Guessing documents are medical history
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processInput = (demoType, customText = "") => {
    if (!customText && !selectedFile && !demoType) return;
    
    let activeType = demoType;
    if (customText.toLowerCase().includes("bangalore") || customText.toLowerCase().includes("traffic")) {
      activeType = 'COMMUTE';
      setActiveDemo('COMMUTE');
    } else if (customText) {
      // If just generic text without our keyword trick, run voice pipeline as base
      activeType = 'VOICE';
      setActiveDemo('VOICE');
    } else {
      setActiveDemo(demoType);
    }
    
    setInputText("");
    setIsProcessing(true);
    setCurrentStep(0);
    
    // Save current preview to pass to the final card
    const finalThumbnail = filePreview !== 'document-icon' ? filePreview : null;
    
    // Simulate AI pipeline steps
    const steps = PROCESSING_STEPS[activeType].length;
    let step = 0;
    
    const interval = setInterval(() => {
      step++;
      setCurrentStep(step);
      
      if (step >= steps) {
        clearInterval(interval);
        setTimeout(() => {
          setIsProcessing(false);
          const newResult = { ...MOCK_RESULTS[activeType], id: Date.now() + Math.random(), thumbnail: finalThumbnail };
          setResults(prev => [newResult, ...prev]);
          
          // Clear file state after processing
          setSelectedFile(null);
          setFilePreview(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }, 800);
      }
    }, 1200);
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    
    // Add user message
    const newChat = [...chatMessages, { role: 'user', text: chatInput }];
    setChatMessages(newChat);
    setChatInput("");
    
    // Simulate AI response based on context
    setTimeout(() => {
      let reply = "I've logged that request. Is there anything else you need to coordinate?";
      const lowerChat = chatInput.toLowerCase();
      
      if (lowerChat.includes("route") || lowerChat.includes("delay")) {
        reply = "I see a 45-minute delay on the Outer Ring Road due to waterlogging. I have prepared the alternate route via HSR Layout. Shall I dispatch the navigation update to the user?";
      } else if (lowerChat.includes("dispatch") || lowerChat.includes("ambulance")) {
        reply = "Emergency units have been alerted to the I-95 pileup. ETA is approximately 8 minutes depending on weather conditions.";
      }

      setChatMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    }, 1000);
  };

  // Filter logic
  const filteredResults = results.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.recommendation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.urgency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="header">
          <h2>Command Center</h2>
          
          <div className="header-search">
            <Search size={18} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Search history, events, or patients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="user-profile">
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Operator: Auto-Bridge</span>
            <div className="avatar">
              <Zap size={20} color="var(--color-primary)" />
            </div>
          </div>
        </header>

        <div className="dashboard-scroll">
          <div className="omni-input-wrapper">
            <div style={{ textAlign: 'center', margin: '1rem 0 2rem' }}>
              <h1 style={{ background: 'linear-gradient(90deg, #38bdf8, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
                Universal Human Intent
              </h1>
              <p>Drop any unstructured data (Voice, Images, Docs) to instantly bridge to actionable systems.</p>
            </div>

            <div className="demo-selector">
              <button 
                className={`demo-btn ${activeDemo === 'MEDICAL' ? 'active' : ''}`}
                onClick={() => setActiveDemo('MEDICAL')}
              >
                <HeartPulse size={16} /> Medical History
              </button>
              <button 
                className={`demo-btn ${activeDemo === 'EMERGENCY' ? 'active' : ''}`}
                onClick={() => setActiveDemo('EMERGENCY')}
              >
                <AlertTriangle size={16} /> Accident Photo
              </button>
              <button 
                className={`demo-btn ${activeDemo === 'VOICE' ? 'active' : ''}`}
                onClick={() => setActiveDemo('VOICE')}
              >
                <Mic size={16} /> Distress Voice
              </button>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) handleFileSelected(e.target.files[0]);
              }}
              accept="image/*,.pdf,.doc,.docx"
            />

            <div 
              className={`drop-zone ${selectedFile ? 'active' : ''}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => { if (!selectedFile) fileInputRef.current.click() }}
              style={{ padding: selectedFile ? '1rem' : '3rem 2rem' }}
            >
              {!selectedFile ? (
                <>
                  <div className="icon-container">
                    <UploadCloud size={32} />
                  </div>
                  <h3>Drag & Drop or Click to Upload Context Here</h3>
                  <p>Supports messy doctor notes, live traffic photos, sensor JSON streams, or raw distress audio.</p>
                </>
              ) : (
                <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <button 
                    onClick={clearFile} 
                    style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: '0.25rem', cursor: 'pointer', color: 'white' }}
                  >
                    <X size={16} />
                  </button>
                  {filePreview === 'document-icon' ? (
                    <div style={{ margin: '1rem', color: 'var(--color-primary)' }}>
                      <FileText size={64} />
                    </div>
                  ) : (
                    <img src={filePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'contain', border: '1px solid var(--border-subtle)' }} />
                  )}
                  <p style={{ marginTop: '1rem', fontWeight: 600 }}>{selectedFile.name}</p>
                </div>
              )}
            </div>

            <div className="input-bar">
              <button className="icon-btn pulse-record" onClick={() => processInput('VOICE')}>
                <Mic size={20} />
              </button>
              <button className="icon-btn" onClick={() => fileInputRef.current.click()}>
                <ImageIcon size={20} />
              </button>
              <input 
                type="text" 
                placeholder="Or type raw observation here (e.g. 'Pileup on route 66')..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && processInput(activeDemo, inputText)}
              />
              <button 
                className="icon-btn primary" 
                onClick={() => processInput(activeDemo, inputText)}
                disabled={!inputText && !selectedFile}
                style={{ opacity: (!inputText && !selectedFile) ? 0.5 : 1 }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>

          {results.length > 0 && (
            <div>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} color="var(--color-primary)" /> 
                {searchTerm ? 'Search Results' : 'Live Actionable Outputs'}
              </h3>
              
              {filteredResults.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No insights match your search criteria.</p>
              ) : (
                <div className="output-grid">
                  {filteredResults.map((res) => (
                    <ActionCard key={res.id} data={res} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <ProcessingOverlay 
          active={isProcessing} 
          steps={PROCESSING_STEPS[activeDemo]} 
          currentStepIndex={currentStep} 
        />
      </main>

      {/* Copilot Chat Sidebar */}
      <aside className="chat-panel">
        <div className="chat-header">
          <MessageSquare size={18} color="var(--color-primary)" />
          Bridge Copilot
        </div>
        
        <div className="chat-messages">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.role}`}>
              {msg.text}
            </div>
          ))}
        </div>
        
        <div className="chat-input-container">
          <div className="chat-input-bar">
            <input 
              type="text" 
              placeholder="Ask about an incident..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
            />
            <button className="send-btn" onClick={handleChatSend}>
              <Send size={14} />
            </button>
          </div>
        </div>
      </aside>

    </div>
  );
}

export default App;
