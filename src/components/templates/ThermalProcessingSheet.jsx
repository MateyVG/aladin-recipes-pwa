// src/components/templates/ThermalProcessingSheet.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const DS = {
  color: {
    bg: '#ECEEED', surface: '#FFFFFF', surfaceAlt: '#F7F9F8',
    primary: '#1B5E37', primaryLight: '#2D7A4F', primaryGlow: 'rgba(27,94,55,0.08)',
    cardHeader: '#E8F5EE',
    graphite: '#1E2A26', graphiteMed: '#3D4F48', graphiteLight: '#6B7D76', graphiteMuted: '#95A39D',
    ok: '#1B8A50', okBg: '#E8F5EE',
    warning: '#C47F17', warningBg: '#FFFBEB',
    danger: '#C53030', dangerBg: '#FFF5F5',
    info: '#2563EB', infoBg: '#EFF6FF',
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
const CSS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');*,*::before,*::after{box-sizing:border-box}body{margin:0;background:${DS.color.bg}}@keyframes cf{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes stagger{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@media(max-width:767px){input,button,select,textarea{font-size:16px!important}}input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}input[type=number]{-moz-appearance:textfield}`;

const ic = {
  back: (c = '#fff') => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>,
  plus: (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  save: (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  check: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  flame: (c) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>,
  dot: (c) => <svg width="14" height="14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill={c}/></svg>,
  print: (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
};

const useR = () => { const [w, sW] = useState(window.innerWidth); useEffect(() => { const h = () => sW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []); return w < 768; };

const DInput = ({ label, type = 'text', value, onChange, placeholder, style: s, ...rest }) => {
  const [f, setF] = useState(false);
  return (
    <div style={{ minWidth: 0, flex: 1 }}>
      {label && <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: f ? DS.color.primary : DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{ width: '100%', padding: '10px 12px', backgroundColor: f ? DS.color.surface : DS.color.surfaceAlt, border: `1.5px solid ${f ? DS.color.primary : DS.color.borderLight}`, borderRadius: DS.radius, fontSize: '14px', fontFamily: DS.font, fontWeight: 400, color: DS.color.graphite, outline: 'none', transition: 'all 150ms ease', boxShadow: f ? `0 0 0 3px ${DS.color.primaryGlow}` : 'none', boxSizing: 'border-box', WebkitAppearance: 'none', ...s }} {...rest} />
    </div>
  );
};

const DEGREES = [
  { value: 'A', label: 'A', desc: 'Леко изпържване', color: DS.color.ok, bg: DS.color.okBg },
  { value: 'B', label: 'B', desc: 'Средно изпържване', color: DS.color.info, bg: DS.color.infoBg },
  { value: 'C', label: 'C', desc: 'Силно изпържване', color: DS.color.warning, bg: DS.color.warningBg },
  { value: 'D', label: 'D', desc: 'Препържено', color: DS.color.danger, bg: DS.color.dangerBg },
];

const emptyRecord = () => ({
  id: Date.now() + Math.random(),
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().slice(0, 5),
  quantity: '',
  batchLot: '',
  degree: '',
  notes: '',
});

// ← ПОПРАВЕНА СИГНАТУРА: template, config, department, restaurantId, onBack
const ThermalProcessingSheet = ({ template, config, department, restaurantId, onBack }) => {
  const mob = useR();
  const pad = mob ? '12px' : '20px';
  const [records, setRecords] = useState([emptyRecord()]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hoverBack, setHoverBack] = useState(false);
  const [hoverRow, setHoverRow] = useState(null);

  const updateRecord = (idx, field, value) => {
    setRecords(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    setSaved(false);
  };

  const addRecord = () => setRecords(prev => [...prev, emptyRecord()]);

  const removeRecord = (idx) => {
    if (records.length <= 1) return;
    setRecords(prev => prev.filter((_, i) => i !== idx));
  };

  const getDegreeStyle = (deg) => {
    const d = DEGREES.find(x => x.value === deg);
    return d ? { color: d.color, backgroundColor: d.bg } : { color: DS.color.graphiteMuted, backgroundColor: DS.color.surfaceAlt };
  };

  // ← ПОПРАВЕН handleSave: добавени template_id, department_id, submission_date
  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();

      const payload = {
        template_id: template?.id,
        department_id: department?.id,
        restaurant_id: restaurantId,
        data: {
          records: records.map(r => ({
            date: r.date,
            time: r.time,
            quantity: r.quantity,
            batchLot: r.batchLot,
            degree: r.degree,
            notes: r.notes,
          })),
        },
        submitted_by: userData?.user?.id,
        submission_date: new Date().toISOString().split('T')[0],
        synced: true,
      };

      const { error } = await supabase
        .from('checklist_submissions')
        .insert([payload]);

      if (error) throw error;
      setSaved(true);
      setTimeout(() => { setSaved(false); onBack(); }, 1500);
    } catch (err) {
      console.error('Save error:', err);
      alert('Грешка при записване: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    const rows = records.map(r => `
      <tr>
        <td>${r.date} ${r.time}</td>
        <td>${r.quantity || '-'}</td>
        <td>${r.batchLot || '-'}</td>
        <td style="text-align:center;font-weight:700;font-size:16px">${r.degree || '-'}</td>
        <td>${r.notes || '-'}</td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>ПРОИЗВОДСТВЕН ЛИСТ – ТЕРМИЧНА ОБРАБОТКА</title>
    <style>body{font-family:'DM Sans',Arial,sans-serif;padding:20px;color:#1E2A26}h1{color:#1B5E37;font-size:15px;text-align:center;margin:10px 0}.meta{display:flex;justify-content:space-between;font-size:11px;color:#6B7D76;margin-bottom:12px}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#E8F5EE;color:#1B5E37;padding:8px;text-align:left;border:1px solid #D5DDD9;font-weight:600}td{padding:6px 8px;border:1px solid #D5DDD9}tr:nth-child(even){background:#F7F9F8}.footer{text-align:center;font-size:10px;color:#95A39D;margin-top:20px;border-top:1px solid #E4EBE7;padding-top:10px}</style>
    </head><body>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
      <img src="${LOGO}" style="height:40px" onerror="this.style.display='none'"/>
      <div><h1 style="text-align:left;margin:0">ПРОИЗВОДСТВЕН ЛИСТ – ТЕРМИЧНА ОБРАБОТКА<br/>СТЕПЕН НА ИЗПЪРЖВАНЕ</h1><div style="font-size:10px;color:#6B7D76">Код: НСL 02 • Редакция: 00</div></div>
    </div>
    <table><thead><tr><th>Дата и час</th><th>Количество</th><th>Партида, L</th><th>Степен</th><th>Забележки</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="footer">© 2026 Aladin Foods | by MG</div>
    </body></html>`;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.print();
  };

  return (<><style>{CSS}</style>
    <div style={{ minHeight: '100vh', backgroundColor: DS.color.bg, fontFamily: DS.font, color: DS.color.graphite }}>

      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: DS.color.graphite, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <button onClick={onBack} onMouseEnter={() => setHoverBack(true)} onMouseLeave={() => setHoverBack(false)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: hoverBack ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: DS.radius, cursor: 'pointer', color: '#fff', fontFamily: DS.font, fontSize: '12px', fontWeight: 600, transition: 'all 0.15s' }}>
          {ic.back('#fff')} Назад
        </button>
        <span style={{ fontFamily: DS.font, fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
          {records.length} {records.length === 1 ? 'запис' : 'записа'}
        </span>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: pad }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: mob ? '10px' : '14px', marginBottom: '16px', animation: 'cf 0.4s ease' }}>
          <img src={LOGO} alt="Aladin Foods" style={{ height: mob ? '36px' : '48px', objectFit: 'contain', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: DS.font, fontSize: mob ? '13px' : '19px', fontWeight: 700, color: DS.color.primary, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.25, textTransform: 'uppercase' }}>
              {template?.name || 'Производствен лист – Термична обработка'}
            </h1>
            <p style={{ fontFamily: DS.font, fontSize: mob ? '10px' : '12px', color: DS.color.graphiteLight, fontWeight: 500, margin: '3px 0 0' }}>
              Степен на изпържване • Код: НСL 02 • Редакция: 00
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, overflow: 'hidden', marginBottom: '12px' }}>
          <div style={{ padding: '10px 14px', backgroundColor: DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {ic.flame(DS.color.primary)}
            <span style={{ fontFamily: DS.font, fontSize: '12px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Легенда — Степен на изпържване</span>
          </div>
          <div style={{ padding: '10px 14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {DEGREES.map(d => (
              <div key={d.value} style={{ flex: 1, minWidth: mob ? '70px' : '120px', textAlign: 'center', padding: '8px', backgroundColor: d.bg, border: `1px solid ${d.color}30`, borderRadius: DS.radius }}>
                <div style={{ fontFamily: DS.font, fontSize: '22px', fontWeight: 700, color: d.color }}>{d.value}</div>
                <div style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 600, color: d.color }}>{d.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <button onClick={addRecord} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: DS.color.primary, color: '#fff', border: 'none', borderRadius: DS.radius, fontFamily: DS.font, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            {ic.plus('#fff')} Добави запис
          </button>
          <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: saved ? DS.color.ok : DS.color.surface, color: saved ? '#fff' : DS.color.primary, border: `1.5px solid ${saved ? DS.color.ok : DS.color.primary}`, borderRadius: DS.radius, fontFamily: DS.font, fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, transition: 'all 0.15s' }}>
            {saved ? ic.check('#fff') : ic.save(DS.color.primary)} {saving ? 'Записване...' : saved ? 'Записано!' : 'Запиши'}
          </button>
          <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: DS.color.surface, color: DS.color.graphiteMed, border: `1.5px solid ${DS.color.borderLight}`, borderRadius: DS.radius, fontFamily: DS.font, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            {ic.print(DS.color.graphiteMed)} Печат
          </button>
        </div>

        {records.map((record, idx) => {
          const isHov = hoverRow === idx;
          const degStyle = getDegreeStyle(record.degree);
          return (
            <div key={record.id} onMouseEnter={() => setHoverRow(idx)} onMouseLeave={() => setHoverRow(null)}
              style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: isHov ? DS.shadow.md : DS.shadow.sm, border: `1px solid ${isHov ? DS.color.primary : DS.color.borderLight}`, overflow: 'hidden', marginBottom: '10px', transition: 'all 0.15s', animation: `stagger 0.3s ease ${idx * 50}ms both` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {ic.flame(DS.color.primary)}
                  <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary }}>Запис #{idx + 1}</span>
                  {record.degree && (
                    <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, padding: '2px 10px', borderRadius: DS.radius, ...degStyle }}>Степен {record.degree}</span>
                  )}
                </div>
                {records.length > 1 && (
                  <button onClick={() => removeRecord(idx)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', backgroundColor: DS.color.dangerBg, color: DS.color.danger, border: 'none', borderRadius: DS.radius, cursor: 'pointer', fontFamily: DS.font, fontSize: '10px', fontWeight: 600 }}>
                    {ic.trash(DS.color.danger)} Изтрий
                  </button>
                )}
              </div>
              <div style={{ padding: pad }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: mob ? 'wrap' : 'nowrap' }}>
                  <DInput label="Дата на изпържване" type="date" value={record.date} onChange={e => updateRecord(idx, 'date', e.target.value)} />
                  <DInput label="Час" type="time" value={record.time} onChange={e => updateRecord(idx, 'time', e.target.value)} style={{ maxWidth: mob ? '100%' : '120px' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: mob ? 'wrap' : 'nowrap' }}>
                  <DInput label="Количество" value={record.quantity} onChange={e => updateRecord(idx, 'quantity', e.target.value)} placeholder="напр. 50 кг" />
                  <DInput label="Партида, L" value={record.batchLot} onChange={e => updateRecord(idx, 'batchLot', e.target.value)} placeholder="напр. L2025-0601" />
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>Степен на изпържване</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {DEGREES.map(deg => {
                      const selected = record.degree === deg.value;
                      return (
                        <button key={deg.value} onClick={() => updateRecord(idx, 'degree', deg.value)} style={{ flex: 1, padding: mob ? '12px 8px' : '14px 12px', backgroundColor: selected ? deg.bg : DS.color.surfaceAlt, border: `2px solid ${selected ? deg.color : DS.color.borderLight}`, borderRadius: DS.radius, cursor: 'pointer', fontFamily: DS.font, fontWeight: 700, color: selected ? deg.color : DS.color.graphiteMuted, transition: 'all 0.15s', boxShadow: selected ? `0 0 0 3px ${deg.color}15` : 'none', textAlign: 'center' }}>
                          <div style={{ fontSize: mob ? '20px' : '24px', lineHeight: 1 }}>{deg.value}</div>
                          {!mob && <div style={{ fontSize: '10px', fontWeight: 500, marginTop: '4px', opacity: 0.8 }}>{deg.desc}</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <DInput label="Забележки (по избор)" value={record.notes} onChange={e => updateRecord(idx, 'notes', e.target.value)} placeholder="Допълнителни бележки..." />
              </div>
            </div>
          );
        })}

        {records.length > 1 && records.some(r => r.degree) && (
          <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ padding: '10px 14px', backgroundColor: DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {ic.dot(DS.color.primary)}
              <span style={{ fontFamily: DS.font, fontSize: '12px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Обобщение</span>
            </div>
            <div style={{ padding: pad, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {DEGREES.map(deg => {
                const count = records.filter(r => r.degree === deg.value).length;
                return (
                  <div key={deg.value} style={{ flex: 1, minWidth: '70px', textAlign: 'center', padding: '12px', backgroundColor: count > 0 ? deg.bg : DS.color.surfaceAlt, border: `1px solid ${count > 0 ? deg.color + '30' : DS.color.borderLight}`, borderRadius: DS.radius, opacity: count > 0 ? 1 : 0.5 }}>
                    <div style={{ fontFamily: DS.font, fontSize: '24px', fontWeight: 700, color: count > 0 ? deg.color : DS.color.graphiteMuted }}>{count}</div>
                    <div style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: count > 0 ? deg.color : DS.color.graphiteMuted }}>Степен {deg.value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', padding: '16px', fontFamily: DS.font }}>
          <p style={{ fontSize: '11px', color: DS.color.graphiteLight, margin: '0 0 2px' }}>Код: НСL 02 • Редакция: 00 • Стр. 1 от 1</p>
          <p style={{ fontSize: '10px', color: DS.color.graphiteMuted, margin: 0, borderTop: `1px solid ${DS.color.borderLight}`, paddingTop: '8px' }}>© 2026 Aladin Foods | by MG</p>
        </div>
      </div>
    </div></>);
};

export default ThermalProcessingSheet;