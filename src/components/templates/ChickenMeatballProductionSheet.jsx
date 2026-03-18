import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Save, Plus, Trash2, CheckSquare, Square, Calendar, Building2, 
  CheckCircle, RotateCcw, FileText, AlertCircle, ChevronLeft, Thermometer
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════ */
const DS = {
  color: {
    bg: '#ECEEED', bgWarm: '#F4F6F5', surface: '#FFFFFF', surfaceAlt: '#F7F9F8',
    primary: '#1B5E37', primaryLight: '#2D7A4F', primaryGlow: 'rgba(27,94,55,0.08)',
    cardHeader: '#E8F5EE',
    graphite: '#1E2A26', graphiteMed: '#3D4F48', graphiteLight: '#6B7D76', graphiteMuted: '#95A39D',
    sage: '#A8BFB2', sageMuted: '#C5D5CB', sageLight: '#DDE8E1',
    ok: '#1B8A50', okBg: '#E8F5EE',
    warning: '#C47F17', warningBg: '#FEF3C7',
    danger: '#C53030', dangerBg: '#FEE2E2',
    pending: '#6B7D76', pendingBg: '#F0F2F1',
    border: '#D5DDD9', borderLight: '#E4EBE7',
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
  @media (max-width: 767px) {
    input, button, select, textarea { font-size: 16px !important; }
  }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${DS.color.sage}; border-radius: 0; }
`;

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE HOOK
   ═══════════════════════════════════════════════════════════════ */
const useResponsive = () => {
  const [screen, setScreen] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onResize = () => setScreen({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', () => setTimeout(onResize, 100));
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);
  return {
    isMobile: screen.w < 768,
    isTablet: screen.w >= 768 && screen.w < 1024,
    isDesktop: screen.w >= 1024,
    isLandscape: screen.w > screen.h,
  };
};

/* ═══════════════════════════════════════════════════════════════
   INPUT STYLE HELPER
   ═══════════════════════════════════════════════════════════════ */
const inputBase = (focused) => ({
  width: '100%', padding: '10px 12px',
  backgroundColor: focused ? DS.color.surface : DS.color.surfaceAlt,
  border: `1.5px solid ${focused ? DS.color.primary : DS.color.borderLight}`,
  borderRadius: DS.radius, fontSize: '14px',
  fontFamily: DS.font, fontWeight: 400,
  color: DS.color.graphite, outline: 'none',
  transition: 'all 150ms ease',
  boxShadow: focused ? `0 0 0 3px ${DS.color.primaryGlow}` : 'none',
  boxSizing: 'border-box', WebkitAppearance: 'none',
});

/* ═══════════════════════════════════════════════════════════════
   REUSABLE INPUT
   ═══════════════════════════════════════════════════════════════ */
const ControlInput = ({ label, type = 'text', value, onChange, placeholder, style: s, ...rest }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ minWidth: 0 }}>
      {label && (
        <label style={{
          display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600,
          color: focused ? DS.color.primary : DS.color.graphiteLight,
          textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px',
          transition: 'color 150ms ease',
        }}>{label}</label>
      )}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ ...inputBase(focused), ...s }}
        {...rest}
      />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TEMPERATURE INPUT — ≥ 72°C вътрешна температура
   ═══════════════════════════════════════════════════════════════ */
const TemperatureInput = ({ value, onChange }) => {
  const [focused, setFocused] = useState(false);

  const numVal = value === '' ? null : parseFloat(value);
  const hasValue = value !== '' && value !== null && value !== undefined;
  const isOk = hasValue && numVal >= 72;
  const isFail = hasValue && numVal < 72;

  const borderColor = focused
    ? DS.color.primary
    : isFail
      ? DS.color.danger
      : isOk
        ? DS.color.ok
        : DS.color.borderLight;

  const bgColor = isFail
    ? DS.color.dangerBg
    : isOk
      ? DS.color.okBg
      : focused
        ? DS.color.surface
        : DS.color.surfaceAlt;

  const boxShadow = focused
    ? `0 0 0 3px ${DS.color.primaryGlow}`
    : isFail
      ? '0 0 0 3px rgba(197,48,48,0.12)'
      : isOk
        ? '0 0 0 3px rgba(27,138,80,0.12)'
        : 'none';

  return (
    <div style={{ minWidth: 0 }}>
      <label style={{
        display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600,
        color: focused ? DS.color.primary : isFail ? DS.color.danger : isOk ? DS.color.ok : DS.color.graphiteLight,
        textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px',
        transition: 'color 150ms ease',
        display: 'flex', alignItems: 'center', gap: '4px',
      }}>
        <Thermometer style={{ width: 11, height: 11 }} />
        Вътрешна температура
      </label>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="0"
          step="0.1"
          style={{
            width: '100%', padding: '10px 56px 10px 12px',
            backgroundColor: bgColor,
            border: `1.5px solid ${borderColor}`,
            borderRadius: DS.radius, fontSize: '14px',
            fontFamily: DS.font, fontWeight: 600,
            color: isFail ? DS.color.danger : isOk ? DS.color.ok : DS.color.graphite,
            outline: 'none', transition: 'all 150ms ease',
            boxShadow, boxSizing: 'border-box', WebkitAppearance: 'none',
          }}
        />

        {/* °C единица */}
        <span style={{
          position: 'absolute', right: hasValue && (isOk || isFail) ? '36px' : '12px',
          fontFamily: DS.font, fontSize: '13px', fontWeight: 700,
          color: isFail ? DS.color.danger : isOk ? DS.color.ok : DS.color.graphiteMuted,
          pointerEvents: 'none', transition: 'all 150ms',
        }}>°C</span>

        {/* Статус икона */}
        {hasValue && (
          <span style={{
            position: 'absolute', right: '10px',
            fontSize: '16px', pointerEvents: 'none',
            transition: 'all 150ms',
          }}>
            {isOk ? '✓' : '✗'}
          </span>
        )}
      </div>

      {/* Изискване / статус банер */}
      <div style={{
        marginTop: '6px',
        padding: '6px 10px',
        backgroundColor: isFail ? DS.color.dangerBg : isOk ? DS.color.okBg : DS.color.surfaceAlt,
        border: `1px solid ${isFail ? 'rgba(197,48,48,0.25)' : isOk ? 'rgba(27,138,80,0.25)' : DS.color.borderLight}`,
        borderRadius: DS.radius,
        display: 'flex', alignItems: 'center', gap: '6px',
        transition: 'all 200ms ease',
      }}>
        <Thermometer style={{
          width: 13, height: 13, flexShrink: 0,
          color: isFail ? DS.color.danger : isOk ? DS.color.ok : DS.color.graphiteMuted,
        }} />
        <span style={{
          fontFamily: DS.font, fontSize: '11px', fontWeight: 600,
          color: isFail ? DS.color.danger : isOk ? DS.color.ok : DS.color.graphiteMuted,
          letterSpacing: '0.01em',
        }}>
          {isFail
            ? `⚠ Недостатъчна! Изисква се ≥ 72°C (сега: ${numVal}°C)`
            : isOk
              ? `✓ Отговаря на изискването ≥ 72°C`
              : 'Изискване: ≥ 72°C вътрешна температура'}
        </span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CLOCK FACE TIME PICKER
   ═══════════════════════════════════════════════════════════════ */
const ClockFacePicker = ({ value, onChange, label: cfLabel, style: cfStyle }) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('hour');
  const [selHour, setSelHour] = useState(null);
  const [selMin, setSelMin] = useState(null);
  const [dragging, setDragging] = useState(false);
  const clockRef = React.useRef(null);

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
    <div style={cfStyle}>
      {cfLabel && <label style={{ display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{cfLabel}</label>}
      <div onClick={openPicker} style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', cursor: 'pointer',
        backgroundColor: DS.color.surfaceAlt, border: `1.5px solid ${DS.color.borderLight}`,
        borderRadius: DS.radius, transition: 'all 150ms', minWidth: '100px',
      }}>
        <span style={{ fontSize: '18px', fontWeight: 700, color: hasVal ? DS.color.graphite : DS.color.graphiteMuted, letterSpacing: '0.05em' }}>
          {hasVal ? `${hourVal.padStart(2, '0')}:${minVal.padStart(2, '0')}` : '-- : --'}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DS.color.graphiteMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
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
              <span onClick={() => setMode('hour')} style={{ fontSize: '40px', fontWeight: 700, fontFamily: DS.font, color: mode === 'hour' ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer', lineHeight: 1 }}>
                {selHour !== null ? String(selHour).padStart(2, '0') : '--'}
              </span>
              <span style={{ fontSize: '40px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', lineHeight: 1 }}>:</span>
              <span onClick={() => setMode('minute')} style={{ fontSize: '40px', fontWeight: 700, fontFamily: DS.font, color: mode === 'minute' ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer', lineHeight: 1 }}>
                {selMin !== null ? String(selMin).padStart(2, '0') : '00'}
              </span>
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

/* ═══ DATE + TIME (Clock Face) ═══ */
const DateTime24Input = ({ label, value, onChange, isMobile }) => {
  const dateVal = value ? value.split('T')[0] || '' : '';
  const rawTime = value && value.includes('T') ? value.split('T')[1] || '' : '';
  const [fd, setFd] = useState(false);

  const buildValue = (d, timeStr) => {
    if (!d) return '';
    if (!timeStr) return `${d}T`;
    return `${d}T${timeStr}`;
  };

  const handleDatePart = (e) => onChange(buildValue(e.target.value, rawTime));
  const handleTimePart = (timeStr) => onChange(buildValue(dateVal || new Date().toISOString().split('T')[0], timeStr));

  return (
    <div style={{ minWidth: 0 }}>
      <label style={{
        display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600,
        color: fd ? DS.color.primary : DS.color.graphiteLight,
        textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px',
        transition: 'color 150ms ease',
      }}>{label}</label>
      <div style={{
        display: 'flex', gap: '8px',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
      }}>
        <input type="date" value={dateVal} onChange={handleDatePart}
          onFocus={() => setFd(true)} onBlur={() => setFd(false)}
          style={{ ...inputBase(fd), flex: 1 }}
        />
        <ClockFacePicker value={rawTime} onChange={handleTimePart} />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PRODUCTION CARD
   ═══════════════════════════════════════════════════════════════ */
const ProductionCard = ({ production, index, displayNumber, onUpdate, onRemove, canRemove, savedEmployees, isMobile, isLandscape, currentDate, manager, onDateChange, onManagerChange }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: DS.color.surface,
        borderRadius: DS.radius,
        border: `1.5px solid ${hovered ? DS.color.sageMuted : DS.color.borderLight}`,
        boxShadow: hovered ? DS.shadow.md : DS.shadow.sm,
        overflow: 'hidden', transition: 'all 200ms ease',
        animation: 'ctrlFadeIn 300ms ease-out both',
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* ─── Card Header ─── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '12px 14px' : '14px 18px',
        backgroundColor: DS.color.cardHeader,
        borderBottom: `1px solid ${DS.color.borderLight}`,
      }}>
        <span style={{
          fontFamily: DS.font,
          fontSize: isMobile ? '14px' : '15px',
          fontWeight: 700,
          color: DS.color.primary,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}>
          Запис № {displayNumber}
        </span>
        {canRemove && (
          <button
            onClick={() => onRemove(production.id)}
            title="Премахни запис"
            style={{
              background: 'transparent', border: `1px solid ${DS.color.borderLight}`,
              cursor: 'pointer', padding: '6px', color: DS.color.graphiteMuted,
              borderRadius: DS.radius, transition: 'all 150ms ease', display: 'flex',
              minWidth: '32px', minHeight: '32px',
              alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = DS.color.danger; e.currentTarget.style.borderColor = DS.color.danger; }}
            onMouseLeave={e => { e.currentTarget.style.color = DS.color.graphiteMuted; e.currentTarget.style.borderColor = DS.color.borderLight; }}
          >
            <Trash2 style={{ width: 16, height: 16 }} />
          </button>
        )}
      </div>

      {/* ─── Дата и Управител ─── */}
      <div style={{
        padding: isMobile ? '12px 14px' : '14px 18px',
        backgroundColor: DS.color.surfaceAlt,
        borderBottom: `1px solid ${DS.color.borderLight}`,
        display: 'flex',
        flexDirection: (isMobile && !isLandscape) ? 'column' : 'row',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          <div style={{ padding: '6px', borderRadius: DS.radius, backgroundColor: DS.color.okBg, flexShrink: 0 }}>
            <Calendar style={{ width: 14, height: 14, color: DS.color.primary }} />
          </div>
          <ControlInput label="Дата" type="date" value={currentDate} onChange={onDateChange} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          <div style={{ padding: '6px', borderRadius: DS.radius, backgroundColor: DS.color.okBg, flexShrink: 0 }}>
            <Building2 style={{ width: 14, height: 14, color: DS.color.primary }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <ControlInput label="Управител" value={manager} onChange={onManagerChange} placeholder="Име и фамилия" />
          </div>
        </div>
      </div>

      {/* ─── Полета ─── */}
      <div style={{
        padding: isMobile ? '12px 14px' : '16px 18px',
        display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px',
      }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <DateTime24Input
            label="Дата и час на изпичане"
            value={production.dateTime}
            onChange={val => onUpdate(production.id, 'dateTime', val)}
            isMobile={isMobile}
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <ControlInput
            label="Вид"
            value={production.type}
            onChange={e => onUpdate(production.id, 'type', e.target.value)}
            placeholder="Въведете вид продукт"
          />
        </div>

        <ControlInput
          label="Количество, бр"
          type="number" min="0"
          value={production.quantity}
          onChange={e => onUpdate(production.id, 'quantity', e.target.value)}
          placeholder="бр"
        />

        <ControlInput
          label="Партида, L"
          value={production.batchL}
          onChange={e => onUpdate(production.id, 'batchL', e.target.value)}
          placeholder="L"
        />

        {/* ─── ТЕМПЕРАТУРА ─── */}
        <div style={{ gridColumn: '1 / -1' }}>
          <TemperatureInput
            value={production.internalTemp ?? ''}
            onChange={val => onUpdate(production.id, 'internalTemp', val)}
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{
            display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600,
            color: DS.color.graphiteLight, textTransform: 'uppercase',
            letterSpacing: '0.04em', marginBottom: '4px',
          }}>Служител</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onUpdate(production.id, 'checked', !production.checked)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '6px', color: production.checked ? DS.color.primary : '#9CA3AF',
                transition: 'color 150ms ease', display: 'flex', flexShrink: 0,
                minWidth: '32px', minHeight: '32px',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              {production.checked ?
                <CheckSquare style={{ width: 22, height: 22 }} /> :
                <Square style={{ width: 22, height: 22 }} />
              }
            </button>
            <input
              type="text"
              value={production.employeeName}
              onChange={e => onUpdate(production.id, 'employeeName', e.target.value)}
              list={`employee-names-${production.id}`}
              placeholder="Име на служителя"
              style={{
                flex: 1, padding: '10px 12px', minWidth: 0,
                backgroundColor: DS.color.surfaceAlt,
                border: `1.5px solid ${DS.color.borderLight}`,
                borderRadius: DS.radius, fontSize: '14px',
                fontFamily: DS.font, color: DS.color.graphite,
                outline: 'none', transition: 'all 150ms ease',
                boxSizing: 'border-box', WebkitAppearance: 'none',
              }}
              onFocus={e => {
                e.target.style.borderColor = DS.color.primary;
                e.target.style.backgroundColor = DS.color.surface;
                e.target.style.boxShadow = `0 0 0 3px ${DS.color.primaryGlow}`;
              }}
              onBlur={e => {
                e.target.style.borderColor = DS.color.borderLight;
                e.target.style.backgroundColor = DS.color.surfaceAlt;
                e.target.style.boxShadow = 'none';
              }}
            />
            <datalist id={`employee-names-${production.id}`}>
              {savedEmployees.map((name, idx) => <option key={idx} value={name} />)}
            </datalist>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const ChickenMeatballProductionSheet = ({ template, config, department, restaurantId, onBack }) => {
  const { isMobile, isTablet, isDesktop, isLandscape } = useResponsive();
  const cardsContainerRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [manager, setManager] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [hasDraft, setHasDraft] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [now, setNow] = useState(new Date());
  const [savedEmployees, setSavedEmployees] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState('');

  const [productions, setProductions] = useState([
    { id: 1, dateTime: '', type: '', quantity: '', batchL: '', internalTemp: '', employeeName: '', checked: false }
  ]);

  const PENDING_KEY = `pending_submissions_${template.id}`;

  const getPending = () => {
    try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); }
    catch { return []; }
  };

  const savePending = (queue) => {
    localStorage.setItem(PENDING_KEY, JSON.stringify(queue));
    setPendingCount(queue.length);
  };

  const addToPending = (submission) => {
    const queue = getPending();
    queue.push({ ...submission, savedAt: Date.now() });
    savePending(queue);
  };

  const syncPending = async () => {
    const queue = getPending();
    if (queue.length === 0) return;
    setSyncStatus('syncing');
    const failed = [];
    for (const item of queue) {
      try {
        const { savedAt, ...submissionData } = item;
        const { error } = await supabase.from('checklist_submissions').insert(submissionData);
        if (error) throw error;
      } catch (e) {
        console.error('Sync error for item:', e);
        failed.push(item);
      }
    }
    savePending(failed);
    if (failed.length === 0) {
      setSyncStatus('synced');
      setAutoSaveStatus(`✓ ${queue.length} ${queue.length === 1 ? 'запис синхронизиран' : 'записа синхронизирани'}`);
    } else {
      setSyncStatus('error');
      setAutoSaveStatus(`⚠ ${failed.length} ${failed.length === 1 ? 'запис не е синхронизиран' : 'записа не са синхронизирани'}`);
    }
    setTimeout(() => { setSyncStatus(''); setAutoSaveStatus(''); }, 4000);
  };

  useEffect(() => {
    const goOnline = () => { setIsOnline(true); syncPending(); };
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    setPendingCount(getPending().length);
    if (navigator.onLine && getPending().length > 0) syncPending();
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hasAnyData = () => {
    if (manager.trim()) return true;
    return productions.some(p => p.dateTime || p.type || p.quantity || p.batchL || p.internalTemp || p.employeeName);
  };

  useEffect(() => {
    const draftKey = `draft_${template.id}_${currentDate}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      setHasDraft(true);
      try {
        const { productions: dp, manager: dm, savedEmployees: de, timestamp } = JSON.parse(savedDraft);
        setProductions(dp);
        setManager(dm || '');
        setSavedEmployees(de || []);
        setAutoSaveStatus(`Зареден драфт от ${new Date(timestamp).toLocaleString('bg-BG')}`);
        setTimeout(() => setAutoSaveStatus(''), 5000);
      } catch (e) { console.error('Error loading draft:', e); }
    } else { loadSavedEmployees(); }
  }, [template.id, currentDate]);

  const loadSavedEmployees = async () => {
    try {
      const { data } = await supabase
        .from('checklist_submissions').select('data')
        .eq('template_id', template.id).eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false }).limit(1).single();
      if (data?.data?.savedEmployees) setSavedEmployees(data.data.savedEmployees);
    } catch (e) { console.log('Няма предишни записи'); }
  };

  useEffect(() => {
    const interval = setInterval(() => saveDraft(), 30000);
    return () => clearInterval(interval);
  }, [productions, manager, savedEmployees]);

  const saveDraft = () => {
    if (!hasAnyData()) return;
    localStorage.setItem(`draft_${template.id}_${currentDate}`, JSON.stringify({
      productions, manager, savedEmployees, timestamp: Date.now()
    }));
    setHasDraft(true);
    setAutoSaveStatus('✓ Автоматично запазено');
    setTimeout(() => setAutoSaveStatus(''), 2000);
  };

  const clearDraft = () => {
    if (window.confirm('Сигурни ли сте, че искате да изчистите текущия драфт и да започнете нов производствен лист?')) {
      setProductions([{ id: 1, dateTime: '', type: '', quantity: '', batchL: '', internalTemp: '', employeeName: '', checked: false }]);
      setManager('');
      localStorage.removeItem(`draft_${template.id}_${currentDate}`);
      setHasDraft(false);
      setAutoSaveStatus('Драфтът е изчистен.');
      setTimeout(() => setAutoSaveStatus(''), 3000);
    }
  };

  const handleBackClick = () => { hasAnyData() ? setShowExitConfirm(true) : onBack(); };

  const confirmExit = (saveAndExit) => {
    if (saveAndExit) {
      saveDraft();
      setAutoSaveStatus('Данните са запазени.');
      setTimeout(() => onBack(), 1500);
    } else { onBack(); }
    setShowExitConfirm(false);
  };

  const addProduction = () => {
    setProductions([{ id: Date.now(), dateTime: '', type: '', quantity: '', batchL: '', internalTemp: '', employeeName: '', checked: false }, ...productions]);
    setTimeout(() => {
      if (cardsContainerRef.current) cardsContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const removeProduction = (id) => {
    if (productions.length > 1) setProductions(productions.filter(p => p.id !== id));
  };

  const updateProduction = (id, field, value) => {
    setProductions(productions.map(p => p.id === id ? { ...p, [field]: value } : p));
    if (field === 'employeeName' && value.trim() && !savedEmployees.includes(value.trim())) {
      setSavedEmployees([...savedEmployees, value.trim()]);
    }
  };

  const handleSubmit = async () => {
    if (!hasAnyData()) { alert('Моля попълнете поне едно поле.'); return; }
    setLoading(true);

    const submissionData = {
      template_id: template.id,
      restaurant_id: restaurantId,
      department_id: department.id,
      data: { currentDate, manager, productions, savedEmployees },
      submission_date: currentDate,
      synced: true,
    };

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) submissionData.submitted_by = userData.user.id;
    } catch (e) { console.log('Cannot get user (offline)'); }

    if (!navigator.onLine) {
      addToPending(submissionData);
      localStorage.removeItem(`draft_${template.id}_${currentDate}`);
      setHasDraft(false);
      setAutoSaveStatus('📱 Запазено офлайн — ще се синхронизира автоматично');
      setTimeout(() => setAutoSaveStatus(''), 4000);
      setProductions([{ id: Date.now(), dateTime: '', type: '', quantity: '', batchL: '', internalTemp: '', employeeName: '', checked: false }]);
      setManager('');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.from('checklist_submissions').insert(submissionData);
      if (error) throw error;
      localStorage.removeItem(`draft_${template.id}_${currentDate}`);
      setHasDraft(false);
      setAutoSaveStatus('✓ Производственият лист е запазен успешно');
      setTimeout(() => setAutoSaveStatus(''), 3000);
      setProductions([{ id: Date.now(), dateTime: '', type: '', quantity: '', batchL: '', internalTemp: '', employeeName: '', checked: false }]);
      setManager('');
      if (getPending().length > 0) syncPending();
    } catch (error) {
      console.error('Submit error:', error);
      addToPending(submissionData);
      setAutoSaveStatus('⚠ Грешка при връзка — запазено офлайн');
      setTimeout(() => setAutoSaveStatus(''), 4000);
      setProductions([{ id: Date.now(), dateTime: '', type: '', quantity: '', batchL: '', internalTemp: '', employeeName: '', checked: false }]);
      setManager('');
    } finally { setLoading(false); }
  };

  const pad = isMobile ? '12px' : isTablet ? '20px' : '24px';

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{
        minHeight: '100vh', backgroundColor: DS.color.bg,
        fontFamily: DS.font, color: DS.color.graphite,
        display: 'flex', flexDirection: 'column',
      }}>

        {/* ═══════ EXIT MODAL ═══════ */}
        {showExitConfirm && (
          <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(30,42,38,0.5)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: '16px',
          }}>
            <div style={{
              backgroundColor: DS.color.surface, borderRadius: DS.radius,
              padding: isMobile ? '24px 20px' : '32px',
              maxWidth: '480px', width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <AlertCircle style={{ color: DS.color.warning, width: 20, height: 20, flexShrink: 0 }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, fontFamily: DS.font }}>Имате незапазени данни</h3>
              </div>
              <p style={{ marginBottom: '20px', color: DS.color.graphiteMed, lineHeight: 1.6, fontSize: '14px', fontFamily: DS.font }}>
                Какво искате да направите?
              </p>
              <div style={{
                display: 'flex', gap: '8px',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'flex-end',
              }}>
                {[
                  { label: 'Отказ', bg: DS.color.pendingBg, color: DS.color.graphiteMed, action: () => setShowExitConfirm(false) },
                  { label: 'Изход без запазване', bg: DS.color.danger, color: 'white', action: () => confirmExit(false) },
                  { label: 'Запази и излез', bg: DS.color.primary, color: 'white', action: () => confirmExit(true) },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.action} style={{
                    padding: '12px 16px', backgroundColor: btn.bg, color: btn.color,
                    border: 'none', borderRadius: DS.radius, cursor: 'pointer',
                    fontSize: '13px', fontWeight: 600, fontFamily: DS.font,
                    width: isMobile ? '100%' : 'auto',
                  }}>{btn.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════ TOP BAR ═══════ */}
        <div style={{
          backgroundColor: DS.color.graphite,
          padding: isMobile ? '8px 12px' : '10px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 100,
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)', gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
            <button onClick={handleBackClick} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: isMobile ? '8px 10px' : '6px 14px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: DS.radius,
              color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
              fontFamily: DS.font, fontSize: '12px', fontWeight: 600, minHeight: '36px',
            }}>
              <ChevronLeft style={{ width: 14, height: 14 }} />
              {!isMobile && 'Назад'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '16px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: isOnline ? 'rgba(27,138,80,0.15)' : 'rgba(197,48,48,0.2)',
              padding: '4px 10px', borderRadius: DS.radius,
            }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: isOnline ? '#1B8A50' : DS.color.danger,
                display: 'inline-block',
                boxShadow: isOnline ? '0 0 6px rgba(27,138,80,0.5)' : '0 0 6px rgba(197,48,48,0.5)',
              }} />
              {!isMobile && (
                <span style={{
                  fontFamily: DS.font, fontSize: '10px', fontWeight: 600,
                  color: isOnline ? 'rgba(255,255,255,0.6)' : 'rgba(255,200,200,0.9)',
                  textTransform: 'uppercase',
                }}>
                  {isOnline ? 'Онлайн' : 'Офлайн'}
                </span>
              )}
              {pendingCount > 0 && (
                <span style={{
                  backgroundColor: DS.color.warning,
                  color: 'white', fontFamily: DS.font, fontSize: '9px', fontWeight: 700,
                  padding: '1px 5px', borderRadius: '10px', minWidth: '16px', textAlign: 'center',
                }}>
                  {pendingCount}
                </span>
              )}
            </div>

            {autoSaveStatus && (
              <span style={{
                fontFamily: DS.font, fontSize: '11px',
                color: syncStatus === 'error' ? 'rgba(255,200,200,0.9)' : DS.color.ok,
                display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500,
              }}>
                <CheckCircle style={{ width: 12, height: 12 }} />
                {isMobile ? '✓' : autoSaveStatus}
              </span>
            )}

            {hasDraft && !isMobile && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                backgroundColor: 'rgba(255,255,255,0.08)', padding: '4px 10px',
                borderRadius: DS.radius,
              }}>
                <FileText style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.5)' }} />
                <span style={{
                  fontFamily: DS.font, fontSize: '10px', fontWeight: 600,
                  color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
                }}>Драфт</span>
              </div>
            )}

            <span style={{
              fontFamily: DS.font, fontSize: isMobile ? '11px' : '12px',
              fontWeight: 500, color: 'rgba(255,255,255,0.4)',
            }}>
              {now.toLocaleString('bg-BG', {
                hour: '2-digit', minute: '2-digit',
                ...(isMobile ? {} : { second: '2-digit' }),
                day: '2-digit', month: '2-digit',
                ...(isMobile ? {} : { year: 'numeric' }),
                hour12: false,
              })}
            </span>
          </div>
        </div>

        {/* ═══════ MAIN ═══════ */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '12px' : '24px', flex: 1, width: '100%' }}>

          {/* ─── Header ─── */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            marginBottom: isMobile ? '16px' : '24px', gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '14px' }}>
              <img src={LOGO_URL} alt="Aladin Foods" style={{
                height: isMobile ? '36px' : '48px', width: 'auto', objectFit: 'contain', flexShrink: 0,
              }} />
              <div style={{ minWidth: 0 }}>
                <h1 style={{
                  fontSize: isMobile ? '16px' : '22px', fontWeight: 700,
                  color: DS.color.primary, margin: 0,
                  letterSpacing: '-0.01em', lineHeight: 1.2,
                  textTransform: 'uppercase', fontFamily: DS.font,
                }}>ПРОИЗВОДСТВЕН ЛИСТ</h1>
                <p style={{
                  fontFamily: DS.font, fontSize: isMobile ? '10px' : '12px',
                  color: DS.color.graphiteLight, fontWeight: 500,
                  margin: '3px 0 0', letterSpacing: '0.02em',
                }}>ТЕРМИЧНА ОБРАБОТКА НА КЮФТЕ</p>
              </div>
            </div>

            <div style={{
              backgroundColor: DS.color.surface, border: `1px solid ${DS.color.borderLight}`,
              borderRadius: DS.radius, padding: isMobile ? '8px 12px' : '10px 16px',
              display: 'flex', gap: isMobile ? '12px' : '16px',
              boxShadow: DS.shadow.sm, alignSelf: isMobile ? 'flex-start' : 'center',
            }}>
              {[
                { label: 'КОД', value: 'ПРП 8.0.10' },
                { label: 'РЕД.', value: '00' },
                { label: 'СТР.', value: '1/1' },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: DS.font, fontSize: '9px', fontWeight: 600,
                    color: DS.color.graphiteMuted, textTransform: 'uppercase',
                    letterSpacing: '0.06em', marginBottom: '2px',
                  }}>{item.label}</div>
                  <div style={{
                    fontFamily: DS.font, fontSize: '12px', fontWeight: 700, color: DS.color.graphite,
                  }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Бутони ─── */}
          <div style={{
            display: 'flex', gap: '8px', marginBottom: isMobile ? '12px' : '20px',
            justifyContent: 'flex-end', flexWrap: 'wrap',
          }}>
            {hasDraft && (
              <button onClick={clearDraft} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '10px 14px', backgroundColor: 'transparent',
                border: `1.5px solid ${DS.color.danger}`, borderRadius: DS.radius,
                color: DS.color.danger, cursor: 'pointer',
                fontFamily: DS.font, fontSize: '12px', fontWeight: 600,
                minHeight: '40px', whiteSpace: 'nowrap',
              }}>
                <RotateCcw style={{ width: 14, height: 14 }} />
                {isMobile ? 'Нов лист' : 'Започни нов производствен лист'}
              </button>
            )}

            <button onClick={addProduction} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '10px 16px', backgroundColor: DS.color.primary,
              border: 'none', borderRadius: DS.radius, color: 'white',
              cursor: 'pointer', fontFamily: DS.font, fontSize: '12px',
              fontWeight: 600, boxShadow: DS.shadow.glow, minHeight: '40px',
            }}>
              <Plus style={{ width: 14, height: 14 }} />
              Добави запис
            </button>
          </div>

          {/* ─── Cards ─── */}
          <div
            ref={cardsContainerRef}
            style={{
              display: 'grid',
              gridTemplateColumns:
                isMobile ? '1fr' :
                (isLandscape && isTablet) ? 'repeat(2, 1fr)' :
                isTablet ? '1fr' :
                'repeat(auto-fill, minmax(420px, 1fr))',
              gap: isMobile ? '12px' : '16px',
              marginBottom: isMobile ? '16px' : '32px',
            }}
          >
            {productions.map((prod, i) => (
              <ProductionCard
                key={prod.id}
                production={prod}
                index={i}
                displayNumber={productions.length - i}
                onUpdate={updateProduction}
                onRemove={removeProduction}
                canRemove={productions.length > 1}
                savedEmployees={savedEmployees}
                isMobile={isMobile}
                isLandscape={isLandscape}
                currentDate={currentDate}
                manager={manager}
                onDateChange={e => setCurrentDate(e.target.value)}
                onManagerChange={e => setManager(e.target.value)}
              />
            ))}
          </div>

          {/* ─── Submit ─── */}
          <div style={{
            backgroundColor: DS.color.surface, borderRadius: DS.radius,
            padding: pad, boxShadow: DS.shadow.md,
            border: `1px solid ${DS.color.borderLight}`, textAlign: 'center',
          }}>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                padding: isMobile ? '14px 20px' : '16px 48px',
                width: isMobile ? '100%' : 'auto',
                backgroundColor: loading ? DS.color.graphiteMuted : DS.color.primary,
                border: 'none', borderRadius: DS.radius, color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: DS.font, fontSize: isMobile ? '14px' : '16px', fontWeight: 600,
                boxShadow: loading ? 'none' : '0 4px 12px rgba(25,94,51,0.3)',
                animation: !loading && hasAnyData() ? 'ctrlBreathe 3s ease-in-out infinite' : 'none',
                minHeight: '48px',
              }}
            >
              <Save style={{ width: 20, height: 20 }} />
              {loading ? 'Запазване...' : (isMobile ? 'Запази и започни нов' : 'Запази производствен лист и започни нов')}
            </button>
            <p style={{ marginTop: '10px', fontSize: '13px', color: DS.color.graphiteLight, fontFamily: DS.font }}>
              След запазване формата се изчиства за нов лист
            </p>
          </div>
        </div>

        {/* ═══════ FOOTER ═══════ */}
        <div style={{
          textAlign: 'center',
          padding: isMobile ? '16px 12px' : '20px 24px',
          color: DS.color.graphiteMuted,
          fontFamily: DS.font,
          fontSize: '11px', fontWeight: 500,
          letterSpacing: '0.02em',
          borderTop: `1px solid ${DS.color.borderLight}`,
          marginTop: 'auto',
        }}>
          © 2026 Aladin Foods | by MG
        </div>
      </div>
    </>
  );
};

export default ChickenMeatballProductionSheet;