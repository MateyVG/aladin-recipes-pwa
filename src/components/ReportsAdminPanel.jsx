// src/components/ReportsAdminPanel.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigationHistory } from '../hooks/useNavigationHistory'

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
    border: '#D5DDD9', borderLight: '#E4EBE7',
  },
  font: "'DM Sans', system-ui, sans-serif",
  radius: '0px',
  shadow: { sm: '0 1px 3px rgba(30,42,38,0.06),0 1px 2px rgba(30,42,38,0.04)', md: '0 4px 12px rgba(30,42,38,0.08)' },
}
const LOGO = 'https://aladinfoods.bg/assets/images/aladinfoods_logo.png'
const CSS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');*,*::before,*::after{box-sizing:border-box}body{margin:0;background:${DS.color.bg}}@keyframes cf{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes sp{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@media(max-width:767px){input,button,select,textarea{font-size:16px!important}}`

const Ic = ({ n, sz = 16, c = 'currentColor', style: s }) => {
  const d = {
    back: <path d="M15 18l-6-6 6-6" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    chart: <><line x1="18" y1="20" x2="18" y2="10" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="20" x2="12" y2="4" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="20" x2="6" y2="14" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    store: <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" fill="none" stroke={c} strokeWidth="2"/><polyline points="9 22 9 12 15 12 15 22" fill="none" stroke={c} strokeWidth="2"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="none" stroke={c} strokeWidth="2"/><line x1="16" y1="2" x2="16" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="2" x2="8" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="10" x2="21" y2="10" stroke={c} strokeWidth="2"/></>,
    check: <polyline points="20 6 9 17 4 12" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    x: <><line x1="18" y1="6" x2="6" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke={c} strokeWidth="2"/><circle cx="12" cy="12" r="3" fill="none" stroke={c} strokeWidth="2"/></>,
    chevL: <polyline points="15 18 9 12 15 6" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    chevR: <polyline points="9 18 15 12 9 6" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="none" stroke={c} strokeWidth="2"/><line x1="12" y1="9" x2="12" y2="13" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    clipboard: <><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" fill="none" stroke={c} strokeWidth="2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1" fill="none" stroke={c} strokeWidth="2"/></>,
    clock: <><circle cx="12" cy="12" r="10" fill="none" stroke={c} strokeWidth="2"/><polyline points="12 6 12 12 16 14" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    user: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" fill="none" stroke={c} strokeWidth="2"/><circle cx="12" cy="7" r="4" fill="none" stroke={c} strokeWidth="2"/></>,
  }
  return <svg width={sz} height={sz} viewBox="0 0 24 24" style={{ flexShrink: 0, display: 'block', ...s }}>{d[n]}</svg>
}

const useR = () => { const [w, sW] = useState(window.innerWidth); useEffect(() => { const h = () => sW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h) }, []); return w < 768 }

const Cd = ({ children, style: s, ...rest }) => <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, overflow: 'hidden', animation: 'cf 0.4s ease', ...s }} {...rest}>{children}</div>
const SH = ({ icon, title, right, bg }) => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: bg || DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}` }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>{icon && <Ic n={icon} sz={18} c={DS.color.primary} />}<span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{title}</span></div>{right}</div>

const Btn = ({ children, onClick, variant: vr = 'primary', icon: ic, sm, active, style: s }) => {
  const V = { primary: [DS.color.primary, '#fff'], danger: [DS.color.danger, '#fff'], ghost: [DS.color.surfaceAlt, DS.color.graphiteMed], info: [DS.color.info, '#fff'], warning: [DS.color.warning, '#fff'] }
  const v = V[vr] || V.primary
  const bg = active !== undefined ? (active ? DS.color.primary : DS.color.surfaceAlt) : v[0]
  const fg = active !== undefined ? (active ? '#fff' : DS.color.graphiteMed) : v[1]
  return <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: sm ? '5px 10px' : '10px 18px', backgroundColor: bg, color: fg, border: (vr === 'ghost' || (active !== undefined && !active)) ? `1px solid ${DS.color.borderLight}` : 'none', borderRadius: DS.radius, fontFamily: DS.font, fontSize: sm ? '11px' : '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', minHeight: sm ? '28px' : '40px', ...s }}>{ic && <Ic n={ic} sz={sm ? 11 : 14} c={fg} />}{children}</button>
}

const StatCard = ({ value, label, color }) => (
  <Cd style={{ textAlign: 'center', padding: '18px 14px' }}>
    <div style={{ fontFamily: DS.font, fontSize: '28px', fontWeight: 700, color: color || DS.color.primary, lineHeight: 1.1 }}>{value}</div>
    <div style={{ fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteLight, fontWeight: 600, textTransform: 'uppercase', marginTop: '6px' }}>{label}</div>
  </Cd>
)

const ProgressBar = ({ pct, h = 8 }) => {
  const c = pct >= 80 ? DS.color.ok : pct >= 50 ? DS.color.warning : DS.color.danger
  return <div style={{ height: h, backgroundColor: DS.color.borderLight, overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', backgroundColor: c, transition: 'width 0.3s' }} /></div>
}

const StatusBadge = ({ pct }) => {
  const c = pct >= 80 ? DS.color.ok : pct >= 50 ? DS.color.warning : DS.color.danger
  return <span style={{ padding: '4px 10px', backgroundColor: c, color: '#fff', fontFamily: DS.font, fontSize: '12px', fontWeight: 700 }}>{pct.toFixed(0)}%</span>
}

// ============ STATUS CELL HELPER ============
const StatusCell = ({ label, value, ok, okText, badText }) => {
  const isOk = value === ok
  return <div style={{ padding: '8px', backgroundColor: isOk ? DS.color.okBg : DS.color.dangerBg, border: `1px solid ${isOk ? DS.color.ok + '33' : DS.color.danger + '33'}` }}>
    <div style={{ fontFamily: DS.font, fontSize: '10px', color: DS.color.graphiteLight, marginBottom: '2px' }}>{label}</div>
    <div style={{ fontFamily: DS.font, fontSize: '12px', fontWeight: 600, color: isOk ? DS.color.ok : DS.color.danger }}>{isOk ? `✓ ${okText}` : `✗ ${badText || value || '-'}`}</div>
  </div>
}

const ReportsAdminPanel = ({ onBack }) => {
  useNavigationHistory(onBack)
  const mob = useR()
  const pad = mob ? '12px' : '20px'

  const [loading, setLoading] = useState(true)
  const [restaurants, setRestaurants] = useState([])
  const [templates, setTemplates] = useState([])
  const [selectedRestaurant, setSelectedRestaurant] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [submissions, setSubmissions] = useState([])
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [view, setView] = useState('overview')
  const [overviewStats, setOverviewStats] = useState([])
  const [hoverId, setHoverId] = useState(null)
  const [hoverSubId, setHoverSubId] = useState(null)

  // === ALL LOGIC UNCHANGED ===
  useEffect(() => { loadInitialData() }, [])
  useEffect(() => { if (restaurants.length > 0) loadOverviewStats() }, [selectedDate, restaurants])
  useEffect(() => { if (selectedRestaurant) loadRestaurantSubmissions() }, [selectedRestaurant, selectedDate])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const { data: restaurantsData } = await supabase.from('restaurants').select('*').eq('active', true).order('name')
      setRestaurants(restaurantsData || [])
      const { data: templatesData } = await supabase.from('checklist_templates').select('id, name').eq('active', true).order('name')
      const unique = templatesData?.reduce((acc, curr) => { if (!acc.find(t => t.name === curr.name)) acc.push(curr); return acc }, []) || []
      setTemplates(unique)
    } catch (error) { console.error('Error:', error) }
    finally { setLoading(false) }
  }

  const loadOverviewStats = async () => {
    try {
      const { data: assignments } = await supabase.from('restaurant_templates').select('restaurant_id, template_id').eq('enabled', true)
      const { data: allSubmissions } = await supabase.from('checklist_submissions').select('id, restaurant_id, template_id, submission_date, checklist_templates(name)').eq('submission_date', selectedDate)
      const stats = restaurants.map(restaurant => {
        const expectedTemplates = assignments?.filter(a => a.restaurant_id === restaurant.id) || []
        const expectedCount = [...new Set(expectedTemplates.map(a => a.template_id))].length
        const restaurantSubs = allSubmissions?.filter(s => s.restaurant_id === restaurant.id) || []
        const completedCount = [...new Set(restaurantSubs.map(s => s.template_id))].length
        const percentage = expectedCount > 0 ? (completedCount / expectedCount) * 100 : 0
        return { id: restaurant.id, name: restaurant.name, expected: expectedCount, completed: completedCount, missing: expectedCount - completedCount, percentage, submissionsCount: restaurantSubs.length, hasActivity: restaurantSubs.length > 0 }
      })
      stats.sort((a, b) => { if (a.expected === 0 && b.expected > 0) return 1; if (a.expected > 0 && b.expected === 0) return -1; if (a.percentage !== b.percentage) return a.percentage - b.percentage; return a.name.localeCompare(b.name, 'bg') })
      setOverviewStats(stats)
    } catch (error) { console.error('Error loading overview:', error) }
  }

  const loadRestaurantSubmissions = async () => {
    if (!selectedRestaurant) return
    setLoading(true)
    try {
      const { data } = await supabase.from('checklist_submissions').select('id, template_id, submission_date, submitted_at, data, checklist_templates(id, name), profiles(full_name)').eq('restaurant_id', selectedRestaurant).eq('submission_date', selectedDate).order('submitted_at', { ascending: false })
      setSubmissions(data || [])
      setView('restaurant')
    } catch (error) { console.error('Error:', error) }
    finally { setLoading(false) }
  }

  const getAssignedTemplates = async (restaurantId) => {
    const { data } = await supabase.from('restaurant_templates').select('template_id, checklist_templates(id, name)').eq('restaurant_id', restaurantId).eq('enabled', true)
    return [...new Set(data?.map(d => d.checklist_templates?.name).filter(Boolean))]
  }

  const loadSubmissionDetail = async (submission) => { setSelectedSubmission(submission); setView('detail') }

  const setToday = () => setSelectedDate(new Date().toISOString().split('T')[0])
  const setYesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); setSelectedDate(d.toISOString().split('T')[0]) }
  const setPrevDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d.toISOString().split('T')[0]) }
  const setNextDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d.toISOString().split('T')[0]) }

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('bg-BG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })

  // ============================================
  // RENDER CHECKLIST DATA (all types preserved)
  // ============================================
  const renderChecklistData = (submission) => {
    const data = submission.data
    const name = submission.checklist_templates?.name || ''
    console.log('=== RENDER CHECKLIST DEBUG ==='); console.log('Template name:', name); console.log('Template ID:', submission.template_id); console.log('Data structure:', Object.keys(data)); console.log('Full submission:', submission); console.log('=== END DEBUG ===')

    // Контрол на работното облекло и хигиена на персонала
    if (name.includes('облекло') || name.includes('хигиена на персонал')) {
      console.log('Detected clothing/hygiene control template')
      const rows = data.rows || []; const header = data.header || {}; const filledRows = rows.filter(r => r.name || r.position)
      return (<div>
        <div style={{ fontFamily: DS.font, fontSize: '14px', fontWeight: 700, color: DS.color.primary, marginBottom: '12px' }}>Контрол на работното облекло и хигиена на персонала</div>
        <div style={{ marginBottom: '10px', padding: '10px 12px', backgroundColor: DS.color.okBg, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontFamily: DS.font, fontSize: '12px' }}>
          <span><strong>Дата:</strong> {header.date ? new Date(header.date).toLocaleDateString('bg-BG') : 'Неизвестна'}</span>
          {header.manager && <span><strong>Мениджър:</strong> {header.manager}</span>}
        </div>
        {filledRows.length > 0 && <div style={{ marginBottom: '10px', padding: '8px 12px', backgroundColor: DS.color.infoBg, fontFamily: DS.font, fontSize: '12px' }}><strong>Проверени служители:</strong> {filledRows.length}</div>}
        {filledRows.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filledRows.map((row, idx) => {
              const hasIssues = row.wounds !== 'none' || row.jewelry !== 'none' || row.work_clothing !== 'clean' || row.personal_hygiene !== 'good' || row.health_status !== 'good'
              return (<div key={row.id || idx} style={{ padding: '12px', backgroundColor: DS.color.surfaceAlt, borderLeft: `4px solid ${hasIssues ? DS.color.warning : DS.color.ok}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '8px', borderBottom: `1px solid ${DS.color.borderLight}`, flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: DS.font, fontSize: '14px', fontWeight: 700, color: DS.color.primary }}>#{row.number} {row.name}</span>
                    {row.position && <span style={{ padding: '2px 8px', backgroundColor: DS.color.infoBg, color: DS.color.info, fontFamily: DS.font, fontSize: '10px', fontWeight: 600 }}>{row.position}</span>}
                  </div>
                  {row.checked_by && <span style={{ fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteMuted }}>✓ Проверил: {row.checked_by}</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '6px', marginBottom: row.corrective_actions ? '8px' : 0 }}>
                  <StatusCell label="Работно облекло" value={row.work_clothing} ok="clean" okText="Чисто" badText={row.work_clothing === 'dirty' ? 'Мръсно' : row.work_clothing} />
                  <StatusCell label="Лична хигиена" value={row.personal_hygiene} ok="good" okText="Добра" badText={row.personal_hygiene === 'poor' ? 'Лоша' : row.personal_hygiene} />
                  <StatusCell label="Здравословно състояние" value={row.health_status} ok="good" okText="Добро" badText={row.health_status === 'sick' ? 'Болен' : row.health_status} />
                  <StatusCell label="Рани/Порязвания" value={row.wounds} ok="none" okText="Няма" badText={row.wounds === 'minor' ? 'Леки' : row.wounds === 'major' ? 'Сериозни' : row.wounds} />
                  <StatusCell label="Бижута" value={row.jewelry} ok="none" okText="Няма" badText={row.jewelry === 'present' ? 'Има' : row.jewelry} />
                </div>
                {row.corrective_actions && <div style={{ marginTop: '8px', padding: '8px 10px', backgroundColor: DS.color.warningBg, borderLeft: `3px solid ${DS.color.warning}`, fontFamily: DS.font, fontSize: '12px' }}><strong style={{ color: DS.color.warning }}>Коригиращи действия:</strong><div style={{ marginTop: '2px', color: DS.color.graphiteMed }}>{row.corrective_actions}</div></div>}
              </div>)
            })}
          </div>
        ) : <p style={{ fontFamily: DS.font, fontSize: '13px', color: DS.color.graphiteMuted, textAlign: 'center', padding: '20px' }}>Няма записани проверки на служители</p>}
      </div>)
    }

    // Чек лист за подмяна на мазнината
    if (name.includes('мазнина')) {
      const filledRecords = data.records?.filter(r => r.date || r.quantity) || []
      return (<div>
        <div style={{ fontFamily: DS.font, fontSize: '14px', fontWeight: 700, color: DS.color.primary, marginBottom: '12px' }}>Записи за смяна на масло</div>
        {filledRecords.length === 0 ? <p style={{ fontFamily: DS.font, fontSize: '13px', color: DS.color.graphiteMuted }}>Няма попълнени записи</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filledRecords.map((record, idx) => (
              <div key={idx} style={{ padding: '10px 12px', backgroundColor: DS.color.surfaceAlt, borderLeft: `4px solid ${record.completed ? DS.color.ok : DS.color.warning}` }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', fontFamily: DS.font, fontSize: '12px' }}>
                  <div><strong>Дата:</strong> {record.date || '-'}</div>
                  <div><strong>Смяна:</strong> {record.shift || '-'}</div>
                  <div><strong>Количество:</strong> {record.quantity || '-'} л</div>
                  <div><strong>Вид:</strong> {record.oilType || '-'}</div>
                  <div><strong>Служител:</strong> {record.nameSignature || '-'}</div>
                  <div><strong>Статус:</strong> {record.completed ? '✓ Завършен' : '⏳ В процес'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>)
    }

    // Контролна карта хладилно съхранение
    if (name.includes('хладилно')) {
      const blocks = data.dateBlocks || []
      return (<div>
        <div style={{ fontFamily: DS.font, fontSize: '14px', fontWeight: 700, color: DS.color.primary, marginBottom: '12px' }}>Температури на хладилници</div>
        {blocks.map((block, idx) => (
          <div key={idx} style={{ marginBottom: '14px' }}>
            <div style={{ fontFamily: DS.font, fontWeight: 600, fontSize: '12px', color: DS.color.graphiteMed, marginBottom: '8px' }}>📅 {block.date}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '4px' }}>
              {Object.entries(block.readings || {}).filter(([key]) => key.match(/^\d/)).map(([key, value]) => (
                <div key={key} style={{ padding: '6px', backgroundColor: value ? DS.color.okBg : DS.color.dangerBg, textAlign: 'center', fontFamily: DS.font, fontSize: '11px' }}>
                  <div style={{ color: DS.color.graphiteLight, fontSize: '9px' }}>{key}</div>
                  <div style={{ fontWeight: 700, color: value ? DS.color.ok : DS.color.danger }}>{value || '-'}°C</div>
                </div>
              ))}
            </div>
            {block.readings?.inspector_name && <div style={{ marginTop: '6px', fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteMuted }}>Проверил: {block.readings.inspector_name}</div>}
          </div>
        ))}
      </div>)
    }

    // Термична обработка - Пица
    if (name.includes('Пица')) {
      const pizzaCounts = data.pizzaCounts || {}; const temperatures = data.temperatures || {}; const totalPizzas = data.metadata?.total_pizzas || 0
      return (<div>
        <div style={{ fontFamily: DS.font, fontSize: '14px', fontWeight: 700, color: DS.color.primary, marginBottom: '12px' }}>Термична обработка на пици — Общо: {totalPizzas} бр.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Object.entries(pizzaCounts).map(([pizzaType, times]) => {
            const filledTimes = Object.entries(times).filter(([_, count]) => count)
            if (filledTimes.length === 0) return null
            return (<div key={pizzaType} style={{ padding: '10px 12px', backgroundColor: DS.color.surfaceAlt }}>
              <div style={{ fontFamily: DS.font, fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>🍕 {pizzaType}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {filledTimes.map(([time, count]) => (
                  <span key={time} style={{ padding: '3px 8px', backgroundColor: DS.color.infoBg, fontFamily: DS.font, fontSize: '11px' }}>
                    {time}: {count} бр.{temperatures[pizzaType]?.[time] && ` (${temperatures[pizzaType][time]}°C)`}
                  </span>
                ))}
              </div>
            </div>)
          })}
        </div>
      </div>)
    }

    // Производствен лист
    if (name.includes('Производствен')) {
      const productions = data.productions || []
      return (<div>
        <div style={{ fontFamily: DS.font, fontSize: '14px', fontWeight: 700, color: DS.color.primary, marginBottom: '12px' }}>Производствени записи</div>
        {productions.length === 0 ? <p style={{ fontFamily: DS.font, fontSize: '13px', color: DS.color.graphiteMuted }}>Няма записи</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {productions.map((prod, idx) => (
              <div key={idx} style={{ padding: '10px 12px', backgroundColor: DS.color.surfaceAlt, borderLeft: `4px solid ${DS.color.primary}` }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', fontFamily: DS.font, fontSize: '12px' }}>
                  <div><strong>№:</strong> {prod.number}</div>
                  <div><strong>Тегло:</strong> {prod.weight} кг</div>
                  <div><strong>Партида:</strong> {prod.batchNumber}</div>
                  <div><strong>Годен до:</strong> {prod.usedBefore ? new Date(prod.usedBefore).toLocaleDateString('bg-BG') : '-'}</div>
                  <div><strong>Доставка:</strong> {prod.deliveryDateTime ? formatTime(prod.deliveryDateTime) : '-'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>)
    }

    // Работна карта за хигиенизиране
    if (name.toLowerCase().includes('хигиен') || name.includes('работна карта')) {
      console.log('Detected hygiene work card template')
      const zones = data.zones || []; const completionData = data.completionData || {}; const employees = data.employees || []
      const completedCount = Object.values(completionData).filter(v => v === true).length; const totalCount = Object.keys(completionData).length
      return (<div>
        <div style={{ fontFamily: DS.font, fontSize: '14px', fontWeight: 700, color: DS.color.primary, marginBottom: '12px' }}>Хигиенизиране — {completedCount}/{totalCount} изпълнени</div>
        {data.manager && <div style={{ marginBottom: '8px', padding: '8px 12px', backgroundColor: DS.color.okBg, fontFamily: DS.font, fontSize: '12px' }}><strong>Мениджър:</strong> {data.manager}</div>}
        {employees.length > 0 && <div style={{ marginBottom: '8px', padding: '8px 12px', backgroundColor: DS.color.infoBg, fontFamily: DS.font, fontSize: '12px' }}>
          <strong>Служители:</strong>
          <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {employees.map((emp, idx) => <span key={idx} style={{ padding: '3px 8px', backgroundColor: DS.color.surface, border: `1px solid ${DS.color.borderLight}`, fontFamily: DS.font, fontSize: '11px' }}>{emp.name || emp}</span>)}
          </div>
        </div>}
        {totalCount > 0 && <div style={{ marginBottom: '10px', padding: '8px 12px', backgroundColor: DS.color.okBg }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1, height: 8, backgroundColor: DS.color.borderLight, overflow: 'hidden' }}><div style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`, height: '100%', backgroundColor: DS.color.ok }} /></div>
            <span style={{ fontFamily: DS.font, fontWeight: 700, fontSize: '12px', color: DS.color.ok }}>{totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(0) : 0}%</span>
          </div>
        </div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {zones.map((zone, idx) => (
            <div key={idx} style={{ padding: '10px 12px', backgroundColor: DS.color.surfaceAlt, borderLeft: `4px solid ${DS.color.primary}` }}>
              <div style={{ fontFamily: DS.font, fontWeight: 600, fontSize: '12px', marginBottom: '6px', color: DS.color.primary }}>{zone.name}</div>
              {zone.areas && zone.areas.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {zone.areas.map((area, aIdx) => { const areaKey = `${zone.id}_${area.name}`; const isCompleted = completionData[areaKey]; return <span key={aIdx} style={{ padding: '4px 8px', backgroundColor: isCompleted ? DS.color.okBg : DS.color.borderLight, color: isCompleted ? DS.color.ok : DS.color.graphiteMed, fontFamily: DS.font, fontSize: '11px', border: isCompleted ? `1px solid ${DS.color.ok}44` : 'none' }}>{isCompleted && '✓ '}{area.name}</span> })}
                </div>
              ) : <div style={{ fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteMuted }}>Няма области</div>}
            </div>
          ))}
        </div>
        {data.hygieneType && <div style={{ marginTop: '10px', padding: '8px 12px', backgroundColor: DS.color.warningBg, fontFamily: DS.font, fontSize: '12px' }}><strong>Тип хигиенизация:</strong> {data.hygieneType}</div>}
      </div>)
    }

    // Default - raw JSON
    return (<div>
      <div style={{ fontFamily: DS.font, fontSize: '14px', fontWeight: 700, color: DS.color.primary, marginBottom: '12px' }}>Данни</div>
      <pre style={{ backgroundColor: DS.color.surfaceAlt, padding: '12px', overflow: 'auto', fontFamily: 'monospace', fontSize: '11px', maxHeight: '400px', border: `1px solid ${DS.color.borderLight}` }}>{JSON.stringify(data, null, 2)}</pre>
    </div>)
  }

  // ============================================
  // RENDER: OVERVIEW
  // ============================================
  const renderOverview = () => {
    const totalExpected = overviewStats.reduce((sum, s) => sum + s.expected, 0)
    const totalCompleted = overviewStats.reduce((sum, s) => sum + s.completed, 0)
    const totalPercentage = totalExpected > 0 ? (totalCompleted / totalExpected) * 100 : 0
    return (<div>
      <div style={{ display: 'grid', gridTemplateColumns: mob ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '10px', marginBottom: '14px' }}>
        <Cd style={{ textAlign: 'center', padding: '18px 14px' }}>
          <div style={{ fontFamily: DS.font, fontSize: '28px', fontWeight: 700, color: DS.color.primary }}>{totalPercentage.toFixed(0)}%</div>
          <div style={{ fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteLight, fontWeight: 600, textTransform: 'uppercase', marginTop: '6px' }}>Общо изпълнение</div>
          <div style={{ marginTop: '8px' }}><ProgressBar pct={totalPercentage} /></div>
        </Cd>
        <StatCard value={totalCompleted} label="Попълнени" color={DS.color.ok} />
        <StatCard value={totalExpected - totalCompleted} label="Липсващи" color={DS.color.danger} />
        <StatCard value={overviewStats.filter(s => s.expected > 0).length} label="Активни ресторанта" color={DS.color.graphite} />
      </div>

      <Cd>
        <SH icon="store" title={`Ресторанти — ${formatDate(selectedDate)}`} />
        <div style={{ padding: '6px' }}>
          {overviewStats.filter(r => r.expected > 0).map((restaurant, idx) => (
            <div key={restaurant.id} onClick={() => { setSelectedRestaurant(restaurant.id); loadRestaurantSubmissions() }} onMouseEnter={() => setHoverId(restaurant.id)} onMouseLeave={() => setHoverId(null)} style={{ padding: '14px', margin: '4px', backgroundColor: idx % 2 === 0 ? DS.color.surface : DS.color.surfaceAlt, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', border: `1px solid ${restaurant.percentage === 100 ? DS.color.ok + '44' : restaurant.percentage > 0 ? DS.color.warning + '44' : DS.color.danger + '44'}`, transition: 'all 0.15s', transform: hoverId === restaurant.id ? 'translateY(-2px)' : 'translateY(0)', boxShadow: hoverId === restaurant.id ? '0 4px 12px rgba(30,42,38,0.15)' : 'none' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: DS.font, fontWeight: 700, fontSize: '14px', color: DS.color.graphite, marginBottom: '6px' }}>{restaurant.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ flex: 1, maxWidth: '180px' }}><ProgressBar pct={restaurant.percentage} h={6} /></div>
                  <span style={{ fontFamily: DS.font, fontSize: '12px', fontWeight: 700, color: restaurant.percentage >= 80 ? DS.color.ok : restaurant.percentage >= 50 ? DS.color.warning : DS.color.danger }}>{restaurant.completed}/{restaurant.expected}</span>
                </div>
                <div style={{ fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteMuted, marginTop: '4px' }}>
                  {restaurant.percentage === 100 ? <span style={{ color: DS.color.ok }}>✓ Всички чеклисти попълнени</span> : restaurant.completed > 0 ? <span style={{ color: DS.color.warning }}>Липсват още {restaurant.missing}</span> : <span style={{ color: DS.color.danger }}>Няма попълнени чеклисти</span>}
                </div>
              </div>
              <StatusBadge pct={restaurant.percentage} />
            </div>
          ))}
          {overviewStats.filter(r => r.expected === 0).length > 0 && (
            <div style={{ margin: '8px 4px', padding: '12px', backgroundColor: DS.color.warningBg, border: `1px solid ${DS.color.warning}33` }}>
              <div style={{ fontFamily: DS.font, fontSize: '11px', color: DS.color.warning, fontWeight: 600, marginBottom: '6px' }}>Ресторанти без назначени чеклисти:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {overviewStats.filter(r => r.expected === 0).map(r => <span key={r.id} style={{ padding: '3px 8px', backgroundColor: DS.color.surface, border: `1px solid ${DS.color.borderLight}`, fontFamily: DS.font, fontSize: '11px' }}>{r.name}</span>)}
              </div>
            </div>
          )}
        </div>
      </Cd>
    </div>)
  }

  // ============================================
  // RENDER: RESTAURANT VIEW
  // ============================================
  const renderRestaurantView = () => {
    const restaurant = restaurants.find(r => r.id === selectedRestaurant)
    const restaurantStats = overviewStats.find(s => s.id === selectedRestaurant)
    const grouped = submissions.reduce((acc, sub) => { const n = sub.checklist_templates?.name || 'Неизвестен'; if (!acc[n]) acc[n] = []; acc[n].push(sub); return acc }, {})
    const completedNames = [...new Set(submissions.map(s => s.checklist_templates?.name).filter(Boolean))]
    const allTemplateNames = templates.map(t => t.name)
    const missingNames = allTemplateNames.filter(n => !completedNames.includes(n))
    const completed = restaurantStats?.completed || completedNames.length
    const expected = restaurantStats?.expected || templates.length
    const percentage = expected > 0 ? (completed / expected) * 100 : 0

    return (<div>
      <Btn icon="back" variant="ghost" onClick={() => { setView('overview'); setSelectedRestaurant('') }} style={{ marginBottom: '12px' }}>Назад към ресторантите</Btn>

      <Cd style={{ marginBottom: '12px' }}>
        <SH icon="store" title={restaurant?.name} right={<StatusBadge pct={percentage} />} />
        <div style={{ padding: '14px' }}>
          <div style={{ fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteLight, marginBottom: '8px' }}>{formatDate(selectedDate)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteMuted }}>Прогрес</span>
            <div style={{ flex: 1 }}><ProgressBar pct={percentage} /></div>
            <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700 }}>{completed}/{expected}</span>
          </div>
        </div>
      </Cd>

      {missingNames.length > 0 && (
        <Cd style={{ marginBottom: '12px', border: `1px solid ${DS.color.danger}33` }}>
          <SH icon="x" title={`Липсващи чеклисти (${missingNames.length})`} bg={DS.color.dangerBg} />
          <div style={{ padding: '12px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {missingNames.map((n, idx) => <span key={idx} style={{ padding: '4px 10px', backgroundColor: DS.color.surface, border: `1px solid ${DS.color.danger}33`, fontFamily: DS.font, fontSize: '12px', color: DS.color.danger }}>{n}</span>)}
          </div>
        </Cd>
      )}

      {submissions.length === 0 ? (
        <Cd style={{ padding: '40px', textAlign: 'center' }}>
          <Ic n="clipboard" sz={48} c={DS.color.graphiteMuted} style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontFamily: DS.font, fontSize: '15px', color: DS.color.danger, margin: '0 0 4px' }}>Няма попълнени чеклисти</h3>
          <p style={{ fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteMuted, margin: 0 }}>За {formatDate(selectedDate)} няма записи</p>
        </Cd>
      ) : (
        <div>
          <div style={{ fontFamily: DS.font, fontSize: '12px', fontWeight: 700, color: DS.color.ok, textTransform: 'uppercase', padding: '8px 0', marginBottom: '6px' }}>✓ Попълнени чеклисти ({completedNames.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(grouped).map(([checklistName, subs]) => (
              <Cd key={checklistName}>
                <div style={{ padding: '12px 16px', backgroundColor: DS.color.graphite, color: '#fff' }}>
                  <div style={{ fontFamily: DS.font, fontWeight: 700, fontSize: '13px' }}>{checklistName}</div>
                  <div style={{ fontFamily: DS.font, fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>{subs.length} {subs.length === 1 ? 'запис' : 'записа'}</div>
                </div>
                <div style={{ padding: '4px' }}>
                  {subs.map((sub, idx) => (
                    <div key={sub.id} onClick={() => loadSubmissionDetail(sub)} onMouseEnter={() => setHoverSubId(sub.id)} onMouseLeave={() => setHoverSubId(null)} style={{ padding: '10px 12px', backgroundColor: hoverSubId === sub.id ? DS.color.cardHeader : (idx % 2 === 0 ? DS.color.surface : DS.color.surfaceAlt), cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s' }}>
                      <div>
                        <div style={{ fontFamily: DS.font, fontWeight: 600, fontSize: '13px', color: DS.color.graphite }}>{formatTime(sub.submitted_at)}</div>
                        <div style={{ fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteMuted, marginTop: '2px' }}>{sub.profiles?.full_name || 'Неизвестен'}</div>
                      </div>
                      <Btn sm icon="eye" variant="primary">Преглед</Btn>
                    </div>
                  ))}
                </div>
              </Cd>
            ))}
          </div>
        </div>
      )}
    </div>)
  }

  // ============================================
  // RENDER: DETAIL VIEW
  // ============================================
  const renderDetailView = () => {
    if (!selectedSubmission) return null
    const restaurant = restaurants.find(r => r.id === selectedRestaurant)
    return (<div>
      <Btn icon="back" variant="ghost" onClick={() => { setView('restaurant'); setSelectedSubmission(null) }} style={{ marginBottom: '12px' }}>Назад към чеклистите</Btn>
      <Cd style={{ marginBottom: '12px' }}>
        <SH icon="clipboard" title={selectedSubmission.checklist_templates?.name} />
        <div style={{ padding: '14px', display: 'grid', gridTemplateColumns: mob ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '8px' }}>
          {[{ icon: 'store', label: 'Ресторант', value: restaurant?.name }, { icon: 'calendar', label: 'Дата', value: new Date(selectedSubmission.submission_date).toLocaleDateString('bg-BG') }, { icon: 'clock', label: 'Час', value: formatTime(selectedSubmission.submitted_at) }, { icon: 'user', label: 'Попълнил', value: selectedSubmission.profiles?.full_name || 'Неизвестен' }].map((item, i) => (
            <div key={i} style={{ padding: '10px', backgroundColor: DS.color.surfaceAlt }}>
              <div style={{ fontFamily: DS.font, fontSize: '10px', color: DS.color.graphiteMuted, textTransform: 'uppercase', marginBottom: '2px' }}>{item.label}</div>
              <div style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 600 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </Cd>
      <Cd style={{ padding: '16px' }}>{renderChecklistData(selectedSubmission)}</Cd>
    </div>)
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (<><style>{CSS}</style>
    <div style={{ minHeight: '100vh', backgroundColor: DS.color.bg, fontFamily: DS.font, color: DS.color.graphite, display: 'flex', flexDirection: 'column' }}>

      {/* DARK TOP BAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: DS.color.graphite, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: DS.radius, cursor: 'pointer', color: '#fff', fontFamily: DS.font, fontSize: '12px', fontWeight: 600 }}>
          <Ic n="back" sz={14} c="#fff" /> Назад
        </button>
        {/* Date nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button onClick={setPrevDay} style={{ padding: '4px 8px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: DS.radius, cursor: 'pointer', color: '#fff', display: 'flex' }}><Ic n="chevL" sz={14} c="#fff" /></button>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ padding: '4px 8px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: DS.radius, fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: '#fff', colorScheme: 'dark', outline: 'none' }} />
          <button onClick={setNextDay} style={{ padding: '4px 8px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: DS.radius, cursor: 'pointer', color: '#fff', display: 'flex' }}><Ic n="chevR" sz={14} c="#fff" /></button>
          <button onClick={setToday} style={{ padding: '4px 8px', marginLeft: '2px', backgroundColor: selectedDate === new Date().toISOString().split('T')[0] ? DS.color.primary : 'rgba(255,255,255,0.06)', border: selectedDate === new Date().toISOString().split('T')[0] ? 'none' : '1px solid rgba(255,255,255,0.08)', borderRadius: DS.radius, cursor: 'pointer', fontFamily: DS.font, fontSize: '10px', fontWeight: 700, color: '#fff' }}>Днес</button>
          <button onClick={setYesterday} style={{ padding: '4px 8px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: DS.radius, cursor: 'pointer', fontFamily: DS.font, fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>Вчера</button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: pad, flex: 1, width: '100%' }}>
        {/* LOGO + TITLE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: mob ? '10px' : '14px', marginBottom: '16px' }}>
          <img src={LOGO} alt="Aladin Foods" style={{ height: mob ? '36px' : '48px', objectFit: 'contain', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
          <div>
            <h1 style={{ fontSize: mob ? '16px' : '22px', fontWeight: 700, color: DS.color.primary, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.2, textTransform: 'uppercase', fontFamily: DS.font }}>Отчети</h1>
            <p style={{ fontFamily: DS.font, fontSize: mob ? '10px' : '12px', color: DS.color.graphiteLight, fontWeight: 500, margin: '3px 0 0' }}>Преглед на попълнени чеклисти по ресторанти</p>
          </div>
        </div>

        {loading ? (
          <Cd style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${DS.color.borderLight}`, borderTop: `3px solid ${DS.color.primary}`, borderRadius: '50%', animation: 'sp 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteLight, margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>Зареждане...</p>
          </Cd>
        ) : (<>
          {view === 'overview' && renderOverview()}
          {view === 'restaurant' && renderRestaurantView()}
          {view === 'detail' && renderDetailView()}
        </>)}
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: mob ? '16px 12px' : '20px 24px', color: DS.color.graphiteMuted, fontFamily: DS.font, fontSize: '11px', fontWeight: 500, borderTop: `1px solid ${DS.color.borderLight}`, marginTop: 'auto' }}>© 2026 Aladin Foods | by MG</div>
    </div></>)
}

export default ReportsAdminPanel