// src/components/NotificationBadge.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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

const Ic = ({ n, sz = 16, c = 'currentColor', style: s }) => {
  const d = {
    bell: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.73 21a2 2 0 01-3.46 0" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    back: <path d="M15 18l-6-6 6-6" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    settings: <><circle cx="12" cy="12" r="3" fill="none" stroke={c} strokeWidth="2"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" fill="none" stroke={c} strokeWidth="2"/></>,
    info: <><circle cx="12" cy="12" r="10" fill="none" stroke={c} strokeWidth="2"/><line x1="12" y1="16" x2="12" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="8" x2="12.01" y2="8" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    clock: <><circle cx="12" cy="12" r="10" fill="none" stroke={c} strokeWidth="2"/><polyline points="12 6 12 12 16 14" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
  }
  return <svg width={sz} height={sz} viewBox="0 0 24 24" style={{ flexShrink: 0, display: 'block', ...s }}>{d[n]}</svg>
}

// ==========================================
// NOTIFICATION BADGE
// ==========================================

export const NotificationBadge = ({ restaurantId, onClick }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!restaurantId) return
    loadCount()
    const subscription = supabase
      .channel('notification_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `restaurant_id=eq.${restaurantId}` }, () => loadCount())
      .subscribe()
    return () => { subscription.unsubscribe() }
  }, [restaurantId])

  const loadCount = async () => {
    try {
      const { count, error } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurantId).eq('read', false)
      if (!error) setCount(count || 0)
    } catch (error) { console.error('Error loading notification count:', error) }
  }

  if (count === 0) return null

  return (
    <button onClick={onClick} style={{
      position: 'relative', padding: '8px 16px', backgroundColor: DS.color.primary, color: '#fff', border: 'none', borderRadius: DS.radius, fontFamily: DS.font, fontWeight: 600, cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s', minHeight: '36px',
    }}>
      <Ic n="bell" sz={15} c="#fff" />
      Известия
      {count > 0 && (
        <span style={{
          position: 'absolute', top: '-8px', right: '-8px', backgroundColor: DS.color.danger, color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DS.font, fontSize: '10px', fontWeight: 700, boxShadow: '0 2px 8px rgba(197,48,48,0.4)',
        }}>
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}

// ==========================================
// NOTIFICATION SETTINGS
// ==========================================

const CSS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');*,*::before,*::after{box-sizing:border-box}body{margin:0;background:${DS.color.bg}}@keyframes cf{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes sp{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@media(max-width:767px){input,button,select,textarea{font-size:16px!important}}`

const SH = ({ icon, title, right, bg }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: bg || DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {icon && <Ic n={icon} sz={18} c={DS.color.primary} />}
      <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{title}</span>
    </div>
    {right}
  </div>
)

const Cd = ({ children, style: s, ...rest }) => (
  <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, overflow: 'hidden', animation: 'cf 0.4s ease', ...s }} {...rest}>{children}</div>
)

export const NotificationSettings = ({ restaurantId, onBack }) => {
  const [settings, setSettings] = useState([])
  const [templates, setTemplates] = useState([])
  const [departments, setDepartments] = useState(['Pizza', 'Chicken', 'Doner', 'Operations'])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const mob = typeof window !== 'undefined' && window.innerWidth < 768
  const pad = mob ? '12px' : '20px'

  useEffect(() => { loadData() }, [restaurantId])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data: templatesData } = await supabase.from('restaurant_templates').select(`*, checklist_templates(id, name, template_departments(department_name))`).eq('restaurant_id', restaurantId).eq('enabled', true)
      if (templatesData) setTemplates(templatesData.map(rt => rt.checklist_templates))
      const { data: settingsData } = await supabase.from('notification_settings').select('*').eq('restaurant_id', restaurantId)
      if (settingsData) setSettings(settingsData)
    } catch (error) { console.error('Error loading data:', error) }
    finally { setLoading(false) }
  }

  const getSetting = (templateId, departmentName) => settings.find(s => s.template_id === templateId && s.department_name === departmentName)

  const toggleSetting = async (templateId, departmentName, currentlyEnabled) => {
    setSaving(true)
    try {
      const existing = getSetting(templateId, departmentName)
      if (existing) {
        const { error } = await supabase.from('notification_settings').update({ enabled: !currentlyEnabled }).eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('notification_settings').insert({ restaurant_id: restaurantId, template_id: templateId, department_name: departmentName, enabled: true, reminder_time: '09:00:00', reminder_days: [1, 2, 3, 4, 5] })
        if (error) throw error
      }
      await loadData()
    } catch (error) { console.error('Error toggling setting:', error); alert('Грешка при запазване на настройките') }
    finally { setSaving(false) }
  }

  const updateReminderTime = async (settingId, time) => {
    try {
      const { error } = await supabase.from('notification_settings').update({ reminder_time: time }).eq('id', settingId)
      if (error) throw error
      await loadData()
    } catch (error) { console.error('Error updating time:', error) }
  }

  return (<><style>{CSS}</style>
    <div style={{ minHeight: '100vh', backgroundColor: DS.color.bg, fontFamily: DS.font, color: DS.color.graphite, display: 'flex', flexDirection: 'column' }}>

      {/* DARK TOP BAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: DS.color.graphite, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: DS.radius, cursor: 'pointer', color: '#fff', fontFamily: DS.font, fontSize: '12px', fontWeight: 600 }}>
          <Ic n="back" sz={14} c="#fff" /> Назад
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#4ADE80' }} />
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 600, fontFamily: DS.font }}>Online</span>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: pad, flex: 1, width: '100%' }}>

        {/* LOGO + TITLE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: mob ? '10px' : '14px', marginBottom: '16px' }}>
          <img src={LOGO} alt="Aladin Foods" style={{ height: mob ? '36px' : '48px', objectFit: 'contain', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
          <div>
            <h1 style={{ fontSize: mob ? '16px' : '22px', fontWeight: 700, color: DS.color.primary, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.2, textTransform: 'uppercase', fontFamily: DS.font }}>Настройки за известия</h1>
            <p style={{ fontFamily: DS.font, fontSize: mob ? '10px' : '12px', color: DS.color.graphiteLight, fontWeight: 500, margin: '3px 0 0' }}>Конфигурирай автоматични напомняния за чек листи</p>
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <Cd style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${DS.color.borderLight}`, borderTop: `3px solid ${DS.color.primary}`, borderRadius: '50%', animation: 'sp 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteLight, margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>Зареждане...</p>
          </Cd>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {templates.map(template => {
              const depts = template.template_departments || []
              return depts.map(td => {
                const setting = getSetting(template.id, td.department_name)
                const isEnabled = setting?.enabled || false
                return (
                  <Cd key={`${template.id}-${td.department_name}`} style={{ border: isEnabled ? `2px solid ${DS.color.ok}44` : `1px solid ${DS.color.borderLight}` }}>
                    <div style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ margin: '0 0 4px', fontFamily: DS.font, fontSize: '15px', fontWeight: 700, color: DS.color.primary }}>{template.name}</h3>
                          <p style={{ margin: '0 0 10px', fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteLight }}>
                            Отдел: <strong style={{ color: DS.color.graphiteMed }}>{td.department_name}</strong>
                          </p>

                          {isEnabled && setting && (
                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', padding: '10px 12px', backgroundColor: DS.color.okBg, border: `1px solid ${DS.color.ok}33` }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Ic n="clock" sz={14} c={DS.color.primary} />
                                <label style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.graphiteLight, textTransform: 'uppercase' }}>Час:</label>
                                <input
                                  type="time"
                                  value={setting.reminder_time || '09:00:00'}
                                  onChange={(e) => updateReminderTime(setting.id, e.target.value)}
                                  style={{ padding: '4px 8px', border: `1.5px solid ${DS.color.borderLight}`, borderRadius: DS.radius, fontFamily: DS.font, fontSize: '13px', backgroundColor: DS.color.surface, outline: 'none' }}
                                />
                              </div>
                              <span style={{ fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteMuted }}>Пон – Пет</span>
                            </div>
                          )}
                        </div>

                        {/* TOGGLE SWITCH */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <span style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 700, color: isEnabled ? DS.color.ok : DS.color.graphiteMuted, textTransform: 'uppercase' }}>
                            {isEnabled ? 'Активно' : 'Изкл.'}
                          </span>
                          <div
                            onClick={() => !saving && toggleSetting(template.id, td.department_name, isEnabled)}
                            style={{
                              width: '48px', height: '26px',
                              backgroundColor: isEnabled ? DS.color.ok : DS.color.graphiteMuted,
                              borderRadius: '13px', position: 'relative',
                              transition: 'background-color 0.2s',
                              cursor: saving ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <div style={{
                              width: '22px', height: '22px', backgroundColor: '#fff', borderRadius: '50%',
                              position: 'absolute', top: '2px', left: isEnabled ? '24px' : '2px',
                              transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                            }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Cd>
                )
              })
            })}
          </div>
        )}

        {/* INFO CARD */}
        <Cd style={{ marginTop: '14px' }}>
          <SH icon="info" title="Как работят известията?" bg={DS.color.infoBg} />
          <div style={{ padding: '14px 16px', fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteLight, lineHeight: 1.8 }}>
            <p style={{ margin: '0 0 4px' }}>• Ако чек листът не е попълнен до зададения час, ще получите известие</p>
            <p style={{ margin: '0 0 4px' }}>• Известията се проверяват автоматично всеки ден</p>
            <p style={{ margin: '0 0 4px' }}>• Напомнянията са активни само в работни дни (Пон – Пет)</p>
            <p style={{ margin: 0 }}>• Можете да активирате / деактивирате за всеки template отделно</p>
          </div>
        </Cd>
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: mob ? '16px 12px' : '20px 24px', color: DS.color.graphiteMuted, fontFamily: DS.font, fontSize: '11px', fontWeight: 500, borderTop: `1px solid ${DS.color.borderLight}`, marginTop: 'auto' }}>© 2026 Aladin Foods | by MG</div>
    </div></>)
}