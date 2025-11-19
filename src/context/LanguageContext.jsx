// src/context/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Зареждаме езика от localStorage или default Български
    const savedLanguage = localStorage.getItem('selectedLanguage')
    return savedLanguage || 'bg'
  })

  useEffect(() => {
    // Запазваме езика в localStorage при всяка промяна
    localStorage.setItem('selectedLanguage', currentLanguage)
  }, [currentLanguage])

  const changeLanguage = (langCode) => {
    setCurrentLanguage(langCode)
  }

  const value = {
    currentLanguage,
    changeLanguage
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}