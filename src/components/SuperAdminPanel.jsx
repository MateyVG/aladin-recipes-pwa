// src/components/SuperAdminPanel.jsx
import React, { useState, useEffect } from 'react'
import { createNewManager, supabase } from '../lib/supabase'

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
    users: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" fill="none" stroke={c} strokeWidth="2"/><circle cx="9" cy="7" r="4" fill="none" stroke={c} strokeWidth="2"/><path d="M23 21v-2a4 4 0 00-3-3.87" fill="none" stroke={c} strokeWidth="2"/><path d="M16 3.13a4 4 0 010 7.75" fill="none" stroke={c} strokeWidth="2"/></>,
    template: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="none" stroke={c} strokeWidth="2"/><polyline points="14 2 14 8 20 8" fill="none" stroke={c} strokeWidth="2"/><line x1="16" y1="13" x2="8" y2="13" stroke={c} strokeWidth="2"/><line x1="16" y1="17" x2="8" y2="17" stroke={c} strokeWidth="2"/></>,
    link: <><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    trash: <><polyline points="3 6 5 6 21 6" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    download: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" fill="none" stroke={c} strokeWidth="2"/><polyline points="7 10 12 15 17 10" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="15" x2="12" y2="3" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    check: <polyline points="20 6 9 17 4 12" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    x: <><line x1="18" y1="6" x2="6" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    save: <><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" fill="none" stroke={c} strokeWidth="2"/><polyline points="17 21 17 13 7 13 7 21" fill="none" stroke={c} strokeWidth="2"/><polyline points="7 3 7 8 15 8" fill="none" stroke={c} strokeWidth="2"/></>,
  }
  return <svg width={sz} height={sz} viewBox="0 0 24 24" style={{ flexShrink: 0, display: 'block', ...s }}>{d[n]}</svg>
}

const useR = () => { const [w, sW] = useState(window.innerWidth); useEffect(() => { const h = () => sW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h) }, []); return w < 768 }

const Cd = ({ children, style: s, ...rest }) => <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, overflow: 'hidden', animation: 'cf 0.4s ease', ...s }} {...rest}>{children}</div>
const SH = ({ icon, title, right, bg }) => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: bg || DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}` }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>{icon && <Ic n={icon} sz={18} c={DS.color.primary} />}<span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{title}</span></div>{right}</div>

const inputBase = (f) => ({ width: '100%', padding: '10px 12px', backgroundColor: f ? DS.color.surface : DS.color.surfaceAlt, border: `1.5px solid ${f ? DS.color.primary : DS.color.borderLight}`, borderRadius: DS.radius, fontSize: '14px', fontFamily: DS.font, fontWeight: 400, color: DS.color.graphite, outline: 'none', transition: 'all 150ms', boxShadow: f ? `0 0 0 3px ${DS.color.primaryGlow}` : 'none', boxSizing: 'border-box', WebkitAppearance: 'none' })
const DI = ({ label, type = 'text', value, onChange, placeholder, style: s }) => { const [f, sF] = useState(false); return <div style={{ marginBottom: '14px', ...s }}>{label && <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: f ? DS.color.primary : DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</label>}<input type={type} value={value} onChange={onChange} placeholder={placeholder} onFocus={() => sF(true)} onBlur={() => sF(false)} style={inputBase(f)} /></div> }
const DSel = ({ label, value, onChange, children, style: s }) => { const [f, sF] = useState(false); return <div style={{ marginBottom: '14px', ...s }}>{label && <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: f ? DS.color.primary : DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</label>}<select value={value} onChange={onChange} onFocus={() => sF(true)} onBlur={() => sF(false)} style={{ ...inputBase(f), cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2395A39D' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: '28px' }}>{children}</select></div> }

const Btn = ({ children, onClick, disabled: dis, variant: vr = 'primary', icon: ic, sm, style: s }) => {
  const V = { primary: [DS.color.primary, '#fff'], danger: [DS.color.danger, '#fff'], ghost: [DS.color.surfaceAlt, DS.color.graphiteMed], ok: [DS.color.ok, '#fff'], info: [DS.color.info, '#fff'] }
  const v = V[vr] || V.primary
  return <button onClick={onClick} disabled={dis} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: sm ? '5px 10px' : '10px 18px', backgroundColor: dis ? DS.color.graphiteMuted : v[0], color: dis ? '#fff' : v[1], border: vr === 'ghost' ? `1px solid ${DS.color.borderLight}` : 'none', borderRadius: DS.radius, fontFamily: DS.font, fontSize: sm ? '11px' : '13px', fontWeight: 600, cursor: dis ? 'not-allowed' : 'pointer', transition: 'all 0.15s', minHeight: sm ? '28px' : '40px', ...s }}>{ic && <Ic n={ic} sz={sm ? 11 : 14} c={dis ? '#fff' : v[1]} />}{children}</button>
}

const TH = { padding: '8px 10px', border: `1px solid ${DS.color.borderLight}`, textAlign: 'left', fontSize: '10px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: DS.font }
const TD = { padding: '8px 10px', border: `1px solid ${DS.color.borderLight}`, fontFamily: DS.font, fontSize: '12px' }

const SuperAdminPanel = ({ onBack }) => {
  const mob = useR()
  const pad = mob ? '12px' : '20px'

  const [activeTab, setActiveTab] = useState('managers')
  const [loading, setLoading] = useState(false)

  // Managers tab state
  const [emailList, setEmailList] = useState('')
  const [creationResults, setCreationResults] = useState([])

  // Templates tab state
  const [templates, setTemplates] = useState([])
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [templateConfig, setTemplateConfig] = useState('')
  const [selectedDepartments, setSelectedDepartments] = useState([])

  // Restaurants tab state
  const [restaurants, setRestaurants] = useState([])
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [availableTemplates, setAvailableTemplates] = useState([])
  const [assignedTemplates, setAssignedTemplates] = useState([])

  const departments = ['Pizza', 'Chicken', 'Doner', 'Operations']

  // === ALL LOGIC UNCHANGED ===
  useEffect(() => {
    if (activeTab === 'templates') loadTemplates()
    else if (activeTab === 'assign') { loadRestaurants(); loadTemplates() }
  }, [activeTab])

  const loadTemplates = async () => {
    const { data, error } = await supabase.from('checklist_templates').select('*, template_departments(department_name)').order('created_at', { ascending: false })
    if (!error) setTemplates(data || [])
  }

  const loadRestaurants = async () => {
    const { data, error } = await supabase.from('restaurants').select('*').eq('active', true).order('name')
    if (!error) setRestaurants(data || [])
  }

  const loadAssignedTemplates = async (restaurantId) => {
    const { data, error } = await supabase.from('restaurant_templates').select('*, checklist_templates(id, name)').eq('restaurant_id', restaurantId)
    if (!error) {
      setAssignedTemplates(data || [])
      const assignedIds = data.map(d => d.template_id)
      setAvailableTemplates(templates.filter(t => !assignedIds.includes(t.id)))
    }
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  const handleCreateManagers = async () => {
    setLoading(true)
    setCreationResults([])
    const emails = emailList.split('\n').map(e => e.trim()).filter(e => e)
    const results = []
    for (const email of emails) {
      const password = generatePassword()
      const fullName = email.split('@')[0]
      const result = await createNewManager(email, password, fullName)
      results.push({ email, password, success: result.success, message: result.success ? 'Успешно създаден' : result.error })
    }
    setCreationResults(results)
    setLoading(false)
  }

  const downloadCSV = () => {
    const BOM = '\uFEFF'
    const csvData = 'Email,Password,Status,Message\n' + creationResults.map(r => `${r.email},${r.password},${r.success ? 'Success' : 'Error'},${r.message}`).join('\n')
    const blob = new Blob([BOM + csvData], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `managers_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleCreateTemplate = async () => {
    if (!templateName || !templateConfig || selectedDepartments.length === 0) {
      alert('Моля попълни име, config и избери поне един отдел')
      return
    }
    try {
      const config = JSON.parse(templateConfig)
      setLoading(true)
      const { data: template, error: templateError } = await supabase.from('checklist_templates').insert({ name: templateName, description: templateDescription, config: config, active: true, created_by: (await supabase.auth.getUser()).data.user.id }).select().single()
      if (templateError) throw templateError
      const deptMappings = selectedDepartments.map(dept => ({ template_id: template.id, department_name: dept }))
      const { error: deptError } = await supabase.from('template_departments').insert(deptMappings)
      if (deptError) throw deptError
      alert('Template създаден успешно!')
      setTemplateName(''); setTemplateDescription(''); setTemplateConfig(''); setSelectedDepartments([])
      loadTemplates()
    } catch (error) { alert('Грешка: ' + error.message) }
    finally { setLoading(false) }
  }

  const handleAssignTemplate = async (templateId) => {
    if (!selectedRestaurant) return
    try {
      const { error } = await supabase.from('restaurant_templates').insert({ restaurant_id: selectedRestaurant.id, template_id: templateId, enabled: true, assigned_by: (await supabase.auth.getUser()).data.user.id })
      if (error) throw error
      loadAssignedTemplates(selectedRestaurant.id)
    } catch (error) { alert('Грешка: ' + error.message) }
  }

  const handleUnassignTemplate = async (assignmentId) => {
    try {
      const { error } = await supabase.from('restaurant_templates').delete().eq('id', assignmentId)
      if (error) throw error
      loadAssignedTemplates(selectedRestaurant.id)
    } catch (error) { alert('Грешка: ' + error.message) }
  }

  const tabs = [
    { id: 'managers', label: 'Мениджъри', icon: 'users' },
    { id: 'templates', label: 'Templates', icon: 'template' },
    { id: 'assign', label: 'Разпределяне', icon: 'link' }
  ]

  const [focTA, setFocTA] = useState(false)

  return (<><style>{CSS}</style>
    <div style={{ minHeight: '100vh', backgroundColor: DS.color.bg, fontFamily: DS.font, color: DS.color.graphite, display: 'flex', flexDirection: 'column' }}>

      {/* DARK TOP BAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: DS.color.graphite, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: DS.radius, cursor: 'pointer', color: '#fff', fontFamily: DS.font, fontSize: '12px', fontWeight: 600 }}>
          <Ic n="back" sz={14} c="#fff" /> Назад
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#4ADE80' }} /><span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 600, fontFamily: DS.font }}>Online</span></div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: pad, flex: 1, width: '100%' }}>

        {/* LOGO + TITLE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: mob ? '10px' : '14px', marginBottom: '16px' }}>
          <img src={LOGO} alt="Aladin Foods" style={{ height: mob ? '36px' : '48px', objectFit: 'contain', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
          <div>
            <h1 style={{ fontSize: mob ? '16px' : '22px', fontWeight: 700, color: DS.color.primary, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.2, textTransform: 'uppercase', fontFamily: DS.font }}>Super Admin Panel</h1>
            <p style={{ fontFamily: DS.font, fontSize: mob ? '10px' : '12px', color: DS.color.graphiteLight, fontWeight: 500, margin: '3px 0 0' }}>Управление на мениджъри, templates и ресторанти</p>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', borderBottom: `2px solid ${DS.color.borderLight}`, paddingBottom: '0' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 18px',
              backgroundColor: activeTab === tab.id ? DS.color.primary : 'transparent',
              color: activeTab === tab.id ? '#fff' : DS.color.graphiteMuted,
              border: 'none', borderRadius: DS.radius,
              fontFamily: DS.font, fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
              marginBottom: '-2px',
              borderBottom: activeTab === tab.id ? `2px solid ${DS.color.primary}` : '2px solid transparent',
            }}>
              <Ic n={tab.icon} sz={14} c={activeTab === tab.id ? '#fff' : DS.color.graphiteMuted} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}

        {/* ========== MANAGERS TAB ========== */}
        {activeTab === 'managers' && (
          <Cd>
            <SH icon="users" title="Създаване на мениджъри" />
            <div style={{ padding: pad }}>
              <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: focTA ? DS.color.primary : DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Email адреси (по един на ред)</label>
              <textarea
                value={emailList}
                onChange={e => setEmailList(e.target.value)}
                onFocus={() => setFocTA(true)}
                onBlur={() => setFocTA(false)}
                placeholder={"manager1@restaurant.com\nmanager2@restaurant.com"}
                style={{ ...inputBase(focTA), minHeight: '140px', fontFamily: "'DM Sans', monospace", resize: 'vertical', marginBottom: '14px' }}
              />

              <Btn onClick={handleCreateManagers} disabled={loading || !emailList.trim()} icon="plus">
                {loading ? 'Създаване...' : 'Създай мениджъри'}
              </Btn>

              {/* Results */}
              {creationResults.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase' }}>Резултати</span>
                    <Btn sm icon="download" variant="ok" onClick={downloadCSV}>Свали CSV</Btn>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: DS.font }}>
                      <thead><tr style={{ backgroundColor: DS.color.cardHeader }}>
                        {['Email', 'Парола', 'Статус', 'Съобщение'].map((h, i) => <th key={i} style={TH}>{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {creationResults.map((result, index) => (
                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? DS.color.surface : DS.color.surfaceAlt }}>
                            <td style={TD}>{result.email}</td>
                            <td style={{ ...TD, fontFamily: 'monospace', backgroundColor: DS.color.surfaceAlt }}>{result.password}</td>
                            <td style={{ ...TD, color: result.success ? DS.color.ok : DS.color.danger, fontWeight: 700 }}>
                              {result.success ? '✓ Успех' : '✗ Грешка'}
                            </td>
                            <td style={{ ...TD, fontSize: '11px' }}>{result.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </Cd>
        )}

        {/* ========== TEMPLATES TAB ========== */}
        {activeTab === 'templates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Cd>
              <SH icon="template" title="Създаване на Checklist Template" />
              <div style={{ padding: pad }}>
                <DI label="Име на template" value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="Контрол на работно облекло" />
                <DI label="Описание" value={templateDescription} onChange={e => setTemplateDescription(e.target.value)} placeholder="Проверка на хигиена и облекло на персонала" />

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>Отдели</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {departments.map(dept => {
                      const sel = selectedDepartments.includes(dept)
                      return (
                        <button key={dept} onClick={() => {
                          if (sel) setSelectedDepartments(selectedDepartments.filter(d => d !== dept))
                          else setSelectedDepartments([...selectedDepartments, dept])
                        }} style={{
                          padding: '6px 14px', backgroundColor: sel ? DS.color.primary : DS.color.surfaceAlt,
                          color: sel ? '#fff' : DS.color.graphiteMed, border: sel ? 'none' : `1px solid ${DS.color.borderLight}`,
                          borderRadius: DS.radius, fontFamily: DS.font, fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                        }}>{sel && '✓ '}{dept}</button>
                      )
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>JSON Config</label>
                  <textarea
                    value={templateConfig}
                    onChange={e => setTemplateConfig(e.target.value)}
                    placeholder='{"type": "table", "columns": [...]}'
                    style={{ ...inputBase(false), minHeight: '180px', fontFamily: "'DM Sans', monospace", resize: 'vertical' }}
                  />
                  <p style={{ fontFamily: DS.font, fontSize: '10px', color: DS.color.graphiteMuted, margin: '4px 0 0' }}>Постави JSON конфигурация на checklist-а</p>
                </div>

                <Btn onClick={handleCreateTemplate} disabled={loading} icon="save">
                  {loading ? 'Създаване...' : 'Създай Template'}
                </Btn>
              </div>
            </Cd>

            {/* Templates List */}
            {templates.length > 0 && (
              <Cd>
                <SH icon="template" title={`Съществуващи Templates (${templates.length})`} />
                <div style={{ padding: '6px' }}>
                  {templates.map((template, idx) => (
                    <div key={template.id} style={{ padding: '14px', margin: '4px', backgroundColor: idx % 2 === 0 ? DS.color.surface : DS.color.surfaceAlt }}>
                      <h4 style={{ margin: '0 0 4px', fontFamily: DS.font, fontSize: '14px', fontWeight: 700, color: DS.color.primary }}>{template.name}</h4>
                      <p style={{ margin: '0 0 8px', fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteLight }}>{template.description}</p>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {template.template_departments?.map((td, i) => (
                          <span key={i} style={{ padding: '3px 10px', backgroundColor: DS.color.primary, color: '#fff', fontFamily: DS.font, fontSize: '10px', fontWeight: 700 }}>{td.department_name}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Cd>
            )}
          </div>
        )}

        {/* ========== ASSIGN TAB ========== */}
        {activeTab === 'assign' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Cd>
              <SH icon="link" title="Разпределяне на Templates към Ресторанти" />
              <div style={{ padding: pad }}>
                <DSel label="Избери ресторант" value={selectedRestaurant?.id || ''} onChange={e => {
                  const restaurant = restaurants.find(r => r.id === e.target.value)
                  setSelectedRestaurant(restaurant)
                  if (restaurant) loadAssignedTemplates(restaurant.id)
                }}>
                  <option value="">-- Избери ресторант --</option>
                  {restaurants.map(restaurant => (
                    <option key={restaurant.id} value={restaurant.id}>{restaurant.name} ({restaurant.contact_email})</option>
                  ))}
                </DSel>
              </div>
            </Cd>

            {selectedRestaurant && (<>
              {/* Available Templates */}
              <Cd>
                <SH icon="template" title={`Налични Templates (${availableTemplates.length})`} />
                <div style={{ padding: '4px' }}>
                  {availableTemplates.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteMuted }}>Всички templates са вече разпределени</div>
                  ) : availableTemplates.map((template, idx) => (
                    <div key={template.id} style={{ padding: '12px', margin: '4px', backgroundColor: idx % 2 === 0 ? DS.color.surface : DS.color.surfaceAlt, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: DS.font, fontWeight: 700, fontSize: '13px', color: DS.color.graphite }}>{template.name}</div>
                        <div style={{ fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteLight, marginTop: '2px' }}>{template.description}</div>
                      </div>
                      <Btn sm icon="plus" onClick={() => handleAssignTemplate(template.id)}>Добави</Btn>
                    </div>
                  ))}
                </div>
              </Cd>

              {/* Assigned Templates */}
              <Cd>
                <SH icon="check" title={`Разпределени Templates (${assignedTemplates.length})`} bg={DS.color.okBg} />
                <div style={{ padding: '4px' }}>
                  {assignedTemplates.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteMuted }}>Няма разпределени templates</div>
                  ) : assignedTemplates.map((assignment, idx) => (
                    <div key={assignment.id} style={{ padding: '12px', margin: '4px', backgroundColor: idx % 2 === 0 ? DS.color.okBg : DS.color.surface, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', border: `1px solid ${DS.color.ok}33` }}>
                      <div style={{ fontFamily: DS.font, fontWeight: 700, fontSize: '13px', color: DS.color.primary }}>{assignment.checklist_templates.name}</div>
                      <Btn sm icon="trash" variant="danger" onClick={() => handleUnassignTemplate(assignment.id)}>Премахни</Btn>
                    </div>
                  ))}
                </div>
              </Cd>
            </>)}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: mob ? '16px 12px' : '20px 24px', color: DS.color.graphiteMuted, fontFamily: DS.font, fontSize: '11px', fontWeight: 500, borderTop: `1px solid ${DS.color.borderLight}`, marginTop: 'auto' }}>© 2026 Aladin Foods | by MG</div>
    </div></>)
}

export default SuperAdminPanel