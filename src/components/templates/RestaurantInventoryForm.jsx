import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const DS = {
  color: {
    bg: '#ECEEED', surface: '#FFFFFF', surfaceAlt: '#F7F9F8',
    primary: '#1B5E37', primaryLight: '#2D7A4F', primaryGlow: 'rgba(27,94,55,0.08)',
    cardHeader: '#E8F5EE',
    graphite: '#1E2A26', graphiteMed: '#3D4F48', graphiteLight: '#6B7D76', graphiteMuted: '#95A39D',
    sage: '#A8BFB2',
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
  @keyframes ctrlBreathe { 0%,100%{box-shadow:0 0 20px rgba(27,94,55,0.15)} 50%{box-shadow:0 0 24px rgba(27,94,55,0.25)} }
  @media (max-width: 767px) { input, button, select, textarea { font-size: 16px !important; } }
  input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
`;

const Ic = ({ n, sz = 16, c = 'currentColor' }) => {
  const paths = {
    back: <path d="M15 18l-6-6 6-6" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    save: <><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" fill="none" stroke={c} strokeWidth="2"/><polyline points="17 21 17 13 7 13 7 21" fill="none" stroke={c} strokeWidth="2"/><polyline points="7 3 7 8 15 8" fill="none" stroke={c} strokeWidth="2"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    trash: <><polyline points="3 6 5 6 21 6" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" fill="none" stroke={c} strokeWidth="2"/></>,
    package: <><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" fill="none" stroke={c} strokeWidth="2"/><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" fill="none" stroke={c} strokeWidth="2"/></>,
    calc: <><rect x="4" y="2" width="16" height="20" rx="2" fill="none" stroke={c} strokeWidth="2"/><line x1="8" y1="6" x2="16" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="10" x2="16" y2="10" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="14" x2="12" y2="14" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    users: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" fill="none" stroke={c} strokeWidth="2"/><circle cx="9" cy="7" r="4" fill="none" stroke={c} strokeWidth="2"/><path d="M23 21v-2a4 4 0 00-3-3.87" fill="none" stroke={c} strokeWidth="2"/><path d="M16 3.13a4 4 0 010 7.75" fill="none" stroke={c} strokeWidth="2"/></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="none" stroke={c} strokeWidth="2"/><line x1="12" y1="9" x2="12" y2="13" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    clipboard: <><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" fill="none" stroke={c} strokeWidth="2"/><rect x="8" y="2" width="8" height="4" rx="1" fill="none" stroke={c} strokeWidth="2"/></>,
    check: <><circle cx="12" cy="12" r="10" fill="none" stroke={c} strokeWidth="2"/><polyline points="9 12 11 14 15 10" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    reset: <><polyline points="1 4 1 10 7 10" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" fill="none" stroke={c} strokeWidth="2"/><line x1="16" y1="2" x2="16" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="2" x2="8" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="10" x2="21" y2="10" stroke={c} strokeWidth="2"/></>,
    file: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="none" stroke={c} strokeWidth="2"/><polyline points="14 2 14 8 20 8" fill="none" stroke={c} strokeWidth="2"/></>,
  };
  return <svg width={sz} height={sz} viewBox="0 0 24 24" style={{ flexShrink: 0, display: 'inline-block' }}>{paths[n]}</svg>;
};

const useResponsive = () => {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return { isMobile: w < 768 };
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
      {label && <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: focused ? DS.color.primary : DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ ...inputBase(focused), ...s }} {...rest} />
    </div>
  );
};

const ControlSelect = ({ label, value, onChange, children }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ minWidth: 0, flex: 1 }}>
      {label && <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: focused ? DS.color.primary : DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</label>}
      <select value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ ...inputBase(focused), cursor: 'pointer' }}>{children}</select>
    </div>
  );
};

const RestaurantInventoryForm = ({ template, config, department, restaurantId, onBack }) => {
  const { isMobile } = useResponsive();
  const pad = isMobile ? '12px' : '20px';

  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('');
  const [now, setNow] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [inventoryItems, setInventoryItems] = useState(Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: '', portion: '', price: '', employeeName: '' })));
  const [defectiveItems, setDefectiveItems] = useState(Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: '', quantity: '', unit: 'брой', reason: '', brakedBy: '' })));
  const [protocolNumber, setProtocolNumber] = useState('БРАК');
  const [manager, setManager] = useState('');
  const [shift2, setShift2] = useState('');
  const [savedManagers, setSavedManagers] = useState([]);
  const [savedEmployees, setSavedEmployees] = useState([]);
  const [hasDraft, setHasDraft] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');

  const currentDate = new Date().toISOString().split('T')[0];

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

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
  };

  useEffect(() => {
    setPendingCount(getPending().length);
    const goOn = () => { setIsOnline(true); flushPending(); };
    const goOff = () => setIsOnline(false);
    window.addEventListener('online', goOn); window.addEventListener('offline', goOff);
    if (navigator.onLine) flushPending();
    return () => { window.removeEventListener('online', goOn); window.removeEventListener('offline', goOff); };
  }, []);

  const hasAnyData = () => {
    if (shift || manager || shift2 || protocolNumber !== 'БРАК') return true;
    return inventoryItems.some(i => i.name || i.portion || i.price || i.employeeName) || defectiveItems.some(i => i.name || i.quantity || i.reason || i.brakedBy);
  };

  const saveDraft = () => {
    if (!hasAnyData()) return;
    localStorage.setItem(`draft_${template.id}_${currentDate}`, JSON.stringify({ date, shift, inventoryItems, defectiveItems, protocolNumber, manager, shift2, savedManagers, savedEmployees }));
    setHasDraft(true); setAutoSaveStatus('✓ Автозапис'); setTimeout(() => setAutoSaveStatus(''), 2000);
  };

  const checkForDraft = () => {
    const saved = localStorage.getItem(`draft_${template.id}_${currentDate}`);
    if (saved) {
      try {
        const d = JSON.parse(saved);
        setDate(d.date || currentDate); setShift(d.shift || '');
        setInventoryItems(d.inventoryItems || Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: '', portion: '', price: '', employeeName: '' })));
        setDefectiveItems(d.defectiveItems || Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: '', quantity: '', unit: 'брой', reason: '', brakedBy: '' })));
        setProtocolNumber(d.protocolNumber || 'БРАК'); setManager(d.manager || ''); setShift2(d.shift2 || '');
        setSavedManagers(d.savedManagers || []); setSavedEmployees(d.savedEmployees || []); setHasDraft(true);
      } catch { localStorage.removeItem(`draft_${template.id}_${currentDate}`); }
    }
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]); setShift('');
    setInventoryItems(Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: '', portion: '', price: '', employeeName: '' })));
    setDefectiveItems(Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: '', quantity: '', unit: 'брой', reason: '', brakedBy: '' })));
    setProtocolNumber('БРАК'); setManager(''); setShift2('');
  };

  const clearDraft = () => { localStorage.removeItem(`draft_${template.id}_${currentDate}`); resetForm(); setHasDraft(false); };
  const handleBackClick = () => { if (hasAnyData()) setShowExitConfirm(true); else if (onBack) onBack(); };
  const confirmExit = (save) => { if (save) saveDraft(); setShowExitConfirm(false); if (onBack) onBack(); };

  useEffect(() => { checkForDraft(); }, [template.id, currentDate]);
  useEffect(() => {
    const i = setInterval(() => { if (hasAnyData()) saveDraft(); }, 30000);
    return () => clearInterval(i);
  }, [date, shift, inventoryItems, defectiveItems, protocolNumber, manager, shift2, template.id, currentDate]);

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

  const handleSubmit = async () => {
    if (!hasAnyData()) { alert('Моля попълнете поне едно поле.'); return; }
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const sub = {
        template_id: template.id, restaurant_id: restaurantId, department_id: department.id,
        data: { date, shift, protocolNumber, manager, shift2, inventoryItems, defectiveItems, savedManagers, savedEmployees, totals: { inventory: calculateTotalPrice() }, summary: generateSummary() },
        submitted_by: userData.user.id, submission_date: date, synced: true
      };
      if (!navigator.onLine) {
        const q = getPending(); q.push(sub); savePendingQ(q);
        setAutoSaveStatus('⏳ Офлайн'); setTimeout(() => setAutoSaveStatus(''), 4000);
        localStorage.removeItem(`draft_${template.id}_${currentDate}`); setHasDraft(false); resetForm(); setLoading(false); return;
      }
      const { error } = await supabase.from('checklist_submissions').insert(sub);
      if (error) throw error;
      localStorage.removeItem(`draft_${template.id}_${currentDate}`); setHasDraft(false); resetForm();
      alert('Чек листът е запазен успешно!');
    } catch (err) {
      console.error('Submit error:', err);
      alert('Грешка: ' + err.message);
    } finally { setLoading(false); }
  };

  const summary = generateSummary();
  const empFood = {}; inventoryItems.forEach(i => { if (i.employeeName?.trim() && i.name) { const n = i.employeeName.trim(); if (!empFood[n]) empFood[n] = { items: [], total: 0 }; empFood[n].items.push({ name: i.name, portion: i.portion, price: parseFloat(i.price) || 0 }); empFood[n].total += parseFloat(i.price) || 0; } });
  const empDefect = {}; defectiveItems.forEach(i => { if (i.brakedBy?.trim() && i.name) { const n = i.brakedBy.trim(); if (!empDefect[n]) empDefect[n] = { items: [] }; empDefect[n].items.push({ name: i.name, qty: parseFloat(i.quantity) || 0, unit: i.unit, reason: i.reason }); } });
  const hasEmpData = Object.keys(empFood).length > 0 || Object.keys(empDefect).length > 0;

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ minHeight: '100vh', backgroundColor: DS.color.bg, fontFamily: DS.font, color: DS.color.graphite, display: 'flex', flexDirection: 'column' }}>

        {showExitConfirm && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(30,42,38,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
            <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, padding: '32px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Ic n="alert" sz={20} c={DS.color.warning} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, fontFamily: DS.font }}>Имате незапазени данни</h3>
              </div>
              <p style={{ marginBottom: '20px', color: DS.color.graphiteMed, lineHeight: 1.6, fontSize: '14px', fontFamily: DS.font }}>Какво искате да направите?</p>
              <div style={{ display: 'flex', gap: '8px', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'flex-end' }}>
                {[
                  { label: 'Отказ', bg: DS.color.pendingBg, color: DS.color.graphiteMed, action: () => setShowExitConfirm(false) },
                  { label: 'Изход без запазване', bg: DS.color.danger, color: 'white', action: () => confirmExit(false) },
                  { label: 'Запази и излез', bg: DS.color.primary, color: 'white', action: () => confirmExit(true) },
                ].map((b, i) => (
                  <button key={i} onClick={b.action} style={{ padding: '12px 16px', backgroundColor: b.bg, color: b.color, border: 'none', borderRadius: DS.radius, cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: DS.font }}>{b.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TOP BAR */}
        <div style={{ backgroundColor: DS.color.graphite, padding: isMobile ? '8px 12px' : '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.15)', gap: '8px' }}>
          <button onClick={handleBackClick} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: DS.radius, color: 'white', cursor: 'pointer', fontFamily: DS.font, fontSize: '12px', fontWeight: 600, minHeight: '36px' }}>
            <Ic n="back" sz={14} c="white" /> {!isMobile && 'Назад'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: isOnline ? '#4ADE80' : DS.color.danger, display: 'inline-block' }} />
              {!isMobile && <span style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{isOnline ? 'Онлайн' : 'Офлайн'}</span>}
              {pendingCount > 0 && <span style={{ backgroundColor: DS.color.warning, color: 'white', fontFamily: DS.font, fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '10px' }}>{pendingCount}</span>}
            </div>
            {autoSaveStatus && <span style={{ fontFamily: DS.font, fontSize: '11px', color: '#4ADE80', fontWeight: 500 }}>{autoSaveStatus}</span>}
            {hasDraft && !isMobile && <span style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Драфт</span>}
            <span style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>
              {now.toLocaleString('bg-BG', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', hour12: false })}
            </span>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: pad, flex: 1, width: '100%' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <img src={LOGO_URL} alt="Aladin Foods" style={{ height: isMobile ? '36px' : '48px', objectFit: 'contain', flexShrink: 0 }} onError={e => { e.target.style.display = 'none'; }} />
            <div>
              <h1 style={{ fontSize: isMobile ? '14px' : '20px', fontWeight: 700, color: DS.color.primary, margin: 0, textTransform: 'uppercase', fontFamily: DS.font }}>{template.name}</h1>
              <p style={{ fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteLight, margin: '2px 0 0' }}>{template.description}</p>
            </div>
          </div>

          {/* Controls */}
          <div style={{ backgroundColor: DS.color.surface, padding: pad, marginBottom: '16px', boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <ControlInput label="Дата" type="date" value={date} onChange={e => setDate(e.target.value)} />
            <ControlInput label="Смяна" value={shift} onChange={e => setShift(e.target.value)} placeholder="..." />
            {hasDraft && (
              <button onClick={clearDraft} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: DS.color.pendingBg, color: DS.color.danger, border: `1px solid ${DS.color.borderLight}`, borderRadius: DS.radius, cursor: 'pointer', fontFamily: DS.font, fontSize: '12px', fontWeight: 600 }}>
                <Ic n="reset" sz={14} c={DS.color.danger} /> Нов чек лист
              </button>
            )}
          </div>

          {/* ПЕРСОНАЛНА ХРАНА */}
          <div style={{ backgroundColor: DS.color.surface, boxShadow: DS.shadow.md, overflow: 'hidden', marginBottom: '16px', animation: 'ctrlFadeIn 400ms ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', backgroundColor: DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Ic n="package" sz={18} c={DS.color.primary} />
                <span style={{ fontFamily: DS.font, fontSize: '14px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase' }}>Персонална храна</span>
              </div>
              <button onClick={addInventoryItem} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', backgroundColor: DS.color.surface, color: DS.color.primary, border: `1.5px solid ${DS.color.primary}`, borderRadius: DS.radius, cursor: 'pointer', fontFamily: DS.font, fontSize: '11px', fontWeight: 600 }}>
                <Ic n="plus" sz={12} c={DS.color.primary} /> Ред
              </button>
            </div>

            {!isMobile && (
              <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1.5fr 40px', gap: '8px', padding: '8px 18px', borderBottom: `1px solid ${DS.color.borderLight}` }}>
                {['Ime на храната', 'Порция', 'Цена', 'Служител', ''].map((h, i) => (
                  <span key={i} style={{ fontFamily: DS.font, fontSize: '9px', fontWeight: 700, color: DS.color.graphiteMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                ))}
              </div>
            )}

            {inventoryItems.map((item, idx) => (
              <div key={item.id} style={{ padding: isMobile ? '12px 14px' : '8px 18px', borderBottom: `1px solid ${DS.color.borderLight}`, backgroundColor: idx % 2 === 0 ? DS.color.surface : DS.color.surfaceAlt, display: isMobile ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns: !isMobile ? '2.5fr 1fr 1fr 1.5fr 40px' : undefined, gap: '8px', alignItems: !isMobile ? 'center' : undefined }}>
                {isMobile && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 700, color: DS.color.graphiteMuted }}>#{idx + 1}</span>
                  {inventoryItems.length > 1 && <button onClick={() => removeInventoryItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Ic n="trash" sz={14} c={DS.color.danger} /></button>}
                </div>}
                <ControlInput label={isMobile ? 'Ime на храната' : undefined} value={item.name} onChange={e => updateInventoryItem(item.id, 'name', e.target.value)} placeholder="Наименование" />
                <ControlInput label={isMobile ? 'Порция' : undefined} value={item.portion} onChange={e => updateInventoryItem(item.id, 'portion', e.target.value)} placeholder="гр./бр." />
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                  <ControlInput label={isMobile ? 'Цена' : undefined} type="number" step="0.01" value={item.price} onChange={e => updateInventoryItem(item.id, 'price', e.target.value)} placeholder="0.00" />
                  <span style={{ fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteMuted, fontWeight: 600, paddingBottom: '12px', flexShrink: 0 }}>лв</span>
                </div>
                <ControlInput label={isMobile ? 'Служител' : undefined} value={item.employeeName} onChange={e => updateInventoryItem(item.id, 'employeeName', e.target.value)} placeholder="Ime и фамилия" />
                {!isMobile && <div style={{ textAlign: 'center' }}>
                  {inventoryItems.length > 1 && <button onClick={() => removeInventoryItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Ic n="trash" sz={14} c={DS.color.danger} /></button>}
                </div>}
              </div>
            ))}

            <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', backgroundColor: DS.color.okBg, borderTop: `2px solid ${DS.color.borderLight}` }}>
              <Ic n="calc" sz={16} c={DS.color.primary} />
              <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 600, color: DS.color.graphiteMed }}>Общо:</span>
              <span style={{ fontFamily: DS.font, fontSize: '18px', fontWeight: 700, color: DS.color.primary }}>{calculateTotalPrice()} лв</span>
            </div>
          </div>

          {/* МЕНИДЖЪР / ПРОТОКОЛ / СМЯНА 2 */}
          <div style={{ backgroundColor: DS.color.surface, padding: pad, marginBottom: '16px', boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
            <ControlInput label="Мениджър" value={manager} onChange={e => setManager(e.target.value)} placeholder="Ime на мениджър" />
            <ControlInput label="Номер протокол" value={protocolNumber} onChange={e => setProtocolNumber(e.target.value)} placeholder="Номер" />
            <ControlInput label="Смяна 2" value={shift2} onChange={e => setShift2(e.target.value)} placeholder="..." />
          </div>

          {/* БРАК */}
          <div style={{ backgroundColor: DS.color.surface, boxShadow: DS.shadow.md, overflow: 'hidden', marginBottom: '16px', animation: 'ctrlFadeIn 400ms ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', backgroundColor: DS.color.dangerBg, borderBottom: `1px solid ${DS.color.borderLight}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Ic n="alert" sz={18} c={DS.color.danger} />
                <span style={{ fontFamily: DS.font, fontSize: '14px', fontWeight: 700, color: DS.color.danger, textTransform: 'uppercase' }}>Брак на материални запаси</span>
              </div>
              <button onClick={addDefectiveItem} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', backgroundColor: DS.color.surface, color: DS.color.danger, border: `1.5px solid ${DS.color.danger}`, borderRadius: DS.radius, cursor: 'pointer', fontFamily: DS.font, fontSize: '11px', fontWeight: 600 }}>
                <Ic n="plus" sz={12} c={DS.color.danger} /> Ред
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
              <div key={item.id} style={{ padding: isMobile ? '12px 14px' : '8px 18px', borderBottom: `1px solid ${DS.color.borderLight}`, backgroundColor: idx % 2 === 0 ? DS.color.surface : DS.color.surfaceAlt, display: isMobile ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns: !isMobile ? '2fr 1fr 0.8fr 1.5fr 1.2fr 40px' : undefined, gap: '8px', alignItems: !isMobile ? 'center' : undefined }}>
                {isMobile && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 700, color: DS.color.graphiteMuted }}>#{idx + 1}</span>
                  {defectiveItems.length > 1 && <button onClick={() => removeDefectiveItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Ic n="trash" sz={14} c={DS.color.danger} /></button>}
                </div>}
                <ControlInput label={isMobile ? 'Артикул' : undefined} value={item.name} onChange={e => updateDefectiveItem(item.id, 'name', e.target.value)} placeholder="Наименование" />
                <ControlInput label={isMobile ? 'Количество' : undefined} type="number" step="0.01" value={item.quantity} onChange={e => updateDefectiveItem(item.id, 'quantity', e.target.value)} placeholder="0.00" />
                <ControlSelect label={isMobile ? 'Мярка' : undefined} value={item.unit} onChange={e => updateDefectiveItem(item.id, 'unit', e.target.value)}>
                  <option value="брой">брой</option><option value="кг">кг</option><option value="л">л</option><option value="гр">гр</option><option value="мл">мл</option>
                </ControlSelect>
                <ControlInput label={isMobile ? 'Причина' : undefined} value={item.reason} onChange={e => updateDefectiveItem(item.id, 'reason', e.target.value)} placeholder="Причина за брак" />
                <ControlInput label={isMobile ? 'Бракувал' : undefined} value={item.brakedBy} onChange={e => updateDefectiveItem(item.id, 'brakedBy', e.target.value)} placeholder="Ime и фамилия" />
                {!isMobile && <div style={{ textAlign: 'center' }}>
                  {defectiveItems.length > 1 && <button onClick={() => removeDefectiveItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Ic n="trash" sz={14} c={DS.color.danger} /></button>}
                </div>}
              </div>
            ))}
          </div>

          {/* ОБОБЩЕНИЕ */}
          {(summary.consumption.length > 0 || summary.defective.length > 0) && (
            <div style={{ backgroundColor: DS.color.surface, boxShadow: DS.shadow.sm, overflow: 'hidden', marginBottom: '16px', border: `1px solid ${DS.color.borderLight}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', backgroundColor: DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}` }}>
                <Ic n="clipboard" sz={18} c={DS.color.primary} />
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

          {/* ПО СЛУЖИТЕЛИ */}
          <div style={{ backgroundColor: DS.color.surface, boxShadow: DS.shadow.sm, overflow: 'hidden', marginBottom: '16px', border: `1px solid ${DS.color.borderLight}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', backgroundColor: DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}` }}>
              <Ic n="users" sz={18} c={DS.color.primary} />
              <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase' }}>По служители</span>
            </div>
            <div style={{ padding: pad, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
              {Object.keys(empFood).length > 0 && (
                <div style={{ padding: '12px', backgroundColor: DS.color.okBg, borderLeft: `3px solid ${DS.color.primary}` }}>
                  <div style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', marginBottom: '8px' }}>Храна</div>
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
                  <div style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 700, color: DS.color.danger, textTransform: 'uppercase', marginBottom: '8px' }}>Брак</div>
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

          {/* SUBMIT */}
          <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
            <button onClick={handleSubmit} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: isMobile ? '14px 32px' : '14px 48px', border: 'none', borderRadius: DS.radius, backgroundColor: loading ? DS.color.graphiteMuted : DS.color.primary, color: 'white', fontFamily: DS.font, fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', animation: !loading && hasAnyData() ? 'ctrlBreathe 3s ease-in-out infinite' : 'none', minHeight: '48px' }}>
              <Ic n="save" sz={18} c="white" />
              {loading ? 'Запазване...' : 'Запази чек лист'}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '20px 24px', color: DS.color.graphiteMuted, fontFamily: DS.font, fontSize: '11px', borderTop: `1px solid ${DS.color.borderLight}`, marginTop: 'auto' }}>
          © 2026 Aladin Foods | by MG
        </div>
      </div>
    </>
  );
};

export default RestaurantInventoryForm;