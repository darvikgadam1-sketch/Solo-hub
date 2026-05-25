import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from "recharts";

const STORAGE_KEY = "solohub_v1";

const defaultData = {
  workouts: [
    { id: 1, date: "2026-05-19", type: "Bench Press",   sets: 4, reps: 10, weight: 135, duration: 45, feel: "great", notes: "New PR!" },
    { id: 2, date: "2026-05-21", type: "Squat",         sets: 3, reps: 8,  weight: 185, duration: 50, feel: "good",  notes: "Felt solid" },
    { id: 3, date: "2026-05-23", type: "Deadlift",      sets: 3, reps: 5,  weight: 225, duration: 40, feel: "okay",  notes: "Tired legs" },
    { id: 4, date: "2026-05-24", type: "Shoulder Press",sets: 4, reps: 10, weight: 95,  duration: 35, feel: "great", notes: "Good pump" },
    { id: 5, date: "2026-05-25", type: "Pull-ups",      sets: 4, reps: 8,  weight: 0,   duration: 30, feel: "good",  notes: "Bodyweight" },
  ],
  bodyWeights: [
    { date: "2026-05-01", weight: 178.5 },
    { date: "2026-05-05", weight: 177.8 },
    { date: "2026-05-10", weight: 177.2 },
    { date: "2026-05-15", weight: 176.6 },
    { date: "2026-05-20", weight: 176.0 },
    { date: "2026-05-25", weight: 175.4 },
  ],
  goals: { weightGoal: 170, weeklyWorkouts: 4 },
};

const WORKOUT_TYPES = [
  "Bench Press","Squat","Deadlift","Shoulder Press","Pull-ups","Barbell Rows",
  "Bicep Curls","Tricep Pushdown","Leg Press","Lunges","Overhead Press",
  "Lat Pulldown","Cable Fly","Dips","Run","Cycling","HIIT","Other"
];

const FEEL = [
  { value:"great", emoji:"🔥", label:"Great",  color:"#c8ff00" },
  { value:"good",  emoji:"💪", label:"Good",   color:"#00d4ff" },
  { value:"okay",  emoji:"😐", label:"Okay",   color:"#ff9f1c" },
  { value:"tough", emoji:"😓", label:"Tough",  color:"#ff4d6d" },
];

function loadData() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : defaultData; }
  catch { return defaultData; }
}
function saveData(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} }

// ─── Tokens ────────────────────────────────────────────────────────────────
const C = {
  accent:  "#c8ff00",
  blue:    "#00d4ff",
  red:     "#ff4d6d",
  purple:  "#9b5de5",
  orange:  "#ff9f1c",
  bg:      "#0a0a0a",
  card:    "#121212",
  border:  "rgba(255,255,255,0.07)",
  muted:   "rgba(255,255,255,0.35)",
  dimmed:  "rgba(255,255,255,0.15)",
};

const mono = "'DM Mono', monospace";
const display = "'Syne', sans-serif";

const base = {
  width:"100%", boxSizing:"border-box",
  background:"rgba(255,255,255,0.05)",
  border:"1px solid rgba(255,255,255,0.1)",
  borderRadius:12, padding:"11px 14px",
  color:"#fff", fontSize:14, fontFamily:mono, outline:"none",
  transition:"border 0.15s",
};

// ─── Small helpers ─────────────────────────────────────────────────────────
function Label({ children, color }) {
  return <div style={{ fontSize:10, color:color||C.muted, fontFamily:mono, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:7 }}>{children}</div>;
}
function F({ label, color, children }) {
  return <div style={{ marginBottom:16 }}><Label color={color}>{label}</Label>{children}</div>;
}

function Sheet({ onClose, title, accent=C.accent, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:300, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:"#151515", borderTop:`2px solid ${accent}`, borderRadius:"24px 24px 0 0", padding:"28px 24px 40px", width:"100%", maxWidth:480, maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
        <div style={{ width:40, height:4, background:"rgba(255,255,255,0.12)", borderRadius:2, margin:"0 auto 24px" }}/>
        <div style={{ marginBottom:24 }}>
          <span style={{ fontSize:20, fontWeight:800, color:"#fff", fontFamily:display }}>{title}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function PrimaryBtn({ children, onClick, color=C.accent }) {
  return (
    <button onClick={onClick} style={{ background:color, color:"#000", border:"none", borderRadius:14, padding:"14px", fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:mono, width:"100%", letterSpacing:"0.05em", transition:"opacity 0.15s" }}>
      {children}
    </button>
  );
}

function StatPill({ value, unit, label, color=C.accent }) {
  return (
    <div style={{ flex:1, background:`${color}12`, border:`1px solid ${color}28`, borderRadius:14, padding:"14px 10px", textAlign:"center" }}>
      <div style={{ fontSize:22, fontWeight:900, color, fontFamily:display, lineHeight:1 }}>{value}</div>
      {unit && <div style={{ fontSize:9, color:C.dimmed, fontFamily:mono, marginTop:2 }}>{unit}</div>}
      <div style={{ fontSize:9, color:C.muted, fontFamily:mono, marginTop:3, textTransform:"uppercase", letterSpacing:"0.07em" }}>{label}</div>
    </div>
  );
}

function Card({ children, style }) {
  return <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:"22px 20px", ...style }}>{children}</div>;
}

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#1c1c1c", border:`1px solid ${C.border}`, borderRadius:10, padding:"8px 14px", fontFamily:mono, fontSize:11, color:"#fff" }}>
      <div style={{ color:C.muted, marginBottom:4 }}>{label}</div>
      {payload.map(p=><div key={p.name} style={{ color:p.color||"#fff" }}>{p.name}: <b>{p.value}</b></div>)}
    </div>
  );
};

const TABS = [
  { id:"Home",     icon:"⚡", label:"Home"     },
  { id:"Sessions", icon:"🏋️", label:"Sessions" },
  { id:"Progress", icon:"📈", label:"Progress" },
  { id:"Settings", icon:"⚙️", label:"Settings" },
];

// ─── Main ──────────────────────────────────────────────────────────────────
export default function SoloHub() {
  const [tab, setTab]     = useState("Home");
  const [data, setData]   = useState(loadData);
  const [sheet, setSheet] = useState(null);
  const today  = new Date().toISOString().slice(0,10);
  const weekAgo = new Date(Date.now()-7*864e5).toISOString().slice(0,10);

  const blank = { date:today, type:"Bench Press", sets:"", reps:"", weight:"", duration:"", feel:"good", notes:"" };
  const [form, setForm]   = useState(blank);
  const [bwForm, setBwForm] = useState({ date:today, weight:"" });

  const defaultProfile = { name:"", age:"", height:"", unit:"lbs", weeklyGoal:"4", weightGoal:"170" };
  const [profile, setProfile] = useState(()=>{ try { const p=localStorage.getItem("solohub_profile"); return p?JSON.parse(p):defaultProfile; } catch{return defaultProfile;} });
  const [profileSaved, setProfileSaved] = useState(false);

  function saveProfile() {
    try { localStorage.setItem("solohub_profile", JSON.stringify(profile)); } catch{}
    setProfileSaved(true);
    setTimeout(()=>setProfileSaved(false), 2000);
  }

  useEffect(()=>{ saveData(data); },[data]);

  // ── Derived ──
  const thisWeek  = data.workouts.filter(w=>w.date>=weekAgo);
  const weekCount = thisWeek.length;
  const latest    = data.bodyWeights.length ? data.bodyWeights[data.bodyWeights.length-1].weight : 0;
  const delta     = data.bodyWeights.length>=2 ? (data.bodyWeights[data.bodyWeights.length-1].weight-data.bodyWeights[0].weight).toFixed(1) : null;
  const bests     = data.workouts.reduce((acc,w)=>{
    if (w.weight>0 && (!acc[w.type]||w.weight>acc[w.type])) acc[w.type]=w.weight;
    return acc;
  },{});
  const volData = data.workouts.slice(-10).map(w=>({
    date: w.date.slice(5),
    vol:  w.weight?(w.sets||1)*(w.reps||1)*w.weight:0,
  }));
  const feelMap = Object.fromEntries(FEEL.map(f=>[f.value,f]));

  // ── Actions ──
  function saveWorkout() {
    if (!form.type) return;
    setData(d=>({...d, workouts:[...d.workouts,{...form,id:Date.now(),sets:+form.sets||0,reps:+form.reps||0,weight:+form.weight||0,duration:+form.duration||0}].sort((a,b)=>a.date>b.date?1:-1)}));
    setForm(blank); setSheet(null);
  }
  function saveBodyWeight() {
    if (!bwForm.weight) return;
    const i = data.bodyWeights.findIndex(w=>w.date===bwForm.date);
    const bw = i>=0 ? data.bodyWeights.map((w,j)=>j===i?{...w,weight:+bwForm.weight}:w) : [...data.bodyWeights,{date:bwForm.date,weight:+bwForm.weight}].sort((a,b)=>a.date>b.date?1:-1);
    setData(d=>({...d,bodyWeights:bw})); setSheet(null);
  }

  const sectionLabel = txt => (
    <div style={{ fontSize:10, color:C.muted, fontFamily:mono, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:14 }}>{txt}</div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:${C.bg};overscroll-behavior:none;}
        ::-webkit-scrollbar{width:2px;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px;}
        select option{background:#151515;}
        input[type=number]::-webkit-inner-spin-button{opacity:0.25;}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.4);}
      `}</style>

      <div style={{ minHeight:"100vh", background:C.bg, fontFamily:mono, color:"#fff", paddingBottom:90 }}>

        {/* ── Header ── */}
        <div style={{ background:"linear-gradient(160deg,#12001f 0%,#001520 50%,#0a1a00 100%)", padding:"32px 22px 0", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ maxWidth:860, margin:"0 auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
              {/* Logo */}
              <div>
                <div style={{ fontSize:11, color:C.dimmed, letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:3 }}>your training hub</div>
                <div style={{ fontSize:28, fontWeight:900, fontFamily:display, lineHeight:1, letterSpacing:"-0.02em" }}>
                  <span style={{ color:C.accent }}>Solo</span><span style={{ color:"#fff" }}>Hub</span>
                </div>
              </div>
              {/* Actions */}
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>{ setForm(blank); setSheet("workout"); }} style={{ background:C.accent, color:"#000", border:"none", borderRadius:12, padding:"10px 18px", fontSize:12, fontFamily:mono, cursor:"pointer", fontWeight:700, letterSpacing:"0.04em" }}>+ Session</button>
                <button onClick={()=>setSheet("bodyweight")} style={{ background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}`, color:"rgba(255,255,255,0.6)", borderRadius:12, padding:"10px 16px", fontSize:12, fontFamily:mono, cursor:"pointer", fontWeight:700 }}>⚖️</button>
              </div>
            </div>

            {/* Tab bar */}
            <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${C.border}` }}>
              {TABS.map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, background:"none", border:"none", padding:"11px 6px 14px", fontFamily:mono, fontSize:11, cursor:"pointer", color:tab===t.id?"#fff":C.muted, borderBottom:tab===t.id?`2px solid ${C.accent}`:"2px solid transparent", letterSpacing:"0.06em", fontWeight:tab===t.id?700:400, transition:"all 0.15s", marginBottom:-1 }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding:"26px 22px", maxWidth:860, margin:"0 auto" }}>

          {/* ════ HOME ════ */}
          {tab==="Home" && (
            <div style={{ display:"flex", flexDirection:"column", gap:22 }}>

              {/* Weekly snapshot */}
              <Card>
                {sectionLabel("This week")}
                <div style={{ display:"flex", gap:10 }}>
                  <StatPill value={weekCount} unit={`/ ${data.goals.weeklyWorkouts} goal`} label="Sessions" color={C.accent}/>
                  <StatPill value={thisWeek.reduce((s,w)=>s+(w.duration||0),0)} unit="min" label="Total time" color={C.blue}/>
                  <StatPill value={thisWeek.reduce((s,w)=>s+(w.weight>0?(w.sets||1)*(w.reps||1)*w.weight:0),0).toLocaleString()} unit="lbs" label="Volume" color={C.purple}/>
                </div>
              </Card>

              {/* Streak / feel breakdown */}
              {data.workouts.length > 0 && (
                <Card>
                  {sectionLabel("Recent feel")}
                  <div style={{ display:"flex", gap:6 }}>
                    {FEEL.map(f=>{
                      const n = thisWeek.filter(w=>w.feel===f.value).length;
                      return (
                        <div key={f.value} style={{ flex:1, textAlign:"center", padding:"12px 6px", background:`${f.color}10`, border:`1px solid ${f.color}22`, borderRadius:12 }}>
                          <div style={{ fontSize:22 }}>{f.emoji}</div>
                          <div style={{ fontSize:18, fontWeight:900, color:f.color, fontFamily:display, lineHeight:1, marginTop:4 }}>{n}</div>
                          <div style={{ fontSize:9, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginTop:3 }}>{f.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Volume trend */}
              <Card>
                {sectionLabel("Volume trend — last 10 sessions")}
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={volData}>
                    <defs>
                      <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.accent} stopOpacity={0.3}/>
                        <stop offset="100%" stopColor={C.accent} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                    <XAxis dataKey="date" tick={{ fill:C.muted, fontSize:9 }}/>
                    <YAxis tick={{ fill:C.muted, fontSize:9 }}/>
                    <Tooltip content={<Tip/>}/>
                    <Area type="monotone" dataKey="vol" stroke={C.accent} strokeWidth={2} fill="url(#vg)" name="Volume (lbs)"/>
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Personal bests */}
              {Object.keys(bests).length > 0 && (
                <Card>
                  {sectionLabel("Personal bests")}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:10 }}>
                    {Object.entries(bests).map(([ex,w])=>(
                      <div key={ex} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}`, borderRadius:14, padding:"14px 16px", display:"flex", flexDirection:"column", gap:3 }}>
                        <div style={{ fontSize:9, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em" }}>{ex}</div>
                        <div style={{ fontSize:22, fontWeight:900, color:C.accent, fontFamily:display }}>{w}<span style={{ fontSize:11, fontWeight:400, color:C.dimmed }}> lbs</span></div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Last session */}
              {data.workouts.length > 0 && (() => {
                const w = data.workouts[data.workouts.length-1];
                const f = feelMap[w.feel];
                return (
                  <Card>
                    {sectionLabel("Last session")}
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                      <div>
                        <div style={{ fontSize:20, fontWeight:800, color:"#fff", fontFamily:display }}>{w.type}</div>
                        <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{w.date}{w.duration?` · ${w.duration} min`:""}</div>
                      </div>
                      <div style={{ background:`${f?.color||C.accent}18`, border:`1px solid ${f?.color||C.accent}30`, borderRadius:12, padding:"8px 14px", textAlign:"center" }}>
                        <div style={{ fontSize:22 }}>{f?.emoji}</div>
                        <div style={{ fontSize:9, color:f?.color||C.accent, fontFamily:mono, textTransform:"uppercase", letterSpacing:"0.06em", marginTop:2 }}>{f?.label}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      {w.weight>0 && <StatPill value={w.weight} unit="lbs" label="Weight" color={C.accent}/>}
                      {w.sets>0   && <StatPill value={w.sets}   unit="sets" label="Sets" color={C.blue}/>}
                      {w.reps>0   && <StatPill value={w.reps}   unit="reps" label="Reps" color={C.purple}/>}
                    </div>
                    {w.notes && <div style={{ marginTop:14, fontSize:13, color:C.muted, fontStyle:"italic", borderLeft:`2px solid ${C.border}`, paddingLeft:12 }}>"{w.notes}"</div>}
                  </Card>
                );
              })()}
            </div>
          )}

          {/* ════ SESSIONS ════ */}
          {tab==="Sessions" && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[...data.workouts].reverse().map(w=>{
                const f = feelMap[w.feel];
                return (
                  <div key={w.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:"18px 20px", transition:"border 0.15s" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                      <div>
                        <div style={{ fontSize:17, fontWeight:800, color:"#fff", fontFamily:display, marginBottom:3 }}>{w.type}</div>
                        <div style={{ fontSize:10, color:C.muted }}>{w.date}{w.duration?` · ${w.duration} min`:""}</div>
                      </div>
                      <div style={{ background:`${f?.color||C.accent}15`, border:`1px solid ${f?.color||C.accent}25`, borderRadius:20, padding:"5px 13px", display:"flex", alignItems:"center", gap:5 }}>
                        <span style={{ fontSize:14 }}>{f?.emoji||"💪"}</span>
                        <span style={{ fontSize:10, color:f?.color||C.accent, fontFamily:mono, fontWeight:700 }}>{f?.label||"—"}</span>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      {w.weight>0 && <StatPill value={w.weight} unit="lbs" label="Weight" color={C.accent}/>}
                      {w.sets>0   && <StatPill value={w.sets}   unit="sets" label="Sets"   color={C.blue}/>}
                      {w.reps>0   && <StatPill value={w.reps}   unit="reps" label="Reps"   color={C.purple}/>}
                      {w.sets>0&&w.reps>0&&w.weight>0 && <StatPill value={(w.sets*w.reps*w.weight).toLocaleString()} unit="lbs" label="Volume" color={C.orange}/>}
                    </div>
                    {w.notes && <div style={{ marginTop:12, fontSize:12, color:C.muted, fontStyle:"italic", borderLeft:`2px solid ${C.border}`, paddingLeft:12 }}>"{w.notes}"</div>}
                  </div>
                );
              })}
              <button onClick={()=>{ setForm(blank); setSheet("workout"); }} style={{ background:"rgba(255,255,255,0.05)", border:`1px dashed rgba(255,255,255,0.14)`, color:C.muted, borderRadius:16, padding:"16px", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:mono }}>+ Log Session</button>
            </div>
          )}

          {/* ════ PROGRESS ════ */}
          {tab==="Progress" && (
            <div style={{ display:"flex", flexDirection:"column", gap:22 }}>

              {/* Body weight */}
              <Card>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  {sectionLabel("Body weight")}
                  <div style={{ display:"flex", gap:16, fontSize:13 }}>
                    <span style={{ color:"#fff", fontWeight:800, fontFamily:display }}>{latest} <span style={{ fontSize:11, color:C.muted, fontWeight:400 }}>lbs now</span></span>
                    <span style={{ color:C.accent, fontWeight:800, fontFamily:display }}>{data.goals.weightGoal} <span style={{ fontSize:11, color:C.muted, fontWeight:400 }}>lbs goal</span></span>
                  </div>
                </div>
                {delta && (
                  <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:+delta<0?`${C.accent}10`:`${C.red}10`, border:`1px solid ${+delta<0?C.accent:C.red}25`, borderRadius:12, marginBottom:16 }}>
                    <span style={{ fontSize:20 }}>{+delta<0?"📉":"📈"}</span>
                    <span style={{ fontSize:13, color:+delta<0?C.accent:C.red, fontWeight:700 }}>{Math.abs(delta)} lbs {+delta<0?"lost":"gained"}</span>
                    <span style={{ fontSize:11, color:C.muted }}>over tracked period</span>
                  </div>
                )}
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={data.bodyWeights}>
                    <defs>
                      <linearGradient id="bwg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.red} stopOpacity={0.25}/>
                        <stop offset="100%" stopColor={C.red} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                    <XAxis dataKey="date" tick={{ fill:C.muted, fontSize:9 }} tickFormatter={d=>d.slice(5)}/>
                    <YAxis domain={["dataMin-2","dataMax+2"]} tick={{ fill:C.muted, fontSize:9 }}/>
                    <Tooltip content={<Tip/>}/>
                    <Area type="monotone" dataKey="weight" stroke={C.red} strokeWidth={2.5} fill="url(#bwg)" name="Weight (lbs)"/>
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Personal bests bar chart */}
              {Object.keys(bests).length > 0 && (
                <Card>
                  {sectionLabel("Max weight lifted per exercise")}
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={Object.entries(bests).map(([ex,w])=>({ ex: ex.length>10?ex.slice(0,10)+"…":ex, weight:w }))} layout="vertical" margin={{ left:10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false}/>
                      <XAxis type="number" tick={{ fill:C.muted, fontSize:9 }}/>
                      <YAxis type="category" dataKey="ex" tick={{ fill:"rgba(255,255,255,0.6)", fontSize:10, fontFamily:mono }} width={100}/>
                      <Tooltip content={<Tip/>}/>
                      <Bar dataKey="weight" fill={C.accent} radius={[0,6,6,0]} name="Best (lbs)" barSize={18}/>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Log history */}
              <Card>
                {sectionLabel("Weight log")}
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {[...data.bodyWeights].reverse().map((w,i)=>(
                    <div key={w.date} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", background:"rgba(255,255,255,0.02)", borderRadius:10, border:`1px solid ${C.border}` }}>
                      <span style={{ fontSize:12, color:C.muted }}>{w.date}</span>
                      <span style={{ fontSize:17, fontWeight:900, color:i===0?C.red:"#fff", fontFamily:display }}>{w.weight}<span style={{ fontSize:10, fontWeight:400, color:C.dimmed }}> lbs</span></span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:14 }}>
                  <PrimaryBtn onClick={()=>setSheet("bodyweight")} color={C.red}>+ Log Weight</PrimaryBtn>
                </div>
              </Card>
            </div>
          )}

          {/* ════ SETTINGS ════ */}
          {tab==="Settings" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

              {/* Avatar / name header */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"28px 20px 20px", background:`linear-gradient(160deg,#12001f,#001520)`, borderRadius:20, border:`1px solid ${C.border}` }}>
                <div style={{ width:72, height:72, borderRadius:"50%", background:`linear-gradient(135deg,${C.accent},${C.blue})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, marginBottom:14, fontWeight:900 }}>
                  {profile.name ? profile.name[0].toUpperCase() : "👤"}
                </div>
                <div style={{ fontSize:20, fontWeight:800, color:"#fff", fontFamily:display }}>{profile.name||"Your Name"}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>{profile.age ? `${profile.age} yrs` : ""}{profile.age&&profile.height?" · ":""}{profile.height ? `${profile.height}` : ""}</div>
              </div>

              {/* Personal details */}
              <Card>
                {sectionLabel("Personal details")}
                <F label="Name">
                  <input placeholder="Your name" value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} style={base}/>
                </F>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <F label="Age">
                    <input type="number" placeholder="25" value={profile.age} onChange={e=>setProfile(p=>({...p,age:e.target.value}))} style={base}/>
                  </F>
                  <F label="Height">
                    <input placeholder='5\'10"' value={profile.height} onChange={e=>setProfile(p=>({...p,height:e.target.value}))} style={base}/>
                  </F>
                </div>
              </Card>

              {/* Goals */}
              <Card>
                {sectionLabel("Goals")}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <F label="Weekly sessions">
                    <input type="number" placeholder="4" value={profile.weeklyGoal} onChange={e=>{ setProfile(p=>({...p,weeklyGoal:e.target.value})); setData(d=>({...d,goals:{...d.goals,weeklyWorkouts:+e.target.value||4}})); }} style={base}/>
                  </F>
                  <F label="Goal weight (lbs)">
                    <input type="number" placeholder="170" value={profile.weightGoal} onChange={e=>{ setProfile(p=>({...p,weightGoal:e.target.value})); setData(d=>({...d,goals:{...d.goals,weightGoal:+e.target.value||170}})); }} style={base}/>
                  </F>
                </div>
              </Card>

              {/* Save button */}
              <PrimaryBtn onClick={saveProfile} color={profileSaved ? C.blue : C.accent}>
                {profileSaved ? "✓ Saved!" : "Save Profile"}
              </PrimaryBtn>

              {/* App info */}
              <div style={{ textAlign:"center", padding:"16px 0 8px" }}>
                <div style={{ fontSize:16, fontWeight:900, fontFamily:display, color:"#fff", marginBottom:4 }}><span style={{ color:C.accent }}>Solo</span>Hub</div>
                <div style={{ fontSize:10, color:C.dimmed, fontFamily:mono }}>your personal training hub</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom tab bar ── */}
        <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(10,10,10,0.95)", backdropFilter:"blur(16px)", borderTop:`1px solid ${C.border}`, display:"flex", padding:"10px 0 18px", zIndex:100, maxWidth:"100vw" }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"4px 0" }}>
              <span style={{ fontSize:20, filter:tab===t.id?"none":"grayscale(1) opacity(0.4)" }}>{t.icon}</span>
              <span style={{ fontSize:9, fontFamily:mono, letterSpacing:"0.08em", textTransform:"uppercase", color:tab===t.id?C.accent:C.muted, fontWeight:tab===t.id?700:400 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ════ WORKOUT SHEET ════ */}
      {sheet==="workout" && (
        <Sheet title="New Session" accent={C.accent} onClose={()=>setSheet(null)}>
          <F label="Date"><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={base}/></F>
          <F label="Exercise">
            <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={base}>
              {WORKOUT_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </F>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
            {[["Sets","sets",C.blue],["Reps","reps",C.purple],["Weight (lbs)","weight",C.accent]].map(([l,k,col])=>(
              <div key={k}>
                <div style={{ fontSize:9, color:col, fontFamily:mono, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>{l}</div>
                <input type="number" placeholder="0" value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} style={{ ...base, borderColor:`${col}35`, padding:"10px" }}/>
              </div>
            ))}
          </div>
          <F label="Duration (min)"><input type="number" placeholder="45" value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))} style={base}/></F>
          <F label="How did it feel?">
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
              {FEEL.map(opt=>(
                <button key={opt.value} onClick={()=>setForm(f=>({...f,feel:opt.value}))} style={{ background:form.feel===opt.value?`${opt.color}22`:"rgba(255,255,255,0.03)", border:`2px solid ${form.feel===opt.value?opt.color:"rgba(255,255,255,0.08)"}`, borderRadius:12, padding:"12px 4px", cursor:"pointer", textAlign:"center", transition:"all 0.12s" }}>
                  <div style={{ fontSize:22 }}>{opt.emoji}</div>
                  <div style={{ fontSize:9, color:form.feel===opt.value?opt.color:C.muted, fontFamily:mono, marginTop:4, letterSpacing:"0.06em" }}>{opt.label}</div>
                </button>
              ))}
            </div>
          </F>
          <F label="Notes"><input placeholder="How it went, PRs, anything…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={base}/></F>
          <PrimaryBtn onClick={saveWorkout} color={C.accent}>Save Session</PrimaryBtn>
        </Sheet>
      )}

      {/* ════ BODY WEIGHT SHEET ════ */}
      {sheet==="bodyweight" && (
        <Sheet title="Log Body Weight" accent={C.red} onClose={()=>setSheet(null)}>
          <F label="Date"><input type="date" value={bwForm.date} onChange={e=>setBwForm(f=>({...f,date:e.target.value}))} style={base}/></F>
          <F label="Weight (lbs)"><input type="number" step="0.1" placeholder="175.0" value={bwForm.weight} onChange={e=>setBwForm(f=>({...f,weight:e.target.value}))} style={base} autoFocus/></F>
          <PrimaryBtn onClick={saveBodyWeight} color={C.red}>Save</PrimaryBtn>
        </Sheet>
      )}
    </>
  );
}
