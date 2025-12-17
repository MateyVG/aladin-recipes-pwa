// src/components/ReportsAdminPanel.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigationHistory } from '../hooks/useNavigationHistory'

const ReportsAdminPanel = ({ onBack }) => {
  useNavigationHistory(onBack)
  
  const [loading, setLoading] = useState(true)
  const [restaurants, setRestaurants] = useState([])
  const [templates, setTemplates] = useState([])
  
  // Selection state
  const [selectedRestaurant, setSelectedRestaurant] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [submissions, setSubmissions] = useState([])
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  
  // View
  const [view, setView] = useState('overview') // 'overview', 'restaurant', 'detail'
  
  // Overview stats
  const [overviewStats, setOverviewStats] = useState([])

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (restaurants.length > 0) {
      loadOverviewStats()
    }
  }, [selectedDate, restaurants])

  useEffect(() => {
    if (selectedRestaurant) {
      loadRestaurantSubmissions()
    }
  }, [selectedRestaurant, selectedDate])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const { data: restaurantsData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('active', true)
        .order('name')
      
      setRestaurants(restaurantsData || [])

      const { data: templatesData } = await supabase
        .from('checklist_templates')
        .select('id, name')
        .eq('active', true)
        .order('name')
      
      // Remove duplicates by name
      const unique = templatesData?.reduce((acc, curr) => {
        if (!acc.find(t => t.name === curr.name)) acc.push(curr)
        return acc
      }, []) || []
      
      setTemplates(unique)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadOverviewStats = async () => {
    try {
      // Get assigned templates per restaurant
      const { data: assignments } = await supabase
        .from('restaurant_templates')
        .select('restaurant_id, template_id')
        .eq('enabled', true)

      // Get submissions for selected date
      const { data: allSubmissions } = await supabase
        .from('checklist_submissions')
        .select(`
          id,
          restaurant_id,
          template_id,
          submission_date,
          checklist_templates(name)
        `)
        .eq('submission_date', selectedDate)

      // Group by restaurant
      const stats = restaurants.map(restaurant => {
        // Count expected (assigned) templates for this restaurant
        const expectedTemplates = assignments?.filter(a => a.restaurant_id === restaurant.id) || []
        const expectedCount = [...new Set(expectedTemplates.map(a => a.template_id))].length

        // Count completed (unique templates submitted)
        const restaurantSubs = allSubmissions?.filter(s => s.restaurant_id === restaurant.id) || []
        const completedTemplateIds = [...new Set(restaurantSubs.map(s => s.template_id))]
        const completedCount = completedTemplateIds.length

        const percentage = expectedCount > 0 ? (completedCount / expectedCount) * 100 : 0
        
        return {
          id: restaurant.id,
          name: restaurant.name,
          expected: expectedCount,
          completed: completedCount,
          missing: expectedCount - completedCount,
          percentage: percentage,
          submissionsCount: restaurantSubs.length,
          hasActivity: restaurantSubs.length > 0
        }
      })

      // Sort: by percentage (lowest first to highlight problems), then by name
      stats.sort((a, b) => {
        if (a.expected === 0 && b.expected > 0) return 1
        if (a.expected > 0 && b.expected === 0) return -1
        if (a.percentage !== b.percentage) return a.percentage - b.percentage
        return a.name.localeCompare(b.name, 'bg')
      })

      setOverviewStats(stats)
    } catch (error) {
      console.error('Error loading overview:', error)
    }
  }

  const loadRestaurantSubmissions = async () => {
    if (!selectedRestaurant) return
    
    setLoading(true)
    try {
      // Get all submissions for this restaurant on selected date
      const { data } = await supabase
        .from('checklist_submissions')
        .select(`
          id,
          template_id,
          submission_date,
          submitted_at,
          data,
          checklist_templates(id, name),
          profiles(full_name)
        `)
        .eq('restaurant_id', selectedRestaurant)
        .eq('submission_date', selectedDate)
        .order('submitted_at', { ascending: false })

      setSubmissions(data || [])
      setView('restaurant')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get assigned templates for a restaurant
  const getAssignedTemplates = async (restaurantId) => {
    const { data } = await supabase
      .from('restaurant_templates')
      .select(`
        template_id,
        checklist_templates(id, name)
      `)
      .eq('restaurant_id', restaurantId)
      .eq('enabled', true)
    
    // Get unique template names
    const uniqueNames = [...new Set(data?.map(d => d.checklist_templates?.name).filter(Boolean))]
    return uniqueNames
  }

  const loadSubmissionDetail = async (submission) => {
    setSelectedSubmission(submission)
    setView('detail')
  }

  // Date helpers
  const setToday = () => setSelectedDate(new Date().toISOString().split('T')[0])
  const setYesterday = () => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }
  const setPrevDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }
  const setNextDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('bg-BG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('bg-BG', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Render data based on checklist type
  const renderChecklistData = (submission) => {
    const data = submission.data
    const name = submission.checklist_templates?.name || ''

    // Чек лист за подмяна на мазнината
    if (name.includes('мазнина')) {
      const filledRecords = data.records?.filter(r => r.date || r.quantity) || []
      return (
        <div>
          <h4 style={{ margin: '0 0 15px 0', color: '#1a5d33' }}>Записи за смяна на масло</h4>
          {filledRecords.length === 0 ? (
            <p style={{ color: '#6b7280' }}>Няма попълнени записи</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filledRecords.map((record, idx) => (
                <div key={idx} style={{
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  borderLeft: record.completed ? '4px solid #059669' : '4px solid #f59e0b'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                    <div><strong>Дата:</strong> {record.date || '-'}</div>
                    <div><strong>Смяна:</strong> {record.shift || '-'}</div>
                    <div><strong>Количество:</strong> {record.quantity || '-'} л</div>
                    <div><strong>Вид:</strong> {record.oilType || '-'}</div>
                    <div><strong>Служител:</strong> {record.nameSignature || '-'}</div>
                    <div><strong>Статус:</strong> {record.completed ? '✅ Завършен' : '⏳ В процес'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    // Контролна карта хладилно съхранение
    if (name.includes('хладилно')) {
      const blocks = data.dateBlocks || []
      return (
        <div>
          <h4 style={{ margin: '0 0 15px 0', color: '#1a5d33' }}>Температури на хладилници</h4>
          {blocks.map((block, idx) => (
            <div key={idx} style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: '600', marginBottom: '10px' }}>📅 {block.date}</div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                gap: '8px'
              }}>
                {Object.entries(block.readings || {}).filter(([key]) => key.match(/^\d/)).map(([key, value]) => (
                  <div key={key} style={{
                    padding: '8px',
                    backgroundColor: value ? '#f0fdf4' : '#fef2f2',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '13px'
                  }}>
                    <div style={{ color: '#6b7280', fontSize: '11px' }}>{key}</div>
                    <div style={{ fontWeight: '600', color: value ? '#059669' : '#dc2626' }}>
                      {value || '-'}°C
                    </div>
                  </div>
                ))}
              </div>
              {block.readings?.inspector_name && (
                <div style={{ marginTop: '10px', fontSize: '13px', color: '#6b7280' }}>
                  👤 Проверил: {block.readings.inspector_name}
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    // Термична обработка - Пица
    if (name.includes('Пица')) {
      const pizzaCounts = data.pizzaCounts || {}
      const temperatures = data.temperatures || {}
      const totalPizzas = data.metadata?.total_pizzas || 0
      
      return (
        <div>
          <h4 style={{ margin: '0 0 15px 0', color: '#1a5d33' }}>
            Термична обработка на пици - Общо: {totalPizzas} бр.
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(pizzaCounts).map(([pizzaType, times]) => {
              const filledTimes = Object.entries(times).filter(([_, count]) => count)
              if (filledTimes.length === 0) return null
              
              return (
                <div key={pizzaType} style={{
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px' }}>🍕 {pizzaType}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {filledTimes.map(([time, count]) => (
                      <span key={time} style={{
                        padding: '4px 8px',
                        backgroundColor: '#dbeafe',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {time}: {count} бр. 
                        {temperatures[pizzaType]?.[time] && ` (${temperatures[pizzaType][time]}°C)`}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // Производствен лист (дюнер, чикън, кюфте)
    if (name.includes('Производствен')) {
      const productions = data.productions || []
      return (
        <div>
          <h4 style={{ margin: '0 0 15px 0', color: '#1a5d33' }}>Производствени записи</h4>
          {productions.length === 0 ? (
            <p style={{ color: '#6b7280' }}>Няма записи</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {productions.map((prod, idx) => (
                <div key={idx} style={{
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  borderLeft: '4px solid #1a5d33'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
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
        </div>
      )
    }

    // Работна карта за хигиенизиране
    if (name.includes('хигиенизиране')) {
      const zones = data.zones || []
      const completionData = data.completionData || {}
      const completedCount = Object.values(completionData).filter(v => v === true).length
      const totalCount = Object.keys(completionData).length
      
      return (
        <div>
          <h4 style={{ margin: '0 0 15px 0', color: '#1a5d33' }}>
            Хигиенизиране - {completedCount}/{totalCount} изпълнени
          </h4>
          <div style={{
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: '#f0fdf4',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                flex: 1,
                height: '10px',
                backgroundColor: '#e5e7eb',
                borderRadius: '5px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                  height: '100%',
                  backgroundColor: '#059669'
                }} />
              </div>
              <span style={{ fontWeight: '600', color: '#059669' }}>
                {totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>
          {data.manager && (
            <p style={{ color: '#6b7280', marginBottom: '10px' }}>👤 Мениджър: {data.manager}</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {zones.map((zone, idx) => (
              <div key={idx} style={{
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>{zone.name}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {zone.areas?.map((area, aIdx) => (
                    <span key={aIdx} style={{
                      padding: '4px 8px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {area.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    // Default - show raw JSON
    return (
      <div>
        <h4 style={{ margin: '0 0 15px 0', color: '#1a5d33' }}>Данни</h4>
        <pre style={{
          backgroundColor: '#f9fafb',
          padding: '15px',
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '12px',
          maxHeight: '400px'
        }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    )
  }

  // RENDER: Overview - all restaurants
  const renderOverview = () => {
    const totalExpected = overviewStats.reduce((sum, s) => sum + s.expected, 0)
    const totalCompleted = overviewStats.reduce((sum, s) => sum + s.completed, 0)
    const totalPercentage = totalExpected > 0 ? (totalCompleted / totalExpected) * 100 : 0

    return (
      <div>
        {/* Stats summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#1a5d33' }}>
              {totalPercentage.toFixed(0)}%
            </div>
            <div style={{ color: '#6b7280', fontSize: '13px' }}>Общо изпълнение</div>
            <div style={{
              marginTop: '8px',
              height: '6px',
              backgroundColor: '#e5e7eb',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${totalPercentage}%`,
                height: '100%',
                backgroundColor: totalPercentage >= 80 ? '#059669' : totalPercentage >= 50 ? '#f59e0b' : '#dc2626'
              }} />
            </div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669' }}>
              {totalCompleted}
            </div>
            <div style={{ color: '#6b7280', fontSize: '13px' }}>Попълнени</div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#dc2626' }}>
              {totalExpected - totalCompleted}
            </div>
            <div style={{ color: '#6b7280', fontSize: '13px' }}>Липсващи</div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>
              {overviewStats.filter(s => s.expected > 0).length}
            </div>
            <div style={{ color: '#6b7280', fontSize: '13px' }}>Активни ресторанта</div>
          </div>
        </div>

        {/* Restaurant list */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#1a5d33' }}>
            🏪 Ресторанти - {formatDate(selectedDate)}
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {overviewStats.filter(r => r.expected > 0).map(restaurant => {
              const statusColor = restaurant.percentage >= 80 ? '#059669' : 
                                  restaurant.percentage >= 50 ? '#f59e0b' : '#dc2626'
              
              return (
                <div
                  key={restaurant.id}
                  onClick={() => {
                    setSelectedRestaurant(restaurant.id)
                    loadRestaurantSubmissions()
                  }}
                  style={{
                    padding: '16px',
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: `2px solid ${restaurant.percentage === 100 ? '#86efac' : restaurant.percentage > 0 ? '#fde68a' : '#fecaca'}`,
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: '600', 
                      fontSize: '16px', 
                      color: '#1f2937',
                      marginBottom: '8px'
                    }}>
                      {restaurant.name}
                    </div>
                    
                    {/* Progress bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        flex: 1,
                        maxWidth: '200px',
                        height: '8px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${restaurant.percentage}%`,
                          height: '100%',
                          backgroundColor: statusColor,
                          transition: 'width 0.3s'
                        }} />
                      </div>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '700',
                        color: statusColor,
                        minWidth: '45px'
                      }}>
                        {restaurant.completed}/{restaurant.expected}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
                      {restaurant.percentage === 100 ? (
                        <span style={{ color: '#059669' }}>✅ Всички чеклисти попълнени</span>
                      ) : restaurant.completed > 0 ? (
                        <span style={{ color: '#f59e0b' }}>⏳ Липсват още {restaurant.missing} чеклиста</span>
                      ) : (
                        <span style={{ color: '#dc2626' }}>❌ Няма попълнени чеклисти</span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{
                    padding: '10px 16px',
                    backgroundColor: statusColor,
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    marginLeft: '15px'
                  }}>
                    {restaurant.percentage.toFixed(0)}%
                  </div>
                </div>
              )
            })}
            
            {/* Show restaurants without assignments */}
            {overviewStats.filter(r => r.expected === 0).length > 0 && (
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: '#f3f4f6', 
                borderRadius: '8px' 
              }}>
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
                  ⚠️ Ресторанти без назначени чеклисти:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {overviewStats.filter(r => r.expected === 0).map(r => (
                    <span key={r.id} style={{
                      padding: '4px 10px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {r.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // RENDER: Restaurant detail - list of checklists
  const renderRestaurantView = () => {
    const restaurant = restaurants.find(r => r.id === selectedRestaurant)
    const restaurantStats = overviewStats.find(s => s.id === selectedRestaurant)
    
    // Group submissions by checklist name
    const grouped = submissions.reduce((acc, sub) => {
      const name = sub.checklist_templates?.name || 'Неизвестен'
      if (!acc[name]) acc[name] = []
      acc[name].push(sub)
      return acc
    }, {})

    // Get completed template names
    const completedNames = [...new Set(submissions.map(s => s.checklist_templates?.name).filter(Boolean))]
    
    // Calculate missing (we'll use the templates list)
    const allTemplateNames = templates.map(t => t.name)
    const missingNames = allTemplateNames.filter(name => !completedNames.includes(name))

    // Safe values for stats
    const completed = restaurantStats?.completed || completedNames.length
    const expected = restaurantStats?.expected || templates.length
    const percentage = expected > 0 ? (completed / expected) * 100 : 0

    return (
      <div>
        <button
          onClick={() => {
            setView('overview')
            setSelectedRestaurant('')
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            marginBottom: '20px'
          }}
        >
          ← Назад към всички ресторанти
        </button>

        {/* Restaurant header with progress */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '25px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ margin: '0 0 5px 0', color: '#1a5d33' }}>
                🏪 {restaurant?.name}
              </h2>
              <p style={{ margin: 0, color: '#6b7280' }}>
                {formatDate(selectedDate)}
              </p>
            </div>
            
            <div style={{
              padding: '15px 25px',
              backgroundColor: percentage === 100 ? '#f0fdf4' : 
                               percentage > 0 ? '#fef3c7' : '#fef2f2',
              borderRadius: '10px',
              textAlign: 'center',
              border: `2px solid ${percentage === 100 ? '#86efac' : 
                                    percentage > 0 ? '#fde68a' : '#fecaca'}`
            }}>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: '700',
                color: percentage === 100 ? '#059669' : 
                       percentage > 0 ? '#f59e0b' : '#dc2626'
              }}>
                {completed}/{expected}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>чеклиста попълнени</div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>Прогрес</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                {percentage.toFixed(0)}%
              </span>
            </div>
            <div style={{
              height: '10px',
              backgroundColor: '#e5e7eb',
              borderRadius: '5px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${percentage}%`,
                height: '100%',
                backgroundColor: percentage === 100 ? '#059669' : 
                                 percentage >= 50 ? '#f59e0b' : '#dc2626',
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        </div>

        {/* Missing checklists */}
        {missingNames.length > 0 && (
          <div style={{
            backgroundColor: '#fef2f2',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            border: '2px solid #fecaca'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#991b1b' }}>
              ❌ Липсващи чеклисти ({missingNames.length})
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {missingNames.map((name, idx) => (
                <span key={idx} style={{
                  padding: '8px 14px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#dc2626',
                  border: '1px solid #fecaca'
                }}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Completed checklists */}
        {submissions.length === 0 ? (
          <div style={{
            backgroundColor: '#fef2f2',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            border: '2px solid #fecaca'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#991b1b' }}>Няма попълнени чеклисти</h3>
            <p style={{ margin: 0, color: '#dc2626' }}>
              За {formatDate(selectedDate)} няма записи от този ресторант
            </p>
          </div>
        ) : (
          <div>
            <h3 style={{ 
              margin: '0 0 15px 0', 
              color: '#059669',
              backgroundColor: 'white',
              padding: '15px 20px',
              borderRadius: '10px'
            }}>
              ✅ Попълнени чеклисти ({completedNames.length})
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {Object.entries(grouped).map(([checklistName, subs]) => (
                <div
                  key={checklistName}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{
                    padding: '16px 20px',
                    backgroundColor: '#1a5d33',
                    color: 'white'
                  }}>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>
                      📋 {checklistName}
                    </div>
                    <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '4px' }}>
                      {subs.length} {subs.length === 1 ? 'запис' : 'записа'}
                    </div>
                  </div>
                  
                  <div style={{ padding: '15px' }}>
                    {subs.map((sub, idx) => (
                      <div
                        key={sub.id}
                        onClick={() => loadSubmissionDetail(sub)}
                        style={{
                          padding: '12px',
                          backgroundColor: idx % 2 === 0 ? '#f9fafb' : 'white',
                          borderRadius: '8px',
                          marginBottom: idx < subs.length - 1 ? '8px' : 0,
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#f9fafb' : 'white'}
                      >
                        <div>
                          <div style={{ fontWeight: '500', color: '#1f2937' }}>
                            🕐 {formatTime(sub.submitted_at)}
                          </div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                            👤 {sub.profiles?.full_name || 'Неизвестен'}
                          </div>
                        </div>
                        <button style={{
                          padding: '6px 14px',
                          backgroundColor: '#1a5d33',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '13px'
                        }}>
                          Преглед →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // RENDER: Submission detail
  const renderDetailView = () => {
    if (!selectedSubmission) return null

    const restaurant = restaurants.find(r => r.id === selectedRestaurant)

    return (
      <div>
        <button
          onClick={() => {
            setView('restaurant')
            setSelectedSubmission(null)
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            marginBottom: '20px'
          }}
        >
          ← Назад към чеклистите
        </button>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '25px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 15px 0', color: '#1a5d33' }}>
            📋 {selectedSubmission.checklist_templates?.name}
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '15px'
          }}>
            <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Ресторант</div>
              <div style={{ fontWeight: '600', marginTop: '4px' }}>{restaurant?.name}</div>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Дата</div>
              <div style={{ fontWeight: '600', marginTop: '4px' }}>
                {new Date(selectedSubmission.submission_date).toLocaleDateString('bg-BG')}
              </div>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Час</div>
              <div style={{ fontWeight: '600', marginTop: '4px' }}>
                {formatTime(selectedSubmission.submitted_at)}
              </div>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Попълнил</div>
              <div style={{ fontWeight: '600', marginTop: '4px' }}>
                {selectedSubmission.profiles?.full_name || 'Неизвестен'}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {renderChecklistData(selectedSubmission)}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a5d33 0%, #2d8f54 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px 25px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div>
              <h1 style={{ margin: '0 0 5px 0', color: '#1a5d33', fontSize: '24px' }}>
                📊 Отчети
              </h1>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                Преглед на попълнени чеклисти по ресторанти
              </p>
            </div>
            
            {/* Date selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={setPrevDay} style={{
                padding: '8px 12px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}>←</button>
              
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              
              <button onClick={setNextDay} style={{
                padding: '8px 12px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}>→</button>
              
              <button onClick={setToday} style={{
                padding: '8px 14px',
                backgroundColor: selectedDate === new Date().toISOString().split('T')[0] ? '#1a5d33' : 'white',
                color: selectedDate === new Date().toISOString().split('T')[0] ? 'white' : '#1a5d33',
                border: '2px solid #1a5d33',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px'
              }}>Днес</button>
              
              <button onClick={setYesterday} style={{
                padding: '8px 14px',
                backgroundColor: 'white',
                color: '#6b7280',
                border: '2px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px'
              }}>Вчера</button>
            </div>

            <button
              onClick={onBack}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              ← Назад
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '60px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
            <div style={{ color: '#6b7280' }}>Зареждане...</div>
          </div>
        ) : (
          <>
            {view === 'overview' && renderOverview()}
            {view === 'restaurant' && renderRestaurantView()}
            {view === 'detail' && renderDetailView()}
          </>
        )}
      </div>
    </div>
  )
}

export default ReportsAdminPanel