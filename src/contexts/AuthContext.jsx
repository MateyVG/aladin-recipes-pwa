// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, dbService } from '../lib/supabase'
import { syncService, offlineDB } from '../lib/offlineDB'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    // Initialize sync listeners
    syncService.initSyncListeners()

    // Listen for online/offline events
    const handleOnline = () => setOffline(false)
    const handleOffline = () => setOffline(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await dbService.getUserProfile(userId)
      if (error) throw error
      
      setProfile(data)
      
      // Store profile locally for offline access
      await syncService.storeLocally('profiles', data)
      
      // If user is a manager and doesn't have a restaurant, create one
      if (data.role === 'manager' && !data.restaurant_id) {
        await createInitialSetup(data)
      } else if (data.restaurants) {
        // Store restaurant and departments locally
        await syncService.storeLocally('restaurants', data.restaurants)
        const { data: departments } = await dbService.getDepartments(data.restaurants.id)
        if (departments) {
          await syncService.storeLocally('departments', departments)
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      // Try to load from local storage if offline
      if (!navigator.onLine) {
        const localProfiles = await syncService.getLocalData('profiles')
        const localProfile = localProfiles.find(p => p.id === userId)
        if (localProfile) {
          setProfile(localProfile)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const createInitialSetup = async (userProfile) => {
    try {
      // Create restaurant
      const { data: restaurant, error: restaurantError } = await dbService.createRestaurant({
        name: 'Моето заведение',
        address: '',
        contact_email: userProfile.email
      })
      
      if (restaurantError) throw restaurantError

      // Create departments
      const { data: departments, error: deptError } = await dbService.createDepartments(restaurant.id)
      if (deptError) throw deptError

      // Update user profile with restaurant_id
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update({ restaurant_id: restaurant.id })
        .eq('id', userProfile.id)
        .select('*, restaurants(*)')
        .single()

      if (profileError) throw profileError

      setProfile(updatedProfile)

      // Store locally
      await syncService.storeLocally('profiles', updatedProfile)
      await syncService.storeLocally('restaurants', restaurant)
      await syncService.storeLocally('departments', departments)

    } catch (error) {
      console.error('Error creating initial setup:', error)
    }
  }

  const signIn = async (email, password) => {
    setLoading(true)
    try {
      const { data, error } = await dbService.signIn(email, password)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await dbService.signOut()
      if (error) throw error
      
      // Clear local data
      await offlineDB.delete()
      await offlineDB.open()
      
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const updateRestaurant = async (updates) => {
    try {
      if (!profile?.restaurants?.id) return { error: 'No restaurant found' }

      if (navigator.onLine) {
        const { data, error } = await dbService.updateRestaurant(profile.restaurants.id, updates)
        if (error) throw error
        
        // Update local profile
        const updatedProfile = {
          ...profile,
          restaurants: { ...profile.restaurants, ...updates }
        }
        setProfile(updatedProfile)
        await syncService.storeLocally('profiles', updatedProfile)
        await syncService.storeLocally('restaurants', data)
        
        return { data, error: null }
      } else {
        // Queue for sync when online
        await syncService.queueAction('restaurants', 'update', { 
          id: profile.restaurants.id, 
          ...updates 
        })
        
        // Update locally
        const updatedProfile = {
          ...profile,
          restaurants: { ...profile.restaurants, ...updates }
        }
        setProfile(updatedProfile)
        await syncService.storeLocally('profiles', updatedProfile)
        
        return { data: updatedProfile.restaurants, error: null }
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  const value = {
    user,
    profile,
    loading,
    offline,
    signIn,
    signOut,
    updateRestaurant,
    isAdmin: profile?.role === 'super_admin',
    isReportsAdmin: profile?.role === 'reports_admin',
    isManager: profile?.role === 'manager',
    hasRestaurant: !!profile?.restaurants
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}