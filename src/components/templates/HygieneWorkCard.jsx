import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Save, Plus, Trash2, CheckSquare, Square, Building2, Calendar, 
  Users, ClipboardCheck, CheckCircle, RotateCcw, FileText, 
  AlertCircle, ChevronLeft, CheckCheck
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
  const [screen, setScreen] = useState({ w: window.innerWidth });
  useEffect(() => {
    const onResize = () => setScreen({ w: window.innerWidth });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', () => setTimeout(onResize, 100));
    return () => { window.removeEventListener('resize', onResize); window.removeEventListener('orientationchange', onResize); };
  }, []);
  return { isMobile: screen.w < 768, isTablet: screen.w >= 768 && screen.w < 1024 };
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

const FreqBadge = ({ code }) => (
  <span style={{
    fontFamily: DS.font, fontWeight: 700, fontSize: '12px',
    padding: '3px 8px', borderRadius: DS.radius,
    backgroundColor: DS.color.okBg, color: DS.color.primary,
    whiteSpace: 'nowrap',
  }}>{code}</span>
);

const CheckBtn = ({ checked, onClick }) => (
  <button onClick={onClick} style={{
    background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
    color: checked ? DS.color.primary : '#9CA3AF', display: 'flex',
    minWidth: '32px', minHeight: '32px', alignItems: 'center', justifyContent: 'center',
  }}>
    {checked ?
      <CheckSquare style={{ width: 22, height: 22 }} /> :
      <Square style={{ width: 22, height: 22 }} />}
  </button>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const HygieneWorkCard = ({ template, config, department, restaurantId, onBack }) => {
  const { isMobile, isTablet } = useResponsive();

  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [hygieneType, setHygieneType] = useState('Т/ 2С / С / ПН / М');
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [hasDraft, setHasDraft] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [now, setNow] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState('');

  const [defaultZones] = useState([
    { id: '1', name: '1. Зона за подготовка', areas: [
      { name: 'Под,сифони', cleaning: 'Т', washing: 'Т', disinfection: '2С' },
      { name: 'Стени', cleaning: 'Т', washing: 'С', disinfection: 'ПН' },
      { name: 'Врати', cleaning: 'Т', washing: 'Т', disinfection: 'ПН' },
      { name: 'Контактниповърхности', cleaning: 'Т', washing: '2С', disinfection: '2С' }
    ]},
    { id: '2', name: '2. Зона за готов продукт', areas: [
      { name: 'Под,сифони', cleaning: 'Т', washing: 'Т', disinfection: '2С' },
      { name: 'Стени', cleaning: 'Т', washing: 'С', disinfection: 'ПН' },
      { name: 'Врати', cleaning: 'Т', washing: 'Т', disinfection: 'ПН' },
      { name: 'Контактни повърхности', cleaning: 'Т', washing: '2С', disinfection: '2С' }
    ]},
    { id: '3', name: '3. Склад', areas: [
      { name: 'Под,сифони', cleaning: 'Т', washing: 'Т', disinfection: '2С' },
      { name: 'Стени', cleaning: 'Т', washing: 'С', disinfection: 'ПН' },
      { name: 'Врати', cleaning: 'Т', washing: 'Т', disinfection: 'ПН' },
      { name: 'Контактни повърхности', cleaning: 'Т', washing: '2С', disinfection: '2С' }
    ]},
    { id: '4', name: '4. Хладилна камера 1 (0° -4° С) - суровина', areas: [
      { name: 'Под', cleaning: 'Т', washing: 'Т', disinfection: '2С' },
      { name: 'Стени', cleaning: 'Т', washing: 'С', disinfection: 'ПН' },
      { name: 'Врата', cleaning: 'Т', washing: 'Т', disinfection: 'ПН' },
      { name: 'Контактни повърхности и оборудване', cleaning: 'Т', washing: '2С', disinfection: '2С' }
    ]}
  ]);

  const [defaultRefrigerators] = useState([
    { id: '5', name: '5.Хладилник 2 - безалкохолни напитки, айрани', cleaning: 'Т', washing: 'Т', disinfection: 'ПН' },
    { id: '6', name: '6.Хладилник 3 – пица', cleaning: 'Т', washing: 'Т', disinfection: 'ПН' },
    { id: '7', name: '7.Хладилник 4 – дюнер', cleaning: 'Т', washing: 'Т', disinfection: 'ПН' },
    { id: '8', name: '8.Хладилник 5 – заготовки зеленчуци, сосове', cleaning: 'Т', washing: 'Т', disinfection: 'ПН' },
    { id: '9', name: '9.Хладилник 6 – месни продукти', cleaning: 'Т', washing: 'Т', disinfection: 'ПН' },
    { id: '10', name: '10.Хладилник 7 – месни продукти, зеленчуци', cleaning: 'Т', washing: 'Т', disinfection: 'ПН' },
    { id: '11', name: '11. Хладилник 8 – месни продукти, теста', cleaning: 'Т', washing: 'Т', disinfection: 'ПН' }
  ]);

  const [zones, setZones] = useState(defaultZones);
  const [refrigerators, setRefrigerators] = useState(defaultRefrigerators);
  const [customRefrigerators, setCustomRefrigerators] = useState([]);
  const [completionData, setCompletionData] = useState({});
  const [employees, setEmployees] = useState([]);
  const [newEmployeeName, setNewEmployeeName] = useState('');

  const allRefrigerators = [...refrigerators, ...customRefrigerators];

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

  // ─── hasAnyData ───
  const hasAnyData = () => {
    if (hygieneType !== 'Т/ 2С / С / ПН / М' || employees.length > 0) return true;
    if (zones.length > defaultZones.length || customRefrigerators.length > 0) return true;
    if (Object.keys(completionData).length > 0) return true;
    return false;
  };

  // ─── Filter out "Таван" from loaded zones ───
  const filterTavan = (loadedZones) => {
    if (!loadedZones) return loadedZones;
    return loadedZones.map(z => ({
      ...z,
      areas: z.areas ? z.areas.filter(a => !a.name.toLowerCase().includes('таван')) : z.areas
    }));
  };

  // ─── Драфт ───
  useEffect(() => {
    const key = `draft_${template.id}_${currentDate}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setHasDraft(true);
      try {
        const { hygieneType: ht, employees: e, zones: z, refrigerators: r, customRefrigerators: cr, completionData: cd, timestamp } = JSON.parse(saved);
        setHygieneType(ht || 'Т/ 2С / С / ПН / М');
        setEmployees(e || []); setZones(filterTavan(z) || defaultZones);
        if (r) setRefrigerators(r);
        setCustomRefrigerators(cr || []); setCompletionData(cd || {});
        setAutoSaveStatus(`Зареден драфт от ${new Date(timestamp).toLocaleString('bg-BG')}`);
        setTimeout(() => setAutoSaveStatus(''), 5000);
      } catch (e) { console.error('Error loading draft:', e); }
    } else { loadSavedConfig(); }
  }, [template.id, currentDate]);

  const loadSavedConfig = async () => {
    try {
      const localConfig = localStorage.getItem(`config_${template.id}_${restaurantId}`);
      if (localConfig) {
        const { zones: savedZones, refrigerators: savedRef, customRefrigerators: savedCR, employees: savedEmp } = JSON.parse(localConfig);
        if (savedZones) setZones(filterTavan(savedZones));
        if (savedRef) setRefrigerators(savedRef);
        if (savedCR) setCustomRefrigerators(savedCR);
        if (savedEmp) setEmployees(savedEmp);
        return;
      }
    } catch { /* ignore parse errors */ }

    try {
      const { data } = await supabase.from('checklist_submissions').select('data')
        .eq('template_id', template.id).eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false }).limit(1).single();
      if (data?.data) {
        if (data.data.employees) setEmployees(data.data.employees);
        if (data.data.zones) setZones(filterTavan(data.data.zones));
        if (data.data.refrigerators) setRefrigerators(data.data.refrigerators);
        if (data.data.customRefrigerators) setCustomRefrigerators(data.data.customRefrigerators);
        localStorage.setItem(`config_${template.id}_${restaurantId}`, JSON.stringify({
          zones: filterTavan(data.data.zones) || defaultZones,
          refrigerators: data.data.refrigerators || defaultRefrigerators,
          customRefrigerators: data.data.customRefrigerators || [],
          employees: data.data.employees || []
        }));
      }
    } catch { console.log('Няма предишни записи — зареждат се defaults'); }
  };

  useEffect(() => {
    const interval = setInterval(() => saveDraft(), 30000);
    return () => clearInterval(interval);
  }, [hygieneType, employees, zones, refrigerators, customRefrigerators, completionData]);

  const saveDraft = () => {
    if (!hasAnyData()) return;
    localStorage.setItem(`draft_${template.id}_${currentDate}`, JSON.stringify({
      hygieneType, employees, zones, refrigerators, customRefrigerators, completionData, timestamp: Date.now()
    }));
    setHasDraft(true); setAutoSaveStatus('✓ Автоматично запазено');
    setTimeout(() => setAutoSaveStatus(''), 2000);
  };

  const clearDraft = () => {
    if (window.confirm('Сигурни ли сте, че искате да изчистите текущия драфт и да започнете нова работна карта?')) {
      setHygieneType('Т/ 2С / С / ПН / М');
      setCompletionData({});
      localStorage.removeItem(`draft_${template.id}_${currentDate}`);
      setHasDraft(false); setAutoSaveStatus('Драфтът е изчистен.');
      setTimeout(() => setAutoSaveStatus(''), 3000);
    }
  };

  const handleBackClick = () => { hasAnyData() ? setShowExitConfirm(true) : onBack(); };
  const confirmExit = (save) => {
    if (save) { saveDraft(); setAutoSaveStatus('Данните са запазени.'); setTimeout(() => onBack(), 1500); }
    else { onBack(); }
    setShowExitConfirm(false);
  };

  // ─── Employee CRUD ───
  const addEmployee = () => {
    if (newEmployeeName.trim()) {
      setEmployees([...employees, { id: Date.now(), name: newEmployeeName.trim() }]);
      setNewEmployeeName('');
    }
  };
  const removeEmployee = (id) => setEmployees(employees.filter(e => e.id !== id));

  // ─── Zone / Refrigerator CRUD ───
  const addCustomZone = () => {
    setZones([...zones, {
      id: Date.now().toString(), name: `${zones.length + customRefrigerators.length + 1}. Нова зона`,
      areas: [
        { name: 'Под,сифони', cleaning: 'Т', washing: 'Т', disinfection: '2С' },
        { name: 'Стени', cleaning: 'Т', washing: 'С', disinfection: 'ПН' }
      ]
    }]);
  };
  const addCustomRefrigerator = () => {
    setCustomRefrigerators([...customRefrigerators, {
      id: Date.now().toString(), name: `${zones.length + allRefrigerators.length + 1}.Нов хладилник`,
      cleaning: 'Т', washing: 'Т', disinfection: 'ПН'
    }]);
  };
  const removeCustomZone = (id) => setZones(zones.filter(z => !defaultZones.find(dz => dz.id === z.id) && z.id !== id));
  const removeCustomRefrigerator = (id) => setCustomRefrigerators(customRefrigerators.filter(r => r.id !== id));
  const updateZoneName = (zId, n) => setZones(zones.map(z => z.id === zId ? { ...z, name: n } : z));
  const updateRefrigeratorName = (rId, n) => {
    // Check in default refrigerators first
    if (refrigerators.find(r => r.id === rId)) {
      setRefrigerators(refrigerators.map(r => r.id === rId ? { ...r, name: n } : r));
    } else {
      setCustomRefrigerators(customRefrigerators.map(r => r.id === rId ? { ...r, name: n } : r));
    }
  };

  // ─── Completion data ───
  const handleCompletionChange = (itemId, areaName, field, value) => {
    const key = `${itemId}_${areaName || 'main'}_${field}`;
    setCompletionData(prev => ({ ...prev, [key]: value }));
  };
  const isCompleted = (itemId, areaName, field) => completionData[`${itemId}_${areaName || 'main'}_${field}`] || false;
  const getExecutor = (itemId, areaName) => completionData[`${itemId}_${areaName || 'main'}_executor`] || '';
  const setExecutorVal = (itemId, areaName, executor) => {
    setCompletionData(prev => ({ ...prev, [`${itemId}_${areaName || 'main'}_executor`]: executor }));
  };

  // ─── Auto-fill row: маркира всички чекбоксове + задава изпълнител ───
  const autoFillZoneRow = (zoneId, areaName, executor) => {
    setCompletionData(prev => ({
      ...prev,
      [`${zoneId}_${areaName}_cleaning`]: true,
      [`${zoneId}_${areaName}_washing`]: true,
      [`${zoneId}_${areaName}_disinfection`]: true,
      [`${zoneId}_${areaName}_executor`]: executor || prev[`${zoneId}_${areaName}_executor`] || '',
    }));
  };

  const autoFillRefRow = (refId, executor) => {
    setCompletionData(prev => ({
      ...prev,
      [`${refId}_main_cleaning`]: true,
      [`${refId}_main_washing`]: true,
      [`${refId}_main_disinfection`]: true,
      [`${refId}_main_executor`]: executor || prev[`${refId}_main_executor`] || '',
    }));
  };

  // ─── Auto-fill цяла зона ───
  const autoFillZone = (zone, executor) => {
    zone.areas.forEach(area => autoFillZoneRow(zone.id, area.name, executor));
  };

  // ─── Auto-fill всичко ───
  const autoFillAll = (executor) => {
    zones.forEach(zone => autoFillZone(zone, executor));
    allRefrigerators.forEach(ref => autoFillRefRow(ref.id, executor));
  };

  // ─── Submit с offline ───
  const handleSubmit = async () => {
    if (!hasAnyData()) { alert('Моля попълнете поне едно поле.'); return; }
    setLoading(true);
    const sub = {
      template_id: template.id, restaurant_id: restaurantId, department_id: department.id,
      data: { currentDate, hygieneType, employees, zones, refrigerators, customRefrigerators, completionData },
      submission_date: currentDate, synced: true,
    };
    try { const { data: u } = await supabase.auth.getUser(); if (u?.user?.id) sub.submitted_by = u.user.id; } catch {}

    const saveConfigLocally = () => {
      localStorage.setItem(`config_${template.id}_${restaurantId}`, JSON.stringify({
        zones, refrigerators, customRefrigerators, employees
      }));
    };

    const resetForm = () => {
      setHygieneType('Т/ 2С / С / ПН / М');
      setCompletionData({});
      saveConfigLocally();
    };

    if (!navigator.onLine) {
      addToPending(sub); localStorage.removeItem(`draft_${template.id}_${currentDate}`);
      setHasDraft(false); setAutoSaveStatus('📱 Запазено офлайн');
      setTimeout(() => setAutoSaveStatus(''), 4000); resetForm(); setLoading(false); return;
    }
    try {
      const { error } = await supabase.from('checklist_submissions').insert(sub);
      if (error) throw error;
      localStorage.removeItem(`draft_${template.id}_${currentDate}`); setHasDraft(false);
      setAutoSaveStatus('✓ Работната карта е запазена успешно');
      setTimeout(() => setAutoSaveStatus(''), 3000); resetForm();
      if (getPending().length > 0) syncPending();
    } catch (err) {
      console.error('Submit error:', err); addToPending(sub);
      setAutoSaveStatus('⚠ Грешка — запазено офлайн'); setTimeout(() => setAutoSaveStatus(''), 4000); resetForm();
    } finally { setLoading(false); }
  };

  // ─── Table cell style helpers ───
  const thStyle = { padding: '14px 16px', color: 'white', fontWeight: 700, fontFamily: DS.font, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.02em', borderRight: '1px solid rgba(255,255,255,0.15)' };
  const tdStyle = { padding: isMobile ? '10px' : '14px 16px', borderRight: `1px solid ${DS.color.borderLight}`, borderBottom: `1px solid ${DS.color.borderLight}`, fontFamily: DS.font, fontSize: '14px', verticalAlign: 'middle' };
  const cellCenter = { ...tdStyle, textAlign: 'center' };

  const executorSelect = (itemId, areaName) => (
    <select value={getExecutor(itemId, areaName)} onChange={(e) => setExecutorVal(itemId, areaName, e.target.value)}
      style={{
        padding: '8px 10px', border: `1.5px solid ${DS.color.borderLight}`, borderRadius: DS.radius,
        fontFamily: DS.font, fontWeight: 500, color: DS.color.primary, fontSize: '13px',
        backgroundColor: DS.color.surfaceAlt, outline: 'none', cursor: 'pointer',
        WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2395A39D' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', paddingRight: '26px',
        maxWidth: isMobile ? '100%' : '160px', width: '100%',
      }}>
      <option value="">Избери</option>
      {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
    </select>
  );

  const completionCell = (itemId, areaName, field, code) => (
    <td style={cellCenter}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <FreqBadge code={code} />
        <CheckBtn checked={isCompleted(itemId, areaName, field)}
          onClick={() => handleCompletionChange(itemId, areaName, field, !isCompleted(itemId, areaName, field))} />
      </div>
    </td>
  );

  /* Auto-fill button for a single row */
  const autoFillBtn = (onClick, tooltip) => (
    <button onClick={onClick} title={tooltip || 'Попълни всички'}
      style={{
        background: 'none', border: `1.5px solid ${DS.color.borderLight}`, borderRadius: DS.radius,
        cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: DS.color.primaryLight, transition: 'all 150ms ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = DS.color.okBg; e.currentTarget.style.borderColor = DS.color.primary; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = DS.color.borderLight; }}
    >
      <CheckCheck style={{ width: 16, height: 16 }} />
    </button>
  );

  const pad = isMobile ? '12px' : '24px';

  // Check if all rows in a zone are completed
  const isZoneFullyCompleted = (zone) => {
    return zone.areas.every(area =>
      isCompleted(zone.id, area.name, 'cleaning') &&
      isCompleted(zone.id, area.name, 'washing') &&
      isCompleted(zone.id, area.name, 'disinfection')
    );
  };

  const isRefCompleted = (ref) => {
    return isCompleted(ref.id, null, 'cleaning') &&
      isCompleted(ref.id, null, 'washing') &&
      isCompleted(ref.id, null, 'disinfection');
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ minHeight: '100vh', backgroundColor: DS.color.bg, fontFamily: DS.font, color: DS.color.graphite, display: 'flex', flexDirection: 'column' }}>

        {/* ═══════ EXIT MODAL ═══════ */}
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

        {/* ═══════ TOP BAR ═══════ */}
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

        {/* ═══════ MAIN ═══════ */}
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: pad, flex: 1, width: '100%' }}>

          {/* Header */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginBottom: isMobile ? '16px' : '24px', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '14px' }}>
              <img src={LOGO_URL} alt="Aladin Foods" style={{ height: isMobile ? '36px' : '48px', width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <h1 style={{ fontSize: isMobile ? '14px' : '20px', fontWeight: 700, color: DS.color.primary, margin: 0, textTransform: 'uppercase', fontFamily: DS.font, lineHeight: 1.3 }}>
                  РАБОТНА КАРТА ЗА ХИГИЕНИЗИРАНЕ
                </h1>
                <p style={{ fontFamily: DS.font, fontSize: isMobile ? '10px' : '12px', color: DS.color.graphiteLight, fontWeight: 500, margin: '2px 0 0' }}>ПРОИЗВОДСТВЕНИ ПОМЕЩЕНИЯ</p>
              </div>
            </div>
            <div style={{ backgroundColor: DS.color.surface, border: `1px solid ${DS.color.borderLight}`, borderRadius: DS.radius, padding: isMobile ? '8px 12px' : '10px 16px', display: 'flex', gap: isMobile ? '12px' : '16px', boxShadow: DS.shadow.sm, alignSelf: isMobile ? 'flex-start' : 'center' }}>
              {[{ label: 'КОД', value: 'ПРП 3.0.3' }, { label: 'РЕД.', value: '00' }, { label: 'СТР.', value: '1/1' }].map((item, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: DS.font, fontSize: '9px', fontWeight: 600, color: DS.color.graphiteMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{item.label}</div>
                  <div style={{ fontFamily: DS.font, fontSize: '12px', fontWeight: 700, color: DS.color.graphite }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls: Дата + Вид (без Управител) */}
          <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, padding: pad, marginBottom: '16px', boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', alignItems: isMobile ? 'stretch' : 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ padding: '6px', borderRadius: DS.radius, backgroundColor: DS.color.okBg, flexShrink: 0 }}><Calendar style={{ width: 14, height: 14, color: DS.color.primary }} /></div>
              <ControlInput label="Дата" type="date" value={currentDate} onChange={e => setCurrentDate(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
              <div style={{ padding: '6px', borderRadius: DS.radius, backgroundColor: DS.color.okBg, flexShrink: 0 }}><ClipboardCheck style={{ width: 14, height: 14, color: DS.color.primary }} /></div>
              <ControlInput label="Вид хигиенизиране" value={hygieneType} onChange={e => setHygieneType(e.target.value)} />
            </div>
            {hasDraft && (
              <button onClick={clearDraft} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 14px', backgroundColor: 'transparent', border: `1.5px solid ${DS.color.danger}`, borderRadius: DS.radius, color: DS.color.danger, cursor: 'pointer', fontFamily: DS.font, fontSize: '12px', fontWeight: 600, minHeight: '40px', whiteSpace: 'nowrap' }}>
                <RotateCcw style={{ width: 14, height: 14 }} />{isMobile ? 'Нова' : 'Нова работна карта'}
              </button>
            )}
          </div>

          {/* Служители */}
          <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, padding: pad, marginBottom: '16px', boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Users style={{ width: 16, height: 16, color: DS.color.primary }} />
              <span style={{ fontFamily: DS.font, fontSize: '14px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase' }}>Служители</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: employees.length ? '12px' : 0 }}>
              <input type="text" value={newEmployeeName} onChange={e => setNewEmployeeName(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addEmployee()} placeholder="Име и фамилия"
                style={{ ...inputBase(false), flex: 1 }} />
              <button onClick={addEmployee} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: DS.color.primary, border: 'none', borderRadius: DS.radius, color: 'white', cursor: 'pointer', fontFamily: DS.font, fontSize: '12px', fontWeight: 600, minHeight: '40px' }}>
                <Plus style={{ width: 14, height: 14 }} />Добави
              </button>
            </div>
            {employees.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {employees.map(emp => (
                  <div key={emp.id} style={{ padding: '8px 14px', borderRadius: DS.radius, backgroundColor: DS.color.okBg, display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${DS.color.borderLight}` }}>
                    <span style={{ fontFamily: DS.font, fontWeight: 600, color: DS.color.primary, fontSize: '13px' }}>{emp.name}</span>
                    <button onClick={() => removeEmployee(emp.id)} style={{ background: 'none', border: 'none', color: DS.color.danger, cursor: 'pointer', padding: '2px', display: 'flex' }}>
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Легенда */}
          <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, padding: pad, marginBottom: '16px', boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}` }}>
            <span style={{ fontFamily: DS.font, fontSize: '12px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', marginBottom: '10px', display: 'block' }}>Обозначения</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {[['Т', 'текущо'], ['2С', 'два пъти на смяна'], ['С', 'еженеседмично'], ['ПН', 'при необходимост'], ['М', 'ежемесечно']].map(([code, desc]) => (
                <div key={code} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FreqBadge code={code} />
                  <span style={{ fontFamily: DS.font, fontSize: '13px', color: DS.color.graphiteMed }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ═══════ AUTO-FILL ALL BUTTON ═══════ */}
          {employees.length > 0 && (
            <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, padding: isMobile ? '12px' : '16px 24px', marginBottom: '16px', boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCheck style={{ width: 18, height: 18, color: DS.color.primary }} />
                <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase' }}>Бързо попълване</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
                {employees.map(emp => (
                  <button key={emp.id} onClick={() => autoFillAll(emp.name)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 14px', backgroundColor: DS.color.okBg,
                      border: `1.5px solid ${DS.color.primary}`, borderRadius: DS.radius,
                      color: DS.color.primary, cursor: 'pointer', fontFamily: DS.font,
                      fontSize: '12px', fontWeight: 600, minHeight: '36px',
                    }}>
                    <CheckCheck style={{ width: 14, height: 14 }} />
                    Всичко → {emp.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══════ MAIN TABLE ═══════ */}
          <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.md, overflow: 'hidden', marginBottom: '16px', border: `1px solid ${DS.color.borderLight}` }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: DS.color.primary }}>
                    <th style={{ ...thStyle, textAlign: 'left', minWidth: '200px' }}>Помещение/обект</th>
                    <th style={{ ...thStyle, textAlign: 'center', minWidth: '130px' }}>Почистване</th>
                    <th style={{ ...thStyle, textAlign: 'center', minWidth: '130px' }}>Измиване</th>
                    <th style={{ ...thStyle, textAlign: 'center', minWidth: '130px' }}>Дезинфекция</th>
                    <th style={{ ...thStyle, textAlign: 'center', minWidth: '160px' }}>Извършил</th>
                    <th style={{ ...thStyle, textAlign: 'center', minWidth: '50px', borderRight: 'none' }}>✓</th>
                  </tr>
                </thead>
                <tbody>
                  {zones.map(zone => (
                    <React.Fragment key={zone.id}>
                      {/* Zone header */}
                      <tr style={{ backgroundColor: DS.color.cardHeader }}>
                        <td colSpan="5" style={{ padding: '12px 16px', borderBottom: `1px solid ${DS.color.borderLight}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input type="text" value={zone.name} onChange={e => updateZoneName(zone.id, e.target.value)}
                              style={{ flex: 1, padding: '8px 12px', borderRadius: DS.radius, fontFamily: DS.font, fontSize: '14px', fontWeight: 700, color: DS.color.primary, border: `1.5px solid ${DS.color.borderLight}`, backgroundColor: DS.color.surface, outline: 'none' }} />
                            {!defaultZones.find(dz => dz.id === zone.id) && (
                              <button onClick={() => removeCustomZone(zone.id)} style={{ background: 'none', border: 'none', color: DS.color.danger, cursor: 'pointer', padding: '4px', display: 'flex' }}>
                                <Trash2 style={{ width: 16, height: 16 }} />
                              </button>
                            )}
                          </div>
                        </td>
                        {/* Auto-fill zone button */}
                        <td style={{ padding: '12px 8px', borderBottom: `1px solid ${DS.color.borderLight}`, textAlign: 'center' }}>
                          {employees.length > 0 && (
                            <button onClick={() => autoFillZone(zone, employees[0]?.name || '')}
                              title={`Попълни цялата зона (${employees[0]?.name || ''})`}
                              style={{
                                background: isZoneFullyCompleted(zone) ? DS.color.okBg : 'none',
                                border: `1.5px solid ${isZoneFullyCompleted(zone) ? DS.color.ok : DS.color.borderLight}`,
                                borderRadius: DS.radius, cursor: 'pointer', padding: '6px 8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: isZoneFullyCompleted(zone) ? DS.color.ok : DS.color.primaryLight,
                              }}>
                              <CheckCheck style={{ width: 16, height: 16 }} />
                            </button>
                          )}
                        </td>
                      </tr>
                      {/* Zone areas */}
                      {zone.areas.map((area, ai) => (
                        <tr key={ai} style={{ backgroundColor: ai % 2 === 0 ? DS.color.surface : DS.color.surfaceAlt }}>
                          <td style={{ ...tdStyle, fontWeight: 500, color: DS.color.primary, paddingLeft: '28px' }}>{area.name}</td>
                          {completionCell(zone.id, area.name, 'cleaning', area.cleaning)}
                          {completionCell(zone.id, area.name, 'washing', area.washing)}
                          {completionCell(zone.id, area.name, 'disinfection', area.disinfection)}
                          <td style={cellCenter}>{executorSelect(zone.id, area.name)}</td>
                          <td style={{ ...cellCenter, borderRight: 'none' }}>
                            {employees.length > 0 && autoFillBtn(
                              () => autoFillZoneRow(zone.id, area.name, getExecutor(zone.id, area.name) || employees[0]?.name || ''),
                              'Попълни ред'
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}

                  {/* Refrigerators */}
                  {allRefrigerators.map((ref, ri) => (
                    <tr key={ref.id} style={{ backgroundColor: ri % 2 === 0 ? DS.color.surface : DS.color.surfaceAlt }}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input type="text" value={ref.name}
                            onChange={e => updateRefrigeratorName(ref.id, e.target.value)}
                            style={{ flex: 1, padding: '6px 10px', borderRadius: DS.radius, fontFamily: DS.font, fontSize: '14px', fontWeight: 500, color: DS.color.primary, border: `1.5px solid ${DS.color.borderLight}`, backgroundColor: DS.color.surface, outline: 'none' }} />
                          {customRefrigerators.find(cr => cr.id === ref.id) && (
                            <button onClick={() => removeCustomRefrigerator(ref.id)} style={{ background: 'none', border: 'none', color: DS.color.danger, cursor: 'pointer', padding: '4px', display: 'flex' }}>
                              <Trash2 style={{ width: 14, height: 14 }} />
                            </button>
                          )}
                        </div>
                      </td>
                      {completionCell(ref.id, null, 'cleaning', ref.cleaning)}
                      {completionCell(ref.id, null, 'washing', ref.washing)}
                      {completionCell(ref.id, null, 'disinfection', ref.disinfection)}
                      <td style={cellCenter}>{executorSelect(ref.id, null)}</td>
                      <td style={{ ...cellCenter, borderRight: 'none' }}>
                        {employees.length > 0 && autoFillBtn(
                          () => autoFillRefRow(ref.id, getExecutor(ref.id, null) || employees[0]?.name || ''),
                          'Попълни ред'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add zone / refrigerator */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: isMobile ? '16px' : '24px', flexWrap: 'wrap' }}>
            <button onClick={addCustomZone} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: DS.color.primary, border: 'none', borderRadius: DS.radius, color: 'white', cursor: 'pointer', fontFamily: DS.font, fontSize: '12px', fontWeight: 600, minHeight: '40px' }}>
              <Plus style={{ width: 14, height: 14 }} />Добави зона
            </button>
            <button onClick={addCustomRefrigerator} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: DS.color.primary, border: 'none', borderRadius: DS.radius, color: 'white', cursor: 'pointer', fontFamily: DS.font, fontSize: '12px', fontWeight: 600, minHeight: '40px' }}>
              <Plus style={{ width: 14, height: 14 }} />Добави хладилник
            </button>
          </div>

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
              {loading ? 'Запазване...' : (isMobile ? 'Запази' : 'Запази работна карта и започни нова')}
            </button>
            <p style={{ marginTop: '10px', fontSize: '13px', color: DS.color.graphiteLight }}>След запазване формата се изчиства за нова карта</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: isMobile ? '16px 12px' : '20px 24px', color: DS.color.graphiteMuted, fontFamily: DS.font, fontSize: '11px', fontWeight: 500, borderTop: `1px solid ${DS.color.borderLight}`, marginTop: 'auto' }}>
          © 2026 Aladin Foods | by MG
        </div>
      </div>
    </>
  );
};

export default HygieneWorkCard;