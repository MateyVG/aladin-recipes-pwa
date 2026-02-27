// IncomingControlHistory.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const DS = {
  color: {
    bg: '#ECEEED', surface: '#FFFFFF', surfaceAlt: '#F7F9F8',
    primary: '#1B5E37', primaryLight: '#2D7A4F', primaryGlow: 'rgba(27,94,55,0.08)',
    cardHeader: '#E8F5EE',
    graphite: '#1E2A26', graphiteMed: '#3D4F48', graphiteLight: '#6B7D76', graphiteMuted: '#95A39D',
    ok: '#1B8A50', okBg: '#E8F5EE',
    warning: '#C47F17', warningBg: '#FFFBEB',
    danger: '#C53030', dangerBg: '#FEF2F2',
    info: '#2563EB', infoBg: '#EFF6FF',
    incoming: '#7C3AED', incomingBg: '#F5F3FF',
    border: '#D5DDD9', borderLight: '#E4EBE7',
  },
  font: "'DM Sans', system-ui, sans-serif",
  radius: '0px',
  shadow: { sm: '0 1px 3px rgba(30,42,38,0.06),0 1px 2px rgba(30,42,38,0.04)' },
};
const LOGO = 'https://aladinfoods.bg/assets/images/aladinfoods_logo.png';
const CSS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');*,*::before,*::after{box-sizing:border-box}body{margin:0;background:${DS.color.bg}}@keyframes cf{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes sp{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@media(max-width:767px){input,button,select,textarea{font-size:16px!important}}`;

const Ic = ({ n, sz = 16, c = 'currentColor', style: s }) => {
  const d = {
    back: <path d="M15 18l-6-6 6-6" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    search: <><circle cx="11" cy="11" r="8" fill="none" stroke={c} strokeWidth="2"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke={c} strokeWidth="2"/><circle cx="12" cy="12" r="3" fill="none" stroke={c} strokeWidth="2"/></>,
    print: <><polyline points="6 9 6 2 18 2 18 9" fill="none" stroke={c} strokeWidth="2"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" fill="none" stroke={c} strokeWidth="2"/><rect x="6" y="14" width="12" height="8" fill="none" stroke={c} strokeWidth="2"/></>,
    trash: <><polyline points="3 6 5 6 21 6" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    truck: <><rect x="1" y="3" width="15" height="13" fill="none" stroke={c} strokeWidth="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" fill="none" stroke={c} strokeWidth="2"/><circle cx="5.5" cy="18.5" r="2.5" fill="none" stroke={c} strokeWidth="2"/><circle cx="18.5" cy="18.5" r="2.5" fill="none" stroke={c} strokeWidth="2"/></>,
    filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    file: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="none" stroke={c} strokeWidth="2"/><polyline points="14 2 14 8 20 8" fill="none" stroke={c} strokeWidth="2"/></>,
  };
  return <svg width={sz} height={sz} viewBox="0 0 24 24" style={{ flexShrink: 0, display: 'block', ...s }}>{d[n]}</svg>;
};

const useR = () => { const [w, sW] = useState(window.innerWidth); useEffect(() => { const h = () => sW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h) }, []); return w < 768; };

const inputBase = (f) => ({ width: '100%', padding: '10px 12px', backgroundColor: f ? DS.color.surface : DS.color.surfaceAlt, border: `1.5px solid ${f ? DS.color.primary : DS.color.borderLight}`, borderRadius: DS.radius, fontSize: '14px', fontFamily: DS.font, fontWeight: 400, color: DS.color.graphite, outline: 'none', transition: 'all 150ms', boxShadow: f ? `0 0 0 3px ${DS.color.primaryGlow}` : 'none', boxSizing: 'border-box', WebkitAppearance: 'none' });
const DI = ({ label, type = 'text', value, onChange, style: s }) => { const [f, sF] = useState(false); return <div style={{ minWidth: 0, flex: 1, ...s }}>{label && <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: f ? DS.color.primary : DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</label>}<input type={type} value={value} onChange={onChange} onFocus={() => sF(true)} onBlur={() => sF(false)} style={inputBase(f)} /></div>; };
const DSel = ({ label, value, onChange, children, style: s }) => { const [f, sF] = useState(false); return <div style={{ minWidth: 0, flex: 1, ...s }}>{label && <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: f ? DS.color.primary : DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</label>}<select value={value} onChange={onChange} onFocus={() => sF(true)} onBlur={() => sF(false)} style={{ ...inputBase(f), cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2395A39D' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: '28px' }}>{children}</select></div>; };

const Btn = ({ children, onClick, disabled: dis, variant: vr = 'primary', icon: ic, sm, style: s }) => {
  const V = { primary: [DS.color.primary, '#fff', 'none'], danger: [DS.color.danger, '#fff', 'none'], ghost: [DS.color.surfaceAlt, DS.color.graphiteMed, `1px solid ${DS.color.borderLight}`], info: [DS.color.info, '#fff', 'none'], incoming: [DS.color.incoming, '#fff', 'none'] };
  const v = V[vr] || V.primary;
  return <button onClick={onClick} disabled={dis} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: sm ? '5px 10px' : '10px 18px', backgroundColor: dis ? DS.color.graphiteMuted : v[0], color: dis ? '#fff' : v[1], border: dis ? 'none' : v[2], borderRadius: DS.radius, fontFamily: DS.font, fontSize: sm ? '11px' : '13px', fontWeight: 600, cursor: dis ? 'not-allowed' : 'pointer', transition: 'all 150ms', minHeight: sm ? '28px' : '40px', ...s }}>{ic && <Ic n={ic} sz={sm ? 11 : 14} c={dis ? '#fff' : v[1]} />}{children}</button>;
};

const SH = ({ icon: ic, title, right, bg }) => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: bg || DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}` }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>{ic && <Ic n={ic} sz={18} c={DS.color.primary} />}<span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{title}</span></div>{right}</div>;
const Cd = ({ children, style: s, ...rest }) => <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, overflow: 'hidden', animation: 'cf 0.4s ease', ...s }} {...rest}>{children}</div>;
const TH = { padding: '8px 10px', border: `1px solid ${DS.color.borderLight}`, textAlign: 'left', fontSize: '10px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: DS.font };
const TD = { padding: '8px 10px', border: `1px solid ${DS.color.borderLight}`, fontFamily: DS.font, fontSize: '12px' };

const IncomingControlHistory = () => {
  const { user } = useAuth();
  const mob = useR();
  const pad = mob ? '12px' : '20px';

  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', status: 'all' });

  // === ALL LOGIC UNCHANGED ===
  useEffect(() => { if (user) loadRecords(); }, [user]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      let query = supabase.from('incoming_control_records').select(`*, incoming_control_materials (id, supplier_name, material_name, quantity, batch_number, temperature, transport_type, receipt_date, expiry_date, status, notes)`).order('control_date', { ascending: false });
      if (filters.startDate) query = query.gte('control_date', filters.startDate);
      if (filters.endDate) query = query.lte('control_date', filters.endDate);
      if (filters.status !== 'all') query = query.eq('status', filters.status);
      const { data, error } = await query;
      if (error) throw error;
      setRecords(data || []);
    } catch (error) { console.error('Error loading records:', error); alert('Грешка при зареждане на история'); }
    finally { setLoading(false); }
  };

  const handleViewRecord = (record) => setSelectedRecord(record);
  const handleCloseDetails = () => setSelectedRecord(null);

  const handlePrint = (record) => {
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintHTML(record);
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 250);
  };

  const generatePrintHTML = (record) => {
    const materialsTable = record.incoming_materials
      .map((m, i) => `<tr><td style="border:1px solid #ddd;padding:8px">${i + 1}</td><td style="border:1px solid #ddd;padding:8px">${m.material_name}</td><td style="border:1px solid #ddd;padding:8px">${m.supplier_name}</td><td style="border:1px solid #ddd;padding:8px">${m.quantity}</td><td style="border:1px solid #ddd;padding:8px">${m.batch_number}</td><td style="border:1px solid #ddd;padding:8px">${m.temperature || '-'}°C</td><td style="border:1px solid #ddd;padding:8px">${m.transport_type || '-'}</td><td style="border:1px solid #ddd;padding:8px">${m.receipt_date ? new Date(m.receipt_date).toLocaleDateString('bg-BG') : '-'}</td><td style="border:1px solid #ddd;padding:8px">${m.expiry_date ? new Date(m.expiry_date).toLocaleDateString('bg-BG') : '-'}</td></tr>`)
      .join('');
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Входящ контрол - ${new Date(record.control_date).toLocaleDateString('bg-BG')}</title>
<style>@media print{@page{margin:2cm;size:A4 landscape}body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}body{font-family:Arial,sans-serif;font-size:11px;line-height:1.4}.header{text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:3px solid ${DS.color.primary}}.header h1{margin:0;color:${DS.color.primary};font-size:24px}.header p{margin:5px 0;color:#666}.info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-bottom:30px}.info-item{display:flex;gap:10px}.info-label{font-weight:bold;color:${DS.color.primary};min-width:120px}table{width:100%;border-collapse:collapse;margin-bottom:30px}th{background:${DS.color.primary};color:white;padding:10px 8px;text-align:left;font-size:10px;font-weight:600;border:1px solid ${DS.color.primary}}td{border:1px solid #ddd;padding:8px}tr:nth-child(even){background-color:#f9f9f9}.footer{margin-top:50px;padding-top:20px;border-top:1px solid #ddd;display:flex;justify-content:space-between}.signature{text-align:center;min-width:200px}.signature-line{border-top:1px solid #333;margin-top:50px;padding-top:5px}.print-date{text-align:right;color:#666;font-size:10px;margin-top:20px}</style>
</head><body>
<div class="header"><h1>ПРОТОКОЛ</h1><h2>Входящ контрол на суровини и материали</h2><p>Код: FS-IC-01 • Ревизия 01</p></div>
<div class="info-grid"><div class="info-item"><span class="info-label">Фирма:</span><span>${record.company_name}</span></div><div class="info-item"><span class="info-label">Обект:</span><span>${record.object_name}</span></div><div class="info-item"><span class="info-label">Дата на контрол:</span><span>${new Date(record.control_date).toLocaleDateString('bg-BG')}</span></div><div class="info-item"><span class="info-label">Управител:</span><span>${record.manager_name}</span></div><div class="info-item"><span class="info-label">Брой материали:</span><span>${record.incoming_materials.length}</span></div><div class="info-item"><span class="info-label">Статус:</span><span>${record.status === 'finalized' ? 'Финализиран' : 'Чернова'}</span></div></div>
<table><thead><tr><th>#</th><th>Материал</th><th>Доставчик</th><th>Количество</th><th>Партида</th><th>Темп.</th><th>Транспорт</th><th>Дата получаване</th><th>Срок годност</th></tr></thead><tbody>${materialsTable}</tbody></table>
<div class="footer"><div class="signature"><div class="signature-line">${record.manager_name}</div><div style="margin-top:5px;font-size:10px">Управител</div></div><div class="signature"><div class="signature-line">_________________</div><div style="margin-top:5px;font-size:10px">Приемащ</div></div></div>
<div class="print-date">Разпечатано на: ${new Date().toLocaleDateString('bg-BG')} ${new Date().toLocaleTimeString('bg-BG')}</div>
</body></html>`;
  };

  const handleExportPDF = async (record) => { alert('PDF експорт функционалност (интегрирай jsPDF библиотека)'); };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Сигурен ли си че искаш да изтриеш този запис? Това действие е необратимо!')) return;
    try {
      setLoading(true);
      const { error } = await supabase.from('incoming_control_records').delete().eq('id', recordId);
      if (error) throw error;
      alert('Записът е изтрит успешно');
      loadRecords();
      if (selectedRecord?.id === recordId) setSelectedRecord(null);
    } catch (error) { console.error('Error deleting record:', error); alert('Грешка при изтриване: ' + error.message); }
    finally { setLoading(false); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('bg-BG') : '-';
  const fmtDateLong = (d) => d ? new Date(d).toLocaleDateString('bg-BG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-';

  return (<><style>{CSS}</style>
    <div style={{ minHeight: '100vh', backgroundColor: DS.color.bg, fontFamily: DS.font, color: DS.color.graphite, display: 'flex', flexDirection: 'column' }}>

      {/* DARK TOP BAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: DS.color.graphite, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#4ADE80' }} /><span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 600, fontFamily: DS.font }}>Online</span></div>
        <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '4px 10px', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{records.length} записа</span>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: pad, flex: 1, width: '100%' }}>

        {/* LOGO + TITLE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: mob ? '10px' : '14px', marginBottom: '16px' }}>
          <img src={LOGO} alt="Aladin Foods" style={{ height: mob ? '36px' : '48px', objectFit: 'contain', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
          <div>
            <h1 style={{ fontSize: mob ? '16px' : '22px', fontWeight: 700, color: DS.color.incoming, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.2, textTransform: 'uppercase', fontFamily: DS.font }}>История входящ контрол</h1>
            <p style={{ fontFamily: DS.font, fontSize: mob ? '10px' : '12px', color: DS.color.graphiteLight, fontWeight: 500, margin: '3px 0 0' }}>Преглед на всички записи</p>
          </div>
        </div>

        {/* FILTERS */}
        <Cd style={{ marginBottom: '12px' }}>
          <SH icon="filter" title="Филтри" />
          <div style={{ padding: pad }}>
            <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '12px', alignItems: 'end' }}>
              <DI label="От дата" type="date" value={filters.startDate} onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))} />
              <DI label="До дата" type="date" value={filters.endDate} onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))} />
              <DSel label="Статус" value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
                <option value="all">Всички</option>
                <option value="finalized">Финализирани</option>
                <option value="draft">Чернови</option>
              </DSel>
              <Btn onClick={loadRecords} icon="search">Търси</Btn>
            </div>
          </div>
        </Cd>

        {/* RECORDS LIST */}
        <Cd>
          <SH icon="truck" title={`Записи (${records.length})`} bg={DS.color.incomingBg} />

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, border: `3px solid ${DS.color.borderLight}`, borderTop: `3px solid ${DS.color.incoming}`, borderRadius: '50%', animation: 'sp 0.8s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteLight, margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>Зареждане...</p>
            </div>
          ) : records.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <Ic n="truck" sz={48} c={DS.color.graphiteMuted} style={{ margin: '0 auto 12px' }} />
              <p style={{ fontFamily: DS.font, fontSize: '14px', color: DS.color.graphiteMuted, margin: 0 }}>Няма записи за показване</p>
            </div>
          ) : (
            <div style={{ padding: '6px' }}>
              {records.map((rec, idx) => (
                <div key={rec.id} style={{ padding: '14px', margin: '4px', backgroundColor: idx % 2 === 0 ? DS.color.surface : DS.color.surfaceAlt, border: `1px solid ${DS.color.borderLight}`, animation: 'cf 0.3s ease', animationDelay: `${Math.min(idx * 30, 300)}ms`, animationFillMode: 'both' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontFamily: DS.font, fontSize: '14px', fontWeight: 700, color: DS.color.incoming }}>{fmtDateLong(rec.control_date)}</div>
                      <div style={{ fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteLight, marginTop: '2px' }}>{rec.object_name}</div>
                    </div>
                    <span style={{ padding: '3px 8px', backgroundColor: rec.status === 'finalized' ? DS.color.okBg : DS.color.warningBg, color: rec.status === 'finalized' ? DS.color.ok : DS.color.warning, fontFamily: DS.font, fontSize: '10px', fontWeight: 700 }}>
                      {rec.status === 'finalized' ? '✓ Финализиран' : 'Чернова'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteLight, marginBottom: '10px' }}>
                    <span><strong>Материали:</strong> {rec.incoming_control_materials?.length || rec.incoming_materials?.length || 0}</span>
                    <span><strong>Управител:</strong> {rec.manager_name}</span>
                    {rec.finalized_at && <span><strong>Финализиран:</strong> {fmtDate(rec.finalized_at)}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <Btn sm icon="eye" variant="incoming" onClick={() => handleViewRecord(rec)}>Преглед</Btn>
                    <Btn sm icon="print" variant="ghost" onClick={() => handlePrint(rec)}>Печат</Btn>
                    <Btn sm icon="file" variant="ghost" onClick={() => handleExportPDF(rec)}>PDF</Btn>
                    {rec.status === 'draft' && <Btn sm icon="trash" variant="danger" onClick={() => handleDeleteRecord(rec.id)}>Изтрий</Btn>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Cd>
      </div>

      {/* DETAILS MODAL */}
      {selectedRecord && (
        <div onClick={handleCloseDetails} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(30,42,38,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: DS.color.surface, border: `1px solid ${DS.color.borderLight}`, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '100%', maxWidth: '900px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', animation: 'cf 0.3s ease' }}>

            {/* Modal Header */}
            <div style={{ padding: '14px 20px', backgroundColor: DS.color.incomingBg, borderBottom: `1px solid ${DS.color.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Ic n="truck" sz={20} c={DS.color.incoming} />
                <span style={{ fontFamily: DS.font, fontSize: '15px', fontWeight: 700, color: DS.color.incoming }}>Входящ контрол — {fmtDate(selectedRecord.control_date)}</span>
              </div>
              <button onClick={handleCloseDetails} style={{ padding: '6px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}><Ic n="x" sz={20} c={DS.color.graphiteMuted} /></button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {/* Basic Info */}
              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: DS.color.okBg, border: `1px solid ${DS.color.ok}33`, fontFamily: DS.font, fontSize: '13px', display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: '8px' }}>
                <div><strong style={{ color: DS.color.primary }}>Фирма:</strong> {selectedRecord.company_name}</div>
                <div><strong style={{ color: DS.color.primary }}>Обект:</strong> {selectedRecord.object_name}</div>
                <div><strong style={{ color: DS.color.primary }}>Управител:</strong> {selectedRecord.manager_name}</div>
                <div><strong style={{ color: DS.color.primary }}>Статус:</strong> <span style={{ padding: '2px 6px', backgroundColor: selectedRecord.status === 'finalized' ? DS.color.okBg : DS.color.warningBg, color: selectedRecord.status === 'finalized' ? DS.color.ok : DS.color.warning, fontWeight: 700, fontSize: '11px' }}>{selectedRecord.status === 'finalized' ? 'Финализиран' : 'Чернова'}</span></div>
              </div>

              {/* Materials Table */}
              <div style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.incoming, textTransform: 'uppercase', marginBottom: '8px' }}>Материали ({(selectedRecord.incoming_control_materials || selectedRecord.incoming_materials || []).length})</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: DS.font, fontSize: '12px' }}>
                  <thead><tr style={{ backgroundColor: DS.color.cardHeader }}>
                    {['#','Материал','Доставчик','Кол-во','Партида','Темп.','Транспорт','Получено'].map((h, i) => <th key={i} style={TH}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {(selectedRecord.incoming_control_materials || selectedRecord.incoming_materials || []).map((m, i) => (
                      <tr key={m.id} style={{ backgroundColor: i % 2 === 0 ? DS.color.surface : DS.color.surfaceAlt }}>
                        <td style={{ ...TD, textAlign: 'center', fontWeight: 700 }}>{i + 1}</td>
                        <td style={{ ...TD, fontWeight: 600 }}>{m.material_name}</td>
                        <td style={TD}>{m.supplier_name}</td>
                        <td style={{ ...TD, textAlign: 'center' }}>{m.quantity}</td>
                        <td style={{ ...TD, textAlign: 'center' }}>{m.batch_number}</td>
                        <td style={{ ...TD, textAlign: 'center' }}>{m.temperature}°C</td>
                        <td style={{ ...TD, textAlign: 'center' }}>{m.transport_type}</td>
                        <td style={{ ...TD, textAlign: 'center' }}>{m.receipt_date ? fmtDate(m.receipt_date) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 20px', borderTop: `1px solid ${DS.color.borderLight}`, display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Btn variant="ghost" icon="x" onClick={handleCloseDetails}>Затвори</Btn>
              <Btn variant="incoming" icon="print" onClick={() => handlePrint(selectedRecord)}>Печат</Btn>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: mob ? '16px 12px' : '20px 24px', color: DS.color.graphiteMuted, fontFamily: DS.font, fontSize: '11px', fontWeight: 500, borderTop: `1px solid ${DS.color.borderLight}`, marginTop: 'auto' }}>© 2026 Aladin Foods | by MG</div>
    </div></>);
};

export default IncomingControlHistory;