// src/components/recipes/RecipesList.jsx
import React, { useState, useEffect } from 'react'
import { ChefHat, Search, Star, Users, ArrowLeft } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { translations } from '../../translations/translations'
import LanguageSelector from '../../components/LanguageSelector'

const RecipesList = ({ category, onBack, onBackToCategories }) => {
  const { currentLanguage } = useLanguage()  // ← ПОПРАВЕНО
  const t = translations[currentLanguage]    // ← ПОПРАВЕНО
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryRecipes, setCategoryRecipes] = useState([])

  // Зареждаме рецептите от избраната категория
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        // Динамично импортваме всички .jsx файлове от категорията
        const recipeModules = import.meta.glob('./categories/**/*.jsx')
        const recipes = []

        console.log('Available recipe paths:', Object.keys(recipeModules))  // DEBUG
        console.log('Looking for category:', category)  // DEBUG

        for (const path in recipeModules) {
          // Проверяваме дали пътят съдържа избраната категория
          if (path.includes(`/categories/${category}/`)) {
            console.log('Loading recipe from:', path)  // DEBUG
            const module = await recipeModules[path]()
            const fileName = path.split('/').pop().replace('.jsx', '')
            
            recipes.push({
              id: fileName.toLowerCase(),
              title: fileName.replace(/([A-Z])/g, ' $1').trim(), // "DunerOrient" -> "Duner Orient"
              component: module.default,
              category: category
            })
          }
        }

        console.log('Loaded recipes:', recipes)  // DEBUG
        setCategoryRecipes(recipes)
      } catch (error) {
        console.error('Error loading recipes:', error)
      }
    }

    if (category) {
      loadRecipes()
    }
  }, [category])

  // Филтрираме по search term
  const filteredRecipes = categoryRecipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Получаваме името на категорията
  const getCategoryName = () => {
    const categoryNames = {
      duner: t.duner || 'Дюнер',
      pizza: t.pizza || 'Пица',
      chicken: t.chicken || 'Пиле',
      sides: t.sides || 'Гарнитури',
      'new-products': t.newProducts || 'Нови продукти',
      promotions: t.promotions || 'Промоции',
      packaging: t.packaging || 'Пакетиране'
    }
    return categoryNames[category] || category
  }

  // Показваме избрана рецепта
  if (selectedRecipe) {
    const RecipeComponent = selectedRecipe.component
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ 
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <button
            onClick={() => setSelectedRecipe(null)}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: '#4b5563',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
          >
            <ArrowLeft size={20} />
            {t.backToList || 'Назад към списъка'}
          </button>
          
          <LanguageSelector />
        </div>
        <RecipeComponent />
      </div>
    )
  }

  // Показваме списък с рецепти
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
              onClick={onBackToCategories}
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
              {t.backToCategories || 'Назад към категориите'}
            </button>
            
            <LanguageSelector />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <ChefHat size={48} style={{ color: '#166534' }} />
            <div>
              <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.875rem', color: '#166534', fontWeight: 'bold' }}>
                {t.recipes || 'Рецепти'} - {getCategoryName()}
              </h1>
              <p style={{ margin: 0, color: '#6b7280' }}>
                {filteredRecipes.length} {t.recipesInCategory || 'рецепти в категорията'}
              </p>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '1rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} 
            />
            <input
              type="text"
              placeholder={t.searchRecipe || 'Търси рецепта...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 3rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {filteredRecipes.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '4rem',
            textAlign: 'center'
          }}>
            <p style={{ color: '#6b7280', fontSize: '1.125rem', margin: 0 }}>
              {t.noRecipesFound || 'Няма намерени рецепти'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid transparent',
                  padding: '1.5rem'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)'
                  e.currentTarget.style.borderColor = '#166534'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(22,101,52,0.2)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'transparent'
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                <ChefHat size={48} style={{ color: '#166534', marginBottom: '1rem' }} />
                <h3 style={{
                  margin: '0 0 0.625rem 0',
                  fontSize: '1.25rem',
                  color: '#166534',
                  fontWeight: 'bold'
                }}>
                  {recipe.title}
                </h3>
                
                <p style={{
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '0.875rem'
                }}>
                  {t.clickToView || 'Кликни за преглед'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RecipesList