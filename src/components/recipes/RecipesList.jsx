// src/components/recipes/RecipesList.jsx
import React, { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { translations } from '../../translations/translations'
import LanguageSelector from '../../components/LanguageSelector'

const DS = {
  color: {
    bg: '#ECEEED', surface: '#FFFFFF', surfaceAlt: '#F7F9F8',
    primary: '#1B5E37', primaryGlow: 'rgba(27,94,55,0.08)',
    cardHeader: '#E8F5EE',
    graphite: '#1E2A26', graphiteMed: '#3D4F48', graphiteLight: '#6B7D76', graphiteMuted: '#95A39D',
    border: '#D5DDD9', borderLight: '#E4EBE7',
  },
  font: "'DM Sans', system-ui, sans-serif",
  radius: '0px',
  shadow: { sm: '0 1px 3px rgba(30,42,38,0.06),0 1px 2px rgba(30,42,38,0.04)' },
}
const LOGO = 'https://aladinfoods.bg/assets/images/aladinfoods_logo.png'
const CSS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');*,*::before,*::after{box-sizing:border-box}body{margin:0;background:${DS.color.bg}}@keyframes cf{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes sp{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@media(max-width:767px){input,button,select,textarea{font-size:16px!important}}`

const Ic = ({ n, sz = 16, c = 'currentColor', style: s }) => {
  const d = {
    back: <path d="M15 18l-6-6 6-6" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    search: <><circle cx="11" cy="11" r="8" fill="none" stroke={c} strokeWidth="2"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    chefHat: <><path d="M6 13.87A4 4 0 017.41 6a5.11 5.11 0 011.05-1.54 5 5 0 017.08 0A5.11 5.11 0 0116.59 6 4 4 0 0118 13.87V21H6z" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="6" y1="17" x2="18" y2="17" stroke={c} strokeWidth="2"/></>,
    inbox: <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke={c} strokeWidth="2"/><circle cx="12" cy="12" r="3" fill="none" stroke={c} strokeWidth="2"/></>,
  }
  return <svg width={sz} height={sz} viewBox="0 0 24 24" style={{ flexShrink: 0, display: 'block', ...s }}>{d[n]}</svg>
}

const useR = () => { const [w, sW] = useState(window.innerWidth); useEffect(() => { const h = () => sW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h) }, []); return w < 768 }

const Cd = ({ children, style: s, ...rest }) => <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, overflow: 'hidden', animation: 'cf 0.4s ease', ...s }} {...rest}>{children}</div>

const RecipesList = ({ category, onBack, onBackToCategories }) => {
  const { currentLanguage } = useLanguage()
  const t = translations[currentLanguage]
  const mob = useR()
  const pad = mob ? '12px' : '20px'

  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryRecipes, setCategoryRecipes] = useState([])
  const [hoverId, setHoverId] = useState(null)
  const [hoverBack, setHoverBack] = useState(false)
  const [searchFocus, setSearchFocus] = useState(false)

  // === ALL LOGIC UNCHANGED ===
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const recipeModules = import.meta.glob('./categories/**/*.jsx')
        const recipes = []

        console.log('Available recipe paths:', Object.keys(recipeModules))
        console.log('Looking for category:', category)

        for (const path in recipeModules) {
          if (path.includes(`/categories/${category}/`)) {
            console.log('Loading recipe from:', path)
            const module = await recipeModules[path]()
            const fileName = path.split('/').pop().replace('.jsx', '')

            recipes.push({
              id: fileName.toLowerCase(),
              title: fileName.replace(/([A-Z])/g, ' $1').trim(),
              component: module.default,
              category: category
            })
          }
        }

        console.log('Loaded recipes:', recipes)
        setCategoryRecipes(recipes)
      } catch (error) {
        console.error('Error loading recipes:', error)
      }
    }

    if (category) {
      loadRecipes()
    }
  }, [category])

  const filteredRecipes = categoryRecipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  // === SELECTED RECIPE VIEW ===
  if (selectedRecipe) {
    const RecipeComponent = selectedRecipe.component
    return (<><style>{CSS}</style>
      <div style={{ minHeight: '100vh', backgroundColor: DS.color.bg, fontFamily: DS.font }}>
        {/* Top bar for recipe view */}
        <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: DS.color.graphite, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
          <button
            onClick={() => setSelectedRecipe(null)}
            onMouseEnter={() => setHoverBack(true)}
            onMouseLeave={() => setHoverBack(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
              backgroundColor: hoverBack ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: DS.radius,
              cursor: 'pointer', color: '#fff', fontFamily: DS.font, fontSize: '12px', fontWeight: 600,
              transition: 'all 0.15s',
            }}
          >
            <Ic n="back" sz={14} c="#fff" /> {t.backToList || 'Назад към списъка'}
          </button>
          <LanguageSelector />
        </div>
        <RecipeComponent />
      </div>
    </>)
  }

  // === RECIPES LIST VIEW ===
  return (<><style>{CSS}</style>
    <div style={{ minHeight: '100vh', backgroundColor: DS.color.bg, fontFamily: DS.font, color: DS.color.graphite, display: 'flex', flexDirection: 'column' }}>

      {/* DARK TOP BAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: DS.color.graphite, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <button
          onClick={onBackToCategories}
          onMouseEnter={() => setHoverBack(true)}
          onMouseLeave={() => setHoverBack(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
            backgroundColor: hoverBack ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: DS.radius,
            cursor: 'pointer', color: '#fff', fontFamily: DS.font, fontSize: '12px', fontWeight: 600,
            transition: 'all 0.15s',
          }}
        >
          <Ic n="back" sz={14} c="#fff" /> {t.backToCategories || 'Назад към категориите'}
        </button>
        <LanguageSelector />
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: pad, flex: 1, width: '100%' }}>

        {/* LOGO + TITLE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: mob ? '10px' : '14px', marginBottom: '16px' }}>
          <img src={LOGO} alt="Aladin Foods" style={{ height: mob ? '36px' : '48px', objectFit: 'contain', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
          <div>
            <h1 style={{ fontSize: mob ? '16px' : '22px', fontWeight: 700, color: DS.color.primary, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.2, textTransform: 'uppercase', fontFamily: DS.font }}>
              {t.recipes || 'Рецепти'} — {getCategoryName()}
            </h1>
            <p style={{ fontFamily: DS.font, fontSize: mob ? '10px' : '12px', color: DS.color.graphiteLight, fontWeight: 500, margin: '3px 0 0' }}>
              {filteredRecipes.length} {t.recipesInCategory || 'рецепти в категорията'}
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <Cd style={{ marginBottom: '12px' }}>
          <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Ic n="search" sz={18} c={searchFocus ? DS.color.primary : DS.color.graphiteMuted} />
            <input
              type="text"
              placeholder={t.searchRecipe || 'Търси рецепта...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              style={{
                flex: 1, padding: '8px 0', border: 'none', outline: 'none',
                fontFamily: DS.font, fontSize: '14px', color: DS.color.graphite,
                backgroundColor: 'transparent',
              }}
            />
          </div>
        </Cd>

        {/* RECIPES GRID */}
        {filteredRecipes.length === 0 ? (
          <Cd style={{ padding: '40px', textAlign: 'center' }}>
            <Ic n="inbox" sz={48} c={DS.color.graphiteMuted} style={{ margin: '0 auto 12px' }} />
            <p style={{ fontFamily: DS.font, fontSize: '14px', color: DS.color.graphiteMuted, margin: 0 }}>
              {t.noRecipesFound || 'Няма намерени рецепти'}
            </p>
          </Cd>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: mob ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: mob ? '8px' : '12px',
          }}>
            {filteredRecipes.map((recipe, idx) => {
              const isHov = hoverId === recipe.id
              return (
                <Cd
                  key={recipe.id}
                  onClick={() => setSelectedRecipe(recipe)}
                  onMouseEnter={() => setHoverId(recipe.id)}
                  onMouseLeave={() => setHoverId(null)}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: isHov ? `2px solid ${DS.color.primary}` : `1px solid ${DS.color.borderLight}`,
                    transform: isHov ? 'translateY(-5px)' : 'translateY(0)',
                    boxShadow: isHov ? `0 10px 25px rgba(27,94,55,0.15)` : DS.shadow.sm,
                    animationDelay: `${Math.min(idx * 40, 400)}ms`,
                    animationFillMode: 'both',
                    padding: mob ? '14px' : '20px',
                  }}
                >
                  <div style={{
                    width: mob ? 40 : 48, height: mob ? 40 : 48,
                    backgroundColor: DS.color.cardHeader,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: mob ? '8px' : '12px',
                    border: `1px solid ${DS.color.primary}22`,
                    transition: 'transform 0.2s',
                    transform: isHov ? 'scale(1.1)' : 'scale(1)',
                  }}>
                    <Ic n="chefHat" sz={mob ? 20 : 26} c={DS.color.primary} />
                  </div>

                  <h3 style={{
                    margin: `0 0 ${mob ? '4px' : '8px'} 0`,
                    fontFamily: DS.font,
                    fontSize: mob ? '13px' : '16px',
                    color: DS.color.primary,
                    fontWeight: 700,
                  }}>
                    {recipe.title}
                  </h3>

                  <p style={{
                    margin: 0,
                    fontFamily: DS.font,
                    color: DS.color.graphiteMuted,
                    fontSize: mob ? '10px' : '12px',
                  }}>
                    {t.clickToView || 'Кликни за преглед'}
                  </p>
                </Cd>
              )
            })}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: mob ? '16px 12px' : '20px 24px', color: DS.color.graphiteMuted, fontFamily: DS.font, fontSize: '11px', fontWeight: 500, borderTop: `1px solid ${DS.color.borderLight}`, marginTop: 'auto' }}>© 2026 Aladin Foods | by MG</div>
    </div></>)
}

export default RecipesList