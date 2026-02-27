// src/components/NotificationsPanel.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigationHistory } from '../hooks/useNavigationHistory'

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
    bell: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.73 21a2 2 0 01-3.46 0" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    check: <polyline points="20 6 9 17 4 12" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    checkAll: <><polyline points="18 6 9 17 4 12" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="22 2 13 13" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/></>,
    trash: <><polyline points="3 6 5 6 21 6" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    inbox: <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    info: <><circle cx="12" cy="12" r="10" fill="none" stroke={c} strokeWidth="2"/><line x1="12" y1="16" x2="12" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="8" x2="12.01" y2="8" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" fill="none" stroke={c} strokeWidth="2"/><circle cx="12" cy="10" r="3" fill="none" stroke={c} strokeWidth="2"/></>,
  }
  return <svg width={sz} height={sz} viewBox="0 0 24 24" style={{ flexShrink: 0, display: 'block', ...s }}>{d[n]}</svg>
}

const useR = () => { const [w, sW] = useState(window.innerWidth); useEffect(() => { const h = () => sW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h) }, []); return w < 768 }

const Btn = ({ children, onClick, variant: vr = 'primary', icon: ic, sm, style: s }) => {
  const V = { primary: [DS.color.primary, '#fff'], danger: [DS.color.danger, '#fff'], ghost: [DS.color.surfaceAlt, DS.color.graphiteMed], info: [DS.color.info, '#fff'] }
  const v = V[vr] || V.primary
  return <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: sm ? '5px 10px' : '10px 18px', backgroundColor: v[0], color: v[1], border: vr === 'ghost' ? `1px solid ${DS.color.borderLight}` : 'none', borderRadius: DS.radius, fontFamily: DS.font, fontSize: sm ? '11px' : '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', minHeight: sm ? '28px' : '40px', ...s }}>{ic && <Ic n={ic} sz={sm ? 11 : 14} c={v[1]} />}{children}</button>
}

const Cd = ({ children, style: s, ...rest }) => <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, overflow: 'hidden', animation: 'cf 0.4s ease', ...s }} {...rest}>{children}</div>
const SH = ({ icon, title, right, bg }) => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: bg || DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}` }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>{icon && <Ic n={icon} sz={18} c={DS.color.primary} />}<span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{title}</span></div>{right}</div>

const NotificationsPanel = ({ onBack, restaurantId, userId }) => {
  useNavigationHistory(onBack)
  const mob = useR()
  const pad = mob ? '12px' : '20px'

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [unreadCount, setUnreadCount] = useState(0)

  // === ALL LOGIC UNCHANGED ===
  useEffect(() => {
    loadNotifications()
    const subscription = supabase.channel('notifications_channel').on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `restaurant_id=eq.${restaurantId}` }, (payload) => { console.log('Notification change:', payload); loadNotifications() }).subscribe()
    return () => { subscription.unsubscribe() }
  }, [restaurantId, filter])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      let query = supabase.from('notifications').select('*').eq('restaurant_id', restaurantId).order('created_at', { ascending: false }).limit(50)
      if (filter === 'unread') query = query.eq('read', false)
      else if (filter === 'read') query = query.eq('read', true)
      const { data, error } = await query
      if (error) throw error
      setNotifications(data || [])
      const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurantId).eq('read', false)
      setUnreadCount(count || 0)
    } catch (error) { console.error('Error loading notifications:', error) }
    finally { setLoading(false) }
  }

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase.from('notifications').update({ read: true, read_at: new Date().toISOString() }).eq('id', notificationId)
      if (error) throw error
      loadNotifications()
    } catch (error) { console.error('Error marking as read:', error) }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase.from('notifications').update({ read: true, read_at: new Date().toISOString() }).eq('restaurant_id', restaurantId).eq('read', false)
      if (error) throw error
      loadNotifications()
    } catch (error) { console.error('Error marking all as read:', error) }
  }

  const deleteNotification = async (notificationId) => {
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', notificationId)
      if (error) throw error
      loadNotifications()
    } catch (error) { console.error('Error deleting notification:', error) }
  }

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'urgent': return { bg: DS.color.danger, c: '#fff', label: 'Спешно' }
      case 'high': return { bg: '#EA580C', c: '#fff', label: 'Високо' }
      case 'low': return { bg: DS.color.graphiteMuted, c: '#fff', label: 'Ниско' }
      default: return null
    }
  }

  const getNotifIcon = (type) => {
    switch (type) {
      case 'missing_checklist': return 'alert'
      case 'reminder': return 'bell'
      case 'system': return 'info'
      default: return 'pin'
    }
  }

  const getNotifIconColor = (type) => {
    switch (type) {
      case 'missing_checklist': return DS.color.warning
      case 'reminder': return DS.color.info
      case 'system': return DS.color.graphiteLight
      default: return DS.color.primary
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return 'Сега'
    if (diffMins < 60) return `Преди ${diffMins} мин`
    if (diffHours < 24) return `Преди ${diffHours} ч`
    if (diffDays < 7) return `Преди ${diffDays} дни`
    return date.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
  }

  const filterLabels = { all: 'Всички', unread: 'Непрочетени', read: 'Прочетени' }

  return (<><style>{CSS}</style>
    <div style={{ minHeight: '100vh', backgroundColor: DS.color.bg, fontFamily: DS.font, color: DS.color.graphite, display: 'flex', flexDirection: 'column' }}>

      {/* DARK TOP BAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: DS.color.graphite, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: DS.radius, cursor: 'pointer', color: '#fff', fontFamily: DS.font, fontSize: '12px', fontWeight: 600 }}>
          <Ic n="back" sz={14} c="#fff" /> Назад
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {unreadCount > 0 && <span style={{ backgroundColor: DS.color.danger, color: '#fff', padding: '2px 8px', fontFamily: DS.font, fontSize: '10px', fontWeight: 700, borderRadius: '10px' }}>{unreadCount} нови</span>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#4ADE80' }} /><span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 600, fontFamily: DS.font }}>Online</span></div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: pad, flex: 1, width: '100%' }}>

        {/* LOGO + TITLE */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: mob ? '10px' : '14px' }}>
            <img src={LOGO} alt="Aladin Foods" style={{ height: mob ? '36px' : '48px', objectFit: 'contain', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
            <div>
              <h1 style={{ fontSize: mob ? '16px' : '22px', fontWeight: 700, color: DS.color.primary, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.2, textTransform: 'uppercase', fontFamily: DS.font }}>Известия</h1>
              <p style={{ fontFamily: DS.font, fontSize: mob ? '10px' : '12px', color: DS.color.graphiteLight, fontWeight: 500, margin: '3px 0 0' }}>
                {unreadCount > 0 ? `${unreadCount} непрочетени` : 'Няма нови известия'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && <Btn icon="checkAll" onClick={markAllAsRead} variant="info" sm={mob}>Прочети всички</Btn>}
        </div>

        {/* FILTERS */}
        <Cd style={{ marginBottom: '12px' }}>
          <div style={{ padding: '10px 16px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['all', 'unread', 'read'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '6px 14px', backgroundColor: filter === f ? DS.color.primary : DS.color.surfaceAlt,
                color: filter === f ? '#fff' : DS.color.graphiteMed, border: filter === f ? 'none' : `1px solid ${DS.color.borderLight}`,
                borderRadius: DS.radius, fontFamily: DS.font, fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}>{filterLabels[f]}</button>
            ))}
          </div>
        </Cd>

        {/* NOTIFICATIONS */}
        {loading ? (
          <Cd style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${DS.color.borderLight}`, borderTop: `3px solid ${DS.color.primary}`, borderRadius: '50%', animation: 'sp 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteLight, margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>Зареждане...</p>
          </Cd>
        ) : notifications.length === 0 ? (
          <Cd style={{ padding: '40px', textAlign: 'center' }}>
            <Ic n="inbox" sz={48} c={DS.color.graphiteMuted} style={{ margin: '0 auto 12px' }} />
            <p style={{ fontFamily: DS.font, fontSize: '14px', color: DS.color.graphiteMuted, margin: 0 }}>
              {filter === 'unread' ? 'Няма непрочетени известия' : filter === 'read' ? 'Няма прочетени известия' : 'Няма известия'}
            </p>
          </Cd>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {notifications.map((notif, idx) => {
              const pr = getPriorityStyle(notif.priority)
              const icName = getNotifIcon(notif.type)
              const icColor = getNotifIconColor(notif.type)
              return (
                <Cd key={notif.id} style={{
                  border: notif.read ? `1px solid ${DS.color.borderLight}` : `2px solid ${DS.color.ok}55`,
                  backgroundColor: notif.read ? DS.color.surface : DS.color.okBg,
                  animationDelay: `${Math.min(idx * 30, 300)}ms`, animationFillMode: 'both',
                }}>
                  <div style={{ padding: '14px 16px', display: 'flex', gap: '12px' }}>
                    {/* Icon */}
                    <div style={{
                      width: 40, height: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: notif.read ? DS.color.surfaceAlt : `${icColor}15`, border: `1px solid ${notif.read ? DS.color.borderLight : icColor + '33'}`,
                      opacity: notif.read ? 0.6 : 1,
                    }}>
                      <Ic n={icName} sz={20} c={notif.read ? DS.color.graphiteMuted : icColor} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontFamily: DS.font, fontSize: '14px', fontWeight: 700, color: notif.read ? DS.color.graphiteMuted : DS.color.primary }}>{notif.title}</h3>
                        {pr && <span style={{ padding: '2px 8px', backgroundColor: pr.bg, color: pr.c, fontFamily: DS.font, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>{pr.label}</span>}
                      </div>

                      <p style={{ margin: '0 0 8px', fontFamily: DS.font, fontSize: '12px', color: notif.read ? DS.color.graphiteMuted : DS.color.graphiteMed, lineHeight: 1.5 }}>{notif.message}</p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteMuted, fontWeight: 500 }}>{formatDate(notif.created_at)}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {!notif.read && <Btn sm icon="check" variant="info" onClick={() => markAsRead(notif.id)}>Прочети</Btn>}
                          <Btn sm icon="trash" variant="danger" onClick={() => deleteNotification(notif.id)}>Изтрий</Btn>
                        </div>
                      </div>
                    </div>
                  </div>
                </Cd>
              )
            })}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: mob ? '16px 12px' : '20px 24px', color: DS.color.graphiteMuted, fontFamily: DS.font, fontSize: '11px', fontWeight: 500, borderTop: `1px solid ${DS.color.borderLight}`, marginTop: 'auto' }}>© 2026 Aladin Foods | by MG</div>
    </div></>)
}

export default NotificationsPanel