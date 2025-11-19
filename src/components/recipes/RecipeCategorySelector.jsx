// src/components/recipes/RecipeCategorySelector.jsx
import React from 'react'
import { 
  ChefHat, 
  Pizza, 
  Drumstick, 
  UtensilsCrossed, 
  Salad,
  Sparkles,
  Gift,
  Package,
  ArrowLeft 
} from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { translations } from '../../translations/translations'
import LanguageSelector from '../LanguageSelector'

const RecipeCategorySelector = ({ onSelectCategory, onBack }) => {
  const { currentLanguage } = useLanguage()
  const t = translations[currentLanguage]

  const categories = [
    {
      id: 'duner',
      name: t.duner,
      icon: UtensilsCrossed,
      color: '#166534',
      bgColor: '#f0fdf4',
      description: t.dunerDesc
    },
    {
      id: 'pizza',
      name: t.pizza,
      icon: Pizza,
      color: '#dc2626',
      bgColor: '#fef2f2',
      description: t.pizzaDesc
    },
    {
      id: 'chicken',
      name: t.chicken,
      icon: Drumstick,
      color: '#ea580c',
      bgColor: '#fff7ed',
      description: t.chickenDesc
    },
    {
      id: 'sides',
      name: t.sides,
      icon: Salad,
      color: '#16a34a',
      bgColor: '#f0fdf4',
      description: t.sidesDesc
    },
    {
      id: 'new-products',
      name: t.newProducts,
      icon: Sparkles,
      color: '#9333ea',
      bgColor: '#faf5ff',
      description: t.newProductsDesc
    },
    {
      id: 'promotions',
      name: t.promotions,
      icon: Gift,
      color: '#dc2626',
      bgColor: '#fef2f2',
      description: t.promotionsDesc
    },
    {
      id: 'packaging',
      name: t.packaging,
      icon: Package,
      color: '#0891b2',
      bgColor: '#f0fdff',
      description: t.packagingDesc
    }
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '1.25rem' }}>
      <div style={{ maxWidth: '90rem', margin: '0 auto' }}>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              onClick={onBack}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#4b5563',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
            >
              <ArrowLeft size={20} />
              {t.backToDashboard}
            </button>
            
            <LanguageSelector />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <ChefHat size={48} style={{ color: '#166534' }} />
            <div>
              <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.875rem', color: '#166534', fontWeight: 'bold' }}>
                {t.recipesAladinFoods}
              </h1>
              <p style={{ margin: 0, color: '#6b7280' }}>
                {t.selectCategory}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <div
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  padding: '2rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid transparent',
                  textAlign: 'center'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.borderColor = category.color
                  e.currentTarget.style.boxShadow = `0 12px 28px ${category.color}40`
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'transparent'
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: category.bgColor,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto'
                }}>
                  <IconComponent size={40} style={{ color: category.color }} />
                </div>

                <h3 style={{
                  margin: '0 0 0.75rem 0',
                  fontSize: '1.5rem',
                  color: category.color,
                  fontWeight: 'bold'
                }}>
                  {category.name}
                </h3>

                <p style={{
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '0.9375rem',
                  lineHeight: '1.5'
                }}>
                  {category.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default RecipeCategorySelector