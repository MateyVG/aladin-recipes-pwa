// src/components/NotificationBadge.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const NotificationBadge = ({ restaurantId, onClick }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!restaurantId) return

    loadCount()

    // Real-time subscription
    const subscription = supabase
      .channel('notification_count')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `restaurant_id=eq.${restaurantId}`
        }, 
        () => loadCount()
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [restaurantId])

  const loadCount = async () => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId)
        .eq('read', false)

      if (!error) {
        setCount(count || 0)
      }
    } catch (error) {
      console.error('Error loading notification count:', error)
    }
  }

  if (count === 0) return null

  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        padding: '10px 20px',
        backgroundColor: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '14px'
      }}
    >
      🔔 Известия
      {count > 0 && (
        <span style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          backgroundColor: '#dc2626',
          color: 'white',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}>
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}

export const NotificationSettings = ({ restaurantId, onBack }) => {
  const [settings, setSettings] = useState([])
  const [templates, setTemplates] = useState([])
  const [departments, setDepartments] = useState(['Pizza', 'Chicken', 'Doner', 'Operations'])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [restaurantId])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load templates
      const { data: templatesData } = await supabase
        .from('restaurant_templates')
        .select(`
          *,
          checklist_templates(
            id,
            name,
            template_departments(department_name)
          )
        `)
        .eq('restaurant_id', restaurantId)
        .eq('enabled', true)

      if (templatesData) {
        setTemplates(templatesData.map(rt => rt.checklist_templates))
      }

      // Load existing settings
      const { data: settingsData } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('restaurant_id', restaurantId)

      if (settingsData) {
        setSettings(settingsData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSetting = (templateId, departmentName) => {
    return settings.find(s => 
      s.template_id === templateId && 
      s.department_name === departmentName
    )
  }

  const toggleSetting = async (templateId, departmentName, currentlyEnabled) => {
    setSaving(true)
    try {
      const existing = getSetting(templateId, departmentName)

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('notification_settings')
          .update({ enabled: !currentlyEnabled })
          .eq('id', existing.id)

        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase
          .from('notification_settings')
          .insert({
            restaurant_id: restaurantId,
            template_id: templateId,
            department_name: departmentName,
            enabled: true,
            reminder_time: '09:00:00',
            reminder_days: [1, 2, 3, 4, 5] // Mon-Fri
          })

        if (error) throw error
      }

      await loadData()
    } catch (error) {
      console.error('Error toggling setting:', error)
      alert('Грешка при запазване на настройките')
    } finally {
      setSaving(false)
    }
  }

  const updateReminderTime = async (settingId, time) => {
    try {
      const { error } = await supabase
        .from('notification_settings')
        .update({ reminder_time: time })
        .eq('id', settingId)

      if (error) throw error
      await loadData()
    } catch (error) {
      console.error('Error updating time:', error)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
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

          <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#1a5d33' }}>
            ⚙️ Настройки за известия
          </h1>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Конфигурирай автоматични напомняния за чек листи
          </p>
        </div>

        {loading ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#6b7280' }}>Зареждане...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {templates.map(template => {
              const depts = template.template_departments || []
              
              return depts.map(td => {
                const setting = getSetting(template.id, td.department_name)
                const isEnabled = setting?.enabled || false

                return (
                  <div
                    key={`${template.id}-${td.department_name}`}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                      padding: '25px',
                      border: isEnabled ? '2px solid #86efac' : '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '20px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1a5d33', fontWeight: 'bold' }}>
                          {template.name}
                        </h3>
                        <p style={{ margin: '0 0 12px 0', color: '#6b7280', fontSize: '14px' }}>
                          Отдел: <strong>{td.department_name}</strong>
                        </p>

                        {isEnabled && setting && (
                          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div>
                              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600' }}>
                                Час за напомняне:
                              </label>
                              <input
                                type="time"
                                value={setting.reminder_time || '09:00:00'}
                                onChange={(e) => updateReminderTime(setting.id, e.target.value)}
                                style={{
                                  padding: '8px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '6px',
                                  fontSize: '14px'
                                }}
                              />
                            </div>
                            
                            <div>
                              <span style={{ fontSize: '13px', color: '#6b7280' }}>
                                Дни: Понеделник - Петък
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        gap: '10px'
                      }}>
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: '600',
                          color: isEnabled ? '#059669' : '#6b7280'
                        }}>
                          {isEnabled ? 'Активирано' : 'Деактивирано'}
                        </span>
                        <div
                          onClick={() => !saving && toggleSetting(template.id, td.department_name, isEnabled)}
                          style={{
                            width: '56px',
                            height: '32px',
                            backgroundColor: isEnabled ? '#059669' : '#d1d5db',
                            borderRadius: '16px',
                            position: 'relative',
                            transition: 'background-color 0.2s',
                            cursor: saving ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <div style={{
                            width: '28px',
                            height: '28px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '2px',
                            left: isEnabled ? '26px' : '2px',
                            transition: 'left 0.2s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }} />
                        </div>
                      </label>
                    </div>
                  </div>
                )
              })
            })}
          </div>
        )}

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1a5d33', fontSize: '16px' }}>
            ℹ️ Как работят известията?
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280', fontSize: '14px', lineHeight: '1.8' }}>
            <li>Ако чек листът не е попълнен до зададения час, ще получите известие</li>
            <li>Известията се проверяват автоматично всеки ден</li>
            <li>Напомнянията са активни само в работни дни (Пон-Пет)</li>
            <li>Можете да активирате/деактивирате за всеки template отделно</li>
          </ul>
        </div>
      </div>
    </div>
  )
}