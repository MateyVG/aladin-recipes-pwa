import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Save, Plus, Trash2, Calendar, Users, Droplet, 
  AlertCircle, FileText, CheckCircle, RotateCcw, ChevronLeft, Lock
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
    warning: '#C47F17', danger: '#C53030',
    pendingBg: '#F0F2F1',
    border: '#D5DDD9', borderLight: '#E4EBE7',
    history: '#F5F0E8', historyBorder: '#E8DFD0',
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
`;

const useResponsive = () => {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return { isMobile: w < 768, isTablet: w >= 768 && w < 1024 };
};

/* ═══════════════════════════════════════════════════════════════
   INPUT HELPERS
   ═══════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════
   RECORD CARD — нов запис (editable)
   Полета: date, quantity, oilType, nameSignature, completed
   БЕЗ shift!
   ═══════════════════════════════════════════════════════════════ */
const RecordCard = ({ record, index, onUpdate, onRemove, canRemove, savedEmployees, savedOilTypes, isMobile }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      backgroundColor: DS.color.surface, borderRadius: DS.radius,
      border: `1.5px solid ${hovered ? DS.color.sageMuted : DS.color.borderLight}`,
      boxShadow: hovered ? DS.shadow.md : DS.shadow.sm,
      overflow: 'hidden', transition: 'all 200ms ease',
      animation: 'ctrlFadeIn 300ms ease-out both', animationDelay: `${index * 60}ms`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '10px 14px' : '12px 18px', backgroundColor: DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}` }}>
        <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase' }}>Нов запис</span>
        {canRemove && (
          <button onClick={() => onRemove(record.id)} title="Премахни"
            style={{ background: 'transparent', border: `1px solid ${DS.color.borderLight}`, cursor: 'pointer', padding: '6px', color: DS.color.graphiteMuted, borderRadius: DS.radius, transition: 'all 150ms ease', display: 'flex', minWidth: '32px', minHeight: '32px', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.color = DS.color.danger; e.currentTarget.style.borderColor = DS.color.danger; }}
            onMouseLeave={e => { e.currentTarget.style.color = DS.color.graphiteMuted; e.currentTarget.style.borderColor = DS.color.borderLight; }}>
            <Trash2 style={{ width: 16, height: 16 }} />
          </button>
        )}
      </div>
      <div style={{ padding: isMobile ? '12px 14px' : '16px 18px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
        <ControlInput label="Дата" type="date" value={record.date} onChange={e => onUpdate(record.id, 'date', e.target.value)} />
        <ControlInput label="Количество (л)" type="number" value={record.quantity} onChange={e => onUpdate(record.id, 'quantity', e.target.value)} placeholder="0.0" step="0.1" />
        <div>
          <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Вид фритюрник</label>
          <input type="text" value={record.oilType} onChange={e => onUpdate(record.id, 'oilType', e.target.value)}
            list={`oil-types-${record.id}`} placeholder="Тип масло/мазнина"
            style={{ ...inputBase(false), width: '100%' }} />
          <datalist id={`oil-types-${record.id}`}>{savedOilTypes.map((t, i) => <option key={i} value={t} />)}</datalist>
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Име Фамилия</label>
          <input type="text" value={record.nameSignature} onChange={e => onUpdate(record.id, 'nameSignature', e.target.value)}
            list={`emp-${record.id}`} placeholder="Служител"
            style={{ ...inputBase(false), width: '100%' }} />
          <datalist id={`emp-${record.id}`}>{savedEmployees.map((n, i) => <option key={i} value={n} />)}</datalist>
        </div>
        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input type="checkbox" checked={record.completed} onChange={e => onUpdate(record.id, 'completed', e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: DS.color.primary }} />
          <span style={{ fontFamily: DS.font, fontSize: '13px', color: DS.color.graphiteMed }}>Потвърждавам</span>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   HISTORY CARD — запис от предишен submit (read-only)
   ═══════════════════════════════════════════════════════════════ */
const HistoryCard = ({ record, submittedAt, isMobile }) => (
  <div style={{
    backgroundColor: DS.color.history, borderRadius: DS.radius,
    border: `1.5px solid ${DS.color.historyBorder}`,
    boxShadow: DS.shadow.sm, overflow: 'hidden', opacity: 0.85,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '8px 14px' : '10px 18px', backgroundColor: DS.color.historyBorder, borderBottom: `1px solid ${DS.color.historyBorder}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Lock style={{ width: 12, height: 12, color: DS.color.graphiteMuted }} />
        <span style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.graphiteMuted, textTransform: 'uppercase' }}>Запазен запис</span>
      </div>
      {submittedAt && <span style={{ fontFamily: DS.font, fontSize: '10px', color: DS.color.graphiteMuted }}>{submittedAt}</span>}
    </div>
    <div style={{ padding: isMobile ? '10px 14px' : '14px 18px', display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: '10px' }}>
      {[
        { label: 'Дата', value: record.date || '—' },
        { label: 'Количество', value: record.quantity ? `${record.quantity} л` : '—' },
        { label: 'Фритюрник', value: record.oilType || '—' },
        { label: 'Служител', value: record.nameSignature || '—' },
      ].map((f, i) => (
        <div key={i}>
          <div style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 600, color: DS.color.graphiteMuted, textTransform: 'uppercase', marginBottom: '2px' }}>{f.label}</div>
          <div style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 500, color: DS.color.graphite }}>{f.value}</div>
        </div>
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const OilChangeChecklist = ({ template = {}, config = {}, department = {}, restaurantId, onBack }) => {
  const { isMobile, isTablet } = useResponsive();
  const cardsRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(new Date());
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [hasDraft, setHasDraft] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState('');

  // Нови записи (editable)
  const [records, setRecords] = useState([{
    id: Date.now(), date: '', quantity: '', oilType: '', nameSignature: '', completed: false
  }]);

  // Натрупани записи от предишни submit-и (read-only)
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const [savedEmployees, setSavedEmployees] = useState([]);
  const [savedOilTypes, setSavedOilTypes] = useState([]);

  const currentDate = new Date().toISOString().split('T')[0];

  // Clock
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  // ─── Offline sync ───
  const PENDING_KEY = `pending_submissions_${template.id}`;
  const getPending = () => { try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); } catch { return []; } };
  const savePendingQ = (q) => { localStorage.setItem(PENDING_KEY, JSON.stringify(q)); setPendingCount(q.length); };
  const addToPending = (sub) => { const q = getPending(); q.push({ ...sub, savedAt: Date.now() }); savePendingQ(q); };

  const syncPending = async () => {
    const queue = getPending(); if (!queue.length) return;
    setSyncStatus('syncing'); const failed = [];
    for (const item of queue) {
      try { const { savedAt, ...d } = item; const { error } = await supabase.from('checklist_submissions').insert(d); if (error) throw error; }
      catch { failed.push(item); }
    }
    savePendingQ(failed);
    if (!failed.length) { setSyncStatus('synced'); setAutoSaveStatus(`✓ ${queue.length} записа синхронизирани`); }
    else { setSyncStatus('error'); setAutoSaveStatus(`⚠ ${failed.length} записа не са синхронизирани`); }
    setTimeout(() => { setSyncStatus(''); setAutoSaveStatus(''); }, 4000);
  };

  useEffect(() => {
    const goOn = () => { setIsOnline(true); syncPending(); };
    const goOff = () => setIsOnline(false);
    window.addEventListener('online', goOn); window.addEventListener('offline', goOff);
    setPendingCount(getPending().length);
    if (navigator.onLine && getPending().length > 0) syncPending();
    return () => { window.removeEventListener('online', goOn); window.removeEventListener('offline', goOff); };
  }, []);

  // ─── hasAnyData (само нови записи) ───
  const hasAnyData = () => records.some(r => r.date || r.quantity || r.oilType || r.nameSignature || r.completed);

  // ─── Зареждане на ИСТОРИЯ от всички предишни submissions ───
  useEffect(() => {
    const loadHistory = async () => {
      if (!template?.id || !restaurantId) return;
      try {
        const { data, error } = await supabase
          .from('checklist_submissions')
          .select('data, created_at')
          .eq('template_id', template.id)
          .eq('restaurant_id', restaurantId)
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          const allHistory = [];
          const empSet = new Set(savedEmployees);
          const oilSet = new Set(savedOilTypes);

          data.forEach(submission => {
            const submittedAt = new Date(submission.created_at).toLocaleString('bg-BG');
            const recs = submission.data?.records || [];
            recs.forEach(rec => {
              // Филтрираме празни записи
              if (rec.date || rec.quantity || rec.oilType || rec.nameSignature) {
                allHistory.push({ ...rec, _submittedAt: submittedAt });
              }
              if (rec.nameSignature) empSet.add(rec.nameSignature);
              if (rec.oilType) oilSet.add(rec.oilType);
            });
            // От savedEmployees/savedOilTypes в data
            (submission.data?.savedEmployees || []).forEach(e => empSet.add(e));
            (submission.data?.savedOilTypes || []).forEach(o => oilSet.add(o));
          });

          setHistoryRecords(allHistory);
          setSavedEmployees([...empSet]);
          setSavedOilTypes([...oilSet]);
        }
      } catch { console.log('Няма предишни записи'); }
      setHistoryLoaded(true);
    };

    // Проверяваме localStorage кеш за offline
    try {
      const cached = localStorage.getItem(`history_${template.id}_${restaurantId}`);
      if (cached) {
        const { history, employees, oilTypes } = JSON.parse(cached);
        if (history?.length) setHistoryRecords(history);
        if (employees?.length) setSavedEmployees(employees);
        if (oilTypes?.length) setSavedOilTypes(oilTypes);
      }
    } catch {}

    loadHistory();
  }, [template?.id, restaurantId]);

  // Кешираме историята за offline
  useEffect(() => {
    if (historyLoaded && historyRecords.length > 0) {
      localStorage.setItem(`history_${template.id}_${restaurantId}`, JSON.stringify({
        history: historyRecords, employees: savedEmployees, oilTypes: savedOilTypes
      }));
    }
  }, [historyRecords, historyLoaded]);

  // ─── Draft система ───
  useEffect(() => {
    const key = `draft_${template.id}_${currentDate}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setHasDraft(true);
      try {
        const { records: r, savedEmployees: e, savedOilTypes: o } = JSON.parse(saved);
        if (r) setRecords(r);
        if (e) setSavedEmployees(prev => [...new Set([...prev, ...e])]);
        if (o) setSavedOilTypes(prev => [...new Set([...prev, ...o])]);
      } catch {}
    }
  }, [template.id, currentDate]);

  useEffect(() => {
    const interval = setInterval(() => saveDraft(), 30000);
    return () => clearInterval(interval);
  }, [records, savedEmployees, savedOilTypes]);

  const saveDraft = () => {
    if (!hasAnyData()) return;
    localStorage.setItem(`draft_${template.id}_${currentDate}`, JSON.stringify({
      records, savedEmployees, savedOilTypes, timestamp: Date.now()
    }));
    setHasDraft(true);
    setAutoSaveStatus('✓ Автоматично запазено');
    setTimeout(() => setAutoSaveStatus(''), 2000);
  };

  const clearDraft = () => {
    if (window.confirm('Изчистване на новите записи?')) {
      setRecords([{ id: Date.now(), date: '', quantity: '', oilType: '', nameSignature: '', completed: false }]);
      localStorage.removeItem(`draft_${template.id}_${currentDate}`);
      setHasDraft(false);
      setAutoSaveStatus('Изчистено');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }
  };

  const handleBackClick = () => { hasAnyData() ? setShowExitConfirm(true) : onBack?.(); };
  const confirmExit = (save) => {
    if (save) saveDraft();
    setShowExitConfirm(false);
    onBack?.();
  };

  // ─── CRUD ───
  const addRecord = () => {
    const newRec = { id: Date.now(), date: '', quantity: '', oilType: '', nameSignature: '', completed: false };
    setRecords([newRec, ...records]);
    setTimeout(() => { if (cardsRef.current) cardsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
  };

  const removeRecord = (id) => {
    if (records.length > 1) setRecords(records.filter(r => r.id !== id));
  };

  const updateRecord = (id, field, value) => {
    setRecords(records.map(r => r.id === id ? { ...r, [field]: value } : r));
    if (field === 'nameSignature' && value.trim() && !savedEmployees.includes(value.trim())) setSavedEmployees([...savedEmployees, value.trim()]);
    if (field === 'oilType' && value.trim() && !savedOilTypes.includes(value.trim())) setSavedOilTypes([...savedOilTypes, value.trim()]);
  };

  // ─── Submit + натрупване ───
  const handleSubmit = async () => {
    if (!hasAnyData()) { alert('Моля попълнете поне един запис.'); return; }
    setLoading(true);

    // Само попълнените записи
    const filledRecords = records.filter(r => r.date || r.quantity || r.oilType || r.nameSignature);

    const sub = {
      template_id: template.id, restaurant_id: restaurantId, department_id: department.id,
      data: { records: filledRecords, savedEmployees, savedOilTypes },
      submission_date: filledRecords[0]?.date || currentDate, synced: true,
    };
    try { const { data: u } = await supabase.auth.getUser(); if (u?.user?.id) sub.submitted_by = u.user.id; } catch {}

    const onSuccess = () => {
      localStorage.removeItem(`draft_${template.id}_${currentDate}`);
      setHasDraft(false);
      // Добавяме новите записи към историята
      const now = new Date().toLocaleString('bg-BG');
      const newHistory = filledRecords.map(r => ({ ...r, _submittedAt: now }));
      setHistoryRecords([...newHistory, ...historyRecords]);
      // Нулираме формата за нови записи
      setRecords([{ id: Date.now(), date: '', quantity: '', oilType: '', nameSignature: '', completed: false }]);
      // Обновяваме localStorage кеш
      localStorage.setItem(`history_${template.id}_${restaurantId}`, JSON.stringify({
        history: [...newHistory, ...historyRecords], employees: savedEmployees, oilTypes: savedOilTypes
      }));
    };

    if (!navigator.onLine) {
      addToPending(sub); onSuccess();
      setAutoSaveStatus('📱 Запазено офлайн');
      setTimeout(() => setAutoSaveStatus(''), 4000);
      setLoading(false); return;
    }

    try {
      const { error } = await supabase.from('checklist_submissions').insert(sub);
      if (error) throw error;
      onSuccess();
      setAutoSaveStatus('✓ Запазено успешно');
      setTimeout(() => setAutoSaveStatus(''), 3000);
      if (getPending().length > 0) syncPending();
    } catch (err) {
      console.error('Submit error:', err);
      addToPending(sub); onSuccess();
      setAutoSaveStatus('⚠ Грешка — запазено офлайн');
      setTimeout(() => setAutoSaveStatus(''), 4000);
    } finally { setLoading(false); }
  };

  const pad = isMobile ? '12px' : '24px';

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
              <p style={{ marginBottom: '20px', color: DS.color.graphiteMed, fontSize: '14px' }}>Какво искате да направите?</p>
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
              {pendingCount > 0 && <span style={{ backgroundColor: DS.color.warning, color: 'white', fontFamily: DS.font, fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '10px' }}>{pendingCount}</span>}
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
              <img src={LOGO_URL} alt="Aladin Foods" style={{ height: isMobile ? '36px' : '48px', width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
              <div>
                <h1 style={{ fontSize: isMobile ? '14px' : '20px', fontWeight: 700, color: DS.color.primary, margin: 0, textTransform: 'uppercase', fontFamily: DS.font, lineHeight: 1.3 }}>
                  ЧЕК ЛИСТ ПОДМЯНА НА МАЗНИНА
                </h1>
                <p style={{ fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteLight, margin: '2px 0 0' }}>ФРИТЮРНИЦИ</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {hasDraft && (
                <button onClick={clearDraft} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', backgroundColor: 'transparent', border: `1.5px solid ${DS.color.danger}`, borderRadius: DS.radius, color: DS.color.danger, cursor: 'pointer', fontFamily: DS.font, fontSize: '12px', fontWeight: 600, minHeight: '40px' }}>
                  <RotateCcw style={{ width: 14, height: 14 }} />{isMobile ? 'Изчисти' : 'Изчисти новите записи'}
                </button>
              )}
              <button onClick={addRecord} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: DS.color.primary, border: 'none', borderRadius: DS.radius, color: 'white', cursor: 'pointer', fontFamily: DS.font, fontSize: '12px', fontWeight: 600, boxShadow: DS.shadow.glow, minHeight: '40px' }}>
                <Plus style={{ width: 14, height: 14 }} />Добави запис
              </button>
            </div>
          </div>

          {/* ─── Нови записи ─── */}
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase' }}>Нови записи</span>
            <span style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.graphiteMuted, backgroundColor: DS.color.pendingBg, padding: '2px 8px', borderRadius: DS.radius }}>{records.length}</span>
          </div>
          <div ref={cardsRef} style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: isMobile ? '10px' : '14px', marginBottom: '24px',
          }}>
            {records.map((rec, i) => (
              <RecordCard key={rec.id} record={rec} index={i}
                onUpdate={updateRecord} onRemove={removeRecord}
                canRemove={records.length > 1}
                savedEmployees={savedEmployees} savedOilTypes={savedOilTypes}
                isMobile={isMobile} />
            ))}
          </div>

          {/* Submit */}
          <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, padding: pad, boxShadow: DS.shadow.md, border: `1px solid ${DS.color.borderLight}`, textAlign: 'center', marginBottom: '32px' }}>
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
              {loading ? 'Запазване...' : 'Запази новите записи'}
            </button>
          </div>

          {/* ─── История (натрупване) ─── */}
          {historyRecords.length > 0 && (
            <>
              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock style={{ width: 14, height: 14, color: DS.color.graphiteMuted }} />
                <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.graphiteMuted, textTransform: 'uppercase' }}>История на записите</span>
                <span style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.graphiteMuted, backgroundColor: DS.color.pendingBg, padding: '2px 8px', borderRadius: DS.radius }}>{historyRecords.length}</span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))',
                gap: isMobile ? '8px' : '10px', marginBottom: '24px',
              }}>
                {historyRecords.map((rec, i) => (
                  <HistoryCard key={`hist-${i}`} record={rec} submittedAt={rec._submittedAt} isMobile={isMobile} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: isMobile ? '16px 12px' : '20px 24px', color: DS.color.graphiteMuted, fontFamily: DS.font, fontSize: '11px', fontWeight: 500, borderTop: `1px solid ${DS.color.borderLight}`, marginTop: 'auto' }}>
          © 2026 Aladin Foods | by MG
        </div>
      </div>
    </>
  );
};

export default OilChangeChecklist;