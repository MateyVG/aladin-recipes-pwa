// src/components/SuperAdminPanel.jsx
import React, { useState, useEffect } from 'react'
import { createNewManager, supabase } from '../lib/supabase'

const SuperAdminPanel = ({ onBack }) => {
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

  // Load data
  useEffect(() => {
    if (activeTab === 'templates') {
      loadTemplates()
    } else if (activeTab === 'assign') {
      loadRestaurants()
      loadTemplates()
    }
  }, [activeTab])

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('checklist_templates')
      .select(`
        *,
        template_departments(department_name)
      `)
      .order('created_at', { ascending: false })
    
    if (!error) setTemplates(data || [])
  }

  const loadRestaurants = async () => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('active', true)
      .order('name')
    
    if (!error) setRestaurants(data || [])
  }

  const loadAssignedTemplates = async (restaurantId) => {
    const { data, error } = await supabase
      .from('restaurant_templates')
      .select(`
        *,
        checklist_templates(id, name)
      `)
      .eq('restaurant_id', restaurantId)
    
    if (!error) {
      setAssignedTemplates(data || [])
      const assignedIds = data.map(d => d.template_id)
      setAvailableTemplates(templates.filter(t => !assignedIds.includes(t.id)))
    }
  }

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  // Create managers
  const handleCreateManagers = async () => {
    setLoading(true)
    setCreationResults([])

    const emails = emailList.split('\n').map(e => e.trim()).filter(e => e)
    const results = []

    for (const email of emails) {
      const password = generatePassword()
      const fullName = email.split('@')[0]
      
      const result = await createNewManager(email, password, fullName)
      
      results.push({
        email: email,
        password: password,
        success: result.success,
        message: result.success ? 'Ð£ÑÐ¿ÐµÑˆÐ½Ð¾ ÑÑŠÐ·Ð´Ð°Ð´ÐµÐ½' : result.error
      })
    }

    setCreationResults(results)
    setLoading(false)
  }

  // Download CSV
  const downloadCSV = () => {
    const BOM = '\uFEFF'
    const csvData = 'Email,Password,Status,Message\n' + 
      creationResults.map(r => 
        `${r.email},${r.password},${r.success ? 'Success' : 'Error'},${r.message}`
      ).join('\n')

    const blob = new Blob([BOM + csvData], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `managers_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Create template
  const handleCreateTemplate = async () => {
    if (!templateName || !templateConfig || selectedDepartments.length === 0) {
      alert('ÐœÐ¾Ð»Ñ Ð¿Ð¾Ð¿ÑŠÐ»Ð½Ð¸ Ð¸Ð¼Ðµ, config Ð¸ Ð¸Ð·Ð±ÐµÑ€Ð¸ Ð¿Ð¾Ð½Ðµ ÐµÐ´Ð¸Ð½ Ð¾Ñ‚Ð´ÐµÐ»')
      return
    }

    try {
      const config = JSON.parse(templateConfig)
      setLoading(true)

      // Create template
      const { data: template, error: templateError } = await supabase
        .from('checklist_templates')
        .insert({
          name: templateName,
          description: templateDescription,
          config: config,
          active: true,
          created_by: (await supabase.auth.getUser()).data.user.id
        })
        .select()
        .single()

      if (templateError) throw templateError

      // Add department mappings
      const deptMappings = selectedDepartments.map(dept => ({
        template_id: template.id,
        department_name: dept
      }))

      const { error: deptError } = await supabase
        .from('template_departments')
        .insert(deptMappings)

      if (deptError) throw deptError

      alert('Template ÑÑŠÐ·Ð´Ð°Ð´ÐµÐ½ ÑƒÑÐ¿ÐµÑˆÐ½Ð¾!')
      setTemplateName('')
      setTemplateDescription('')
      setTemplateConfig('')
      setSelectedDepartments([])
      loadTemplates()

    } catch (error) {
      alert('Ð“Ñ€ÐµÑˆÐºÐ°: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Assign template to restaurant
  const handleAssignTemplate = async (templateId) => {
    if (!selectedRestaurant) return

    try {
      const { error } = await supabase
        .from('restaurant_templates')
        .insert({
          restaurant_id: selectedRestaurant.id,
          template_id: templateId,
          enabled: true,
          assigned_by: (await supabase.auth.getUser()).data.user.id
        })

      if (error) throw error

      loadAssignedTemplates(selectedRestaurant.id)
    } catch (error) {
      alert('Ð“Ñ€ÐµÑˆÐºÐ°: ' + error.message)
    }
  }

  // Unassign template
  const handleUnassignTemplate = async (assignmentId) => {
    try {
      const { error } = await supabase
        .from('restaurant_templates')
        .delete()
        .eq('id', assignmentId)

      if (error) throw error

      loadAssignedTemplates(selectedRestaurant.id)
    } catch (error) {
      alert('Ð“Ñ€ÐµÑˆÐºÐ°: ' + error.message)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0, color: '#1a5d33', fontSize: '28px' }}>
              Super Admin Panel
            </h1>
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
              ÐÐ°Ð·Ð°Ð´ ÐºÑŠÐ¼ Dashboard
            </button>
          </div>

          {/* Tabs */}
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginTop: '20px',
            borderBottom: '2px solid #e5e7eb'
          }}>
            {[
              { id: 'managers', label: 'ÐœÐµÐ½Ð¸Ð´Ð¶ÑŠÑ€Ð¸' },
              { id: 'templates', label: 'Templates' },
              { id: 'assign', label: 'Ð Ð°Ð·Ð¿Ñ€ÐµÐ´ÐµÐ»ÑÐ½Ðµ' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: activeTab === tab.id ? '#1a5d33' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#6b7280',
                  border: 'none',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '30px'
        }}>
          
          {/* MANAGERS TAB */}
          {activeTab === 'managers' && (
            <div>
              <h2 style={{ marginTop: 0, color: '#1a5d33' }}>Ð¡ÑŠÐ·Ð´Ð°Ð²Ð°Ð½Ðµ Ð½Ð° Ð¼ÐµÐ½Ð¸Ð´Ð¶ÑŠÑ€Ð¸</h2>
              
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                Email Ð°Ð´Ñ€ÐµÑÐ¸ (Ð¿Ð¾ ÐµÐ´Ð¸Ð½ Ð½Ð° Ñ€ÐµÐ´):
              </label>
              <textarea
                value={emailList}
                onChange={(e) => setEmailList(e.target.value)}
                placeholder="manager1@restaurant.com&#10;manager2@restaurant.com"
                style={{
                  width: '100%',
                  minHeight: '150px',
                  padding: '15px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Monaco, Consolas, monospace',
                  backgroundColor: '#f9fafb',
                  resize: 'vertical',
                  marginBottom: '20px'
                }}
              />

              <button
                onClick={handleCreateManagers}
                disabled={loading || !emailList.trim()}
                style={{
                  padding: '12px 25px',
                  backgroundColor: loading || !emailList.trim() ? '#9ca3af' : '#1a5d33',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading || !emailList.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Ð¡ÑŠÐ·Ð´Ð°Ð²Ð°Ð½Ðµ...' : 'Ð¡ÑŠÐ·Ð´Ð°Ð¹ Ð¼ÐµÐ½Ð¸Ð´Ð¶ÑŠÑ€Ð¸'}
              </button>

              {/* Results */}
              {creationResults.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#1a5d33' }}>Ð ÐµÐ·ÑƒÐ»Ñ‚Ð°Ñ‚Ð¸:</h3>
                    <button
                      onClick={downloadCSV}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Ð¡Ð²Ð°Ð»Ð¸ CSV
                    </button>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f9fafb' }}>
                          <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left' }}>Email</th>
                          <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left' }}>ÐŸÐ°Ñ€Ð¾Ð»Ð°</th>
                          <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left' }}>Ð¡Ñ‚Ð°Ñ‚ÑƒÑ</th>
                          <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left' }}>Ð¡ÑŠÐ¾Ð±Ñ‰ÐµÐ½Ð¸Ðµ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {creationResults.map((result, index) => (
                          <tr key={index}>
                            <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb' }}>{result.email}</td>
                            <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb', fontFamily: 'Monaco, monospace', backgroundColor: '#f3f4f6' }}>
                              {result.password}
                            </td>
                            <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb', color: result.success ? '#059669' : '#dc2626', fontWeight: '600' }}>
                              {result.success ? 'âœ“ Ð£ÑÐ¿ÐµÑ…' : 'âœ— Ð“Ñ€ÐµÑˆÐºÐ°'}
                            </td>
                            <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb', fontSize: '13px' }}>{result.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TEMPLATES TAB */}
          {activeTab === 'templates' && (
            <div>
              <h2 style={{ marginTop: 0, color: '#1a5d33' }}>Ð¡ÑŠÐ·Ð´Ð°Ð²Ð°Ð½Ðµ Ð½Ð° Checklist Template</h2>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Ð˜Ð¼Ðµ Ð½Ð° template:</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="ÐšÐ¾Ð½Ñ‚Ñ€Ð¾Ð» Ð½Ð° Ñ€Ð°Ð±Ð¾Ñ‚Ð½Ð¾ Ð¾Ð±Ð»ÐµÐºÐ»Ð¾"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>ÐžÐ¿Ð¸ÑÐ°Ð½Ð¸Ðµ:</label>
                <input
                  type="text"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="ÐŸÑ€Ð¾Ð²ÐµÑ€ÐºÐ° Ð½Ð° Ñ…Ð¸Ð³Ð¸ÐµÐ½Ð° Ð¸ Ð¾Ð±Ð»ÐµÐºÐ»Ð¾ Ð½Ð° Ð¿ÐµÑ€ÑÐ¾Ð½Ð°Ð»Ð°"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>ÐžÑ‚Ð´ÐµÐ»Ð¸:</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {departments.map(dept => (
                    <label key={dept} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedDepartments.includes(dept)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDepartments([...selectedDepartments, dept])
                          } else {
                            setSelectedDepartments(selectedDepartments.filter(d => d !== dept))
                          }
                        }}
                        style={{ marginRight: '8px' }}
                      />
                      {dept}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>JSON Config:</label>
                <textarea
                  value={templateConfig}
                  onChange={(e) => setTemplateConfig(e.target.value)}
                  placeholder='{"type": "table", "columns": [...]}'
                  style={{
                    width: '100%',
                    minHeight: '200px',
                    padding: '15px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'Monaco, Consolas, monospace',
                    backgroundColor: '#f9fafb',
                    resize: 'vertical'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                  ÐŸÐ¾ÑÑ‚Ð°Ð²Ð¸ JSON ÐºÐ¾Ð½Ñ„Ð¸Ð³ÑƒÑ€Ð°Ñ†Ð¸Ñ Ð½Ð° checklist-Ð°
                </p>
              </div>

              <button
                onClick={handleCreateTemplate}
                disabled={loading}
                style={{
                  padding: '12px 25px',
                  backgroundColor: loading ? '#9ca3af' : '#1a5d33',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Ð¡ÑŠÐ·Ð´Ð°Ð²Ð°Ð½Ðµ...' : 'Ð¡ÑŠÐ·Ð´Ð°Ð¹ Template'}
              </button>

              {/* Templates List */}
              {templates.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                  <h3 style={{ color: '#1a5d33' }}>Ð¡ÑŠÑ‰ÐµÑÑ‚Ð²ÑƒÐ²Ð°Ñ‰Ð¸ Templates:</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {templates.map(template => (
                      <div key={template.id} style={{
                        padding: '20px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        backgroundColor: '#f9fafb'
                      }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1a5d33' }}>{template.name}</h4>
                        <p style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' }}>{template.description}</p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {template.template_departments?.map((td, idx) => (
                            <span key={idx} style={{
                              padding: '4px 12px',
                              backgroundColor: '#1a5d33',
                              color: 'white',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {td.department_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ASSIGN TAB */}
          {activeTab === 'assign' && (
            <div>
              <h2 style={{ marginTop: 0, color: '#1a5d33' }}>Ð Ð°Ð·Ð¿Ñ€ÐµÐ´ÐµÐ»ÑÐ½Ðµ Ð½Ð° Templates ÐºÑŠÐ¼ Ð ÐµÑÑ‚Ð¾Ñ€Ð°Ð½Ñ‚Ð¸</h2>
              
              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>Ð˜Ð·Ð±ÐµÑ€Ð¸ Ñ€ÐµÑÑ‚Ð¾Ñ€Ð°Ð½Ñ‚:</label>
                <select
                  value={selectedRestaurant?.id || ''}
                  onChange={(e) => {
                    const restaurant = restaurants.find(r => r.id === e.target.value)
                    setSelectedRestaurant(restaurant)
                    if (restaurant) loadAssignedTemplates(restaurant.id)
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">-- Ð˜Ð·Ð±ÐµÑ€Ð¸ Ñ€ÐµÑÑ‚Ð¾Ñ€Ð°Ð½Ñ‚ --</option>
                  {restaurants.map(restaurant => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name} ({restaurant.contact_email})
                    </option>
                  ))}
                </select>
              </div>

              {selectedRestaurant && (
                <div>
                  {/* Available Templates */}
                  <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ color: '#1a5d33' }}>ÐÐ°Ð»Ð¸Ñ‡Ð½Ð¸ Templates:</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {availableTemplates.map(template => (
                        <div key={template.id} style={{
                          padding: '15px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontWeight: '600', marginBottom: '5px' }}>{template.name}</div>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>{template.description}</div>
                          </div>
                          <button
                            onClick={() => handleAssignTemplate(template.id)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#1a5d33',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            Ð”Ð¾Ð±Ð°Ð²Ð¸
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assigned Templates */}
                  <div>
                    <h3 style={{ color: '#1a5d33' }}>Ð Ð°Ð·Ð¿Ñ€ÐµÐ´ÐµÐ»ÐµÐ½Ð¸ Templates:</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {assignedTemplates.map(assignment => (
                        <div key={assignment.id} style={{
                          padding: '15px',
                          border: '1px solid #1a5d33',
                          borderRadius: '8px',
                          backgroundColor: '#f0fdf4',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{ fontWeight: '600' }}>
                            {assignment.checklist_templates.name}
                          </div>
                          <button
                            onClick={() => handleUnassignTemplate(assignment.id)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#dc2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            ÐŸÑ€ÐµÐ¼Ð°Ñ…Ð½Ð¸
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default SuperAdminPanel