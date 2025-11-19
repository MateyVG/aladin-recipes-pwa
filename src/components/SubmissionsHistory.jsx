// src/components/SubmissionsHistory.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigationHistory } from '../hooks/useNavigationHistory'
import ImprovedSubmissionDetail from './ImprovedSubmissionDetail'

// ============================================
// PDF STYLES INJECTION - ADD ONCE AT MODULE LEVEL
// ============================================
if (typeof document !== 'undefined') {
  const pdfStyles = document.createElement('style')
  pdfStyles.innerHTML = `
    /* PDF Export Optimizations */
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
    }
    
    .pdf-export-mode {
      /* Force backgrounds to print */
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    .pdf-export-mode * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* Optimize tables for PDF */
    .pdf-export-mode table {
      page-break-inside: avoid;
      border-collapse: collapse !important;
    }
    
    .pdf-export-mode thead {
      display: table-header-group;
    }
    
    .pdf-export-mode tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    
    .pdf-export-mode td, .pdf-export-mode th {
      page-break-inside: avoid;
    }
    
    /* Ensure borders are visible */
    .pdf-export-mode table,
    .pdf-export-mode td,
    .pdf-export-mode th {
      border-width: 1px !important;
      border-style: solid !important;
    }
    
    /* Force gradients to render as solid colors for better compatibility */
    .pdf-export-mode thead tr {
      background: #1a5d33 !important;
      background-image: none !important;
    }
    
    /* Ensure text is readable */
    .pdf-export-mode {
      font-size: 11px !important;
      line-height: 1.4 !important;
    }
    
    .pdf-export-mode table {
      font-size: 10px !important;
    }
    
    /* Fix flex/grid layouts for PDF */
    .pdf-export-mode [style*="display: flex"],
    .pdf-export-mode [style*="display: grid"] {
      display: block !important;
    }
  `
  
  // Add styles only once
  if (!document.getElementById('pdf-export-styles')) {
    pdfStyles.id = 'pdf-export-styles'
    document.head.appendChild(pdfStyles)
  }
}

const SubmissionsHistory = ({ department, restaurantId, onBack }) => {
  useNavigationHistory(onBack)
  
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    templateId: ''
  })

  useEffect(() => {
    loadSubmissions()
  }, [department.id, filter])

  const loadSubmissions = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('checklist_submissions')
        .select(`
          *,
          checklist_templates(name, description, config),
          profiles(full_name, email)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('department_id', department.id)
        .order('submission_date', { ascending: false })

      if (filter.startDate) {
        query = query.gte('submission_date', filter.startDate)
      }

      if (filter.endDate) {
        query = query.lte('submission_date', filter.endDate)
      }

      if (filter.templateId) {
        query = query.eq('template_id', filter.templateId)
      }

      const { data, error } = await query

      if (error) throw error
      setSubmissions(data || [])
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

  if (selectedSubmission) {
    return (
      <ImprovedSubmissionDetail
        submission={selectedSubmission}
        onBack={() => setSelectedSubmission(null)}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
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
            Назад
          </button>

          <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#1a5d33' }}>
            История на чек листи - {department.name}
          </h1>
          <p style={{ margin: 0, color: '#6b7280' }}>
            {submissions.length} попълнени чек листа
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#1a5d33' }}>Филтри:</h3>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                От дата:
              </label>
              <input
                type="date"
                value={filter.startDate}
                onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                style={{
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                До дата:
              </label>
              <input
                type="date"
                value={filter.endDate}
                onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                style={{
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                &nbsp;
              </label>
              <button
                onClick={() => setFilter({ startDate: '', endDate: '', templateId: '' })}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Изчисти филтри
              </button>
            </div>
          </div>
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
        ) : submissions.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              Няма попълнени чек листи
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '15px'
          }}>
            {submissions.map(submission => (
              <div
                key={submission.id}
                onClick={() => setSelectedSubmission(submission)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '2px solid transparent'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#1a5d33'
                  e.currentTarget.style.transform = 'translateX(5px)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'transparent'
                  e.currentTarget.style.transform = 'translateX(0)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: '18px', 
                      color: '#1a5d33',
                      fontWeight: 'bold'
                    }}>
                      {submission.checklist_templates?.name || 'Без име'}
                    </h3>
                    <p style={{ 
                      margin: '0 0 8px 0', 
                      color: '#6b7280', 
                      fontSize: '14px' 
                    }}>
                      {submission.checklist_templates?.description || ''}
                    </p>
                    <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#9ca3af' }}>
                      <span>{formatDate(submission.submission_date)}</span>
                      <span>{submission.profiles?.full_name || submission.profiles?.email || 'Неизвестен'}</span>
                      <span>{new Date(submission.submitted_at).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <button style={{
                    padding: '8px 16px',
                    backgroundColor: '#1a5d33',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    Преглед
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


export default SubmissionsHistory