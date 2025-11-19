// src/components/AllSubmissionsHistory.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ImprovedSubmissionDetail from './ImprovedSubmissionDetail'

const AllSubmissionsHistory = ({ restaurantId, onBack }) => {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    departmentId: '',
    templateId: '',
    searchTerm: ''
  })
  const [departments, setDepartments] = useState([])
  const [templates, setTemplates] = useState([])

  useEffect(() => {
    loadFiltersData()
    loadSubmissions()
  }, [restaurantId, filters])

  const loadFiltersData = async () => {
    try {
      // Load departments
      const { data: deptData } = await supabase
        .from('departments')
        .select('id, name')
        .eq('restaurant_id', restaurantId)
        .eq('active', true)
        .order('name')
      
      setDepartments(deptData || [])

      // Load templates
      const { data: templatesData } = await supabase
        .from('restaurant_templates')
        .select('checklist_templates(id, name)')
        .eq('restaurant_id', restaurantId)
        .eq('enabled', true)

      const uniqueTemplates = templatesData
        ?.map(rt => rt.checklist_templates)
        .filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i) || []
      
      setTemplates(uniqueTemplates)
    } catch (error) {
      console.error('Error loading filters:', error)
    }
  }

  const loadSubmissions = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('checklist_submissions')
        .select(`
          *,
          checklist_templates(id, name, description, config),
          departments(id, name),
          profiles(full_name, email)
        `)
        .eq('restaurant_id', restaurantId)
        .order('submission_date', { ascending: false })
        .order('submitted_at', { ascending: false })

      if (filters.startDate) {
        query = query.gte('submission_date', filters.startDate)
      }
      if (filters.endDate) {
        query = query.lte('submission_date', filters.endDate)
      }
      if (filters.departmentId) {
        query = query.eq('department_id', filters.departmentId)
      }
      if (filters.templateId) {
        query = query.eq('template_id', filters.templateId)
      }

      const { data, error } = await query

      if (error) throw error

      // Client-side search filter
      let filteredData = data || []
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        filteredData = filteredData.filter(sub => 
          sub.checklist_templates?.name?.toLowerCase().includes(searchLower) ||
          sub.departments?.name?.toLowerCase().includes(searchLower) ||
          sub.profiles?.full_name?.toLowerCase().includes(searchLower) ||
          JSON.stringify(sub.data).toLowerCase().includes(searchLower)
        )
      }

      setSubmissions(filteredData)
    } catch (error) {
      console.error('Error loading submissions:', error)
      alert('Грешка при зареждане на история')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('bg-BG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('bg-BG', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getSubmissionSummary = (submission) => {
    const data = submission.data || {}
    const rowCount = data.rows?.length || 0
    const headerFields = Object.keys(data.header || {}).length
    
    return `${rowCount} реда, ${headerFields} полета`
  }

  const exportToCSV = () => {
    const BOM = '\uFEFF'
    const headers = ['Дата', 'Час', 'Отдел', 'Чек лист', 'Попълнил', 'Брой редове']
    
    const csvData = [
      headers.join(','),
      ...submissions.map(sub => [
        sub.submission_date,
        formatTime(sub.submitted_at),
        sub.departments?.name || '',
        sub.checklist_templates?.name || '',
        sub.profiles?.full_name || sub.profiles?.email || '',
        sub.data?.rows?.length || 0
      ].map(field => `"${field}"`).join(','))
    ].join('\n')

    const blob = new Blob([BOM + csvData], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `история_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (selectedSubmission) {
    console.log('Selected submission:', selectedSubmission)
    console.log('Submission data:', selectedSubmission.data)
    console.log('Template config:', selectedSubmission.checklist_templates?.config)
    
    return (
      <ImprovedSubmissionDetail
        submission={selectedSubmission}
        onBack={() => setSelectedSubmission(null)}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '30px',
          marginBottom: '20px'
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
                📋 Пълна история на чек листи
              </h1>
              <p style={{ margin: 0, color: '#6b7280' }}>
                {submissions.length} записа от всички отдели
              </p>
            </div>
            
            <button
              onClick={exportToCSV}
              disabled={submissions.length === 0}
              style={{
                padding: '10px 20px',
                backgroundColor: submissions.length === 0 ? '#9ca3af' : '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: submissions.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              📥 Експорт CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '25px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#1a5d33' }}>🔍 Филтри:</h3>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                От дата:
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
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                До дата:
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

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Отдел:
              </label>
              <select
                value={filters.departmentId}
                onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">Всички</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Чек лист:
              </label>
              <select
                value={filters.templateId}
                onChange={(e) => setFilters({ ...filters, templateId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">Всички</option>
                {templates.map(tmpl => (
                  <option key={tmpl.id} value={tmpl.id}>{tmpl.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="🔎 Търсене в съдържанието..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={() => setFilters({
                startDate: '',
                endDate: '',
                departmentId: '',
                templateId: '',
                searchTerm: ''
              })}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              Изчисти
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#6b7280' }}>Зареждане...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📭</div>
            <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
              Няма намерени записи с текущите филтри
            </p>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(135deg, #1a5d33, #2d7a4f)',
                    color: 'white'
                  }}>
                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                      Дата
                    </th>
                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                      Час
                    </th>
                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                      Отдел
                    </th>
                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                      Чек лист
                    </th>
                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                      Попълнил
                    </th>
                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                      Съдържание
                    </th>
                    <th style={{ padding: '15px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission, idx) => (
                    <tr 
                      key={submission.id}
                      style={{
                        backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb',
                        borderBottom: '1px solid #e5e7eb',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'white' : '#f9fafb'}
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <td style={{ padding: '12px 15px', fontSize: '14px' }}>
                        {formatDate(submission.submission_date)}
                      </td>
                      <td style={{ padding: '12px 15px', fontSize: '14px', color: '#6b7280' }}>
                        {formatTime(submission.submitted_at)}
                      </td>
                      <td style={{ padding: '12px 15px', fontSize: '14px' }}>
                        <span style={{
                          padding: '4px 10px',
                          backgroundColor: '#e0f2fe',
                          color: '#0369a1',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}>
                          {submission.departments?.name || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 15px', fontSize: '14px', fontWeight: '600', color: '#1a5d33' }}>
                        {submission.checklist_templates?.name || '-'}
                      </td>
                      <td style={{ padding: '12px 15px', fontSize: '14px', color: '#6b7280' }}>
                        {submission.profiles?.full_name || submission.profiles?.email || 'Неизвестен'}
                      </td>
                      <td style={{ padding: '12px 15px', fontSize: '13px', color: '#9ca3af' }}>
                        {getSubmissionSummary(submission)}
                      </td>
                      <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('Button clicked! Submission:', submission)
                            setSelectedSubmission(submission)
                          }}
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
                          Преглед
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Universal SubmissionDetail - works with any data structure
const SubmissionDetail = ({ submission, onBack }) => {
  const config = submission.checklist_templates?.config || {}
  const data = submission.data || {}
  const [pdfLoading, setPdfLoading] = useState(false)

  const exportToPDF = async () => {
    setPdfLoading(true)
    
    try {
      if (!window.html2pdf) {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
        script.async = true
        
        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
          document.head.appendChild(script)
        })
      }

      const element = document.getElementById('pdf-content')
      
      const opt = {
        margin: 10,
        filename: `checklist_${submission.checklist_templates?.name}_${submission.submission_date}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }
      
      await window.html2pdf().set(opt).from(element).save()
      
    } catch (error) {
      console.error('PDF export error:', error)
      alert('Грешка при генериране на PDF: ' + error.message)
    } finally {
      setPdfLoading(false)
    }
  }

  // Render any value (string, number, array, object)
  const renderValue = (value, depth = 0) => {
    if (value === null || value === undefined || value === '') return '-'
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return '-'
      
      // Check if this is an array of objects with same keys (table-like data)
      const isTableData = value.length > 0 && 
        typeof value[0] === 'object' && 
        value[0] !== null &&
        !Array.isArray(value[0]) &&
        value.every(item => typeof item === 'object' && item !== null)
      
      if (isTableData && depth < 2) {
        // Render as table
        const allKeys = [...new Set(value.flatMap(item => Object.keys(item)))]
        const displayKeys = allKeys.filter(k => k !== 'id') // Skip ID column for cleaner view
        
        return (
          <div style={{ overflowX: 'auto', margin: '10px 0' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              border: '1px solid #1a5d33',
              fontSize: '11px'
            }}>
              <thead>
                <tr style={{ 
                  background: '#1a5d33',
                  color: 'white'
                }}>
                  <th style={{
                    padding: '8px 6px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    textAlign: 'center',
                    fontWeight: '700'
                  }}>
                    №
                  </th>
                  {displayKeys.map(key => (
                    <th key={key} style={{
                      padding: '8px 6px',
                      border: '1px solid rgba(255,255,255,0.3)',
                      textAlign: 'left',
                      fontWeight: '700',
                      textTransform: 'capitalize'
                    }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {value.map((item, idx) => (
                  <tr key={idx} style={{
                    backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb'
                  }}>
                    <td style={{
                      padding: '6px',
                      border: '1px solid #e5e7eb',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: '#1a5d33'
                    }}>
                      {idx + 1}
                    </td>
                    {displayKeys.map(key => (
                      <td key={key} style={{
                        padding: '6px',
                        border: '1px solid #e5e7eb',
                        textAlign: 'left'
                      }}>
                        {renderValue(item[key], depth + 2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      
      // Regular array - render as list
      if (depth > 2) return `[${value.length} елемента]`
      return (
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          {value.map((item, idx) => (
            <li key={idx}>{renderValue(item, depth + 1)}</li>
          ))}
        </ul>
      )
    }
    if (typeof value === 'object') {
      if (depth > 2) return '[Object]'
      return (
        <div style={{ marginLeft: depth > 0 ? '15px' : '0' }}>
          {Object.entries(value).map(([k, v]) => (
            <div key={k} style={{ marginBottom: '5px' }}>
              <strong>{k}:</strong> {renderValue(v, depth + 1)}
            </div>
          ))}
        </div>
      )
    }
    return String(value)
  }

  // Check if this is standard format (header + rows)
  const hasStandardFormat = data.header && data.rows && config.columns

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Action Buttons */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <button
            onClick={onBack}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            Назад към списъка
          </button>

          <button
            onClick={exportToPDF}
            disabled={pdfLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: pdfLoading ? '#9ca3af' : '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: pdfLoading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            {pdfLoading ? 'Генериране...' : 'Експорт PDF'}
          </button>
        </div>

        {/* PDF Content */}
        <div id="pdf-content" style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '40px',
          marginBottom: '20px'
        }}>
          {/* Header */}
          <div style={{
            borderBottom: '3px solid #1a5d33',
            paddingBottom: '20px',
            marginBottom: '30px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ margin: '0 0 5px 0', fontSize: '22px', color: '#1a5d33', fontWeight: 'bold' }}>
                  {submission.checklist_templates?.name || 'Чек лист'}
                </h1>
                {submission.checklist_templates?.description && (
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                    {submission.checklist_templates.description}
                  </p>
                )}
              </div>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '15px',
              fontSize: '13px',
              padding: '15px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px'
            }}>
              <div>
                <strong>Отдел:</strong> {submission.departments?.name}
              </div>
              <div>
                <strong>Дата:</strong> {new Date(submission.submission_date).toLocaleDateString('bg-BG')}
              </div>
              <div>
                <strong>Попълнил:</strong> {submission.profiles?.full_name || submission.profiles?.email}
              </div>
              <div>
                <strong>Време:</strong> {new Date(submission.submitted_at).toLocaleTimeString('bg-BG')}
              </div>
            </div>
          </div>

          {/* Content */}
          {hasStandardFormat ? (
            /* Standard format with header + rows */
            <>
              {/* Header Fields */}
              {data.header && Object.keys(data.header).length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ 
                    margin: '0 0 15px 0', 
                    fontSize: '16px', 
                    color: '#1a5d33',
                    borderBottom: '2px solid #e5e7eb',
                    paddingBottom: '8px'
                  }}>
                    Основна информация
                  </h3>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '12px' 
                  }}>
                    {Object.entries(data.header).map(([key, value]) => (
                      <div key={key} style={{
                        padding: '12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }}>
                          {config.header_fields?.find(f => f.key === key)?.label || key}:
                        </div>
                        <div style={{ fontSize: '14px', color: '#1a5d33', fontWeight: '600' }}>
                          {value || '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Table Data */}
              {data.rows && data.rows.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ 
                    margin: '0 0 15px 0', 
                    fontSize: '16px', 
                    color: '#1a5d33',
                    borderBottom: '2px solid #e5e7eb',
                    paddingBottom: '8px'
                  }}>
                    Записи ({data.rows.length} {data.rows.length === 1 ? 'ред' : 'реда'})
                  </h3>
                  
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse',
                      border: '2px solid #1a5d33',
                      fontSize: '12px'
                    }}>
                      <thead>
                        <tr style={{ 
                          background: 'linear-gradient(135deg, #1a5d33, #2d7a4f)',
                          color: 'white'
                        }}>
                          {config.columns?.map(col => (
                            <th key={col.key} style={{
                              padding: '10px 8px',
                              border: '1px solid rgba(255,255,255,0.3)',
                              textAlign: 'center',
                              fontSize: '11px',
                              fontWeight: '700',
                              textTransform: 'uppercase'
                            }}>
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.rows.map((row, rowIndex) => (
                          <tr key={rowIndex} style={{
                            backgroundColor: rowIndex % 2 === 0 ? 'white' : '#f9fafb'
                          }}>
                            {config.columns?.map(col => {
                              let displayValue = row[col.key]
                              
                              if (displayValue === undefined || displayValue === null || displayValue === '') {
                                displayValue = '-'
                              }
                              
                              if (col.type === 'select' && col.options && displayValue !== '-') {
                                const option = col.options.find(opt => opt.value === displayValue)
                                displayValue = option?.label || displayValue
                              }
                              
                              return (
                                <td key={col.key} style={{
                                  padding: '8px',
                                  border: '1px solid #e5e7eb',
                                  fontSize: '12px',
                                  textAlign: col.type === 'auto_number' ? 'center' : 'left',
                                  fontWeight: col.type === 'auto_number' ? 'bold' : 'normal',
                                  color: col.type === 'auto_number' ? '#1a5d33' : '#374151'
                                }}>
                                  {displayValue}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Custom/Advanced format - render all data as structured view */
            <div style={{ marginBottom: '30px' }}>              
              {Object.entries(data).map(([key, value]) => {
                // Skip rendering metadata fields in separate section
                const isMetadata = ['objectName', 'companyName', 'savedOilTypes', 'savedEmployees', 'savedInspectors', 'customRefrigerators'].includes(key)
                
                return (
                  <div key={key} style={{ marginBottom: '25px' }}>
                    <h3 style={{ 
                      margin: '0 0 15px 0', 
                      fontSize: '16px', 
                      color: '#1a5d33',
                      borderBottom: '2px solid #e5e7eb',
                      paddingBottom: '8px',
                      textTransform: 'capitalize'
                    }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    
                    <div style={{
                      padding: isMetadata ? '15px' : '0',
                      backgroundColor: isMetadata ? '#f9fafb' : 'transparent',
                      borderRadius: '8px',
                      border: isMetadata ? '1px solid #e5e7eb' : 'none',
                      fontSize: '13px',
                      lineHeight: '1.8'
                    }}>
                      {renderValue(value)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Footer */}
          <div style={{
            marginTop: '40px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '30px',
            fontSize: '12px'
          }}>
            <div>
              <div style={{ marginBottom: '30px', color: '#6b7280' }}>Попълнил:</div>
              <div style={{ borderBottom: '1px solid #374151', paddingBottom: '5px', marginBottom: '5px' }}>
                {submission.profiles?.full_name || submission.profiles?.email}
              </div>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                Име и подпис
              </div>
            </div>
            <div>
              <div style={{ marginBottom: '30px', color: '#6b7280' }}>Проверил:</div>
              <div style={{ borderBottom: '1px solid #374151', paddingBottom: '5px', marginBottom: '5px' }}>
                &nbsp;
              </div>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                Име и подпис
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '30px',
            paddingTop: '15px',
            borderTop: '1px solid #e5e7eb',
            fontSize: '10px',
            color: '#9ca3af',
            textAlign: 'center'
          }}>
            Документът е генериран на {new Date().toLocaleString('bg-BG')} | 
            Оригинален запис от {new Date(submission.submitted_at).toLocaleString('bg-BG')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllSubmissionsHistory