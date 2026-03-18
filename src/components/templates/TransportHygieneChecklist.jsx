// src/components/checklists/TransportHygieneChecklist.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

/* ═══ DESIGN TOKENS ═══ */
const DS = {
  color: {
    bg: '#ECEEED', surface: '#FFFFFF', surfaceAlt: '#F7F9F8',
    primary: '#1B5E37', primaryLight: '#2D7A4F', primaryGlow: 'rgba(27,94,55,0.08)',
    cardHeader: '#E8F5EE',
    graphite: '#1E2A26', graphiteMed: '#3D4F48', graphiteLight: '#6B7D76', graphiteMuted: '#95A39D',
    ok: '#1B8A50', okBg: '#E8F5EE',
    warning: '#C47F17', warningBg: '#FFFBEB',
    danger: '#C53030', dangerBg: '#FFF5F5',
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
const LOGO = 'https://aladinfoods.bg/assets/images/aladinfoods_logo.png';
const CSS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');*,*::before,*::after{box-sizing:border-box}body{margin:0;background:${DS.color.bg}}@keyframes cf{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes stagger{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes ctrlBreathe{0%,100%{box-shadow:${DS.shadow.glow}}50%{box-shadow:0 0 24px rgba(27,94,55,0.25)}}@media(max-width:767px){input,button,select,textarea{font-size:16px!important}}input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}input[type=number]{-moz-appearance:textfield}`;

/* ═══ INLINE SVG ICONS ═══ */
const ic = {
  back: (c = '#fff') => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>,
  plus: (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  save: (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  truck: (c) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  check: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  alert: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  clock: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  dot: (c) => <svg width="14" height="14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill={c}/></svg>,
  print: (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  user: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

const useR = () => { const [w, sW] = useState(window.innerWidth); useEffect(() => { const h = () => sW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []); return w < 768; };

/* ═══ DS INPUT ═══ */
const DInput = ({ label, type = 'text', value, onChange, placeholder, style: s, ...rest }) => {
  const [f, setF] = useState(false);
  return (
    <div style={{ minWidth: 0, flex: 1 }}>
      {label && <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: f ? DS.color.primary : DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{
          width: '100%', padding: '10px 12px',
          backgroundColor: f ? DS.color.surface : DS.color.surfaceAlt,
          border: `1.5px solid ${f ? DS.color.primary : DS.color.borderLight}`,
          borderRadius: DS.radius, fontSize: '14px', fontFamily: DS.font, fontWeight: 400,
          color: DS.color.graphite, outline: 'none', transition: 'all 150ms ease',
          boxShadow: f ? `0 0 0 3px ${DS.color.primaryGlow}` : 'none',
          boxSizing: 'border-box', WebkitAppearance: 'none', ...s,
        }} {...rest} />
    </div>
  );
};

/* ═══ DS SELECT ═══ */
const DSelect = ({ label, value, onChange, options, placeholder, style: s }) => {
  const [f, setF] = useState(false);
  return (
    <div style={{ minWidth: 0, flex: 1 }}>
      {label && <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: f ? DS.color.primary : DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</label>}
      <select value={value} onChange={onChange}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{
          width: '100%', padding: '10px 12px',
          backgroundColor: f ? DS.color.surface : DS.color.surfaceAlt,
          border: `1.5px solid ${f ? DS.color.primary : DS.color.borderLight}`,
          borderRadius: DS.radius, fontSize: '14px', fontFamily: DS.font, fontWeight: 400,
          color: DS.color.graphite, outline: 'none', transition: 'all 150ms ease',
          boxShadow: f ? `0 0 0 3px ${DS.color.primaryGlow}` : 'none',
          boxSizing: 'border-box', WebkitAppearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7D76' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px',
          ...s,
        }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
};

/* ═══ HYGIENE STATUS OPTIONS ═══ */
const HYGIENE_STATUS = [
  { value: 'добро', label: 'Добро', color: DS.color.ok, bg: DS.color.okBg },
  { value: 'задоволително', label: 'Задоволително', color: DS.color.warning, bg: DS.color.warningBg },
  { value: 'лошо', label: 'Лошо', color: DS.color.danger, bg: DS.color.dangerBg },
];

const VEHICLE_TYPES = [
  { value: 'хладилен', label: 'Хладилен' },
  { value: 'бордови', label: 'Бордови' },
  { value: 'фургон', label: 'Фургон' },
  { value: 'лекотоварен', label: 'Лекотоварен' },
  { value: 'друго', label: 'Друго' },
];

/* ═══ EMPTY RECORD ═══ */
const emptyRecord = () => ({
  id: Date.now() + Math.random(),
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().slice(0, 5),
  regNumber: '',
  vehicleType: '',
  driverName: '',
  hygieneStatus: '',
  correctiveActions: '',
  inspector: '',
});

const emptyBagRecord = () => ({
  id: Date.now() + Math.random(),
  bagName: '',
  hygieneStatus: '',
  correctiveActions: '',
  inspector: '',
});

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const TransportHygieneChecklist = ({ onBack, user, restaurantId, restaurantName }) => {
  const mob = useR();
  const pad = mob ? '12px' : '20px';
  const [records, setRecords] = useState([emptyRecord()]);
  const [thermalBags, setThermalBags] = useState([emptyBagRecord()]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hoverBack, setHoverBack] = useState(false);
  const [hoverRow, setHoverRow] = useState(null);
  const printRef = useRef(null);

  const updateRecord = (idx, field, value) => {
    setRecords(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    setSaved(false);
  };

  const addRecord = () => {
    setRecords(prev => [...prev, emptyRecord()]);
  };

  const removeRecord = (idx) => {
    if (records.length <= 1) return;
    setRecords(prev => prev.filter((_, i) => i !== idx));
  };

  const getStatusStyle = (status) => {
    const s = HYGIENE_STATUS.find(h => h.value === status);
    return s ? { color: s.color, backgroundColor: s.bg } : { color: DS.color.graphiteMuted, backgroundColor: DS.color.surfaceAlt };
  };

  /* ═══ THERMAL BAGS CRUD ═══ */
  const updateBag = (idx, field, value) => {
    setThermalBags(prev => prev.map((b, i) => i === idx ? { ...b, [field]: value } : b));
    setSaved(false);
  };
  const addBag = () => setThermalBags(prev => [...prev, emptyBagRecord()]);
  const removeBag = (idx) => { if (thermalBags.length <= 1) return; setThermalBags(prev => prev.filter((_, i) => i !== idx)); };

  /* ═══ SAVE TO SUPABASE ═══ */
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        restaurant_id: restaurantId,
        restaurant_name: restaurantName,
        submitted_by: user?.id,
        submitted_by_name: user?.name || user?.email,
        checklist_type: 'transport_hygiene',
        form_code: 'ПРП 10.0.4',
        data: {
          records: records.map(r => ({
            date: r.date,
            time: r.time,
            regNumber: r.regNumber,
            vehicleType: r.vehicleType,
            driverName: r.driverName,
            hygieneStatus: r.hygieneStatus,
            correctiveActions: r.correctiveActions,
            inspector: r.inspector,
          })),
          thermalBags: thermalBags.map(b => ({
            bagName: b.bagName,
            hygieneStatus: b.hygieneStatus,
            correctiveActions: b.correctiveActions,
            inspector: b.inspector,
          })),
        },
        status: 'completed',
        submitted_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('checklist_submissions')
        .insert([payload]);

      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
      alert('Грешка при записване: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ═══ PRINT ═══ */
  const handlePrint = () => {
    const html = generatePrintHTML();
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.print();
  };

  const generatePrintHTML = () => {
    const rows = records.map(r => `
      <tr>
        <td>${r.date} ${r.time}</td>
        <td>${r.regNumber}</td>
        <td>${r.vehicleType}</td>
        <td>${r.driverName}</td>
        <td>${r.hygieneStatus}</td>
        <td>${r.correctiveActions || '-'}</td>
        <td>${r.inspector}</td>
      </tr>
    `).join('');

    const bagRows = thermalBags.map((b, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${b.bagName || '-'}</td>
        <td>${b.hygieneStatus || '-'}</td>
        <td>${b.correctiveActions || '-'}</td>
        <td>${b.inspector || '-'}</td>
      </tr>
    `).join('');

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>ЧЕК ЛИСТ ХИГИЕНА НА ТРАНСПОРТНИТЕ СРЕДСТВА</title>
    <style>
      body{font-family:'DM Sans',Arial,sans-serif;padding:20px;color:#1E2A26}
      h1{color:#1B5E37;font-size:16px;text-align:center;margin:10px 0}
      h2{color:#1B5E37;font-size:14px;margin:18px 0 8px}
      .meta{display:flex;justify-content:space-between;font-size:11px;color:#6B7D76;margin-bottom:12px}
      table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px}
      th{background:#E8F5EE;color:#1B5E37;padding:8px;text-align:left;border:1px solid #D5DDD9;font-weight:600}
      td{padding:6px 8px;border:1px solid #D5DDD9}
      tr:nth-child(even){background:#F7F9F8}
      .footer{text-align:center;font-size:10px;color:#95A39D;margin-top:20px;border-top:1px solid #E4EBE7;padding-top:10px}
    </style></head><body>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
      <img src="${LOGO}" style="height:40px" onerror="this.style.display='none'"/>
      <div>
        <h1 style="text-align:left;margin:0">ЧЕК ЛИСТ ХИГИЕНА НА ТРАНСПОРТНИТЕ СРЕДСТВА</h1>
        <div style="font-size:10px;color:#6B7D76">Код: ПРП 10.0.4 • Редакция: 00</div>
      </div>
    </div>
    <div class="meta">
      <span>${restaurantName || ''}</span>
      <span>Дата на разпечатване: ${new Date().toLocaleDateString('bg-BG')}</span>
    </div>
    <table>
      <thead><tr>
        <th>Дата/Час</th><th>Рег № КАТ</th><th>Вид на ТС</th><th>Име на шофьора</th>
        <th>Хигиенно състояние</th><th>Коригиращи действия</th><th>Проверяващ</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <h2>ТЕРМОЧАНТИ ЗА ДОСТАВКА</h2>
    <table>
      <thead><tr>
        <th>№</th><th>Термочанта</th><th>Хигиенно състояние</th><th>Коригиращи действия</th><th>Проверяващ</th>
      </tr></thead>
      <tbody>${bagRows}</tbody>
    </table>
    <div class="footer">© 2026 Aladin Foods | by MG • Стр. 1 от 1</div>
    </body></html>`;
  };

  return (<><style>{CSS}</style>
    <div style={{ minHeight: '100vh', backgroundColor: DS.color.bg, fontFamily: DS.font, color: DS.color.graphite }}>

      {/* ═══ DARK TOP BAR (48px) ═══ */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: DS.color.graphite, padding: '0 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '48px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}>
        <button onClick={onBack} onMouseEnter={() => setHoverBack(true)} onMouseLeave={() => setHoverBack(false)} style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
          backgroundColor: hoverBack ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: DS.radius,
          cursor: 'pointer', color: '#fff', fontFamily: DS.font, fontSize: '12px', fontWeight: 600, transition: 'all 0.15s',
        }}>
          {ic.back('#fff')} Назад
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ADE80' }} />
          <span style={{ fontFamily: DS.font, fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
            {records.length} {records.length === 1 ? 'запис' : 'записа'}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: pad }}>

        {/* ═══ LOGO + TITLE HEADER ═══ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: mob ? '10px' : '14px', marginBottom: '16px', animation: 'cf 0.4s ease' }}>
          <img src={LOGO} alt="Aladin Foods" style={{ height: mob ? '36px' : '48px', objectFit: 'contain', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: DS.font, fontSize: mob ? '14px' : '20px', fontWeight: 700, color: DS.color.primary, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.2, textTransform: 'uppercase' }}>
              ЧЕК ЛИСТ ХИГИЕНА НА ТРАНСПОРТНИТЕ СРЕДСТВА
            </h1>
            <p style={{ fontFamily: DS.font, fontSize: mob ? '10px' : '12px', color: DS.color.graphiteLight, fontWeight: 500, margin: '3px 0 0' }}>
              Код: ПРП 10.0.4 • Редакция: 00 {restaurantName && `• ${restaurantName}`}
            </p>
          </div>
        </div>

        {/* ═══ ACTION BUTTONS ═══ */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', animation: 'cf 0.4s ease' }}>
          <button onClick={addRecord} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
            backgroundColor: DS.color.primary, color: '#fff', border: 'none',
            borderRadius: DS.radius, fontFamily: DS.font, fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {ic.plus('#fff')} Добави запис
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
            backgroundColor: saved ? DS.color.ok : DS.color.surface, color: saved ? '#fff' : DS.color.primary,
            border: `1.5px solid ${saved ? DS.color.ok : DS.color.primary}`,
            borderRadius: DS.radius, fontFamily: DS.font, fontSize: '13px', fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, transition: 'all 0.15s',
          }}>
            {saved ? ic.check('#fff') : ic.save(DS.color.primary)} {saving ? 'Записване...' : saved ? 'Записано!' : 'Запиши'}
          </button>
          <button onClick={handlePrint} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
            backgroundColor: DS.color.surface, color: DS.color.graphiteMed,
            border: `1.5px solid ${DS.color.borderLight}`,
            borderRadius: DS.radius, fontFamily: DS.font, fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {ic.print(DS.color.graphiteMed)} Печат
          </button>
        </div>

        {/* ═══ RECORDS ═══ */}
        {records.map((record, idx) => {
          const isHov = hoverRow === idx;
          const statusStyle = getStatusStyle(record.hygieneStatus);
          return (
            <div key={record.id}
              onMouseEnter={() => setHoverRow(idx)}
              onMouseLeave={() => setHoverRow(null)}
              style={{
                backgroundColor: DS.color.surface, borderRadius: DS.radius,
                boxShadow: isHov ? DS.shadow.md : DS.shadow.sm,
                border: `1px solid ${isHov ? DS.color.primary : DS.color.borderLight}`,
                overflow: 'hidden', marginBottom: '10px',
                transition: 'all 0.15s',
                animation: `stagger 0.3s ease ${idx * 50}ms both`,
              }}>

              {/* Record header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: DS.color.cardHeader,
                borderBottom: `1px solid ${DS.color.borderLight}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {ic.truck(DS.color.primary)}
                  <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary }}>
                    Запис #{idx + 1}
                  </span>
                  {record.hygieneStatus && (
                    <span style={{
                      fontFamily: DS.font, fontSize: '10px', fontWeight: 700,
                      padding: '2px 8px', borderRadius: DS.radius,
                      ...statusStyle,
                    }}>
                      {record.hygieneStatus.toUpperCase()}
                    </span>
                  )}
                </div>
                {records.length > 1 && (
                  <button onClick={() => removeRecord(idx)} style={{
                    display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px',
                    backgroundColor: DS.color.dangerBg, color: DS.color.danger,
                    border: 'none', borderRadius: DS.radius, cursor: 'pointer',
                    fontFamily: DS.font, fontSize: '10px', fontWeight: 600,
                  }}>
                    {ic.trash(DS.color.danger)} Изтрий
                  </button>
                )}
              </div>

              {/* Record fields */}
              <div style={{ padding: pad }}>
                {/* Row 1: Date, Time, Reg# */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: mob ? 'wrap' : 'nowrap' }}>
                  <DInput label="Дата" type="date" value={record.date} onChange={e => updateRecord(idx, 'date', e.target.value)} style={{ flex: mob ? '1 1 100%' : 1 }} />
                  <DInput label="Час" type="time" value={record.time} onChange={e => updateRecord(idx, 'time', e.target.value)} style={{ flex: mob ? '1 1 45%' : '0 0 100px' }} />
                  <DInput label="Рег № КАТ" value={record.regNumber} onChange={e => updateRecord(idx, 'regNumber', e.target.value)} placeholder="напр. СА 1234 ВХ" />
                </div>

                {/* Row 2: Vehicle type, Driver */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: mob ? 'wrap' : 'nowrap' }}>
                  <DSelect label="Вид на транспортното средство" value={record.vehicleType} onChange={e => updateRecord(idx, 'vehicleType', e.target.value)} placeholder="Изберете..." options={VEHICLE_TYPES} />
                  <DInput label="Име на шофьора" value={record.driverName} onChange={e => updateRecord(idx, 'driverName', e.target.value)} placeholder="Име и фамилия" />
                </div>

                {/* Row 3: Hygiene status */}
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                    Хигиенно състояние
                  </label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {HYGIENE_STATUS.map(opt => {
                      const selected = record.hygieneStatus === opt.value;
                      return (
                        <button key={opt.value} onClick={() => updateRecord(idx, 'hygieneStatus', opt.value)} style={{
                          flex: 1, minWidth: mob ? '80px' : '120px', padding: '10px 12px',
                          backgroundColor: selected ? opt.bg : DS.color.surfaceAlt,
                          border: `2px solid ${selected ? opt.color : DS.color.borderLight}`,
                          borderRadius: DS.radius, cursor: 'pointer',
                          fontFamily: DS.font, fontSize: '13px', fontWeight: selected ? 700 : 500,
                          color: selected ? opt.color : DS.color.graphiteMuted,
                          transition: 'all 0.15s',
                          boxShadow: selected ? `0 0 0 3px ${opt.color}15` : 'none',
                        }}>
                          {selected && <span style={{ marginRight: '4px' }}>✓</span>}
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Row 4: Corrective actions (shown when status is not "добро") */}
                {record.hygieneStatus && record.hygieneStatus !== 'добро' && (
                  <div style={{
                    marginBottom: '8px', padding: '10px', backgroundColor: DS.color.warningBg,
                    border: `1px solid ${DS.color.warning}30`, animation: 'cf 0.3s ease',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      {ic.alert(DS.color.warning)}
                      <span style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.warning, textTransform: 'uppercase' }}>Коригиращи действия</span>
                    </div>
                    <textarea
                      value={record.correctiveActions}
                      onChange={e => updateRecord(idx, 'correctiveActions', e.target.value)}
                      placeholder="Опишете предприетите коригиращи действия..."
                      rows={3}
                      style={{
                        width: '100%', padding: '10px 12px',
                        backgroundColor: DS.color.surface, border: `1.5px solid ${DS.color.borderLight}`,
                        borderRadius: DS.radius, fontSize: '14px', fontFamily: DS.font,
                        color: DS.color.graphite, outline: 'none', resize: 'vertical',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                )}

                {/* Always show corrective actions for manual entry even when "добро" */}
                {record.hygieneStatus === 'добро' && record.correctiveActions && (
                  <DInput label="Коригиращи действия" value={record.correctiveActions} onChange={e => updateRecord(idx, 'correctiveActions', e.target.value)} placeholder="(по избор)" />
                )}

                {/* Row 5: Inspector */}
                <DInput label="Проверяващ" value={record.inspector} onChange={e => updateRecord(idx, 'inspector', e.target.value)} placeholder="Име на проверяващия" />
              </div>
            </div>
          );
        })}

        {/* ═══ SUMMARY ═══ */}
        {records.length > 0 && records.some(r => r.hygieneStatus) && (
          <div style={{
            backgroundColor: DS.color.surface, borderRadius: DS.radius,
            boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`,
            overflow: 'hidden', marginBottom: '12px', animation: 'cf 0.4s ease',
          }}>
            <div style={{
              padding: '10px 14px', backgroundColor: DS.color.cardHeader,
              borderBottom: `1px solid ${DS.color.borderLight}`,
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              {ic.dot(DS.color.primary)}
              <span style={{ fontFamily: DS.font, fontSize: '12px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Обобщение</span>
            </div>
            <div style={{ padding: pad, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {HYGIENE_STATUS.map(opt => {
                const count = records.filter(r => r.hygieneStatus === opt.value).length;
                if (count === 0) return null;
                return (
                  <div key={opt.value} style={{
                    flex: 1, minWidth: '100px', textAlign: 'center', padding: '12px',
                    backgroundColor: opt.bg, border: `1px solid ${opt.color}30`, borderRadius: DS.radius,
                  }}>
                    <div style={{ fontFamily: DS.font, fontSize: '24px', fontWeight: 700, color: opt.color }}>{count}</div>
                    <div style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: opt.color, textTransform: 'uppercase' }}>{opt.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ ТЕРМОЧАНТИ ЗА ДОСТАВКА ═══ */}
        <div style={{
          backgroundColor: DS.color.surface, borderRadius: DS.radius,
          boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`,
          overflow: 'hidden', marginBottom: '12px', animation: 'cf 0.4s ease',
        }}>
          <div style={{
            padding: '10px 14px', backgroundColor: '#FFF7ED',
            borderBottom: `1px solid ${DS.color.borderLight}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: '#9A3412', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Термочанти за доставка</span>
            </div>
            <button onClick={addBag} style={{
              display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px',
              backgroundColor: '#F97316', color: '#fff', border: 'none',
              borderRadius: DS.radius, fontFamily: DS.font, fontSize: '11px', fontWeight: 600,
              cursor: 'pointer',
            }}>
              {ic.plus('#fff')} Добави
            </button>
          </div>

          <div style={{ padding: pad }}>
            {thermalBags.map((bag, idx) => (
              <div key={bag.id} style={{
                padding: '12px', marginBottom: idx < thermalBags.length - 1 ? '10px' : 0,
                backgroundColor: idx % 2 === 0 ? DS.color.surface : DS.color.surfaceAlt,
                border: `1px solid ${DS.color.borderLight}`,
                animation: `stagger 0.3s ease ${idx * 50}ms both`,
              }}>
                {/* Row 1: Number + Name + Delete */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <span style={{ fontFamily: DS.font, fontSize: '14px', fontWeight: 700, color: '#F97316', minWidth: '28px' }}>#{idx + 1}</span>
                  <DInput label="Термочанта" value={bag.bagName} onChange={e => updateBag(idx, 'bagName', e.target.value)} placeholder="Напр. Термочанта №1, Голяма синя..." />
                  {thermalBags.length > 1 && (
                    <button onClick={() => removeBag(idx)} style={{
                      display: 'flex', alignItems: 'center', padding: '6px',
                      backgroundColor: DS.color.dangerBg, color: DS.color.danger,
                      border: 'none', borderRadius: DS.radius, cursor: 'pointer', flexShrink: 0, marginTop: '18px',
                    }}>
                      {ic.trash(DS.color.danger)}
                    </button>
                  )}
                </div>

                {/* Row 2: Hygiene status buttons */}
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                    Хигиенно състояние
                  </label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {HYGIENE_STATUS.map(opt => {
                      const selected = bag.hygieneStatus === opt.value;
                      return (
                        <button key={opt.value} onClick={() => updateBag(idx, 'hygieneStatus', opt.value)} style={{
                          flex: 1, minWidth: mob ? '80px' : '100px', padding: '8px 10px',
                          backgroundColor: selected ? opt.bg : DS.color.surfaceAlt,
                          border: `2px solid ${selected ? opt.color : DS.color.borderLight}`,
                          borderRadius: DS.radius, cursor: 'pointer',
                          fontFamily: DS.font, fontSize: '12px', fontWeight: selected ? 700 : 500,
                          color: selected ? opt.color : DS.color.graphiteMuted,
                          transition: 'all 0.15s',
                        }}>
                          {selected && '✓ '}{opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Row 3: Corrective actions (if not добро) */}
                {bag.hygieneStatus && bag.hygieneStatus !== 'добро' && (
                  <div style={{ marginBottom: '8px', padding: '8px', backgroundColor: DS.color.warningBg, border: `1px solid ${DS.color.warning}30` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      {ic.alert(DS.color.warning)}
                      <span style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 600, color: DS.color.warning, textTransform: 'uppercase' }}>Коригиращи действия</span>
                    </div>
                    <textarea value={bag.correctiveActions} onChange={e => updateBag(idx, 'correctiveActions', e.target.value)}
                      placeholder="Опишете предприетите коригиращи действия..."
                      rows={2} style={{ width: '100%', padding: '8px 10px', backgroundColor: DS.color.surface, border: `1.5px solid ${DS.color.borderLight}`, borderRadius: DS.radius, fontSize: '13px', fontFamily: DS.font, color: DS.color.graphite, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>
                )}

                {/* Row 4: Inspector */}
                <DInput label="Проверяващ" value={bag.inspector} onChange={e => updateBag(idx, 'inspector', e.target.value)} placeholder="Име на проверяващия" />
              </div>
            ))}
          </div>
        </div>

        {/* ═══ FOOTER ═══ */}
        <div style={{ textAlign: 'center', padding: '16px', fontFamily: DS.font, animation: 'cf 0.5s ease' }}>
          <p style={{ fontSize: '11px', color: DS.color.graphiteLight, margin: '0 0 2px' }}>Код: ПРП 10.0.4 • Редакция: 00 • Стр. 1 от 1</p>
          <p style={{ fontSize: '10px', color: DS.color.graphiteMuted, margin: '0 0 6px' }}>АЛАДИН ФУУДС ООД</p>
          <p style={{ fontSize: '10px', color: DS.color.graphiteMuted, margin: 0, borderTop: `1px solid ${DS.color.borderLight}`, paddingTop: '8px' }}>© 2026 Aladin Foods | by MG</p>
        </div>
      </div>
    </div></>);
};

export default TransportHygieneChecklist;