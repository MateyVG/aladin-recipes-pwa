import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

/* ═══ DESIGN SYSTEM ═══ */
const DS = {
  color: {
    bg: '#ECEEED', surface: '#FFFFFF', surfaceAlt: '#F7F9F8',
    primary: '#1B5E37', primaryLight: '#2D7A4F', primaryGlow: 'rgba(27,94,55,0.08)',
    cardHeader: '#E8F5EE',
    graphite: '#1E2A26', graphiteMed: '#3D4F48', graphiteLight: '#6B7D76', graphiteMuted: '#95A39D',
    ok: '#1B8A50', okBg: '#E8F5EE', warning: '#C47F17', warningBg: '#FFFBEB',
    danger: '#C53030', dangerBg: '#FEF2F2', info: '#2563EB', infoBg: '#EFF6FF',
    border: '#D5DDD9', borderLight: '#E4EBE7',
  },
  font: "'DM Sans', system-ui, sans-serif",
  radius: '0px',
  shadow: { sm: '0 1px 3px rgba(30,42,38,0.06),0 1px 2px rgba(30,42,38,0.04)' },
};
const LOGO = 'https://aladinfoods.bg/assets/images/aladinfoods_logo.png';
const DSS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');*,*::before,*::after{box-sizing:border-box}body{margin:0;background:${DS.color.bg}}@keyframes cf{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@media(max-width:767px){input,button,select,textarea{font-size:16px!important}}`;

/* ═══ DS INLINE ICONS ═══ */
const Ic = ({ n, sz = 16, c = 'currentColor', style: s }) => {
  const d = {
    back: <path d="M15 18l-6-6 6-6" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" fill="none" stroke={c} strokeWidth="2"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" fill="none" stroke={c} strokeWidth="2"/></>,
    save: <><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/><polyline points="17 21 17 13 7 13 7 21" fill="none" stroke={c} strokeWidth="2"/><polyline points="7 3 7 8 15 8" fill="none" stroke={c} strokeWidth="2"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    history: <><circle cx="12" cy="12" r="10" fill="none" stroke={c} strokeWidth="2"/><polyline points="12 6 12 12 16 14" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="none" stroke={c} strokeWidth="2"/><line x1="12" y1="9" x2="12" y2="13" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
  };
  return <svg width={sz} height={sz} viewBox="0 0 24 24" style={{ flexShrink: 0, display: 'block', ...s }}>{d[n]}</svg>;
};
const useR = () => { const [w, sW] = useState(window.innerWidth); useEffect(() => { const h = () => sW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h) }, []); return w < 768; };

/* table styling helpers */
const TH = { padding: '10px', border: `1px solid ${DS.color.borderLight}`, textAlign: 'center', fontSize: '10px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.04em' };
const THR = { backgroundColor: DS.color.cardHeader };
const TD = { padding: '8px', border: `1px solid ${DS.color.borderLight}`, fontFamily: DS.font, fontSize: '12px' };
const ZEBRA = (i) => ({ backgroundColor: i % 2 === 0 ? DS.color.surface : DS.color.surfaceAlt });
const TBDR = `1px solid ${DS.color.borderLight}`;


const ImprovedSubmissionDetail = ({ submission: initialSubmission, onBack }) => {
  const mob = useR();
  const pad = mob ? '12px' : '20px';

  // === ALL STATE — UNCHANGED ===
  const [editMode, setEditMode] = useState(false);
  const [submission, setSubmission] = useState(initialSubmission);
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editedData, setEditedData] = useState(null);

  const data = (editMode && editedData) ? editedData : (submission.data || {});
  const config = submission.checklist_templates?.config || {};
  const cType = submission.checklist_type || submission.checklist_templates?.component_name || '';

  // === EDIT HELPERS — ALL UNCHANGED ===
  useEffect(() => { loadCorrectionsHistory(); }, [submission.id]);

  const loadCorrectionsHistory = async () => {
    try {
      const { data: corrData, error } = await supabase
        .from('checklist_corrections_view').select('*')
        .eq('submission_id', submission.id)
        .order('corrected_at', { ascending: false });
      if (error) throw error;
      setCorrections(corrData || []);
    } catch (error) { console.error('Error loading corrections:', error); }
  };

  const deepSet = (obj, path, value) => {
    const clone = JSON.parse(JSON.stringify(obj));
    const parts = path.split('.');
    let current = clone;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = isNaN(parts[i]) ? parts[i] : Number(parts[i]);
      if (current[key] === undefined) current[key] = {};
      current = current[key];
    }
    const lastKey = isNaN(parts[parts.length - 1]) ? parts[parts.length - 1] : Number(parts[parts.length - 1]);
    current[lastKey] = value;
    return clone;
  };

  const editedDataRef = useRef(null);

  const updateField = useCallback((path, value) => {
    setEditedData(prev => {
      const updated = deepSet(prev, path, value);
      editedDataRef.current = updated;
      return updated;
    });
  }, []);

  // === EC (EditableCell) — LOGIC UNCHANGED, only input styling updated ===
  const EC = ({ path, style, children }) => {
    const deepGetVal = (obj, p) => {
      const parts = p.split('.');
      let cur = obj;
      for (const part of parts) { const k = isNaN(part) ? part : Number(part); cur = cur?.[k]; }
      return cur;
    };
    const initialVal = editMode ? (deepGetVal(editedData, path) ?? '') : '';
    const [localVal, setLocalVal] = useState(String(initialVal));
    const inputRef = useRef(null);
    useEffect(() => {
      if (editMode && editedData) { setLocalVal(String(deepGetVal(editedData, path) ?? '')); }
    }, [editMode]);

    if (!editMode) return <td style={style}>{children}</td>;

    return (
      <td style={{ ...style, padding: '0' }}>
        <input ref={inputRef} type="text" value={localVal}
          onChange={(e) => setLocalVal(e.target.value)}
          onBlur={() => updateField(path, localVal)}
          onKeyDown={(e) => { if (e.key === 'Enter') { updateField(path, localVal); inputRef.current?.blur(); } }}
          style={{
            width: '100%', padding: '8px', border: `1.5px solid ${DS.color.info}`,
            borderRadius: DS.radius, backgroundColor: DS.color.infoBg, fontSize: 'inherit',
            fontFamily: DS.font, textAlign: style?.textAlign || 'left',
            boxSizing: 'border-box', outline: 'none', color: DS.color.graphite,
          }}
          onFocus={(e) => { e.target.style.backgroundColor = '#dbeafe'; e.target.style.borderColor = DS.color.info; }}
        />
      </td>
    );
  };

  // === findAllChanges — UNCHANGED ===
  const findAllChanges = (oldObj, newObj, prefix = '') => {
    const changes = [];
    const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);
    for (const key of allKeys) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      const oldVal = oldObj?.[key]; const newVal = newObj?.[key];
      if (typeof oldVal === 'object' && oldVal !== null && !Array.isArray(oldVal) && typeof newVal === 'object' && newVal !== null && !Array.isArray(newVal)) {
        changes.push(...findAllChanges(oldVal, newVal, fullPath));
      } else if (Array.isArray(oldVal) && Array.isArray(newVal)) {
        const maxLen = Math.max(oldVal.length, newVal.length);
        for (let i = 0; i < maxLen; i++) {
          if (typeof oldVal[i] === 'object' && typeof newVal[i] === 'object') { changes.push(...findAllChanges(oldVal[i] || {}, newVal[i] || {}, `${fullPath}.${i}`)); }
          else if (JSON.stringify(oldVal[i]) !== JSON.stringify(newVal[i])) { changes.push({ field: `${fullPath}.${i}`, oldValue: JSON.stringify(oldVal[i]), newValue: JSON.stringify(newVal[i]) }); }
        }
      } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({ field: fullPath, oldValue: JSON.stringify(oldVal), newValue: JSON.stringify(newVal) });
      }
    }
    return changes;
  };

  // === handleSave — UNCHANGED ===
  const handleSave = async () => {
    const latestData = editedDataRef.current || editedData;
    if (!latestData) { setEditMode(false); return; }
    const changes = findAllChanges(submission.data || {}, latestData);
    if (changes.length === 0) { alert('Няма направени промени'); setEditMode(false); setEditedData(null); return; }
    if (!window.confirm(`Сигурни ли сте? Ще запазите ${changes.length} промени.`)) return;
    setLoading(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      const { error: updateError } = await supabase.from('checklist_submissions').update({ data: latestData, last_corrected_at: new Date().toISOString(), last_corrected_by: user.id }).eq('id', submission.id);
      if (updateError) throw updateError;
      const correctionsToInsert = changes.map(c => ({ submission_id: submission.id, corrected_by: user.id, field_name: c.field, old_value: c.oldValue, new_value: c.newValue, notes: 'Ръчна корекция' }));
      const { error: corrError } = await supabase.from('checklist_corrections').insert(correctionsToInsert);
      if (corrError) throw corrError;
      setSubmission({ ...submission, data: latestData });
      setEditMode(false); setEditedData(null);
      loadCorrectionsHistory();
      alert(`Успешно запазени ${changes.length} промени!`);
    } catch (error) { console.error('Error saving:', error); alert('Грешка при запазване: ' + error.message); }
    finally { setLoading(false); }
  };

  const handleCancel = () => { if (window.confirm('Сигурни ли сте? Всички промени ще бъдат загубени.')) { setEditMode(false); setEditedData(null); } };
  const startEdit = () => { const copy = JSON.parse(JSON.stringify(submission.data || {})); editedDataRef.current = copy; setEditedData(copy); setEditMode(true); };
  const formatCorrectionDate = (dateString) => { if (!dateString) return '-'; return new Date(dateString).toLocaleString('bg-BG', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); };

  console.log('=== SUBMISSION DEBUG ===');
  console.log('Template name:', submission.checklist_templates?.name);
  console.log('Full data object:', data);
  console.log('Data keys:', Object.keys(data));
  if (data.dateBlocks) { console.log('dateBlocks:', data.dateBlocks); data.dateBlocks.forEach((block, idx) => { console.log(`Block ${idx}:`, block); console.log(`Block ${idx} readings:`, block.readings); }); }
  console.log('========================');


  // ═══ SECTION HEADER helper ═══
  const SecH = ({ title }) => <h3 style={{ margin: '0 0 12px', fontFamily: DS.font, fontSize: '15px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{title}</h3>;
  const InfoBox = ({ children }) => <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: DS.color.okBg, border: `1px solid ${DS.color.ok}33`, fontFamily: DS.font, fontSize: '13px', color: DS.color.graphiteMed }}>{children}</div>;

  // ============================================
  // 🍕 PIZZA TEMPERATURE TABLE — logic UNCHANGED
  // ============================================
  const renderPizzaTable = () => {
    const pizzaTypes = config.pizza_types || [];
    const timeSlots = config.time_slots || [];
    if (pizzaTypes.length === 0) return null;
    const temperatures = data.temperatures || {};
    const pizzaCounts = data.pizzaCounts || {};

    return (
      <div style={{ marginTop: '24px' }}>
        <SecH title="Контрол на температура на пици" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: TBDR, fontFamily: DS.font, fontSize: '10px' }}>
            <thead><tr style={THR}>
              <th style={{ ...TH, minWidth: '150px', textAlign: 'left' }}>ВИД ПИЦА</th>
              <th style={{ ...TH, minWidth: '60px' }}>ОБЩО БР.</th>
              {timeSlots.map((slot, idx) => <th key={idx} style={{ ...TH, minWidth: '70px', fontSize: '9px' }}>{slot}</th>)}
            </tr></thead>
            <tbody>
              {pizzaTypes.map((pizza, pizzaIdx) => {
                const counts = pizzaCounts[pizza] || {};
                const total = Object.values(counts).reduce((sum, val) => sum + (isNaN(Number(val)) ? 0 : Number(val)), 0);
                return (
                  <React.Fragment key={pizzaIdx}>
                    <tr style={ZEBRA(pizzaIdx)}>
                      <td style={{ ...TD, fontWeight: 700 }}>{pizza}<div style={{ fontSize: '9px', color: DS.color.graphiteMuted, fontWeight: 400 }}>Температура °C</div></td>
                      <td style={{ ...TD, textAlign: 'center', fontWeight: 700, color: DS.color.primary }}>{total || '-'}</td>
                      {timeSlots.map((slot, slotIdx) => {
                        const temp = temperatures[pizza]?.[slot]; const numTemp = Number(temp);
                        let bgColor = DS.color.surface;
                        if (temp && !isNaN(numTemp)) { if (numTemp < 85 || numTemp > 95) bgColor = '#fecaca'; else if (numTemp >= 85 && numTemp < 88) bgColor = '#fed7aa'; else if (numTemp >= 88 && numTemp <= 92) bgColor = '#86efac'; else if (numTemp > 92 && numTemp <= 95) bgColor = '#fde047'; }
                        return <EC key={slotIdx} path={`temperatures.${pizza}.${slot}`} style={{ ...TD, textAlign: 'center', backgroundColor: bgColor, fontWeight: temp ? 700 : 400 }}>{temp || '-'}</EC>;
                      })}
                    </tr>
                    <tr style={{ backgroundColor: pizzaIdx % 2 === 0 ? DS.color.surfaceAlt : DS.color.borderLight }}>
                      <td style={{ ...TD, fontSize: '9px', color: DS.color.graphiteMuted, fontStyle: 'italic' }}>Брой пици</td>
                      <td style={TD}></td>
                      {timeSlots.map((slot, slotIdx) => <EC key={slotIdx} path={`pizzaCounts.${pizza}.${slot}`} style={{ ...TD, textAlign: 'center', fontSize: '9px' }}>{pizzaCounts[pizza]?.[slot] || '-'}</EC>)}
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '12px', padding: '10px', backgroundColor: DS.color.infoBg, fontFamily: DS.font, fontSize: '11px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <strong>Легенда:</strong>
          <span style={{ padding: '2px 8px', backgroundColor: '#fecaca' }}>{'< 85°C / > 95°C'}</span>
          <span style={{ padding: '2px 8px', backgroundColor: '#fed7aa' }}>85-87°C</span>
          <span style={{ padding: '2px 8px', backgroundColor: '#86efac' }}>88-92°C (Оптимално)</span>
          <span style={{ padding: '2px 8px', backgroundColor: '#fde047' }}>93-95°C</span>
        </div>
      </div>
    );
  };

  // ============================================
  // 🐔 CHICKEN PRODUCTION — logic UNCHANGED
  // ============================================
  const renderChickenProduction = () => {
    if (!data.productions) return null;
    const productions = data.productions;
    const hasSections = !Array.isArray(productions) && typeof productions === 'object' && (productions.file || productions.bonFile || productions.wings || productions.rice);
    if (!hasSections) return null;
    const sectionNames = { 'file': 'Филе', 'bonFile': 'Бон Филе', 'wings': 'Крилца', 'rice': 'Ориз' };
    const sections = Object.keys(productions).filter(key => Array.isArray(productions[key]));

    return (
      <div style={{ marginTop: '24px' }}>
        {data.currentDate && <InfoBox><strong>Дата:</strong> {new Date(data.currentDate).toLocaleDateString('bg-BG')}{data.manager && <span style={{ marginLeft: '24px' }}><strong>Управител:</strong> {data.manager}</span>}</InfoBox>}
        {sections.map((section, idx) => {
          const sectionData = productions[section];
          if (!sectionData || sectionData.length === 0) return null;
          const filledData = sectionData.filter(item => item.count || item.quantity || item.batchL || item.cookingTime || item.displayTime || item.defect || item.employeeName);
          if (filledData.length === 0) return null;
          return (
            <div key={idx} style={{ marginBottom: '24px' }}>
              <SecH title={sectionNames[section] || section} />
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: TBDR, fontFamily: DS.font, fontSize: '12px' }}>
                  <thead><tr style={THR}>
                    <th style={TH}>№</th>
                    <th style={TH}>{section === 'rice' ? 'Количество' : 'Брой/Кол-во'}</th>
                    <th style={TH}>Партида</th>
                    {section !== 'rice' && <th style={TH}>Пържене (мин)</th>}
                    {section !== 'rice' && <th style={TH}>Температура</th>}
                    <th style={TH}>Час готвене</th>
                    <th style={TH}>Час витрина</th>
                    <th style={{ ...TH, textAlign: 'left' }}>Дефект</th>
                    <th style={{ ...TH, textAlign: 'left' }}>Служител</th>
                  </tr></thead>
                  <tbody>
                    {filledData.map((item, itemIdx) => {
                      const origIdx = sectionData.indexOf(item); const ri = origIdx >= 0 ? origIdx : itemIdx;
                      return (
                        <tr key={itemIdx} style={ZEBRA(itemIdx)}>
                          <td style={{ ...TD, textAlign: 'center', fontWeight: 700 }}>{item.number || itemIdx + 1}</td>
                          <EC path={`productions.${section}.${ri}.count`} style={{ ...TD, textAlign: 'center' }}>{item.count || item.quantity || '-'}</EC>
                          <EC path={`productions.${section}.${ri}.batchL`} style={{ ...TD, textAlign: 'center' }}>{item.batchL || '-'}</EC>
                          {section !== 'rice' && <EC path={`productions.${section}.${ri}.fryDuration`} style={{ ...TD, textAlign: 'center' }}>{item.fryDuration || '-'}</EC>}
                          {section !== 'rice' && <EC path={`productions.${section}.${ri}.fryTemperature`} style={{ ...TD, textAlign: 'center' }}>{item.fryTemperature || '-'}</EC>}
                          <EC path={`productions.${section}.${ri}.cookingTime`} style={{ ...TD, textAlign: 'center' }}>{item.cookingTime || '-'}</EC>
                          <EC path={`productions.${section}.${ri}.displayTime`} style={{ ...TD, textAlign: 'center' }}>{item.displayTime || '-'}</EC>
                          <EC path={`productions.${section}.${ri}.defect`} style={TD}>{item.defect || '-'}</EC>
                          <EC path={`productions.${section}.${ri}.employeeName`} style={TD}>{item.employeeName || '-'}</EC>
                        </tr>);
                    })}
                  </tbody>
                </table>
              </div>
            </div>);
        })}
      </div>);
  };

  // ============================================
  // 🥙 DONER — logic UNCHANGED
  // ============================================
  const renderDonerProduction = () => {
    if (!data.productions || !Array.isArray(data.productions)) return null;
    const isDoner = data.productions.some(p => p.deliveryDateTime !== undefined || p.weight !== undefined || p.finishDateTime !== undefined);
    if (!isDoner) return null;
    const filledData = data.productions.filter(item => item.deliveryDateTime || item.weight || item.usedBefore || item.batchNumber || item.finishDateTime || item.employeeName);
    if (filledData.length === 0) return null;
    return (
      <div style={{ marginTop: '24px' }}>
        {data.currentDate && <InfoBox><strong>Дата:</strong> {new Date(data.currentDate).toLocaleDateString('bg-BG')}{data.manager && <span style={{ marginLeft: '24px' }}><strong>Управител:</strong> {data.manager}</span>}</InfoBox>}
        <SecH title="Производствен лист Дюнер" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: TBDR, fontFamily: DS.font, fontSize: '12px' }}>
            <thead><tr style={THR}>
              <th style={TH}>№</th><th style={TH}>Дата/час доставка</th><th style={TH}>Тегло (кг)</th><th style={TH}>Използва се до</th><th style={TH}>Партида №</th><th style={TH}>Дата/час приключване</th><th style={{ ...TH, textAlign: 'left' }}>Служител</th>
            </tr></thead>
            <tbody>
              {filledData.map((item, idx) => { const origIdx = (data.productions || []).indexOf(item); const ri = origIdx >= 0 ? origIdx : idx;
                return (<tr key={idx} style={ZEBRA(idx)}>
                  <td style={{ ...TD, textAlign: 'center', fontWeight: 700 }}>{item.number || idx + 1}</td>
                  <EC path={`productions.${ri}.deliveryDateTime`} style={{ ...TD, textAlign: 'center' }}>{item.deliveryDateTime || '-'}</EC>
                  <EC path={`productions.${ri}.weight`} style={{ ...TD, textAlign: 'center' }}>{item.weight || '-'}</EC>
                  <EC path={`productions.${ri}.usedBefore`} style={{ ...TD, textAlign: 'center' }}>{item.usedBefore || '-'}</EC>
                  <EC path={`productions.${ri}.batchNumber`} style={{ ...TD, textAlign: 'center' }}>{item.batchNumber || '-'}</EC>
                  <EC path={`productions.${ri}.finishDateTime`} style={{ ...TD, textAlign: 'center' }}>{item.finishDateTime || '-'}</EC>
                  <EC path={`productions.${ri}.employeeName`} style={TD}>{item.employeeName || '-'}</EC>
                </tr>); })}
            </tbody>
          </table>
        </div>
      </div>);
  };

  // ============================================
  // 🍖 MEATBALL — logic UNCHANGED
  // ============================================
  const renderMeatballProduction = () => {
    if (!data.productions || !Array.isArray(data.productions)) return null;
    const isMeatball = data.productions.some(p => (p.dateTime !== undefined || p.type !== undefined) && !p.deliveryDateTime && !p.weight);
    if (!isMeatball) return null;
    const filledData = data.productions.filter(item => item.dateTime || item.type || item.quantity || item.batchL || item.employeeName);
    if (filledData.length === 0) return null;
    return (
      <div style={{ marginTop: '24px' }}>
        {data.currentDate && <InfoBox><strong>Дата:</strong> {new Date(data.currentDate).toLocaleDateString('bg-BG')}{data.manager && <span style={{ marginLeft: '24px' }}><strong>Управител:</strong> {data.manager}</span>}</InfoBox>}
        <SecH title="Производствен лист за пилешко кюфте" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: TBDR, fontFamily: DS.font, fontSize: '12px' }}>
            <thead><tr style={THR}>
              <th style={TH}>№</th><th style={TH}>Дата/час</th><th style={{ ...TH, textAlign: 'left' }}>Тип</th><th style={TH}>Количество</th><th style={TH}>Партида</th><th style={{ ...TH, textAlign: 'left' }}>Служител</th>
            </tr></thead>
            <tbody>
              {filledData.map((item, idx) => { const origIdx = (data.productions || []).indexOf(item); const ri = origIdx >= 0 ? origIdx : idx;
                return (<tr key={idx} style={ZEBRA(idx)}>
                  <td style={{ ...TD, textAlign: 'center', fontWeight: 700 }}>{item.number || idx + 1}</td>
                  <EC path={`productions.${ri}.dateTime`} style={{ ...TD, textAlign: 'center' }}>{item.dateTime || '-'}</EC>
                  <EC path={`productions.${ri}.type`} style={TD}>{item.type || '-'}</EC>
                  <EC path={`productions.${ri}.quantity`} style={{ ...TD, textAlign: 'center' }}>{item.quantity || '-'}</EC>
                  <EC path={`productions.${ri}.batchL`} style={{ ...TD, textAlign: 'center' }}>{item.batchL || '-'}</EC>
                  <EC path={`productions.${ri}.employeeName`} style={TD}>{item.employeeName || '-'}</EC>
                </tr>); })}
            </tbody>
          </table>
        </div>
      </div>);
  };


  // ============================================
  // 🍽️ PORTION AND DEFECT — logic UNCHANGED
  // ============================================
  const renderPortionAndDefect = () => {
    if (!data.summary) return null;
    const summary = data.summary; const totals = data.totals || {};
    const allConsumption = (summary.allConsumption || []).filter(item => item.name && item.name.trim() !== '');
    const allDefective = (summary.allDefective || []).filter(item => item.name && item.name.trim() !== '');
    return (
      <div style={{ marginTop: '24px' }}>
        <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
          {data.date && <InfoBox><strong>Дата:</strong> {new Date(data.date).toLocaleDateString('bg-BG')}</InfoBox>}
          {data.shift && <InfoBox><strong>Смяна:</strong> {data.shift}</InfoBox>}
          {data.manager && <InfoBox><strong>Управител:</strong> {data.manager}</InfoBox>}
          {totals.inventory && <div style={{ padding: '12px', backgroundColor: DS.color.warningBg, border: `1px solid ${DS.color.warning}33`, fontFamily: DS.font, fontSize: '13px' }}><strong>Обща стойност:</strong> {totals.inventory} лв.</div>}
        </div>
        {allConsumption.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <SecH title="Консумация (Персонална храна)" />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: TBDR, fontFamily: DS.font, fontSize: '13px' }}>
                <thead><tr style={THR}><th style={{ ...TH, textAlign: 'left' }}>№</th><th style={{ ...TH, textAlign: 'left' }}>Наименование</th><th style={TH}>Брой порции</th><th style={{ ...TH, textAlign: 'right' }}>Цена (лв)</th><th style={{ ...TH, textAlign: 'left' }}>Служител</th></tr></thead>
                <tbody>{allConsumption.map((item, idx) => { const origIdx = (summary.allConsumption || []).indexOf(item); const ri = origIdx >= 0 ? origIdx : idx;
                  return (<tr key={idx} style={ZEBRA(idx)}>
                    <td style={{ ...TD, textAlign: 'center', fontWeight: 700 }}>{idx + 1}</td>
                    <EC path={`summary.allConsumption.${ri}.name`} style={TD}>{item.name || '-'}</EC>
                    <EC path={`summary.allConsumption.${ri}.portion`} style={{ ...TD, textAlign: 'center' }}>{item.portion || '-'}</EC>
                    <EC path={`summary.allConsumption.${ri}.price`} style={{ ...TD, textAlign: 'right' }}>{item.price || '-'}</EC>
                    <EC path={`summary.allConsumption.${ri}.employeeName`} style={TD}>{item.employeeName || '-'}</EC>
                  </tr>); })}</tbody>
              </table>
            </div>
          </div>)}
        {allDefective.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 12px', fontFamily: DS.font, fontSize: '15px', fontWeight: 700, color: DS.color.danger, textTransform: 'uppercase' }}>Брак (Дефектни продукти)</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${DS.color.danger}44`, fontFamily: DS.font, fontSize: '13px' }}>
                <thead><tr style={{ backgroundColor: DS.color.dangerBg }}><th style={{ ...TH, color: DS.color.danger, textAlign: 'left' }}>№</th><th style={{ ...TH, color: DS.color.danger, textAlign: 'left' }}>Наименование</th><th style={{ ...TH, color: DS.color.danger }}>Количество</th><th style={{ ...TH, color: DS.color.danger }}>Мярка</th><th style={{ ...TH, color: DS.color.danger, textAlign: 'left' }}>Причина</th><th style={{ ...TH, color: DS.color.danger, textAlign: 'left' }}>Бракувал</th></tr></thead>
                <tbody>{allDefective.map((item, idx) => { const origIdx = (summary.allDefective || []).indexOf(item); const ri = origIdx >= 0 ? origIdx : idx;
                  return (<tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? DS.color.surface : DS.color.dangerBg }}>
                    <td style={{ ...TD, textAlign: 'center', fontWeight: 700 }}>{idx + 1}</td>
                    <EC path={`summary.allDefective.${ri}.name`} style={TD}>{item.name || '-'}</EC>
                    <EC path={`summary.allDefective.${ri}.quantity`} style={{ ...TD, textAlign: 'center' }}>{item.quantity || '-'}</EC>
                    <EC path={`summary.allDefective.${ri}.unit`} style={{ ...TD, textAlign: 'center' }}>{item.unit || '-'}</EC>
                    <EC path={`summary.allDefective.${ri}.reason`} style={TD}>{item.reason || '-'}</EC>
                    <EC path={`summary.allDefective.${ri}.brakedBy`} style={TD}>{item.brakedBy || '-'}</EC>
                  </tr>); })}</tbody>
              </table>
            </div>
          </div>)}
        {allConsumption.length === 0 && allDefective.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: DS.color.graphiteMuted, backgroundColor: DS.color.surfaceAlt, fontFamily: DS.font }}>Няма записана консумация или брак</div>}
      </div>);
  };

  // ============================================
  // 🛢️ OIL CHANGE — logic UNCHANGED
  // ============================================
  const renderOilChangeRecords = () => {
    if (!data.records || data.records.length === 0) return null;
    if (cType === 'transport_hygiene' || cType === 'TransportHygieneChecklist') return null;
    if (cType === 'thermal_processing' || cType === 'ThermalProcessingSheet') return null;
    // Skip if data has transport-specific fields
    if (data.thermalBags) return null;
    if (data.records.some(r => r.regNumber !== undefined || r.vehicleType !== undefined || r.hygieneStatus !== undefined)) return null;
    if (data.records.some(r => r.degree !== undefined)) return null;
    const filledRecords = data.records.filter(r => r.date || r.shift || r.quantity || r.oilType || r.nameSignature);
    if (filledRecords.length === 0) return null;
    return (
      <div style={{ marginTop: '24px' }}>
        <SecH title="Смяна на олио" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: TBDR, fontFamily: DS.font, fontSize: '13px' }}>
            <thead><tr style={THR}><th style={{ ...TH, textAlign: 'left' }}>№</th><th style={{ ...TH, textAlign: 'left' }}>Дата</th><th style={TH}>Смяна</th><th style={TH}>Количество (л)</th><th style={{ ...TH, textAlign: 'left' }}>Вид олио</th><th style={{ ...TH, textAlign: 'left' }}>Служител</th></tr></thead>
            <tbody>{filledRecords.map((record, idx) => { const origIdx = (data.records || []).indexOf(record); const ri = origIdx >= 0 ? origIdx : idx;
              return (<tr key={idx} style={ZEBRA(idx)}>
                <td style={{ ...TD, textAlign: 'center', fontWeight: 700 }}>{record.id}</td>
                <td style={TD}>{record.date ? new Date(record.date).toLocaleDateString('bg-BG') : '-'}</td>
                <EC path={`records.${ri}.shift`} style={{ ...TD, textAlign: 'center' }}>{record.shift || '-'}</EC>
                <EC path={`records.${ri}.quantity`} style={{ ...TD, textAlign: 'center' }}>{record.quantity || '-'}</EC>
                <EC path={`records.${ri}.oilType`} style={TD}>{record.oilType || '-'}</EC>
                <EC path={`records.${ri}.nameSignature`} style={TD}>{record.nameSignature || '-'}</EC>
              </tr>); })}</tbody>
          </table>
        </div>
      </div>);
  };

  // ============================================
  // 🚛 TRANSPORT HYGIENE — NEW
  // ============================================
  const renderTransportHygiene = () => {
    if (!data.records || data.records.length === 0) return null;
    const isTransport = cType === 'transport_hygiene' || cType === 'TransportHygieneChecklist'
      || data.records.some(r => r.regNumber !== undefined || r.vehicleType !== undefined || r.hygieneStatus !== undefined);
    if (!isTransport) return null;
    if (cType === 'thermal_processing' || cType === 'ThermalProcessingSheet') return null;
    const filledRecords = data.records.filter(r => r.date || r.regNumber || r.driverName || r.hygieneStatus);
    if (filledRecords.length === 0) return null;

    const getStatusColor = (status) => {
      if (status === 'добро') return { color: DS.color.ok, bg: DS.color.okBg };
      if (status === 'задоволително') return { color: DS.color.warning, bg: DS.color.warningBg };
      if (status === 'лошо') return { color: DS.color.danger, bg: DS.color.dangerBg };
      return { color: DS.color.graphiteMuted, bg: DS.color.surfaceAlt };
    };

    return (
      <div style={{ marginTop: '24px' }}>
        <SecH title="Чек лист хигиена на транспортните средства" />
        <InfoBox><strong>Код:</strong> ПРП 10.0.4 • Редакция: 00</InfoBox>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: TBDR, fontFamily: DS.font, fontSize: '12px' }}>
            <thead><tr style={THR}>
              <th style={TH}>№</th>
              <th style={TH}>Дата/Час</th>
              <th style={TH}>Рег № КАТ</th>
              <th style={TH}>Вид на ТС</th>
              <th style={{ ...TH, textAlign: 'left' }}>Шофьор</th>
              <th style={TH}>Хигиенно състояние</th>
              <th style={{ ...TH, textAlign: 'left' }}>Коригиращи действия</th>
              <th style={{ ...TH, textAlign: 'left' }}>Проверяващ</th>
            </tr></thead>
            <tbody>
              {filledRecords.map((record, idx) => {
                const origIdx = (data.records || []).indexOf(record);
                const ri = origIdx >= 0 ? origIdx : idx;
                const sc = getStatusColor(record.hygieneStatus);
                return (
                  <tr key={idx} style={ZEBRA(idx)}>
                    <td style={{ ...TD, textAlign: 'center', fontWeight: 700 }}>{idx + 1}</td>
                    <EC path={`records.${ri}.date`} style={{ ...TD, textAlign: 'center' }}>
                      {record.date ? new Date(record.date).toLocaleDateString('bg-BG') : '-'}{record.time ? ` ${record.time}` : ''}
                    </EC>
                    <EC path={`records.${ri}.regNumber`} style={{ ...TD, textAlign: 'center', fontWeight: 600 }}>{record.regNumber || '-'}</EC>
                    <EC path={`records.${ri}.vehicleType`} style={{ ...TD, textAlign: 'center' }}>{record.vehicleType || '-'}</EC>
                    <EC path={`records.${ri}.driverName`} style={TD}>{record.driverName || '-'}</EC>
                    <td style={{ ...TD, textAlign: 'center', fontWeight: 700, color: sc.color, backgroundColor: sc.bg }}>
                      {record.hygieneStatus ? record.hygieneStatus.charAt(0).toUpperCase() + record.hygieneStatus.slice(1) : '-'}
                    </td>
                    <EC path={`records.${ri}.correctiveActions`} style={TD}>{record.correctiveActions || '-'}</EC>
                    <EC path={`records.${ri}.inspector`} style={TD}>{record.inspector || '-'}</EC>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '10px', padding: '8px', backgroundColor: DS.color.infoBg, fontFamily: DS.font, fontSize: '11px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <strong>Легенда:</strong>
          <span style={{ padding: '2px 8px', backgroundColor: DS.color.okBg, color: DS.color.ok, fontWeight: 600 }}>Добро</span>
          <span style={{ padding: '2px 8px', backgroundColor: DS.color.warningBg, color: DS.color.warning, fontWeight: 600 }}>Задоволително</span>
          <span style={{ padding: '2px 8px', backgroundColor: DS.color.dangerBg, color: DS.color.danger, fontWeight: 600 }}>Лошо</span>
        </div>

        {/* Термочанти за доставка */}
        {data.thermalBags && data.thermalBags.length > 0 && (() => {
          const filledBags = data.thermalBags.filter(b => b.bagName || b.hygieneStatus);
          if (filledBags.length === 0) return null;
          return (
            <div style={{ marginTop: '20px' }}>
              <SecH title="Термочанти за доставка" />
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: TBDR, fontFamily: DS.font, fontSize: '12px' }}>
                  <thead><tr style={THR}>
                    <th style={TH}>№</th>
                    <th style={{ ...TH, textAlign: 'left' }}>Термочанта</th>
                    <th style={TH}>Хигиенно състояние</th>
                    <th style={{ ...TH, textAlign: 'left' }}>Коригиращи действия</th>
                    <th style={{ ...TH, textAlign: 'left' }}>Проверяващ</th>
                  </tr></thead>
                  <tbody>
                    {filledBags.map((bag, idx) => {
                      const origIdx = (data.thermalBags || []).indexOf(bag);
                      const bi = origIdx >= 0 ? origIdx : idx;
                      const sc = getStatusColor(bag.hygieneStatus);
                      return (
                        <tr key={idx} style={ZEBRA(idx)}>
                          <td style={{ ...TD, textAlign: 'center', fontWeight: 700 }}>{idx + 1}</td>
                          <EC path={`thermalBags.${bi}.bagName`} style={TD}>{bag.bagName || '-'}</EC>
                          <td style={{ ...TD, textAlign: 'center', fontWeight: 700, color: sc.color, backgroundColor: sc.bg }}>
                            {bag.hygieneStatus ? bag.hygieneStatus.charAt(0).toUpperCase() + bag.hygieneStatus.slice(1) : '-'}
                          </td>
                          <EC path={`thermalBags.${bi}.correctiveActions`} style={TD}>{bag.correctiveActions || '-'}</EC>
                          <EC path={`thermalBags.${bi}.inspector`} style={TD}>{bag.inspector || '-'}</EC>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  // ============================================
  // 🔥 THERMAL PROCESSING — NEW
  // ============================================
  const renderThermalProcessing = () => {
    if (!data.records || data.records.length === 0) return null;
    const isThermal = cType === 'thermal_processing' || cType === 'ThermalProcessingSheet'
      || data.records.some(r => r.degree !== undefined);
    if (!isThermal) return null;
    if (cType === 'transport_hygiene' || cType === 'TransportHygieneChecklist') return null;
    const filledRecords = data.records.filter(r => r.date || r.quantity || r.degree || r.batchL);
    if (filledRecords.length === 0) return null;

    const DEGREES = {
      'A': { label: 'A — Леко изпържване', color: DS.color.ok, bg: DS.color.okBg },
      'B': { label: 'B — Средно изпържване', color: DS.color.info, bg: DS.color.infoBg },
      'C': { label: 'C — Силно изпържване', color: DS.color.warning, bg: DS.color.warningBg },
      'D': { label: 'D — Препържено', color: DS.color.danger, bg: DS.color.dangerBg },
    };

    return (
      <div style={{ marginTop: '24px' }}>
        <SecH title="Производствен лист — Термична обработка" />
        <InfoBox><strong>Код:</strong> НСL 02 • Редакция: 00</InfoBox>
        <div style={{ marginBottom: '12px', padding: '10px', backgroundColor: DS.color.infoBg, border: `1px solid ${DS.color.info}22`, display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <strong style={{ fontFamily: DS.font, fontSize: '11px' }}>Легенда:</strong>
          {Object.entries(DEGREES).map(([key, d]) => (
            <span key={key} style={{ padding: '3px 10px', backgroundColor: d.bg, color: d.color, fontFamily: DS.font, fontSize: '11px', fontWeight: 700, border: `1px solid ${d.color}33` }}>{d.label}</span>
          ))}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: TBDR, fontFamily: DS.font, fontSize: '12px' }}>
            <thead><tr style={THR}>
              <th style={TH}>№</th>
              <th style={TH}>Дата</th>
              <th style={TH}>Час</th>
              <th style={TH}>Количество</th>
              <th style={TH}>Партида, L</th>
              <th style={TH}>Степен</th>
              <th style={{ ...TH, textAlign: 'left' }}>Забележки</th>
            </tr></thead>
            <tbody>
              {filledRecords.map((record, idx) => {
                const origIdx = (data.records || []).indexOf(record);
                const ri = origIdx >= 0 ? origIdx : idx;
                const deg = DEGREES[record.degree] || { label: record.degree || '-', color: DS.color.graphiteMuted, bg: DS.color.surfaceAlt };
                return (
                  <tr key={idx} style={ZEBRA(idx)}>
                    <td style={{ ...TD, textAlign: 'center', fontWeight: 700 }}>{idx + 1}</td>
                    <EC path={`records.${ri}.date`} style={{ ...TD, textAlign: 'center' }}>{record.date ? new Date(record.date).toLocaleDateString('bg-BG') : '-'}</EC>
                    <EC path={`records.${ri}.time`} style={{ ...TD, textAlign: 'center' }}>{record.time || '-'}</EC>
                    <EC path={`records.${ri}.quantity`} style={{ ...TD, textAlign: 'center' }}>{record.quantity || '-'}</EC>
                    <EC path={`records.${ri}.batchL`} style={{ ...TD, textAlign: 'center' }}>{record.batchL || '-'}</EC>
                    <td style={{ ...TD, textAlign: 'center', fontWeight: 700, color: deg.color, backgroundColor: deg.bg, fontSize: '14px' }}>
                      {record.degree || '-'}
                    </td>
                    <EC path={`records.${ri}.notes`} style={TD}>{record.notes || '-'}</EC>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ============================================
  // 🌡️ REFRIGERATOR TEMPERATURE — logic UNCHANGED
  // ============================================
  const renderRefrigeratorTemperature = () => {
    if (!data.rows || data.rows.length === 0) return null;
    const customColumns = data.customColumns || [];
    const defaultColumns = [
      { id: 'hot_display', name: 'Топла витрина', temp: '≥ 63°C', unit: 'Пица' },
      { id: 'cold_pizza', name: 'Студена витрина', temp: '0°C÷4°C', unit: 'Пица' },
      { id: 'cold_doner', name: 'Студена витрина', temp: '0°C÷4°C', unit: 'Дюнер' },
      { id: 'hot_clean', name: 'Топла витрина', temp: '≥ 63°C', unit: 'Чикън' }
    ];
    const allColumns = [...defaultColumns, ...customColumns];
    const filledRows = data.rows.filter(r => r.date || Object.keys(r.data || {}).length > 0 || r.checkedBy || r.corrective);
    if (filledRows.length === 0) return null;
    const hasTimeSlots = filledRows.some(row => { const dataKeys = Object.keys(row.data || {}); return dataKeys.some(key => key.includes('_8') || key.includes('_19')); });

    return (
      <div style={{ marginTop: '24px' }}>
        <SecH title="Контрол температура на витрини" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: TBDR, fontFamily: DS.font, fontSize: '10px' }}>
            <thead><tr style={THR}>
              <th style={{ ...TH, textAlign: 'left', minWidth: '80px' }}>Дата</th>
              {hasTimeSlots && <th style={{ ...TH, minWidth: '60px' }}>Час</th>}
              {allColumns.map((col, idx) => <th key={idx} style={{ ...TH, minWidth: '80px' }}><div style={{ fontWeight: 700 }}>{col.name}</div>{col.unit && <div style={{ fontSize: '9px', fontWeight: 400, marginTop: '2px' }}>({col.unit})</div>}{col.temp && <div style={{ fontSize: '9px', fontWeight: 400, marginTop: '2px' }}>{col.temp}</div>}</th>)}
              <th style={{ ...TH, textAlign: 'left', minWidth: '150px' }}>Коригиращи действия</th>
              <th style={{ ...TH, textAlign: 'left', minWidth: '100px' }}>Проверил</th>
            </tr></thead>
            <tbody>
              {filledRows.map((row, idx) => {
                const origIdx = (data.rows || []).indexOf(row); const ri = origIdx >= 0 ? origIdx : idx;
                if (hasTimeSlots) {
                  return (<React.Fragment key={idx}>
                    <tr style={ZEBRA(idx)}>
                      <td style={TD} rowSpan={2}>{row.date ? new Date(row.date).toLocaleDateString('bg-BG') : '-'}</td>
                      <td style={{ ...TD, textAlign: 'center', fontWeight: 700 }}>8:00</td>
                      {allColumns.map((col, ci) => { const value = row.data?.[`${col.id}_8`]; return <EC key={ci} path={`rows.${ri}.data.${col.id}_8`} style={{ ...TD, textAlign: 'center', fontWeight: value ? 700 : 400 }}>{value || '-'}</EC>; })}
                      <EC path={`rows.${ri}.corrective`} style={TD}>{row.corrective || '-'}</EC>
                      <EC path={`rows.${ri}.checkedBy`} style={TD}>{row.checkedBy || '-'}</EC>
                    </tr>
                    <tr style={{ backgroundColor: idx % 2 === 0 ? DS.color.surfaceAlt : DS.color.borderLight }}>
                      <td style={{ ...TD, textAlign: 'center', fontWeight: 700 }}>19:00</td>
                      {allColumns.map((col, ci) => { const value = row.data?.[`${col.id}_19`]; return <EC key={ci} path={`rows.${ri}.data.${col.id}_19`} style={{ ...TD, textAlign: 'center', fontWeight: value ? 700 : 400 }}>{value || '-'}</EC>; })}
                    </tr>
                  </React.Fragment>);
                } else {
                  return (<tr key={idx} style={ZEBRA(idx)}>
                    <td style={TD}>{row.date ? new Date(row.date).toLocaleDateString('bg-BG') : '-'}</td>
                    {allColumns.map((col, ci) => { const value = row.data?.[col.id]; return <EC key={ci} path={`rows.${ri}.data.${col.id}`} style={{ ...TD, textAlign: 'center', fontWeight: value ? 700 : 400 }}>{value || '-'}</EC>; })}
                    <EC path={`rows.${ri}.corrective`} style={TD}>{row.corrective || '-'}</EC>
                    <EC path={`rows.${ri}.checkedBy`} style={TD}>{row.checkedBy || '-'}</EC>
                  </tr>);
                }
              })}
            </tbody>
          </table>
        </div>
      </div>);
  };


  // ============================================
  // 🧼 HYGIENE WORK CARD — logic UNCHANGED
  // ============================================
  const renderHygieneCard = () => {
    if (!data.zones && !data.customRefrigerators && !data.completionData) return null;
    const zones = data.zones || []; const customRefrigerators = data.customRefrigerators || [];
    const completionData = data.completionData || {}; const employees = data.employees || [];
    const hasData = Object.keys(completionData).length > 0 || employees.length > 0;
    if (!hasData) return null;
    return (
      <div style={{ marginTop: '24px' }}>
        {(data.currentDate || data.manager || data.hygieneType) && (
          <InfoBox>
            {data.currentDate && <div><strong>Дата:</strong> {new Date(data.currentDate).toLocaleDateString('bg-BG')}</div>}
            {data.manager && <div style={{ marginTop: '4px' }}><strong>Управител:</strong> {data.manager}</div>}
            {data.hygieneType && <div style={{ marginTop: '4px' }}><strong>Тип хигиенизиране:</strong> {data.hygieneType}</div>}
            {employees.length > 0 && <div style={{ marginTop: '4px' }}><strong>Служители:</strong> {employees.join(', ')}</div>}
          </InfoBox>)}
        <SecH title="Работна карта за хигиенизиране" />
        {zones.map((zone, zoneIdx) => {
          const hasZoneData = zone.areas?.some(area => { const key = `${zone.id}_${area.name}`; return completionData[`${key}_cleaning`] || completionData[`${key}_washing`] || completionData[`${key}_disinfection`]; });
          if (!hasZoneData) return null;
          return (
            <div key={zoneIdx} style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 8px', fontFamily: DS.font, fontSize: '14px', fontWeight: 700, color: DS.color.primaryLight }}>{zone.name}</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: TBDR, fontFamily: DS.font, fontSize: '11px' }}>
                  <thead><tr style={THR}><th style={{ ...TH, textAlign: 'left' }}>Зона/Повърхност</th><th style={TH}>Почистване</th><th style={TH}>Измиване</th><th style={TH}>Дезинфекция</th><th style={{ ...TH, textAlign: 'left' }}>Изпълнител</th></tr></thead>
                  <tbody>{zone.areas?.map((area, areaIdx) => {
                    const key = `${zone.id}_${area.name}`;
                    const cleaning = completionData[`${key}_cleaning`]; const washing = completionData[`${key}_washing`]; const disinfection = completionData[`${key}_disinfection`]; const executor = completionData[`${key}_executor`];
                    if (!cleaning && !washing && !disinfection) return null;
                    return (<tr key={areaIdx} style={ZEBRA(areaIdx)}>
                      <td style={TD}>{area.name}</td>
                      <td style={{ ...TD, textAlign: 'center' }}>{cleaning ? '✅' : '⬜'}</td>
                      <td style={{ ...TD, textAlign: 'center' }}>{washing ? '✅' : '⬜'}</td>
                      <td style={{ ...TD, textAlign: 'center' }}>{disinfection ? '✅' : '⬜'}</td>
                      <EC path={`completionData.${key}_executor`} style={TD}>{executor || '-'}</EC>
                    </tr>);
                  })}</tbody>
                </table>
              </div>
            </div>);
        })}
      </div>);
  };

  // ============================================
  // 👔 CLOTHING AND HYGIENE CONTROL — logic UNCHANGED
  // ============================================
  const renderClothingHygieneControl = () => {
    if (!data.rows || !data.header) return null;
    const rows = data.rows || []; const header = data.header || {};
    const filledRows = rows.filter(r => r.name || r.position);
    if (filledRows.length === 0) return null;

    const StatusCard = ({ label, value, isOk }) => (
      <div style={{ padding: '14px', backgroundColor: isOk ? DS.color.okBg : DS.color.dangerBg, border: `2px solid ${isOk ? DS.color.ok : DS.color.danger}44` }}>
        <div style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 700, color: DS.color.graphiteMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>{label}</div>
        <div style={{ fontFamily: DS.font, fontWeight: 700, fontSize: '15px', color: isOk ? DS.color.ok : DS.color.danger }}>{value}</div>
      </div>
    );

    return (
      <div style={{ marginTop: '24px' }}>
        <SecH title="Контрол на работното облекло и хигиена на персонала" />
        <InfoBox>
          <strong>Дата:</strong> {header.date ? new Date(header.date).toLocaleDateString('bg-BG') : '—'}
          {header.manager && <span style={{ marginLeft: '24px' }}><strong>Мениджър:</strong> {header.manager}</span>}
          <span style={{ marginLeft: '24px' }}><strong>Проверени:</strong> {filledRows.length} служители</span>
        </InfoBox>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filledRows.map((row, idx) => {
            const hasIssues = row.wounds !== 'none' || row.jewelry !== 'none' || row.work_clothing !== 'clean' || row.personal_hygiene !== 'good' || row.health_status !== 'good';
            return (
              <div key={row.id || idx} style={{ backgroundColor: DS.color.surface, border: `2px solid ${hasIssues ? DS.color.warning : DS.color.ok}44`, boxShadow: DS.shadow.sm, animation: 'cf 0.4s ease', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', backgroundColor: hasIssues ? DS.color.warningBg : DS.color.okBg, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderBottom: `1px solid ${DS.color.borderLight}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ backgroundColor: DS.color.primary, color: '#fff', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: DS.font, fontSize: '13px', fontWeight: 700, borderRadius: '50%' }}>{row.number}</span>
                    <span style={{ fontFamily: DS.font, fontSize: '15px', fontWeight: 700, color: DS.color.primary }}>{row.name}</span>
                    {row.position && <span style={{ padding: '3px 10px', backgroundColor: DS.color.infoBg, color: DS.color.info, fontFamily: DS.font, fontSize: '11px', fontWeight: 700, border: `1px solid ${DS.color.info}33` }}>{row.position}</span>}
                  </div>
                  {row.checked_by && <span style={{ fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteMuted, fontWeight: 600 }}>Проверил: {row.checked_by}</span>}
                </div>
                <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                  <StatusCard label="Работно облекло" value={row.work_clothing === 'clean' ? '✅ Чисто' : row.work_clothing === 'dirty' ? '❌ Мръсно' : row.work_clothing || '-'} isOk={row.work_clothing === 'clean'} />
                  <StatusCard label="Лична хигиена" value={row.personal_hygiene === 'good' ? '✅ Добра' : row.personal_hygiene === 'poor' ? '❌ Лоша' : row.personal_hygiene || '-'} isOk={row.personal_hygiene === 'good'} />
                  <StatusCard label="Здравословно състояние" value={row.health_status === 'good' ? '✅ Добро' : row.health_status === 'sick' ? '❌ Болен' : row.health_status || '-'} isOk={row.health_status === 'good'} />
                  <StatusCard label="Рани/Порязвания" value={row.wounds === 'none' ? '✅ Няма' : row.wounds === 'minor' ? '⚠️ Леки' : row.wounds === 'major' ? '❌ Сериозни' : row.wounds || '-'} isOk={row.wounds === 'none'} />
                  <StatusCard label="Бижута" value={row.jewelry === 'none' ? '✅ Няма' : row.jewelry === 'present' ? '❌ Има' : row.jewelry || '-'} isOk={row.jewelry === 'none'} />
                </div>
                {row.corrective_actions && (
                  <div style={{ margin: '0 12px 12px', padding: '12px', backgroundColor: DS.color.warningBg, border: `1px solid ${DS.color.warning}33` }}>
                    <div style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 700, color: DS.color.warning, textTransform: 'uppercase', marginBottom: '4px' }}>Коригиращи действия</div>
                    <div style={{ fontFamily: DS.font, fontSize: '13px', color: DS.color.graphiteMed, lineHeight: 1.5 }}>{row.corrective_actions}</div>
                  </div>
                )}
              </div>);
          })}
        </div>
      </div>);
  };


  // ============================================
  // 🗄️ REFRIGERATOR STORAGE CONTROL — logic UNCHANGED
  // ============================================
  const renderRefrigeratorStorageControl = () => {
    if (!data.dateBlocks || data.dateBlocks.length === 0) return null;
    const dateBlocks = data.dateBlocks; const customRefrigerators = data.customRefrigerators || [];
    const filledBlocks = dateBlocks.filter(block => block.date || Object.keys(block.readings || {}).length > 0);
    if (filledBlocks.length === 0) return null;
    const defaultRefrigerators = [
      { id: '1', name: '№ 1', temp: '0-4°C', description: 'Дюнер 1' },
      { id: '2', name: '№ 2', temp: '0-4°C', description: 'зеленчуци, сосове, месни продукти' },
      { id: '3', name: '№ 3', temp: '2-6°C', description: 'безалкохолни напитки, айран' },
      { id: '4', name: '№ 4', temp: '≤ -18°C', description: 'месни продукти' },
      { id: '5', name: '№ 5', temp: '0-4°C', description: 'месни, млечни, зеленчуци, тесто' },
      { id: '6', name: '№ 6', temp: '0-4°C', description: 'месни, млечни, зеленчуци, тесто' },
      { id: '7', name: '№ 7', temp: '≤ -18°C', description: 'месни продукти' },
      { id: '8', name: '№ 8', temp: '≤ -18°C', description: 'месни продукти, зеленчуци, тесто' }
    ];
    const allRefrigerators = [...defaultRefrigerators, ...customRefrigerators];
    const timeSlots = ['8h', '14h', '20h'];
    return (
      <div style={{ marginTop: '24px' }}>
        <SecH title="Контрол на хладилно съхранение" />
        {filledBlocks.map((block, blockIdx) => (
          <div key={blockIdx} style={{ marginBottom: '24px' }}>
            {block.date && <h4 style={{ margin: '0 0 8px', fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primaryLight }}>{new Date(block.date).toLocaleDateString('bg-BG')}</h4>}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: TBDR, fontFamily: DS.font, fontSize: '10px' }}>
                <thead><tr style={THR}>
                  <th style={{ ...TH, textAlign: 'left', minWidth: '120px' }}>Хладилник</th>
                  <th style={{ ...TH, textAlign: 'left', minWidth: '150px' }}>Описание</th>
                  <th style={{ ...TH, minWidth: '80px' }}>Целева t°</th>
                  {timeSlots.map((slot, si) => <th key={si} style={{ ...TH, minWidth: '60px' }}>{slot.replace('h', ':00')}</th>)}
                  <th style={{ ...TH, textAlign: 'left', minWidth: '100px' }}>Проверил</th>
                </tr></thead>
                <tbody>{allRefrigerators.map((ref, refIdx) => {
                  const hasRefData = timeSlots.some(slot => block.readings?.[`${ref.id}_${slot}`]);
                  if (!hasRefData) return null;
                  return (<tr key={refIdx} style={ZEBRA(refIdx)}>
                    <td style={{ ...TD, fontWeight: 700 }}>{ref.name}</td>
                    <td style={{ ...TD, fontSize: '9px' }}>{ref.description}</td>
                    <td style={{ ...TD, textAlign: 'center', fontSize: '9px' }}>{ref.temp}</td>
                    {timeSlots.map((slot, si) => { const temp = block.readings?.[`${ref.id}_${slot}`]; return <EC key={si} path={`dateBlocks.${blockIdx}.readings.${ref.id}_${slot}`} style={{ ...TD, textAlign: 'center', fontWeight: temp ? 700 : 400 }}>{temp || '-'}</EC>; })}
                    <td style={{ ...TD, fontSize: '9px' }}>{block.readings?.[`inspector_${ref.id}`] || block.readings?.['inspector_name'] || '-'}</td>
                  </tr>);
                })}</tbody>
              </table>
            </div>
          </div>))}
      </div>);
  };

  // ============================================
  // 📦 INCOMING MATERIALS — logic UNCHANGED
  // ============================================
  const renderIncomingMaterialsControl = () => {
    if (!data.materials || data.materials.length === 0) return null;
    const materials = data.materials || [];
    const filledMaterials = materials.filter(m => m.materialName || m.supplier || m.quantity);
    if (filledMaterials.length === 0) return null;
    return (
      <div style={{ marginTop: '24px' }}>
        <SecH title="Входящ контрол на суровини и материали" />
        {(data.currentDate || data.companyName || data.objectName || data.manager) && (
          <InfoBox>
            {data.companyName && <div><strong>Фирма:</strong> {data.companyName}</div>}
            {data.objectName && <div style={{ marginTop: '4px' }}><strong>Обект:</strong> {data.objectName}</div>}
            {data.currentDate && <div style={{ marginTop: '4px' }}><strong>Дата:</strong> {new Date(data.currentDate).toLocaleDateString('bg-BG')}</div>}
            {data.manager && <div style={{ marginTop: '4px' }}><strong>Управител:</strong> {data.manager}</div>}
          </InfoBox>)}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: TBDR, fontFamily: DS.font, fontSize: '11px' }}>
            <thead><tr style={THR}>
              {['№','Суровина/Материал','Доставчик','Количество','Партиден №','Дата получаване','Срок годност','Темп.','Транспорт','МПС чисто','Дефекти опаковка','Приет','Документ','Отговорник'].map((h,i) => <th key={i} style={{ ...TH, minWidth: i === 0 ? '50px' : '100px', textAlign: i <= 2 || i >= 11 ? 'left' : 'center' }}>{h}</th>)}
            </tr></thead>
            <tbody>{filledMaterials.map((material, idx) => {
              const origIdx = (materials || []).indexOf(material); const ri = origIdx >= 0 ? origIdx : idx;
              return (<tr key={material.id || idx} style={ZEBRA(idx)}>
                <td style={{ ...TD, textAlign: 'center', fontWeight: 700, color: DS.color.primary }}>{material.id}</td>
                <EC path={`materials.${ri}.materialName`} style={{ ...TD, fontWeight: 600 }}>{material.materialName || '-'}</EC>
                <EC path={`materials.${ri}.supplier`} style={TD}>{material.supplier || '-'}</EC>
                <EC path={`materials.${ri}.quantity`} style={{ ...TD, textAlign: 'center' }}>{material.quantity || '-'}</EC>
                <EC path={`materials.${ri}.batchNumber`} style={{ ...TD, textAlign: 'center' }}>{material.batchNumber || '-'}</EC>
                <td style={{ ...TD, textAlign: 'center' }}>{material.receiptDate ? new Date(material.receiptDate).toLocaleDateString('bg-BG') : '-'}</td>
                <td style={{ ...TD, textAlign: 'center' }}>{material.useByDate ? new Date(material.useByDate).toLocaleDateString('bg-BG') : '-'}</td>
                <EC path={`materials.${ri}.temperature`} style={{ ...TD, textAlign: 'center' }}>{material.temperature || '-'}</EC>
                <EC path={`materials.${ri}.transportType`} style={TD}>{material.transportType || '-'}</EC>
                <td style={{ ...TD, textAlign: 'center', backgroundColor: material.vehicleCleaned === 'yes' ? DS.color.okBg : material.vehicleCleaned === 'no' ? DS.color.dangerBg : 'transparent' }}>{material.vehicleCleaned === 'yes' ? '✅ Да' : material.vehicleCleaned === 'no' ? '❌ Не' : '-'}</td>
                <EC path={`materials.${ri}.packagingDefects`} style={TD}>{material.packagingDefects || '-'}</EC>
                <td style={{ ...TD, textAlign: 'center', backgroundColor: material.accepted ? DS.color.okBg : DS.color.dangerBg, fontWeight: 700 }}>{material.accepted ? '✅ Да' : '❌ Не'}</td>
                <EC path={`materials.${ri}.document`} style={TD}>{material.document || '-'}</EC>
                <EC path={`materials.${ri}.responsibleSignature`} style={TD}>{material.responsibleSignature || '-'}</EC>
              </tr>); })}</tbody>
          </table>
        </div>
        <div style={{ marginTop: '10px', padding: '8px', backgroundColor: DS.color.infoBg, fontFamily: DS.font, fontSize: '11px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <strong>Легенда:</strong>
          <span style={{ padding: '2px 8px', backgroundColor: DS.color.okBg }}>✅ Приет / Чисто</span>
          <span style={{ padding: '2px 8px', backgroundColor: DS.color.dangerBg }}>❌ Отказан / Мръсно</span>
        </div>
      </div>);
  };

  // ============================================
  // 📋 GENERIC CHECKLIST — logic UNCHANGED
  // ============================================
  const renderGenericChecklist = () => {
    if (!data.items || data.items.length === 0) return null;
    const filledItems = data.items.filter(item => item.description || item.completed || item.notes);
    if (filledItems.length === 0) return null;
    return (
      <div style={{ marginTop: '24px' }}>
        <SecH title="Чек лист" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: TBDR, fontFamily: DS.font, fontSize: '13px' }}>
            <thead><tr style={THR}><th style={TH}>№</th><th style={{ ...TH, textAlign: 'left' }}>Описание</th><th style={TH}>Статус</th><th style={{ ...TH, textAlign: 'left' }}>Бележки</th></tr></thead>
            <tbody>{filledItems.map((item, idx) => { const origIdx = (data.items || []).indexOf(item); const ri = origIdx >= 0 ? origIdx : idx;
              return (<tr key={idx} style={ZEBRA(idx)}>
                <td style={{ ...TD, textAlign: 'center', fontWeight: 700 }}>{idx + 1}</td>
                <EC path={`items.${ri}.description`} style={TD}>{item.description || '-'}</EC>
                <td style={{ ...TD, textAlign: 'center' }}>{item.completed ? '✅' : '⬜'}</td>
                <EC path={`items.${ri}.notes`} style={TD}>{item.notes || '-'}</EC>
              </tr>); })}</tbody>
          </table>
        </div>
      </div>);
  };


  // ============================================
  // MAIN RENDER — DS shell, logic UNCHANGED
  // ============================================
  return (<><style>{DSS}</style>
    <div style={{ minHeight: '100vh', backgroundColor: DS.color.bg, fontFamily: DS.font, color: DS.color.graphite, display: 'flex', flexDirection: 'column' }}>

      {/* DARK TOP BAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: DS.color.graphite, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: DS.radius, color: 'white', fontSize: '12px', fontFamily: DS.font, fontWeight: 600, cursor: 'pointer' }}>
          <Ic n="back" sz={14} c="white" /> Назад
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {editMode && <span style={{ padding: '3px 8px', backgroundColor: DS.color.warning, color: '#fff', fontFamily: DS.font, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Редакция</span>}
          {corrections.length > 0 && (
            <button onClick={() => setShowHistory(!showHistory)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: DS.radius, color: 'white', fontSize: '11px', fontFamily: DS.font, fontWeight: 600, cursor: 'pointer' }}>
              <Ic n="history" sz={12} c="white" /> {corrections.length}
            </button>
          )}
          {!editMode ? (
            <button onClick={startEdit} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', backgroundColor: DS.color.warning, border: 'none', borderRadius: DS.radius, color: '#fff', fontSize: '11px', fontFamily: DS.font, fontWeight: 600, cursor: 'pointer' }}>
              <Ic n="edit" sz={12} c="#fff" /> Редактирай
            </button>
          ) : (<>
            <button onClick={handleCancel} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: DS.radius, color: 'white', fontSize: '11px', fontFamily: DS.font, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}>
              <Ic n="x" sz={12} c="white" /> Отказ
            </button>
            <button onClick={handleSave} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', backgroundColor: DS.color.ok, border: 'none', borderRadius: DS.radius, color: '#fff', fontSize: '11px', fontFamily: DS.font, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}>
              <Ic n="save" sz={12} c="#fff" /> {loading ? 'Запазване...' : 'Запази'}
            </button>
          </>)}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: pad, flex: 1, width: '100%' }}>

        {/* LOGO + TITLE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: mob ? '10px' : '14px', marginBottom: '16px' }}>
          <img src={LOGO} alt="Aladin Foods" style={{ height: mob ? '36px' : '48px', objectFit: 'contain', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: mob ? '16px' : '22px', fontWeight: 700, color: DS.color.primary, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.2, textTransform: 'uppercase', fontFamily: DS.font }}>{submission.checklist_templates?.name || 'Детайли за попълнен чек лист'}</h1>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontFamily: DS.font, fontSize: mob ? '10px' : '12px', color: DS.color.graphiteLight, fontWeight: 500, marginTop: '4px' }}>
              <span>{new Date(submission.submission_date).toLocaleDateString('bg-BG')}</span>
              <span>{new Date(submission.submitted_at).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}</span>
              {submission.profiles?.full_name && <span>{submission.profiles.full_name}</span>}
            </div>
          </div>
        </div>

        {/* CORRECTIONS HISTORY */}
        {showHistory && corrections.length > 0 && (
          <div style={{ backgroundColor: DS.color.surface, border: `1px solid ${DS.color.borderLight}`, boxShadow: DS.shadow.sm, marginBottom: '12px', overflow: 'hidden', animation: 'cf 0.4s ease' }}>
            <div style={{ padding: '10px 16px', backgroundColor: DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Ic n="history" sz={18} c={DS.color.primary} />
              <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase' }}>История на корекциите ({corrections.length})</span>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px' }}>
              {corrections.map((cr, idx) => (
                <div key={cr.id} style={{ padding: '12px', backgroundColor: idx % 2 === 0 ? DS.color.surfaceAlt : DS.color.surface, borderLeft: `3px solid ${DS.color.info}`, marginBottom: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary }}>{cr.corrected_by_name || cr.corrected_by_email}</span>
                    <span style={{ fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteMuted }}>{formatCorrectionDate(cr.corrected_at)}</span>
                  </div>
                  <div style={{ fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteLight, marginBottom: '8px' }}><strong>Поле:</strong> {cr.field_name}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: '8px' }}>
                    <div><div style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 600, color: DS.color.graphiteMuted, textTransform: 'uppercase', marginBottom: '3px' }}>Стара</div><div style={{ padding: '6px', backgroundColor: DS.color.dangerBg, border: `1px solid ${DS.color.danger}22`, fontFamily: DS.font, fontSize: '12px', wordBreak: 'break-word', maxHeight: '80px', overflowY: 'auto' }}>{cr.old_value || '-'}</div></div>
                    <div><div style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 600, color: DS.color.graphiteMuted, textTransform: 'uppercase', marginBottom: '3px' }}>Нова</div><div style={{ padding: '6px', backgroundColor: DS.color.okBg, border: `1px solid ${DS.color.ok}22`, fontFamily: DS.font, fontSize: '12px', wordBreak: 'break-word', maxHeight: '80px', overflowY: 'auto' }}>{cr.new_value || '-'}</div></div>
                  </div>
                </div>))}
            </div>
          </div>
        )}

        {/* EDIT MODE WARNING */}
        {editMode && (
          <div style={{ padding: '12px 16px', backgroundColor: DS.color.warningBg, border: `1px solid ${DS.color.warning}44`, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Ic n="alert" sz={20} c={DS.color.warning} />
            <div>
              <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.warning }}>Режим на редакция</span>
              <p style={{ margin: '2px 0 0', fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteLight }}>Кликнете директно върху стойностите в таблиците за да ги редактирате. Натиснете "Запази" когато завършите.</p>
            </div>
          </div>
        )}

        {/* CONTENT CARD */}
        <div style={{ backgroundColor: DS.color.surface, border: `1px solid ${DS.color.borderLight}`, boxShadow: DS.shadow.sm, padding: pad, animation: 'cf 0.4s ease' }}>
          {renderPizzaTable()}
          {renderChickenProduction()}
          {renderDonerProduction()}
          {renderMeatballProduction()}
          {renderOilChangeRecords()}
          {renderTransportHygiene()}
          {renderThermalProcessing()}
          {renderRefrigeratorTemperature()}
          {renderRefrigeratorStorageControl()}
          {renderHygieneCard()}
          {renderClothingHygieneControl()}
          {renderIncomingMaterialsControl()}
          {renderPortionAndDefect()}
          {renderGenericChecklist()}

          {!data.temperatures && !data.productions && !data.records && !data.rows && !data.dateBlocks && !data.zones && !data.completionData && !data.items && !data.materials && !data.summary && (
            <div style={{ padding: '40px', textAlign: 'center', color: DS.color.graphiteMuted, backgroundColor: DS.color.surfaceAlt, fontFamily: DS.font }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
              <p style={{ fontSize: '14px', margin: 0 }}>Няма налични данни за показване</p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: mob ? '16px 12px' : '20px 24px', color: DS.color.graphiteMuted, fontFamily: DS.font, fontSize: '11px', fontWeight: 500, borderTop: `1px solid ${DS.color.borderLight}`, marginTop: 'auto' }}>© 2026 Aladin Foods | by MG</div>
    </div></>);
};

export default ImprovedSubmissionDetail;