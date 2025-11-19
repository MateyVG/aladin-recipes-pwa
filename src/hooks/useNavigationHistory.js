// src/hooks/useNavigationHistory.js
import { useEffect } from 'react'

/**
 * Hook за управление на browser back button
 * Добавя entry в history и слуша за popstate events
 */
export const useNavigationHistory = (onBack, dependencies = []) => {
  useEffect(() => {
    // Добави entry в history когато компонента се монтира
    window.history.pushState({ page: 'custom' }, '', '')
    
    // Handler за back button
    const handlePopState = (event) => {
      if (onBack) {
        onBack()
      }
    }
    
    window.addEventListener('popstate', handlePopState)
    
    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, dependencies)
}

/**
 * Алтернативен hook с повече контрол
 */
export const useBackButton = (onBack, enabled = true) => {
  useEffect(() => {
    if (!enabled) return
    
    const handlePopState = () => {
      onBack()
      // Предотврати default browser navigation
      window.history.pushState({ page: 'custom' }, '', '')
    }
    
    // Добави entry в history
    window.history.pushState({ page: 'custom' }, '', '')
    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [onBack, enabled])
}