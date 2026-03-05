import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Save, Plus, Trash2, Calendar, Thermometer, AlertTriangle,
  AlertCircle, FileText, CheckCircle, RotateCcw, ChevronLeft,
  Flame, User, Edit3, Settings
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════ */
const DS = {
  color: {
    bg: '#ECEEED', surface: '#FFFFFF', surfaceAlt: '#F7F9F8',
    primary: '#1B5E37', primaryLight: '#2D7A4F', primaryGlow: 'rgba(27,94,55,0.08)',
    cardHeader: '#E8F5EE',
    graphite: '#1E2A26', graphiteMed: '#3D4F48', graphiteLight: '#6B7D76', graphiteMuted: '#95A39D',
    sage: '#A8BFB2', sageMuted: '#C5D5CB',
    ok: '#1B8A50', okBg: '#E8F5EE',
    warning: '#C47F17', warningBg: '#FEF3C7', warningBorder: '#F59E0B', warningText: '#92400E',
    danger: '#C53030', dangerBg: '#FEF2F2',
    pendingBg: '#F0F2F1',
    border: '#D5DDD9', borderLight: '#E4EBE7',
    cold: '#EFF6FF', coldAccent: '#3B82F6', coldText: '#1E40AF', coldGlow: 'rgba(59,130,246,0.08)',
    hot: '#FFF7ED', hotAccent: '#F97316', hotText: '#9A3412', hotGlow: 'rgba(249,115,22,0.08)',
  },
  font: "'DM Sans', system-ui, sans-serif",
  radius: '0px',
  shadow: {
    sm: '0 1px 3px rgba(30,42,38,0.06),0 1px 2px rgba(30,42,38,0.04)',
    md: '0 4px 12px rgba(30,42,38,0.06),0 1px 4px rgba(30,42,38,0.04)',
    lg: '0 8px 24px rgba(30,42,38,0.08),0 2px 8px rgba(30,42,38,0.04)',
    glow: '0 0 20px rgba(27,94,55,0.15),0 4px 12px rgba(30,42,38,0.06)',
  },
};

const LOGO_URL = 'https://aladinfoods.bg/assets/images/aladinfoods_logo.png';

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  @keyframes ctrlFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ctrlBreathe { 0%,100%{box-shadow:${DS.shadow.glow}} 50%{box-shadow:0 0 24px rgba(27,94,55,0.25),0 4px 16px rgba(30,42,38,0.08)} }
  @keyframes warnPulse { 0%,100%{opacity:1} 50%{opacity:0.7} }
  @media (max-width: 767px) { input, button, select, textarea { font-size: 16px !important; } }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${DS.color.sage}; border-radius: 0; }
  input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
`;

const useResponsive = () => {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => { const fn = () => setW(window.innerWidth); window.addEventListener('resize', fn); return () => window.removeEventListener('resize', fn); }, []);
  return { isMobile: w < 768, isTablet: w >= 768 && w < 1024 };
};

const inputBase = (focused) => ({
  width: '100%', padding: '10px 12px', backgroundColor: focused ? DS.color.surface : DS.color.surfaceAlt,
  border: `1.5px solid ${focused ? DS.color.primary : DS.color.borderLight}`, borderRadius: DS.radius,
  fontSize: '14px', fontFamily: DS.font, fontWeight: 400, color: DS.color.graphite, outline: 'none',
  transition: 'all 150ms ease', boxShadow: focused ? `0 0 0 3px ${DS.color.primaryGlow}` : 'none',
  boxSizing: 'border-box', WebkitAppearance: 'none',
});

const ControlInput = ({ label, type = 'text', value, onChange, placeholder, style: s, ...rest }) => {
  const [f, setF] = useState(false);
  return (
    <div style={{ minWidth: 0, flex: 1 }}>
      {label && <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: f ? DS.color.primary : DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{ ...inputBase(f), ...s }} {...rest} />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TEMP SLIDER — хоризонтален плъзгач с цветна зона
   ═══════════════════════════════════════════════════════════════ */
const TempSlider = ({ label, value, onChange, isWarning, accentColor, glowColor, targetTemp, isMobile }) => {
  const [manualMode, setManualMode] = useState(false);
  const [manualVal, setManualVal] = useState('');
  const sliderId = useRef(`ts_${Math.random().toString(36).slice(2, 8)}`).current;
  const numVal = value !== '' ? parseFloat(value) : null;
  const hasVal = numVal !== null && !isNaN(numVal);

  const parseRange = () => {
    if (!targetTemp) return { lo: 50, hi: 100, okLo: 63, okHi: 100 };
    const t = targetTemp.trim();
    if (t.includes('≤') || t.toLowerCase().includes('до')) {
      const m = t.match(/-?\d+\.?\d*/); if (m) { const v = parseFloat(m[0]); return { lo: v - 12, hi: v + 8, okLo: v - 12, okHi: v }; }
    }
    if (t.includes('≥') || t.toLowerCase().includes('над')) {
      const m = t.match(/-?\d+\.?\d*/); if (m) { const v = parseFloat(m[0]); return { lo: v - 10, hi: v + 25, okLo: v, okHi: v + 25 }; }
    }
    const norm = t.replace(/°C/g, '').replace(/\s/g, '');
    const rm = norm.match(/^(-?\d+\.?\d*)[-÷~](\d+\.?\d*)$/);
    if (rm) {
      const a = parseFloat(rm[1]), b = parseFloat(rm[2]);
      const lo = Math.min(a, b), hi = Math.max(a, b);
      const pad = Math.max((hi - lo) * 1.5, 5);
      return { lo: lo - pad, hi: hi + pad, okLo: lo, okHi: hi };
    }
    return { lo: 50, hi: 100, okLo: 63, okHi: 100 };
  };

  const range = parseRange();
  const sliderMin = Math.round(range.lo * 10) / 10;
  const sliderMax = Math.round(range.hi * 10) / 10;
  const toPercent = (v) => ((v - sliderMin) / (sliderMax - sliderMin)) * 100;
  const okLeft = Math.max(0, toPercent(range.okLo));
  const okRight = Math.min(100, toPercent(range.okHi));
  const thumbPos = hasVal ? Math.max(0, Math.min(100, toPercent(numVal))) : 50;

  const handleSlider = (e) => { const raw = parseFloat(e.target.value); onChange({ target: { value: String(Math.round(raw * 10) / 10) } }); };
  const enterManual = () => { setManualVal(hasVal ? String(numVal) : ''); setManualMode(true); };
  const exitManual = () => { if (manualVal.trim()) { const p = parseFloat(manualVal); if (!isNaN(p)) onChange({ target: { value: String(p) } }); } setManualMode(false); };
  const thumbColor = !hasVal ? DS.color.graphiteMuted : isWarning ? DS.color.danger : DS.color.ok;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', minWidth: 0 }}>
      <div style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 700, color: DS.color.graphiteMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div onClick={enterManual} style={{ padding: '6px 12px', borderRadius: DS.radius, cursor: 'pointer', backgroundColor: isWarning ? DS.color.dangerBg : hasVal ? `${accentColor}10` : 'transparent', border: `2px solid ${isWarning ? DS.color.danger : hasVal ? accentColor : DS.color.borderLight}`, transition: 'all 200ms ease', minWidth: '72px', textAlign: 'center' }}>
        {manualMode ? (
          <input type="number" step="0.1" value={manualVal} onChange={e => setManualVal(e.target.value)} onBlur={exitManual} onKeyDown={e => e.key === 'Enter' && exitManual()} autoFocus
            style={{ width: '60px', border: 'none', outline: 'none', textAlign: 'center', fontFamily: DS.font, fontSize: '20px', fontWeight: 700, color: DS.color.graphite, backgroundColor: 'transparent', WebkitAppearance: 'none', MozAppearance: 'textfield' }} />
        ) : (
          <span style={{ fontFamily: DS.font, fontSize: '20px', fontWeight: 700, color: isWarning ? DS.color.danger : hasVal ? DS.color.graphite : DS.color.graphiteMuted }}>
            {hasVal ? numVal.toFixed(1) : '—'}
            {hasVal && <span style={{ fontSize: '11px', fontWeight: 600, color: DS.color.graphiteMuted, marginLeft: '1px' }}>°C</span>}
          </span>
        )}
      </div>
      <div style={{ width: '100%', position: 'relative', height: '32px', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: '8px', top: '50%', transform: 'translateY(-50%)', backgroundColor: DS.color.borderLight, borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${okLeft}%`, width: `${okRight - okLeft}%`, backgroundColor: 'rgba(27,138,80,0.25)', borderRadius: '4px' }} />
          {hasVal && <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${thumbPos}%`, backgroundColor: `${thumbColor}40`, borderRadius: '4px 0 0 4px' }} />}
        </div>
        <input type="range" min={sliderMin} max={sliderMax} step={0.1} value={hasVal ? numVal : (sliderMin + sliderMax) / 2} onChange={handleSlider} className={sliderId}
          style={{ width: '100%', height: '32px', position: 'relative', zIndex: 2, WebkitAppearance: 'none', appearance: 'none', background: 'transparent', cursor: 'pointer' }} />
        <style>{`.${sliderId}::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:${thumbColor};border:3px solid white;box-shadow:0 1px 6px rgba(0,0,0,0.3);cursor:pointer}.${sliderId}::-moz-range-thumb{width:26px;height:26px;border-radius:50%;background:${thumbColor};border:3px solid white;box-shadow:0 1px 6px rgba(0,0,0,0.3);cursor:pointer}.${sliderId}::-webkit-slider-runnable-track{height:8px;background:transparent}.${sliderId}::-moz-range-track{height:8px;background:transparent}`}</style>
      </div>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 2px' }}>
        <span style={{ fontFamily: DS.font, fontSize: '9px', color: DS.color.graphiteMuted }}>{sliderMin}°</span>
        <span style={{ fontFamily: DS.font, fontSize: '9px', color: DS.color.graphiteMuted }}>{sliderMax}°</span>
      </div>
      {isWarning && hasVal && <div style={{ display: 'flex', alignItems: 'center', gap: '3px', animation: 'warnPulse 2s infinite' }}><AlertTriangle style={{ width: 10, height: 10, color: DS.color.danger }} /><span style={{ fontFamily: DS.font, fontSize: '9px', fontWeight: 700, color: DS.color.danger, textTransform: 'uppercase' }}>Извън норма!</span></div>}
      {!isWarning && hasVal && <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><CheckCircle style={{ width: 10, height: 10, color: DS.color.ok }} /><span style={{ fontFamily: DS.font, fontSize: '9px', fontWeight: 600, color: DS.color.ok, textTransform: 'uppercase' }}>В норма</span></div>}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   VITRINA CARD — карта за всяка витрина (hot/cold тема)
   ═══════════════════════════════════════════════════════════════ */
const VitrinaCard = ({
  vitrina, blockId, timeSlots, getReading, updateReading, getTemperatureStatus,
  onUpdate, onRemove, isMobile, index, isEditing, onToggleEdit
}) => {
  const [hovered, setHovered] = useState(false);
  const isHot = vitrina.type === 'hot';
  const theme = isHot
    ? { bg: DS.color.hot, accent: DS.color.hotAccent, text: DS.color.hotText, glow: DS.color.hotGlow, Icon: Flame, typeLabel: 'Топла витрина' }
    : { bg: DS.color.cold, accent: DS.color.coldAccent, text: DS.color.coldText, glow: DS.color.coldGlow, Icon: Thermometer, typeLabel: 'Студена витрина' };

  const hasAnyWarning = timeSlots.some(ts => getTemperatureStatus(getReading(blockId, `${vitrina.id}_${ts}`), vitrina.temp) === 'warning');

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      backgroundColor: DS.color.surface, borderRadius: DS.radius,
      border: `1.5px solid ${hasAnyWarning ? DS.color.danger : hovered ? theme.accent : DS.color.borderLight}`,
      boxShadow: hovered ? DS.shadow.lg : DS.shadow.sm,
      overflow: 'hidden', transition: 'all 200ms ease',
      animation: 'ctrlFadeIn 300ms ease-out both', animationDelay: `${index * 60}ms`,
    }}>
      {/* Header */}
      <div style={{ padding: isMobile ? '12px 14px' : '14px 18px', backgroundColor: theme.bg, borderBottom: `1px solid ${DS.color.borderLight}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            <div style={{ width: 42, height: 42, borderRadius: DS.radius, backgroundColor: DS.color.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${theme.accent}`, flexShrink: 0 }}>
              <theme.Icon style={{ width: 20, height: 20, color: theme.accent }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {isEditing ? (
                <input type="text" value={vitrina.name} onChange={e => onUpdate(vitrina.id, 'name', e.target.value)}
                  style={{ fontFamily: DS.font, fontSize: '16px', fontWeight: 700, color: theme.text, border: `1px solid ${theme.accent}`, backgroundColor: DS.color.surface, borderRadius: DS.radius, padding: '4px 8px', width: '100%', outline: 'none' }} />
              ) : (
                <div style={{ fontFamily: DS.font, fontSize: '16px', fontWeight: 700, color: theme.text }}>{vitrina.name}</div>
              )}
              <div style={{ fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteMuted, marginTop: '2px' }}>{theme.typeLabel}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <div style={{ padding: '5px 12px', backgroundColor: DS.color.surface, border: `2px solid ${theme.accent}`, borderRadius: DS.radius, fontFamily: DS.font, fontSize: '12px', fontWeight: 700, color: theme.text }}>
              {isEditing ? (
                <input type="text" value={vitrina.temp} onChange={e => onUpdate(vitrina.id, 'temp', e.target.value)}
                  style={{ fontFamily: DS.font, fontSize: '12px', fontWeight: 700, color: theme.text, border: 'none', backgroundColor: 'transparent', outline: 'none', width: '70px', textAlign: 'center', padding: 0 }} />
              ) : <>Диапазон: {vitrina.temp}</>}
            </div>
            <button onClick={() => onToggleEdit(vitrina.id)} title={isEditing ? 'Готово' : 'Редактирай'}
              style={{ background: isEditing ? theme.accent : 'transparent', border: `1.5px solid ${theme.accent}`, cursor: 'pointer', padding: '6px', color: isEditing ? 'white' : theme.accent, borderRadius: DS.radius, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 32, minHeight: 32, transition: 'all 150ms ease' }}>
              <Settings style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
        {/* Edit panel */}
        {isEditing && (
          <div style={{ marginTop: '12px', padding: '12px', backgroundColor: DS.color.surface, border: `1px solid ${DS.color.borderLight}`, borderRadius: DS.radius, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '120px' }}>
                <label style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 600, color: DS.color.graphiteLight, textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>Тип</label>
                <select value={vitrina.type} onChange={e => { const t = e.target.value; onUpdate(vitrina.id, '_batch', { type: t, temp: t === 'hot' ? '≥ 63°C' : '0°C÷4°C' }); }}
                  style={{ width: '100%', padding: '8px', borderRadius: DS.radius, border: `1.5px solid ${DS.color.borderLight}`, fontFamily: DS.font, fontSize: '13px', backgroundColor: DS.color.surfaceAlt, outline: 'none', cursor: 'pointer' }}>
                  <option value="hot">Топла витрина (≥ 63°C)</option>
                  <option value="cold">Студена витрина (0-4°C)</option>
                </select>
              </div>
              <div style={{ flex: 2, minWidth: '160px' }}>
                <label style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 600, color: DS.color.graphiteLight, textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>Продукт (по избор)</label>
                <input type="text" value={vitrina.unit || ''} onChange={e => onUpdate(vitrina.id, 'unit', e.target.value)}
                  placeholder="Напр. Пица, Дюнер, Чикън..." style={{ ...inputBase(false), padding: '8px 10px', fontSize: '13px' }} />
              </div>
            </div>
            <button onClick={() => onRemove(vitrina.id)}
              style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: DS.color.dangerBg, border: `1px solid ${DS.color.danger}`, borderRadius: DS.radius, color: DS.color.danger, cursor: 'pointer', fontFamily: DS.font, fontSize: '12px', fontWeight: 600 }}>
              <Trash2 style={{ width: 12, height: 12 }} />Премахни витрина
            </button>
          </div>
        )}
        {!isEditing && vitrina.unit && (
          <div style={{ marginTop: '8px', fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteMuted, fontStyle: 'italic' }}>{vitrina.unit}</div>
        )}
      </div>
      {/* Temperature readings */}
      <div style={{ padding: isMobile ? '16px 12px' : '20px 18px', display: 'flex', gap: isMobile ? '8px' : '16px', justifyContent: 'center' }}>
        {timeSlots.map(ts => {
          const reading = getReading(blockId, `${vitrina.id}_${ts}`);
          const isWarn = getTemperatureStatus(reading, vitrina.temp) === 'warning';
          return (
            <TempSlider key={ts} label={ts.replace('h', ':00')} value={reading}
              onChange={e => updateReading(blockId, `${vitrina.id}_${ts}`, e.target.value)}
              isWarning={isWarn} accentColor={theme.accent} glowColor={theme.glow}
              targetTemp={vitrina.temp} isMobile={isMobile} />
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const RefrigeratorTemperatureControl = ({ template = {}, config = {}, department = {}, restaurantId, onBack }) => {
  const { isMobile, isTablet } = useResponsive();

  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(new Date());
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [hasDraft, setHasDraft] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState('');
  const [editingIds, setEditingIds] = useState(new Set());

  /* Default vitrinas — потребителят ги конфигурира per ресторант */
  const [vitrinas, setVitrinas] = useState([
    { id: 'hot_pizza', name: 'Топла витрина', temp: '≥ 63°C', unit: 'Пица', type: 'hot' },
    { id: 'cold_pizza', name: 'Студена витрина', temp: '0°C÷4°C', unit: 'Пица', type: 'cold' },
    { id: 'cold_doner', name: 'Студена витрина', temp: '0°C÷4°C', unit: 'Дюнер', type: 'cold' },
    { id: 'hot_chicken', name: 'Топла витрина', temp: '≥ 63°C', unit: 'Чикън', type: 'hot' },
  ]);

  const currentDate = new Date().toISOString().split('T')[0];
  const [dateBlocks, setDateBlocks] = useState([{ id: 1, date: currentDate, readings: {} }]);
  const [savedInspectors, setSavedInspectors] = useState([]);
  const timeSlots = ['8h', '19h'];

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const flash = (msg) => { setAutoSaveStatus(msg); setTimeout(() => setAutoSaveStatus(''), 3000); };

  /* ─── Offline sync ─── */
  const PENDING_KEY = `pending_submissions_${template.id}`;
  const getPending = () => { try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); } catch { return []; } };
  const savePendingQ = (q) => { localStorage.setItem(PENDING_KEY, JSON.stringify(q)); setPendingCount(q.length); };
  const addToPending = (sub) => { const q = getPending(); q.push({ ...sub, savedAt: Date.now() }); savePendingQ(q); };
  const syncPending = async () => {
    const queue = getPending(); if (!queue.length) return;
    setSyncStatus('syncing'); const failed = [];
    for (const item of queue) { try { const { savedAt, ...d } = item; const { error } = await supabase.from('checklist_submissions').insert(d); if (error) throw error; } catch { failed.push(item); } }
    savePendingQ(failed);
    if (!failed.length) { setSyncStatus('synced'); flash(`✓ ${queue.length} синхронизирани`); }
    else { setSyncStatus('error'); flash(`⚠ ${failed.length} не са синхронизирани`); }
    setTimeout(() => setSyncStatus(''), 4000);
  };
  useEffect(() => {
    const goOn = () => { setIsOnline(true); syncPending(); }; const goOff = () => setIsOnline(false);
    window.addEventListener('online', goOn); window.addEventListener('offline', goOff);
    setPendingCount(getPending().length);
    if (navigator.onLine && getPending().length > 0) syncPending();
    return () => { window.removeEventListener('online', goOn); window.removeEventListener('offline', goOff); };
  }, []);

  const hasAnyData = () => dateBlocks.some(b => b.date || Object.keys(b.readings).some(k => b.readings[k]));

  /* ─── Config: vitrinas + savedInspectors per restaurant ─── */
  const loadSavedConfig = async () => {
    try {
      const c = localStorage.getItem(`config_${template.id}_${restaurantId}`);
      if (c) { const d = JSON.parse(c); if (d.vitrinas?.length) setVitrinas(d.vitrinas); if (d.savedInspectors?.length) setSavedInspectors(d.savedInspectors); return; }
    } catch {}
    try {
      const { data } = await supabase.from('checklist_submissions').select('data').eq('template_id', template.id).eq('restaurant_id', restaurantId).order('created_at', { ascending: false }).limit(1).single();
      if (data?.data?.vitrinas?.length) {
        setVitrinas(data.data.vitrinas);
        if (data.data.savedInspectors?.length) setSavedInspectors(data.data.savedInspectors);
        localStorage.setItem(`config_${template.id}_${restaurantId}`, JSON.stringify({ vitrinas: data.data.vitrinas, savedInspectors: data.data.savedInspectors || [] }));
      }
    } catch {}
  };

  const saveConfigLocally = () => {
    localStorage.setItem(`config_${template.id}_${restaurantId}`, JSON.stringify({ vitrinas, savedInspectors }));
  };

  /* ─── Draft ─── */
  useEffect(() => {
    const key = `draft_${template.id}_${currentDate}`; const saved = localStorage.getItem(key);
    if (saved) {
      try { const d = JSON.parse(saved); if (d.vitrinas?.length) setVitrinas(d.vitrinas); setDateBlocks(d.dateBlocks || [{ id: 1, date: currentDate, readings: {} }]); setSavedInspectors(d.savedInspectors || []); setHasDraft(true); }
      catch { localStorage.removeItem(key); }
    } else loadSavedConfig();
  }, [template.id, currentDate]);

  useEffect(() => { const i = setInterval(() => { if (hasAnyData()) saveDraft(); }, 30000); return () => clearInterval(i); }, [vitrinas, dateBlocks, savedInspectors]);

  const saveDraft = () => {
    if (!hasAnyData()) return;
    localStorage.setItem(`draft_${template.id}_${currentDate}`, JSON.stringify({ vitrinas, dateBlocks, savedInspectors, timestamp: Date.now() }));
    setHasDraft(true); flash('✓ Автоматично запазено');
  };

  const clearDraft = () => {
    if (window.confirm('Изчистване на отчитанията?')) {
      setDateBlocks([{ id: Date.now(), date: currentDate, readings: {} }]);
      localStorage.removeItem(`draft_${template.id}_${currentDate}`);
      setHasDraft(false); flash('Нов чек лист');
    }
  };

  const handleBackClick = () => { hasAnyData() ? setShowExitConfirm(true) : onBack?.(); };
  const confirmExit = (save) => { if (save) saveDraft(); setShowExitConfirm(false); onBack?.(); };

  /* ─── Vitrina CRUD ─── */
  const addVitrina = () => {
    const newId = Date.now().toString();
    setVitrinas([...vitrinas, { id: newId, name: `Витрина ${vitrinas.length + 1}`, temp: '≥ 63°C', unit: '', type: 'hot' }]);
    setEditingIds(prev => new Set([...prev, newId]));
  };

  const removeVitrina = (id) => {
    if (vitrinas.length <= 1) { alert('Трябва да имате поне 1 витрина.'); return; }
    if (!window.confirm('Сигурни ли сте, че искате да премахнете тази витрина?')) return;
    setVitrinas(vitrinas.filter(v => v.id !== id));
    setDateBlocks(dateBlocks.map(b => { const nr = { ...b.readings }; timeSlots.forEach(t => delete nr[`${id}_${t}`]); return { ...b, readings: nr }; }));
    setEditingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  const updateVitrina = (id, f, v) => {
    if (f === '_batch') setVitrinas(vitrinas.map(vt => vt.id === id ? { ...vt, ...v } : vt));
    else setVitrinas(vitrinas.map(vt => vt.id === id ? { ...vt, [f]: v } : vt));
  };

  const toggleEdit = (id) => {
    setEditingIds(prev => {
      const s = new Set(prev);
      if (s.has(id)) { s.delete(id); setTimeout(() => saveConfigLocally(), 0); } else s.add(id);
      return s;
    });
  };

  /* ─── DateBlock CRUD ─── */
  const addDateBlock = () => setDateBlocks([...dateBlocks, { id: Date.now(), date: '', readings: {} }]);
  const removeDateBlock = (id) => { if (dateBlocks.length > 1) setDateBlocks(dateBlocks.filter(b => b.id !== id)); };
  const updateReading = (bId, key, val) => {
    setDateBlocks(dateBlocks.map(b => b.id === bId ? { ...b, readings: { ...b.readings, [key]: val } } : b));
    if (key === 'inspector_name' && val.trim() && !savedInspectors.includes(val.trim())) setSavedInspectors([...savedInspectors, val.trim()]);
  };
  const getReading = (bId, key) => { const b = dateBlocks.find(bl => bl.id === bId); return b?.readings[key] || ''; };

  const getTemperatureStatus = (temp, targetTemp) => {
    if (!temp || !targetTemp) return 'normal';
    const v = parseFloat(temp); if (isNaN(v)) return 'normal';
    const t = targetTemp.trim();
    if (t.includes('≤') || t.toLowerCase().includes('до')) { const n = t.match(/-?\d+\.?\d*/); if (n) return v <= parseFloat(n[0]) ? 'normal' : 'warning'; }
    if (t.includes('≥') || t.toLowerCase().includes('над')) { const n = t.match(/-?\d+\.?\d*/); if (n) return v >= parseFloat(n[0]) ? 'normal' : 'warning'; }
    const norm = t.replace(/°C/g, '').replace(/\s/g, '');
    const rm = norm.match(/^(-?\d+\.?\d*)[-÷~](\d+\.?\d*)$/);
    if (rm) { const lo = parseFloat(rm[1]), hi = parseFloat(rm[2]); return (v >= Math.min(lo, hi) && v <= Math.max(lo, hi)) ? 'normal' : 'warning'; }
    return 'normal';
  };

  /* ─── Submit ─── */
  const handleSubmit = async () => {
    if (!hasAnyData()) { alert('Моля попълнете поне едно поле.'); return; }
    setLoading(true);
    const sub = {
      template_id: template.id, restaurant_id: restaurantId, department_id: department.id,
      data: { vitrinas, dateBlocks, savedInspectors },
      submission_date: dateBlocks[0]?.date || currentDate, synced: true,
    };
    try { const { data: u } = await supabase.auth.getUser(); if (u?.user?.id) sub.submitted_by = u.user.id; } catch {}
    const resetForm = () => { setDateBlocks([{ id: Date.now(), date: currentDate, readings: {} }]); localStorage.removeItem(`draft_${template.id}_${currentDate}`); setHasDraft(false); setEditingIds(new Set()); saveConfigLocally(); };
    if (!navigator.onLine) { addToPending(sub); resetForm(); flash('📱 Запазено офлайн'); setLoading(false); return; }
    try { const { error } = await supabase.from('checklist_submissions').insert(sub); if (error) throw error; resetForm(); flash('✓ Чек листът е запазен'); if (getPending().length > 0) syncPending(); }
    catch (err) { console.error(err); addToPending(sub); resetForm(); flash('⚠ Грешка — запазено офлайн'); }
    finally { setLoading(false); }
  };

  const pad = isMobile ? '12px' : '24px';

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ minHeight: '100vh', backgroundColor: DS.color.bg, fontFamily: DS.font, color: DS.color.graphite, display: 'flex', flexDirection: 'column' }}>

        {/* EXIT MODAL */}
        {showExitConfirm && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(30,42,38,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
            <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, padding: isMobile ? '24px 20px' : '32px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}><AlertCircle style={{ color: DS.color.warning, width: 20, height: 20 }} /><h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Имате незапазени данни</h3></div>
              <p style={{ marginBottom: '20px', color: DS.color.graphiteMed, fontSize: '14px' }}>Какво искате да направите?</p>
              <div style={{ display: 'flex', gap: '8px', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'flex-end' }}>
                {[{ label: 'Отказ', bg: DS.color.pendingBg, color: DS.color.graphiteMed, action: () => setShowExitConfirm(false) }, { label: 'Изход без запазване', bg: DS.color.danger, color: 'white', action: () => confirmExit(false) }, { label: 'Запази и излез', bg: DS.color.primary, color: 'white', action: () => confirmExit(true) }].map((b, i) =>
                  <button key={i} onClick={b.action} style={{ padding: '12px 16px', backgroundColor: b.bg, color: b.color, border: 'none', borderRadius: DS.radius, cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: DS.font, width: isMobile ? '100%' : 'auto' }}>{b.label}</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TOP BAR */}
        <div style={{ backgroundColor: DS.color.graphite, padding: isMobile ? '8px 12px' : '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.15)', gap: '8px' }}>
          <button onClick={handleBackClick} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: isMobile ? '8px 10px' : '6px 14px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: DS.radius, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: DS.font, fontSize: '12px', fontWeight: 600, minHeight: '36px' }}>
            <ChevronLeft style={{ width: 14, height: 14 }} />{!isMobile && 'Назад'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: isOnline ? 'rgba(27,138,80,0.15)' : 'rgba(197,48,48,0.2)', padding: '4px 10px', borderRadius: DS.radius }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isOnline ? '#1B8A50' : DS.color.danger, display: 'inline-block', boxShadow: isOnline ? '0 0 6px rgba(27,138,80,0.5)' : '0 0 6px rgba(197,48,48,0.5)' }} />
              {!isMobile && <span style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>{isOnline ? 'Онлайн' : 'Офлайн'}</span>}
              {pendingCount > 0 && <span style={{ backgroundColor: DS.color.warning, color: 'white', fontFamily: DS.font, fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '10px' }}>{pendingCount}</span>}
            </div>
            {autoSaveStatus && <span style={{ fontFamily: DS.font, fontSize: '11px', color: syncStatus === 'error' ? 'rgba(255,200,200,0.9)' : DS.color.ok, display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}><CheckCircle style={{ width: 12, height: 12 }} />{isMobile ? '✓' : autoSaveStatus}</span>}
            {hasDraft && !isMobile && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: DS.radius }}><FileText style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.5)' }} /><span style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Драфт</span></div>}
            <span style={{ fontFamily: DS.font, fontSize: isMobile ? '11px' : '12px', fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>
              {now.toLocaleString('bg-BG', { hour: '2-digit', minute: '2-digit', ...(isMobile ? {} : { second: '2-digit' }), day: '2-digit', month: '2-digit', ...(isMobile ? {} : { year: 'numeric' }), hour12: false })}
            </span>
          </div>
        </div>

        {/* MAIN */}
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: pad, flex: 1, width: '100%' }}>

          {/* Title + Actions */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '20px', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img src={LOGO_URL} alt="Aladin Foods" style={{ height: isMobile ? '36px' : '48px', width: 'auto', objectFit: 'contain' }} />
              <div>
                <h1 style={{ fontSize: isMobile ? '15px' : '22px', fontWeight: 700, color: DS.color.primary, margin: 0, textTransform: 'uppercase', fontFamily: DS.font }}>КОНТРОЛ НА ТЕМПЕРАТУРАТА</h1>
                <p style={{ fontFamily: DS.font, fontSize: isMobile ? '10px' : '12px', color: DS.color.graphiteLight, margin: '2px 0 0' }}>ХЛАДИЛНИ ВИТРИНИ — 8:00 и 19:00</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={addVitrina} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: DS.color.primary, border: 'none', borderRadius: DS.radius, color: 'white', cursor: 'pointer', fontFamily: DS.font, fontSize: '12px', fontWeight: 600, minHeight: '40px', boxShadow: DS.shadow.glow }}>
                <Plus style={{ width: 14, height: 14 }} />Витрина
              </button>
              <button onClick={addDateBlock} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: DS.color.primary, border: 'none', borderRadius: DS.radius, color: 'white', cursor: 'pointer', fontFamily: DS.font, fontSize: '12px', fontWeight: 600, minHeight: '40px', boxShadow: DS.shadow.glow }}>
                <Calendar style={{ width: 14, height: 14 }} />Дата
              </button>
              {hasDraft && (
                <button onClick={clearDraft} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', backgroundColor: 'transparent', border: `1.5px solid ${DS.color.danger}`, borderRadius: DS.radius, color: DS.color.danger, cursor: 'pointer', fontFamily: DS.font, fontSize: '12px', fontWeight: 600, minHeight: '40px' }}>
                  <RotateCcw style={{ width: 14, height: 14 }} />{isMobile ? 'Нов' : 'Нов чек лист'}
                </button>
              )}
              {editingIds.size > 0 && (
                <button onClick={() => { saveConfigLocally(); setEditingIds(new Set()); flash('✓ Конфигурацията е запазена'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: '#2563EB', border: 'none', borderRadius: DS.radius, color: 'white', cursor: 'pointer', fontFamily: DS.font, fontSize: '12px', fontWeight: 600, minHeight: '40px', boxShadow: '0 0 12px rgba(37,99,235,0.2)' }}>
                  <Save style={{ width: 14, height: 14 }} />{isMobile ? 'Запази' : 'Запази конфигурацията'}
                </button>
              )}
            </div>
          </div>

          {/* DATE BLOCKS */}
          {dateBlocks.map((block, bi) => (
            <div key={block.id} style={{ marginBottom: '32px', animation: 'ctrlFadeIn 300ms ease-out both', animationDelay: `${bi * 100}ms` }}>
              {/* Date bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 18px', marginBottom: '16px', backgroundColor: DS.color.graphite, borderRadius: DS.radius }}>
                <Calendar style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
                <input type="date" value={block.date} onChange={e => setDateBlocks(dateBlocks.map(b => b.id === block.id ? { ...b, date: e.target.value } : b))}
                  style={{ padding: '8px 12px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: DS.radius, fontFamily: DS.font, fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.08)', color: 'white', outline: 'none', colorScheme: 'dark' }} />
                <span style={{ fontFamily: DS.font, fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', flex: 1 }}>
                  {block.date ? new Date(block.date + 'T00:00').toLocaleDateString('bg-BG', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Изберете дата'}
                </span>
                {dateBlocks.length > 1 && (
                  <button onClick={() => removeDateBlock(block.id)} style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,200,200,0.9)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                    <Trash2 style={{ width: 16, height: 16 }} />
                  </button>
                )}
              </div>

              {/* Vitrina cards */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(340px, 1fr))', gap: isMobile ? '10px' : '14px', marginBottom: '16px' }}>
                {vitrinas.map((vit, i) => (
                  <VitrinaCard key={vit.id}
                    vitrina={vit} blockId={block.id} timeSlots={timeSlots} index={i}
                    getReading={getReading} updateReading={updateReading} getTemperatureStatus={getTemperatureStatus}
                    onUpdate={updateVitrina} onRemove={removeVitrina} isMobile={isMobile}
                    isEditing={editingIds.has(vit.id)} onToggleEdit={toggleEdit} />
                ))}
              </div>

              {/* КД + Проверил */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '14px' }}>
                <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, border: `1px solid ${DS.color.borderLight}`, overflow: 'hidden', boxShadow: DS.shadow.sm }}>
                  <div style={{ padding: '10px 16px', backgroundColor: DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Edit3 style={{ width: 14, height: 14, color: DS.color.primary }} />
                    <span style={{ fontFamily: DS.font, fontSize: '12px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase' }}>Коригиращи действия</span>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <textarea value={getReading(block.id, 'corrective_actions')} onChange={e => updateReading(block.id, 'corrective_actions', e.target.value)}
                      placeholder="Опишете коригиращи действия при отклонения..." rows={3}
                      style={{ ...inputBase(false), resize: 'vertical', lineHeight: 1.6, minHeight: '80px' }}
                      onFocus={e => { e.target.style.borderColor = DS.color.primary; e.target.style.boxShadow = `0 0 0 3px ${DS.color.primaryGlow}`; }}
                      onBlur={e => { e.target.style.borderColor = DS.color.borderLight; e.target.style.boxShadow = 'none'; }} />
                  </div>
                </div>
                <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, border: `1px solid ${DS.color.borderLight}`, overflow: 'hidden', boxShadow: DS.shadow.sm }}>
                  <div style={{ padding: '10px 16px', backgroundColor: DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User style={{ width: 14, height: 14, color: DS.color.primary }} />
                    <span style={{ fontFamily: DS.font, fontSize: '12px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase' }}>Проверил</span>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <ControlInput label="Име" value={getReading(block.id, 'inspector_name')}
                      onChange={e => updateReading(block.id, 'inspector_name', e.target.value)}
                      placeholder="Име на проверяващ" list={`insp-${block.id}`} />
                    <datalist id={`insp-${block.id}`}>{savedInspectors.map((n, i) => <option key={i} value={n} />)}</datalist>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Submit */}
          <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, padding: pad, boxShadow: DS.shadow.md, border: `1px solid ${DS.color.borderLight}`, textAlign: 'center' }}>
            <button onClick={handleSubmit} disabled={loading} style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              padding: isMobile ? '14px 20px' : '16px 48px', width: isMobile ? '100%' : 'auto',
              backgroundColor: loading ? DS.color.graphiteMuted : DS.color.primary,
              border: 'none', borderRadius: DS.radius, color: 'white', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: DS.font, fontSize: isMobile ? '14px' : '16px', fontWeight: 600,
              boxShadow: loading ? 'none' : '0 4px 12px rgba(25,94,51,0.3)',
              animation: !loading && hasAnyData() ? 'ctrlBreathe 3s ease-in-out infinite' : 'none', minHeight: '48px',
            }}>
              <Save style={{ width: 20, height: 20 }} />
              {loading ? 'Запазване...' : (isMobile ? 'Запази' : 'Запази чек лист')}
            </button>
            <p style={{ marginTop: '8px', fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteMuted }}>
              Конфигурацията на витрините се запазва автоматично
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: isMobile ? '16px 12px' : '20px 24px', color: DS.color.graphiteMuted, fontFamily: DS.font, fontSize: '11px', fontWeight: 500, borderTop: `1px solid ${DS.color.borderLight}`, marginTop: 'auto' }}>
          © 2026 Aladin Foods | by MG
        </div>
      </div>
    </>
  );
};

export default RefrigeratorTemperatureControl;