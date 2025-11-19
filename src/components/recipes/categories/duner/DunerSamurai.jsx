// src/components/recipes/categories/duner/DunerOrient.jsx
import React, { useState } from 'react';
import { Clock, Users, ChefHat, Star, Play, Heart } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { translations } from '../../../../translations/translations';

const DunerSamurai = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  const [activeTab, setActiveTab] = useState('recipe');
  const [isFavorite, setIsFavorite] = useState(false);

  const recipeData = {
    title: t.dunerSamurai || 'ДЮНЕР "САМУРАЙ"',
    description: t.dunerSamuraiDesc || 'Традиционна рецепта за дюнер Самурай с избор от пилешко или телешко месо, червено зеле и специален лют или нелют сос',
    image: 'https://www.aladinfoods.bg/files/images/1768/Samurai_Chicken_NL.png',
    video: 'https://drive.google.com/file/d/1cjM1wbZ2Vkvpgg46B13hlzEz3GdlcfDd/preview',
    servings: 1,
    rating: 4.8,
    company: t.companyName || "АЛАДИН ФУУДС ООД",
    version: "01",
    date: "27.05.2025",
    
    // Съставки
    ingredients: [
      { item: t.tortillaAladin || "Тортила Аладин (25 cm)", amount: "1 бр. (70g)" },
      { item: t.chickenBeefMeat || "Пилешко/телешко месо от плик", amount: "120g" },
      { item: t.samuraiBurgerSauce || "Сос Самурай (лют)/сос Бургер (нелют)", amount: "100g" },
      { item: t.redCabbageMix || "Смес червено зеле, червен лук, салатена заливка, сол", amount: "70g" },
      { item: t.pickledCucumbers || "Кисели краставички", amount: "15g" },
      { item: t.grillOil || "Олио (за скара)", amount: "10ml" }
    ],
    
    instructions: [
      {
        step: 1,
        title: t.prepareRedCabbageMix || "Подготовка на смес от червено зеле и червен лук",
        description: t.prepareRedCabbageMixDesc || "Килограм червено зеле се нарязва на четири части и после на машина с приставка 'Е2' до резени с дебелина 2-3 mm. Половин килограм червен лук се нарязва на ситни полумесеци и се добавя към нарязаното червено зеле, като се прибавя 20g сол и 20g салатена заливка."
      },
      {
        step: 2,
        title: t.grillCabbageMix || "Запичане на зеленчуковата смес",
        description: t.grillCabbageMixDesc || "Готовата смес се обърква ръчно и се запича с малко олио на скара за около 4-5 минути до готовност. Съхранява се в гастронорма."
      },
      {
        step: 3,
        title: t.grillMeatWithCabbage || "Запичане на месото със смес",
        description: t.grillMeatWithCabbageDesc || "Пилешкото или телешкото месо от плик се запича леко на скара, като се прибавя от вече готовата смес от зеле и лук."
      },
      {
        step: 4,
        title: t.addFirstSauceLayer || "Добавяне на първи слой сос",
        description: t.addFirstSauceLayerDesc || "В средата на тортилата се добавят около 50g сос Самурай (лют) или сос Бургер (нелют) - в зависимост от поръчката. Добавят се киселите краставички и месото (пилешко или телешко)."
      },
      {
        step: 5,
        title: t.addSecondSauceLayer || "Добавяне на втори слой сос",
        description: t.addSecondSauceLayerDesc || "Добавят се още около 50g от съответния сос (Самурай или Бургер) отгоре на пълнежа."
      },
      {
        step: 6,
        title: t.foldTortilla || "Сгъване на тортилата",
        description: t.foldTortillaDesc || "Дюнерът се загъва по специалния начин - първо се сгъва долната част нагоре, след това двете страни навътре, образувайки плик."
      },
      {
        step: 7,
        title: t.grillDuner || "Запичане на дюнера",
        description: t.grillDunerDesc || "Тортилата се запича с малко олио на скара за около минута от всяка страна до получаване на приятен златист цвят."
      },
      {
        step: 8,
        title: t.wrapInFoil || "Опаковане",
        description: t.wrapInFoilDesc || "Готовият дюнер се опакова в каширано алуминиево фолио с лого на компанията."
      }
    ],
    
    tips: [
      t.samuraiTip1 || "Червеното зеле трябва да се нареже тънко и равномерно за по-добра текстура",
      t.samuraiTip2 || "Зеленчуковата смес може да се подготви предварително и да се съхранява в хладилник до 3 дни",
      t.samuraiTip3 || "При запичане на зелето внимавайте да не го пържите прекалено - трябва да остане хрупкаво",
      t.samuraiTip4 || "Сос Самурай е лютият вариант, а сос Бургер е нелютият - винаги питайте клиента за предпочитание",
      t.samuraiTip5 || "Месото може да е пилешко или телешко - проверете поръчката внимателно",
      t.samuraiTip6 || "При запичане на скарата използвайте малко олио за да не залепне тортилата",
      t.samuraiTip7 || "Златистият цвят се постига за около 1 минута от всяка страна - не препичайте"
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

export default DunerSamurai;