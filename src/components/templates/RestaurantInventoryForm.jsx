import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Save, Plus, Trash2, Package, Calculator, Users, AlertCircle,
  ClipboardList, FileText, ChevronLeft, CheckCircle, RotateCcw, Calendar
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
  },
  font: "'DM Sans', system-ui, sans-serif",
  radius: '0px',
  shadow: {
    sm: '0 1px 3px rgba(30,42,38,0.06),0 1px 2px rgba(30,42,38,0.04)',
    md: '0 4px 12px rgba(30,42,38,0.06),0 1px 4px rgba(30,42,38,0.04)',
    glow: '0 0 20px rgba(27,94,55,0.15),0 4px 12px rgba(30,42,38,0.06)',
  },
};

const LOGO_URL = 'https://aladinfoods.bg/assets/images/aladinfoods_logo.png';

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  @keyframes ctrlFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ctrlBreathe { 0%,100%{box-shadow:${DS.shadow.glow}} 50%{box-shadow:0 0 24px rgba(27,94,55,0.25),0 4px 16px rgba(30,42,38,0.08)} }
  @media (max-width: 767px) { input, button, select, textarea { font-size: 16px !important; } }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${DS.color.sage}; border-radius: 0; }
  input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
`;

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE + INPUT HELPERS
   ═══════════════════════════════════════════════════════════════ */
const useResponsive = () => {
  const [screen, setScreen] = useState({ w: window.innerWidth });
  useEffect(() => {
    const onResize = () => setScreen({ w: window.innerWidth });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', () => setTimeout(onResize, 100));
    return () => { window.removeEventListener('resize', onResize); window.removeEventListener('orientationchange', onResize); };
  }, []);
  return { isMobile: screen.w < 768, isTablet: screen.w >= 768 && screen.w < 1024 };
};

const inputBase = (focused) => ({
  width: '100%', padding: '10px 12px',
  backgroundColor: focused ? DS.color.surface : DS.color.surfaceAlt,
  border: `1.5px solid ${focused ? DS.color.primary : DS.color.borderLight}`,
  borderRadius: DS.radius, fontSize: '14px', fontFamily: DS.font, fontWeight: 400,
  color: DS.color.graphite, outline: 'none', transition: 'all 150ms ease',
  boxShadow: focused ? `0 0 0 3px ${DS.color.primaryGlow}` : 'none',
  boxSizing: 'border-box', WebkitAppearance: 'none',
});

const ControlInput = ({ label, type = 'text', value, onChange, placeholder, style: s, ...rest }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ minWidth: 0, flex: 1 }}>
      {label && (
        <label style={{
          display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600,
          color: focused ? DS.color.primary : DS.color.graphiteLight,
          textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px',
        }}>{label}</label>
      )}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ ...inputBase(focused), ...s }} {...rest} />
    </div>
  );
};

const ControlSelect = ({ label, value, onChange, children, style: s }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ minWidth: 0, flex: 1 }}>
      {label && (
        <label style={{
          display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600,
          color: focused ? DS.color.primary : DS.color.graphiteLight,
          textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px',
        }}>{label}</label>
      )}
      <select value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ ...inputBase(focused), cursor: 'pointer', ...s }}>
        {children}
      </select>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const RestaurantInventoryForm = ({ template, config, department, restaurantId, onBack }) => {
  const { isMobile } = useResponsive();
  const pad = isMobile ? '12px' : '20px';

  // ─── STATE (1:1) ───
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('');
  const [now, setNow] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  const [inventoryItems, setInventoryItems] = useState(Array.from({ length: 8 }, (_, i) => ({
    id: i + 1, name: '', portion: '', price: '', employeeName: ''
  })));
  const [defectiveItems, setDefectiveItems] = useState(Array.from({ length: 8 }, (_, i) => ({
    id: i + 1, name: '', quantity: '', unit: 'брой', reason: '', brakedBy: ''
  })));

  const [protocolNumber, setProtocolNumber] = useState('БРАК');
  const [manager, setManager] = useState('');
  const [shift2, setShift2] = useState('');
  const [savedManagers, setSavedManagers] = useState([]);
  const [savedEmployees, setSavedEmployees] = useState([]);

  const [hasDraft, setHasDraft] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [syncStatus, setSyncStatus] = useState('');

  const currentDate = new Date().toISOString().split('T')[0];

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  // ─── Offline sync ───
  const PENDING_KEY = `pending_submissions_${template.id}`;
  const getPending = () => { try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); } catch { return []; } };
  const savePendingQ = (q) => { localStorage.setItem(PENDING_KEY, JSON.stringify(q)); setPendingCount(q.length); };

  const flushPending = async () => {
    const queue = getPending(); if (!queue.length) return;
    const remaining = [];
    for (const item of queue) {
      try { const { error } = await supabase.from('checklist_submissions').insert(item); if (error) remaining.push(item); } catch { remaining.push(item); }
    }
    savePendingQ(remaining);
    if (remaining.length < queue.length) { setSyncStatus('synced'); setAutoSaveStatus(`✓ Синхронизирани ${queue.length - remaining.length}`); setTimeout(() => setAutoSaveStatus(''), 4000); }
  };

  useEffect(() => {
    setPendingCount(getPending().length);
    const goOn = () => { setIsOnline(true); flushPending(); };
    const goOff = () => setIsOnline(false);
    window.addEventListener('online', goOn); window.addEventListener('offline', goOff);
    if (navigator.onLine) flushPending();
    return () => { window.removeEventListener('online', goOn); window.removeEventListener('offline', goOff); };
  }, []);

  // ─── DRAFT (1:1) ───
  const hasAnyData = () => {
    if (shift || manager || shift2 || protocolNumber !== 'БРАК') return true;
    return inventoryItems.some(i => i.name || i.portion || i.price || i.employeeName) || defectiveItems.some(i => i.name || i.quantity || i.reason || i.brakedBy);
  };

  const saveDraft = () => {
    if (!hasAnyData()) return;
    localStorage.setItem(`draft_${template.id}_${currentDate}`, JSON.stringify({ date, shift, inventoryItems, defectiveItems, protocolNumber, manager, shift2, savedManagers, savedEmployees, timestamp: new Date().toISOString() }));
    setHasDraft(true); setAutoSaveStatus('✓ Автоматично запазено'); setTimeout(() => setAutoSaveStatus(''), 2000);
  };

  const checkForDraft = () => {
    const saved = localStorage.getItem(`draft_${template.id}_${currentDate}`);
    if (saved) { try { const d = JSON.parse(saved); setDate(d.date || currentDate); setShift(d.shift || ''); setInventoryItems(d.inventoryItems || Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: '', portion: '', price: '', employeeName: '' }))); setDefectiveItems(d.defectiveItems || Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: '', quantity: '', unit: 'брой', reason: '', brakedBy: '' }))); setProtocolNumber(d.protocolNumber || 'БРАК'); setManager(d.manager || ''); setShift2(d.shift2 || ''); setSavedManagers(d.savedManagers || []); setSavedEmployees(d.savedEmployees || []); setHasDraft(true); } catch { localStorage.removeItem(`draft_${template.id}_${currentDate}`); } }
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]); setShift('');
    setInventoryItems(Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: '', portion: '', price: '', employeeName: '' })));
    setDefectiveItems(Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: '', quantity: '', unit: 'брой', reason: '', brakedBy: '' })));
    setProtocolNumber('БРАК'); setManager(''); setShift2('');
  };

  const clearDraft = () => { localStorage.removeItem(`draft_${template.id}_${currentDate}`); resetForm(); setHasDraft(false); setAutoSaveStatus('Нов чек лист'); setTimeout(() => setAutoSaveStatus(''), 2000); };
  const handleBackClick = () => { if (hasAnyData()) setShowExitConfirm(true); else if (onBack) onBack(); };
  const confirmExit = (save) => { if (save) saveDraft(); setShowExitConfirm(false); if (onBack) onBack(); };

  useEffect(() => { checkForDraft(); }, [template.id, currentDate]);
  useEffect(() => { const i = setInterval(() => { if (hasAnyData()) saveDraft(); }, 30000); return () => clearInterval(i); }, [date, shift, inventoryItems, defectiveItems, protocolNumber, manager, shift2, savedManagers, savedEmployees, template.id, currentDate]);

  // ─── HANDLERS (1:1) ───
  const addInventoryItem = () => setInventoryItems([...inventoryItems, { id: Date.now(), name: '', portion: '', price: '', employeeName: '' }]);
  const removeInventoryItem = (id) => { if (inventoryItems.length > 1) setInventoryItems(inventoryItems.filter(i => i.id !== id)); };
  const updateInventoryItem = (id, f, v) => setInventoryItems(inventoryItems.map(i => i.id === id ? { ...i, [f]: v } : i));

  const addDefectiveItem = () => setDefectiveItems([...defectiveItems, { id: Date.now(), name: '', quantity: '', unit: 'брой', reason: '', brakedBy: '' }]);
  const removeDefectiveItem = (id) => { if (defectiveItems.length > 1) setDefectiveItems(defectiveItems.filter(i => i.id !== id)); };
  const updateDefectiveItem = (id, f, v) => setDefectiveItems(defectiveItems.map(i => i.id === id ? { ...i, [f]: v } : i));

  const calculateTotalPrice = () => inventoryItems.reduce((t, i) => t + (parseFloat(i.price) || 0), 0).toFixed(2);

  const generateSummary = () => {
    const cMap = {}; inventoryItems.forEach(i => { if (i.name && i.portion) { const k = `${i.name}_${i.portion}`; if (!cMap[k]) cMap[k] = { name: i.name, portion: i.portion, count: 0 }; cMap[k].count++; } });
    const dMap = {}; defectiveItems.forEach(i => { if (i.name && i.quantity && i.unit) { const k = `${i.name}_${i.unit}`; if (!dMap[k]) dMap[k] = { name: i.name, unit: i.unit, totalQuantity: 0 }; dMap[k].totalQuantity += parseFloat(i.quantity) || 0; } });
    return { consumption: Object.values(cMap), defective: Object.values(dMap) };
  };

  // ─── SUBMIT (1:1 + offline) ───
  const handleSubmit = async () => {
    if (!hasAnyData()) { alert('Моля попълнете поне едно поле.'); return; }
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const sub = { template_id: template.id, restaurant_id: restaurantId, department_id: department.id, data: { date, shift, protocolNumber, manager, shift2, inventoryItems, defectiveItems, savedManagers, savedEmployees, totals: { inventory: calculateTotalPrice() }, summary: generateSummary() }, submitted_by: userData.user.id, submission_date: date, synced: true };
      if (!navigator.onLine) { const q = getPending(); q.push(sub); savePendingQ(q); setAutoSaveStatus('⏳ Запазено офлайн'); setTimeout(() => setAutoSaveStatus(''), 4000); localStorage.removeItem(`draft_${template.id}_${currentDate}`); setHasDraft(false); resetForm(); setLoading(false); return; }
      const { error } = await supabase.from('checklist_submissions').insert(sub);
      if (error) throw error;
      localStorage.removeItem(`draft_${template.id}_${currentDate}`); setHasDraft(false); resetForm();
      setAutoSaveStatus('✓ Запазено успешно'); setTimeout(() => setAutoSaveStatus(''), 3000);
      alert('Чек листът е запазен успешно!');
    } catch (err) {
      console.error('Submit error:', err);
      const q = getPending(); q.push({ template_id: template.id, restaurant_id: restaurantId, department_id: department?.id, data: { date, shift, protocolNumber, manager, shift2, inventoryItems, defectiveItems, totals: { inventory: calculateTotalPrice() }, summary: generateSummary() }, submission_date: date, synced: false }); savePendingQ(q);
      setAutoSaveStatus('⏳ Грешка — запазено локално'); setTimeout(() => setAutoSaveStatus(''), 4000);
    } finally { setLoading(false); }
  };

  const summary = generateSummary();

  // Pre-compute employee summaries
  const empFood = {}; inventoryItems.forEach(i => { if (i.employeeName?.trim() && i.name) { const n = i.employeeName.trim(); if (!empFood[n]) empFood[n] = { items: [], total: 0 }; empFood[n].items.push({ name: i.name, portion: i.portion, price: parseFloat(i.price) || 0 }); empFood[n].total += parseFloat(i.price) || 0; } });
  const empDefect = {}; defectiveItems.forEach(i => { if (i.brakedBy?.trim() && i.name) { const n = i.brakedBy.trim(); if (!empDefect[n]) empDefect[n] = { items: [] }; empDefect[n].items.push({ name: i.name, qty: parseFloat(i.quantity) || 0, unit: i.unit, reason: i.reason }); } });
  const hasEmpData = Object.keys(empFood).length > 0 || Object.keys(empDefect).length > 0;

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ minHeight: '100vh', backgroundColor: DS.color.bg, fontFamily: DS.font, color: DS.color.graphite, display: 'flex', flexDirection: 'column' }}>

        {/* ═══ EXIT MODAL ═══ */}
        {showExitConfirm && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(30,42,38,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
            <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, padding: isMobile ? '24px 20px' : '32px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <AlertCircle style={{ color: DS.color.warning, width: 20, height: 20 }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Имате незапазени данни</h3>
              </div>
              <p style={{ marginBottom: '20px', color: DS.color.graphiteMed, lineHeight: 1.6, fontSize: '14px' }}>Какво искате да направите?</p>
              <div style={{ display: 'flex', gap: '8px', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'flex-end' }}>
                {[
                  { label: 'Отказ', bg: DS.color.pendingBg, color: DS.color.graphiteMed, action: () => setShowExitConfirm(false) },
                  { label: 'Изход без запазване', bg: DS.color.danger, color: 'white', action: () => confirmExit(false) },
                  { label: 'Запази и излез', bg: DS.color.primary, color: 'white', action: () => confirmExit(true) },
                ].map((b, i) => (
                  <button key={i} onClick={b.action} style={{ padding: '12px 16px', backgroundColor: b.bg, color: b.color, border: 'none', borderRadius: DS.radius, cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: DS.font, width: isMobile ? '100%' : 'auto' }}>{b.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ TOP BAR ═══ */}
        <div style={{ backgroundColor: DS.color.graphite, padding: isMobile ? '8px 12px' : '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.15)', gap: '8px' }}>
          <button onClick={handleBackClick} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: isMobile ? '8px 10px' : '6px 14px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: DS.radius, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: DS.font, fontSize: '12px', fontWeight: 600, minHeight: '36px' }}>
            <ChevronLeft style={{ width: 14, height: 14 }} />{!isMobile && 'Назад'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: isOnline ? 'rgba(27,138,80,0.15)' : 'rgba(197,48,48,0.2)', padding: '4px 10px', borderRadius: DS.radius }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isOnline ? '#1B8A50' : DS.color.danger, display: 'inline-block', boxShadow: isOnline ? '0 0 6px rgba(27,138,80,0.5)' : '0 0 6px rgba(197,48,48,0.5)' }} />
              {!isMobile && <span style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 600, color: isOnline ? 'rgba(255,255,255,0.6)' : 'rgba(255,200,200,0.9)', textTransform: 'uppercase' }}>{isOnline ? 'Онлайн' : 'Офлайн'}</span>}
              {pendingCount > 0 && <span style={{ backgroundColor: DS.color.warning, color: 'white', fontFamily: DS.font, fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '10px', minWidth: '16px', textAlign: 'center' }}>{pendingCount}</span>}
            </div>
            {autoSaveStatus && <span style={{ fontFamily: DS.font, fontSize: '11px', color: syncStatus === 'error' ? 'rgba(255,200,200,0.9)' : DS.color.ok, display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}><CheckCircle style={{ width: 12, height: 12 }} />{isMobile ? '✓' : autoSaveStatus}</span>}
            {hasDraft && !isMobile && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: DS.radius }}><FileText style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.5)' }} /><span style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Драфт</span></div>}
            <span style={{ fontFamily: DS.font, fontSize: isMobile ? '11px' : '12px', fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>
              {now.toLocaleString('bg-BG', { hour: '2-digit', minute: '2-digit', ...(isMobile ? {} : { second: '2-digit' }), day: '2-digit', month: '2-digit', ...(isMobile ? {} : { year: 'numeric' }), hour12: false })}
            </span>
          </div>
        </div>

        {/* ═══ MAIN ═══ */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: pad, flex: 1, width: '100%' }}>

          {/* Header */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginBottom: isMobile ? '16px' : '24px', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '14px' }}>
              <img src={LOGO_URL} alt="Aladin Foods" style={{ height: isMobile ? '36px' : '48px', width: 'auto', objectFit: 'contain', flexShrink: 0 }} onError={e => { e.target.style.display = 'none'; }} />
              <div style={{ minWidth: 0 }}>
                <h1 style={{ fontSize: isMobile ? '14px' : '20px', fontWeight: 700, color: DS.color.primary, margin: 0, textTransform: 'uppercase', fontFamily: DS.font, lineHeight: 1.3 }}>{template.name}</h1>
                <p style={{ fontFamily: DS.font, fontSize: isMobile ? '10px' : '12px', color: DS.color.graphiteLight, fontWeight: 500, margin: '2px 0 0' }}>{template.description}</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, padding: pad, marginBottom: '16px', boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', alignItems: isMobile ? 'stretch' : 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ padding: '6px', borderRadius: DS.radius, backgroundColor: DS.color.okBg, flexShrink: 0 }}><Calendar style={{ width: 14, height: 14, color: DS.color.primary }} /></div>
              <ControlInput label="Дата" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <ControlInput label="Смяна" value={shift} onChange={e => setShift(e.target.value)} placeholder="..." />
            {hasDraft && (
              <button onClick={clearDraft} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: DS.color.pendingBg, color: DS.color.danger, border: `1px solid ${DS.color.borderLight}`, borderRadius: DS.radius, cursor: 'pointer', fontFamily: DS.font, fontSize: '12px', fontWeight: 600 }}>
                <RotateCcw style={{ width: 14, height: 14 }} /> Нов чек лист
              </button>
            )}
          </div>

          {/* ═══ ПЕРСОНАЛНА ХРАНА ═══ */}
          <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.md, overflow: 'hidden', marginBottom: '16px', animation: 'ctrlFadeIn 400ms ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '10px 14px' : '12px 18px', backgroundColor: DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package style={{ width: 18, height: 18, color: DS.color.primary }} />
                <span style={{ fontFamily: DS.font, fontSize: isMobile ? '12px' : '14px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Персонална храна</span>
              </div>
              <button onClick={addInventoryItem} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', backgroundColor: DS.color.surface, color: DS.color.primary, border: `1.5px solid ${DS.color.primary}`, borderRadius: DS.radius, cursor: 'pointer', fontFamily: DS.font, fontSize: '11px', fontWeight: 600 }}>
                <Plus style={{ width: 12, height: 12 }} /> Ред
              </button>
            </div>

            {!isMobile && (
              <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1.5fr 40px', gap: '8px', padding: '8px 18px', borderBottom: `1px solid ${DS.color.borderLight}` }}>
                {['Име на храната', 'Порция', 'Цена', 'Служител', ''].map((h, i) => (
                  <span key={i} style={{ fontFamily: DS.font, fontSize: '9px', fontWeight: 700, color: DS.color.graphiteMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                ))}
              </div>
            )}

            {inventoryItems.map((item, idx) => (
              <div key={item.id} style={{ padding: isMobile ? '12px 14px' : '8px 18px', borderBottom: `1px solid ${DS.color.borderLight}`, backgroundColor: idx % 2 === 0 ? DS.color.surface : DS.color.surfaceAlt, display: isMobile ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns: !isMobile ? '2.5fr 1fr 1fr 1.5fr 40px' : undefined, gap: isMobile ? '8px' : '8px', alignItems: !isMobile ? 'center' : undefined, animation: 'ctrlFadeIn 300ms ease both' }}>
                {isMobile && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 700, color: DS.color.graphiteMuted }}>#{idx + 1}</span>{inventoryItems.length > 1 && <button onClick={() => removeInventoryItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: DS.color.danger }}><Trash2 style={{ width: 14, height: 14 }} /></button>}</div>}
                <ControlInput label={isMobile ? 'Име на храната' : undefined} value={item.name} onChange={e => updateInventoryItem(item.id, 'name', e.target.value)} placeholder="Наименование" />
                <ControlInput label={isMobile ? 'Порция' : undefined} value={item.portion} onChange={e => updateInventoryItem(item.id, 'portion', e.target.value)} placeholder="гр./бр." />
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                  <ControlInput label={isMobile ? 'Цена' : undefined} type="number" step="0.01" value={item.price} onChange={e => updateInventoryItem(item.id, 'price', e.target.value)} placeholder="0.00" />
                  <span style={{ fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteMuted, fontWeight: 600, paddingBottom: '12px', flexShrink: 0 }}>лв</span>
                </div>
                <ControlInput label={isMobile ? 'Служител' : undefined} value={item.employeeName} onChange={e => updateInventoryItem(item.id, 'employeeName', e.target.value)} placeholder="Име и фамилия" />
                {!isMobile && <div style={{ textAlign: 'center' }}>{inventoryItems.length > 1 && <button onClick={() => removeInventoryItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: DS.color.danger, opacity: 0.5, transition: 'opacity 150ms' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.5}><Trash2 style={{ width: 14, height: 14 }} /></button>}</div>}
              </div>
            ))}

            <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', backgroundColor: DS.color.okBg, borderTop: `2px solid ${DS.color.borderLight}` }}>
              <Calculator style={{ width: 16, height: 16, color: DS.color.primary }} />
              <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 600, color: DS.color.graphiteMed }}>Общо:</span>
              <span style={{ fontFamily: DS.font, fontSize: '18px', fontWeight: 700, color: DS.color.primary }}>{calculateTotalPrice()} лв</span>
            </div>
          </div>

          {/* ═══ МЕНИДЖЪР / ПРОТОКОЛ / СМЯНА 2 ═══ */}
          <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, padding: pad, marginBottom: '16px', boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
            <ControlInput label="Мениджър" value={manager} onChange={e => setManager(e.target.value)} placeholder="Име на мениджър" />
            <ControlInput label="Номер протокол" value={protocolNumber} onChange={e => setProtocolNumber(e.target.value)} placeholder="Номер" />
            <ControlInput label="Смяна 2" value={shift2} onChange={e => setShift2(e.target.value)} placeholder="..." />
          </div>

          {/* ═══ БРАК ═══ */}
          <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.md, overflow: 'hidden', marginBottom: '16px', animation: 'ctrlFadeIn 400ms ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '10px 14px' : '12px 18px', backgroundColor: DS.color.dangerBg, borderBottom: `1px solid ${DS.color.borderLight}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle style={{ width: 18, height: 18, color: DS.color.danger }} />
                <span style={{ fontFamily: DS.font, fontSize: isMobile ? '12px' : '14px', fontWeight: 700, color: DS.color.danger, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Брак на материални запаси</span>
              </div>
              <button onClick={addDefectiveItem} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', backgroundColor: DS.color.surface, color: DS.color.danger, border: `1.5px solid ${DS.color.danger}`, borderRadius: DS.radius, cursor: 'pointer', fontFamily: DS.font, fontSize: '11px', fontWeight: 600 }}>
                <Plus style={{ width: 12, height: 12 }} /> Ред
              </button>
            </div>

            {!isMobile && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.8fr 1.5fr 1.2fr 40px', gap: '8px', padding: '8px 18px', borderBottom: `1px solid ${DS.color.borderLight}` }}>
                {['Артикул', 'Количество', 'Мярка', 'Причина', 'Бракувал', ''].map((h, i) => (
                  <span key={i} style={{ fontFamily: DS.font, fontSize: '9px', fontWeight: 700, color: DS.color.graphiteMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                ))}
              </div>
            )}

            {defectiveItems.map((item, idx) => (
              <div key={item.id} style={{ padding: isMobile ? '12px 14px' : '8px 18px', borderBottom: `1px solid ${DS.color.borderLight}`, backgroundColor: idx % 2 === 0 ? DS.color.surface : DS.color.surfaceAlt, display: isMobile ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns: !isMobile ? '2fr 1fr 0.8fr 1.5fr 1.2fr 40px' : undefined, gap: isMobile ? '8px' : '8px', alignItems: !isMobile ? 'center' : undefined, animation: 'ctrlFadeIn 300ms ease both' }}>
                {isMobile && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 700, color: DS.color.graphiteMuted }}>#{idx + 1}</span>{defectiveItems.length > 1 && <button onClick={() => removeDefectiveItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: DS.color.danger }}><Trash2 style={{ width: 14, height: 14 }} /></button>}</div>}
                <ControlInput label={isMobile ? 'Артикул' : undefined} value={item.name} onChange={e => updateDefectiveItem(item.id, 'name', e.target.value)} placeholder="Наименование" />
                <ControlInput label={isMobile ? 'Количество' : undefined} type="number" step="0.01" value={item.quantity} onChange={e => updateDefectiveItem(item.id, 'quantity', e.target.value)} placeholder="0.00" />
                <ControlSelect label={isMobile ? 'Мярка' : undefined} value={item.unit} onChange={e => updateDefectiveItem(item.id, 'unit', e.target.value)}>
                  <option value="брой">брой</option><option value="кг">кг</option><option value="л">л</option><option value="гр">гр</option><option value="мл">мл</option>
                </ControlSelect>
                <ControlInput label={isMobile ? 'Причина' : undefined} value={item.reason} onChange={e => updateDefectiveItem(item.id, 'reason', e.target.value)} placeholder="Причина за брак" />
                <ControlInput label={isMobile ? 'Бракувал' : undefined} value={item.brakedBy} onChange={e => updateDefectiveItem(item.id, 'brakedBy', e.target.value)} placeholder="Име и фамилия" />
                {!isMobile && <div style={{ textAlign: 'center' }}>{defectiveItems.length > 1 && <button onClick={() => removeDefectiveItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: DS.color.danger, opacity: 0.5, transition: 'opacity 150ms' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.5}><Trash2 style={{ width: 14, height: 14 }} /></button>}</div>}
              </div>
            ))}
          </div>

          {/* ═══ ОБОБЩЕНИЕ ═══ */}
          {(summary.consumption.length > 0 || summary.defective.length > 0) && (
            <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.sm, overflow: 'hidden', marginBottom: '16px', border: `1px solid ${DS.color.borderLight}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: isMobile ? '10px 14px' : '12px 18px', backgroundColor: DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}` }}>
                <ClipboardList style={{ width: 18, height: 18, color: DS.color.primary }} />
                <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase' }}>Обобщение</span>
              </div>
              <div style={{ padding: pad, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
                {summary.consumption.length > 0 && (
                  <div style={{ padding: '12px', backgroundColor: DS.color.okBg, borderLeft: `3px solid ${DS.color.primary}` }}>
                    <div style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', marginBottom: '8px' }}>Консумация</div>
                    {summary.consumption.map((c, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontFamily: DS.font, fontSize: '12px', borderBottom: i < summary.consumption.length - 1 ? `1px solid ${DS.color.borderLight}` : 'none' }}>
                        <span style={{ color: DS.color.graphiteMed }}>{c.name} ({c.portion})</span>
                        <span style={{ fontWeight: 700, color: DS.color.primary }}>{c.count} бр</span>
                      </div>
                    ))}
                  </div>
                )}
                {summary.defective.length > 0 && (
                  <div style={{ padding: '12px', backgroundColor: DS.color.dangerBg, borderLeft: `3px solid ${DS.color.danger}` }}>
                    <div style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 700, color: DS.color.danger, textTransform: 'uppercase', marginBottom: '8px' }}>Брак</div>
                    {summary.defective.map((d, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontFamily: DS.font, fontSize: '12px', borderBottom: i < summary.defective.length - 1 ? `1px solid ${DS.color.borderLight}` : 'none' }}>
                        <span style={{ color: DS.color.graphiteMed }}>{d.name}</span>
                        <span style={{ fontWeight: 700, color: DS.color.danger }}>{d.totalQuantity} {d.unit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ ПО СЛУЖИТЕЛИ ═══ */}
          <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.sm, overflow: 'hidden', marginBottom: '16px', border: `1px solid ${DS.color.borderLight}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: isMobile ? '10px 14px' : '12px 18px', backgroundColor: DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}` }}>
              <Users style={{ width: 18, height: 18, color: DS.color.primary }} />
              <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase' }}>По служители</span>
            </div>
            <div style={{ padding: pad, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
              {Object.keys(empFood).length > 0 && (
                <div style={{ padding: '12px', backgroundColor: DS.color.okBg, borderLeft: `3px solid ${DS.color.primary}` }}>
                  <div style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Package style={{ width: 12, height: 12 }} /> Храна</div>
                  {Object.entries(empFood).map(([n, d], idx) => (
                    <div key={idx} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: idx < Object.keys(empFood).length - 1 ? `1px solid ${DS.color.borderLight}` : 'none' }}>
                      <div style={{ fontFamily: DS.font, fontWeight: 700, color: DS.color.primary, fontSize: '12px', marginBottom: '3px' }}>{n}</div>
                      {d.items.map((f, fi) => (
                        <div key={fi} style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0 1px 8px', fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteLight }}>
                          <span>• {f.name}{f.portion && ` (${f.portion})`}</span>
                          <span style={{ fontWeight: 600 }}>{f.price.toFixed(2)} лв</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0 0 8px', fontFamily: DS.font, fontSize: '12px', fontWeight: 700, color: DS.color.primary, borderTop: `1px solid ${DS.color.borderLight}`, marginTop: '3px' }}>
                        <span>Общо:</span><span>{d.total.toFixed(2)} лв</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {Object.keys(empDefect).length > 0 && (
                <div style={{ padding: '12px', backgroundColor: DS.color.dangerBg, borderLeft: `3px solid ${DS.color.danger}` }}>
                  <div style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 700, color: DS.color.danger, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertCircle style={{ width: 12, height: 12 }} /> Брак</div>
                  {Object.entries(empDefect).map(([n, d], idx) => (
                    <div key={idx} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: idx < Object.keys(empDefect).length - 1 ? `1px solid ${DS.color.borderLight}` : 'none' }}>
                      <div style={{ fontFamily: DS.font, fontWeight: 700, color: DS.color.danger, fontSize: '12px', marginBottom: '3px' }}>{n}</div>
                      {d.items.map((x, xi) => (
                        <div key={xi} style={{ padding: '1px 0 1px 8px', fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteLight }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>• {x.name}</span><span style={{ fontWeight: 600 }}>{x.qty} {x.unit}</span></div>
                          {x.reason && <div style={{ paddingLeft: '10px', fontSize: '10px', fontStyle: 'italic', color: DS.color.graphiteMuted }}>Причина: {x.reason}</div>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {!hasEmpData && (
                <div style={{ gridColumn: '1 / -1', padding: '16px', textAlign: 'center', fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteMuted, fontStyle: 'italic' }}>
                  Няма данни. Попълнете имената на служителите.
                </div>
              )}
            </div>
          </div>

          {/* ═══ ИНСТРУКЦИИ ═══ */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, padding: '14px', boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, borderLeft: `3px solid ${DS.color.primary}` }}>
              <p style={{ margin: 0, fontFamily: DS.font, fontSize: '12px', lineHeight: 1.6, color: DS.color.graphiteMed }}>
                <strong style={{ color: DS.color.primary }}>Инвентаризация:</strong> Записвайте всички продукти с количество и цена. В секция „Брак" отбелязвайте дефектни артикули с причина.
              </p>
            </div>
            <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, padding: '14px', boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, borderLeft: `3px solid ${DS.color.warningBorder}` }}>
              <p style={{ margin: 0, fontFamily: DS.font, fontSize: '12px', lineHeight: 1.6, color: DS.color.graphiteMed }}>
                <strong style={{ color: DS.color.warningText }}>Auto-save:</strong> Работата се запазва на всеки 30 сек. При липса на интернет данните се синхронизират автоматично.
              </p>
            </div>
          </div>

          {/* ═══ SUBMIT ═══ */}
          <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
            <button onClick={handleSubmit} disabled={loading} style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              padding: isMobile ? '14px 32px' : '14px 48px', border: 'none', borderRadius: DS.radius,
              backgroundColor: loading ? DS.color.graphiteMuted : DS.color.primary,
              color: 'white', fontFamily: DS.font, fontSize: '15px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              animation: !loading && hasAnyData() ? 'ctrlBreathe 3s ease-in-out infinite' : 'none',
              minHeight: '48px', transition: 'all 200ms',
            }}>
              <Save style={{ width: 18, height: 18 }} />
              {loading ? 'Запазване...' : 'Запази чек лист'}
            </button>
          </div>
        </div>

        {/* ═══ FOOTER ═══ */}
        <div style={{ textAlign: 'center', padding: isMobile ? '16px 12px' : '20px 24px', color: DS.color.graphiteMuted, fontFamily: DS.font, fontSize: '11px', fontWeight: 500, borderTop: `1px solid ${DS.color.borderLight}`, marginTop: 'auto' }}>
          © 2026 Aladin Foods | by MG
        </div>
      </div>
    </>
  );
};

export default RestaurantInventoryForm;