// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mkdsiwuyepryxjiqrdrc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZHNpd3V5ZXByeXhqaXFyZHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzM4NTgsImV4cCI6MjA3NDQ0OTg1OH0.1lQvcs9m29ONvh9jF-4DaE7uzVuE1lx5kmjrXcZP_q0'

// ЕДИНСТВЕНА инстанция — предотвратява Multiple GoTrueClient грешката
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'aladin-haccp-auth', // уникален ключ
  },
})

// Admin клиент — само за super_admin операции, без session persistence
const getAdminClient = () => {
  const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY
  if (!serviceKey || serviceKey === 'твоят-service-role-key') return null
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// =============================================
// УПРАВЛЕНИЕ НА МЕНИДЖЪРИ
// =============================================

export const createNewManager = async (email, password, fullName = '') => {
  try {
    const admin = getAdminClient()
    if (!admin) return { success: false, error: 'Admin key не е конфигуриран' }

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
    })
    if (authError) return { success: false, error: authError.message }

    const userId = authData.user.id
    const displayName = fullName || email.split('@')[0]

    const { data: profileResult, error: profileError } = await supabase.rpc('create_user_profile', {
      p_user_id: userId,
      p_email: email.trim().toLowerCase(),
      p_role: 'manager',
      p_full_name: displayName,
    })
    if (profileError || !profileResult?.success) {
      await admin.auth.admin.deleteUser(userId)
      return { success: false, error: profileResult?.error || 'Грешка при създаване на профил' }
    }

    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .insert({ name: `Ресторант ${displayName}`, contact_email: email.trim().toLowerCase(), active: true })
      .select().single()
    if (restaurantError) return { success: false, error: 'Грешка при създаване на ресторант' }

    await supabase.from('profiles').update({ restaurant_id: restaurant.id }).eq('id', userId)

    return { success: true, data: { user: authData.user, restaurant }, message: 'Успешно създаден мениджър' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const deactivateManager = async (userId) => {
  const { error } = await supabase.from('profiles').update({ active: false }).eq('id', userId)
  return error ? { success: false, error: error.message } : { success: true }
}

export const resetManagerPassword = async (userId, newPassword) => {
  const admin = getAdminClient()
  if (!admin) return { success: false, error: 'Admin key не е конфигуриран' }
  const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword })
  return error ? { success: false, error: error.message } : { success: true }
}

export const createSuperAdmin = async (email, password, fullName) => {
  const admin = getAdminClient()
  if (!admin) return { success: false, error: 'Admin key не е конфигуриран' }
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: email.trim().toLowerCase(), password, email_confirm: true,
  })
  if (authError) return { success: false, error: authError.message }
  const { data: profileResult } = await supabase.rpc('create_user_profile', {
    p_user_id: authData.user.id, p_email: email.trim().toLowerCase(), p_role: 'super_admin', p_full_name: fullName,
  })
  return profileResult?.success ? { success: true, data: authData.user } : { success: false, error: profileResult?.error }
}

export const createReportsAdmin = async (email, password, fullName) => {
  const admin = getAdminClient()
  if (!admin) return { success: false, error: 'Admin key не е конфигуриран' }
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: email.trim().toLowerCase(), password, email_confirm: true,
  })
  if (authError) return { success: false, error: authError.message }
  const { data: profileResult } = await supabase.rpc('create_user_profile', {
    p_user_id: authData.user.id, p_email: email.trim().toLowerCase(), p_role: 'reports_admin', p_full_name: fullName,
  })
  return profileResult?.success ? { success: true, data: authData.user } : { success: false, error: profileResult?.error }
}

// =============================================
// NOTIFICATIONS
// =============================================

export const notificationService = {
  getNotifications: async (restaurantId, filters = {}) => {
    let query = supabase.from('notifications').select('*').eq('restaurant_id', restaurantId).order('created_at', { ascending: false })
    if (filters.unreadOnly) query = query.eq('read', false)
    if (filters.limit) query = query.limit(filters.limit)
    return await query
  },
  getUnreadCount: async (restaurantId) => await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurantId).eq('read', false),
  markAsRead: async (id) => await supabase.from('notifications').update({ read: true, read_at: new Date().toISOString() }).eq('id', id),
  markAllAsRead: async (restaurantId) => await supabase.from('notifications').update({ read: true, read_at: new Date().toISOString() }).eq('restaurant_id', restaurantId).eq('read', false),
  deleteNotification: async (id) => await supabase.from('notifications').delete().eq('id', id),
  subscribeToNotifications: (restaurantId, callback) => supabase.channel(`notifications_${restaurantId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `restaurant_id=eq.${restaurantId}` }, callback).subscribe(),
}

// =============================================
// DATABASE SERVICE
// =============================================

export const dbService = {
  signIn: async (email, password) => await supabase.auth.signInWithPassword({ email, password }),
  signOut: async () => await supabase.auth.signOut(),
  getUserProfile: async (userId) => await supabase.from('profiles').select('*, restaurants(*)').eq('id', userId).single(),
  updateRestaurant: async (restaurantId, updates) => await supabase.from('restaurants').update(updates).eq('id', restaurantId).select().single(),
  getDepartments: async (restaurantId) => await supabase.from('departments').select('*').eq('restaurant_id', restaurantId).eq('active', true).order('name'),
  getTemplatesForRestaurant: async (restaurantId) => await supabase.from('restaurant_templates').select('*, checklist_templates(id, name, description, config, component_name, active)').eq('restaurant_id', restaurantId).eq('enabled', true),
  createSubmission: async (data) => await supabase.from('checklist_submissions').insert(data).select().single(),
  getSubmissions: async (restaurantId, filters = {}) => {
    let q = supabase.from('checklist_submissions').select('*, checklist_templates(name), departments(name), profiles(full_name, email)').eq('restaurant_id', restaurantId).order('submitted_at', { ascending: false })
    if (filters.departmentId) q = q.eq('department_id', filters.departmentId)
    if (filters.templateId) q = q.eq('template_id', filters.templateId)
    if (filters.startDate) q = q.gte('submission_date', filters.startDate)
    if (filters.endDate) q = q.lte('submission_date', filters.endDate)
    return await q
  },
}