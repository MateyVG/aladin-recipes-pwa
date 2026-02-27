// EditableSubmissionDetail.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ImprovedSubmissionDetail from './ImprovedSubmissionDetail';

const DS = {
  color: {
    bg: '#ECEEED', surface: '#FFFFFF', surfaceAlt: '#F7F9F8',
    primary: '#1B5E37', primaryGlow: 'rgba(27,94,55,0.08)',
    cardHeader: '#E8F5EE',
    graphite: '#1E2A26', graphiteMed: '#3D4F48', graphiteLight: '#6B7D76', graphiteMuted: '#95A39D',
    ok: '#1B8A50', okBg: '#E8F5EE',
    warning: '#C47F17', warningBg: '#FFFBEB',
    danger: '#C53030', dangerBg: '#FEF2F2',
    info: '#2563EB', infoBg: '#EFF6FF',
    border: '#D5DDD9', borderLight: '#E4EBE7',
  },
  font: "'DM Sans', system-ui, sans-serif",
  radius: '0px',
  shadow: { sm: '0 1px 3px rgba(30,42,38,0.06),0 1px 2px rgba(30,42,38,0.04)' },
}
const LOGO = 'https://aladinfoods.bg/assets/images/aladinfoods_logo.png'
const CSS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');*,*::before,*::after{box-sizing:border-box}body{margin:0;background:${DS.color.bg}}@keyframes cf{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@media(max-width:767px){input,button,select,textarea{font-size:16px!important}}`

const Ic = ({ n, sz = 16, c = 'currentColor', style: s }) => {
  const d = {
    back: <path d="M15 18l-6-6 6-6" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" fill="none" stroke={c} strokeWidth="2"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" fill="none" stroke={c} strokeWidth="2"/></>,
    save: <><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/><polyline points="17 21 17 13 7 13 7 21" fill="none" stroke={c} strokeWidth="2"/><polyline points="7 3 7 8 15 8" fill="none" stroke={c} strokeWidth="2"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
    history: <><circle cx="12" cy="12" r="10" fill="none" stroke={c} strokeWidth="2"/><polyline points="12 6 12 12 16 14" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="none" stroke={c} strokeWidth="2"/><line x1="12" y1="9" x2="12" y2="13" stroke={c} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
  }
  return <svg width={sz} height={sz} viewBox="0 0 24 24" style={{ flexShrink: 0, display: 'block', ...s }}>{d[n]}</svg>
}

const useR = () => { const [w, sW] = useState(window.innerWidth); useEffect(() => { const h = () => sW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h) }, []); return w < 768 }

const Btn = ({ children, onClick, disabled: dis, variant: vr = 'primary', icon: ic, sm, style: s }) => {
  const V = { primary: [DS.color.primary, '#fff', 'none'], danger: [DS.color.danger, '#fff', 'none'], ghost: [DS.color.surfaceAlt, DS.color.graphiteMed, `1px solid ${DS.color.borderLight}`], warning: [DS.color.warning, '#fff', 'none'], ok: [DS.color.ok, '#fff', 'none'], info: [DS.color.info, '#fff', 'none'] }
  const v = V[vr] || V.primary
  return <button onClick={onClick} disabled={dis} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: sm ? '6px 12px' : '10px 18px', backgroundColor: dis ? DS.color.graphiteMuted : v[0], color: dis ? '#fff' : v[1], border: dis ? 'none' : v[2], borderRadius: DS.radius, fontFamily: DS.font, fontSize: sm ? '11px' : '13px', fontWeight: 600, cursor: dis ? 'not-allowed' : 'pointer', transition: 'all 150ms', minHeight: sm ? '30px' : '40px', opacity: dis ? 0.7 : 1, ...s }}>{ic && <Ic n={ic} sz={sm ? 12 : 14} c={dis ? '#fff' : v[1]} />}{children}</button>
}

const SH = ({ icon: ic, title }) => <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', backgroundColor: DS.color.cardHeader, borderBottom: `1px solid ${DS.color.borderLight}` }}>{ic && <Ic n={ic} sz={18} c={DS.color.primary} />}<span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{title}</span></div>
const Cd = ({ children, style: s, ...rest }) => <div style={{ backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.sm, border: `1px solid ${DS.color.borderLight}`, overflow: 'hidden', animation: 'cf 0.4s ease', ...s }} {...rest}>{children}</div>

const EditableSubmissionDetail = ({ submission: initialSubmission, onBack }) => {
  const mob = useR()
  const pad = mob ? '12px' : '20px'
  const [editMode, setEditMode] = useState(false);
  const [submission, setSubmission] = useState(initialSubmission);
  const [editedData, setEditedData] = useState(JSON.stringify(initialSubmission.data || {}, null, 2));
  const [jsonError, setJsonError] = useState('');
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => { loadCorrectionsHistory() }, [submission.id]);

  const loadCorrectionsHistory = async () => {
    try {
      const { data, error } = await supabase.from('checklist_corrections_view').select('*').eq('submission_id', submission.id).order('corrected_at', { ascending: false });
      if (error) throw error;
      setCorrections(data || []);
    } catch (error) { console.error('Error loading corrections:', error) }
  };

  const handleSave = async () => {
    let parsedData;
    try { parsedData = JSON.parse(editedData); setJsonError('') }
    catch (e) { setJsonError('Невалиден JSON формат: ' + e.message); return }
    if (!window.confirm('Сигурни ли сте че искате да запазите промените?')) return;
    setLoading(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      const oldData = submission.data || {};
      const changes = findChanges(oldData, parsedData);
      if (changes.length === 0) { alert('Няма направени промени'); setEditMode(false); setLoading(false); return }
      const { error: updateError } = await supabase.from('checklist_submissions').update({ data: parsedData, last_corrected_at: new Date().toISOString(), last_corrected_by: user.id }).eq('id', submission.id);
      if (updateError) throw updateError;
      const { error: correctionsError } = await supabase.from('checklist_corrections').insert(changes.map(change => ({ submission_id: submission.id, corrected_by: user.id, field_name: change.field, old_value: JSON.stringify(change.oldValue), new_value: JSON.stringify(change.newValue), notes: `Промяна в ${change.field}` })));
      if (correctionsError) throw correctionsError;
      setSubmission({ ...submission, data: parsedData });
      setEditMode(false);
      loadCorrectionsHistory();
      alert(`Успешно запазени ${changes.length} промени!`);
    } catch (error) { console.error('Error saving corrections:', error); alert('Грешка при запазване: ' + error.message) }
    finally { setLoading(false) }
  };

  const findChanges = (oldData, newData) => {
    const changes = [];
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
    for (const key of allKeys) {
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changes.push({ field: key, oldValue: oldData[key], newValue: newData[key] });
      }
    }
    return changes;
  };

  const handleCancel = () => {
    if (window.confirm('Сигурни ли сте? Всички промени ще бъдат загубени.')) {
      setEditedData(JSON.stringify(submission.data || {}, null, 2));
      setJsonError('');
      setEditMode(false);
    }
  };

  const handleJsonChange = (newJson) => {
    setEditedData(newJson);
    try { JSON.parse(newJson); setJsonError('') } catch (e) { setJsonError('Невалиден JSON: ' + e.message) }
  };

  const fmtDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleString('bg-BG', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (<><style>{CSS}</style>
    <div style={{ minHeight: '100vh', backgroundColor: DS.color.bg, fontFamily: DS.font, color: DS.color.graphite, display: 'flex', flexDirection: 'column' }}>

      {/* DARK TOP BAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: DS.color.graphite, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: DS.radius, color: 'white', fontSize: '12px', fontFamily: DS.font, fontWeight: 600, cursor: 'pointer' }}>
          <Ic n="back" sz={14} c="white" /> Назад
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {editMode && <span style={{ padding: '3px 8px', backgroundColor: DS.color.warning, color: '#fff', fontFamily: DS.font, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Редакция</span>}
          {corrections.length > 0 && (
            <button onClick={() => setShowHistory(!showHistory)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: DS.radius, color: 'white', fontSize: '11px', fontFamily: DS.font, fontWeight: 600, cursor: 'pointer' }}>
              <Ic n="history" sz={12} c="white" /> {corrections.length}
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: pad, flex: 1, width: '100%' }}>

        {/* LOGO + TITLE + ACTION BUTTONS */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: mob ? '10px' : '14px' }}>
            <img src={LOGO} alt="Aladin Foods" style={{ height: mob ? '36px' : '48px', objectFit: 'contain', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
            <div>
              <h1 style={{ fontSize: mob ? '16px' : '22px', fontWeight: 700, color: DS.color.primary, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.2, textTransform: 'uppercase', fontFamily: DS.font }}>Преглед на запис</h1>
              <p style={{ fontFamily: DS.font, fontSize: mob ? '10px' : '12px', color: DS.color.graphiteLight, fontWeight: 500, margin: '3px 0 0' }}>{submission.checklist_templates?.name || 'Чек лист'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {!editMode ? (
              <Btn onClick={() => { setEditedData(JSON.stringify(submission.data || {}, null, 2)); setEditMode(true) }} icon="edit" variant="warning">Редактирай</Btn>
            ) : (<>
              <Btn onClick={handleCancel} disabled={loading} icon="x" variant="ghost">Отказ</Btn>
              <Btn onClick={handleSave} disabled={loading} icon="save" variant="ok">{loading ? 'Запазване...' : 'Запази'}</Btn>
            </>)}
          </div>
        </div>

        {/* CORRECTIONS HISTORY */}
        {showHistory && corrections.length > 0 && (
          <Cd style={{ marginBottom: '12px' }}>
            <SH icon="history" title={`История на корекциите (${corrections.length})`} />
            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px' }}>
              {corrections.map((cr, idx) => (
                <div key={cr.id} style={{ padding: '12px', backgroundColor: idx % 2 === 0 ? DS.color.surfaceAlt : DS.color.surface, borderLeft: `3px solid ${DS.color.info}`, marginBottom: '6px', animation: 'cf 0.3s ease', animationDelay: `${idx * 40}ms`, animationFillMode: 'both' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary }}>{cr.corrected_by_name || cr.corrected_by_email}</span>
                    <span style={{ fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteMuted, fontWeight: 500 }}>{fmtDate(cr.corrected_at)}</span>
                  </div>
                  <div style={{ fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteLight, marginBottom: '8px' }}><span style={{ fontWeight: 600 }}>Поле:</span> {cr.field_name}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: '8px' }}>
                    <div>
                      <div style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 600, color: DS.color.graphiteMuted, textTransform: 'uppercase', marginBottom: '3px' }}>Стара стойност</div>
                      <div style={{ padding: '8px', backgroundColor: DS.color.dangerBg, border: `1px solid ${DS.color.danger}22`, fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteMed, wordBreak: 'break-word', maxHeight: '80px', overflowY: 'auto' }}>{cr.old_value || '-'}</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: DS.font, fontSize: '10px', fontWeight: 600, color: DS.color.graphiteMuted, textTransform: 'uppercase', marginBottom: '3px' }}>Нова стойност</div>
                      <div style={{ padding: '8px', backgroundColor: DS.color.okBg, border: `1px solid ${DS.color.ok}22`, fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteMed, wordBreak: 'break-word', maxHeight: '80px', overflowY: 'auto' }}>{cr.new_value || '-'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Cd>
        )}

        {/* EDIT MODE NOTICE + JSON EDITOR */}
        {editMode && (<>
          <Cd style={{ marginBottom: '12px', borderColor: `${DS.color.warning}44` }}>
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: DS.color.warningBg }}>
              <Ic n="alert" sz={20} c={DS.color.warning} />
              <div>
                <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.warning }}>Режим на редакция</span>
                <p style={{ margin: '2px 0 0', fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteLight }}>Редактирайте JSON данните по-долу. Форматът трябва да е валиден JSON.</p>
              </div>
            </div>
          </Cd>

          <Cd style={{ marginBottom: '12px' }}>
            <SH icon="edit" title="JSON Редактор" />
            <div style={{ padding: pad }}>
              {jsonError && (
                <div style={{ padding: '10px 12px', backgroundColor: DS.color.dangerBg, border: `1px solid ${DS.color.danger}33`, marginBottom: '12px', fontFamily: DS.font, fontSize: '13px', color: DS.color.danger, fontWeight: 500 }}>{jsonError}</div>
              )}
              <textarea
                value={editedData}
                onChange={(e) => handleJsonChange(e.target.value)}
                style={{
                  width: '100%', minHeight: '400px', maxHeight: '600px', padding: '14px',
                  border: `2px solid ${jsonError ? DS.color.danger : DS.color.primary}`,
                  borderRadius: DS.radius, fontSize: '13px',
                  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                  backgroundColor: DS.color.surfaceAlt, color: DS.color.graphite,
                  resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5,
                }}
              />
              <p style={{ margin: '8px 0 0', fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteMuted }}>Съвет: Копирайте JSON-а във външен editor (като JSONLint) за по-лесно редактиране</p>
            </div>
          </Cd>
        </>)}

        {/* MAIN CONTENT */}
        <div style={{ opacity: editMode ? 0.6 : 1, pointerEvents: editMode ? 'none' : 'auto' }}>
          <ImprovedSubmissionDetail submission={submission} onBack={onBack} />
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: mob ? '16px 12px' : '20px 24px', color: DS.color.graphiteMuted, fontFamily: DS.font, fontSize: '11px', fontWeight: 500, borderTop: `1px solid ${DS.color.borderLight}`, marginTop: 'auto' }}>© 2026 Aladin Foods | by MG</div>
    </div></>);
};

export default EditableSubmissionDetail;