// src/components/ReportsAdminPanel.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigationHistory } from '../hooks/useNavigationHistory'

const ReportsAdminPanel = ({ onBack }) => {
  useNavigationHistory(onBack)
  
  const [loading, setLoading] = useState(true)
  const [restaurants, setRestaurants] = useState([])
  const [departments, setDepartments] = useState([])
  const [templates, setTemplates] = useState([])
  
  // View state
  const [currentView, setCurrentView] = useState('overview') // 'overview', 'restaurant-detail', 'submission-detail'
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  
  // Filters
  const [filters, setFilters] = useState({
    restaurantId: '',
    departmentId: '',
    templateId: '',
    startDate: new Date().toISOString().split('T')[0], // Днес по подразбиране
    endDate: new Date().toISOString().split('T')[0]
  })
  
  const [dateRangeMode, setDateRangeMode] = useState('single') // 'single' или 'range'
  
  // Aggregated stats
  const [overviewStats, setOverviewStats] = useState([])
  const [restaurantDetails, setRestaurantDetails] = useState(null)
  const [submissionDetail, setSubmissionDetail] = useState(null)
  const [inProgressSubmissions, setInProgressSubmissions] = useState([]) // За активни попълвания
  const [lastRefresh, setLastRefresh] = useState(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (restaurants.length > 0) {
      loadOverviewStats()
    }
  }, [filters, restaurants])

  // Auto-refresh за днешна дата на всеки 30 секунди
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    if (filters.startDate === today && filters.endDate === today) {
      const interval = setInterval(() => {
        loadInProgressSubmissions()
      }, 30000) // 30 секунди

      return () => clearInterval(interval)
    }
  }, [filters])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const { data: restaurantsData, error: restError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('active', true)
        .order('name')
      
      if (restError) throw restError
      setRestaurants(restaurantsData || [])

      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('*')
        .eq('active', true)
        .order('name')
      
      if (deptError) throw deptError
      setDepartments(deptData || [])

      const { data: templatesData, error: tempError } = await supabase
        .from('checklist_templates')
        .select('id, name, description')
        .eq('active', true)
        .order('name')
      
      if (tempError) throw tempError
      setTemplates(templatesData || [])

    } catch (error) {
      console.error('Error loading initial data:', error)
      alert('Грешка при зареждане на данни')
    } finally {
      setLoading(false)
    }
  }

  const loadOverviewStats = async () => {
    setLoading(true)
    try {
      // Get all expected checklists for the period
      const expectedChecklists = await calculateExpectedChecklists()
      
      // Get actual submissions
      let query = supabase
        .from('checklist_submissions')
        .select(`
          id,
          submission_date,
          restaurant_id,
          department_id,
          template_id,
          restaurants(name),
          checklist_templates(name)
        `)
        .gte('submission_date', filters.startDate)
        .lte('submission_date', filters.endDate)

      if (filters.restaurantId) {
        query = query.eq('restaurant_id', filters.restaurantId)
      }

      const { data: submissions, error } = await query
      if (error) throw error

      // За днешна дата - провери дали има активни (незавършени) попълвания
      const today = new Date().toISOString().split('T')[0]
      if (filters.startDate === today && filters.endDate === today) {
        await loadInProgressSubmissions()
      } else {
        setInProgressSubmissions([])
      }

      // Aggregate by restaurant
      const stats = []
      const restaurantIds = filters.restaurantId 
        ? [filters.restaurantId] 
        : [...new Set(expectedChecklists.map(e => e.restaurantId))]

      for (const restId of restaurantIds) {
        const restaurant = restaurants.find(r => r.id === restId)
        if (!restaurant) continue

        const expected = expectedChecklists.filter(e => e.restaurantId === restId)
        const completed = submissions?.filter(s => s.restaurant_id === restId) || []
        
        // Брои и активните (в процес на попълване) като "в прогрес"
        const inProgress = inProgressSubmissions.filter(ip => ip.restaurant_id === restId).length
        
        const completionRate = expected.length > 0 
          ? (completed.length / expected.length) * 100 
          : 0

        stats.push({
          restaurantId: restId,
          restaurantName: restaurant.name,
          expected: expected.length,
          completed: completed.length,
          inProgress: inProgress,
          missing: expected.length - completed.length - inProgress,
          completionRate: completionRate,
          status: getStatusFromRate(completionRate)
        })
      }

      // Sort by completion rate (lowest first to highlight problems)
      stats.sort((a, b) => a.completionRate - b.completionRate)
      setOverviewStats(stats)

    } catch (error) {
      console.error('Error loading overview stats:', error)
      alert('Грешка при зареждане на статистика')
    } finally {
      setLoading(false)
    }
  }

  const loadInProgressSubmissions = async () => {
    try {
      // Търси submissions които са създадени днес но все още не са финализирани
      // или са частично попълнени (можеш да добавиш is_draft колона в DB)
      const today = new Date().toISOString().split('T')[0]
      
      // За сега ще проверяваме submissions създадени в последния 1 час
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      
      let query = supabase
        .from('checklist_submissions')
        .select(`
          id,
          submission_date,
          restaurant_id,
          department_id,
          template_id,
          submitted_at,
          data,
          restaurants(name),
          departments(name),
          checklist_templates(name, config),
          profiles(full_name)
        `)
        .eq('submission_date', today)
        .gte('submitted_at', oneHourAgo)

      if (filters.restaurantId) {
        query = query.eq('restaurant_id', filters.restaurantId)
      }

      const { data, error } = await query
      if (error) throw error

      setInProgressSubmissions(data || [])
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error loading in-progress submissions:', error)
    }
  }

  const calculateExpectedChecklists = async () => {
    try {
      let assignQuery = supabase
        .from('restaurant_templates')
        .select(`
          *,
          restaurants(id, name),
          checklist_templates(
            id, 
            name,
            template_departments(department_name)
          )
        `)
        .eq('enabled', true)

      if (filters.restaurantId) {
        assignQuery = assignQuery.eq('restaurant_id', filters.restaurantId)
      }

      const { data: assignments, error } = await assignQuery
      if (error) throw error

      const expected = []
      const startDate = new Date(filters.startDate)
      const endDate = new Date(filters.endDate)
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        
        for (const assignment of assignments || []) {
          const template = assignment.checklist_templates
          const restaurant = assignment.restaurants
          const templateDepts = template.template_departments || []
          
          for (const td of templateDepts) {
            const dept = departments.find(dept => 
              dept.name === td.department_name && 
              dept.restaurant_id === restaurant.id
            )
            
            if (!dept) continue
            
            expected.push({
              date: dateStr,
              restaurantId: restaurant.id,
              restaurantName: restaurant.name,
              departmentId: dept.id,
              departmentName: dept.name,
              templateId: template.id,
              templateName: template.name
            })
          }
        }
      }

      return expected
    } catch (error) {
      console.error('Error calculating expected checklists:', error)
      return []
    }
  }

  const loadRestaurantDetails = async (restaurantId) => {
    setLoading(true)
    try {
      // Get expected checklists for this restaurant
      const allExpected = await calculateExpectedChecklists()
      const expected = allExpected.filter(e => e.restaurantId === restaurantId)
      
      // Get actual submissions
      const { data: submissions, error } = await supabase
        .from('checklist_submissions')
        .select(`
          id,
          submission_date,
          department_id,
          template_id,
          submitted_at,
          checklist_templates(name),
          departments(name),
          profiles(full_name)
        `)
        .eq('restaurant_id', restaurantId)
        .gte('submission_date', filters.startDate)
        .lte('submission_date', filters.endDate)
        .order('submission_date', { ascending: false })

      if (error) throw error

      // Group by template
      const templateStats = {}
      
      for (const exp of expected) {
        const key = `${exp.templateId}-${exp.departmentName}`
        if (!templateStats[key]) {
          templateStats[key] = {
            templateId: exp.templateId,
            templateName: exp.templateName,
            departmentName: exp.departmentName,
            expected: 0,
            completed: 0,
            missing: [],
            submissions: []
          }
        }
        templateStats[key].expected++
        
        const hasSubmission = submissions?.find(s => 
          s.submission_date === exp.date &&
          s.template_id === exp.templateId &&
          s.department_id === exp.departmentId
        )
        
        if (hasSubmission) {
          templateStats[key].completed++
          templateStats[key].submissions.push(hasSubmission)
        } else {
          templateStats[key].missing.push(exp.date)
        }
      }

      const details = Object.values(templateStats).map(stat => ({
        ...stat,
        completionRate: stat.expected > 0 ? (stat.completed / stat.expected) * 100 : 0,
        status: getStatusFromRate(stat.expected > 0 ? (stat.completed / stat.expected) * 100 : 0)
      }))

      details.sort((a, b) => a.completionRate - b.completionRate)

      setRestaurantDetails({
        restaurantId,
        restaurantName: restaurants.find(r => r.id === restaurantId)?.name,
        templates: details
      })
      setCurrentView('restaurant-detail')

    } catch (error) {
      console.error('Error loading restaurant details:', error)
      alert('Грешка при зареждане на детайли')
    } finally {
      setLoading(false)
    }
  }

  const loadSubmissionDetail = async (submissionId) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('checklist_submissions')
        .select(`
          *,
          checklist_templates(id, name, config),
          departments(name),
          restaurants(name),
          profiles(full_name, email)
        `)
        .eq('id', submissionId)
        .single()

      if (error) throw error

      setSubmissionDetail(data)
      setCurrentView('submission-detail')

    } catch (error) {
      console.error('Error loading submission detail:', error)
      alert('Грешка при зареждане на детайли на попълване')
    } finally {
      setLoading(false)
    }
  }

  const getStatusFromRate = (rate) => {
    if (rate >= 95) return 'excellent'
    if (rate >= 80) return 'good'
    if (rate >= 60) return 'warning'
    return 'critical'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return '#059669'
      case 'good': return '#10b981'
      case 'warning': return '#f59e0b'
      case 'critical': return '#dc2626'
      default: return '#6b7280'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return '✅'
      case 'good': return '🟢'
      case 'warning': return '⚠️'
      case 'critical': return '🔴'
      default: return '⚪'
    }
  }

  // Quick date range setters
  const setToday = () => {
    const today = new Date().toISOString().split('T')[0]
    setFilters({ ...filters, startDate: today, endDate: today })
    setDateRangeMode('single')
  }

  const setYesterday = () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    setFilters({ ...filters, startDate: yesterday, endDate: yesterday })
    setDateRangeMode('single')
  }

  const setThisWeek = () => {
    const today = new Date()
    const dayOfWeek = today.getDay() || 7 // Неделя = 7
    const monday = new Date(today)
    monday.setDate(today.getDate() - dayOfWeek + 1)
    
    setFilters({
      ...filters,
      startDate: monday.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    })
    setDateRangeMode('range')
  }

  const setLastWeek = () => {
    const today = new Date()
    const lastWeekEnd = new Date(today)
    lastWeekEnd.setDate(today.getDate() - today.getDay())
    const lastWeekStart = new Date(lastWeekEnd)
    lastWeekStart.setDate(lastWeekEnd.getDate() - 6)
    
    setFilters({
      ...filters,
      startDate: lastWeekStart.toISOString().split('T')[0],
      endDate: lastWeekEnd.toISOString().split('T')[0]
    })
    setDateRangeMode('range')
  }

  const setThisMonth = () => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    
    setFilters({
      ...filters,
      startDate: firstDay.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    })
    setDateRangeMode('range')
  }

  const setCustomRange = () => {
    setDateRangeMode('range')
  }

  const handleExportOverview = () => {
    const BOM = '\uFEFF'
    const headers = 'Ресторант,Очаквани,Попълнени,Липсващи,Процент,Статус\n'
    const rows = overviewStats.map(stat => 
      `${stat.restaurantName},${stat.expected},${stat.completed},${stat.missing},${stat.completionRate.toFixed(1)}%,${stat.status}`
    ).join('\n')

    const blob = new Blob([BOM + headers + rows], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `overview_${filters.startDate}_${filters.endDate}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const renderFilters = () => {
    const getDaysDiff = () => {
      const start = new Date(filters.startDate)
      const end = new Date(filters.endDate)
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    }

    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#1a5d33' }}>🔍 Филтри</h3>
        
        {/* Quick date buttons */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
            Бърз избор на период:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button
              onClick={setToday}
              style={{
                padding: '8px 16px',
                backgroundColor: dateRangeMode === 'single' && filters.startDate === new Date().toISOString().split('T')[0] ? '#1a5d33' : 'white',
                color: dateRangeMode === 'single' && filters.startDate === new Date().toISOString().split('T')[0] ? 'white' : '#1f2937',
                border: '2px solid #1a5d33',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              📅 Днес
            </button>
            <button
              onClick={setYesterday}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                color: '#1f2937',
                border: '2px solid #6b7280',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              📆 Вчера
            </button>
            <button
              onClick={setThisWeek}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                color: '#1f2937',
                border: '2px solid #6b7280',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              📊 Тази седмица
            </button>
            <button
              onClick={setLastWeek}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                color: '#1f2937',
                border: '2px solid #6b7280',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              📉 Миналата седмица
            </button>
            <button
              onClick={setThisMonth}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                color: '#1f2937',
                border: '2px solid #6b7280',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              📈 Този месец
            </button>
            <button
              onClick={setCustomRange}
              style={{
                padding: '8px 16px',
                backgroundColor: dateRangeMode === 'range' ? '#1a5d33' : 'white',
                color: dateRangeMode === 'range' ? 'white' : '#1f2937',
                border: '2px solid #1a5d33',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              🗓️ Произволен период
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: dateRangeMode === 'single' ? 'repeat(auto-fit, minmax(250px, 1fr))' : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
              Ресторант
            </label>
            <select
              value={filters.restaurantId}
              onChange={(e) => setFilters({ ...filters, restaurantId: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">Всички</option>
              {restaurants.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {dateRangeMode === 'single' ? (
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                Дата
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value, endDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                  От дата
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                  До дата
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Period info */}
        <div style={{
          marginTop: '15px',
          padding: '12px',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #86efac'
        }}>
          <div style={{ fontSize: '13px', color: '#065f46', fontWeight: '600' }}>
            📊 Избран период: {getDaysDiff() === 1 ? '1 ден' : `${getDaysDiff()} дни`}
            {filters.startDate === filters.endDate ? (
              <span style={{ marginLeft: '10px', color: '#059669' }}>
                ({new Date(filters.startDate).toLocaleDateString('bg-BG')})
              </span>
            ) : (
              <span style={{ marginLeft: '10px', color: '#059669' }}>
                ({new Date(filters.startDate).toLocaleDateString('bg-BG')} - {new Date(filters.endDate).toLocaleDateString('bg-BG')})
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderOverview = () => (
    <div>
      {/* Active submissions banner (само за днес) */}
      {filters.startDate === new Date().toISOString().split('T')[0] && 
       filters.endDate === new Date().toISOString().split('T')[0] && 
       inProgressSubmissions.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #f59e0b'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, color: '#d97706' }}>
              ⏳ Активни попълвания ({inProgressSubmissions.length})
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {lastRefresh && (
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  Обновено: {lastRefresh.toLocaleTimeString('bg-BG')}
                </span>
              )}
              <button
                onClick={() => loadInProgressSubmissions()}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                🔄 Обнови
              </button>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px', marginTop: '5px' }}>
            Чек листи, които са отворени и се попълват в момента или наскоро (последен 1 час)
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '15px'
          }}>
            {inProgressSubmissions.map((sub) => {
              // Calculate completion percentage
              const config = sub.checklist_templates?.config
              const data = sub.data
              let totalFields = 0
              let filledFields = 0

              if (config?.type === 'table') {
                totalFields = (data?.rows?.length || 0) * (config.columns?.length || 0)
                data?.rows?.forEach(row => {
                  config.columns?.forEach(col => {
                    if (row[col.key] && row[col.key] !== '') filledFields++
                  })
                })
              } else if (config?.type === 'form') {
                totalFields = config.fields?.length || 0
                config.fields?.forEach(field => {
                  if (data?.[field.key] && data[field.key] !== '') filledFields++
                })
              }

              const completionRate = totalFields > 0 ? (filledFields / totalFields) * 100 : 0

              return (
                <div
                  key={sub.id}
                  onClick={() => loadSubmissionDetail(sub.id)}
                  style={{
                    padding: '15px',
                    backgroundColor: '#fffbeb',
                    borderRadius: '8px',
                    border: '2px solid #fcd34d',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fef3c7'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fffbeb'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937', marginBottom: '5px' }}>
                      {sub.checklist_templates?.name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      {sub.restaurants?.name} • {sub.departments?.name}
                    </div>
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <span style={{ fontSize: '12px', color: '#78716c' }}>Попълване:</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#d97706' }}>
                        {completionRate.toFixed(0)}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: '#fef3c7',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${completionRate}%`,
                        height: '100%',
                        backgroundColor: '#f59e0b',
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: '#78716c' }}>
                    👤 {sub.profiles?.full_name} • {new Date(sub.submitted_at).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  <button
                    style={{
                      marginTop: '10px',
                      width: '100%',
                      padding: '8px',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    Виж детайли →
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Main overview table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0, color: '#1a5d33' }}>
          📊 Обобщена статистика по ресторанти
        </h3>
        <button
          onClick={handleExportOverview}
          style={{
            padding: '10px 20px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          📥 Export CSV
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0fdf4', borderBottom: '2px solid #86efac' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#065f46' }}>
                Ресторант
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#065f46' }}>
                Очаквани
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#065f46' }}>
                Попълнени
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#065f46' }}>
                В процес
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#065f46' }}>
                Липсващи
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#065f46' }}>
                Процент
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#065f46' }}>
                Статус
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#065f46' }}>
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {overviewStats.map((stat, idx) => (
              <tr
                key={stat.restaurantId}
                style={{
                  backgroundColor: idx % 2 === 0 ? '#f9fafb' : 'white',
                  borderBottom: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#f9fafb' : 'white'}
              >
                <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600' }}>
                  {stat.restaurantName}
                </td>
                <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>
                  {stat.expected}
                </td>
                <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#059669', fontWeight: '600' }}>
                  {stat.completed}
                </td>
                <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#f59e0b', fontWeight: '600' }}>
                  {stat.inProgress > 0 ? (
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: '#fef3c7',
                      color: '#d97706',
                      borderRadius: '8px',
                      fontSize: '13px'
                    }}>
                      ⏳ {stat.inProgress}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>
                  {stat.missing}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '8px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${stat.completionRate}%`,
                        height: '100%',
                        backgroundColor: getStatusColor(stat.status),
                        transition: 'width 0.3s'
                      }} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600', minWidth: '50px' }}>
                      {stat.completionRate.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <span style={{
                    padding: '4px 12px',
                    backgroundColor: getStatusColor(stat.status) + '20',
                    color: getStatusColor(stat.status),
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {getStatusIcon(stat.status)} {stat.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button
                    onClick={() => loadRestaurantDetails(stat.restaurantId)}
                    style={{
                      padding: '6px 16px',
                      backgroundColor: '#1a5d33',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    Детайли →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {overviewStats.length === 0 && !loading && (
        <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '20px' }}>
          Няма данни за избрания период
        </p>
      )}
      </div>
    </div>
  )

  const renderRestaurantDetail = () => {
    if (!restaurantDetails) return null

    return (
      <div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => {
              setCurrentView('overview')
              setRestaurantDetails(null)
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '15px'
            }}
          >
            ← Назад към обобщение
          </button>

          <h2 style={{ margin: 0, color: '#1a5d33' }}>
            🏪 {restaurantDetails.restaurantName}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '5px' }}>
            Детайлно разбиване по чек листи
          </p>
        </div>

        {restaurantDetails.templates.map((template, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '15px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              borderLeft: `4px solid ${getStatusColor(template.status)}`
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '15px'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#1f2937' }}>
                  {template.templateName}
                </h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                  Отдел: <strong>{template.departmentName}</strong>
                </p>
              </div>
              <span style={{
                padding: '6px 16px',
                backgroundColor: getStatusColor(template.status) + '20',
                color: getStatusColor(template.status),
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {getStatusIcon(template.status)} {template.completionRate.toFixed(1)}%
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '15px',
              marginBottom: '15px'
            }}>
              <div style={{
                padding: '12px',
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>
                  {template.completed}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Попълнени</div>
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>
                  {template.expected - template.completed}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Липсващи</div>
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                  {template.expected}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Очаквани</div>
              </div>
            </div>

            {template.missing.length > 0 && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                marginBottom: '15px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#991b1b', marginBottom: '8px' }}>
                  ⚠️ Липсващи дати ({template.missing.length}):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {template.missing.slice(0, 10).map((date, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: 'white',
                        color: '#dc2626',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        border: '1px solid #fecaca'
                      }}
                    >
                      {new Date(date).toLocaleDateString('bg-BG')}
                    </span>
                  ))}
                  {template.missing.length > 10 && (
                    <span style={{ fontSize: '12px', color: '#6b7280', padding: '4px 10px' }}>
                      +{template.missing.length - 10} още...
                    </span>
                  )}
                </div>
              </div>
            )}

            {template.submissions.length > 0 && (
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#065f46', marginBottom: '10px' }}>
                  ✅ Последни попълвания:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {template.submissions.slice(0, 5).map((sub, i) => (
                    <div
                      key={i}
                      onClick={() => loadSubmissionDetail(sub.id)}
                      style={{
                        padding: '10px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        border: '1px solid #e5e7eb'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600' }}>
                          {new Date(sub.submission_date).toLocaleDateString('bg-BG')}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {sub.profiles?.full_name || 'N/A'} • {new Date(sub.submitted_at).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <button
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#1a5d33',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        Преглед →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderSubmissionDetail = () => {
    if (!submissionDetail) return null

    const config = submissionDetail.checklist_templates?.config
    const data = submissionDetail.data

    return (
      <div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => {
              setCurrentView('restaurant-detail')
              setSubmissionDetail(null)
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '15px'
            }}
          >
            ← Назад към детайли на ресторант
          </button>

          <h2 style={{ margin: '0 0 10px 0', color: '#1a5d33' }}>
            📋 {submissionDetail.checklist_templates?.name}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginTop: '15px'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Ресторант</div>
              <div style={{ fontSize: '16px', fontWeight: '600' }}>
                {submissionDetail.restaurants?.name}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Отдел</div>
              <div style={{ fontSize: '16px', fontWeight: '600' }}>
                {submissionDetail.departments?.name}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Дата</div>
              <div style={{ fontSize: '16px', fontWeight: '600' }}>
                {new Date(submissionDetail.submission_date).toLocaleDateString('bg-BG')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Попълнил</div>
              <div style={{ fontSize: '16px', fontWeight: '600' }}>
                {submissionDetail.profiles?.full_name}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Час на попълване</div>
              <div style={{ fontSize: '16px', fontWeight: '600' }}>
                {new Date(submissionDetail.submitted_at).toLocaleTimeString('bg-BG')}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1a5d33' }}>
            📊 Попълнени данни
          </h3>

          {config?.type === 'table' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0fdf4' }}>
                    {config.columns?.map((col, idx) => (
                      <th
                        key={idx}
                        style={{
                          padding: '12px',
                          textAlign: 'left',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#065f46',
                          borderBottom: '2px solid #86efac'
                        }}
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data?.rows?.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      style={{
                        backgroundColor: rowIdx % 2 === 0 ? 'white' : '#f9fafb',
                        borderBottom: '1px solid #e5e7eb'
                      }}
                    >
                      {config.columns?.map((col, colIdx) => {
                        const cellData = row[col.key]
                        const isEmpty = !cellData || cellData === ''
                        
                        return (
                          <td
                            key={colIdx}
                            style={{
                              padding: '12px',
                              fontSize: '14px',
                              color: isEmpty ? '#dc2626' : '#1f2937',
                              backgroundColor: isEmpty ? '#fef2f2' : 'transparent'
                            }}
                          >
                            {isEmpty ? '❌ Не е попълнено' : cellData}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {config?.type === 'form' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {config.fields?.map((field, idx) => {
                const value = data?.[field.key]
                const isEmpty = !value || value === ''
                
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '15px',
                      backgroundColor: isEmpty ? '#fef2f2' : '#f9fafb',
                      borderRadius: '8px',
                      border: `1px solid ${isEmpty ? '#fecaca' : '#e5e7eb'}`
                    }}
                  >
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginBottom: '5px',
                      fontWeight: '600'
                    }}>
                      {field.label}
                    </div>
                    <div style={{
                      fontSize: '16px',
                      color: isEmpty ? '#dc2626' : '#1f2937',
                      fontWeight: '500'
                    }}>
                      {isEmpty ? '❌ Не е попълнено' : value}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Calculate completion percentage */}
          {(() => {
            let totalFields = 0
            let filledFields = 0

            if (config?.type === 'table') {
              totalFields = (data?.rows?.length || 0) * (config.columns?.length || 0)
              data?.rows?.forEach(row => {
                config.columns?.forEach(col => {
                  if (row[col.key] && row[col.key] !== '') filledFields++
                })
              })
            } else if (config?.type === 'form') {
              totalFields = config.fields?.length || 0
              config.fields?.forEach(field => {
                if (data?.[field.key] && data[field.key] !== '') filledFields++
              })
            }

            const completionRate = totalFields > 0 ? (filledFields / totalFields) * 100 : 0

            return (
              <div style={{
                marginTop: '25px',
                padding: '20px',
                backgroundColor: completionRate === 100 ? '#f0fdf4' : '#fef2f2',
                borderRadius: '8px',
                border: `2px solid ${completionRate === 100 ? '#86efac' : '#fecaca'}`
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                    Процент на попълване:
                  </span>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: completionRate === 100 ? '#059669' : '#dc2626'
                  }}>
                    {completionRate.toFixed(1)}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '12px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${completionRate}%`,
                    height: '100%',
                    backgroundColor: completionRate === 100 ? '#059669' : '#dc2626',
                    transition: 'width 0.3s'
                  }} />
                </div>
                <div style={{
                  marginTop: '10px',
                  fontSize: '13px',
                  color: '#6b7280'
                }}>
                  {filledFields} от {totalFields} полета попълнени
                </div>
              </div>
            )
          })()}
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
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '25px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{
                margin: '0 0 5px 0',
                color: '#1a5d33',
                fontSize: '28px'
              }}>
                📊 Отчети и Анализи
              </h1>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                {currentView === 'overview' && 'Обобщена статистика по ресторанти'}
                {currentView === 'restaurant-detail' && 'Детайлно разбиване по чек листи'}
                {currentView === 'submission-detail' && 'Преглед на конкретно попълване'}
              </p>
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
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              ← Назад
            </button>
          </div>
        </div>

        {renderFilters()}

        {loading ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '18px', color: '#6b7280' }}>⏳ Зареждане...</div>
          </div>
        ) : (
          <>
            {currentView === 'overview' && renderOverview()}
            {currentView === 'restaurant-detail' && renderRestaurantDetail()}
            {currentView === 'submission-detail' && renderSubmissionDetail()}
          </>
        )}
      </div>
    </div>
  )
}

export default ReportsAdminPanel