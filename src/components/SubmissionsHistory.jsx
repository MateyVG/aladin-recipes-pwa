// src/components/SubmissionsHistory.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigationHistory } from '../hooks/useNavigationHistory'
import ImprovedSubmissionDetail from './ImprovedSubmissionDetail'

// ============================================
// PDF STYLES INJECTION - ADD ONCE AT MODULE LEVEL
// ============================================
if (typeof document !== 'undefined') {
  const pdfStyles = document.createElement('style')
  pdfStyles.innerHTML = `
    /* PDF Export Optimizations */
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
    }
    
    .pdf-export-mode {
      /* Force backgrounds to print */
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    .pdf-export-mode * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* Optimize tables for PDF */
    .pdf-export-mode table {
      page-break-inside: avoid;
      border-collapse: collapse !important;
    }
    
    .pdf-export-mode thead {
      display: table-header-group;
    }
    
    .pdf-export-mode tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    
    .pdf-export-mode td, .pdf-export-mode th {
      page-break-inside: avoid;
    }
    
    /* Ensure borders are visible */
    .pdf-export-mode table,
    .pdf-export-mode td,
    .pdf-export-mode th {
      border-width: 1px !important;
      border-style: solid !important;
    }
    
    /* Force gradients to render as solid colors for better compatibility */
    .pdf-export-mode thead tr {
      background: #1B5E37 !important;
      background-image: none !important;
    }
    
    /* Ensure text is readable */
    .pdf-export-mode {
      font-size: 11px !important;
      line-height: 1.4 !important;
    }
    
    .pdf-export-mode table {
      font-size: 10px !important;
    }
    
    /* Fix flex/grid layouts for PDF */
    .pdf-export-mode [style*="display: flex"],
    .pdf-export-mode [style*="display: grid"] {
      display: block !important;
    }
  `
  
  // Add styles only once
  if (!document.getElementById('pdf-export-styles')) {
    pdfStyles.id = 'pdf-export-styles'
    document.head.appendChild(pdfStyles)
  }
}

// ============================================
// DS TOKENS
// ============================================
const DS = {
  color: {
    bg: '#ECEEED', surface: '#FFFFFF', surfaceAlt: '#F7F9F8',
    primary: '#1B5E37', primaryGlow: 'rgba(27,94,55,0.08)',
    cardHeader: '#E8F5EE',
    graphite: '#1E2A26', graphiteMed: '#3D4F48', graphiteLight: '#6B7D76', graphiteMuted: '#95A39D',
    ok: '#1B8A50', okBg: '#E8F5EE',
    danger: '#C53030',
    border: '#D5DDD9', borderLight: '#E4EBE7',
  },
  font: "'DM Sans', system-ui, sans-serif",
  radius: '0px',
  shadow: { sm: '0 1px 3px rgba(30,42,38,0.06),0 1px 2px rgba(30,42,38,0.04)' },
}
const LOGO = 'https://aladinfoods.bg/assets/images/aladinfoods_logo.png'
const CSS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');*,*::before,*::after{box-sizing:border-box}body{margin:0;background:${DS.color.bg}}@keyframes cf{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes sp{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@media(max-width:767px){input,button,select,textarea{font-size:16px!important}}`

const Ic = ({ n, sz = 16, c = 'currentColor', style: s }) => {
  const d = {
    back: <path d="M15 18l-6-6 6-6" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    x: <><line x1="18" y1="6" x2="6" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke={c} strokeWidth="2"/><circle cx="12" cy="12" r="3" fill="none" stroke={c} strokeWidth="2"/></>,
    clipboard: <><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" fill="none" stroke={c} strokeWidth="2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1" fill="none" stroke={c} strokeWidth="2"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="none" stroke={c} strokeWidth="2"/><line x1="16" y1="2" x2="16" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="2" x2="8" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="10" x2="21" y2="10" stroke={c} strokeWidth="2"/></>,
    user: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" fill="none" stroke={c} strokeWidth="2"/><circle cx="12" cy="7" r="4" fill="none" stroke={c} strokeWidth="2"/></>,
    clock: <><circle cx="12" cy="12" r="10" fill="none" stroke={c} strokeWidth="2"/><polyline points="12 6 12 12 16 14" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
  }
  return <svg width={sz} height={sz} viewBox="0 0 24 24" style={{ flexShrink: 0, display: 'block', ...s }}>{d[n]}</svg>
}

const useR = () => { const [w, sW] = useState(window.innerWidth); useEffect(() => { const h = () => sW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h) }, []); return w < 768 }

const Cd = ({ children, style: s, ...rest }) => <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, overflow: 'hidden', animation: 'cf 0.4s ease', ...s }} {...rest}>{children}</div>
const SH = ({ icon, title, right, bg }) => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: bg || DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}` }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>{icon && <Ic n={icon} sz={18} c={DS.color.primary} />}<span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{title}</span></div>{right}</div>

const inputBase = (f) => ({ width: '100%', padding: '10px 12px', backgroundColor: f ? DS.color.surface : DS.color.surfaceAlt, border: `1.5px solid ${f ? DS.color.primary : DS.color.borderLight}`, borderRadius: DS.radius, fontSize: '14px', fontFamily: DS.font, fontWeight: 400, color: DS.color.graphite, outline: 'none', transition: 'all 150ms', boxShadow: f ? `0 0 0 3px ${DS.color.primaryGlow}` : 'none', boxSizing: 'border-box', WebkitAppearance: 'none' })
const DI = ({ label, type = 'text', value, onChange, style: s }) => { const [f, sF] = useState(false); return <div style={{ minWidth: 0, flex: 1, ...s }}>{label && <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: f ? DS.color.primary : DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</label>}<input type={type} value={value} onChange={onChange} onFocus={() => sF(true)} onBlur={() => sF(false)} style={inputBase(f)} /></div> }

const Btn = ({ children, onClick, variant: vr = 'primary', icon: ic, sm, style: s }) => {
  const V = { primary: [DS.color.primary, '#fff'], ghost: [DS.color.surfaceAlt, DS.color.graphiteMed] }
  const v = V[vr] || V.primary
  return <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: sm ? '5px 10px' : '10px 18px', backgroundColor: v[0], color: v[1], border: vr === 'ghost' ? `1px solid ${DS.color.borderLight}` : 'none', borderRadius: DS.radius, fontFamily: DS.font, fontSize: sm ? '11px' : '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', minHeight: sm ? '28px' : '40px', ...s }}>{ic && <Ic n={ic} sz={sm ? 11 : 14} c={v[1]} />}{children}</button>
}

// ============================================
// COMPONENT
// ============================================
const SubmissionsHistory = ({ department, restaurantId, onBack }) => {
  useNavigationHistory(onBack)
  const mob = useR()
  const pad = mob ? '12px' : '20px'

  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [filter, setFilter] = useState({ startDate: '', endDate: '', templateId: '' })
  const [hoverId, setHoverId] = useState(null)

  // === ALL LOGIC UNCHANGED ===
  useEffect(() => { loadSubmissions() }, [department.id, filter])

  const loadSubmissions = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('checklist_submissions')
        .select(`
          *,
          checklist_templates(name, description, config),
          profiles(full_name, email)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('department_id', department.id)
        .order('submission_date', { ascending: false })

      if (filter.startDate) query = query.gte('submission_date', filter.startDate)
      if (filter.endDate) query = query.lte('submission_date', filter.endDate)
      if (filter.templateId) query = query.eq('template_id', filter.templateId)

      const { data, error } = await query
      if (error) throw error
      setSubmissions(data || [])
    } catch (error) {
      console.error('Error loading submissions:', error)
      alert('Грешка при зареждане на история')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // === DETAIL VIEW ===
  if (selectedSubmission) {
    return (
      <ImprovedSubmissionDetail
        submission={selectedSubmission}
        onBack={() => setSelectedSubmission(null)}
      />
    )
  }

  return (<><style>{CSS}</style>
    <div style={{ minHeight: '100vh', backgroundColor: DS.color.bg, fontFamily: DS.font, color: DS.color.graphite, display: 'flex', flexDirection: 'column' }}>

      {/* DARK TOP BAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: DS.color.graphite, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: DS.radius, cursor: 'pointer', color: '#fff', fontFamily: DS.font, fontSize: '12px', fontWeight: 600 }}>
          <Ic n="back" sz={14} c="#fff" /> Назад
        </button>
        <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '4px 10px', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{submissions.length} записа</span>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: pad, flex: 1, width: '100%' }}>

        {/* LOGO + TITLE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: mob ? '10px' : '14px', marginBottom: '16px' }}>
          <img src={LOGO} alt="Aladin Foods" style={{ height: mob ? '36px' : '48px', objectFit: 'contain', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
          <div>
            <h1 style={{ fontSize: mob ? '16px' : '22px', fontWeight: 700, color: DS.color.primary, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.2, textTransform: 'uppercase', fontFamily: DS.font }}>История на чек листи</h1>
            <p style={{ fontFamily: DS.font, fontSize: mob ? '10px' : '12px', color: DS.color.graphiteLight, fontWeight: 500, margin: '3px 0 0' }}>{department.name} • {submissions.length} попълнени</p>
          </div>
        </div>

        {/* FILTERS */}
        <Cd style={{ marginBottom: '12px' }}>
          <SH icon="filter" title="Филтри" right={
            <Btn sm icon="x" variant="ghost" onClick={() => setFilter({ startDate: '', endDate: '', templateId: '' })}>Изчисти</Btn>
          } />
          <div style={{ padding: pad }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'end' }}>
              <DI label="От дата" type="date" value={filter.startDate} onChange={e => setFilter({ ...filter, startDate: e.target.value })} style={{ minWidth: '140px' }} />
              <DI label="До дата" type="date" value={filter.endDate} onChange={e => setFilter({ ...filter, endDate: e.target.value })} style={{ minWidth: '140px' }} />
            </div>
          </div>
        </Cd>

        {/* SUBMISSIONS LIST */}
        {loading ? (
          <Cd style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${DS.color.borderLight}`, borderTop: `3px solid ${DS.color.primary}`, borderRadius: '50%', animation: 'sp 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteLight, margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>Зареждане...</p>
          </Cd>
        ) : submissions.length === 0 ? (
          <Cd style={{ padding: '40px', textAlign: 'center' }}>
            <Ic n="clipboard" sz={48} c={DS.color.graphiteMuted} style={{ margin: '0 auto 12px' }} />
            <p style={{ fontFamily: DS.font, fontSize: '14px', color: DS.color.graphiteMuted, margin: 0 }}>Няма попълнени чек листи</p>
          </Cd>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {submissions.map((submission, idx) => (
              <Cd
                key={submission.id}
                onClick={() => setSelectedSubmission(submission)}
                onMouseEnter={() => setHoverId(submission.id)}
                onMouseLeave={() => setHoverId(null)}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  border: hoverId === submission.id ? `2px solid ${DS.color.primary}` : `1px solid ${DS.color.borderLight}`,
                  transform: hoverId === submission.id ? 'translateX(5px)' : 'translateX(0)',
                  boxShadow: hoverId === submission.id ? '0 4px 12px rgba(27,94,55,0.12)' : DS.shadow.sm,
                  animationDelay: `${Math.min(idx * 30, 300)}ms`,
                  animationFillMode: 'both',
                }}
              >
                <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: '0 0 4px', fontFamily: DS.font, fontSize: '15px', fontWeight: 700, color: DS.color.primary }}>{submission.checklist_templates?.name || 'Без име'}</h3>
                    {submission.checklist_templates?.description && (
                      <p style={{ margin: '0 0 8px', fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteLight }}>{submission.checklist_templates.description}</p>
                    )}
                    <div style={{ display: 'flex', gap: mob ? '10px' : '18px', flexWrap: 'wrap', fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteMuted }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Ic n="calendar" sz={11} c={DS.color.graphiteMuted} />{formatDate(submission.submission_date)}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Ic n="user" sz={11} c={DS.color.graphiteMuted} />{submission.profiles?.full_name || submission.profiles?.email || 'Неизвестен'}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Ic n="clock" sz={11} c={DS.color.graphiteMuted} />{new Date(submission.submitted_at).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <Btn sm icon="eye">Преглед</Btn>
                </div>
              </Cd>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: mob ? '16px 12px' : '20px 24px', color: DS.color.graphiteMuted, fontFamily: DS.font, fontSize: '11px', fontWeight: 500, borderTop: `1px solid ${DS.color.borderLight}`, marginTop: 'auto' }}>© 2026 Aladin Foods | by MG</div>
    </div></>)
}

export default SubmissionsHistory