// src/components/templates/PizzaTemperatureControl.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM
   ═══════════════════════════════════════════════════════════════ */
const DS = {
  color: {
    bg: '#ECEEED', bgWarm: '#F4F6F5', surface: '#FFFFFF', surfaceAlt: '#F7F9F8',
    primary: '#1B5E37', primaryLight: '#2D7A4F', primaryGlow: 'rgba(27,94,55,0.08)',
    cardHeader: '#E8F5EE',
    graphite: '#1E2A26', graphiteMed: '#3D4F48', graphiteLight: '#6B7D76', graphiteMuted: '#95A39D',
    sage: '#A8BFB2', sageMuted: '#C5D5CB', sageLight: '#DDE8E1',
    ok: '#1B8A50', okBg: '#E8F5EE', okLight: '#D1FAE5',
    warning: '#C47F17', warningBg: '#FEF3C7',
    danger: '#C53030', dangerBg: '#FEE2E2',
    pending: '#6B7D76', pendingBg: '#F0F2F1',
    border: '#D5DDD9', borderLight: '#E4EBE7',
    blue: '#2563EB', blueBg: '#EFF6FF',
  },
  font: "'DM Sans', system-ui, sans-serif",
  radius: '0px',
  shadow: {
    sm: '0 1px 3px rgba(30,42,38,0.06),0 1px 2px rgba(30,42,38,0.04)',
    md: '0 4px 12px rgba(30,42,38,0.06),0 1px 4px rgba(30,42,38,0.04)',
    glow: '0 0 20px rgba(27,94,55,0.15),0 4px 12px rgba(30,42,38,0.06)',
  },
};

const LOGO_URL = 'https://aladinfoods.bg/assets/images/aladinfoods_logo.png';

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  @keyframes ctrlFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ctrlBreathe { 0%,100%{box-shadow:${DS.shadow.glow}} 50%{box-shadow:0 0 24px rgba(27,94,55,0.25),0 4px 16px rgba(30,42,38,0.08)} }
  @keyframes warnPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes chipPop { 0%{transform:scale(0.95)} 50%{transform:scale(1.03)} 100%{transform:scale(1)} }
  body { margin: 0; background: ${DS.color.bg}; }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
`;

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE HOOK
   ═══════════════════════════════════════════════════════════════ */
const useResponsive = () => {
  const [state, setState] = useState({ isMobile: window.innerWidth < 768, isLandscape: window.innerWidth > window.innerHeight });
  useEffect(() => {
    const onResize = () => setState({ isMobile: window.innerWidth < 768, isLandscape: window.innerWidth > window.innerHeight });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', () => setTimeout(onResize, 100));
    return () => { window.removeEventListener('resize', onResize); };
  }, []);
  return state;
};

/* ═══════════════════════════════════════════════════════════════
   SVG ICONS (inline, no lucide dependency)
   ═══════════════════════════════════════════════════════════════ */
const Icon = ({ name, size = 16, color = 'currentColor', style: s }) => {
  const paths = {
    back: <><polyline points="15 18 9 12 15 6" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    thermometer: <><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" /></>,
    pizza: <><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20" /><path d="M2 12h20" /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    minus: <><line x1="5" y1="12" x2="19" y2="12" /></>,
    check: <><polyline points="20 6 9 17 4 12" /></>,
    x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    repeat: <><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></>,
    save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
    barChart: <><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></>,
    alert: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>,
    wifi: <><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></>,
    wifiOff: <><line x1="1" y1="1" x2="23" y2="23" /><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" /><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" /><path d="M10.71 5.05A16 16 0 0 1 22.56 9" /><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></>,
    zap: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></>,
    rotateCcw: <><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s}>
      {paths[name]}
    </svg>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CLOCK FACE TIME PICKER (5-min steps)
   ═══════════════════════════════════════════════════════════════ */
const ClockFacePicker = ({ value, onChange, label: cfLabel }) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('hour');
  const [selHour, setSelHour] = useState(null);
  const [selMin, setSelMin] = useState(null);
  const [dragging, setDragging] = useState(false);
  const clockRef = useRef(null);

  const hourVal = value ? value.split(':')[0] || '' : '';
  const minVal = value ? value.split(':')[1] || '' : '';
  const hasVal = hourVal !== '' && minVal !== '';

  const openPicker = () => {
    setSelHour(hourVal ? parseInt(hourVal, 10) : null);
    setSelMin(minVal ? parseInt(minVal, 10) : 0);
    setMode('hour');
    setOpen(true);
  };

  const confirm = () => {
    if (selHour !== null) {
      const h = String(selHour).padStart(2, '0');
      const m = String(selMin ?? 0).padStart(2, '0');
      onChange(`${h}:${m}`);
    }
    setOpen(false);
  };

  const SIZE = 260, CENTER = SIZE / 2, OUTER_R = 105, INNER_R = 70;
  const outerHours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const innerHours = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  const minuteMarks = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const getPos = (index, radius) => {
    const angle = (index / 12) * 2 * Math.PI - Math.PI / 2;
    return { x: CENTER + radius * Math.cos(angle), y: CENTER + radius * Math.sin(angle) };
  };

  const getAngleFromEvent = (e) => {
    if (!clockRef.current) return { angle: 0, dist: 0 };
    const rect = clockRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - cx, dy = clientY - cy;
    let angle = Math.atan2(dy, dx) + Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;
    return { angle, dist: Math.sqrt(dx * dx + dy * dy) };
  };

  const handleClockInteraction = (e) => {
    const { angle, dist } = getAngleFromEvent(e);
    const scaledDist = (dist / (clockRef.current.getBoundingClientRect().width / 2)) * CENTER;
    if (mode === 'hour') {
      const sector = Math.round((angle / (2 * Math.PI)) * 12) % 12;
      setSelHour(scaledDist < (OUTER_R + INNER_R) / 2 ? innerHours[sector] : outerHours[sector]);
    } else {
      setSelMin(minuteMarks[Math.round((angle / (2 * Math.PI)) * 12) % 12]);
    }
  };

  const handlePointerDown = (e) => { setDragging(true); handleClockInteraction(e); };
  const handlePointerMove = (e) => { if (dragging) handleClockInteraction(e); };
  const handlePointerUp = () => {
    if (dragging) { setDragging(false); if (mode === 'hour') setTimeout(() => setMode('minute'), 200); }
  };

  const getHandAngle = () => {
    if (mode === 'hour' && selHour !== null) return ((selHour % 12) / 12) * 360 - 90;
    if (mode === 'minute' && selMin !== null) return (selMin / 60) * 360 - 90;
    return -90;
  };
  const handLen = mode === 'hour' ? (selHour !== null && innerHours.includes(selHour) ? INNER_R : OUTER_R) : OUTER_R;
  const handRad = (getHandAngle() * Math.PI) / 180;
  const handEndX = CENTER + handLen * Math.cos(handRad);
  const handEndY = CENTER + handLen * Math.sin(handRad);
  const showHand = mode === 'hour' ? selHour !== null : selMin !== null;

  return (
    <div>
      {cfLabel && <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{cfLabel}</label>}
      <div onClick={openPicker} style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', cursor: 'pointer',
        backgroundColor: DS.color.surfaceAlt, border: `1.5px solid ${DS.color.borderLight}`,
        borderRadius: DS.radius, transition: 'all 150ms', minWidth: '100px',
      }}>
        <span style={{ fontSize: '18px', fontWeight: 700, color: hasVal ? DS.color.graphite : DS.color.graphiteMuted, letterSpacing: '0.05em', fontFamily: DS.font }}>
          {hasVal ? `${hourVal.padStart(2, '0')}:${minVal.padStart(2, '0')}` : '-- : --'}
        </span>
        <Icon name="clock" size={16} color={DS.color.graphiteMuted} />
      </div>
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(30,42,38,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 9999, padding: '16px',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: '340px', backgroundColor: DS.color.surface,
            borderRadius: '16px 16px 0 0', overflow: 'hidden', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
          }}>
            <div style={{ backgroundColor: DS.color.primary, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              {[{ val: selHour, m: 'hour' }, null, { val: selMin, m: 'minute' }].map((item, i) =>
                item === null ? <span key="sep" style={{ fontSize: '40px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', lineHeight: 1 }}>:</span> :
                <span key={i} onClick={() => setMode(item.m)} style={{ fontSize: '40px', fontWeight: 700, fontFamily: DS.font, color: mode === item.m ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer', lineHeight: 1 }}>
                  {item.val !== null ? String(item.val).padStart(2, '0') : '--'}
                </span>
              )}
            </div>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
              <div ref={clockRef}
                onMouseDown={handlePointerDown} onMouseMove={handlePointerMove} onMouseUp={handlePointerUp} onMouseLeave={() => setDragging(false)}
                onTouchStart={handlePointerDown} onTouchMove={handlePointerMove} onTouchEnd={handlePointerUp}
                style={{ width: SIZE, height: SIZE, borderRadius: '50%', backgroundColor: '#F0F4F2', position: 'relative', cursor: 'pointer', touchAction: 'none', userSelect: 'none' }}
              >
                <div style={{ position: 'absolute', left: CENTER - 4, top: CENTER - 4, width: 8, height: 8, borderRadius: '50%', backgroundColor: DS.color.primary, zIndex: 3 }} />
                {showHand && (
                  <svg style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }} width={SIZE} height={SIZE}>
                    <line x1={CENTER} y1={CENTER} x2={handEndX} y2={handEndY} stroke={DS.color.primary} strokeWidth="2" />
                    <circle cx={handEndX} cy={handEndY} r="18" fill={DS.color.primary} opacity="0.15" />
                  </svg>
                )}
                {mode === 'hour' ? (<>
                  {outerHours.map((h, i) => { const p = getPos(i, OUTER_R); const s = selHour === h; return (
                    <div key={`o${h}`} style={{ position: 'absolute', left: p.x - 18, top: p.y - 18, width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: s ? 700 : 500, fontFamily: DS.font, color: s ? 'white' : DS.color.graphite, backgroundColor: s ? DS.color.primary : 'transparent', transition: 'all 150ms', zIndex: 4 }}>{h}</div>
                  ); })}
                  {innerHours.map((h, i) => { const p = getPos(i, INNER_R); const s = selHour === h; return (
                    <div key={`i${h}`} style={{ position: 'absolute', left: p.x - 16, top: p.y - 16, width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: s ? 700 : 500, fontFamily: DS.font, color: s ? 'white' : DS.color.graphiteMuted, backgroundColor: s ? DS.color.primary : 'transparent', transition: 'all 150ms', zIndex: 4 }}>{String(h).padStart(2, '0')}</div>
                  ); })}
                </>) : (<>
                  {minuteMarks.map((m, i) => { const p = getPos(i, OUTER_R); const s = selMin === m; return (
                    <div key={`m${m}`} style={{ position: 'absolute', left: p.x - 18, top: p.y - 18, width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: s ? 700 : 500, fontFamily: DS.font, color: s ? 'white' : DS.color.graphite, backgroundColor: s ? DS.color.primary : 'transparent', transition: 'all 150ms', zIndex: 4 }}>{String(m).padStart(2, '0')}</div>
                  ); })}
                </>)}
              </div>
            </div>
            <div style={{ padding: '12px 24px 24px', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setOpen(false)} style={{ padding: '10px 20px', border: 'none', borderRadius: DS.radius, backgroundColor: 'transparent', color: DS.color.graphiteMed, fontFamily: DS.font, fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Отказ</button>
              <button onClick={confirm} style={{ padding: '10px 24px', border: 'none', borderRadius: DS.radius, backgroundColor: DS.color.primary, color: 'white', fontFamily: DS.font, fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>Потвърди</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TEMP SLIDER (adapted for pizza: 85-95°C)
   ═══════════════════════════════════════════════════════════════ */
const PizzaTempSlider = ({ value, onChange, minTemp, maxTemp }) => {
  const [manualMode, setManualMode] = useState(false);
  const [manualVal, setManualVal] = useState('');
  const sliderId = useRef(`pts_${Math.random().toString(36).slice(2, 8)}`).current;
  const numVal = value !== '' && value !== null ? parseFloat(value) : null;
  const hasVal = numVal !== null && !isNaN(numVal);

  const pad = 5;
  const sliderMin = minTemp - pad;
  const sliderMax = maxTemp + pad;
  const toPercent = (v) => ((v - sliderMin) / (sliderMax - sliderMin)) * 100;
  const okLeft = Math.max(0, toPercent(minTemp));
  const okRight = Math.min(100, toPercent(maxTemp));
  const thumbPos = hasVal ? Math.max(0, Math.min(100, toPercent(numVal))) : 50;

  const isInRange = hasVal && numVal >= minTemp && numVal <= maxTemp;
  const thumbColor = !hasVal ? DS.color.graphiteMuted : isInRange ? DS.color.ok : DS.color.danger;

  const handleSlider = (e) => {
    const raw = parseFloat(e.target.value);
    onChange(Math.round(raw));
  };

  const enterManual = () => { setManualVal(hasVal ? String(numVal) : ''); setManualMode(true); };
  const exitManual = () => {
    if (manualVal.trim()) { const p = parseInt(manualVal, 10); if (!isNaN(p)) onChange(p); }
    setManualMode(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%' }}>
      <div onClick={enterManual} style={{
        padding: '6px 16px', borderRadius: DS.radius, cursor: 'pointer',
        backgroundColor: !hasVal ? 'transparent' : isInRange ? DS.color.okBg : DS.color.dangerBg,
        border: `2px solid ${!hasVal ? DS.color.borderLight : isInRange ? DS.color.ok : DS.color.danger}`,
        transition: 'all 200ms', minWidth: '80px', textAlign: 'center',
      }}>
        {manualMode ? (
          <input type="number" step="1" value={manualVal}
            onChange={e => setManualVal(e.target.value)}
            onBlur={exitManual} onKeyDown={e => e.key === 'Enter' && exitManual()}
            autoFocus
            style={{ width: '50px', border: 'none', outline: 'none', textAlign: 'center', fontFamily: DS.font, fontSize: '22px', fontWeight: 700, color: DS.color.graphite, backgroundColor: 'transparent' }} />
        ) : (
          <span style={{ fontFamily: DS.font, fontSize: '22px', fontWeight: 700, color: !hasVal ? DS.color.graphiteMuted : isInRange ? DS.color.primary : DS.color.danger }}>
            {hasVal ? numVal : '—'}
            {hasVal && <span style={{ fontSize: '12px', fontWeight: 600, color: DS.color.graphiteMuted, marginLeft: '1px' }}>°C</span>}
          </span>
        )}
      </div>

      <div style={{ width: '100%', position: 'relative', height: '32px', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: '8px', top: '50%', transform: 'translateY(-50%)', backgroundColor: DS.color.borderLight, borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${okLeft}%`, width: `${okRight - okLeft}%`, backgroundColor: 'rgba(27,138,80,0.25)', borderRadius: '4px' }} />
          {hasVal && <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${thumbPos}%`, backgroundColor: `${thumbColor}40`, borderRadius: '4px 0 0 4px' }} />}
        </div>
        <input type="range" min={sliderMin} max={sliderMax} step={1}
          value={hasVal ? numVal : (sliderMin + sliderMax) / 2}
          onChange={handleSlider}
          className={sliderId}
          style={{ width: '100%', height: '32px', position: 'relative', zIndex: 2, WebkitAppearance: 'none', appearance: 'none', background: 'transparent', cursor: 'pointer' }} />
        <style>{`
          .${sliderId}::-webkit-slider-thumb {
            -webkit-appearance: none; width: 28px; height: 28px; border-radius: 50%;
            background: ${thumbColor}; border: 3px solid white; box-shadow: 0 1px 6px rgba(0,0,0,0.3); cursor: pointer;
          }
          .${sliderId}::-moz-range-thumb {
            width: 28px; height: 28px; border-radius: 50%;
            background: ${thumbColor}; border: 3px solid white; box-shadow: 0 1px 6px rgba(0,0,0,0.3); cursor: pointer;
          }
          .${sliderId}::-webkit-slider-runnable-track { height: 8px; background: transparent; }
          .${sliderId}::-moz-range-track { height: 8px; background: transparent; }
        `}</style>
      </div>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: DS.font, fontSize: '9px', color: DS.color.graphiteMuted }}>{sliderMin}°</span>
        <span style={{ fontFamily: DS.font, fontSize: '9px', color: DS.color.ok, fontWeight: 700 }}>{minTemp}–{maxTemp}°C</span>
        <span style={{ fontFamily: DS.font, fontSize: '9px', color: DS.color.graphiteMuted }}>{sliderMax}°</span>
      </div>

      {hasVal && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <Icon name={isInRange ? 'check' : 'alert'} size={10} color={isInRange ? DS.color.ok : DS.color.danger} />
          <span style={{ fontFamily: DS.font, fontSize: '9px', fontWeight: 700, color: isInRange ? DS.color.ok : DS.color.danger, textTransform: 'uppercase' }}>
            {isInRange ? 'В норма' : 'Извън норма!'}
          </span>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   COUNT STEPPER
   ═══════════════════════════════════════════════════════════════ */
const CountStepper = ({ value, onChange }) => {
  const num = value !== '' && value !== null ? parseInt(value, 10) : 0;
  const btnStyle = (active) => ({
    width: '40px', height: '40px', border: 'none', borderRadius: DS.radius,
    backgroundColor: active ? DS.color.primary : DS.color.surfaceAlt,
    color: active ? 'white' : DS.color.graphiteMuted,
    fontSize: '20px', fontWeight: 700, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 150ms',
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button onClick={() => onChange(Math.max(0, num - 1))} style={btnStyle(num > 0)}>
        <Icon name="minus" size={18} />
      </button>
      <span style={{
        fontFamily: DS.font, fontSize: '24px', fontWeight: 700, color: DS.color.graphite,
        minWidth: '40px', textAlign: 'center',
      }}>{num}</span>
      <button onClick={() => onChange(num + 1)} style={btnStyle(true)}>
        <Icon name="plus" size={18} />
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const PizzaTemperatureControl = ({ template, config, department, restaurantId, onBack }) => {
  const { isMobile } = useResponsive();
  const [now, setNow] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Records: array of { id, pizza, time, temp, count }
  const [records, setRecords] = useState([]);
  // Quick-add form state
  const [selPizza, setSelPizza] = useState('');
  const [selTime, setSelTime] = useState('');
  const [selTemp, setSelTemp] = useState('');
  const [selCount, setSelCount] = useState(1);
  const [editingId, setEditingId] = useState(null);
  // Last added for repeat
  const [lastAdded, setLastAdded] = useState(null);

  const PENDING_KEY = `pending_pizza_${template?.id}`;

  const pizzaTypes = config?.pizza_types || [
    'БАРБЕКЮ Beef', 'БАРБЕКЮ Chicken', 'РИВИЕРА', 'МАРГАРИТА /доматен сос/',
    'МАРГАРИТА /смес за бяла основа/', 'ПЕПЕРОНИ', 'ГОРСКА /шунка и гъби/',
    'КАРБОНАРА', 'ПОЛО', 'БИАНКА', 'КАПРИЧОЗА', 'АСОРТИ', 'ВЪЛЧА'
  ];

  const minTemp = config?.validation?.temp_min || 85;
  const maxTemp = config?.validation?.temp_max || 95;

  // ─── Clock ───
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const onOn = () => setIsOnline(true);
    const onOff = () => setIsOnline(false);
    window.addEventListener('online', onOn); window.addEventListener('offline', onOff);
    return () => { window.removeEventListener('online', onOn); window.removeEventListener('offline', onOff); };
  }, []);

  // ─── Auto-set time to now ───
  useEffect(() => {
    const n = new Date();
    const mins = n.getMinutes();
    const rounded = Math.round(mins / 5) * 5;
    const h = String(n.getHours()).padStart(2, '0');
    const m = String(rounded >= 60 ? 0 : rounded).padStart(2, '0');
    setSelTime(`${h}:${m}`);
  }, []);

  // ─── Draft system ───
  const DRAFT_KEY = `draft_pizza_${template?.id}_${currentDate}`;

  const loadDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const { records: r, timestamp } = JSON.parse(saved);
        if (r && r.length > 0) {
          setRecords(r);
          setAutoSaveStatus(`Зареден драфт от ${new Date(timestamp).toLocaleString('bg-BG')}`);
          setTimeout(() => setAutoSaveStatus(''), 4000);
        }
      }
    } catch (e) { console.error('Draft load error:', e); }
  }, [DRAFT_KEY]);

  useEffect(() => { loadDraft(); }, [loadDraft]);

  const saveDraft = useCallback(() => {
    if (records.length === 0) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ records, timestamp: Date.now() }));
    setAutoSaveStatus('✓ Автозапис');
    setTimeout(() => setAutoSaveStatus(''), 2000);
  }, [records, DRAFT_KEY]);

  useEffect(() => {
    const t = setInterval(saveDraft, 30000);
    return () => clearInterval(t);
  }, [saveDraft]);

  // ─── Offline sync ───
  const getPending = () => { try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); } catch { return []; } };
  const savePendingQ = (q) => localStorage.setItem(PENDING_KEY, JSON.stringify(q));
  const pendingCount = getPending().length;

  const flushPending = useCallback(async () => {
    const queue = getPending();
    if (!queue.length) return;
    const remaining = [];
    for (const item of queue) {
      try { await supabase.from('checklist_submissions').insert(item); } catch { remaining.push(item); }
    }
    savePendingQ(remaining);
  }, []);

  useEffect(() => {
    if (isOnline) flushPending();
    window.addEventListener('online', flushPending);
    return () => window.removeEventListener('online', flushPending);
  }, [isOnline, flushPending]);

  // ─── Helpers ───
  const genId = () => `r_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  const addRecord = () => {
    if (!selPizza) return;
    if (!selTime) return;
    if (selTemp === '' || selTemp === null) return;
    if (selCount < 1) return;

    const rec = { id: genId(), pizza: selPizza, time: selTime, temp: parseInt(selTemp, 10), count: selCount };

    if (editingId) {
      setRecords(prev => prev.map(r => r.id === editingId ? { ...rec, id: editingId } : r));
      setEditingId(null);
    } else {
      setRecords(prev => [...prev, rec]);
    }

    setLastAdded({ pizza: selPizza, temp: parseInt(selTemp, 10) });

    // Reset for next entry: keep pizza, advance time
    const n = new Date();
    const mins = n.getMinutes();
    const rounded = Math.round(mins / 5) * 5;
    setSelTime(`${String(n.getHours()).padStart(2, '0')}:${String(rounded >= 60 ? 0 : rounded).padStart(2, '0')}`);
    setSelCount(1);
    // Keep pizza and temp for fast sequential entry
  };

  const removeRecord = (id) => setRecords(prev => prev.filter(r => r.id !== id));

  const editRecord = (rec) => {
    setSelPizza(rec.pizza);
    setSelTime(rec.time);
    setSelTemp(rec.temp);
    setSelCount(rec.count);
    setEditingId(rec.id);
  };

  const repeatLast = () => {
    if (!lastAdded) return;
    setSelPizza(lastAdded.pizza);
    setSelTemp(lastAdded.temp);
    const n = new Date();
    const mins = n.getMinutes();
    const rounded = Math.round(mins / 5) * 5;
    setSelTime(`${String(n.getHours()).padStart(2, '0')}:${String(rounded >= 60 ? 0 : rounded).padStart(2, '0')}`);
    setSelCount(1);
  };

  // ─── Stats ───
  const getTotalByPizza = (pizza) => records.filter(r => r.pizza === pizza).reduce((s, r) => s + r.count, 0);
  const getTotalAll = () => records.reduce((s, r) => s + r.count, 0);
  const getAvgTempByPizza = (pizza) => {
    const recs = records.filter(r => r.pizza === pizza);
    if (!recs.length) return null;
    return Math.round(recs.reduce((s, r) => s + r.temp, 0) / recs.length);
  };

  // Group records by 30-min slot for display
  const groupBySlot = () => {
    const groups = {};
    records.forEach(r => {
      const [h, m] = r.time.split(':').map(Number);
      const slotMin = m < 30 ? '00' : '30';
      const slotKey = `${String(h).padStart(2, '0')}:${slotMin}`;
      if (!groups[slotKey]) groups[slotKey] = [];
      groups[slotKey].push(r);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  };

  // ─── Clear draft ───
  const clearAll = () => {
    if (window.confirm('Изчистване на всички записи?')) {
      setRecords([]);
      localStorage.removeItem(DRAFT_KEY);
      setAutoSaveStatus('Изчистено');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }
  };

  // ─── Submit ───
  const handleSubmit = async () => {
    if (records.length === 0) return;

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();

      const payload = {
        template_id: template.id,
        restaurant_id: restaurantId,
        department_id: department?.id,
        data: {
          date: currentDate,
          records,
          metadata: {
            total_pizzas: getTotalAll(),
            pizza_breakdown: pizzaTypes.reduce((acc, p) => { const t = getTotalByPizza(p); if (t > 0) acc[p] = t; return acc; }, {}),
          },
        },
        submitted_by: userData?.user?.id,
        submission_date: currentDate,
        synced: true,
      };

      if (isOnline) {
        const { error } = await supabase.from('checklist_submissions').insert(payload);
        if (error) throw error;
      } else {
        const q = getPending(); q.push(payload); savePendingQ(q);
        setAutoSaveStatus('⚠ Запазено офлайн — ще се синхронизира');
      }

      localStorage.removeItem(DRAFT_KEY);
      setRecords([]);
      setAutoSaveStatus(isOnline ? '✓ Запазено успешно!' : '⚠ Офлайн — чака синхронизация');
      setTimeout(() => setAutoSaveStatus(''), 4000);
    } catch (error) {
      console.error('Submit error:', error);
      const q = getPending(); q.push({ template_id: template?.id, data: { date: currentDate, records } }); savePendingQ(q);
      setAutoSaveStatus('⚠ Грешка — запазено офлайн');
      setTimeout(() => setAutoSaveStatus(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  // ─── Export CSV ───
  const exportCSV = () => {
    const rows = [['Вид пица', 'Час', 'Температура', 'Брой'].join(',')];
    records.sort((a, b) => a.time.localeCompare(b.time)).forEach(r => {
      rows.push([`"${r.pizza}"`, r.time, r.temp, r.count].join(','));
    });
    const blob = new Blob(['\ufeff' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pizza-temp-${currentDate}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  // ─── Back handler ───
  const handleBack = () => {
    if (records.length > 0) setShowExitConfirm(true);
    else onBack();
  };

  const confirmExit = (save) => {
    if (save) { saveDraft(); setTimeout(onBack, 800); }
    else onBack();
    setShowExitConfirm(false);
  };

  const grouped = groupBySlot();
  const activePizzas = pizzaTypes.filter(p => getTotalByPizza(p) > 0);

  // Short pizza name for chips
  const shortName = (name) => {
    if (name.length <= 12) return name;
    const clean = name.replace(/\s*\/[^/]*\/\s*/g, '').trim();
    return clean.length <= 12 ? clean : clean.substring(0, 11) + '…';
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: DS.color.bg, fontFamily: DS.font }}>
      <style>{GLOBAL_CSS}</style>

      {/* ═══ DARK TOP BAR ═══ */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: DS.color.graphite, padding: '0 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '48px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={handleBack} style={{
            display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px',
            backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: DS.radius, color: 'white', fontSize: '12px', fontFamily: DS.font,
            fontWeight: 600, cursor: 'pointer',
          }}>
            <Icon name="back" size={14} color="white" /> Назад
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: isOnline ? '#4ADE80' : '#F87171' }} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: 600 }}>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          {pendingCount > 0 && (
            <div style={{ backgroundColor: DS.color.warning, color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700 }}>
              {pendingCount} чакащи
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {autoSaveStatus && (
            <span style={{ color: '#4ADE80', fontSize: '11px', fontWeight: 600 }}>{autoSaveStatus}</span>
          )}
          {records.length > 0 && (
            <div style={{ backgroundColor: DS.color.primary, color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700 }}>
              Драфт ({records.length})
            </div>
          )}
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 600 }}>
            {now.toLocaleString('bg-BG', { hour: '2-digit', minute: '2-digit', ...(isMobile ? {} : { day: '2-digit', month: '2-digit' }), hour12: false })}
          </span>
        </div>
      </div>

      {/* ═══ LOGO + TITLE ═══ */}
      <div style={{ padding: '16px 16px 0', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <img src={LOGO_URL} alt="Aladin" style={{ height: '36px', objectFit: 'contain' }} onError={e => { e.target.style.display = 'none'; }} />
          <div>
            <h1 style={{ margin: 0, fontFamily: DS.font, fontSize: '18px', fontWeight: 700, color: DS.color.graphite }}>
              {template?.name || 'Температурен контрол — Пици'}
            </h1>
            <p style={{ margin: 0, fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteMuted }}>
              {template?.description || 'Час на изпичане / Температура / Брой'}
            </p>
          </div>
        </div>

        {/* Date */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Дата</label>
          <input type="date" value={currentDate} onChange={e => setCurrentDate(e.target.value)}
            style={{
              padding: '10px 14px', fontFamily: DS.font, fontSize: '14px', fontWeight: 600,
              border: `1.5px solid ${DS.color.borderLight}`, borderRadius: DS.radius,
              backgroundColor: DS.color.surfaceAlt, color: DS.color.graphite, outline: 'none',
            }} />
        </div>
      </div>

      <div style={{ padding: '0 16px 120px', maxWidth: '900px', margin: '0 auto' }}>

        {/* ═══ QUICK ADD FORM ═══ */}
        <div style={{
          backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.md,
          overflow: 'hidden', marginBottom: '16px', animation: 'ctrlFadeIn 0.4s ease',
        }}>
          <div style={{ backgroundColor: DS.color.cardHeader, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="plus" size={16} color={DS.color.primary} />
            <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {editingId ? 'Редакция на запис' : 'Добави запис'}
            </span>
            {lastAdded && !editingId && (
              <button onClick={repeatLast} style={{
                marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px', backgroundColor: DS.color.primaryGlow, border: `1px solid ${DS.color.primary}20`,
                borderRadius: DS.radius, fontFamily: DS.font, fontSize: '11px', fontWeight: 600,
                color: DS.color.primary, cursor: 'pointer',
              }}>
                <Icon name="repeat" size={12} color={DS.color.primary} /> Повтори
              </button>
            )}
          </div>

          <div style={{ padding: '16px' }}>
            {/* 1. Pizza chips */}
            <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              Вид пица
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {pizzaTypes.map(p => {
                const active = selPizza === p;
                const count = getTotalByPizza(p);
                return (
                  <button key={p} onClick={() => setSelPizza(p)} style={{
                    padding: '8px 12px', border: `1.5px solid ${active ? DS.color.primary : DS.color.borderLight}`,
                    borderRadius: DS.radius, cursor: 'pointer', transition: 'all 150ms',
                    backgroundColor: active ? DS.color.primary : DS.color.surfaceAlt,
                    color: active ? 'white' : DS.color.graphite,
                    fontFamily: DS.font, fontSize: '12px', fontWeight: active ? 700 : 500,
                    display: 'flex', alignItems: 'center', gap: '5px',
                    animation: active ? 'chipPop 0.2s ease' : 'none',
                    position: 'relative',
                  }}>
                    {shortName(p)}
                    {count > 0 && (
                      <span style={{
                        backgroundColor: active ? 'rgba(255,255,255,0.3)' : DS.color.okBg,
                        color: active ? 'white' : DS.color.ok,
                        padding: '0 5px', borderRadius: '8px', fontSize: '10px', fontWeight: 700, lineHeight: '16px',
                      }}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 2. Time + Temp + Count */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
              gap: '16px', alignItems: 'start',
            }}>
              {/* Time */}
              <div>
                <ClockFacePicker label="Час на изпичане" value={selTime} onChange={setSelTime} />
              </div>

              {/* Temperature */}
              <div>
                <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                  Температура
                </label>
                <PizzaTempSlider value={selTemp} onChange={setSelTemp} minTemp={minTemp} maxTemp={maxTemp} />
              </div>

              {/* Count */}
              <div>
                <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                  Брой пици
                </label>
                <CountStepper value={selCount} onChange={setSelCount} />
              </div>
            </div>

            {/* Add button */}
            <button onClick={addRecord} disabled={!selPizza || !selTime || selTemp === '' || selTemp === null}
              style={{
                width: '100%', marginTop: '16px', padding: '14px', border: 'none', borderRadius: DS.radius,
                backgroundColor: (!selPizza || !selTime || selTemp === '' || selTemp === null) ? DS.color.borderLight : DS.color.primary,
                color: (!selPizza || !selTime || selTemp === '' || selTemp === null) ? DS.color.graphiteMuted : 'white',
                fontFamily: DS.font, fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 150ms',
              }}>
              <Icon name={editingId ? 'check' : 'plus'} size={18} />
              {editingId ? 'Запази промените' : 'Добави запис'}
            </button>
            {editingId && (
              <button onClick={() => { setEditingId(null); setSelPizza(''); setSelTemp(''); setSelCount(1); }}
                style={{
                  width: '100%', marginTop: '8px', padding: '10px', border: `1px solid ${DS.color.borderLight}`,
                  borderRadius: DS.radius, backgroundColor: 'transparent', color: DS.color.graphiteMed,
                  fontFamily: DS.font, fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                }}>
                Отказ от редакция
              </button>
            )}
          </div>
        </div>

        {/* ═══ STATS SUMMARY ═══ */}
        {records.length > 0 && (
          <div style={{
            backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.md,
            overflow: 'hidden', marginBottom: '16px', animation: 'ctrlFadeIn 0.4s ease',
          }}>
            <div style={{ backgroundColor: DS.color.cardHeader, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="barChart" size={16} color={DS.color.primary} />
              <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase' }}>
                Обобщение
              </span>
              <span style={{ marginLeft: 'auto', fontFamily: DS.font, fontSize: '20px', fontWeight: 700, color: DS.color.primary }}>
                {getTotalAll()} <span style={{ fontSize: '11px', fontWeight: 600, color: DS.color.graphiteMuted }}>общо пици</span>
              </span>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {activePizzas.map(p => {
                const avg = getAvgTempByPizza(p);
                const inRange = avg >= minTemp && avg <= maxTemp;
                return (
                  <div key={p} style={{
                    padding: '8px 12px', backgroundColor: DS.color.surfaceAlt,
                    border: `1px solid ${DS.color.borderLight}`, borderRadius: DS.radius,
                    display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '120px',
                  }}>
                    <span style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.primary }}>{shortName(p)}</span>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
                      <span style={{ fontFamily: DS.font, fontSize: '18px', fontWeight: 700, color: DS.color.graphite }}>{getTotalByPizza(p)}</span>
                      <span style={{ fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteMuted }}>бр.</span>
                      {avg !== null && (
                        <span style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: inRange ? DS.color.ok : DS.color.danger }}>
                          ⌀ {avg}°C
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ RECORDS TABLE ═══ */}
        {records.length > 0 && (
          <div style={{
            backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.md,
            overflow: 'hidden', marginBottom: '16px',
          }}>
            <div style={{ backgroundColor: DS.color.cardHeader, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="thermometer" size={16} color={DS.color.primary} />
              <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase' }}>
                Записи ({records.length})
              </span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                <button onClick={exportCSV} style={{
                  display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px',
                  backgroundColor: 'transparent', border: `1px solid ${DS.color.borderLight}`,
                  borderRadius: DS.radius, fontFamily: DS.font, fontSize: '11px', fontWeight: 600,
                  color: DS.color.graphiteMed, cursor: 'pointer',
                }}>
                  <Icon name="download" size={12} /> CSV
                </button>
                <button onClick={clearAll} style={{
                  display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px',
                  backgroundColor: 'transparent', border: `1px solid ${DS.color.danger}30`,
                  borderRadius: DS.radius, fontFamily: DS.font, fontSize: '11px', fontWeight: 600,
                  color: DS.color.danger, cursor: 'pointer',
                }}>
                  <Icon name="rotateCcw" size={12} /> Изчисти
                </button>
              </div>
            </div>

            {/* Grouped by time slot */}
            <div style={{ padding: '8px' }}>
              {grouped.map(([slot, recs]) => (
                <div key={slot} style={{ marginBottom: '8px' }}>
                  <div style={{
                    padding: '6px 12px', backgroundColor: DS.color.bgWarm,
                    fontFamily: DS.font, fontSize: '11px', fontWeight: 700, color: DS.color.graphiteLight,
                    textTransform: 'uppercase', letterSpacing: '0.06em', borderRadius: DS.radius,
                  }}>
                    🕐 {slot}
                  </div>
                  {recs.sort((a, b) => a.time.localeCompare(b.time)).map((rec, i) => {
                    const inRange = rec.temp >= minTemp && rec.temp <= maxTemp;
                    return (
                      <div key={rec.id} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 12px',
                        borderBottom: i < recs.length - 1 ? `1px solid ${DS.color.borderLight}` : 'none',
                        animation: 'slideUp 0.3s ease',
                      }}>
                        {/* Time */}
                        <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.graphiteMed, minWidth: '42px' }}>
                          {rec.time}
                        </span>
                        {/* Pizza name */}
                        <span style={{ flex: 1, fontFamily: DS.font, fontSize: '13px', fontWeight: 600, color: DS.color.graphite, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {rec.pizza}
                        </span>
                        {/* Temp badge */}
                        <span style={{
                          padding: '2px 8px', borderRadius: '10px', fontFamily: DS.font, fontSize: '12px', fontWeight: 700,
                          backgroundColor: inRange ? DS.color.okBg : DS.color.dangerBg,
                          color: inRange ? DS.color.ok : DS.color.danger,
                        }}>
                          {rec.temp}°C
                        </span>
                        {/* Count */}
                        <span style={{
                          padding: '2px 8px', borderRadius: '10px', fontFamily: DS.font, fontSize: '12px', fontWeight: 700,
                          backgroundColor: DS.color.blueBg, color: DS.color.blue,
                        }}>
                          ×{rec.count}
                        </span>
                        {/* Actions */}
                        <button onClick={() => editRecord(rec)} style={{
                          width: '28px', height: '28px', border: 'none', borderRadius: DS.radius,
                          backgroundColor: DS.color.surfaceAlt, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icon name="edit" size={12} color={DS.color.graphiteMuted} />
                        </button>
                        <button onClick={() => removeRecord(rec.id)} style={{
                          width: '28px', height: '28px', border: 'none', borderRadius: DS.radius,
                          backgroundColor: DS.color.surfaceAlt, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icon name="trash" size={12} color={DS.color.danger} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {records.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '40px 20px', color: DS.color.graphiteMuted,
            fontFamily: DS.font, fontSize: '14px',
          }}>
            <Icon name="pizza" size={48} color={DS.color.sageMuted} style={{ margin: '0 auto 12px', display: 'block' }} />
            Няма записи за днес. Изберете пица и добавете първия запис.
          </div>
        )}
      </div>

      {/* ═══ STICKY SUBMIT BAR ═══ */}
      {records.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90,
          backgroundColor: DS.color.surface, borderTop: `1px solid ${DS.color.borderLight}`,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', padding: '12px 16px',
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.graphite }}>
                {records.length} записа • {getTotalAll()} пици
              </span>
            </div>
            <button onClick={handleSubmit} disabled={loading}
              style={{
                padding: '12px 28px', border: 'none', borderRadius: DS.radius,
                backgroundColor: loading ? DS.color.graphiteMuted : DS.color.primary,
                color: 'white', fontFamily: DS.font, fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                animation: !loading ? 'ctrlBreathe 3s ease-in-out infinite' : 'none',
              }}>
              <Icon name="save" size={16} color="white" />
              {loading ? 'Запазване...' : 'Запази'}
            </button>
          </div>
        </div>
      )}

      {/* ═══ EXIT MODAL ═══ */}
      {showExitConfirm && (
        <div onClick={() => setShowExitConfirm(false)} style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(30,42,38,0.5)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9998, padding: '20px',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            backgroundColor: DS.color.surface, borderRadius: DS.radius, padding: '24px',
            maxWidth: '400px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Icon name="alert" size={20} color={DS.color.warning} />
              <h3 style={{ margin: 0, fontFamily: DS.font, fontSize: '16px', fontWeight: 700, color: DS.color.graphite }}>Незапазени данни</h3>
            </div>
            <p style={{ fontFamily: DS.font, fontSize: '14px', color: DS.color.graphiteMed, lineHeight: 1.6, marginBottom: '20px' }}>
              Имате {records.length} незапазени записа. Какво искате?
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button onClick={() => setShowExitConfirm(false)} style={{
                padding: '10px 16px', border: `1px solid ${DS.color.borderLight}`, borderRadius: DS.radius,
                backgroundColor: 'transparent', color: DS.color.graphiteMed, fontFamily: DS.font, fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}>Отказ</button>
              <button onClick={() => confirmExit(false)} style={{
                padding: '10px 16px', border: 'none', borderRadius: DS.radius,
                backgroundColor: DS.color.danger, color: 'white', fontFamily: DS.font, fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}>Изход без запазване</button>
              <button onClick={() => confirmExit(true)} style={{
                padding: '10px 16px', border: 'none', borderRadius: DS.radius,
                backgroundColor: DS.color.primary, color: 'white', fontFamily: DS.font, fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              }}>Запази драфт и излез</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ FOOTER ═══ */}
      <div style={{
        textAlign: 'center', padding: '20px 16px 80px', fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteMuted,
      }}>
        Aladin Foods © {new Date().getFullYear()} • Температурен контрол — Пици
      </div>
    </div>
  );
};

export default PizzaTemperatureControl;

