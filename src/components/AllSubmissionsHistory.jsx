// src/components/AllSubmissionsHistory.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ImprovedSubmissionDetail from './ImprovedSubmissionDetail'
import IncomingControlDetail from './IncomingControlDetail'

const DS = {
  color: {
    bg: '#ECEEED', surface: '#FFFFFF', surfaceAlt: '#F7F9F8',
    primary: '#1B5E37', primaryLight: '#2D7A4F', primaryGlow: 'rgba(27,94,55,0.08)',
    cardHeader: '#E8F5EE',
    graphite: '#1E2A26', graphiteMed: '#3D4F48', graphiteLight: '#6B7D76', graphiteMuted: '#95A39D',
    ok: '#1B8A50', okBg: '#E8F5EE',
    warning: '#C47F17', danger: '#C53030', dangerBg: '#FEF2F2',
    info: '#2563EB', infoBg: '#EFF6FF',
    incoming: '#7C3AED', incomingBg: '#F5F3FF',
    pendingBg: '#F0F2F1', border: '#D5DDD9', borderLight: '#E4EBE7',
  },
  font: "'DM Sans', system-ui, sans-serif", radius: '0px',
  shadow: { sm: '0 1px 3px rgba(30,42,38,0.06),0 1px 2px rgba(30,42,38,0.04)' },
}
const LOGO = 'https://aladinfoods.bg/assets/images/aladinfoods_logo.png'
const CSS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');*,*::before,*::after{box-sizing:border-box}body{margin:0;background:${DS.color.bg}}@keyframes cf{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes sp{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@media(max-width:767px){input,button,select,textarea{font-size:16px!important}}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${DS.color.graphiteMuted}}`

const Ic = ({ n, sz = 16, c = 'currentColor', style: s }) => {
  const d = { back: <path d="M15 18l-6-6 6-6" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>, download: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/><polyline points="7 10 12 15 17 10" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="15" x2="12" y2="3" stroke={c} strokeWidth="2" strokeLinecap="round"/></>, filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>, x: <><line x1="18" y1="6" x2="6" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/></>, eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke={c} strokeWidth="2"/><circle cx="12" cy="12" r="3" fill="none" stroke={c} strokeWidth="2"/></>, cb: <><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" fill="none" stroke={c} strokeWidth="2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1" fill="none" stroke={c} strokeWidth="2"/></>, truck: <><rect x="1" y="3" width="15" height="13" fill="none" stroke={c} strokeWidth="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" fill="none" stroke={c} strokeWidth="2"/><circle cx="5.5" cy="18.5" r="2.5" fill="none" stroke={c} strokeWidth="2"/><circle cx="18.5" cy="18.5" r="2.5" fill="none" stroke={c} strokeWidth="2"/></> }
  return <svg width={sz} height={sz} viewBox="0 0 24 24" style={{ flexShrink: 0, display: 'block', ...s }}>{d[n]}</svg>
}

const useR = () => { const [w, sW] = useState(window.innerWidth); useEffect(() => { const h = () => sW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h) }, []); return w < 768 }
const iB = (f) => ({ width: '100%', padding: '10px 12px', backgroundColor: f ? DS.color.surface : DS.color.surfaceAlt, border: `1.5px solid ${f ? DS.color.primary : DS.color.borderLight}`, borderRadius: DS.radius, fontSize: '14px', fontFamily: DS.font, fontWeight: 400, color: DS.color.graphite, outline: 'none', transition: 'all 150ms', boxShadow: f ? `0 0 0 3px ${DS.color.primaryGlow}` : 'none', boxSizing: 'border-box', WebkitAppearance: 'none' })

const DI = ({ label, type = 'text', value, onChange, placeholder, style: s, ...r }) => { const [f, sF] = useState(false); return <div style={{ minWidth: 0, flex: 1, ...s }}>{label && <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: f ? DS.color.primary : DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</label>}<input type={type} value={value} onChange={onChange} placeholder={placeholder} onFocus={() => sF(true)} onBlur={() => sF(false)} style={iB(f)} {...r} /></div> }
const DSel = ({ label, value, onChange, children, style: s }) => { const [f, sF] = useState(false); return <div style={{ minWidth: 0, flex: 1, ...s }}>{label && <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: f ? DS.color.primary : DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</label>}<select value={value} onChange={onChange} onFocus={() => sF(true)} onBlur={() => sF(false)} style={{ ...iB(f), cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2395A39D' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: '28px' }}>{children}</select></div> }

const Btn = ({ children, onClick, disabled: dis, variant: vr = 'primary', icon: ic, sm, style: s }) => { const V = { primary: [DS.color.primary, '#fff', 'none'], ghost: [DS.color.pendingBg, DS.color.graphiteMed, `1px solid ${DS.color.borderLight}`], outline: ['transparent', DS.color.primary, `1.5px solid ${DS.color.primary}`], incoming: [DS.color.incoming, '#fff', 'none'] }; const v = V[vr] || V.primary; return <button onClick={onClick} disabled={dis} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: sm ? '6px 12px' : '10px 18px', backgroundColor: dis ? DS.color.graphiteMuted : v[0], color: dis ? '#fff' : v[1], border: dis ? 'none' : v[2], borderRadius: DS.radius, fontFamily: DS.font, fontSize: sm ? '11px' : '13px', fontWeight: 600, cursor: dis ? 'not-allowed' : 'pointer', transition: 'all 150ms', minHeight: sm ? '30px' : '40px', ...s }}>{ic && <Ic n={ic} sz={sm ? 12 : 14} c={dis ? '#fff' : v[1]} />}{children}</button> }

const SH = ({ icon: ic, title, right }) => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}` }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>{ic && <Ic n={ic} sz={18} c={DS.color.primary} />}<span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{title}</span></div>{right}</div>
const Cd = ({ children, style: s, ...rest }) => <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, overflow: 'hidden', animation: 'cf 0.4s ease', ...s }} {...rest}>{children}</div>

const AllSubmissionsHistory = ({ restaurantId, onBack }) => {
  const mob = useR(); const pad = mob ? '12px' : '20px'
  const [subs, setSubs] = useState([]); const [ld, setLd] = useState(true)
  const [sel, setSel] = useState(null)
  const [flt, setFlt] = useState({ startDate: '', endDate: '', departmentId: '', templateId: '', searchTerm: '' })
  const [depts, setDepts] = useState([]); const [tmpls, setTmpls] = useState([])

  useEffect(() => { loadFD(); loadSubs() }, [restaurantId, flt])

  const loadFD = async () => { try { const { data: dd } = await supabase.from('departments').select('id,name').eq('restaurant_id', restaurantId).eq('active', true).order('name'); setDepts(dd || []); const { data: td } = await supabase.from('restaurant_templates').select('checklist_templates(id,name)').eq('restaurant_id', restaurantId).eq('enabled', true); setTmpls(td?.map(r => r.checklist_templates).filter((t, i, a) => a.findIndex(x => x.id === t.id) === i) || []) } catch (e) { console.error(e) } }

  const loadSubs = async () => {
    setLd(true); try {
      let q = supabase.from('checklist_submissions').select('*,checklist_templates(id,name,description,config),departments(id,name),profiles(full_name,email)').eq('restaurant_id', restaurantId).order('submission_date', { ascending: false }).order('submitted_at', { ascending: false })
      if (flt.startDate) q = q.gte('submission_date', flt.startDate); if (flt.endDate) q = q.lte('submission_date', flt.endDate)
      if (flt.departmentId) q = q.eq('department_id', flt.departmentId); if (flt.templateId) q = q.eq('template_id', flt.templateId)
      const { data: cd, error: ce } = await q; if (ce) throw ce
      let iq = supabase.from('incoming_control_records').select('*,incoming_control_materials(*)').order('control_date', { ascending: false })
      if (flt.startDate) iq = iq.gte('control_date', flt.startDate); if (flt.endDate) iq = iq.lte('control_date', flt.endDate)
      const { data: id2, error: ie } = await iq
      const cr = (cd || []).map(r => ({ ...r, type: 'checklist', display_date: r.submission_date, display_title: r.checklist_templates?.name || 'Checklist', display_department: r.departments?.name || '-' }))
      const ir = (!ie && id2) ? id2.map(r => ({ ...r, type: 'incoming', display_date: r.control_date, display_title: 'Входящ контрол', display_department: 'Operations' })) : []
      let all = [...cr, ...ir].sort((a, b) => new Date(b.display_date) - new Date(a.display_date))
      if (flt.searchTerm) { const s = flt.searchTerm.toLowerCase(); all = all.filter(x => x.type === 'checklist' ? (x.checklist_templates?.name?.toLowerCase().includes(s) || x.departments?.name?.toLowerCase().includes(s) || x.profiles?.full_name?.toLowerCase().includes(s) || JSON.stringify(x.data).toLowerCase().includes(s)) : (x.display_title.toLowerCase().includes(s) || x.supplier?.toLowerCase().includes(s) || JSON.stringify(x.incoming_control_materials).toLowerCase().includes(s))) }
      setSubs(all)
    } catch (e) { console.error(e); alert('Грешка при зареждане') } finally { setLd(false) }
  }

  const fd = d => new Date(d).toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' })
  const fds = d => new Date(d).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit' })
  const ft = d => new Date(d).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })
  const gs = s => `${s.data?.rows?.length || 0} реда`

  const csv = () => { const c = ['Дата,Час,Отдел,Чек лист,Попълнил,Редове', ...subs.map(s => [s.submission_date, ft(s.submitted_at), s.departments?.name || '', s.checklist_templates?.name || '', s.profiles?.full_name || '', s.data?.rows?.length || 0].map(f => `"${f}"`).join(','))].join('\n'); const b = new Blob(['\uFEFF' + c], { type: 'text/csv;charset=utf-8' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `история_${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(u) }

  if (sel) { console.log('Selected:', sel, 'Type:', sel.type); if (sel.type === 'incoming') return <IncomingControlDetail record={sel} onBack={() => setSel(null)} />; return <ImprovedSubmissionDetail submission={sel} onBack={() => setSel(null)} /> }

  const nC = subs.filter(s => s.type === 'checklist').length, nI = subs.filter(s => s.type === 'incoming').length

  return (<><style>{CSS}</style>
    <div style={{ minHeight: '100vh', backgroundColor: DS.color.bg, fontFamily: DS.font, color: DS.color.graphite, display: 'flex', flexDirection: 'column' }}>

      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: DS.color.graphite, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: DS.radius, color: 'white', fontSize: '12px', fontFamily: DS.font, fontWeight: 600, cursor: 'pointer' }}><Ic n="back" sz={14} c="white" /> Назад</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#4ADE80' }} /><span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 600 }}>Online</span></div>
        <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '4px 10px', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{subs.length} записа</span>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: pad, flex: 1, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: mob ? '10px' : '14px' }}>
            <img src={LOGO} alt="Aladin Foods" style={{ height: mob ? '36px' : '48px', objectFit: 'contain', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
            <div>
              <h1 style={{ fontSize: mob ? '16px' : '22px', fontWeight: 700, color: DS.color.primary, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.2, textTransform: 'uppercase', fontFamily: DS.font }}>Пълна история</h1>
              <p style={{ fontFamily: DS.font, fontSize: mob ? '10px' : '12px', color: DS.color.graphiteLight, fontWeight: 500, margin: '3px 0 0' }}>Чек листи и входящ контрол от всички отдели</p>
            </div>
          </div>
          <Btn onClick={csv} disabled={subs.length === 0} ic="download" vr="outline" sm>CSV</Btn>
        </div>

        <Cd style={{ marginBottom: '12px' }}>
          <SH icon="filter" title="Филтри" />
          <div style={{ padding: pad }}>
            <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr 1fr' : 'repeat(4,1fr)', gap: '12px', marginBottom: '12px' }}>
              <DI label="От дата" type="date" value={flt.startDate} onChange={e => setFlt({ ...flt, startDate: e.target.value })} />
              <DI label="До дата" type="date" value={flt.endDate} onChange={e => setFlt({ ...flt, endDate: e.target.value })} />
              <DSel label="Отдел" value={flt.departmentId} onChange={e => setFlt({ ...flt, departmentId: e.target.value })}><option value="">Всички</option>{depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</DSel>
              <DSel label="Чек лист" value={flt.templateId} onChange={e => setFlt({ ...flt, templateId: e.target.value })}><option value="">Всички</option>{tmpls.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</DSel>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <DI value={flt.searchTerm} onChange={e => setFlt({ ...flt, searchTerm: e.target.value })} placeholder="Търсене..." style={{ flex: 1 }} />
              <Btn onClick={() => setFlt({ startDate: '', endDate: '', departmentId: '', templateId: '', searchTerm: '' })} vr="ghost" ic="x" sm>Изчисти</Btn>
            </div>
          </div>
        </Cd>

        {ld ? (<Cd><div style={{ padding: '40px', textAlign: 'center' }}><div style={{ width: 36, height: 36, border: `3px solid ${DS.color.borderLight}`, borderTop: `3px solid ${DS.color.primary}`, borderRadius: '50%', animation: 'sp 0.8s linear infinite', margin: '0 auto 12px' }} /><p style={{ fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteLight, margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>Зареждане...</p></div></Cd>
        ) : subs.length === 0 ? (<Cd><div style={{ padding: '40px', textAlign: 'center' }}><Ic n="cb" sz={48} c={DS.color.graphiteMuted} style={{ margin: '0 auto 12px' }} /><p style={{ fontFamily: DS.font, fontSize: '14px', color: DS.color.graphiteMuted, margin: 0 }}>Няма записи с тези филтри</p></div></Cd>
        ) : (
          <Cd>
            <SH icon="cb" title={`Записи (${subs.length})`} right={<span style={{ fontFamily: DS.font, fontSize: '10px', color: DS.color.graphiteMuted, fontWeight: 600 }}>{nC} чек листи • {nI} входящи</span>} />
            {!mob ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: DS.font, fontSize: '12px' }}>
                  <thead><tr style={{ backgroundColor: DS.color.cardHeader }}>{['Дата', 'Час', 'Тип', 'Чек лист', 'Попълнил', 'Данни', ''].map(h => <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '9px', fontWeight: 700, color: DS.color.graphiteMuted, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `2px solid ${DS.color.borderLight}` }}>{h}</th>)}</tr></thead>
                  <tbody>{subs.map((s, i) => { const isI = s.type === 'incoming', bg = isI ? DS.color.incomingBg : (i % 2 === 0 ? DS.color.surface : DS.color.surfaceAlt); return (
                    <tr key={`${s.type}-${s.id}`} style={{ borderBottom: `1px solid ${DS.color.borderLight}`, backgroundColor: bg, cursor: 'pointer', transition: 'background-color 150ms' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = isI ? '#EDE9FE' : DS.color.okBg} onMouseLeave={e => e.currentTarget.style.backgroundColor = bg} onClick={() => setSel(s)}>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{fd(s.display_date)}</td>
                      <td style={{ padding: '10px 12px', color: DS.color.graphiteLight }}>{ft(isI ? s.created_at : s.submitted_at)}</td>
                      <td style={{ padding: '10px 12px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', fontSize: '10px', fontWeight: 700, backgroundColor: isI ? DS.color.incomingBg : DS.color.infoBg, color: isI ? DS.color.incoming : DS.color.info, border: `1px solid ${isI ? DS.color.incoming : DS.color.info}22` }}><Ic n={isI ? 'truck' : 'cb'} sz={10} c={isI ? DS.color.incoming : DS.color.info} />{isI ? 'Входящ' : (s.departments?.name || '—')}</span></td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: isI ? DS.color.incoming : DS.color.primary }}>{s.display_title}</td>
                      <td style={{ padding: '10px 12px', color: DS.color.graphiteLight }}>{isI ? (s.supplier || '—') : (s.profiles?.full_name || s.profiles?.email || '—')}</td>
                      <td style={{ padding: '10px 12px', fontSize: '11px', color: DS.color.graphiteMuted }}>{isI ? `${s.incoming_control_materials?.length || 0} мат.` : gs(s)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}><button onClick={e => { e.stopPropagation(); setSel(s) }} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: isI ? DS.color.incoming : DS.color.primary, color: '#fff', border: 'none', borderRadius: DS.radius, cursor: 'pointer', fontFamily: DS.font, fontSize: '10px', fontWeight: 700 }}><Ic n="eye" sz={11} c="#fff" />Виж</button></td>
                    </tr>) })}</tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '6px' }}>{subs.map((s, i) => { const isI = s.type === 'incoming'; return (
                <div key={`${s.type}-${s.id}`} onClick={() => setSel(s)} style={{ padding: '12px', margin: '4px', backgroundColor: isI ? DS.color.incomingBg : (i % 2 === 0 ? DS.color.surface : DS.color.surfaceAlt), border: `1px solid ${DS.color.borderLight}`, cursor: 'pointer', animation: 'cf 0.3s ease', animationDelay: `${Math.min(i * 30, 300)}ms`, animationFillMode: 'both' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: isI ? DS.color.incoming : DS.color.primary, display: 'flex', alignItems: 'center', gap: '6px' }}><Ic n={isI ? 'truck' : 'cb'} sz={14} c={isI ? DS.color.incoming : DS.color.primary} />{s.display_title}</span>
                    <span style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 600, padding: '2px 6px', backgroundColor: isI ? DS.color.incomingBg : DS.color.okBg, color: isI ? DS.color.incoming : DS.color.primary }}>{isI ? 'Входящ' : (s.departments?.name || '—')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteLight }}>
                    <span>{fds(s.display_date)} • {ft(isI ? s.created_at : s.submitted_at)}</span>
                    <span style={{ fontWeight: 600 }}>{isI ? `${s.incoming_control_materials?.length || 0} мат.` : gs(s)}</span>
                  </div>
                </div>) })}</div>
            )}
          </Cd>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: mob ? '16px 12px' : '20px 24px', color: DS.color.graphiteMuted, fontFamily: DS.font, fontSize: '11px', fontWeight: 500, borderTop: `1px solid ${DS.color.borderLight}`, marginTop: 'auto' }}>© 2026 Aladin Foods | by MG</div>
    </div></>)
}

export default AllSubmissionsHistory