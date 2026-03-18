// UnifiedHistory.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigationHistory } from '../hooks/useNavigationHistory';
import ImprovedSubmissionDetail from './ImprovedSubmissionDetail';
import IncomingControlDetail from './IncomingControlDetail';

const DS = {
  color: {
    bg: '#ECEEED', surface: '#FFFFFF', surfaceAlt: '#F7F9F8',
    primary: '#1B5E37', primaryGlow: 'rgba(27,94,55,0.08)',
    cardHeader: '#E8F5EE',
    graphite: '#1E2A26', graphiteMed: '#3D4F48', graphiteLight: '#6B7D76', graphiteMuted: '#95A39D',
    ok: '#1B8A50', okBg: '#E8F5EE',
    warning: '#C47F17', warningBg: '#FFFBEB',
    danger: '#C53030', dangerBg: '#FEF2F2',
    incoming: '#7C3AED', incomingBg: '#F5F3FF',
    health: '#0369A1', healthBg: '#E0F2FE',
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
    filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    x: <><line x1="18" y1="6" x2="6" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke={c} strokeWidth="2"/><circle cx="12" cy="12" r="3" fill="none" stroke={c} strokeWidth="2"/></>,
    clipboard: <><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" fill="none" stroke={c} strokeWidth="2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1" fill="none" stroke={c} strokeWidth="2"/></>,
    truck: <><rect x="1" y="3" width="15" height="13" fill="none" stroke={c} strokeWidth="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" fill="none" stroke={c} strokeWidth="2"/><circle cx="5.5" cy="18.5" r="2.5" fill="none" stroke={c} strokeWidth="2"/><circle cx="18.5" cy="18.5" r="2.5" fill="none" stroke={c} strokeWidth="2"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 016.5 17H20" fill="none" stroke={c} strokeWidth="2"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" fill="none" stroke={c} strokeWidth="2"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="none" stroke={c} strokeWidth="2"/><line x1="16" y1="2" x2="16" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="2" x2="8" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="10" x2="21" y2="10" stroke={c} strokeWidth="2"/></>,
    clock: <><circle cx="12" cy="12" r="10" fill="none" stroke={c} strokeWidth="2"/><polyline points="12 6 12 12 16 14" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    user: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" fill="none" stroke={c} strokeWidth="2"/><circle cx="12" cy="7" r="4" fill="none" stroke={c} strokeWidth="2"/></>,
    inbox: <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="none" stroke={c} strokeWidth="2"/><line x1="12" y1="9" x2="12" y2="13" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
  };
  return <svg width={sz} height={sz} viewBox="0 0 24 24" style={{ flexShrink: 0, display: 'block', ...s }}>{d[n]}</svg>;
};

const useR = () => { const [w, sW] = useState(window.innerWidth); useEffect(() => { const h = () => sW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []); return w < 768; };

const Cd = ({ children, style: s, ...rest }) => <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, overflow: 'hidden', animation: 'cf 0.4s ease', ...s }} {...rest}>{children}</div>;
const SH = ({ icon, title, right, bg }) => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: bg || DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}` }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>{icon && <Ic n={icon} sz={18} c={DS.color.primary} />}<span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{title}</span></div>{right}</div>;

const inputBase = (f) => ({ width: '100%', padding: '10px 12px', backgroundColor: f ? DS.color.surface : DS.color.surfaceAlt, border: `1.5px solid ${f ? DS.color.primary : DS.color.borderLight}`, borderRadius: DS.radius, fontSize: '14px', fontFamily: DS.font, fontWeight: 400, color: DS.color.graphite, outline: 'none', transition: 'all 150ms', boxShadow: f ? `0 0 0 3px ${DS.color.primaryGlow}` : 'none', boxSizing: 'border-box', WebkitAppearance: 'none' });
const DI = ({ label, type = 'text', value, onChange, style: s }) => { const [f, sF] = useState(false); return <div style={{ minWidth: 0, flex: 1, ...s }}>{label && <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: f ? DS.color.primary : DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</label>}<input type={type} value={value} onChange={onChange} onFocus={() => sF(true)} onBlur={() => sF(false)} style={inputBase(f)} /></div>; };
const DSel = ({ label, value, onChange, children, style: s }) => { const [f, sF] = useState(false); return <div style={{ minWidth: 0, flex: 1, ...s }}>{label && <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: f ? DS.color.primary : DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</label>}<select value={value} onChange={onChange} onFocus={() => sF(true)} onBlur={() => sF(false)} style={{ ...inputBase(f), cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2395A39D' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: '28px' }}>{children}</select></div>; };

const Btn = ({ children, onClick, variant: vr = 'primary', icon: ic, sm, style: s }) => {
  const V = { primary: [DS.color.primary, '#fff'], ghost: [DS.color.surfaceAlt, DS.color.graphiteMed], incoming: [DS.color.incoming, '#fff'], health: [DS.color.health, '#fff'] };
  const v = V[vr] || V.primary;
  return <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: sm ? '5px 10px' : '10px 18px', backgroundColor: v[0], color: v[1], border: vr === 'ghost' ? `1px solid ${DS.color.borderLight}` : 'none', borderRadius: DS.radius, fontFamily: DS.font, fontSize: sm ? '11px' : '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', minHeight: sm ? '28px' : '40px', ...s }}>{ic && <Ic n={ic} sz={sm ? 11 : 14} c={v[1]} />}{children}</button>;
};

// ─── Детайлен изглед за здравна книжка — таблица за печат ───
const HealthBookDetail = ({ record, onBack, mob }) => {
  const rows = (record.health_book_rows || []).filter(r => r.employee_name?.trim());

  const daysUntil = (d) => {
    if (!d) return null;
    const [y,m,day] = d.split('-').map(Number);
    const exp = new Date(y,m-1,day);
    const today = new Date(); today.setHours(0,0,0,0);
    return Math.ceil((exp-today)/(1000*60*60*24));
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    const [y,m,day] = d.split('-').map(Number);
    return `${String(day).padStart(2,'0')}.${String(m).padStart(2,'0')}.${y}`;
  };

  const Badge = ({ dateStr }) => {
    const days = daysUntil(dateStr); if (days === null) return <span style={{color:DS.color.graphiteMuted,fontSize:'10px'}}>—</span>;
    const cfg = days < 0
      ? { bg: DS.color.danger, color: '#fff', label: 'ИЗТЕКЛА' }
      : days <= 30
        ? { bg: DS.color.warning, color: '#fff', label: `${days}д.` }
        : { bg: DS.color.ok, color: '#fff', label: 'ВАЛИДНА' };
    return <span style={{ display:'inline-block', fontFamily:DS.font, fontWeight:700, fontSize:'9px', padding:'2px 6px', backgroundColor:cfg.bg, color:cfg.color, letterSpacing:'0.04em' }}>{cfg.label}</span>;
  };

  const expired  = rows.filter(r => { const d1=daysUntil(r.expiry_date_1), d2=daysUntil(r.expiry_date_2); return (d1!==null&&d1<0)||(d2!==null&&d2<0); }).length;
  const expiring = rows.filter(r => { const d1=daysUntil(r.expiry_date_1), d2=daysUntil(r.expiry_date_2); return (d1!==null&&d1>=0&&d1<=30)||(d2!==null&&d2>=0&&d2<=30); }).length;

  const PRINT_CSS = `
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; margin: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .print-page {
        background: white !important;
        box-shadow: none !important;
        padding: 6mm !important;
        max-width: 100% !important;
        width: 100% !important;
      }
      .print-table-wrap {
        overflow: visible !important;
        width: 100% !important;
      }
      table {
        width: 100% !important;
        min-width: unset !important;
        font-size: 8px !important;
        table-layout: fixed !important;
        page-break-inside: auto;
      }
      th { font-size: 7px !important; padding: 4px 5px !important; }
      td { font-size: 8px !important; padding: 4px 5px !important; }
      tr { page-break-inside: avoid; }
      .print-header { margin-bottom: 8px !important; }
      .print-header h1 { font-size: 13px !important; }
      .print-header p { font-size: 9px !important; }
      .print-header img { height: 36px !important; }
      .print-doc-info { padding: 6px 10px !important; }
      @page {
        size: A4 landscape;
        margin: 8mm 6mm;
      }
    }
  `;

  const thS = {
    padding: '8px 10px', backgroundColor: DS.color.primary, color: 'white',
    fontFamily: DS.font, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.03em', borderRight: '1px solid rgba(255,255,255,0.2)',
    textAlign: 'center', whiteSpace: 'nowrap',
  };
  const thSep = { ...thS, borderLeft: '2px solid rgba(255,255,255,0.35)' };
  const tdS = (isExp, isOdd) => ({
    padding: '9px 10px', borderRight: `1px solid ${DS.color.borderLight}`,
    borderBottom: `1px solid ${DS.color.borderLight}`,
    fontFamily: DS.font, fontSize: '12px', verticalAlign: 'middle',
    backgroundColor: isExp ? '#FEF2F2' : isOdd ? DS.color.surfaceAlt : DS.color.surface,
  });
  const tdSep = (isExp, isOdd) => ({ ...tdS(isExp, isOdd), borderLeft: `2px solid ${DS.color.borderLight}` });

  return (
    <>
      <style>{PRINT_CSS}</style>
      <div style={{ minHeight:'100vh', backgroundColor:DS.color.bg, fontFamily:DS.font, color:DS.color.graphite, display:'flex', flexDirection:'column' }}>

        {/* Top bar — скрива се при печат */}
        <div className="no-print" style={{ position:'sticky', top:0, zIndex:100, backgroundColor:DS.color.graphite, padding:'0 16px', display:'flex', alignItems:'center', justifyContent:'space-between', height:'48px', boxShadow:'0 2px 8px rgba(0,0,0,0.2)' }}>
          <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 12px', backgroundColor:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer', color:'#fff', fontFamily:DS.font, fontSize:'12px', fontWeight:600 }}>
            <Ic n="back" sz={14} c="#fff"/> Назад
          </button>
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            {expired > 0 && <span style={{ backgroundColor:DS.color.danger, color:'#fff', fontFamily:DS.font, fontSize:'11px', fontWeight:700, padding:'4px 10px' }}>{expired} ИЗТЕКЛИ</span>}
            {expiring > 0 && <span style={{ backgroundColor:DS.color.warning, color:'#fff', fontFamily:DS.font, fontSize:'11px', fontWeight:700, padding:'4px 10px' }}>{expiring} ИЗТИЧАТ</span>}
            <button onClick={()=>window.print()} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 20px', backgroundColor:'#fff', border:'none', cursor:'pointer', color:DS.color.primary, fontFamily:DS.font, fontSize:'13px', fontWeight:700, letterSpacing:'0.02em' }}>
              🖨️ Печат / PDF
            </button>
          </div>
        </div>

        {/* Документ */}
        <div className="print-page" style={{ maxWidth:'1400px', margin:'0 auto', padding: mob ? '16px 12px' : '24px', flex:1, width:'100%' }}>

          {/* Официална шапка */}
          <div className="print-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px', flexWrap:'wrap', gap:'12px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
              <img src={LOGO} alt="Aladin Foods" style={{ height:'52px', objectFit:'contain', flexShrink:0 }} onError={e=>{e.target.style.display='none'}}/>
              <div>
                <h1 style={{ fontSize:'18px', fontWeight:700, color:DS.color.primary, margin:0, textTransform:'uppercase', fontFamily:DS.font, letterSpacing:'-0.01em' }}>
                  Регистър на здравните книжки
                </h1>
                <p style={{ fontFamily:DS.font, fontSize:'11px', color:DS.color.graphiteLight, margin:'3px 0 0', fontWeight:500 }}>
                  Контрол на работното облекло и хигиена на персонала
                </p>
              </div>
            </div>
            <div className="print-doc-info" style={{ display:'flex', gap:'16px', backgroundColor:DS.color.surface, border:`1px solid ${DS.color.borderLight}`, padding:'10px 16px' }}>
              {[{ label:'КОД', value:'ПРП 4.0.1' }, { label:'РЕД.', value:'00' }, { label:'СТР.', value:'1/1' }].map((item,i)=>(
                <div key={i} style={{ textAlign:'center' }}>
                  <div style={{ fontFamily:DS.font, fontSize:'9px', fontWeight:600, color:DS.color.graphiteMuted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'2px' }}>{item.label}</div>
                  <div style={{ fontFamily:DS.font, fontSize:'12px', fontWeight:700, color:DS.color.graphite }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stat карти — само за екран */}
          <div className="no-print" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px', marginBottom:'16px' }}>
            {[
              { label:'Служители', value:rows.length, bg:DS.color.okBg, color:DS.color.primary },
              { label:'Изтекли', value:expired, bg:expired>0?DS.color.dangerBg:DS.color.surfaceAlt, color:expired>0?DS.color.danger:DS.color.graphiteLight },
              { label:'Изтичат (30 дни)', value:expiring, bg:expiring>0?DS.color.warningBg:DS.color.surfaceAlt, color:expiring>0?DS.color.warning:DS.color.graphiteLight },
            ].map((s,i)=>(
              <div key={i} style={{ backgroundColor:s.bg, border:`1px solid ${DS.color.borderLight}`, padding:'12px 16px' }}>
                <div style={{ fontFamily:DS.font, fontSize:'22px', fontWeight:700, color:s.color, lineHeight:1 }}>{s.value}</div>
                <div style={{ fontFamily:DS.font, fontSize:'10px', fontWeight:600, color:DS.color.graphiteLight, textTransform:'uppercase', marginTop:'3px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ═══ ТАБЛИЦА ═══ */}
          <div className="print-table-wrap" style={{ backgroundColor:DS.color.surface, border:`1px solid ${DS.color.borderLight}`, overflowX:'auto', boxShadow:DS.shadow.sm }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'800px', tableLayout:'fixed' }}>
              <colgroup>
                <col style={{ width:'3%' }}/>   {/* № */}
                <col style={{ width:'18%' }}/>  {/* Ime */}
                <col style={{ width:'11%' }}/>  {/* Длъжност */}
                <col style={{ width:'9%' }}/>   {/* ЕГН */}
                <col style={{ width:'11%' }}/>  {/* Заверка 1 */}
                <col style={{ width:'11%' }}/>  {/* Изтича 1 */}
                <col style={{ width:'8%' }}/>   {/* Статус 1 */}
                <col style={{ width:'11%' }}/>  {/* Заверка 2 */}
                <col style={{ width:'11%' }}/>  {/* Изтича 2 */}
                <col style={{ width:'7%' }}/>   {/* Статус 2 */}
              </colgroup>
              <thead>
                <tr>
                  <th style={{ ...thS }}>№</th>
                  <th style={{ ...thS, textAlign:'left' }}>Ime и Фамилия</th>
                  <th style={{ ...thS }}>Длъжност</th>
                  <th style={{ ...thS }}>ЕГН</th>
                  <th style={{ ...thSep }}>Дата заверка<br/><span style={{ fontWeight:400, fontSize:'9px', opacity:0.8 }}>1-ва</span></th>
                  <th style={{ ...thS }}>Изтича<br/><span style={{ fontWeight:400, fontSize:'9px', opacity:0.8 }}>1-ва</span></th>
                  <th style={{ ...thS }}>Статус<br/><span style={{ fontWeight:400, fontSize:'9px', opacity:0.8 }}>1-ва</span></th>
                  <th style={{ ...thSep }}>Дата заверка<br/><span style={{ fontWeight:400, fontSize:'9px', opacity:0.8 }}>2-ра</span></th>
                  <th style={{ ...thS }}>Изтича<br/><span style={{ fontWeight:400, fontSize:'9px', opacity:0.8 }}>2-ра</span></th>
                  <th style={{ ...thS, borderRight:'none' }}>Статус<br/><span style={{ fontWeight:400, fontSize:'9px', opacity:0.8 }}>2-ра</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={10} style={{ padding:'32px', textAlign:'center', color:DS.color.graphiteLight, fontFamily:DS.font, fontSize:'13px' }}>Няма добавени служители</td></tr>
                ) : rows.map((row, ri) => {
                  const d1=daysUntil(row.expiry_date_1), d2=daysUntil(row.expiry_date_2);
                  const isExp=(d1!==null&&d1<0)||(d2!==null&&d2<0);
                  const isOdd = ri % 2 !== 0;
                  return (
                    <tr key={row.id||ri}>
                      <td style={{ ...tdS(isExp,isOdd), textAlign:'center', fontWeight:700, color:DS.color.graphiteMuted, fontSize:'11px' }}>{ri+1}</td>
                      <td style={{ ...tdS(isExp,isOdd), fontWeight:600, color:DS.color.graphite }}>{row.employee_name}</td>
                      <td style={{ ...tdS(isExp,isOdd), textAlign:'center', color:DS.color.graphiteMed }}>{row.position || '—'}</td>
                      <td style={{ ...tdS(isExp,isOdd), textAlign:'center', fontFamily:'monospace', fontSize:'11px', color:DS.color.graphiteMed }}>{row.egn || '—'}</td>
                      {/* Заверка 1 */}
                      <td style={{ ...tdSep(isExp,isOdd), textAlign:'center' }}>{fmtDate(row.cert_date_1)}</td>
                      <td style={{ ...tdS(isExp,isOdd), textAlign:'center', fontWeight: d1!==null&&d1<0 ? 700 : 400, color: d1!==null&&d1<0 ? DS.color.danger : d1!==null&&d1<=30 ? DS.color.warning : DS.color.graphite }}>
                        {fmtDate(row.expiry_date_1)}
                      </td>
                      <td style={{ ...tdS(isExp,isOdd), textAlign:'center' }}><Badge dateStr={row.expiry_date_1}/></td>
                      {/* Заверка 2 */}
                      <td style={{ ...tdSep(isExp,isOdd), textAlign:'center' }}>{fmtDate(row.cert_date_2)}</td>
                      <td style={{ ...tdS(isExp,isOdd), textAlign:'center', fontWeight: d2!==null&&d2<0 ? 700 : 400, color: d2!==null&&d2<0 ? DS.color.danger : d2!==null&&d2<=30 ? DS.color.warning : DS.color.graphite }}>
                        {fmtDate(row.expiry_date_2)}
                      </td>
                      <td style={{ ...tdS(isExp,isOdd), textAlign:'center', borderRight:'none' }}><Badge dateStr={row.expiry_date_2}/></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Подпис — само за печат */}
          <div style={{ marginTop:'32px', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
            <div className="no-print">
              <button onClick={()=>window.print()} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 28px', backgroundColor:DS.color.primary, border:'none', cursor:'pointer', color:'#fff', fontFamily:DS.font, fontSize:'14px', fontWeight:700, boxShadow:'0 4px 12px rgba(27,94,55,0.3)' }}>
                🖨️ Печат / Запази PDF
              </button>
              <p style={{ fontFamily:DS.font, fontSize:'11px', color:DS.color.graphiteLight, marginTop:'6px' }}>
                Препоръчан формат: A4 Landscape
              </p>
            </div>
            <div style={{ textAlign:'center', minWidth:'200px' }}>
              <div style={{ borderTop:`1px solid ${DS.color.graphite}`, paddingTop:'6px', fontFamily:DS.font, fontSize:'11px', color:DS.color.graphiteLight }}>
                Утвърждавам: ( Управител )
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign:'center', marginTop:'24px', paddingTop:'16px', borderTop:`1px solid ${DS.color.borderLight}`, color:DS.color.graphiteMuted, fontFamily:DS.font, fontSize:'10px' }}>
            © 2026 Aladin Foods | by MG • Актуализиран на {new Date(record.updated_at).toLocaleDateString('bg-BG')}
          </div>
        </div>
      </div>
    </>
  );
};

const UnifiedHistory = ({ department, restaurantId, onBack }) => {
  useNavigationHistory(onBack);
  const mob = useR();
  const pad = mob ? '12px' : '20px';

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filter, setFilter] = useState({ startDate: '', endDate: '', type: 'all' });
  const [hoverId, setHoverId] = useState(null);

  useEffect(() => { loadAllRecords(); }, [department.id, filter]);

  const loadAllRecords = async () => {
    setLoading(true);
    try {
      // ─── 1. Checklist submissions ───
      let checklistQuery = supabase
        .from('checklist_submissions')
        .select('*, checklist_templates(name, description, config), profiles(full_name, email)')
        .eq('restaurant_id', restaurantId)
        .eq('department_id', department.id)
        .order('submission_date', { ascending: false });
      if (filter.startDate) checklistQuery = checklistQuery.gte('submission_date', filter.startDate);
      if (filter.endDate) checklistQuery = checklistQuery.lte('submission_date', filter.endDate);

      // ─── 2. Incoming control ───
      let incomingQuery = supabase
        .from('incoming_control_records')
        .select('*, incoming_control_materials(*)')
        .order('control_date', { ascending: false });
      if (filter.startDate) incomingQuery = incomingQuery.gte('control_date', filter.startDate);
      if (filter.endDate) incomingQuery = incomingQuery.lte('control_date', filter.endDate);

      // ─── 3. Health books (взимаме последния snapshot от health_books) ───
      let healthQuery = supabase
        .from('health_books')
        .select('id, restaurant_id, employee_name, position, egn, cert_date_1, expiry_date_1, cert_date_2, expiry_date_2, updated_at')
        .eq('restaurant_id', restaurantId)
        .order('updated_at', { ascending: false });

      const [
        { data: checklistData, error: checklistError },
        { data: incomingData, error: incomingError },
        { data: healthData },
      ] = await Promise.all([checklistQuery, incomingQuery, healthQuery]);

      if (checklistError) throw checklistError;

      const checklistRecords = (checklistData || []).map(r => ({
        ...r, type: 'checklist',
        display_date: r.submission_date,
        display_title: r.checklist_templates?.name || 'Checklist',
        display_subtitle: r.checklist_templates?.description || '',
      }));

      const incomingRecords = (!incomingError && incomingData) ? incomingData.map(r => ({
        ...r, type: 'incoming',
        display_date: r.control_date,
        display_title: 'Входящ контрол',
        display_subtitle: `${r.incoming_control_materials?.length || 0} материала`,
      })) : [];

      // Групираме всички health_books записи в един виртуален запис
      const healthRecords = (healthData && healthData.length > 0) ? [{
        id: 'health_books',
        type: 'health',
        display_date: healthData[0].updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        display_title: 'Регистър на здравните книжки',
        display_subtitle: `${healthData.filter(r=>r.employee_name?.trim()).length} служители`,
        updated_at: healthData[0].updated_at,
        health_book_rows: healthData,
      }] : [];

      let allRecords = [...checklistRecords, ...incomingRecords, ...healthRecords];

      if (filter.type !== 'all') allRecords = allRecords.filter(r => r.type === filter.type);
      allRecords.sort((a, b) => new Date(b.display_date) - new Date(a.display_date));

      setRecords(allRecords);
    } catch (error) {
      console.error('Error loading records:', error);
      alert('Грешка при зареждане на история');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('bg-BG', { year:'numeric', month:'long', day:'numeric' });
  const formatTime = (d) => new Date(d).toLocaleTimeString('bg-BG', { hour:'2-digit', minute:'2-digit' });
  const getIcon = (r) => r.type==='incoming'?'truck':r.type==='health'?'book':'clipboard';
  const getColor = (r) => r.type==='incoming'?DS.color.incoming:r.type==='health'?DS.color.health:DS.color.primary;
  const getBg = (r) => r.type==='incoming'?DS.color.incomingBg:r.type==='health'?DS.color.healthBg:DS.color.cardHeader;

  // ─── Detail routing ───
  if (selectedRecord) {
    if (selectedRecord.type === 'incoming') return <IncomingControlDetail record={selectedRecord} onBack={()=>setSelectedRecord(null)}/>;
    if (selectedRecord.type === 'health') return <HealthBookDetail record={selectedRecord} onBack={()=>setSelectedRecord(null)} mob={mob}/>;
    return <ImprovedSubmissionDetail submission={selectedRecord} onBack={()=>setSelectedRecord(null)}/>;
  }

  return (<><style>{CSS}</style>
    <div style={{ minHeight:'100vh', backgroundColor:DS.color.bg, fontFamily:DS.font, color:DS.color.graphite, display:'flex', flexDirection:'column' }}>

      <div style={{ position:'sticky', top:0, zIndex:100, backgroundColor:DS.color.graphite, padding:'0 16px', display:'flex', alignItems:'center', justifyContent:'space-between', height:'48px', boxShadow:'0 2px 8px rgba(0,0,0,0.2)' }}>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 12px', backgroundColor:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:DS.radius, cursor:'pointer', color:'#fff', fontFamily:DS.font, fontSize:'12px', fontWeight:600 }}>
          <Ic n="back" sz={14} c="#fff"/> Назад
        </button>
        <span style={{ backgroundColor:'rgba(255,255,255,0.08)', padding:'4px 10px', fontFamily:DS.font, fontSize:'11px', fontWeight:600, color:'rgba(255,255,255,0.5)' }}>{records.length} записа</span>
      </div>

      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:pad, flex:1, width:'100%' }}>

        <div style={{ display:'flex', alignItems:'center', gap:mob?'10px':'14px', marginBottom:'16px' }}>
          <img src={LOGO} alt="Aladin Foods" style={{ height:mob?'36px':'48px', objectFit:'contain', flexShrink:0 }} onError={e=>{e.target.style.display='none'}}/>
          <div>
            <h1 style={{ fontSize:mob?'16px':'22px', fontWeight:700, color:DS.color.primary, margin:0, letterSpacing:'-0.01em', lineHeight:1.2, textTransform:'uppercase', fontFamily:DS.font }}>История</h1>
            <p style={{ fontFamily:DS.font, fontSize:mob?'10px':'12px', color:DS.color.graphiteLight, fontWeight:500, margin:'3px 0 0' }}>{department.name} • {records.length} записа</p>
          </div>
        </div>

        <Cd style={{ marginBottom:'12px' }}>
          <SH icon="filter" title="Филтри" right={<Btn sm icon="x" variant="ghost" onClick={()=>setFilter({startDate:'',endDate:'',type:'all'})}>Изчисти</Btn>}/>
          <div style={{ padding:pad }}>
            <div style={{ display:'grid', gridTemplateColumns:mob?'1fr 1fr':'repeat(3,1fr)', gap:'12px', alignItems:'end' }}>
              <DI label="От дата" type="date" value={filter.startDate} onChange={e=>setFilter({...filter,startDate:e.target.value})}/>
              <DI label="До дата" type="date" value={filter.endDate} onChange={e=>setFilter({...filter,endDate:e.target.value})}/>
              <DSel label="Тип" value={filter.type} onChange={e=>setFilter({...filter,type:e.target.value})}>
                <option value="all">Всички</option>
                <option value="checklist">Само чек листи</option>
                <option value="incoming">Само входящ контрол</option>
                <option value="health">Само здравни книжки</option>
              </DSel>
            </div>
          </div>
        </Cd>

        {loading ? (
          <Cd style={{ padding:'40px', textAlign:'center' }}>
            <div style={{ width:36, height:36, border:`3px solid ${DS.color.borderLight}`, borderTop:`3px solid ${DS.color.primary}`, borderRadius:'50%', animation:'sp 0.8s linear infinite', margin:'0 auto 12px' }}/>
            <p style={{ fontFamily:DS.font, fontSize:'12px', color:DS.color.graphiteLight, margin:0, fontWeight:600, textTransform:'uppercase' }}>Зареждане...</p>
          </Cd>
        ) : records.length === 0 ? (
          <Cd style={{ padding:'40px', textAlign:'center' }}>
            <Ic n="inbox" sz={48} c={DS.color.graphiteMuted} style={{ margin:'0 auto 12px' }}/>
            <p style={{ fontFamily:DS.font, fontSize:'14px', color:DS.color.graphiteMuted, margin:0 }}>Няма налични записи</p>
          </Cd>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {records.map((record, idx) => {
              const rc = getColor(record);
              const hovered = hoverId === `${record.type}-${record.id}`;
              return (
                <Cd key={`${record.type}-${record.id}`}
                  onClick={()=>setSelectedRecord(record)}
                  onMouseEnter={()=>setHoverId(`${record.type}-${record.id}`)}
                  onMouseLeave={()=>setHoverId(null)}
                  style={{ cursor:'pointer', transition:'all 0.15s', border:hovered?`2px solid ${rc}`:`1px solid ${DS.color.borderLight}`, transform:hovered?'translateX(5px)':'translateX(0)', boxShadow:hovered?`0 4px 12px ${rc}20`:DS.shadow.sm, animationDelay:`${Math.min(idx*30,300)}ms`, animationFillMode:'both' }}>
                  <div style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:'14px' }}>
                    <div style={{ width:mob?44:52, height:mob?44:52, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:getBg(record), border:`1px solid ${rc}33` }}>
                      <Ic n={getIcon(record)} sz={mob?20:24} c={rc}/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'10px', marginBottom:'6px', flexWrap:'wrap' }}>
                        <div>
                          <h3 style={{ margin:'0 0 2px', fontFamily:DS.font, fontSize:mob?'14px':'15px', fontWeight:700, color:rc }}>{record.display_title}</h3>
                          {record.display_subtitle && <p style={{ margin:0, fontFamily:DS.font, fontSize:'12px', color:DS.color.graphiteLight }}>{record.display_subtitle}</p>}
                        </div>
                        <Btn sm icon="eye" variant={record.type==='incoming'?'incoming':record.type==='health'?'health':'primary'}>Преглед</Btn>
                      </div>
                      <div style={{ display:'flex', gap:mob?'8px':'16px', flexWrap:'wrap', fontFamily:DS.font, fontSize:'11px', color:DS.color.graphiteMuted }}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:'3px' }}><Ic n="calendar" sz={10} c={DS.color.graphiteMuted}/>{formatDate(record.display_date)}</span>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:'3px' }}><Ic n="clock" sz={10} c={DS.color.graphiteMuted}/>{record.type==='health' ? new Date(record.updated_at).toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit'}) : formatTime(record.type==='incoming'?record.created_at:record.submitted_at)}</span>
                        {record.profiles?.full_name && <span style={{ display:'inline-flex', alignItems:'center', gap:'3px' }}><Ic n="user" sz={10} c={DS.color.graphiteMuted}/>{record.profiles.full_name}</span>}
                      </div>
                    </div>
                  </div>
                </Cd>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ textAlign:'center', padding:mob?'16px 12px':'20px 24px', color:DS.color.graphiteMuted, fontFamily:DS.font, fontSize:'11px', fontWeight:500, borderTop:`1px solid ${DS.color.borderLight}`, marginTop:'auto' }}>© 2026 Aladin Foods | by MG</div>
    </div></>);
};

export default UnifiedHistory;