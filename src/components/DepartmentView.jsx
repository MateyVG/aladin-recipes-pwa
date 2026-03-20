// src/components/DepartmentView.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import UnifiedHistory from './UnifiedHistory'
import PizzaTemperatureControl from './templates/PizzaTemperatureControl'
import RefrigeratorTemperatureControl from './templates/RefrigeratorTemperatureControl'
import RestaurantInventoryForm from './templates/RestaurantInventoryForm'
import ChickenProductionSheet from './templates/ChickenProductionSheet'
import DonerProductionSheet from './templates/DonerProductionSheet'
import ChickenMeatballProductionSheet from './templates/ChickenMeatballProductionSheet'
import HygieneWorkCard from './templates/HygieneWorkCard'
import RefrigeratorStorageControl from './templates/RefrigeratorStorageControl'
import OilChangeChecklist from './templates/OilChangeChecklist'
import IncomingMaterialsControl from './templates/IncomingMaterialsControl.jsx'
import TransportHygieneChecklist from './templates/TransportHygieneChecklist'
import ThermalProcessingSheet from './templates/ThermalProcessingSheet'
import HealthBookRegistry from './templates/HealthBookRegistry'
import { useNavigationHistory } from '../hooks/useNavigationHistory'

const TEMPLATE_COMPONENTS = {
  'PizzaTemperatureControl': PizzaTemperatureControl,
  'RefrigeratorTemperatureControl': RefrigeratorTemperatureControl,
  'RestaurantInventoryForm': RestaurantInventoryForm,
  'ChickenProductionSheet': ChickenProductionSheet,
  'DonerProductionSheet': DonerProductionSheet,
  'ChickenMeatballProductionSheet': ChickenMeatballProductionSheet,
  'HygieneWorkCard': HygieneWorkCard,
  'RefrigeratorStorageControl': RefrigeratorStorageControl,
  'OilChangeChecklist': OilChangeChecklist,
  'IncomingMaterialsControl': IncomingMaterialsControl,
  'TransportHygieneChecklist': TransportHygieneChecklist,
  'ThermalProcessingSheet': ThermalProcessingSheet,
  'HealthBookRegistry': HealthBookRegistry,
}

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM
   ═══════════════════════════════════════════════════════════════ */
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
  shadow: {
    sm: '0 1px 3px rgba(30,42,38,0.06),0 1px 2px rgba(30,42,38,0.04)',
    md: '0 4px 12px rgba(30,42,38,0.06),0 1px 4px rgba(30,42,38,0.04)',
    glow: '0 0 0 3px rgba(27,94,55,0.10), 0 4px 12px rgba(30,42,38,0.08)',
  },
}
const LOGO = 'https://aladinfoods.bg/assets/images/aladinfoods_logo.png'
const CSS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box}body{margin:0;background:${DS.color.bg}}
@keyframes ctrlFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes ctrlSpin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
@media(max-width:767px){input,button,select,textarea{font-size:16px!important}}`

/* ═══ ICONS (inline SVG) ═══ */
const Ic = ({ n, sz = 16, c = 'currentColor', style: s }) => {
  const d = {
    back: <path d="M15 18l-6-6 6-6" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    clipboard: <><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" fill="none" stroke={c} strokeWidth="2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1" fill="none" stroke={c} strokeWidth="2"/></>,
    history: <><circle cx="12" cy="12" r="10" fill="none" stroke={c} strokeWidth="2"/><polyline points="12 6 12 12 16 14" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    trash: <><polyline points="3 6 5 6 21 6" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    save: <><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/><polyline points="17 21 17 13 7 13 7 21" fill="none" stroke={c} strokeWidth="2"/><polyline points="7 3 7 8 15 8" fill="none" stroke={c} strokeWidth="2"/></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="none" stroke={c} strokeWidth="2"/><line x1="12" y1="9" x2="12" y2="13" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
  }
  return <svg width={sz} height={sz} viewBox="0 0 24 24" style={{ flexShrink: 0, display: 'block', ...s }}>{d[n]}</svg>
}

/* ═══ RESPONSIVE HOOK ═══ */
const useR = () => { const [w, sW] = useState(window.innerWidth); useEffect(() => { const h = () => sW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h) }, []); return w < 768 }

/* ═══ DS COMPONENTS ═══ */
const inputBase = (f) => ({ width: '100%', padding: '10px 12px', backgroundColor: f ? DS.color.surface : DS.color.surfaceAlt, border: `1.5px solid ${f ? DS.color.primary : DS.color.borderLight}`, borderRadius: DS.radius, fontSize: '14px', fontFamily: DS.font, fontWeight: 400, color: DS.color.graphite, outline: 'none', transition: 'all 150ms', boxShadow: f ? `0 0 0 3px ${DS.color.primaryGlow}` : 'none', boxSizing: 'border-box', WebkitAppearance: 'none' })

const DI = ({ label, type = 'text', value, onChange, placeholder, required, readOnly, style: s }) => {
  const [f, sF] = useState(false)
  return <div style={{ minWidth: 0, flex: 1, ...s }}>
    {label && <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: f ? DS.color.primary : DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}{required && <span style={{ color: DS.color.danger }}> *</span>}</label>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} readOnly={readOnly} onFocus={() => sF(true)} onBlur={() => sF(false)} style={{ ...inputBase(f), backgroundColor: readOnly ? DS.color.surfaceAlt : (f ? DS.color.surface : DS.color.surfaceAlt) }} />
  </div>
}

const DSel = ({ label, value, onChange, children, required, style: s }) => {
  const [f, sF] = useState(false)
  return <div style={{ minWidth: 0, flex: 1, ...s }}>
    {label && <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: f ? DS.color.primary : DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}{required && <span style={{ color: DS.color.danger }}> *</span>}</label>}
    <select value={value} onChange={onChange} required={required} onFocus={() => sF(true)} onBlur={() => sF(false)} style={{ ...inputBase(f), cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2395A39D' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: '28px' }}>{children}</select>
  </div>
}

const Btn = ({ children, onClick, disabled: dis, variant: vr = 'primary', icon: ic, sm, full, style: s }) => {
  const V = { primary: [DS.color.primary, '#fff', 'none'], danger: [DS.color.danger, '#fff', 'none'], ghost: [DS.color.surfaceAlt, DS.color.graphiteMed, `1px solid ${DS.color.borderLight}`], outline: ['transparent', DS.color.primary, `1.5px solid ${DS.color.primary}`], info: [DS.color.info, '#fff', 'none'] }
  const v = V[vr] || V.primary
  return <button onClick={onClick} disabled={dis} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: sm ? '6px 12px' : '10px 18px', backgroundColor: dis ? DS.color.graphiteMuted : v[0], color: dis ? '#fff' : v[1], border: dis ? 'none' : v[2], borderRadius: DS.radius, fontFamily: DS.font, fontSize: sm ? '11px' : '13px', fontWeight: 600, cursor: dis ? 'not-allowed' : 'pointer', transition: 'all 150ms', minHeight: sm ? '30px' : '40px', width: full ? '100%' : 'auto', ...s }}>{ic && <Ic n={ic} sz={sm ? 12 : 14} c={dis ? '#fff' : v[1]} />}{children}</button>
}

const SH = ({ icon: ic, title, right, bg }) => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: bg || DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}` }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>{ic && <Ic n={ic} sz={18} c={DS.color.primary} />}<span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{title}</span></div>{right}</div>
const Cd = ({ children, style: s, ...rest }) => <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, overflow: 'hidden', animation: 'ctrlFadeIn 0.4s ease', ...s }} {...rest}>{children}</div>

const TopBar = ({ onBack, backLabel = 'Назад', right }) => (
  <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: DS.color.graphite, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
    <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: DS.radius, color: 'white', fontSize: '12px', fontFamily: DS.font, fontWeight: 600, cursor: 'pointer' }}><Ic n="back" sz={14} c="white" /> {backLabel}</button>
    {right || <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#4ADE80' }} /><span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 600, fontFamily: DS.font }}>Online</span></div>}
  </div>
)

const LogoTitle = ({ title, subtitle, right, mob }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: mob ? '10px' : '14px' }}>
      <img src={LOGO} alt="Aladin Foods" style={{ height: mob ? '36px' : '48px', objectFit: 'contain', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
      <div style={{ minWidth: 0 }}>
        <h1 style={{ fontSize: mob ? '16px' : '22px', fontWeight: 700, color: DS.color.primary, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.2, textTransform: 'uppercase', fontFamily: DS.font }}>{title}</h1>
        {subtitle && <p style={{ fontFamily: DS.font, fontSize: mob ? '10px' : '12px', color: DS.color.graphiteLight, fontWeight: 500, margin: '3px 0 0', letterSpacing: '0.02em' }}>{subtitle}</p>}
      </div>
    </div>
    {right}
  </div>
)

const Footer = ({ mob }) => <div style={{ textAlign: 'center', padding: mob ? '16px 12px' : '20px 24px', color: DS.color.graphiteMuted, fontFamily: DS.font, fontSize: '11px', fontWeight: 500, borderTop: `1px solid ${DS.color.borderLight}`, marginTop: 'auto' }}>© 2026 Aladin Foods | by MG</div>

/* ═══════════════════════════════════════════════════════════════
   DEPARTMENT VIEW
   ═══════════════════════════════════════════════════════════════ */
const DepartmentView = ({ department, restaurantId, onBack }) => {
  useNavigationHistory(onBack)
  const mob = useR()
  const pad = mob ? '12px' : '20px'
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => { loadTemplates() }, [department.id])

  const loadTemplates = async () => {
    setLoading(true)
    try {
      // Вземи точното ime на отдела по id
      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('name')
        .eq('id', department.id)
        .single()
      if (deptError) throw deptError
      const deptName = deptData?.name || department.name

      const { data: restaurantTemplates, error: rtError } = await supabase
        .from('restaurant_templates')
        .select(`*, checklist_templates (id, name, description, config, component_name, template_departments (department_name))`)
        .eq('restaurant_id', restaurantId)
        .eq('enabled', true)
      if (rtError) throw rtError

      const filtered = restaurantTemplates
        .filter(rt => (rt.checklist_templates?.template_departments || []).some(td => td.department_name === deptName))
        .map(rt => rt.checklist_templates)
      setTemplates(filtered)
    } catch (error) {
      console.error('Error loading templates:', error)
      alert('Грешка при зареждане на чек листи')
    } finally { setLoading(false) }
  }

  if (showHistory) return <UnifiedHistory department={department} restaurantId={restaurantId} onBack={() => setShowHistory(false)} />

  if (selectedTemplate) {
    const TC = TEMPLATE_COMPONENTS[selectedTemplate.component_name]
    if (TC) return <TC template={selectedTemplate} config={selectedTemplate.config} department={department} restaurantId={restaurantId} onBack={() => setSelectedTemplate(null)} />
    return <ChecklistForm template={selectedTemplate} department={department} restaurantId={restaurantId} onBack={() => setSelectedTemplate(null)} />
  }

  return (<><style>{CSS}</style>
    <div style={{ minHeight: '100vh', backgroundColor: DS.color.bg, fontFamily: DS.font, color: DS.color.graphite, display: 'flex', flexDirection: 'column' }}>
      <TopBar onBack={onBack} backLabel="Отдели" right={
        <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '4px 10px', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{templates.length} чек листа</span>
      } />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: pad, flex: 1, width: '100%' }}>

        <LogoTitle title={department.name} subtitle={`${templates.length} налични чек листа`} mob={mob} right={
          <Btn onClick={() => setShowHistory(true)} icon="history" variant="outline" sm>История</Btn>
        } />

        {/* DEPARTMENT ICON + INFO */}
        <Cd style={{ marginBottom: '16px' }}>
          <div style={{ padding: pad, display: 'flex', alignItems: 'center', gap: '16px' }}>
            {department.icon ? <img src={department.icon} alt={department.name} style={{ width: mob ? '40px' : '52px', height: mob ? '40px' : '52px', objectFit: 'contain' }} /> : null}
            <div>
              <p style={{ margin: 0, fontFamily: DS.font, fontSize: '13px', color: DS.color.graphiteLight, fontWeight: 500 }}>Избери чек лист от списъка по-долу за да го попълниш</p>
            </div>
          </div>
        </Cd>

        {/* TEMPLATES LIST */}
        {loading ? (
          <Cd><div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${DS.color.borderLight}`, borderTop: `3px solid ${DS.color.primary}`, borderRadius: '50%', animation: 'ctrlSpin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteLight, margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>Зареждане...</p>
          </div></Cd>
        ) : templates.length === 0 ? (
          <Cd><div style={{ padding: '40px', textAlign: 'center' }}>
            <Ic n="clipboard" sz={48} c={DS.color.graphiteMuted} style={{ margin: '0 auto 12px' }} />
            <p style={{ fontFamily: DS.font, fontSize: '14px', color: DS.color.graphiteMuted, margin: 0 }}>Няма налични чек листи за този отдел</p>
          </div></Cd>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {templates.map((t, idx) => (
              <Cd key={t.id} style={{ cursor: 'pointer', transition: 'all 200ms', animationDelay: `${idx * 60}ms`, display: 'flex', flexDirection: 'column' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = DS.shadow.glow; e.currentTarget.style.borderColor = DS.color.primary }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = DS.shadow.sm; e.currentTarget.style.borderColor = DS.color.borderLight }}
                onClick={() => setSelectedTemplate(t)}>
                <SH icon="clipboard" title={t.name} />
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <p style={{ margin: '0 0 12px', fontFamily: DS.font, fontSize: '13px', color: DS.color.graphiteLight, lineHeight: 1.5, flex: 1 }}>{t.description || 'Няма описание'}</p>
                  <Btn full icon="clipboard">Попълни чек лист</Btn>
                </div>
              </Cd>
            ))}
          </div>
        )}
      </div>

      <Footer mob={mob} />
    </div></>)
}

/* ═══════════════════════════════════════════════════════════════
   GENERIC CHECKLIST FORM
   ═══════════════════════════════════════════════════════════════ */
const ChecklistForm = ({ template, department, restaurantId, onBack }) => {
  const mob = useR()
  const pad = mob ? '12px' : '20px'
  const [formData, setFormData] = useState({ header: {}, rows: [] })
  const [loading, setLoading] = useState(false)
  const config = template.config

  // Safety check
  if (!config || !config.columns) {
    return (<><style>{CSS}</style>
      <div style={{ minHeight: '100vh', backgroundColor: DS.color.bg, fontFamily: DS.font, color: DS.color.graphite, display: 'flex', flexDirection: 'column' }}>
        <TopBar onBack={onBack} />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: pad, flex: 1, width: '100%' }}>
          <LogoTitle title="Грешка" subtitle="Невалидна конфигурация" mob={mob} />
          <Cd>
            <SH icon="alert" title="Грешка в конфигурацията" />
            <div style={{ padding: pad, textAlign: 'center' }}>
              <Ic n="alert" sz={48} c={DS.color.warning} style={{ margin: '0 auto 16px' }} />
              <p style={{ fontFamily: DS.font, fontSize: '14px', color: DS.color.graphiteMed, margin: '0 0 16px' }}>Този чек лист няма валидна конфигурация. Моля, свържете се с администратора.</p>
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: DS.color.dangerBg, border: `1px solid ${DS.color.danger}22`, textAlign: 'left' }}>
                <span style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 700, color: DS.color.danger, textTransform: 'uppercase' }}>Техническа информация:</span>
                <pre style={{ fontSize: '11px', color: DS.color.danger, marginTop: '8px', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{JSON.stringify({ templateId: template.id, templateName: template.name, configExists: !!config, hasColumns: config?.columns ? true : false, configValue: config }, null, 2)}</pre>
              </div>
            </div>
          </Cd>
        </div>
        <Footer mob={mob} />
      </div></>)
  }

  useEffect(() => {
    const initialHeader = {}
    config.header_fields?.forEach(field => {
      initialHeader[field.key] = field.default === 'today' ? new Date().toISOString().split('T')[0] : (field.default || '')
    })
    const initialRows = []
    const minRows = config.row_config?.min_rows || 1
    for (let i = 0; i < minRows; i++) {
      const row = { id: Date.now() + i }
      config.columns.forEach(col => { row[col.key] = col.type === 'auto_number' ? i + 1 : '' })
      initialRows.push(row)
    }
    setFormData({ header: initialHeader, rows: initialRows })
  }, [])

  const addRow = () => {
    const newRow = { id: Date.now() }
    config.columns.forEach(col => { newRow[col.key] = col.type === 'auto_number' ? formData.rows.length + 1 : '' })
    setFormData({ ...formData, rows: [...formData.rows, newRow] })
  }

  const removeRow = (rowId) => {
    if (formData.rows.length <= (config.row_config?.min_rows || 1)) return
    const updatedRows = formData.rows.filter(row => row.id !== rowId).map((row, index) => {
      const numberCol = config.columns.find(c => c.type === 'auto_number')
      return numberCol ? { ...row, [numberCol.key]: index + 1 } : row
    })
    setFormData({ ...formData, rows: updatedRows })
  }

  const updateHeader = (key, value) => setFormData({ ...formData, header: { ...formData.header, [key]: value } })
  const updateRow = (rowId, key, value) => setFormData({ ...formData, rows: formData.rows.map(row => row.id === rowId ? { ...row, [key]: value } : row) })

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const { error } = await supabase.from('checklist_submissions').insert({
        template_id: template.id, restaurant_id: restaurantId, department_id: department.id,
        data: formData, submitted_by: userData.user.id,
        submission_date: formData.header.date || new Date().toISOString().split('T')[0], synced: true
      })
      if (error) throw error
      alert('Чек листът е запазен успешно!')
      onBack()
    } catch (error) {
      console.error('Submit error:', error)
      alert('Грешка при запазване: ' + error.message)
    } finally { setLoading(false) }
  }

  return (<><style>{CSS}</style>
    <div style={{ minHeight: '100vh', backgroundColor: DS.color.bg, fontFamily: DS.font, color: DS.color.graphite, display: 'flex', flexDirection: 'column' }}>
      <TopBar onBack={onBack} backLabel="Назад" right={
        <span style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{formData.rows.length} реда</span>
      } />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: pad, flex: 1, width: '100%' }}>

        <LogoTitle title={config.title || template.name} subtitle={config.code ? `Код: ${config.code} | Ревизия: ${config.revision || '01'}` : department.name} mob={mob} />

        {/* HEADER FIELDS */}
        {config.header_fields?.length > 0 && (
          <Cd style={{ marginBottom: '12px' }}>
            <SH icon="clipboard" title="Основна информация" />
            <div style={{ padding: pad, display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {config.header_fields.map(field => (
                <DI key={field.key} label={field.label} type={field.type === 'date' ? 'date' : 'text'} value={formData.header[field.key] || ''} onChange={e => updateHeader(field.key, e.target.value)} placeholder={field.placeholder} required={field.required} style={{ flex: '1 1 200px' }} />
              ))}
            </div>
          </Cd>
        )}

        {/* TABLE */}
        <Cd style={{ marginBottom: '12px' }}>
          <SH icon="clipboard" title="Данни" right={
            <Btn onClick={addRow} icon="plus" sm>{config.row_config?.add_button_label || 'Добави ред'}</Btn>
          } />

          {mob ? (
            /* ═══ MOBILE: Cards ═══ */
            <div style={{ padding: '8px' }}>
              {formData.rows.map((row, ri) => (
                <div key={row.id} style={{ padding: '12px', marginBottom: '6px', backgroundColor: ri % 2 === 0 ? DS.color.surface : DS.color.surfaceAlt, border: `1px solid ${DS.color.borderLight}`, animation: 'ctrlFadeIn 0.3s ease' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase' }}>Ред #{ri + 1}</span>
                    {formData.rows.length > (config.row_config?.min_rows || 1) && (
                      <button onClick={() => removeRow(row.id)} style={{ padding: '4px 8px', backgroundColor: DS.color.dangerBg, border: `1px solid ${DS.color.danger}33`, borderRadius: DS.radius, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Ic n="trash" sz={12} c={DS.color.danger} /></button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {config.columns.filter(c => c.type !== 'auto_number').map(col => (
                      col.type === 'select' ? (
                        <DSel key={col.key} label={col.label} value={row[col.key] || ''} onChange={e => updateRow(row.id, col.key, e.target.value)} required={col.required}>
                          {col.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </DSel>
                      ) : (
                        <DI key={col.key} label={col.label} value={row[col.key] || ''} onChange={e => updateRow(row.id, col.key, e.target.value)} placeholder={col.placeholder} required={col.required} readOnly={col.readonly} />
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ═══ DESKTOP: Table ═══ */
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: DS.font, fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: DS.color.cardHeader }}>
                    {config.columns.map(col => (
                      <th key={col.key} style={{ padding: '10px 12px', textAlign: 'center', fontSize: '10px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `2px solid ${DS.color.borderLight}`, minWidth: col.width || '100px' }}>{col.label}</th>
                    ))}
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '10px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', borderBottom: `2px solid ${DS.color.borderLight}`, width: '60px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.rows.map((row, ri) => (
                    <tr key={row.id} style={{ backgroundColor: ri % 2 === 0 ? DS.color.surface : DS.color.surfaceAlt, borderBottom: `1px solid ${DS.color.borderLight}` }}>
                      {config.columns.map(col => (
                        <td key={col.key} style={{ padding: '6px 8px', borderRight: `1px solid ${DS.color.borderLight}` }}>
                          {col.type === 'auto_number' ? (
                            <div style={{ textAlign: 'center', fontWeight: 700, color: DS.color.primary, fontSize: '13px' }}>{row[col.key]}</div>
                          ) : col.type === 'select' ? (
                            <select value={row[col.key] || ''} onChange={e => updateRow(row.id, col.key, e.target.value)} required={col.required} style={{ ...inputBase(false), padding: '8px', fontSize: '13px', cursor: 'pointer', appearance: 'none' }}>
                              {col.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                          ) : (
                            <input type="text" value={row[col.key] || ''} onChange={e => updateRow(row.id, col.key, e.target.value)} placeholder={col.placeholder} required={col.required} readOnly={col.readonly} style={{ ...inputBase(false), padding: '8px', fontSize: '13px', backgroundColor: col.readonly ? DS.color.surfaceAlt : DS.color.surface }} />
                          )}
                        </td>
                      ))}
                      <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                        {formData.rows.length > (config.row_config?.min_rows || 1) && (
                          <button onClick={() => removeRow(row.id)} style={{ padding: '5px', backgroundColor: DS.color.dangerBg, border: `1px solid ${DS.color.danger}33`, borderRadius: DS.radius, cursor: 'pointer', display: 'inline-flex' }}><Ic n="trash" sz={13} c={DS.color.danger} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Cd>

        {/* FOOTER NOTE */}
        {config.footer_note && (
          <Cd style={{ marginBottom: '12px' }}>
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <Ic n="alert" sz={16} c={DS.color.warning} style={{ marginTop: '1px' }} />
              <p style={{ margin: 0, fontFamily: DS.font, fontSize: '13px', color: DS.color.graphiteLight, lineHeight: 1.5 }}>{config.footer_note}</p>
            </div>
          </Cd>
        )}

        {/* SUBMIT */}
        <Cd>
          <div style={{ padding: pad, textAlign: 'center' }}>
            <Btn onClick={handleSubmit} disabled={loading} icon="save" style={{ padding: '14px 40px', fontSize: '15px', minHeight: '48px' }}>
              {loading ? 'Запазване...' : 'Запази чек лист'}
            </Btn>
          </div>
        </Cd>
      </div>

      <Footer mob={mob} />
    </div></>)
}

export default DepartmentView