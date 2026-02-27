// src/components/recipes/categories/duner/DunerOrient.jsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../../context/LanguageContext';
import { translations } from '../../../../translations/translations';

const DS = {
  color: {
    bg: '#ECEEED', surface: '#FFFFFF', surfaceAlt: '#F7F9F8',
    primary: '#1B5E37', primaryLight: '#2D7A4F', primaryGlow: 'rgba(27,94,55,0.08)',
    cardHeader: '#E8F5EE',
    graphite: '#1E2A26', graphiteMed: '#3D4F48', graphiteLight: '#6B7D76', graphiteMuted: '#95A39D',
    ok: '#1B8A50', okBg: '#E8F5EE',
    warning: '#C47F17', warningBg: '#FFFBEB',
    danger: '#C53030', dangerBg: '#FFF5F5',
    border: '#D5DDD9', borderLight: '#E4EBE7',
  },
  font: "'DM Sans', system-ui, sans-serif",
  radius: '0px',
  shadow: { sm: '0 1px 3px rgba(30,42,38,0.06),0 1px 2px rgba(30,42,38,0.04)', md: '0 4px 12px rgba(30,42,38,0.08)' },
};
const LOGO = 'https://aladinfoods.bg/assets/images/aladinfoods_logo.png';
const CSS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');*,*::before,*::after{box-sizing:border-box}body{margin:0;background:${DS.color.bg}}@keyframes cf{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes stagger{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@media(max-width:767px){input,button,select,textarea{font-size:16px!important}}`;

// Inline SVG icons (no lucide)
const ic = {
  back: (c = '#fff') => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>,
  heart: (c, filled) => <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? c : 'none'} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  star: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill={c} stroke={c} strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  users: (c, sz = 18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  clock: (c, sz = 18) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  play: (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  dot: (c) => <svg width="14" height="14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill={c}/></svg>,
  check: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

const useR = () => { const [w, sW] = useState(window.innerWidth); useEffect(() => { const h = () => sW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []); return w < 768; };

const DunerOrient = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  const mob = useR();
  const pad = mob ? '12px' : '20px';
  const [activeTab, setActiveTab] = useState('recipe');
  const [isFavorite, setIsFavorite] = useState(false);
  const [hoverFav, setHoverFav] = useState(false);
  const [hoverStep, setHoverStep] = useState(null);
  const [hoverTip, setHoverTip] = useState(null);

  // === ALL DATA 1:1 UNCHANGED ===
  const recipeData = {
    title: t.dunerOrient || "ДЮНЕР ОРИЕНТ",
    description: t.dunerOrientDesc || "Професионална рецепта от АЛАДИН ФУУДС за автентичен дюнер със специален сос и пресни съставки",
    image: "https://www.aladinfoods.bg/files/images/2643/Orient_1160x1000.png",
    video: "https://drive.google.com/file/d/1zClbvNSSqhi3ONHUik1msDaiitEVqktJ/preview",
    servings: 1,
    rating: 4.9,
    company: "АЛАДИН ФУУДС ООД",
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
      { step: 1, title: t.spreadTortilla || "Намазване на тортилата", description: t.spreadTortillaDesc || "Тортила Аладин (25 cm) се намазва по средата със сос за дюнер 'Ориент' (около 60g)." },
      { step: 2, title: t.addPicklesFries || "Добавяне на краставички и картофи", description: t.addPicklesFriesDesc || "Добавят се нарязани кисели краставички (около 30g) и пресни пържени картофи (около 60g)." },
      { step: 3, title: t.addMeat || "Добавяне на месото", description: t.addMeatDesc || "Последно се добавя пилешко месо от шиша (около 120g)." },
      { step: 4, title: t.foldTortilla || "Сгъване на тортилата", description: t.foldTortillaDesc || "Сгънатата тортила с всички съставки се извършва по специалния начин за дюнер." },
      { step: 5, title: t.grill || "Запичане", description: t.grillDesc || "Сгънатата тортила се запича за около минута от двете страни (до готовност) върху скарата с малко количество червен сос за дюнер и слънчогледово олио." },
      { step: 6, title: t.packaging || "Опаковане", description: t.packagingDesc || "Запеченият дюнер 'Ориент' се опакова в каширано алуминиево фолио." }
    ],
    tips: [
      t.tip1 || "Тортилата трябва да се намазва равномерно по средата",
      t.tip2 || "Картофите да са пресно пържени за по-добър вкус",
      t.tip3 || "Месото от шиша да е топло при добавяне",
      t.tip4 || "Запичането трябва да е кратко - само до готовност",
      t.tip5 || "Фолиото помага за по-лесно консумиране"
    ]
  };

  const tabs = [
    { id: 'recipe', label: t.recipe || 'Рецепта' },
    { id: 'tips', label: t.tips || 'Съвети' },
  ];

  return (<><style>{CSS}</style>
    <div style={{ minHeight: '100vh', backgroundColor: DS.color.bg, fontFamily: DS.font, color: DS.color.graphite }}>

      {/* ═══ DARK TOP BAR (48px) ═══ */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: DS.color.graphite,
        padding: '0 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '48px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ADE80' }} />
          <span style={{ fontFamily: DS.font, fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>v{recipeData.version}</span>
        </div>
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          onMouseEnter={() => setHoverFav(true)}
          onMouseLeave={() => setHoverFav(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px',
            backgroundColor: hoverFav ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: DS.radius,
            cursor: 'pointer', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: '#fff',
            transition: 'all 0.15s',
          }}
        >
          {ic.heart(isFavorite ? '#F87171' : 'rgba(255,255,255,0.6)', isFavorite)}
        </button>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: pad }}>

        {/* ═══ LOGO + TITLE HEADER ═══ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: mob ? '10px' : '14px', marginBottom: '16px', animation: 'cf 0.4s ease' }}>
          <img src={LOGO} alt="Aladin Foods" style={{ height: mob ? '36px' : '48px', objectFit: 'contain', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
          <div>
            <h1 style={{ fontFamily: DS.font, fontSize: mob ? '16px' : '22px', fontWeight: 700, color: DS.color.primary, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.2, textTransform: 'uppercase' }}>
              {recipeData.title}
            </h1>
            <p style={{ fontFamily: DS.font, fontSize: mob ? '10px' : '12px', color: DS.color.graphiteLight, fontWeight: 500, margin: '3px 0 0' }}>
              {recipeData.company} • {recipeData.date}
            </p>
          </div>
        </div>

        {/* ═══ HERO CARD ═══ */}
        <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, overflow: 'hidden', marginBottom: '12px', animation: 'cf 0.4s ease' }}>
          {/* Product Image */}
          <div style={{ position: 'relative' }}>
            <img src={recipeData.image} alt={recipeData.title} style={{ width: '100%', height: 'auto', maxHeight: '280px', objectFit: 'cover', display: 'block' }} />
            <div style={{
              position: 'absolute', top: '10px', right: '10px',
              backgroundColor: DS.color.surface, padding: '4px 10px',
              borderRadius: DS.radius, boxShadow: DS.shadow.md,
              display: 'flex', alignItems: 'center', gap: '4px',
              border: `1px solid ${DS.color.borderLight}`,
            }}>
              {ic.star('#EAB308')}
              <span style={{ fontFamily: DS.font, fontWeight: 700, fontSize: '13px', color: DS.color.graphite }}>{recipeData.rating}</span>
            </div>
          </div>

          <div style={{ padding: pad }}>
            <p style={{ fontFamily: DS.font, fontSize: '13px', color: DS.color.graphiteMed, lineHeight: 1.6, margin: '0 0 14px' }}>
              {recipeData.description}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { icon: ic.users(DS.color.primary), value: recipeData.servings, label: t.servings || 'порция' },
                { icon: ic.clock(DS.color.primary), value: '3', label: t.minutes || 'минути' },
              ].map((item, i) => (
                <div key={i} style={{
                  backgroundColor: DS.color.cardHeader, borderRadius: DS.radius,
                  padding: '10px', textAlign: 'center', border: `1px solid ${DS.color.borderLight}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>{item.icon}</div>
                  <div style={{ fontFamily: DS.font, fontWeight: 700, color: DS.color.primary, fontSize: '18px' }}>{item.value}</div>
                  <div style={{ fontFamily: DS.font, fontSize: '10px', color: DS.color.graphiteMuted, marginTop: '2px' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ VIDEO CARD ═══ */}
        {recipeData.video && (
          <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, overflow: 'hidden', marginBottom: '12px', animation: 'cf 0.4s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}` }}>
              {ic.play(DS.color.primary)}
              <span style={{ fontFamily: DS.font, fontSize: '12px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                {t.videoGuide || 'Видео ръководство'}
              </span>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
              <iframe src={recipeData.video} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </div>
        )}

        {/* ═══ TABS CARD ═══ */}
        <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, overflow: 'hidden', marginBottom: '12px', animation: 'cf 0.4s ease' }}>
          <div style={{ display: 'flex', borderBottom: `2px solid ${DS.color.borderLight}` }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                flex: 1, padding: '12px', border: 'none',
                backgroundColor: activeTab === tab.id ? DS.color.cardHeader : DS.color.surface,
                color: activeTab === tab.id ? DS.color.primary : DS.color.graphiteMuted,
                fontFamily: DS.font, fontSize: '13px', fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? `3px solid ${DS.color.primary}` : '3px solid transparent',
                transition: 'all 0.15s', textTransform: 'uppercase', letterSpacing: '0.02em',
              }}>{tab.label}</button>
            ))}
          </div>

          <div style={{ padding: pad }}>
            {/* ═══ RECIPE TAB ═══ */}
            {activeTab === 'recipe' && (
              <div>
                {/* #E8F5EE section header — Ingredients */}
                <div style={{ backgroundColor: DS.color.cardHeader, padding: '10px 14px', marginBottom: '1px', borderBottom: `1px solid ${DS.color.borderLight}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {ic.dot(DS.color.primary)}
                  <span style={{ fontFamily: DS.font, fontSize: '12px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    {t.ingredients || 'Съставки'}
                  </span>
                  <span style={{ fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteMuted, marginLeft: 'auto' }}>
                    {recipeData.ingredients.length} {t.items || 'артикула'}
                  </span>
                </div>

                {/* Zebra rows (DS table style) */}
                <div style={{ marginBottom: '20px' }}>
                  {recipeData.ingredients.map((ingredient, index) => (
                    <div key={index} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: index % 2 === 0 ? DS.color.surface : DS.color.surfaceAlt,
                      borderBottom: `1px solid ${DS.color.borderLight}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {ic.check(DS.color.ok)}
                        <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 500, color: DS.color.graphite }}>{ingredient.item}</span>
                      </div>
                      <span style={{
                        fontFamily: DS.font, fontSize: '12px', fontWeight: 700, color: DS.color.primary,
                        backgroundColor: DS.color.cardHeader, padding: '2px 8px', borderRadius: DS.radius, whiteSpace: 'nowrap',
                      }}>{ingredient.amount}</span>
                    </div>
                  ))}
                </div>

                {/* #E8F5EE section header — Instructions */}
                <div style={{ backgroundColor: DS.color.cardHeader, padding: '10px 14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {ic.dot(DS.color.primary)}
                  <span style={{ fontFamily: DS.font, fontSize: '12px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    {t.steps || 'Стъпки за приготвяне'}
                  </span>
                </div>

                {/* Instruction cards with stagger + hover */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recipeData.instructions.map((instruction) => {
                    const isHov = hoverStep === instruction.step;
                    return (
                      <div key={instruction.step}
                        onMouseEnter={() => setHoverStep(instruction.step)}
                        onMouseLeave={() => setHoverStep(null)}
                        style={{
                          backgroundColor: DS.color.surfaceAlt, borderRadius: DS.radius,
                          padding: mob ? '10px' : '14px',
                          borderLeft: `4px solid ${DS.color.primary}`,
                          transition: 'all 0.15s',
                          transform: isHov ? 'translateX(4px)' : 'translateX(0)',
                          boxShadow: isHov ? `0 2px 8px ${DS.color.primaryGlow}` : 'none',
                          animation: `stagger 0.3s ease ${instruction.step * 40}ms both`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <div style={{
                            flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%',
                            backgroundColor: DS.color.primary,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontFamily: DS.font, fontWeight: 700, fontSize: '13px',
                          }}>{instruction.step}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: DS.font, fontWeight: 600, color: DS.color.primary, fontSize: '13px', marginBottom: '4px' }}>{instruction.title}</div>
                            <div style={{ fontFamily: DS.font, color: DS.color.graphiteMed, lineHeight: 1.55, fontSize: '12px' }}>{instruction.description}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ═══ TIPS TAB ═══ */}
            {activeTab === 'tips' && (
              <div>
                <div style={{ backgroundColor: DS.color.cardHeader, padding: '10px 14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {ic.dot(DS.color.primary)}
                  <span style={{ fontFamily: DS.font, fontSize: '12px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    {t.professionalTips || 'Професионални съвети'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {recipeData.tips.map((tip, index) => {
                    const isHov = hoverTip === index;
                    return (
                      <div key={index}
                        onMouseEnter={() => setHoverTip(index)}
                        onMouseLeave={() => setHoverTip(null)}
                        style={{
                          backgroundColor: DS.color.cardHeader, borderRadius: DS.radius,
                          padding: '10px 14px', borderLeft: `3px solid ${DS.color.primary}`,
                          display: 'flex', alignItems: 'flex-start', gap: '8px',
                          transition: 'all 0.15s',
                          transform: isHov ? 'translateX(4px)' : 'translateX(0)',
                          animation: `stagger 0.3s ease ${index * 40}ms both`,
                        }}
                      >
                        <div style={{
                          flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%',
                          backgroundColor: DS.color.primary,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontFamily: DS.font, fontWeight: 700, fontSize: '11px',
                        }}>{index + 1}</div>
                        <span style={{ fontFamily: DS.font, color: DS.color.graphiteMed, lineHeight: 1.55, fontSize: '12px', paddingTop: '2px' }}>{tip}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══ FOOTER ═══ */}
        <div style={{ textAlign: 'center', padding: '16px', fontFamily: DS.font, animation: 'cf 0.5s ease' }}>
          <p style={{ fontSize: '11px', color: DS.color.graphiteLight, margin: '0 0 2px' }}>{t.standardRecipe || 'Стандартизирана професионална рецепта'}</p>
          <p style={{ fontSize: '10px', color: DS.color.graphiteMuted, margin: '0 0 6px' }}>{recipeData.company} • {t.version || 'Версия'} {recipeData.version} • {recipeData.date}</p>
          <p style={{ fontSize: '10px', color: DS.color.graphiteMuted, margin: 0, borderTop: `1px solid ${DS.color.borderLight}`, paddingTop: '8px' }}>© 2026 Aladin Foods | by MG</p>
        </div>
      </div>
    </div></>);
};

export default DunerOrient;