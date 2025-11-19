// src/components/DepartmentView.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import SubmissionsHistory from './SubmissionsHistory'
import PizzaTemperatureControl from './templates/PizzaTemperatureControl'
import RefrigeratorTemperatureControl from './templates/RefrigeratorTemperatureControl'
import RestaurantInventoryForm from './templates/RestaurantInventoryForm'
import ChickenProductionSheet from './templates/ChickenProductionSheet'
import DonerProductionSheet from './templates/DonerProductionSheet'
import ChickenMeatballProductionSheet from './templates/ChickenMeatballProductionSheet'
import HygieneWorkCard from './templates/HygieneWorkCard'
import RefrigeratorStorageControl from './templates/RefrigeratorStorageControl'
import OilChangeChecklist from './templates/OilChangeChecklist'
import { useNavigationHistory } from '../hooks/useNavigationHistory'

// Map component names to actual components
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
}

const DepartmentView = ({ department, restaurantId, onBack }) => {
  useNavigationHistory(onBack)
  
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [department.id])

  const loadTemplates = async () => {
    setLoading(true)
    try {
      const { data: restaurantTemplates, error: rtError } = await supabase
        .from('restaurant_templates')
        .select(`
          *,
          checklist_templates (
            id,
            name,
            description,
            config,
            component_name,
            template_departments (department_name)
          )
        `)
        .eq('restaurant_id', restaurantId)
        .eq('enabled', true)

      if (rtError) throw rtError

      const filtered = restaurantTemplates
        .filter(rt => {
          const depts = rt.checklist_templates?.template_departments || []
          return depts.some(td => td.department_name === department.name)
        })
        .map(rt => rt.checklist_templates)

      setTemplates(filtered)
    } catch (error) {
      console.error('Error loading templates:', error)
      alert('Грешка при зареждане на чек листи')
    } finally {
      setLoading(false)
    }
  }

  if (showHistory) {
    return (
      <SubmissionsHistory
        department={department}
        restaurantId={restaurantId}
        onBack={() => setShowHistory(false)}
      />
    )
  }

  if (selectedTemplate) {
    const TemplateComponent = TEMPLATE_COMPONENTS[selectedTemplate.component_name]
    
    if (TemplateComponent) {
      return (
        <TemplateComponent
          template={selectedTemplate}
          config={selectedTemplate.config}
          department={department}
          restaurantId={restaurantId}
          onBack={() => setSelectedTemplate(null)}
        />
      )
    } else {
      return (
        <ChecklistForm
          template={selectedTemplate}
          department={department}
          restaurantId={restaurantId}
          onBack={() => setSelectedTemplate(null)}
        />
      )
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
            ← Назад към отдели
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <div style={{ fontSize: '48px' }}>{department.icon}</div>
            <div>
              <h1 style={{ margin: '0 0 5px 0', fontSize: '28px', color: '#1a5d33' }}>
                {department.name}
              </h1>
              <p style={{ margin: 0, color: '#6b7280' }}>
                {templates.length} налични чек листа
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowHistory(true)}
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
            📋 Виж история
          </button>
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
        ) : templates.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              Няма налични чек листи за този отдел
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {templates.map(template => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  padding: '25px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid transparent'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)'
                  e.currentTarget.style.borderColor = '#1a5d33'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'transparent'
                }}
              >
                <h3 style={{
                  margin: '0 0 10px 0',
                  fontSize: '18px',
                  color: '#1a5d33',
                  fontWeight: 'bold'
                }}>
                  {template.name}
                </h3>
                <p style={{
                  margin: '0 0 20px 0',
                  color: '#6b7280',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {template.description || 'Няма описание'}
                </p>
                {template.component_name && (
                  <div style={{
                    padding: '4px 8px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #1a5d33',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#1a5d33',
                    marginBottom: '15px',
                    display: 'inline-block'
                  }}>
                    🚀 Advanced Template
                  </div>
                )}
                <button style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#1a5d33',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}>
                  Попълни чек лист
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Generic Checklist Form
const ChecklistForm = ({ template, department, restaurantId, onBack }) => {
  const [formData, setFormData] = useState({
    header: {},
    rows: []
  })
  const [loading, setLoading] = useState(false)

  const config = template.config

  useEffect(() => {
    const initialHeader = {}
    config.header_fields?.forEach(field => {
      if (field.default === 'today') {
        initialHeader[field.key] = new Date().toISOString().split('T')[0]
      } else {
        initialHeader[field.key] = field.default || ''
      }
    })

    const initialRows = []
    const minRows = config.row_config?.min_rows || 1
    for (let i = 0; i < minRows; i++) {
      const row = { id: Date.now() + i }
      config.columns.forEach(col => {
        if (col.type === 'auto_number') {
          row[col.key] = i + 1
        } else {
          row[col.key] = ''
        }
      })
      initialRows.push(row)
    }

    setFormData({ header: initialHeader, rows: initialRows })
  }, [])

  const addRow = () => {
    const newRow = { id: Date.now() }
    config.columns.forEach(col => {
      if (col.type === 'auto_number') {
        newRow[col.key] = formData.rows.length + 1
      } else {
        newRow[col.key] = ''
      }
    })
    setFormData({ ...formData, rows: [...formData.rows, newRow] })
  }

  const removeRow = (rowId) => {
    if (formData.rows.length <= (config.row_config?.min_rows || 1)) return
    
    const updatedRows = formData.rows
      .filter(row => row.id !== rowId)
      .map((row, index) => {
        const numberCol = config.columns.find(c => c.type === 'auto_number')
        if (numberCol) {
          return { ...row, [numberCol.key]: index + 1 }
        }
        return row
      })
    
    setFormData({ ...formData, rows: updatedRows })
  }

  const updateHeader = (key, value) => {
    setFormData({
      ...formData,
      header: { ...formData.header, [key]: value }
    })
  }

  const updateRow = (rowId, key, value) => {
    setFormData({
      ...formData,
      rows: formData.rows.map(row => 
        row.id === rowId ? { ...row, [key]: value } : row
      )
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      
      const submissionData = {
        template_id: template.id,
        restaurant_id: restaurantId,
        department_id: department.id,
        data: formData,
        submitted_by: userData.user.id,
        submission_date: formData.header.date || new Date().toISOString().split('T')[0],
        synced: true
      }

      const { error } = await supabase
        .from('checklist_submissions')
        .insert(submissionData)

      if (error) throw error

      alert('Чек листът е запазен успешно!')
      onBack()
    } catch (error) {
      console.error('Submit error:', error)
      alert('Грешка при запазване: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
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

          <div style={{
            background: 'linear-gradient(135deg, #1a5d33, #2d7a4f)',
            padding: '30px',
            borderRadius: '8px',
            color: 'white',
            marginBottom: '20px'
          }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>
              {config.title || template.name}
            </h1>
            {config.code && (
              <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
                Код: {config.code} | Ревизия: {config.revision || '01'}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {config.header_fields?.map(field => (
              <div key={field.key} style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  {field.label}:
                </label>
                {field.type === 'date' ? (
                  <input
                    type="date"
                    value={formData.header[field.key] || ''}
                    onChange={(e) => updateHeader(field.key, e.target.value)}
                    required={field.required}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData.header[field.key] || ''}
                    onChange={(e) => updateHeader(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{
                  background: 'linear-gradient(135deg, #1a5d33, #2d7a4f)'
                }}>
                  {config.columns.map(col => (
                    <th key={col.key} style={{
                      padding: '12px',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '13px',
                      textAlign: 'center',
                      minWidth: col.width || '100px',
                      borderRight: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      {col.label}
                    </th>
                  ))}
                  <th style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '13px',
                    textAlign: 'center',
                    width: '80px'
                  }}>
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData.rows.map((row, rowIndex) => (
                  <tr key={row.id} style={{
                    backgroundColor: rowIndex % 2 === 0 ? 'white' : '#fafbfc'
                  }}>
                    {config.columns.map(col => (
                      <td key={col.key} style={{
                        padding: '8px',
                        borderBottom: '1px solid #e5e7eb',
                        borderRight: '1px solid #e5e7eb'
                      }}>
                        {col.type === 'auto_number' ? (
                          <div style={{
                            textAlign: 'center',
                            fontWeight: 'bold',
                            color: '#1a5d33'
                          }}>
                            {row[col.key]}
                          </div>
                        ) : col.type === 'select' ? (
                          <select
                            value={row[col.key] || ''}
                            onChange={(e) => updateRow(row.id, col.key, e.target.value)}
                            required={col.required}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '13px'
                            }}
                          >
                            {col.options?.map(opt => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={row[col.key] || ''}
                            onChange={(e) => updateRow(row.id, col.key, e.target.value)}
                            placeholder={col.placeholder}
                            required={col.required}
                            readOnly={col.readonly}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '13px',
                              backgroundColor: col.readonly ? '#f3f4f6' : 'white'
                            }}
                          />
                        )}
                      </td>
                    ))}
                    <td style={{
                      padding: '8px',
                      borderBottom: '1px solid #e5e7eb',
                      textAlign: 'center'
                    }}>
                      {formData.rows.length > (config.row_config?.min_rows || 1) && (
                        <button
                          onClick={() => removeRow(row.id)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ✗
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '15px', borderTop: '2px solid #e5e7eb' }}>
            <button
              onClick={addRow}
              style={{
                padding: '10px 20px',
                backgroundColor: '#1a5d33',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              + {config.row_config?.add_button_label || 'Добави ред'}
            </button>
          </div>
        </div>

        {config.footer_note && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
              {config.footer_note}
            </p>
          </div>
        )}

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '15px 40px',
              backgroundColor: loading ? '#9ca3af' : '#1a5d33',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Запазване...' : 'Запази чек лист'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default DepartmentView