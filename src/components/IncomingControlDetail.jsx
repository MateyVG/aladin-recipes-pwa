// IncomingControlDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const DS = {
  color: {
    bg: '#ECEEED', surface: '#FFFFFF', surfaceAlt: '#F7F9F8',
    primary: '#1B5E37', primaryGlow: 'rgba(27,94,55,0.08)',
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
const CSS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');*,*::before,*::after{box-sizing:border-box}body{margin:0;background:${DS.color.bg}}@keyframes cf{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@media(max-width:767px){input,button,select,textarea{font-size:16px!important}}`;

const Ic = ({ n, sz = 16, c = 'currentColor', style: s }) => {
  const d = {
    back: <path d="M15 18l-6-6 6-6" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" fill="none" stroke={c} strokeWidth="2"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" fill="none" stroke={c} strokeWidth="2"/></>,
    save: <><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/><polyline points="17 21 17 13 7 13 7 21" fill="none" stroke={c} strokeWidth="2"/><polyline points="7 3 7 8 15 8" fill="none" stroke={c} strokeWidth="2"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    print: <><polyline points="6 9 6 2 18 2 18 9" fill="none" stroke={c} strokeWidth="2"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" fill="none" stroke={c} strokeWidth="2"/><rect x="6" y="14" width="12" height="8" fill="none" stroke={c} strokeWidth="2"/></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="none" stroke={c} strokeWidth="2"/><line x1="12" y1="9" x2="12" y2="13" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    truck: <><rect x="1" y="3" width="15" height="13" fill="none" stroke={c} strokeWidth="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" fill="none" stroke={c} strokeWidth="2"/><circle cx="5.5" cy="18.5" r="2.5" fill="none" stroke={c} strokeWidth="2"/><circle cx="18.5" cy="18.5" r="2.5" fill="none" stroke={c} strokeWidth="2"/></>,
  };
  return <svg width={sz} height={sz} viewBox="0 0 24 24" style={{ flexShrink: 0, display: 'block', ...s }}>{d[n]}</svg>;
};

const useR = () => { const [w, sW] = useState(window.innerWidth); useEffect(() => { const h = () => sW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h) }, []); return w < 768; };

const TH = { padding: '10px 12px', border: `1px solid ${DS.color.borderLight}`, textAlign: 'center', fontSize: '10px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: DS.font };
const TD = { padding: '10px', border: `1px solid ${DS.color.borderLight}`, fontFamily: DS.font, fontSize: '13px' };

const IncomingControlDetail = ({ record: initialRecord, onBack }) => {
  const mob = useR();
  const pad = mob ? '12px' : '20px';
  const [editMode, setEditMode] = useState(false);
  const [record, setRecord] = useState(initialRecord);
  const [loading, setLoading] = useState(false);
  const contentRef = useRef(null);

  // === ALL LOGIC UNCHANGED ===
  useEffect(() => { if (editMode && contentRef.current) enableInlineEditing(); }, [editMode]);

  const enableInlineEditing = () => {
    const tables = contentRef.current.querySelectorAll('table');
    tables.forEach(table => {
      const cells = table.querySelectorAll('td');
      cells.forEach(cell => {
        if (cell.textContent.trim() === '-' || cell.textContent.trim() === '') return;
        cell.contentEditable = 'true';
        cell.style.backgroundColor = DS.color.infoBg;
        cell.style.outline = `2px dashed ${DS.color.info}`;
        cell.style.outlineOffset = '-2px';
        cell.style.cursor = 'text';
        cell.dataset.originalValue = cell.textContent.trim();
      });
    });
  };

  const handleSave = async () => { alert('Запазване на промени за входящ контрол - в процес на разработка'); setEditMode(false); };
  const handleCancel = () => { if (window.confirm('Сигурни ли сте? Всички промени ще бъдат загубени.')) { setEditMode(false); window.location.reload(); } };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintHTML();
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
  };

  const formatSimpleDate = (dateString) => { if (!dateString) return '-'; return new Date(dateString).toLocaleDateString('bg-BG'); };

  // === PRINT HTML — UNCHANGED (internal print styling stays as-is) ===
  const generatePrintHTML = () => {
    const materials = record.incoming_control_materials || [];
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Входящ контрол - ${formatSimpleDate(record.control_date)}</title>
<style>@page{size:A4;margin:15mm}body{font-family:Arial,sans-serif;font-size:11px;line-height:1.4;color:#000;margin:0;padding:0}.header{text-align:center;margin-bottom:20px;border-bottom:3px solid ${DS.color.primary};padding-bottom:15px}.header h1{margin:0 0 10px;font-size:20px;color:${DS.color.primary}}.header .info{font-size:12px;color:#666}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;padding:10px;background-color:#f9fafb;border:1px solid #e5e7eb}table{width:100%;border-collapse:collapse;margin-bottom:20px;page-break-inside:avoid}thead{display:table-header-group}th{background-color:${DS.color.primary}!important;color:white!important;padding:10px 8px;text-align:left;font-size:10px;font-weight:600;border:1px solid ${DS.color.primaryLight};-webkit-print-color-adjust:exact;print-color-adjust:exact}td{padding:8px;border:1px solid #d1d5db;font-size:10px}tr:nth-child(even){background-color:#f9fafb!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}.status-approved{background-color:#d1fae5!important;color:#065f46!important;padding:3px 6px;font-weight:600;font-size:9px;-webkit-print-color-adjust:exact;print-color-adjust:exact}.status-rejected{background-color:#fee2e2!important;color:#991b1b!important;padding:3px 6px;font-weight:600;font-size:9px;-webkit-print-color-adjust:exact;print-color-adjust:exact}.status-pending{background-color:#fef3c7!important;color:#92400e!important;padding:3px 6px;font-weight:600;font-size:9px;-webkit-print-color-adjust:exact;print-color-adjust:exact}.notes{margin-top:20px;padding:10px;background-color:#f9fafb;border:1px solid #e5e7eb}.notes h4{margin:0 0 8px;color:${DS.color.primary};font-size:12px}.footer{margin-top:30px;text-align:center;font-size:10px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:10px}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style>
</head><body>
<div class="header"><h1>ВХОДЯЩ КОНТРОЛ</h1><div class="info">Дата: ${formatSimpleDate(record.control_date)}</div></div>
<div class="info-grid"><div class="info-item"><strong>Дата на контрол:</strong> ${formatSimpleDate(record.control_date)}</div><div class="info-item"><strong>Време на създаване:</strong> ${new Date(record.created_at).toLocaleString('bg-BG')}</div>${record.supplier ? `<div class="info-item"><strong>Доставчик:</strong> ${record.supplier}</div>` : ''}<div class="info-item"><strong>Брой материали:</strong> ${materials.length}</div></div>
<table><thead><tr><th style="width:15%">Доставчик</th><th style="width:20%">Материал</th><th style="width:10%">Количество</th><th style="width:10%">Партиден №</th><th style="width:8%">Темп. °C</th><th style="width:10%">Транспорт</th><th style="width:10%">Доставка</th><th style="width:10%">Годност</th><th style="width:7%">Статус</th></tr></thead>
<tbody>${materials.map(m => `<tr><td>${m.supplier_name || '-'}</td><td>${m.material_name || '-'}</td><td style="text-align:center">${m.quantity || '-'}</td><td style="text-align:center">${m.batch_number || '-'}</td><td style="text-align:center">${m.temperature || '-'}</td><td style="text-align:center">${m.transport_type || '-'}</td><td style="text-align:center">${formatSimpleDate(m.receipt_date)}</td><td style="text-align:center">${formatSimpleDate(m.expiry_date)}</td><td style="text-align:center"><span class="status-${m.status === 'approved' ? 'approved' : m.status === 'rejected' ? 'rejected' : 'pending'}">${m.status === 'approved' ? 'Одобрен' : m.status === 'rejected' ? 'Отхвърлен' : 'Чакащ'}</span></td></tr>`).join('')}</tbody></table>
${record.notes ? `<div class="notes"><h4>Забележки:</h4><p>${record.notes}</p></div>` : ''}
<div class="footer">Генерирано на ${new Date().toLocaleString('bg-BG')} | Aladin Foods</div>
</body></html>`;
  };

  const materials = record.incoming_control_materials || [];
  const statusBg = (s) => s === 'approved' ? DS.color.okBg : s === 'rejected' ? DS.color.dangerBg : DS.color.warningBg;
  const statusColor = (s) => s === 'approved' ? DS.color.ok : s === 'rejected' ? DS.color.danger : DS.color.warning;
  const statusLabel = (s) => s === 'approved' ? 'Одобрен' : s === 'rejected' ? 'Отхвърлен' : 'Чакащ';

  return (<><style>{CSS}</style>
    <div style={{ minHeight: '100vh', backgroundColor: DS.color.bg, fontFamily: DS.font, color: DS.color.graphite, display: 'flex', flexDirection: 'column' }}>

      {/* DARK TOP BAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: DS.color.graphite, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: DS.radius, color: 'white', fontSize: '12px', fontFamily: DS.font, fontWeight: 600, cursor: 'pointer' }}>
          <Ic n="back" sz={14} c="white" /> Назад
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {editMode && <span style={{ padding: '3px 8px', backgroundColor: DS.color.warning, color: '#fff', fontFamily: DS.font, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Редакция</span>}
          {!editMode && (
            <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: DS.radius, color: 'white', fontSize: '11px', fontFamily: DS.font, fontWeight: 600, cursor: 'pointer' }}>
              <Ic n="print" sz={12} c="white" /> Принт
            </button>
          )}
          {!editMode ? (
            <button onClick={() => setEditMode(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', backgroundColor: DS.color.warning, border: 'none', borderRadius: DS.radius, color: '#fff', fontSize: '11px', fontFamily: DS.font, fontWeight: 600, cursor: 'pointer' }}>
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
            <h1 style={{ fontSize: mob ? '16px' : '22px', fontWeight: 700, color: DS.color.incoming, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.2, textTransform: 'uppercase', fontFamily: DS.font }}>Входящ контрол</h1>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontFamily: DS.font, fontSize: mob ? '10px' : '12px', color: DS.color.graphiteLight, fontWeight: 500, marginTop: '4px' }}>
              <span>{formatSimpleDate(record.control_date)}</span>
              {record.supplier && <span>{record.supplier}</span>}
              {record.status && <span style={{ padding: '1px 6px', backgroundColor: record.status === 'finalized' ? DS.color.okBg : DS.color.warningBg, color: record.status === 'finalized' ? DS.color.ok : DS.color.warning, fontWeight: 700, fontSize: '10px' }}>{record.status === 'finalized' ? 'Финализиран' : 'Чернова'}</span>}
            </div>
          </div>
        </div>

        {/* EDIT WARNING */}
        {editMode && (
          <div style={{ padding: '12px 16px', backgroundColor: DS.color.warningBg, border: `1px solid ${DS.color.warning}44`, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Ic n="alert" sz={20} c={DS.color.warning} />
            <div>
              <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.warning }}>Режим на редакция</span>
              <p style={{ margin: '2px 0 0', fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteLight }}>Кликнете директно върху стойностите за да ги редактирайте.</p>
            </div>
          </div>
        )}

        {/* MATERIALS TABLE */}
        <div ref={contentRef} style={{ backgroundColor: DS.color.surface, border: `1px solid ${DS.color.borderLight}`, boxShadow: DS.shadow.sm, overflow: 'hidden', animation: 'cf 0.4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: DS.color.incomingBg, borderBottom: `1px solid ${DS.color.borderLight}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Ic n="truck" sz={18} c={DS.color.incoming} />
              <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.incoming, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Материали</span>
            </div>
            <span style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.graphiteMuted }}>{materials.length} записа</span>
          </div>

          {materials.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: DS.font, fontSize: '13px' }}>
                <thead><tr style={{ backgroundColor: DS.color.cardHeader }}>
                  {['Доставчик','Материал','Кол-во','Партиден №','Темп.','Транспорт','Доставка','Годност','Статус'].map((h, i) => (
                    <th key={i} style={{ ...TH, textAlign: i <= 1 ? 'left' : 'center' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {materials.map((m, idx) => (
                    <tr key={m.id} style={{ backgroundColor: idx % 2 === 0 ? DS.color.surface : DS.color.surfaceAlt, borderBottom: `1px solid ${DS.color.borderLight}` }}>
                      <td style={TD}>{m.supplier_name || '-'}</td>
                      <td style={TD}>{m.material_name || '-'}</td>
                      <td style={{ ...TD, textAlign: 'center' }}>{m.quantity || '-'}</td>
                      <td style={{ ...TD, textAlign: 'center' }}>{m.batch_number || '-'}</td>
                      <td style={{ ...TD, textAlign: 'center' }}>{m.temperature ? `${m.temperature}°C` : '-'}</td>
                      <td style={{ ...TD, textAlign: 'center' }}>{m.transport_type || '-'}</td>
                      <td style={{ ...TD, textAlign: 'center' }}>{formatSimpleDate(m.receipt_date)}</td>
                      <td style={{ ...TD, textAlign: 'center' }}>{formatSimpleDate(m.expiry_date)}</td>
                      <td style={{ ...TD, textAlign: 'center' }}>
                        <span style={{ padding: '3px 8px', backgroundColor: statusBg(m.status), color: statusColor(m.status), fontFamily: DS.font, fontSize: '10px', fontWeight: 700 }}>{statusLabel(m.status)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <Ic n="truck" sz={48} c={DS.color.graphiteMuted} style={{ margin: '0 auto 12px' }} />
              <p style={{ fontFamily: DS.font, fontSize: '14px', color: DS.color.graphiteMuted, margin: 0 }}>Няма добавени материали</p>
            </div>
          )}

          {record.notes && (
            <div style={{ margin: '0', padding: '16px', borderTop: `1px solid ${DS.color.borderLight}` }}>
              <div style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 700, color: DS.color.incoming, textTransform: 'uppercase', marginBottom: '6px' }}>Забележки</div>
              <p style={{ margin: 0, fontFamily: DS.font, fontSize: '13px', color: DS.color.graphiteMed, lineHeight: 1.5, padding: '10px', backgroundColor: DS.color.surfaceAlt, border: `1px solid ${DS.color.borderLight}` }}>{record.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: mob ? '16px 12px' : '20px 24px', color: DS.color.graphiteMuted, fontFamily: DS.font, fontSize: '11px', fontWeight: 500, borderTop: `1px solid ${DS.color.borderLight}`, marginTop: 'auto' }}>© 2026 Aladin Foods | by MG</div>
    </div></>);
};

export default IncomingControlDetail;