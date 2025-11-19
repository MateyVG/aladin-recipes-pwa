import React, { useState, useEffect } from 'react'
import { supabase, createNewManager, resetManagerPassword } from './lib/supabase'
import DepartmentView from './components/DepartmentView'
import ReportsAdminPanel from './components/ReportsAdminPanel'
import NotificationsPanel from './components/NotificationsPanel'
import { NotificationBadge, NotificationSettings } from './components/NotificationBadge'
import AllSubmissionsHistory from './components/AllSubmissionsHistory'
import RecipesManager from './components/recipes/RecipesManager'
import { useNavigationHistory } from './hooks/useNavigationHistory'
import { LanguageProvider } from './context/LanguageContext'

// Auth hook за управление на потребителите
const useAuth = () => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUserSession()
  }, [])

  const checkUserSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        await loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error('Session check error:', error)
      setLoading(false)
    }
  }

  const loadProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, restaurants(*)')
        .eq('id', userId)
        .single()
      
      if (data) {
        setProfile(data)
      } else {
        setProfile({ 
          id: userId, 
          email: user?.email, 
          role: 'manager', 
          full_name: user?.email 
        })
      }
    } catch (error) {
      console.error('Profile load error:', error)
      setProfile({ 
        id: userId, 
        email: user?.email, 
        role: 'manager', 
        full_name: user?.email 
      })
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (!error && data.user) {
      setUser(data.user)
      await loadProfile(data.user.id)
    }
    
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return { user, profile, loading, signIn, signOut }
}

// Логин компонент
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberLogin, setRememberLogin] = useState(false)

  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail')
    const savedPassword = localStorage.getItem('userPassword')
    
    if (savedEmail && savedPassword) {
      setEmail(savedEmail)
      setPassword(savedPassword)
      setRememberLogin(true)
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await onLogin(email, password)
    
    if (result.error) {
      setError(result.error.message)
    } else {
      if (rememberLogin) {
        localStorage.setItem('userEmail', email)
        localStorage.setItem('userPassword', password)
      } else {
        localStorage.removeItem('userEmail')
        localStorage.removeItem('userPassword')
      }
    }
    
    setLoading(false)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f4f8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1a5d33, #2d7a4f)',
          padding: '40px 20px',
          textAlign: 'center',
          color: 'white'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '26px', fontWeight: 'bold' }}>
            Checklist PWA
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
            Login to your account
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ padding: '40px 20px' }}>
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: '#f9fafb'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: '#f9fafb'
              }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              <input
                type="checkbox"
                checked={rememberLogin}
                onChange={(e) => setRememberLogin(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              Remember my login details
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#9ca3af' : '#1a5d33',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

// SUPER ADMIN PANEL
const SuperAdminPanel = ({ onBack }) => {
  useNavigationHistory(onBack)
  
  const [activeTab, setActiveTab] = useState('managers')
  const [loading, setLoading] = useState(false)
  
  // Create managers tab
  const [emailList, setEmailList] = useState('')
  const [creationResults, setCreationResults] = useState([])
  
  // Manage tab
  const [allManagers, setAllManagers] = useState([])
  const [selectedManager, setSelectedManager] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [editingRestaurant, setEditingRestaurant] = useState(null)
  const [newRestaurantName, setNewRestaurantName] = useState('')
  
  // Templates tab
  const [templates, setTemplates] = useState([])
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [templateConfig, setTemplateConfig] = useState('')
  const [selectedDepartments, setSelectedDepartments] = useState([])
  
  // Assign tab
  const [restaurants, setRestaurants] = useState([])
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [availableTemplates, setAvailableTemplates] = useState([])
  const [assignedTemplates, setAssignedTemplates] = useState([])

  const departments = ['Pizza', 'Chicken', 'Doner', 'Operations']

  useEffect(() => {
    if (activeTab === 'manage') loadAllManagers()
    else if (activeTab === 'templates') loadTemplates()
    else if (activeTab === 'assign') {
      loadRestaurants()
      loadTemplates()
    }
  }, [activeTab])

  const loadAllManagers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, restaurants(*)')
      .eq('role', 'manager')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Load managers error:', error)
    } else {
      setAllManagers(data || [])
    }
  }

  const loadTemplates = async () => {
    const { data } = await supabase
      .from('checklist_templates')
      .select('*, template_departments(department_name)')
      .order('created_at', { ascending: false })
    if (data) setTemplates(data)
  }

  const loadRestaurants = async () => {
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .eq('active', true)
      .order('name')
    if (data) setRestaurants(data)
  }

  const loadAssignedTemplates = async (restaurantId) => {
    const { data } = await supabase
      .from('restaurant_templates')
      .select('*, checklist_templates(id, name)')
      .eq('restaurant_id', restaurantId)
    
    if (data) {
      setAssignedTemplates(data)
      const assignedIds = data.map(d => d.template_id)
      setAvailableTemplates(templates.filter(t => !assignedIds.includes(t.id)))
    }
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  const handleCreateManagers = async () => {
    setLoading(true)
    setCreationResults([])

    const emails = emailList.split('\n').map(e => e.trim()).filter(e => e)
    const results = []

    for (const email of emails) {
      const password = generatePassword()
      const result = await createNewManager(email, password, email.split('@')[0])
      
      results.push({
        email,
        password,
        success: result.success,
        message: result.success ? 'Успешно създаден' : result.error
      })
    }

    setCreationResults(results)
    setLoading(false)
  }

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

  const handleResetPassword = async () => {
    if (!selectedManager || !newPassword) {
      alert('Моля избери мениджър и въведи нова парола')
      return
    }

    if (newPassword.length < 6) {
      alert('Паролата трябва да е поне 6 символа')
      return
    }

    setLoading(true)
    const result = await resetManagerPassword(selectedManager.id, newPassword)
    setLoading(false)

    if (result.success) {
      alert(`Паролата на ${selectedManager.email} е променена успешно!\nНова парола: ${newPassword}`)
      setNewPassword('')
      setSelectedManager(null)
    } else {
      alert('Грешка: ' + result.error)
    }
  }

  const handleUpdateRestaurantName = async () => {
    if (!editingRestaurant || !editingRestaurant.id || !newRestaurantName.trim()) {
      alert('Моля въведи име на ресторант')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ name: newRestaurantName.trim() })
        .eq('id', editingRestaurant.id)

      if (error) throw error

      alert('Името на ресторанта е променено успешно!')
      setEditingRestaurant(null)
      setNewRestaurantName('')
      loadAllManagers()
    } catch (error) {
      console.error('Update restaurant error:', error)
      alert('Грешка: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    if (!templateName || !templateConfig || selectedDepartments.length === 0) {
      alert('Моля попълни име, config и избери поне един отдел')
      return
    }

    try {
      const config = JSON.parse(templateConfig)
      setLoading(true)

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

      const deptMappings = selectedDepartments.map(dept => ({
        template_id: template.id,
        department_name: dept
      }))

      const { error: deptError } = await supabase
        .from('template_departments')
        .insert(deptMappings)

      if (deptError) throw deptError

      alert('Template създаден успешно!')
      setTemplateName('')
      setTemplateDescription('')
      setTemplateConfig('')
      setSelectedDepartments([])
      loadTemplates()

    } catch (error) {
      alert('Грешка: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

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
      alert('Грешка: ' + error.message)
    }
  }

  const handleUnassignTemplate = async (assignmentId) => {
    try {
      const { error } = await supabase
        .from('restaurant_templates')
        .delete()
        .eq('id', assignmentId)

      if (error) throw error
      loadAssignedTemplates(selectedRestaurant.id)
    } catch (error) {
      alert('Грешка: ' + error.message)
    }
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
              Назад към Dashboard
            </button>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginTop: '20px',
            borderBottom: '2px solid #e5e7eb',
            overflowX: 'auto'
          }}>
            {[
              { id: 'managers', label: 'Създай мениджъри' },
              { id: 'manage', label: 'Управление' },
              { id: 'templates', label: 'Templates' },
              { id: 'assign', label: 'Разпределяне' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: activeTab === tab.id ? '#1a5d33' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#6b7280',
                  border: 'none',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '30px'
        }}>
          
          {activeTab === 'managers' && (
            <div>
              <h2 style={{ marginTop: 0, color: '#1a5d33' }}>Създаване на мениджъри</h2>
              
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                Email адреси (по един на ред):
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
                {loading ? 'Създаване...' : 'Създай мениджъри'}
              </button>

              {creationResults.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#1a5d33' }}>Резултати:</h3>
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
                      Свали CSV
                    </button>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f9fafb' }}>
                          <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left' }}>Email</th>
                          <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left' }}>Парола</th>
                          <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left' }}>Статус</th>
                          <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left' }}>Съобщение</th>
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
                              {result.success ? '✓ Успех' : '✗ Грешка'}
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

          {activeTab === 'manage' && (
            <div>
              <h2 style={{ marginTop: 0, color: '#1a5d33' }}>Управление на мениджъри</h2>
              
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#1a5d33' }}>Всички мениджъри:</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f9fafb' }}>
                        <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left' }}>Email</th>
                        <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left' }}>Име</th>
                        <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left' }}>Ресторант</th>
                        <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left' }}>Статус</th>
                        <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'left' }}>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allManagers.map(manager => (
                        <tr key={manager.id}>
                          <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb' }}>{manager.email}</td>
                          <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb' }}>{manager.full_name || '-'}</td>
                          <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb' }}>
                            {manager.restaurants?.name || 'Няма ресторант'}
                          </td>
                          <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: manager.active ? '#d1fae5' : '#fee2e2',
                              color: manager.active ? '#065f46' : '#991b1b'
                            }}>
                              {manager.active ? 'Активен' : 'Неактивен'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => setSelectedManager(manager)}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#1a5d33',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '13px'
                                }}
                              >
                                Смени парола
                              </button>
                              {manager.restaurants && (
                                <button
                                  onClick={() => {
                                    setEditingRestaurant(manager.restaurants)
                                    setNewRestaurantName(manager.restaurants.name)
                                  }}
                                  style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '13px'
                                  }}
                                >
                                  Редактирай ресторант
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedManager && (
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f0fdf4',
                  border: '2px solid #1a5d33',
                  borderRadius: '8px',
                  marginTop: '30px'
                }}>
                  <h3 style={{ marginTop: 0, color: '#1a5d33' }}>
                    Промяна на парола за: {selectedManager.email}
                  </h3>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                      Нова парола:
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Въведи нова парола"
                        style={{
                          flex: 1,
                          padding: '12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontFamily: 'Monaco, Consolas, monospace'
                        }}
                      />
                      <button
                        onClick={() => setNewPassword(generatePassword())}
                        style={{
                          padding: '12px 20px',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        Генерирай
                      </button>
                    </div>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                      Паролата трябва да е поне 6 символа
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={handleResetPassword}
                      disabled={loading || !newPassword}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: loading || !newPassword ? '#9ca3af' : '#1a5d33',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: loading || !newPassword ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {loading ? 'Променям...' : 'Промени паролата'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedManager(null)
                        setNewPassword('')
                      }}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      Отказ
                    </button>
                  </div>
                </div>
              )}

              {editingRestaurant && (
                <div style={{
                  marginTop: '30px',
                  padding: '20px',
                  backgroundColor: '#eff6ff',
                  border: '2px solid #2563eb',
                  borderRadius: '8px'
                }}>
                  <h3 style={{ marginTop: 0, color: '#2563eb' }}>
                    Редактиране на ресторант
                  </h3>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                      Име на ресторант:
                    </label>
                    <input
                      type="text"
                      value={newRestaurantName}
                      onChange={(e) => setNewRestaurantName(e.target.value)}
                      placeholder="Хепи, Пицария Гошо, и т.н."
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    />
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                      Текущо име: {editingRestaurant.name}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={handleUpdateRestaurantName}
                      disabled={loading || !newRestaurantName.trim()}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: loading || !newRestaurantName.trim() ? '#9ca3af' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: loading || !newRestaurantName.trim() ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {loading ? 'Променям...' : 'Промени името'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingRestaurant(null)
                        setNewRestaurantName('')
                      }}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      Отказ
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <div>
              <h2 style={{ marginTop: 0, color: '#1a5d33' }}>Създаване на Checklist Template</h2>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Име на template:</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Контрол на работно облекло"
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Описание:</label>
                <input
                  type="text"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Проверка на хигиена и облекло на персонала"
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Отдели:</label>
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
                  Постави JSON конфигурация на checklist-а
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
                {loading ? 'Създаване...' : 'Създай Template'}
              </button>

              {templates.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                  <h3 style={{ color: '#1a5d33' }}>Съществуващи Templates:</h3>
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

          {activeTab === 'assign' && (
            <div>
              <h2 style={{ marginTop: 0, color: '#1a5d33' }}>Разпределяне на Templates към Ресторанти</h2>
              
              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>Избери ресторант:</label>
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
                  <option value="">-- Избери ресторант --</option>
                  {restaurants.map(restaurant => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name} ({restaurant.contact_email})
                    </option>
                  ))}
                </select>
              </div>

              {selectedRestaurant && (
                <div>
                  <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ color: '#1a5d33' }}>Налични Templates:</h3>
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
                            Добави
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 style={{ color: '#1a5d33' }}>Разпределени Templates:</h3>
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
                            Премахни
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

// Main dashboard
const Dashboard = ({ profile, onSignOut }) => {
  const [currentView, setCurrentView] = useState('dashboard')
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [showChecklists, setShowChecklists] = useState(false)

  const departmentIcons = {
    'Pizza': '🍕',
    'Chicken': '🍗',
    'Doner': '🥙',
    'Operations': '⚙️'
  }

  useEffect(() => {
    if (profile?.role === 'manager' && profile.restaurant_id) {
      loadDepartments()
    }
  }, [profile])

  const loadDepartments = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('restaurant_id', profile.restaurant_id)
        .eq('active', true)
        .order('name')

      if (error) throw error

      const deptWithIcons = data.map(dept => ({
        ...dept,
        icon: departmentIcons[dept.name] || '📋'
      }))

      setDepartments(deptWithIcons)
    } catch (error) {
      console.error('Error loading departments:', error)
    } finally {
      setLoading(false)
    }
  }

  if (currentView === 'admin') {
    return <SuperAdminPanel onBack={() => setCurrentView('dashboard')} />
  }

  if (currentView === 'reports') {
    return <ReportsAdminPanel onBack={() => setCurrentView('dashboard')} />
  }

  if (currentView === 'notifications') {
    return (
      <NotificationsPanel
        onBack={() => setCurrentView('dashboard')}
        restaurantId={profile?.restaurant_id || profile?.restaurants?.id}
        userId={profile?.id}
      />
    )
  }

  if (currentView === 'notification-settings') {
    return (
      <NotificationSettings
        onBack={() => setCurrentView('dashboard')}
        restaurantId={profile?.restaurant_id || profile?.restaurants?.id}
      />
    )
  }

  if (currentView === 'all-history') {
    return (
      <AllSubmissionsHistory
        restaurantId={profile?.restaurant_id || profile?.restaurants?.id}
        onBack={() => setCurrentView('dashboard')}
      />
    )
  }

  if (currentView === 'recipes') {
    return <RecipesManager onBack={() => setCurrentView('dashboard')} />
  }

  if (showChecklists && selectedDepartment && profile?.role === 'manager') {
    return (
      <DepartmentView
        department={selectedDepartment}
        restaurantId={profile.restaurant_id}
        onBack={() => {
          setSelectedDepartment(null)
          setShowChecklists(false)
        }}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '30px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            margin: '0 0 15px 0', 
            fontSize: '32px', 
            color: '#1a5d33',
            fontWeight: 'bold'
          }}>
            {profile?.restaurants?.name || 'My Restaurant'}
          </h1>
          <p style={{ margin: '0 0 20px 0', color: '#6b7280', fontSize: '16px' }}>
            Welcome, {profile?.full_name || profile?.email}
          </p>
          <p style={{ margin: '0 0 25px 0', fontSize: '14px', color: '#9ca3af' }}>
            Role: {profile?.role === 'super_admin' ? 'Super Administrator' : 
                  profile?.role === 'reports_admin' ? 'Reports Administrator' : 'Manager'}
          </p>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {profile?.role === 'super_admin' && (
              <button
                onClick={() => setCurrentView('admin')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#1a5d33',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Admin Panel
              </button>
            )}
            {(profile?.role === 'super_admin' || profile?.role === 'reports_admin') && (
              <button
                onClick={() => setCurrentView('reports')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Reports
              </button>
            )}
            <button
              onClick={() => setCurrentView('all-history')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Пълна история
            </button>
            <button
              onClick={() => setCurrentView('notifications')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              Notifications
              <NotificationBadge 
                restaurantId={profile?.restaurant_id || profile?.restaurants?.id}
              />
            </button>
            <button
              onClick={onSignOut}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* НОВИТЕ ДВА БУТОНА - Чек листи и Рецепти */}
        {profile?.role === 'manager' && !showChecklists && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            {/* Бутон Чек листи */}
            <div
              onClick={() => setShowChecklists(true)}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                padding: '40px',
                textAlign: 'center',
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
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📋</div>
              <h3 style={{ 
                margin: '0 0 10px 0', 
                fontSize: '24px', 
                color: '#1a5d33',
                fontWeight: 'bold'
              }}>
                Чек листи
              </h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                Управление на чек листи по отдели
              </p>
            </div>

            {/* Бутон Рецепти */}
            <div
              onClick={() => setCurrentView('recipes')}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                padding: '40px',
                textAlign: 'center',
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
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>👨‍🍳</div>
              <h3 style={{ 
                margin: '0 0 10px 0', 
                fontSize: '24px', 
                color: '#1a5d33',
                fontWeight: 'bold'
              }}>
                Рецепти
              </h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                Преглед на професионални рецепти
              </p>
            </div>
          </div>
        )}

        {/* Departments Grid - показва се само ако showChecklists е true */}
        {profile?.role === 'manager' && showChecklists && !selectedDepartment && (
          <>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <button
                onClick={() => setShowChecklists(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                ← Назад
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  onClick={() => setSelectedDepartment(dept)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    padding: '30px',
                    textAlign: 'center',
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
                  <div style={{ fontSize: '50px', marginBottom: '15px' }}>
                    {dept.icon}
                  </div>
                  <h3 style={{ 
                    margin: '0 0 10px 0', 
                    fontSize: '22px', 
                    color: '#1a5d33',
                    fontWeight: 'bold'
                  }}>
                    {dept.name}
                  </h3>
                  <p style={{ margin: '0 0 20px 0', color: '#6b7280' }}>
                    Кликни за чек листи
                  </p>
                  <button style={{
                    padding: '12px 24px',
                    backgroundColor: '#1a5d33',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    Отвори отдел
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Loading screen
const LoadingScreen = () => (
  <div style={{
    minHeight: '100vh',
    backgroundColor: '#f0f4f8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '5px solid #1a5d33',
        borderTop: '5px solid transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px'
      }}></div>
      <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading application...</p>
    </div>
  </div>
)

// Main App Component
function App() {
  const { user, profile, loading, signIn, signOut } = useAuth()

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  if (loading) {
    return (
      <LanguageProvider>
        <LoadingScreen />
      </LanguageProvider>
    )
  }

  if (!user) {
    return (
      <LanguageProvider>
        <LoginScreen onLogin={signIn} />
      </LanguageProvider>
    )
  }

  return (
    <LanguageProvider>
      <Dashboard profile={profile} onSignOut={signOut} />
    </LanguageProvider>
  )
}

export default App