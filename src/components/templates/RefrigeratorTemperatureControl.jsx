import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Save, Plus, Trash2, Calendar, Thermometer, AlertTriangle,
  AlertCircle, FileText, CheckCircle, RotateCcw, ChevronLeft,
  Flame, User, Edit3
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
    danger: '#C53030',
    pendingBg: '#F0F2F1',
    border: '#D5DDD9', borderLight: '#E4EBE7',
    cold: '#EFF6FF', coldAccent: '#3B82F6', coldText: '#1E40AF',
    hot: '#FFF7ED', hotAccent: '#F97316', hotText: '#9A3412',
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
  @keyframes warnPulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
  @media (max-width: 767px) { input, button, select, textarea { font-size: 16px !important; } }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${DS.color.sage}; border-radius: 0; }
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

const ControlInput = ({ label, type = 'text', value, onChange, placeholder, ...rest }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ minWidth: 0, flex: 1 }}>
      {label && <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: focused ? DS.color.primary : DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={inputBase(focused)} {...rest} />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   VITRINA CARD — за всеки ред (дата)
   ═══════════════════════════════════════════════════════════════ */
const VitrinaSection = ({ columns, row, customColumns, updateColumn, removeColumn, getCellData, updateCellData, isMobile }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : `repeat(auto-fill, minmax(220px, 1fr))`,
    gap: isMobile ? '10px' : '14px',
  }}>
    {columns.map((col, ci) => {
      const isHot = col.temp?.includes('63') || col.name?.includes('Топла');
      const isCustom = !!customColumns.find(c => c.id === col.id);
      const theme = isHot
        ? { bg: DS.color.hot, accent: DS.color.hotAccent, text: DS.color.hotText, Icon: Flame }
        : { bg: DS.color.cold, accent: DS.color.coldAccent, text: DS.color.coldText, Icon: Thermometer };

      const val8 = getCellData(row.id, col.id, '8');
      const val19 = getCellData(row.id, col.id, '19');

      return (
        <div key={col.id} style={{
          backgroundColor: DS.color.surface, borderRadius: DS.radius,
          border: `1.5px solid ${DS.color.borderLight}`, boxShadow: DS.shadow.sm,
          overflow: 'hidden', animation: 'ctrlFadeIn 300ms ease-out both', animationDelay: `${ci * 50}ms`,
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: theme.bg, borderBottom: `1px solid ${DS.color.borderLight}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
              <div style={{ width: 30, height: 30, borderRadius: DS.radius, backgroundColor: DS.color.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${theme.accent}`, flexShrink: 0 }}>
                <theme.Icon style={{ width: 14, height: 14, color: theme.accent }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {isCustom ? (
                  <input type="text" value={col.name} onChange={e => updateColumn(col.id, 'name', e.target.value)}
                    style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: theme.text, border: 'none', backgroundColor: 'transparent', outline: 'none', width: '100%', padding: 0 }} />
                ) : (
                  <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: theme.text }}>{col.name}</span>
                )}
                <div style={{ fontFamily: DS.font, fontSize: '10px', color: DS.color.graphiteMuted, marginTop: '1px' }}>
                  {isCustom ? (
                    <input type="text" value={col.unit} onChange={e => updateColumn(col.id, 'unit', e.target.value)} placeholder="Продукт"
                      style={{ fontFamily: DS.font, fontSize: '10px', color: DS.color.graphiteMuted, border: 'none', backgroundColor: 'transparent', outline: 'none', width: '100%', padding: 0 }} />
                  ) : col.unit}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <div style={{ padding: '3px 8px', backgroundColor: DS.color.surface, border: `1.5px solid ${theme.accent}`, borderRadius: DS.radius }}>
                {isCustom ? (
                  <input type="text" value={col.temp} onChange={e => updateColumn(col.id, 'temp', e.target.value)}
                    style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 700, color: theme.text, border: 'none', backgroundColor: 'transparent', outline: 'none', width: '60px', textAlign: 'center', padding: 0 }} />
                ) : (
                  <span style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 700, color: theme.text }}>{col.temp}</span>
                )}
              </div>
              {isCustom && (
                <button onClick={() => removeColumn(col.id)} title="Премахни"
                  style={{ background: 'transparent', border: `1px solid ${DS.color.borderLight}`, cursor: 'pointer', padding: '3px', color: DS.color.graphiteMuted, borderRadius: DS.radius, display: 'flex', minWidth: 24, minHeight: 24, alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={e => { e.currentTarget.style.color = DS.color.danger; e.currentTarget.style.borderColor = DS.color.danger; }}
                  onMouseLeave={e => { e.currentTarget.style.color = DS.color.graphiteMuted; e.currentTarget.style.borderColor = DS.color.borderLight; }}>
                  <Trash2 style={{ width: 12, height: 12 }} />
                </button>
              )}
            </div>
          </div>
          {/* Time inputs */}
          <div style={{ display: 'flex', gap: '1px', backgroundColor: DS.color.borderLight }}>
            {[{ slot: '8', label: '8:00' }, { slot: '19', label: '19:00' }].map(({ slot, label }) => {
              const val = getCellData(row.id, col.id, slot);
              const [focused, setFocused] = useState(false);
              return (
                <div key={slot} style={{ flex: 1, backgroundColor: DS.color.surface, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 600, color: DS.color.graphiteMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{label}</div>
                  <div style={{ position: 'relative' }}>
                    <input type="number" step="0.1" value={val} onChange={e => updateCellData(row.id, col.id, slot, e.target.value)} placeholder="—"
                      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                      style={{
                        width: '100%', padding: '10px 8px', textAlign: 'center',
                        fontFamily: DS.font, fontSize: '20px', fontWeight: 700,
                        color: val ? DS.color.graphite : DS.color.graphiteMuted,
                        border: `2px solid ${focused ? DS.color.primary : DS.color.borderLight}`,
                        borderRadius: DS.radius, backgroundColor: focused ? DS.color.surface : DS.color.surfaceAlt,
                        outline: 'none', boxSizing: 'border-box', WebkitAppearance: 'none',
                        boxShadow: focused ? `0 0 0 3px ${DS.color.primaryGlow}` : 'none',
                        transition: 'all 150ms ease',
                      }} />
                    {val && <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteMuted, pointerEvents: 'none' }}>°C</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    })}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   HELPER
   ═══════════════════════════════════════════════════════════════ */
const makeInitialRows = () => Array.from({ length: 5 }, (_, i) => ({ id: i, date: '', data: {}, corrective: '', checkedBy: '', signed: false }));

/* ═══════════════════════════════════════════════════════════════
   MAIN
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

  const [defaultColumns] = useState([
    { id: 'hot_display', name: 'Топла витрина', temp: '≥ 63°C', unit: 'Пица' },
    { id: 'cold_pizza', name: 'Студена витрина', temp: '0°C÷4°C', unit: 'Пица' },
    { id: 'cold_doner', name: 'Студена витрина', temp: '0°C÷4°C', unit: 'Дюнер' },
    { id: 'hot_clean', name: 'Топла витрина', temp: '≥ 63°C', unit: 'Чикън' }
  ]);

  const [customColumns, setCustomColumns] = useState([]);
  const [rows, setRows] = useState(makeInitialRows());
  const [savedInspectors, setSavedInspectors] = useState([]);

  const currentDate = new Date().toISOString().split('T')[0];
  const allColumns = [...defaultColumns, ...customColumns];

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const flash = (msg) => { setAutoSaveStatus(msg); setTimeout(() => setAutoSaveStatus(''), 3000); };

  // ─── Offline sync ───
  const PENDING_KEY = `pending_submissions_${template.id}`;
  const getPending = () => { try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); } catch { return []; } };
  const savePendingQ = (q) => { localStorage.setItem(PENDING_KEY, JSON.stringify(q)); setPendingCount(q.length); };
  const addToPending = (sub) => { const q = getPending(); q.push({ ...sub, savedAt: Date.now() }); savePendingQ(q); };
  const syncPending = async () => {
    const queue = getPending(); if (!queue.length) return;
    setSyncStatus('syncing'); const failed = [];
    for (const item of queue) { try { const { savedAt, ...d } = item; const { error } = await supabase.from('checklist_submissions').insert(d); if (error) throw error; } catch { failed.push(item); } }
    savePendingQ(failed);
    if (!failed.length) { setSyncStatus('synced'); flash(`✓ ${queue.length} записа синхронизирани`); } else { setSyncStatus('error'); flash(`⚠ ${failed.length} не са синхронизирани`); }
    setTimeout(() => setSyncStatus(''), 4000);
  };
  useEffect(() => { const goOn = () => { setIsOnline(true); syncPending(); }; const goOff = () => setIsOnline(false); window.addEventListener('online', goOn); window.addEventListener('offline', goOff); setPendingCount(getPending().length); if (navigator.onLine && getPending().length > 0) syncPending(); return () => { window.removeEventListener('online', goOn); window.removeEventListener('offline', goOff); }; }, []);

  const hasAnyData = () => { if (customColumns.length > 0) return true; return rows.some(r => r.date || r.corrective || r.checkedBy || r.signed || Object.keys(r.data).some(k => r.data[k])); };

  // ─── Config ───
  const loadSavedConfig = async () => {
    try { const c = localStorage.getItem(`config_${template.id}_${restaurantId}`); if (c) { const d = JSON.parse(c); if (d.customColumns?.length) setCustomColumns(d.customColumns); if (d.savedInspectors?.length) setSavedInspectors(d.savedInspectors); return; } } catch {}
    try { const { data } = await supabase.from('checklist_submissions').select('data').eq('template_id', template.id).eq('restaurant_id', restaurantId).order('created_at', { ascending: false }).limit(1).single();
      if (data?.data) { if (data.data.customColumns?.length) setCustomColumns(data.data.customColumns); if (data.data.savedInspectors?.length) setSavedInspectors(data.data.savedInspectors);
        localStorage.setItem(`config_${template.id}_${restaurantId}`, JSON.stringify({ customColumns: data.data.customColumns || [], savedInspectors: data.data.savedInspectors || [] })); }
    } catch {}
  };

  // ─── Draft ───
  useEffect(() => { const k = `draft_${template.id}_${currentDate}`; const s = localStorage.getItem(k); if (s) { try { const d = JSON.parse(s); setCustomColumns(d.customColumns || []); setRows(d.rows || makeInitialRows()); setSavedInspectors(d.savedInspectors || []); setHasDraft(true); } catch { localStorage.removeItem(k); } } else loadSavedConfig(); }, [template.id, currentDate]);
  useEffect(() => { const i = setInterval(() => { if (hasAnyData()) saveDraft(); }, 30000); return () => clearInterval(i); }, [customColumns, rows, savedInspectors]);

  const saveDraft = () => { if (!hasAnyData()) return; localStorage.setItem(`draft_${template.id}_${currentDate}`, JSON.stringify({ customColumns, rows, savedInspectors, timestamp: Date.now() })); setHasDraft(true); flash('✓ Автоматично запазено'); };
  const clearDraft = () => { if (window.confirm('Изчистване? Конфигурацията на витрините ще се запази.')) { setRows(makeInitialRows()); localStorage.removeItem(`draft_${template.id}_${currentDate}`); setHasDraft(false); flash('Нов чек лист'); } };
  const handleBackClick = () => { hasAnyData() ? setShowExitConfirm(true) : onBack?.(); };
  const confirmExit = (save) => { if (save) saveDraft(); setShowExitConfirm(false); onBack?.(); };

  // ─── Column CRUD ───
  const addColumn = () => setCustomColumns([...customColumns, { id: Date.now().toString(), name: 'Нова витрина', temp: '0°C÷4°C', unit: 'Продукт' }]);
  const removeColumn = (id) => { setCustomColumns(customColumns.filter(c => c.id !== id)); setRows(rows.map(r => { const nd = { ...r.data }; delete nd[`${id}_8`]; delete nd[`${id}_19`]; return { ...r, data: nd }; })); };
  const updateColumn = (id, f, v) => setCustomColumns(customColumns.map(c => c.id === id ? { ...c, [f]: v } : c));

  // ─── Row CRUD ───
  const addRow = () => setRows([...rows, { id: Date.now(), date: '', data: {}, corrective: '', checkedBy: '', signed: false }]);
  const removeRow = (id) => { if (rows.length > 1) setRows(rows.filter(r => r.id !== id)); };
  const updateRow = (id, f, v) => { setRows(rows.map(r => r.id === id ? { ...r, [f]: v } : r)); if (f === 'checkedBy' && v.trim() && !savedInspectors.includes(v.trim())) setSavedInspectors([...savedInspectors, v.trim()]); };
  const updateCellData = (rId, cId, ts, v) => setRows(rows.map(r => r.id === rId ? { ...r, data: { ...r.data, [`${cId}_${ts}`]: v } } : r));
  const getCellData = (rId, cId, ts) => { const r = rows.find(x => x.id === rId); return r?.data[`${cId}_${ts}`] || ''; };

  // ─── Submit ───
  const handleSubmit = async () => {
    if (!hasAnyData()) { alert('Моля попълнете поне едно поле.'); return; }
    setLoading(true);
    const sub = { template_id: template.id, restaurant_id: restaurantId, department_id: department.id, data: { customColumns, rows, savedInspectors }, submission_date: rows.find(r => r.date)?.date || currentDate, synced: true };
    try { const { data: u } = await supabase.auth.getUser(); if (u?.user?.id) sub.submitted_by = u.user.id; } catch {}
    const saveConfig = () => localStorage.setItem(`config_${template.id}_${restaurantId}`, JSON.stringify({ customColumns, savedInspectors }));
    const resetForm = () => { setRows(makeInitialRows()); localStorage.removeItem(`draft_${template.id}_${currentDate}`); setHasDraft(false); saveConfig(); };
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
            {autoSaveStatus && <span style={{ fontFamily: DS.font, fontSize: '11px', color: DS.color.ok, display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}><CheckCircle style={{ width: 12, height: 12 }} />{isMobile ? '✓' : autoSaveStatus}</span>}
            {hasDraft && !isMobile && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: DS.radius }}><FileText style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.5)' }} /><span style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Драфт</span></div>}
            <span style={{ fontFamily: DS.font, fontSize: isMobile ? '11px' : '12px', fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>{now.toLocaleString('bg-BG', { hour: '2-digit', minute: '2-digit', ...(isMobile ? {} : { second: '2-digit' }), day: '2-digit', month: '2-digit', ...(isMobile ? {} : { year: 'numeric' }), hour12: false })}</span>
          </div>
        </div>

        {/* MAIN */}
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: pad, flex: 1, width: '100%' }}>

          {/* Title */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '20px', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img src={LOGO_URL} alt="Aladin Foods" style={{ height: isMobile ? '36px' : '48px', width: 'auto', objectFit: 'contain' }} />
              <div>
                <h1 style={{ fontSize: isMobile ? '15px' : '22px', fontWeight: 700, color: DS.color.primary, margin: 0, textTransform: 'uppercase', fontFamily: DS.font }}>КОНТРОЛ НА ТЕМПЕРАТУРАТА</h1>
                <p style={{ fontFamily: DS.font, fontSize: isMobile ? '10px' : '12px', color: DS.color.graphiteLight, margin: '2px 0 0' }}>ХЛАДИЛНИ ВИТРИНИ — 8:00 и 19:00</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button onClick={addColumn} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: DS.color.primary, border: 'none', borderRadius: DS.radius, color: 'white', cursor: 'pointer', fontFamily: DS.font, fontSize: '12px', fontWeight: 600, minHeight: '40px', boxShadow: DS.shadow.glow }}><Plus style={{ width: 14, height: 14 }} />Витрина</button>
            <button onClick={addRow} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: DS.color.primary, border: 'none', borderRadius: DS.radius, color: 'white', cursor: 'pointer', fontFamily: DS.font, fontSize: '12px', fontWeight: 600, minHeight: '40px', boxShadow: DS.shadow.glow }}><Plus style={{ width: 14, height: 14 }} />Ден</button>
            {hasDraft && <button onClick={clearDraft} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', backgroundColor: 'transparent', border: `1.5px solid ${DS.color.danger}`, borderRadius: DS.radius, color: DS.color.danger, cursor: 'pointer', fontFamily: DS.font, fontSize: '12px', fontWeight: 600, minHeight: '40px' }}><RotateCcw style={{ width: 14, height: 14 }} />{isMobile ? 'Нов' : 'Нов чек лист'}</button>}
          </div>

          {/* ROWS = DAYS */}
          {rows.map((row, ri) => (
            <div key={row.id} style={{ marginBottom: '28px', animation: 'ctrlFadeIn 300ms ease-out both', animationDelay: `${ri * 80}ms` }}>
              {/* Date bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 18px', marginBottom: '14px', backgroundColor: DS.color.graphite, borderRadius: DS.radius }}>
                <Calendar style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
                <input type="date" value={row.date} onChange={e => updateRow(row.id, 'date', e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: DS.radius, fontFamily: DS.font, fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.08)', color: 'white', outline: 'none', colorScheme: 'dark' }} />
                <span style={{ fontFamily: DS.font, fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', flex: 1 }}>
                  {row.date ? new Date(row.date + 'T00:00').toLocaleDateString('bg-BG', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Изберете дата'}
                </span>
                {rows.length > 1 && (
                  <button onClick={() => removeRow(row.id)} style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,200,200,0.9)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                    <Trash2 style={{ width: 16, height: 16 }} />
                  </button>
                )}
              </div>

              {/* Vitrina cards */}
              <VitrinaSection columns={allColumns} row={row} customColumns={customColumns}
                updateColumn={updateColumn} removeColumn={removeColumn}
                getCellData={getCellData} updateCellData={updateCellData} isMobile={isMobile} />

              {/* Bottom row: Corrective + Inspector + Signed */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr auto', gap: '14px', marginTop: '14px' }}>
                <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, border: `1px solid ${DS.color.borderLight}`, overflow: 'hidden', boxShadow: DS.shadow.sm }}>
                  <div style={{ padding: '8px 14px', backgroundColor: DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}`, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Edit3 style={{ width: 12, height: 12, color: DS.color.primary }} />
                    <span style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase' }}>Коректни действия</span>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <textarea value={row.corrective} onChange={e => updateRow(row.id, 'corrective', e.target.value)}
                      placeholder="Опишете действия при нужда..." rows={2}
                      style={{ ...inputBase(false), resize: 'vertical', lineHeight: 1.5, minHeight: '60px' }}
                      onFocus={e => { e.target.style.borderColor = DS.color.primary; e.target.style.boxShadow = `0 0 0 3px ${DS.color.primaryGlow}`; }}
                      onBlur={e => { e.target.style.borderColor = DS.color.borderLight; e.target.style.boxShadow = 'none'; }} />
                  </div>
                </div>

                <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, border: `1px solid ${DS.color.borderLight}`, overflow: 'hidden', boxShadow: DS.shadow.sm }}>
                  <div style={{ padding: '8px 14px', backgroundColor: DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}`, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User style={{ width: 12, height: 12, color: DS.color.primary }} />
                    <span style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase' }}>Проверил</span>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <ControlInput value={row.checkedBy} onChange={e => updateRow(row.id, 'checkedBy', e.target.value)}
                      placeholder="Име на проверяващ" list={`insp-${row.id}`} />
                    <datalist id={`insp-${row.id}`}>{savedInspectors.map((n, i) => <option key={i} value={n} />)}</datalist>
                  </div>
                </div>

                <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, border: `1px solid ${DS.color.borderLight}`, overflow: 'hidden', boxShadow: DS.shadow.sm, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '8px 14px', backgroundColor: DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase' }}>Подпис</span>
                  </div>
                  <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={row.signed} onChange={e => updateRow(row.id, 'signed', e.target.checked)}
                        style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: DS.color.primary }} />
                      <span style={{ fontFamily: DS.font, fontSize: '13px', color: row.signed ? DS.color.ok : DS.color.graphiteMuted, fontWeight: row.signed ? 600 : 400 }}>
                        {row.signed ? 'Подписано' : 'Подпиши'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Submit */}
          <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, padding: pad, boxShadow: DS.shadow.md, border: `1px solid ${DS.color.borderLight}`, textAlign: 'center', marginBottom: '8px' }}>
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