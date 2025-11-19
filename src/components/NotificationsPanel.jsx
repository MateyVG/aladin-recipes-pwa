// src/components/NotificationsPanel.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigationHistory } from '../hooks/useNavigationHistory'

const NotificationsPanel = ({ onBack, restaurantId, userId }) => {
  useNavigationHistory(onBack)
  
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'unread', 'read'
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
    
    // Real-time subscription
    const subscription = supabase
      .channel('notifications_channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `restaurant_id=eq.${restaurantId}`
        }, 
        (payload) => {
          console.log('Notification change:', payload)
          loadNotifications()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [restaurantId, filter])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (filter === 'unread') {
        query = query.eq('read', false)
      } else if (filter === 'read') {
        query = query.eq('read', true)
      }

      const { data, error } = await query

      if (error) throw error
      
      setNotifications(data || [])
      
      // Count unread
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId)
        .eq('read', false)
      
      setUnreadCount(count || 0)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)

      if (error) throw error
      
      loadNotifications()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('restaurant_id', restaurantId)
        .eq('read', false)

      if (error) throw error
      
      loadNotifications()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error
      
      loadNotifications()
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#dc2626'
      case 'high': return '#ea580c'
      case 'normal': return '#2563eb'
      case 'low': return '#6b7280'
      default: return '#2563eb'
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'missing_checklist': return '⚠️'
      case 'reminder': return '🔔'
      case 'system': return 'ℹ️'
      default: return '📌'
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
    
    return date.toLocaleDateString('bg-BG', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <button
            onClick={onBack}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            ← Назад
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#1a5d33' }}>
                🔔 Известия
              </h1>
              <p style={{ margin: 0, color: '#6b7280' }}>
                {unreadCount > 0 ? `${unreadCount} непрочетени` : 'Няма нови известия'}
              </p>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Маркирай всички като прочетени
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['all', 'unread', 'read'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: filter === f ? '#1a5d33' : '#f3f4f6',
                  color: filter === f ? 'white' : '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                {f === 'all' ? 'Всички' : f === 'unread' ? 'Непрочетени' : 'Прочетени'}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#6b7280' }}>Зареждане...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📭</div>
            <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
              {filter === 'unread' ? 'Няма непрочетени известия' : 
               filter === 'read' ? 'Няма прочетени известия' : 
               'Няма известия'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  backgroundColor: notification.read ? 'white' : '#f0fdf4',
                  borderRadius: '12px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  padding: '20px',
                  border: notification.read ? '1px solid #e5e7eb' : '2px solid #86efac',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: '15px' }}>
                  {/* Icon */}
                  <div style={{ 
                    fontSize: '32px', 
                    flexShrink: 0,
                    filter: notification.read ? 'grayscale(50%) opacity(0.6)' : 'none'
                  }}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '16px', 
                        fontWeight: 'bold',
                        color: notification.read ? '#6b7280' : '#1a5d33'
                      }}>
                        {notification.title}
                      </h3>
                      
                      {/* Priority indicator */}
                      {notification.priority !== 'normal' && (
                        <span style={{
                          padding: '2px 8px',
                          backgroundColor: getPriorityColor(notification.priority),
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {notification.priority === 'urgent' ? 'Спешно' :
                           notification.priority === 'high' ? 'Високо' :
                           notification.priority === 'low' ? 'Ниско' : ''}
                        </span>
                      )}
                    </div>

                    <p style={{ 
                      margin: '0 0 10px 0', 
                      color: notification.read ? '#9ca3af' : '#374151',
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}>
                      {notification.message}
                    </p>

                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}>
                      <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                        {formatDate(notification.created_at)}
                      </span>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#2563eb',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '600'
                            }}
                          >
                            Маркирай
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}
                        >
                          Изтрий
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPanel