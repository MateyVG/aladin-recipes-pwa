// src/components/LanguageSelector.jsx
import React, { useState, useRef, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const languages = [
    { code: 'bg', name: 'Български', flag: '🇧🇬' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ]

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode)
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          transition: 'all 0.2s',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = '#166534'
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(22,101,52,0.1)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = '#e5e7eb'
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
        }}
      >
        <Globe size={18} style={{ color: '#166534' }} />
        <span style={{ fontSize: '1.25rem' }}>{currentLang.flag}</span>
        <span style={{ color: '#374151' }}>{currentLang.name}</span>
        <svg
          style={{
            width: '16px',
            height: '16px',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            color: '#6b7280'
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 0.5rem)',
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          minWidth: '200px',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: 'none',
                backgroundColor: currentLanguage === lang.code ? '#f0fdf4' : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: currentLanguage === lang.code ? '600' : '400',
                color: currentLanguage === lang.code ? '#166534' : '#374151',
                transition: 'background-color 0.15s',
                textAlign: 'left'
              }}
              onMouseOver={(e) => {
                if (currentLanguage !== lang.code) {
                  e.currentTarget.style.backgroundColor = '#f9fafb'
                }
              }}
              onMouseOut={(e) => {
                if (currentLanguage !== lang.code) {
                  e.currentTarget.style.backgroundColor = 'white'
                }
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{lang.flag}</span>
              <span>{lang.name}</span>
              {currentLanguage === lang.code && (
                <svg
                  style={{
                    width: '16px',
                    height: '16px',
                    marginLeft: 'auto',
                    color: '#166534'
                  }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSelector