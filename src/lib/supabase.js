// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mkdsiwuyepryxjiqrdrc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZHNpd3V5ZXByeXhqaXFyZHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzM4NTgsImV4cCI6MjA3NDQ0OTg1OH0.1lQvcs9m29ONvh9jF-4DaE7uzVuE1lx5kmjrXcZP_q0'

// !!! ВАЖНО: Вземи service_role key от Supabase Dashboard -> Settings -> API
// И го сложи в .env файл като VITE_SUPABASE_SERVICE_KEY
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || 'твоят-service-role-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin клиент - ИЗПОЛЗВАЙ САМО НА BACKEND или за admin операции
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// =============================================
// HELPER: Създаване на отдели за ресторант
// =============================================
async function createDepartmentsForRestaurant(restaurantId) {
  try {
    const { data: templates, error: templateError } = await supabase
      .from('department_templates')
      .select('*')
      .order('sort_order')
    
    if (templateError) throw templateError

    const departments = templates.map(template => ({
      name: template.name,
      description: template.description,
      restaurant_id: restaurantId,
      active: true
    }))

    const { data, error } = await supabase
      .from('departments')
      .insert(departments)
      .select()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating departments:', error)
    return { data: null, error }
  }
}

// =============================================
// ГЛАВНА ФУНКЦИЯ: Създаване на мениджър
// =============================================
export const createNewManager = async (email, password, fullName = '') => {
  try {
    console.log('Creating manager:', email)
    
    // Създай потребителя с admin клиент
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || email.split('@')[0]
      }
    })
    
    if (authError) {
      console.error('Auth error:', authError)
      return { success: false, error: authError.message }
    }
    
    const userId = authData.user.id
    
    // Използвай SQL функцията да създаде profile
    const { data: profileResult, error: profileError } = await supabase.rpc('create_user_profile', {
      p_user_id: userId,
      p_email: email,
      p_role: 'manager',
      p_full_name: fullName || email.split('@')[0]
    })
    
    if (profileError || !profileResult.success) {
      console.error('Profile error:', profileError || profileResult.error)
      // Изтрий потребителя ако profile не е създаден
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return { success: false, error: profileResult?.error || 'Грешка при създаване на профил' }
    }
    
    // Създай ресторант
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .insert({
        name: `Ресторант ${email.split('@')[0]}`,
        contact_email: email,
        active: true
      })
      .select()
      .single()
    
    if (restaurantError) {
      console.error('Restaurant error:', restaurantError)
      return { success: false, error: 'Грешка при създаване на ресторант' }
    }
    
    // Създай отдели
    const { data: departments, error: deptError } = await createDepartmentsForRestaurant(restaurant.id)
    
    if (deptError) {
      console.error('Departments error:', deptError)
    }
    
    // Актуализирай профила с restaurant_id
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({ restaurant_id: restaurant.id })
      .eq('id', userId)
      .select()
      .single()
    
    if (updateError) {
      console.error('Profile update error:', updateError)
      return { success: false, error: 'Грешка при актуализиране на профил' }
    }
    
    return {
      success: true,
      data: {
        user: authData.user,
        profile: profile,
        restaurant: restaurant,
        departments: departments
      },
      message: 'Успешно създаден мениджър'
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: error.message || 'Неочаквана грешка'
    }
  }
}

// =============================================
// УПРАВЛЕНИЕ НА МЕНИДЖЪРИ
// =============================================

export const deactivateManager = async (userId) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ active: false })
      .eq('id', userId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const resetManagerPassword = async (userId, newPassword) => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (error) throw error
    return { success: true, message: 'Паролата е променена успешно' }
  } catch (error) {
    console.error('Password reset error:', error)
    return { success: false, error: error.message }
  }
}

export const createSuperAdmin = async (email, password, fullName) => {
  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    })

    if (authError) throw authError

    const { data: profileResult } = await supabase.rpc('create_user_profile', {
      p_user_id: authData.user.id,
      p_email: email,
      p_role: 'super_admin',
      p_full_name: fullName
    })

    if (!profileResult.success) throw new Error(profileResult.error)

    return { success: true, data: authData.user }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const createReportsAdmin = async (email, password, fullName) => {
  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    })

    if (authError) throw authError

    const { data: profileResult } = await supabase.rpc('create_user_profile', {
      p_user_id: authData.user.id,
      p_email: email,
      p_role: 'reports_admin',
      p_full_name: fullName
    })

    if (!profileResult.success) throw new Error(profileResult.error)

    return { success: true, data: authData.user }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// =============================================
// NOTIFICATIONS
// =============================================

export const notificationService = {
  // Get notifications for restaurant
  getNotifications: async (restaurantId, filters = {}) => {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })

    if (filters.unreadOnly) {
      query = query.eq('read', false)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    return await query
  },

  // Get unread count
  getUnreadCount: async (restaurantId) => {
    return await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId)
      .eq('read', false)
  },

  // Mark as read
  markAsRead: async (notificationId) => {
    return await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
  },

  // Mark all as read
  markAllAsRead: async (restaurantId) => {
    return await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('restaurant_id', restaurantId)
      .eq('read', false)
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    return await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
  },

  // Get notification settings
  getSettings: async (restaurantId) => {
    return await supabase
      .from('notification_settings')
      .select('*')
      .eq('restaurant_id', restaurantId)
  },

  // Update notification setting
  updateSetting: async (settingId, updates) => {
    return await supabase
      .from('notification_settings')
      .update(updates)
      .eq('id', settingId)
  },

  // Create notification setting
  createSetting: async (settingData) => {
    return await supabase
      .from('notification_settings')
      .insert(settingData)
  },

  // Subscribe to real-time notifications
  subscribeToNotifications: (restaurantId, callback) => {
    return supabase
      .channel(`notifications_${restaurantId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `restaurant_id=eq.${restaurantId}`
        }, 
        callback
      )
      .subscribe()
  }
}

// =============================================
// DATABASE SERVICE
// =============================================

export const dbService = {
  // Auth
  signIn: async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password })
  },
  
  signOut: async () => {
    return await supabase.auth.signOut()
  },

  // Profile
  getUserProfile: async (userId) => {
    return await supabase
      .from('profiles')
      .select('*, restaurants(*)')
      .eq('id', userId)
      .single()
  },

  // Restaurants
  updateRestaurant: async (restaurantId, updates) => {
    return await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', restaurantId)
      .select()
      .single()
  },

  createRestaurant: async (restaurantData) => {
    return await supabase
      .from('restaurants')
      .insert(restaurantData)
      .select()
      .single()
  },

  // Departments
  getDepartments: async (restaurantId) => {
    return await supabase
      .from('departments')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('active', true)
      .order('name')
  },

  createDepartments: async (restaurantId) => {
    return await createDepartmentsForRestaurant(restaurantId)
  },

  // Templates
  getTemplatesForRestaurant: async (restaurantId) => {
    return await supabase
      .from('restaurant_templates')
      .select(`
        *,
        checklist_templates (
          id,
          name,
          description,
          config,
          component_name,
          active
        )
      `)
      .eq('restaurant_id', restaurantId)
      .eq('enabled', true)
  },

  // Submissions
  createSubmission: async (submissionData) => {
    return await supabase
      .from('checklist_submissions')
      .insert(submissionData)
      .select()
      .single()
  },

  getSubmissions: async (restaurantId, filters = {}) => {
    let query = supabase
      .from('checklist_submissions')
      .select(`
        *,
        checklist_templates(name),
        departments(name),
        profiles(full_name, email)
      `)
      .eq('restaurant_id', restaurantId)
      .order('submitted_at', { ascending: false })

    if (filters.departmentId) {
      query = query.eq('department_id', filters.departmentId)
    }

    if (filters.templateId) {
      query = query.eq('template_id', filters.templateId)
    }

    if (filters.startDate) {
      query = query.gte('submission_date', filters.startDate)
    }

    if (filters.endDate) {
      query = query.lte('submission_date', filters.endDate)
    }

    return await query
  }
}