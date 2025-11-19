// src/components/recipes/categories/duner/DunerOrient.jsx
import React, { useState } from 'react';
import { Clock, Users, ChefHat, Star, Play, Heart } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { translations } from '../../../../translations/translations';

const DunerOrient = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  const [activeTab, setActiveTab] = useState('recipe');
  const [isFavorite, setIsFavorite] = useState(false);

  const recipeData = {
    title: t.dunerOrient || "ДЮНЕР ОРИЕНТ",
    description: t.dunerOrientDesc || "Професионална рецепта от АЛАДИН ФУУДС за автентичен дюнер със специален сос и пресни съставки",
    image: "https://www.aladinfoods.bg/files/images/2643/Orient_1160x1000.png",
    video: "https://drive.google.com/file/d/1zClbvNSSqhi3ONHUik1msDaiitEVqktJ/preview",
    servings: 1,
    rating: 4.9,
    company: "АЛАДИН ФУУДС ООД",
    version: "01",
    date: "22.05.2025",
    
    // Съставки - всичко на едно място, без категории
    ingredients: [
      { item: t.tortillaAladin || "Тортила Аладин", amount: "1 бр. (70g)" },
      { item: t.chickenMeat || "Пилешко месо от шиш", amount: "120g" },
      { item: t.frenchFries || "Пресни пържени картофи", amount: "60g" },
      { item: t.dunerSauceOrient || "Сос за дюнер Ориент", amount: "60g" },
      { item: t.pickles || "Кисели краставички", amount: "30g" },
      { item: t.redSauce || "Червен сос (за скара)", amount: "25ml" },
      { item: t.sunflowerOil || "Слънчогледово олио", amount: t.smallAmount || "малко количество" }
    ],
    
    instructions: [
      {
        step: 1,
        title: t.spreadTortilla || "Намазване на тортилата",
        description: t.spreadTortillaDesc || "Тортила Аладин (25 cm) се намазва по средата със сос за дюнер 'Ориент' (около 60g)."
      },
      {
        step: 2,
        title: t.addPicklesFries || "Добавяне на краставички и картофи",
        description: t.addPicklesFriesDesc || "Добавят се нарязани кисели краставички (около 30g) и пресни пържени картофи (около 60g)."
      },
      {
        step: 3,
        title: t.addMeat || "Добавяне на месото",
        description: t.addMeatDesc || "Последно се добавя пилешко месо от шиша (около 120g)."
      },
      {
        step: 4,
        title: t.foldTortilla || "Сгъване на тортилата",
        description: t.foldTortillaDesc || "Сгънатата тортила с всички съставки се извършва по специалния начин за дюнер."
      },
      {
        step: 5,
        title: t.grill || "Запичане",
        description: t.grillDesc || "Сгънатата тортила се запича за около минута от двете страни (до готовност) върху скарата с малко количество червен сос за дюнер и слънчогледово олио."
      },
      {
        step: 6,
        title: t.packaging || "Опаковане",
        description: t.packagingDesc || "Запеченият дюнер 'Ориент' се опакова в каширано алуминиево фолио."
      }
    ],
    
    tips: [
      t.tip1 || "Тортилата трябва да се намазва равномерно по средата",
      t.tip2 || "Картофите да са пресно пържени за по-добър вкус",
      t.tip3 || "Месото от шиша да е топло при добавяне",
      t.tip4 || "Запичането трябва да е кратко - само до готовност",
      t.tip5 || "Фолиото помага за по-лесно консумиране"
    ]
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(to right, #166534, #15803d)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ChefHat style={{ height: '2rem', width: '2rem', color: 'white' }} />
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                  {t.recipesAladinFoods || 'Рецепти АЛАДИН'}
                </h1>
                <p style={{ fontSize: '0.75rem', color: '#bbf7d0', margin: 0 }}>
                  {t.professionalRecipes || 'Професионални рецепти'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              style={{
                padding: '0.5rem',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Heart style={{ height: '1.25rem', width: '1.25rem', color: 'white', fill: isFavorite ? 'white' : 'none' }} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem' }}>
        
        {/* Hero Section - Optimized for tablets */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          marginBottom: '1rem'
        }}>
          {/* Image */}
          <div style={{ position: 'relative' }}>
            <img 
              src={recipeData.image} 
              alt={recipeData.title}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '280px',
                objectFit: 'cover'
              }}
            />
            <div style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              backgroundColor: 'white',
              borderRadius: '9999px',
              padding: '0.375rem 0.75rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <Star style={{ height: '1rem', width: '1rem', color: '#eab308', fill: '#eab308' }} />
              <span style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{recipeData.rating}</span>
            </div>
          </div>
          
          {/* Title & Info - Compact */}
          <div style={{ padding: '1.25rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#166534', marginBottom: '0.375rem', lineHeight: '1.2' }}>
              {recipeData.title}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.625rem' }}>
              {recipeData.company} • v{recipeData.version}
            </p>
            <p style={{ color: '#4b5563', marginBottom: '0.875rem', lineHeight: '1.5', fontSize: '0.9rem' }}>
              {recipeData.description}
            </p>
            
            {/* Quick Info - Ultra Compact */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '0.625rem' 
            }}>
              <div style={{
                backgroundColor: '#f0fdf4',
                borderRadius: '0.625rem',
                padding: '0.75rem',
                textAlign: 'center'
              }}>
                <Users style={{ height: '1.25rem', width: '1.25rem', color: '#166534', margin: '0 auto 0.375rem' }} />
                <div style={{ fontWeight: 'bold', color: '#166534', fontSize: '1.125rem' }}>
                  {recipeData.servings}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.125rem' }}>
                  {t.servings || 'порция'}
                </div>
              </div>
              
              <div style={{
                backgroundColor: '#f0fdf4',
                borderRadius: '0.625rem',
                padding: '0.75rem',
                textAlign: 'center'
              }}>
                <Clock style={{ height: '1.25rem', width: '1.25rem', color: '#166534', margin: '0 auto 0.375rem' }} />
                <div style={{ fontWeight: 'bold', color: '#166534', fontSize: '1.125rem' }}>
                  3
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.125rem' }}>
                  {t.minutes || 'минути'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Section - Compact */}
        {recipeData.video && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
              <Play style={{ height: '1.125rem', width: '1.125rem', color: '#166534' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#166534', margin: 0 }}>
                {t.videoGuide || 'Видео ръководство'}
              </h3>
            </div>
            <div style={{ 
              position: 'relative', 
              paddingBottom: '56.25%', 
              height: 0, 
              overflow: 'hidden',
              borderRadius: '0.5rem'
            }}>
              <iframe
                src={recipeData.video}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Tabs - Optimized */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '1rem',
          overflow: 'hidden'
        }}>
          <div style={{ 
            display: 'flex', 
            borderBottom: '2px solid #f3f4f6',
            overflowX: 'auto'
          }}>
            <button
              onClick={() => setActiveTab('recipe')}
              style={{
                flex: 1,
                padding: '0.875rem',
                border: 'none',
                backgroundColor: activeTab === 'recipe' ? '#f0fdf4' : 'white',
                color: activeTab === 'recipe' ? '#166534' : '#6b7280',
                fontWeight: activeTab === 'recipe' ? 'bold' : 'normal',
                cursor: 'pointer',
                borderBottom: activeTab === 'recipe' ? '3px solid #166534' : 'none',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap'
              }}
            >
              {t.recipe || 'Рецепта'}
            </button>
            <button
              onClick={() => setActiveTab('tips')}
              style={{
                flex: 1,
                padding: '0.875rem',
                border: 'none',
                backgroundColor: activeTab === 'tips' ? '#f0fdf4' : 'white',
                color: activeTab === 'tips' ? '#166534' : '#6b7280',
                fontWeight: activeTab === 'tips' ? 'bold' : 'normal',
                cursor: 'pointer',
                borderBottom: activeTab === 'tips' ? '3px solid #166534' : 'none',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap'
              }}
            >
              {t.tips || 'Съвети'}
            </button>
          </div>

          {/* Tab Content - Reduced padding */}
          <div style={{ padding: '1.25rem' }}>
            {activeTab === 'recipe' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Ingredients - ULTRA COMPACT - World-class UX */}
                <div>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 'bold', 
                    color: '#166534', 
                    marginBottom: '0.75rem' 
                  }}>
                    {t.ingredients || 'Съставки'}
                  </h3>
                  
                  {/* Ingredients - Vertical layout (stacked) - Most readable! */}
                  <style>{`
                    .ingredients-wrapper {
                      display: flex;
                      flex-direction: column;
                      gap: 0.75rem;
                      background-color: white;
                      border-radius: 0.75rem;
                      padding: 1.25rem;
                      border: 1px solid #e5e7eb;
                    }

                    .ingredient-row {
                      display: flex;
                      flex-direction: column;
                      gap: 0.25rem;
                      padding: 0.75rem 0;
                      border-bottom: 1px solid #f3f4f6;
                    }

                    .ingredient-row:last-child {
                      border-bottom: none;
                    }

                    .ingredient-item {
                      color: #1f2937;
                      line-height: 1.4;
                      font-weight: 500;
                      font-size: 1rem;
                    }

                    .ingredient-bullet {
                      color: #166534;
                      font-weight: 700;
                      margin-right: 0.5rem;
                    }

                    .ingredient-amount {
                      font-weight: 700;
                      color: #166534;
                      font-size: 0.95rem;
                      margin-left: 1.5rem;
                      padding-left: 0.5rem;
                      border-left: 3px solid #dcfce7;
                    }

                    /* На таблет може да използваме малко по-компактен стил */
                    @media (min-width: 768px) {
                      .ingredient-row {
                        padding: 0.625rem 0;
                      }
                      .ingredients-wrapper {
                        gap: 0.625rem;
                      }
                    }
                  `}</style>

                  <div className="ingredients-wrapper">
                    {recipeData.ingredients.map((ingredient, index) => (
                      <div className="ingredient-row" key={index}>
                        <span className="ingredient-item">
                          <span className="ingredient-bullet">•</span>
                          {ingredient.item}
                        </span>
                        <span className="ingredient-amount">
                          {ingredient.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions - Compact & Mobile-First */}
                <div>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 'bold', 
                    color: '#166534', 
                    marginBottom: '0.75rem' 
                  }}>
                    {t.steps || 'Стъпки за приготвяне'}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {recipeData.instructions.map((instruction) => (
                      <div
                        key={instruction.step}
                        style={{
                          backgroundColor: '#f9fafb',
                          borderRadius: '0.75rem',
                          padding: '1rem',
                          borderLeft: '4px solid #166534'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                          <div style={{
                            flexShrink: 0,
                            width: '2rem',
                            height: '2rem',
                            borderRadius: '50%',
                            backgroundColor: '#166534',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                          }}>
                            {instruction.step}
                          </div>
                          <div style={{ flex: 1, paddingTop: '0.125rem' }}>
                            <h4 style={{ 
                              fontWeight: '600', 
                              color: '#166534', 
                              marginBottom: '0.375rem',
                              fontSize: '0.95rem'
                            }}>
                              {instruction.title}
                            </h4>
                            <p style={{ 
                              color: '#4b5563', 
                              lineHeight: '1.5', 
                              margin: 0,
                              fontSize: '0.9rem'
                            }}>
                              {instruction.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tips' && (
              <div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold', 
                  color: '#166534', 
                  marginBottom: '0.75rem' 
                }}>
                  {t.professionalTips || 'Професионални съвети'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {recipeData.tips.map((tip, index) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: '#f0fdf4',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        borderLeft: '3px solid #166534',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem'
                      }}
                    >
                      <span style={{
                        color: '#166534',
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        flexShrink: 0,
                        marginTop: '0.125rem'
                      }}>
                        •
                      </span>
                      <p style={{ 
                        color: '#374151', 
                        lineHeight: '1.5', 
                        margin: 0,
                        fontSize: '0.9rem'
                      }}>
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>
            {t.standardRecipe || 'Стандартизирана професионална рецепта'}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>
            {recipeData.company} • {t.version || 'Версия'} {recipeData.version} • {recipeData.date}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DunerOrient;