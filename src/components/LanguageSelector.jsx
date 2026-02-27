// src/components/LanguageSelector.jsx
import React, { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'

const DS = {
  color: {
    primary: '#1B5E37', primaryLight: '#2D7A4F', primaryGlow: 'rgba(27,94,55,0.08)',
    surface: '#FFFFFF', surfaceAlt: '#F7F9F8',
    cardHeader: '#E8F5EE',
    graphite: '#1E2A26', graphiteMed: '#3D4F48', graphiteLight: '#6B7D76', graphiteMuted: '#95A39D',
    border: '#D5DDD9', borderLight: '#E4EBE7',
  },
  font: "'DM Sans', system-ui, sans-serif",
  radius: '0px',
}

const GlobeIcon = ({ sz = 18, c = DS.color.primary }) => (
  <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: 'block' }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
)

const CheckIcon = () => (
  <svg width={16} height={16} viewBox="0 0 20 20" fill={DS.color.primary} style={{ marginLeft: 'auto', flexShrink: 0 }}>
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
)

const ChevronIcon = ({ open }) => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={DS.color.graphiteMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
    <path d="M19 9l-7 7-7-7" />
  </svg>
)

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [hoverIdx, setHoverIdx] = useState(-1)
  const dropdownRef = useRef(null)

  const languages = [
    { code: 'bg', name: 'Български', flag: '🇧🇬' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ]

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0]

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
      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '6px 12px',
          backgroundColor: DS.color.surface,
          border: `1.5px solid ${isOpen ? DS.color.primary : DS.color.borderLight}`,
          borderRadius: DS.radius,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: DS.font,
          fontSize: '13px',
          fontWeight: 600,
          color: DS.color.graphite,
          transition: 'all 0.15s',
          boxShadow: isOpen ? `0 0 0 3px ${DS.color.primaryGlow}` : '0 1px 3px rgba(30,42,38,0.06)',
          minHeight: '36px',
        }}
      >
        <GlobeIcon sz={16} c={DS.color.primary} />
        <span style={{ fontSize: '16px', lineHeight: 1 }}>{currentLang.flag}</span>
        <span>{currentLang.name}</span>
        <ChevronIcon open={isOpen} />
      </button>

      {/* DROPDOWN */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          right: 0,
          backgroundColor: DS.color.surface,
          border: `1.5px solid ${DS.color.borderLight}`,
          borderRadius: DS.radius,
          boxShadow: '0 10px 30px rgba(30,42,38,0.15)',
          minWidth: '200px',
          zIndex: 1000,
          overflow: 'hidden',
        }}>
          {languages.map((lang, idx) => {
            const isActive = currentLanguage === lang.code
            const isHov = hoverIdx === idx && !isActive
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(-1)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  backgroundColor: isActive ? DS.color.cardHeader : isHov ? DS.color.surfaceAlt : DS.color.surface,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontFamily: DS.font,
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? DS.color.primary : DS.color.graphiteMed,
                  transition: 'background-color 0.15s',
                  textAlign: 'left',
                  borderBottom: idx < languages.length - 1 ? `1px solid ${DS.color.borderLight}` : 'none',
                }}
              >
                <span style={{ fontSize: '18px', lineHeight: 1 }}>{lang.flag}</span>
                <span>{lang.name}</span>
                {isActive && <CheckIcon />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default LanguageSelector