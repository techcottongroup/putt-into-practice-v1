import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft, ArrowRight, Check, ChevronRight, CircleDot, ClipboardList,
  Flag, Home, Library, LineChart, ListChecks, Lock, Mail, Plus,
  Sparkles, Target, User, Users, X, Undo2, Trash2, CircleOff, BarChart3
} from 'lucide-react';
import './styles.css';

const EMPTY_PROFILE = { firstName: '', lastName: '', role: 'Coach' };

function App() {
  const [screen, setScreen] = useState('welcome');
  const [role, setRole] = useState('Coach');
  const [email, setEmail] = useState('');
  const [name, setName] = useState({ first: '', last: '' });
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [attempts, setAttempts] = useState([]);

  const navigate = setScreen;
  const activeUser = { ...profile, role };

  const completeOnboarding = () => {
    const nextProfile = {
      firstName: name.first.trim(),
      lastName: name.last.trim(),
      role
    };
    setProfile(nextProfile);
    navigate(role === 'Coach' ? 'coach-home' : 'student-home');
  };

  const switchRole = () => {
    const next = role === 'Coach' ? 'Student' : 'Coach';
    setRole(next);
    navigate(next === 'Coach' ? 'coach-home' : 'student-home');
  };

  const saveChallenge = (challenge) => {
    const next = {
      ...challenge,
      id: Date.now(),
      published: true,
      recommended: false,
      category: 'Putting',
      attempts: challenge.maxAttempts === Infinity
        ? 'Unlimited'
        : `${challenge.maxAttempts} attempt${challenge.maxAttempts === 1 ? '' : 's'}`
    };
    setChallenges(prev => [next, ...prev]);
    setSelectedChallenge(next);
    navigate('coach-home');
  };

  const saveAttempt = (attempt) => {
    const saved = {
      ...attempt,
      id: Date.now(),
      challengeId: selectedChallenge.id,
      date: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    };
    setAttempts(prev => [saved, ...prev]);
    navigate('student-result');
  };

  return (
    <div className="app-shell">
      <div className="phone-frame">
        {screen === 'welcome' && <Welcome email={email} setEmail={setEmail} onContinue={() => navigate('verify')} />}
        {screen === 'verify' && <Verify email={email} onBack={() => navigate('welcome')} onContinue={() => navigate('profile')} />}
        {screen === 'profile' && <Profile name={name} setName={setName} onBack={() => navigate('verify')} onContinue={() => navigate('role')} />}
        {screen === 'role' && <RoleSelect role={role} setRole={setRole} onBack={() => navigate('profile')} onContinue={completeOnboarding} />}

        {screen === 'coach-home' && <CoachHome user={activeUser} attempts={attempts} challenges={challenges} onCreate={() => navigate('challenge-builder')} onOpenResult={(attempt) => { setSelectedChallenge(challenges.find(c => c.id === attempt.challengeId)); navigate('coach-result'); }} onOpenChallengeResults={(challenge) => { setSelectedChallenge(challenge); navigate('coach-challenge-results'); }} onSwitch={switchRole} onNavigate={navigate} />}
        {screen === 'coach-challenge-results' && selectedChallenge && <CoachChallengeResults challenge={selectedChallenge} attempts={attempts.filter(a => a.challengeId === selectedChallenge.id)} onBack={() => navigate('coach-home')} />}
        {screen === 'challenge-builder' && <ChallengeBuilder onBack={() => navigate('coach-home')} onSave={saveChallenge} />}
        {screen === 'coach-result' && <CoachResult attempt={attempts[0]} challenge={selectedChallenge} user={activeUser} onBack={() => navigate('coach-home')} />}

        {screen === 'student-home' && <StudentHome user={activeUser} challenges={challenges} attempts={attempts} onOpen={(challenge) => { setSelectedChallenge(challenge); navigate('challenge-detail'); }} onProgress={() => navigate('student-progress')} onSwitch={switchRole} onNavigate={navigate} />}
        {screen === 'student-progress' && <StudentProgress challenges={challenges} attempts={attempts} onBack={() => navigate('student-home')} />}
        {screen === 'challenge-detail' && selectedChallenge && <ChallengeDetail challenge={selectedChallenge} onBack={() => navigate('student-home')} onStart={() => navigate('putting-recorder')} />}
        {screen === 'putting-recorder' && selectedChallenge && <PuttingRecorder challenge={selectedChallenge} onBack={() => navigate('challenge-detail')} onSubmit={saveAttempt} />}
        {screen === 'student-result' && selectedChallenge && <StudentResult attempt={attempts[0]} challenge={selectedChallenge} onDone={() => navigate('student-home')} />}
      </div>
    </div>
  );
}

function Brand({ compact = false }) {
  return <div className={`brand ${compact ? 'brand-compact' : ''}`}>
    <div className="brand-mark"><span>P</span><i /></div>
    <div><div className="brand-name">Putt Into Practice</div>{!compact && <div className="brand-tag">The Coach Approach</div>}</div>
  </div>;
}

function Welcome({ email, setEmail, onContinue }) {
  return <main className="screen welcome-screen"><div className="grain" />
    <section className="welcome-hero"><Brand /><div className="hero-copy"><p className="eyebrow">Better practice. Better golf.</p><h1>Turn coaching into progress you can see.</h1><p>Create or complete custom practice challenges and build a history that matters.</p></div></section>
    <section className="auth-card"><label>Email address</label><div className="input-wrap"><Mail size={18} /><input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email" /></div><button className="primary-btn" disabled={!email.trim()} onClick={onContinue}>Continue <ArrowRight size={18} /></button><p className="tiny">We’ll send you a secure sign-in code. No password needed.</p></section>
  </main>;
}

function Verify({ email, onBack, onContinue }) {
  const [code, setCode] = useState('');
  return <main className="screen light-screen padded"><TopBar onBack={onBack} /><div className="auth-step"><div className="icon-badge"><Mail /></div><p className="eyebrow dark">Check your inbox</p><h2>Enter your sign-in code</h2><p>We sent a six-digit code to <strong>{email}</strong>.</p><input className="code-input" value={code} placeholder="000000" onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0,6))} inputMode="numeric" /><button className="primary-btn dark-btn" disabled={code.length !== 6} onClick={onContinue}>Verify and continue</button><button className="text-btn">Resend code</button></div></main>;
}

function Profile({ name, setName, onBack, onContinue }) {
  const valid = name.first.trim() && name.last.trim();
  return <main className="screen light-screen padded"><TopBar onBack={onBack} progress="2 of 3" /><div className="form-step"><p className="eyebrow dark">Your profile</p><h2>What should we call you?</h2><p>This will be shown to your coach or students.</p><label>First name</label><input className="field" value={name.first} onChange={e => setName({ ...name, first: e.target.value })} placeholder="First name" /><label>Last name</label><input className="field" value={name.last} onChange={e => setName({ ...name, last: e.target.value })} placeholder="Last name" /><button className="primary-btn dark-btn" disabled={!valid} onClick={onContinue}>Continue <ArrowRight size={18}/></button></div></main>;
}

function RoleSelect({ role, setRole, onBack, onContinue }) {
  return <main className="screen light-screen padded"><TopBar onBack={onBack} progress="3 of 3" /><div className="form-step role-step"><p className="eyebrow dark">Choose your role</p><h2>How will you use Putt Into Practice?</h2><RoleCard selected={role === 'Coach'} onClick={() => setRole('Coach')} icon={<Users />} title="Coach" text="Create challenges, manage students and see their results." /><RoleCard selected={role === 'Student'} onClick={() => setRole('Student')} icon={<Target />} title="Student" text="Complete challenges, record results and review lesson summaries." /><p className="tiny dark-text">You can add another role later.</p><button className="primary-btn dark-btn" onClick={onContinue}>Enter the app <ArrowRight size={18}/></button></div></main>;
}

function RoleCard({ selected, onClick, icon, title, text }) { return <button className={`role-card ${selected ? 'selected' : ''}`} onClick={onClick}><div className="role-illustration">{icon}<span className="mini-ball" /></div><div><h3>{title}</h3><p>{text}</p></div><div className="select-dot">{selected && <Check size={16}/>}</div></button>; }
function TopBar({ onBack, progress }) { return <div className="topbar"><button className="icon-btn" onClick={onBack}><ArrowLeft /></button>{progress && <span className="progress-label">{progress}</span>}</div>; }

function Header({ user, onSwitch }) {
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` || 'P';
  return <header className="app-header"><Brand compact /><div className="header-actions"><button className="mode-pill" onClick={onSwitch}>{user.role} view</button><div className="avatar">{initials}</div></div></header>;
}

function CoachHome({ user, attempts, challenges, onCreate, onOpenResult, onOpenChallengeResults, onSwitch, onNavigate }) {
  return <main className="screen app-screen"><Header user={user} onSwitch={onSwitch} /><div className="content-scroll"><section className="intro"><p className="eyebrow dark">Welcome, {user.firstName}</p><h2>Build practice that your students can record.</h2></section><button className="create-card" onClick={onCreate}><div><span className="round-icon"><Plus/></span><h3>Create a challenge</h3><p>Build a custom putting exercise.</p></div><ArrowRight/></button>
    <SectionHeader title="Recent student results" action={attempts.length ? `${attempts.length} result${attempts.length === 1 ? '' : 's'}` : ''} />
    {attempts.length ? attempts.slice(0,3).map(a => <button className="activity-card" key={a.id} onClick={() => onOpenResult(a)}><div className="avatar large"><Target/></div><div className="activity-copy"><strong>{challenges.find(c => c.id === a.challengeId)?.title || 'Challenge'}</strong><span>{a.holed}/{a.total} holed</span><small>{a.date}</small></div><div className="score-chip">{a.score} pts</div></button>) : <EmptyState icon={<LineChart/>} title="No results yet" text="Student attempts will appear here once challenges have been completed." />}
    <SectionHeader title="Your challenge library" action={challenges.length ? `${challenges.length} published` : ''} />
    {challenges.length ? challenges.map(c => <ChallengeRow key={c.id} challenge={c} onClick={() => onOpenChallengeResults(c)} />) : <EmptyState icon={<Library/>} title="Your library is empty" text="Create your first putting challenge to get started." action="Create challenge" onAction={onCreate} />}
  </div><BottomNav role="Coach" active="Home" onNavigate={onNavigate} /></main>;
}

function StudentHome({ user, challenges, attempts, onOpen, onProgress, onSwitch, onNavigate }) {
  const recommended = challenges.filter(c => c.recommended && c.published);
  const others = challenges.filter(c => !c.recommended && c.published);
  return <main className="screen app-screen"><Header user={user} onSwitch={onSwitch} /><div className="content-scroll"><section className="intro"><p className="eyebrow dark">Ready to practise, {user.firstName}?</p><h2>Choose your next move.</h2></section><div className="action-grid"><ActionCard icon={<Target/>} title="Start a challenge" subtitle={`${challenges.length} available`} onClick={() => challenges[0] && onOpen(challenges[0])} /><ActionCard icon={<ListChecks/>} title="Completed" subtitle={`${attempts.length} recorded`} onClick={onProgress} /><ActionCard icon={<ClipboardList/>} title="Lesson notes" subtitle="No summaries yet" /></div>
    <SectionHeader title="Recommended for you" action="From your coach" />
    {recommended.length ? recommended.map(c => <FeaturedChallenge key={c.id} challenge={c} onClick={() => onOpen(c)} />) : <EmptyState icon={<Sparkles/>} title="Nothing recommended yet" text="Challenges recommended by your coach will appear here." />}
    <SectionHeader title="Your coach’s library" action={others.length ? `${others.length} challenge${others.length === 1 ? '' : 's'}` : ''} />
    {others.length ? others.map(c => <ChallengeRow key={c.id} challenge={c} onClick={() => onOpen(c)} />) : <EmptyState icon={<Library/>} title="The library is empty" text="Your coach has not published any challenges yet." />}
  </div><BottomNav role="Student" active="Home" onNavigate={onNavigate} /></main>;
}

function EmptyState({ icon, title, text, action, onAction }) { return <div className="empty-state"><span>{icon}</span><strong>{title}</strong><p>{text}</p>{action && <button className="secondary-btn" onClick={onAction}>{action}</button>}</div>; }
function ActionCard({ icon, title, subtitle, onClick }) { return <button className="action-card" onClick={onClick}><span>{icon}</span><strong>{title}</strong><small>{subtitle}</small></button>; }
function SectionHeader({ title, action }) { return <div className="section-header"><h3>{title}</h3><span>{action}</span></div>; }
function FeaturedChallenge({ challenge, onClick }) { return <button className="featured-card" onClick={onClick}><div className="feature-art"><MiniGreen rings={challenge.rings} split={challenge.targetMode === 'split'} /></div><div className="featured-copy"><span className="recommend-badge"><Sparkles size={13}/> Recommended</span><h3>{challenge.title}</h3><p>{challenge.description}</p><div className="meta-row"><span>{challenge.putts} putts</span><span>{challenge.attempts}</span></div></div><ChevronRight className="chevron" /></button>; }
function ChallengeRow({ challenge, onClick }) { return <button className="challenge-row" onClick={onClick}><div className="challenge-icon"><Target /></div><div><strong>{challenge.title}</strong><span>{challenge.category} · {challenge.attempts}</span></div><ChevronRight /></button>; }

function ChallengeBuilder({ onBack, onSave }) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    type: '', template: '', title: '', description: '', putts: '', startDistance: '',
    targetMode: 'full', maxAttempts: 1, holedPoints: '', rings: []
  });

  const selectType = (type) => {
    if (type !== 'Putting') return;
    setForm({ ...form, type });
  };

  const selectTemplate = (template) => {
    if (template !== 'Lag Putting') return;
    setForm({ ...form, template, title: 'Lag Putting' });
  };

  const updateRing = (i, key, value) => setForm({
    ...form,
    rings: form.rings.map((r, idx) => idx === i ? { ...r, [key]: value } : r)
  });

  const addRing = () => {
    if (form.rings.length >= 5) return;
    setForm({
      ...form,
      rings: [...form.rings, { distance: '', score: '', short: '', beyond: '' }]
    });
  };

  const removeRing = (i) => setForm({ ...form, rings: form.rings.filter((_, idx) => idx !== i) });
  const isPositive = (value) => Number(value) > 0;
  const hasScore = (value) => value !== '' && !Number.isNaN(Number(value));
  const distances = form.rings.map(r => Number(r.distance));
  const ascending = distances.every((d,i) => i === 0 || d > distances[i-1]);
  const uniqueDistances = new Set(distances.filter(d => d > 0)).size === distances.filter(d => d > 0).length;
  const ringsValid = form.rings.length > 0 && form.rings.length <= 5 && form.rings.every(r => isPositive(r.distance) && (form.targetMode === 'full' ? hasScore(r.score) : hasScore(r.short) && hasScore(r.beyond))) && ascending && uniqueDistances;
  const canContinue =
    (step === 1 && form.type === 'Putting') ||
    (step === 2 && form.template === 'Lag Putting') ||
    (step === 3 && form.title.trim() && form.description.trim() && isPositive(form.putts) && isPositive(form.startDistance)) ||
    (step === 4 && hasScore(form.holedPoints) && Number(form.holedPoints) >= 0 && ringsValid) ||
    step === 5 || step === 6;

  const continueBuilder = () => {
    const nextErrors = {};
    if (step === 4) {
      if (!form.rings.length) nextErrors.rings = 'Add at least one scoring ring.';
      else if (!ascending || !uniqueDistances) nextErrors.rings = 'Ring distances must be unique and entered from smallest to largest.';
      if (!hasScore(form.holedPoints) || Number(form.holedPoints) < 0) nextErrors.holed = 'Enter a valid holed score.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setStep(step + 1);
  };

  const prepareChallenge = () => ({
    ...form,
    putts: Number(form.putts),
    startDistance: Number(form.startDistance),
    holedPoints: Number(form.holedPoints),
    rings: form.rings
      .map(r => ({
        distance: Number(r.distance),
        score: Number(r.score || 0),
        short: Number(r.short || 0),
        beyond: Number(r.beyond || 0)
      }))
      .sort((a,b)=>a.distance-b.distance)
  });

  return <main className="screen light-screen app-screen">
    <div className="builder-head"><button className="icon-btn" onClick={onBack}><X /></button><div><small>Challenge builder</small><strong>Step {step} of 6</strong></div><span /></div>
    <div className="content-scroll builder-content">
      {step === 1 && <>
        <p className="eyebrow dark">Challenge type</p><h2>What are your students practising?</h2>
        <div className="type-grid">{['Putting','Chipping','Approach','Driving'].map(type => { const disabled = type !== 'Putting'; return <button key={type} disabled={disabled} className={`type-card ${form.type === type ? 'selected' : ''}`} onClick={() => selectType(type)}><Target/><strong>{type}</strong>{disabled && <small>Coming Soon</small>}</button>; })}</div>
      </>}

      {step === 2 && <>
        <p className="eyebrow dark">Putting templates</p><h2>Choose a template</h2>
        <p className="helper-text">Templates define the exercise format. You’ll customise the details and scoring before publishing.</p>
        <div className="type-grid template-grid">
          <button className={`type-card template-card ${form.template === 'Lag Putting' ? 'selected' : ''}`} onClick={() => selectTemplate('Lag Putting')}><Flag/><strong>Lag Putting</strong><small>Distance-control target with configurable scoring rings.</small></button>
          <button className="type-card template-card" disabled><Target/><strong>Putting Ladder</strong><small>Coming Soon</small></button>
        </div>
      </>}

      {step === 3 && <>
        <p className="eyebrow dark">Challenge details</p><h2>Set the challenge instructions</h2>
        <label>Challenge title</label><input className="field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Lag Putting" />
        <label>Instructions</label><textarea className="field textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Explain how to complete the challenge" />
        <div className="two-col"><div><label>Number of putts</label><input className="field" type="number" min="1" value={form.putts} onChange={e => setForm({ ...form, putts: e.target.value })}/></div><div><label>Start distance (ft)</label><input className="field" type="number" min="1" value={form.startDistance} onChange={e => setForm({ ...form, startDistance: e.target.value })}/></div></div>
      </>}

      {step === 4 && <>
        <p className="eyebrow dark">Target design</p><h2>How should landing positions score?</h2>
        <div className="segmented">{[['full','Full rings'],['split','Half rings']].map(([mode,label]) => <button className={form.targetMode === mode ? 'active' : ''} onClick={() => setForm({ ...form, targetMode: mode })} key={mode}>{label}</button>)}</div>
        <div className="builder-green"><MiniGreen rings={form.rings} split={form.targetMode === 'split'} showLabels /></div>
        <label>Holed putt score</label><input className="field" type="number" value={form.holedPoints} onChange={e => setForm({...form,holedPoints:e.target.value})} placeholder="e.g. 5"/>
        <div className="score-table"><div className={`score-head ${form.targetMode === 'full' ? 'full' : ''}`}><span>Distance</span>{form.targetMode === 'full' ? <span>Score</span> : <><span>Short</span><span>Beyond</span></>}<span /></div>{form.rings.length ? form.rings.map((r,i)=><div className={`score-row ${form.targetMode === 'full' ? 'full' : ''}`} key={i}><div className="distance-input"><input type="number" min="0.1" step="0.5" value={r.distance} onChange={e=>updateRing(i,'distance',e.target.value)} placeholder="ft"/><small>ft</small></div>{form.targetMode === 'full' ? <input type="number" value={r.score} onChange={e=>updateRing(i,'score',e.target.value)} placeholder="pts"/> : <><input type="number" value={r.short} onChange={e=>updateRing(i,'short',e.target.value)} placeholder="pts"/><input type="number" value={r.beyond} onChange={e=>updateRing(i,'beyond',e.target.value)} placeholder="pts"/></>}<button className="remove-ring" onClick={() => removeRing(i)}><Trash2 size={16}/></button></div>) : <div className="empty-inline">Add your first scoring distance.</div>}</div>
        <button className="secondary-btn add-ring" disabled={form.rings.length >= 5} onClick={addRing}><Plus size={16}/> {form.rings.length >= 5 ? 'Maximum 5 distances' : 'Add distance'}</button>
        <p className="helper-text">Add up to five scoring rings in ascending order. A landing beyond the largest ring scores 0 points.</p>{errors.holed && <p className="field-error">{errors.holed}</p>}{errors.rings && <p className="field-error">{errors.rings}</p>}
      </>}

      {step === 5 && <>
        <p className="eyebrow dark">Availability</p><h2>Set challenge access</h2><label>Allowed attempts</label><div className="attempt-options">{[1,3,Infinity].map(v=><button className={form.maxAttempts===v?'selected':''} onClick={()=>setForm({...form,maxAttempts:v})} key={String(v)}>{v===Infinity?'Unlimited':v===1?'One time':`${v} times`}</button>)}</div><div className="publish-card"><div><strong>Publish to library</strong><p>Visible to connected students.</p></div><div className="toggle on"><span/></div></div><div className="publish-card muted"><div><strong>Recommend to a student</strong><p>Available after students connect.</p></div><div className="toggle"><span/></div></div>
      </>}

      {step === 6 && <>
        <p className="eyebrow dark">Review</p><h2>Check before publishing</h2>
        <div className="review-preview"><MiniGreen rings={form.rings} split={form.targetMode === 'split'} showLabels /></div>
        <div className="review-card"><h3>{form.title}</h3><p>{form.description}</p>
          <div className="review-line"><span>Template</span><strong>{form.template}</strong></div>
          <div className="review-line"><span>Structure</span><strong>{form.putts} putts from {form.startDistance} ft</strong></div>
          <div className="review-line"><span>Target</span><strong>{form.targetMode === 'full' ? 'Full Rings' : 'Half Rings'}</strong></div>
          <div className="review-line"><span>Holed</span><strong>{form.holedPoints} pts</strong></div>
          {form.rings.map((r,i)=><div className="review-line" key={i}><span>{r.distance} ft</span><strong>{form.targetMode === 'full' ? `${r.score} pts` : `${r.short} short · ${r.beyond} beyond`}</strong></div>)}
          <div className="review-line"><span>Outside zones</span><strong>0 pts</strong></div>
          <div className="review-line"><span>Attempts</span><strong>{form.maxAttempts === Infinity ? 'Unlimited' : form.maxAttempts}</strong></div>
        </div>
      </>}
    </div>
    <div className="builder-footer">{step > 1 && <button className="secondary-btn" onClick={()=>setStep(step-1)}>Back</button>}<button className="primary-btn dark-btn" disabled={!canContinue} onClick={()=> step < 6 ? continueBuilder() : onSave(prepareChallenge())}>{step < 6 ? 'Continue' : 'Publish challenge'} <ArrowRight size={18}/></button></div>
  </main>;
}

function ChallengeDetail({ challenge, onBack, onStart }) {
  return <main className="screen light-screen app-screen"><TopBar onBack={onBack} /><div className="content-scroll challenge-detail"><div className="detail-art"><MiniGreen rings={challenge.rings} split={challenge.targetMode === 'split'} /></div>{challenge.recommended && <span className="recommend-badge"><Sparkles size={13}/> Recommended by your coach</span>}<h1>{challenge.title}</h1><p>{challenge.description}</p><div className="detail-metrics"><Metric value={`${challenge.putts}`} label="Putts"/><Metric value={`${challenge.startDistance} ft`} label="Start"/><Metric value={challenge.attempts} label="Attempts"/></div><section className="rules-card"><h3>Scoring</h3><p>Choose “Holed”, mark a landing position, or record that the ball finished beyond every scoring zone.</p><div className="rule-row"><span>Holed</span><strong>{challenge.holedPoints} pts</strong></div>{challenge.rings.map((r,i)=><div className="rule-row" key={i}><span>Within {r.distance} ft</span><strong>{challenge.targetMode==='full'?`${r.score} pts`:`${r.short} short · ${r.beyond} beyond`}</strong></div>)}<div className="rule-row"><span>Beyond all scoring zones</span><strong>0 pts</strong></div></section></div><div className="sticky-action"><button className="primary-btn dark-btn" onClick={onStart}>Start challenge <ArrowRight size={18}/></button></div></main>;
}
function Metric({value,label}){return <div><strong>{value}</strong><span>{label}</span></div>}

function PuttingRecorder({ challenge, onBack, onSubmit }) {
  const total = challenge.putts;
  const [markers,setMarkers]=useState([]);
  const [showChoice,setShowChoice]=useState(true);
  const score = useMemo(()=>markers.reduce((s,m)=>s+m.points,0),[markers]);
  const finishRecord = (marker) => { const next = [...markers, {...marker,index:markers.length+1}]; setMarkers(next); setShowChoice(next.length < total); };
  const addHoled=()=> markers.length < total && finishRecord({x:50,y:50,holed:true,points:challenge.holedPoints});
  const addOutside=()=> markers.length < total && finishRecord({outside:true,holed:false,points:0});
  const addMarker=(e)=>{
    if(showChoice || markers.length>=total) return;
    const rect=e.currentTarget.getBoundingClientRect();
    const x=((e.clientX-rect.left)/rect.width)*100; const y=((e.clientY-rect.top)/rect.height)*100;
    const dx=x-50, dy=y-50; const distPct=Math.sqrt(dx*dx+dy*dy);
    const largest = Math.max(...challenge.rings.map(r => r.distance));
    const approxFeet=(distPct/38)*largest;
    const ring=[...challenge.rings].sort((a,b)=>a.distance-b.distance).find(r=>approxFeet<=r.distance);
    const beyond=y<50;
    const points = ring ? (challenge.targetMode==='full' ? ring.score : (beyond ? ring.beyond : ring.short)) : 0;
    finishRecord({x,y,holed:false,points,beyond,distance:ring ? ring.distance : null,outside:!ring});
  };
  const undo=()=>{setMarkers(markers.slice(0,-1));setShowChoice(true)};
  const complete=markers.length===total;
  return <main className="screen recorder-screen"><div className="recorder-head"><button className="icon-btn light" onClick={onBack}><X/></button><div><small>{challenge.title}</small><strong>Putt {Math.min(markers.length+1,total)} of {total}</strong></div><button className="icon-btn light" onClick={undo} disabled={!markers.length}><Undo2/></button></div><div className="live-stats"><div><strong>{score}</strong><span>points</span></div><div><strong>{markers.filter(m=>m.holed).length}</strong><span>holed</span></div><div><strong>{total-markers.length}</strong><span>remaining</span></div></div><div className="green-stage"><div className="direction-label top">BEYOND</div><div className="direction-label bottom">SHORT</div><div className="putting-green" onClick={addMarker}><div className="turf-lines"/>{challenge.rings.map((ring,i) => { const largest=Math.max(...challenge.rings.map(r=>r.distance)); const radius=12+(ring.distance/largest)*26; return <React.Fragment key={i}><div className="target-ring" style={{width:`${radius*2}%`,height:`${radius*2}%`}}/><span className={`ring-label ring-label-${i}`} style={{left:'50%',top:`${50-radius}%`}}>{ring.distance} ft</span></React.Fragment>; })}<div className="split-line"/><div className="hole"><Flag size={18}/></div>{markers.filter(m=>!m.outside).map(m=><div key={m.index} className={`ball-marker ${m.holed?'holed':''}`} style={{left:`${m.x}%`,top:`${m.y}%`}}>{m.index}</div>)}</div><div className="start-arrow">↑ putting direction</div></div><div className="recorder-panel">{!complete ? <>{showChoice ? <><h3>Where did putt {markers.length+1} finish?</h3><div className="record-actions three"><button className="holed-btn" onClick={addHoled}><CircleDot/> Holed</button><button className="mark-btn" onClick={()=>setShowChoice(false)}><Target/> Mark position</button><button className="outside-btn" onClick={addOutside}><CircleOff/> Beyond zones</button></div></> : <><h3>Tap the green to mark the ball</h3><p>Distance labels show the coach’s scoring zones.</p></>}</> : <><div className="complete-row"><div className="icon-badge small"><Check/></div><div><h3>Challenge complete</h3><p>Your attempt is ready to submit.</p></div></div><button className="primary-btn dark-btn" onClick={()=>onSubmit({score,holed:markers.filter(m=>m.holed).length,total,markers})}>Submit result <Lock size={16}/></button></>}</div></main>;
}

function StudentResult({ attempt, challenge, onDone }) { return <main className="screen light-screen result-screen"><div className="result-hero"><div className="icon-badge success"><Check/></div><p className="eyebrow">Attempt submitted</p><h1>{attempt.score} points</h1><p>{attempt.holed} of {attempt.total} putts holed</p></div><div className="result-body"><h3>{challenge.title}</h3><div className="detail-metrics"><Metric value={attempt.score} label="Points"/><Metric value={`${attempt.holed}/${attempt.total}`} label="Holed"/><Metric value="#1" label="Attempt"/></div><div className="locked-note"><Lock size={16}/><span>This result is locked and cannot be edited or deleted.</span></div><button className="primary-btn dark-btn" onClick={onDone}>Back to home</button></div></main>; }
function CoachResult({ attempt, challenge, onBack }) { if (!attempt || !challenge) return null; return <main className="screen light-screen app-screen"><TopBar onBack={onBack}/><div className="content-scroll"><p className="eyebrow dark">Student result</p><h2>Latest recorded attempt</h2><div className="student-summary"><div className="avatar large"><Target/></div><div><strong>Student attempt</strong><span>{challenge.title}</span></div></div><div className="result-score-card"><strong>{attempt.score}</strong><span>points</span><div className="detail-metrics"><Metric value={`${attempt.holed}/${attempt.total}`} label="Holed"/><Metric value={attempt.markers.filter(m=>m.outside).length} label="Beyond zones"/><Metric value="#1" label="Attempt"/></div></div><div className="coach-view-note"><LineChart/><div><strong>Results only</strong><p>Self-recorded challenges are visible for progress tracking. No coach feedback is attached to individual attempts.</p></div></div></div></main>; }


function TrendChart({ attempts }) {
  if (attempts.length < 2) return <div className="trend-empty">Complete this challenge again to see a trend.</div>;
  const values=[...attempts].reverse().map(a=>a.score);
  const max=Math.max(...values,1), min=Math.min(...values,0), span=max-min||1;
  const points=values.map((v,i)=>`${12+(i/(values.length-1))*276},${105-((v-min)/span)*80}`).join(' ');
  return <svg className="trend-chart" viewBox="0 0 300 120" role="img" aria-label="Score trend"><line x1="12" y1="105" x2="288" y2="105"/><polyline points={points}/>{values.map((v,i)=><circle key={i} cx={12+(i/(values.length-1))*276} cy={105-((v-min)/span)*80} r="4"/> )}</svg>;
}

function StudentProgress({ challenges, attempts, onBack }) {
  const groups=challenges.map(c=>{const rows=attempts.filter(a=>a.challengeId===c.id); if(!rows.length)return null; const best=Math.max(...rows.map(a=>a.score)); const avg=Math.round(rows.reduce((s,a)=>s+a.score,0)/rows.length); return {c,rows,best,avg};}).filter(Boolean);
  return <main className="screen light-screen app-screen"><TopBar onBack={onBack}/><div className="content-scroll"><p className="eyebrow dark">Progress</p><h2 className="page-title">Completed challenges</h2>{groups.length?groups.map(g=><section className="progress-card" key={g.c.id}><div className="progress-title"><div><strong>{g.c.title}</strong><span>{g.rows.length} attempt{g.rows.length===1?'':'s'}</span></div><BarChart3/></div><div className="progress-metrics"><Metric value={g.best} label="Best"/><Metric value={g.avg} label="Average"/><Metric value={`${g.rows[0].holed}/${g.rows[0].total}`} label="Latest holed"/></div><TrendChart attempts={g.rows}/><div className="attempt-list">{g.rows.map((a,i)=><div key={a.id}><span>{a.date}</span><strong>{a.score} pts</strong></div>)}</div></section>):<EmptyState icon={<ListChecks/>} title="No completed challenges" text="Your submitted attempts will appear here."/>}</div></main>;
}

function CoachChallengeResults({ challenge, attempts, onBack }) {
  const best=attempts.length?Math.max(...attempts.map(a=>a.score)):0;
  const avg=attempts.length?Math.round(attempts.reduce((s,a)=>s+a.score,0)/attempts.length):0;
  return <main className="screen light-screen app-screen"><TopBar onBack={onBack}/><div className="content-scroll"><p className="eyebrow dark">Challenge results</p><h2 className="page-title">{challenge.title}</h2>{attempts.length?<><div className="progress-metrics standalone"><Metric value={attempts.length} label="Attempts"/><Metric value={best} label="Best"/><Metric value={avg} label="Average"/></div><section className="progress-card"><h3>Score trend</h3><TrendChart attempts={attempts}/><div className="attempt-list">{attempts.map((a,i)=><div key={a.id}><span>Attempt {attempts.length-i} · {a.date}</span><strong>{a.score} pts</strong></div>)}</div></section></>:<EmptyState icon={<LineChart/>} title="No results yet" text="Student attempts for this challenge will appear here."/>}</div></main>;
}

function MiniGreen({rings=[],split=false,showLabels=false}) { const valid=[...rings].filter(r=>Number(r.distance)>0).sort((a,b)=>Number(b.distance)-Number(a.distance)).slice(0,5); const count=valid.length; return <div className="mini-green">{count ? valid.map((r,i)=>{const size=90-i*(60/Math.max(count,1)); return <React.Fragment key={`${r.distance}-${i}`}><div className="mini-ring" style={{width:`${size}%`,height:`${size}%`}}/>{showLabels&&<span className="mini-ring-label" style={{top:`${50-size/2}%`}}>{r.distance} ft</span>}</React.Fragment>}) : <div className="mini-empty">Add a ring to preview</div>}{split&&count>0&&<div className="mini-split"/>}<div className="mini-hole"><Flag size={12}/></div></div>; }
function BottomNav({ role, active, onNavigate }) { const items = role === 'Coach' ? [['Home',Home,'coach-home'],['Students',Users,'coach-home'],['Challenges',Library,'coach-home'],['Lessons',ClipboardList,'coach-home'],['Profile',User,'coach-home']] : [['Home',Home,'student-home'],['Challenges',Target,'student-home'],['History',ListChecks,'student-home'],['Lessons',ClipboardList,'student-home'],['Profile',User,'student-home']]; return <nav className="bottom-nav">{items.map(([label,Icon,target])=><button className={active===label?'active':''} key={label} onClick={()=>onNavigate(target)}><Icon size={20}/><span>{label}</span></button>)}</nav>; }

createRoot(document.getElementById('root')).render(<App />);
