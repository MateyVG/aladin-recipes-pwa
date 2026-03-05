// src/components/templates/IncomingMaterialsControl.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

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
  @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes chipPop { 0%{transform:scale(0.95)} 50%{transform:scale(1.03)} 100%{transform:scale(1)} }
  body { margin:0; background:${DS.color.bg}; }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
  input[type=number] { -moz-appearance:textfield; }
  @media (max-width:767px) { input,button,select,textarea { font-size:16px !important; } }
`;

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE HOOK
   ═══════════════════════════════════════════════════════════════ */
const useResponsive = () => {
  const [s, setS] = useState({ isMobile: window.innerWidth < 768 });
  useEffect(() => {
    const f = () => setS({ isMobile: window.innerWidth < 768 });
    window.addEventListener('resize', f);
    window.addEventListener('orientationchange', () => setTimeout(f, 100));
    return () => window.removeEventListener('resize', f);
  }, []);
  return s;
};

/* ═══════════════════════════════════════════════════════════════
   INLINE SVG ICONS
   ═══════════════════════════════════════════════════════════════ */
const Icon = ({ name, size = 16, color = 'currentColor', style: st }) => {
  const p = {
    back: <><polyline points="15 18 9 12 15 6" /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
    check: <><polyline points="20 6 9 17 4 12" /></>,
    x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    package: <><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>,
    truck: <><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>,
    thermometer: <><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" /></>,
    clipboard: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></>,
    alert: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>,
    zap: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    rotateCcw: <><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
    fileText: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={st}>
      {p[name]}
    </svg>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SHARED UI COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
const inputBase = (focused) => ({
  width: '100%', padding: '10px 12px',
  backgroundColor: focused ? DS.color.surface : DS.color.surfaceAlt,
  border: `1.5px solid ${focused ? DS.color.primary : DS.color.borderLight}`,
  borderRadius: DS.radius, fontSize: '14px', fontFamily: DS.font, fontWeight: 500,
  color: DS.color.graphite, outline: 'none', transition: 'all 150ms ease',
  boxShadow: focused ? `0 0 0 3px ${DS.color.primaryGlow}` : 'none',
  boxSizing: 'border-box', WebkitAppearance: 'none',
});

const ControlInput = ({ label, type = 'text', value, onChange, placeholder, style: s, disabled, ...rest }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ minWidth: 0, flex: 1, ...s }}>
      {label && (
        <label style={{
          display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600,
          color: focused ? DS.color.primary : DS.color.graphiteLight,
          textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px',
          transition: 'color 150ms',
        }}>{label}</label>
      )}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        disabled={disabled}
        style={{ ...inputBase(focused), opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'text' }}
        {...rest} />
    </div>
  );
};

const ControlSelect = ({ label, value, onChange, children, style: s, highlighted }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ minWidth: 0, flex: 1, ...s }}>
      {label && (
        <label style={{
          display: 'block', fontFamily: DS.font, fontSize: '11px', fontWeight: 600,
          color: focused ? DS.color.primary : DS.color.graphiteLight,
          textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px',
        }}>{label}</label>
      )}
      <select value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          ...inputBase(focused), cursor: 'pointer',
          backgroundColor: highlighted ? DS.color.okBg : (focused ? DS.color.surface : DS.color.surfaceAlt),
          borderColor: highlighted ? DS.color.ok : (focused ? DS.color.primary : DS.color.borderLight),
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2395A39D' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: '28px',
          MozAppearance: 'none', appearance: 'none',
        }}>
        {children}
      </select>
    </div>
  );
};

const SectionHeader = ({ icon, title, right }) => (
  <div style={{
    backgroundColor: DS.color.cardHeader, padding: '12px 16px',
    display: 'flex', alignItems: 'center', gap: '8px',
  }}>
    <Icon name={icon} size={16} color={DS.color.primary} />
    <span style={{ fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.primary, textTransform: 'uppercase', letterSpacing: '0.04em', flex: 1 }}>
      {title}
    </span>
    {right}
  </div>
);

const AutoBadge = () => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 7px',
    backgroundColor: DS.color.okBg, color: DS.color.ok, borderRadius: '8px',
    fontFamily: DS.font, fontSize: '10px', fontWeight: 700, marginLeft: '6px',
  }}>
    <Icon name="zap" size={9} color={DS.color.ok} /> Авто
  </span>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const IncomingMaterialsControl = ({ profile: propProfile, user: propUser, onBack }) => {
  const { isMobile } = useResponsive();
  const [now, setNow] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Auth
  let authContext = null;
  try { authContext = useAuth(); } catch {}
  const user = authContext?.user || propUser;
  const profile = authContext?.profile || propProfile;
  const authLoading = authContext?.loading || false;

  // State
  const [localLoading, setLocalLoading] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [editingBasicInfo, setEditingBasicInfo] = useState(false);

  // Basic Info
  const [basicInfo, setBasicInfo] = useState({
    companyName: 'Аладин Фуудс ООД',
    objectName: profile?.restaurants?.name || '',
    controlDate: new Date().toISOString().split('T')[0],
    managerName: user?.email || '',
  });

  // Suppliers
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierMaterials, setSupplierMaterials] = useState([]);

  // Current Material Form
  const [currentMaterial, setCurrentMaterial] = useState({
    materialName: '', temperature: '', transportType: '',
    quantity: '', batchNumber: '', documentNumber: '',
    receiptDate: new Date().toISOString().split('T')[0],
    expiryDate: '', notes: '',
  });
  const [autoFilled, setAutoFilled] = useState({ materialName: false, temperature: false, transportType: false });

  // Materials List
  const [materials, setMaterials] = useState([]);

  // New Supplier Modal
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', contactInfo: '', materials: [] });

  // ─── Offline sync ───
  const PENDING_KEY = 'pending_incoming_control';
  const DRAFT_KEY = `draft_incoming_${profile?.restaurants?.id || 'x'}`;

  const getPending = () => { try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); } catch { return []; } };
  const savePendingQ = (q) => localStorage.setItem(PENDING_KEY, JSON.stringify(q));
  const pendingCount = getPending().length;

  const flushPending = useCallback(async () => {
    const queue = getPending(); if (!queue.length) return;
    const remaining = [];
    for (const item of queue) {
      try {
        const { _savedAt, ...payload } = item;
        const { data: rec, error: e1 } = await supabase.from('incoming_control_records').insert({
          restaurant_id: payload.restaurant_id, control_date: payload.control_date,
          company_name: payload.company_name, object_name: payload.object_name,
          manager_name: payload.manager_name, status: 'finalized',
          finalized_at: payload.finalized_at, finalized_by: payload.finalized_by, created_by: payload.created_by,
        }).select().single();
        if (e1) throw e1;
        const mats = payload.materials.map(m => ({ ...m, control_record_id: rec.id }));
        const { error: e2 } = await supabase.from('incoming_control_materials').insert(mats);
        if (e2) throw e2;
      } catch { remaining.push(item); }
    }
    savePendingQ(remaining);
    if (!remaining.length) {
      setAutoSaveStatus(`✓ ${queue.length} записа синхронизирани`);
    } else {
      setAutoSaveStatus(`⚠ ${remaining.length} записа не са синхронизирани`);
    }
    setTimeout(() => setAutoSaveStatus(''), 4000);
  }, []);

  // ─── Clock + Online ───
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const on = () => { setIsOnline(true); flushPending(); };
    const off = () => setIsOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    if (navigator.onLine && getPending().length) flushPending();
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, [flushPending]);

  // ─── Draft ───
  const saveDraft = useCallback(() => {
    if (materials.length === 0) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ basicInfo, materials, timestamp: Date.now() }));
    setAutoSaveStatus('✓ Автозапис');
    setTimeout(() => setAutoSaveStatus(''), 2000);
  }, [materials, basicInfo, DRAFT_KEY]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const { basicInfo: bi, materials: m, timestamp } = JSON.parse(saved);
        if (m?.length) {
          setBasicInfo(prev => ({ ...prev, ...bi }));
          setMaterials(m);
          setAutoSaveStatus(`Зареден драфт от ${new Date(timestamp).toLocaleString('bg-BG')}`);
          setTimeout(() => setAutoSaveStatus(''), 4000);
        }
      }
    } catch {}
  }, [DRAFT_KEY]);

  useEffect(() => { const t = setInterval(saveDraft, 30000); return () => clearInterval(t); }, [saveDraft]);

  // ─── Load suppliers ───
  useEffect(() => { if (profile?.restaurants?.id) loadSuppliers(); }, [profile]);

  const loadSuppliers = async () => {
    try {
      const { data, error } = await supabase.from('incoming_control_suppliers')
        .select('*, incoming_control_supplier_materials(id,material_name,typical_temp,typical_transport,frequency,last_used_at)')
        .eq('is_active', true).order('name');
      if (error) throw error;
      setSuppliers(data || []);
      return data || [];
    } catch (e) { console.error('Error loading suppliers:', e); return []; }
  };

  // ─── Supplier selection ───
  const handleSupplierChange = (supplierId, supplierList) => {
    if (supplierId === 'new') { setShowNewSupplierModal(true); return; }
    if (!supplierId) { setSelectedSupplier(null); setSupplierMaterials([]); return; }
    const list = supplierList || suppliers;
    const sup = list.find(s => s.id === supplierId);
    if (!sup) { console.warn('Supplier not found:', supplierId); return; }
    setSelectedSupplier(sup);
    setSupplierMaterials((sup?.incoming_control_supplier_materials || []).sort((a, b) => (b.frequency || 0) - (a.frequency || 0)));
  };

  // ─── Auto-fill ───
  const handleAutoFill = (mat) => {
    setCurrentMaterial(prev => ({
      ...prev, materialName: mat.material_name,
      temperature: mat.typical_temp || '', transportType: mat.typical_transport || '',
    }));
    setAutoFilled({ materialName: true, temperature: true, transportType: true });
  };

  // ─── Add / Remove material ───
  const handleAddMaterial = () => {
    if (!currentMaterial.materialName || !currentMaterial.quantity || !currentMaterial.batchNumber) {
      alert('Моля попълни материал, количество и партиден номер!'); return;
    }
    if (!selectedSupplier) { alert('Моля избери доставчик!'); return; }

    setMaterials(prev => [...prev, {
      ...currentMaterial, supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name, id: Date.now(),
    }]);
    resetMaterialForm();
  };

  const resetMaterialForm = () => {
    setCurrentMaterial({
      materialName: '', temperature: '', transportType: '',
      quantity: '', batchNumber: '', documentNumber: '',
      receiptDate: new Date().toISOString().split('T')[0],
      expiryDate: '', notes: '',
    });
    setAutoFilled({ materialName: false, temperature: false, transportType: false });
    setSelectedSupplier(null); setSupplierMaterials([]);
  };

  const handleDeleteMaterial = (idx) => {
    if (window.confirm('Изтриване на този материал?')) {
      setMaterials(prev => prev.filter((_, i) => i !== idx));
    }
  };

  // ─── New Supplier modal ───
  const handleSaveNewSupplier = async () => {
    if (!newSupplier.name.trim()) { alert('Моля въведи име на доставчик!'); return; }
    if (!profile?.restaurants?.id) { alert('Грешка: Не е намерен ресторант.'); return; }
    try {
      setLocalLoading(true);
      const { data: sup, error: e1 } = await supabase.from('incoming_control_suppliers')
        .insert({ restaurant_id: profile.restaurants.id, name: newSupplier.name, contact_info: newSupplier.contactInfo, created_by: user.id })
        .select().single();
      if (e1) throw e1;
      if (newSupplier.materials.length > 0) {
        const toInsert = newSupplier.materials.filter(m => m.name.trim()).map(m => ({
          supplier_id: sup.id, material_name: m.name, typical_temp: m.temp || null, typical_transport: m.transport || null,
        }));
        if (toInsert.length) {
          const { error: e2 } = await supabase.from('incoming_control_supplier_materials').insert(toInsert);
          if (e2) throw e2;
        }
      }
      const freshList = await loadSuppliers();
      setShowNewSupplierModal(false);
      const savedName = newSupplier.name;
      setNewSupplier({ name: '', contactInfo: '', materials: [] });
      handleSupplierChange(sup.id, freshList);
      setAutoSaveStatus(`✓ Доставчик "${savedName}" създаден`);
      setTimeout(() => setAutoSaveStatus(''), 3000);
    } catch (e) {
      console.error(e); alert('Грешка: ' + e.message);
    } finally { setLocalLoading(false); }
  };

  const addSupplierMatRow = () => setNewSupplier(p => ({ ...p, materials: [...p.materials, { name: '', temp: '', transport: '' }] }));
  const removeSupplierMatRow = (i) => setNewSupplier(p => ({ ...p, materials: p.materials.filter((_, j) => j !== i) }));
  const updateSupplierMat = (i, f, v) => setNewSupplier(p => ({ ...p, materials: p.materials.map((m, j) => j === i ? { ...m, [f]: v } : m) }));

  // ─── Finalize ───
  const handleFinalize = async () => {
    if (materials.length === 0) { alert('Моля добави поне един материал!'); return; }
    setLocalLoading(true);

    const materialsPayload = materials.map(m => ({
      supplier_id: m.supplierId, supplier_name: m.supplierName,
      material_name: m.materialName, quantity: m.quantity,
      batch_number: m.batchNumber, document_number: m.documentNumber || null,
      temperature: m.temperature || null,
      transport_type: m.transportType || null,
      receipt_date: m.receiptDate || null, expiry_date: m.expiryDate || null,
      status: 'accepted', notes: m.notes || null, created_by: user?.id,
    }));

    const recordPayload = {
      restaurant_id: profile?.restaurants?.id,
      control_date: basicInfo.controlDate,
      company_name: basicInfo.companyName,
      object_name: basicInfo.objectName,
      manager_name: basicInfo.managerName,
      finalized_at: new Date().toISOString(),
      finalized_by: user?.id, created_by: user?.id,
      materials: materialsPayload,
    };

    if (!navigator.onLine) {
      const q = getPending(); q.push({ ...recordPayload, _savedAt: Date.now() }); savePendingQ(q);
      localStorage.removeItem(DRAFT_KEY);
      setMaterials([]); resetMaterialForm();
      setAutoSaveStatus('📱 Запазено офлайн');
      setTimeout(() => setAutoSaveStatus(''), 4000);
      setLocalLoading(false); return;
    }

    try {
      const { data: rec, error: e1 } = await supabase.from('incoming_control_records').insert({
        restaurant_id: profile.restaurants.id, control_date: basicInfo.controlDate,
        company_name: basicInfo.companyName, object_name: basicInfo.objectName,
        manager_name: basicInfo.managerName, status: 'finalized',
        finalized_at: new Date().toISOString(), finalized_by: user.id, created_by: user.id,
      }).select().single();
      if (e1) throw e1;

      const matsInsert = materialsPayload.map(m => ({ ...m, control_record_id: rec.id }));
      const { error: e2 } = await supabase.from('incoming_control_materials').insert(matsInsert);
      if (e2) throw e2;

      localStorage.removeItem(DRAFT_KEY);
      setMaterials([]); resetMaterialForm();
      setAutoSaveStatus('✓ Входящ контрол финализиран!');
      setTimeout(() => setAutoSaveStatus(''), 4000);
      if (getPending().length) flushPending();
    } catch (e) {
      console.error(e);
      const q = getPending(); q.push({ ...recordPayload, _savedAt: Date.now() }); savePendingQ(q);
      setAutoSaveStatus('⚠ Грешка — запазено офлайн');
      setTimeout(() => setAutoSaveStatus(''), 4000);
      setMaterials([]); resetMaterialForm();
    } finally { setLocalLoading(false); }
  };

  // ─── Back ───
  const handleBack = () => {
    if (materials.length > 0) setShowExitConfirm(true);
    else onBack?.();
  };
  const confirmExit = (save) => {
    if (save) { saveDraft(); setTimeout(() => onBack?.(), 800); }
    else { onBack?.(); }
    setShowExitConfirm(false);
  };

  const hasAnyData = materials.length > 0;

  // ─── Loading gate ───
  if (authLoading || !profile?.restaurants) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: DS.font, fontSize: '16px', color: DS.color.graphiteMuted }}>
        Зареждане на ресторант...
      </div>
    );
  }

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
            <Icon name="back" size={14} color="white" /> {!isMobile && 'Назад'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: isOnline ? '#4ADE80' : '#F87171' }} />
            {!isMobile && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: 600 }}>{isOnline ? 'Online' : 'Offline'}</span>}
          </div>
          {pendingCount > 0 && (
            <div style={{ backgroundColor: DS.color.warning, color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700 }}>{pendingCount} чакащи</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {autoSaveStatus && <span style={{ color: '#4ADE80', fontSize: '11px', fontWeight: 600 }}>{autoSaveStatus}</span>}
          {materials.length > 0 && (
            <div style={{ backgroundColor: DS.color.primary, color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700 }}>
              {materials.length} мат.
            </div>
          )}
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 600 }}>
            {now.toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* ═══ LOGO + TITLE ═══ */}
      <div style={{ padding: '16px 16px 0', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <img src={LOGO_URL} alt="Aladin" style={{ height: '36px', objectFit: 'contain' }} onError={e => { e.target.style.display = 'none'; }} />
          <div>
            <h1 style={{ margin: 0, fontFamily: DS.font, fontSize: '18px', fontWeight: 700, color: DS.color.graphite }}>
              Входящ контрол на суровини
            </h1>
            <p style={{ margin: 0, fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteMuted }}>
              Код: FS-IC-01 • Ревизия 01
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px 120px', maxWidth: '800px', margin: '0 auto' }}>

        {/* ═══ BASIC INFO ═══ */}
        <div style={{
          backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.sm,
          overflow: 'hidden', marginBottom: '16px', animation: 'ctrlFadeIn 0.3s ease',
          border: `1px solid ${DS.color.borderLight}`,
        }}>
          <SectionHeader icon="clipboard" title="Основна информация" right={
            <button onClick={() => setEditingBasicInfo(!editingBasicInfo)} style={{
              padding: '4px 10px', border: `1px solid ${editingBasicInfo ? DS.color.ok : DS.color.borderLight}`,
              borderRadius: DS.radius, backgroundColor: editingBasicInfo ? DS.color.okBg : 'transparent',
              color: editingBasicInfo ? DS.color.ok : DS.color.graphiteMuted,
              fontFamily: DS.font, fontSize: '11px', fontWeight: 600, cursor: 'pointer',
            }}>
              <Icon name="edit" size={11} color={editingBasicInfo ? DS.color.ok : DS.color.graphiteMuted} style={{ marginRight: '4px', verticalAlign: '-2px' }} />
              {editingBasicInfo ? 'Готово' : 'Редакция'}
            </button>
          } />
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <ControlInput label="Фирма" value={basicInfo.companyName} disabled={!editingBasicInfo}
              onChange={e => setBasicInfo(p => ({ ...p, companyName: e.target.value }))} />
            <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
              <ControlInput label="Обект" value={basicInfo.objectName} disabled={!editingBasicInfo}
                onChange={e => setBasicInfo(p => ({ ...p, objectName: e.target.value }))} />
              <ControlInput label="Дата" type="date" value={basicInfo.controlDate} disabled={!editingBasicInfo}
                onChange={e => setBasicInfo(p => ({ ...p, controlDate: e.target.value }))} />
            </div>
            <ControlInput label="Управител" value={basicInfo.managerName} disabled={!editingBasicInfo}
              onChange={e => setBasicInfo(p => ({ ...p, managerName: e.target.value }))} placeholder="Име и фамилия" />
          </div>
        </div>

        {/* ═══ ADD MATERIAL ═══ */}
        <div style={{
          backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.md,
          overflow: 'hidden', marginBottom: '16px', animation: 'ctrlFadeIn 0.4s ease',
          border: `1px solid ${DS.color.borderLight}`,
        }}>
          <SectionHeader icon="plus" title="Добави материал" />

          <div style={{ padding: '16px' }}>
            {/* 1. Supplier select */}
            <ControlSelect label="1. Доставчик" value={selectedSupplier?.id || ''}
              onChange={e => handleSupplierChange(e.target.value)}>
              <option value="">— Избери доставчик —</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              <option value="new">+ Добави нов доставчик</option>
            </ControlSelect>

            {/* Smart suggestions */}
            {supplierMaterials.length > 0 && (
              <div style={{
                marginTop: '12px', padding: '12px', backgroundColor: DS.color.okBg,
                border: `1px solid ${DS.color.ok}20`, borderRadius: DS.radius,
              }}>
                <div style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 700, color: DS.color.ok, textTransform: 'uppercase', marginBottom: '8px' }}>
                  <Icon name="zap" size={11} color={DS.color.ok} style={{ verticalAlign: '-2px', marginRight: '4px' }} />
                  Обикновено доставя — tap за авто-попълване
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {supplierMaterials.map(m => (
                    <button key={m.id} onClick={() => handleAutoFill(m)} style={{
                      padding: '8px 12px', border: `1px solid ${DS.color.ok}30`,
                      borderRadius: DS.radius, backgroundColor: DS.color.surface, cursor: 'pointer',
                      fontFamily: DS.font, textAlign: 'left', transition: 'all 150ms',
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: DS.color.graphite }}>{m.material_name}</div>
                      <div style={{ fontSize: '11px', color: DS.color.ok, marginTop: '2px' }}>
                        {m.typical_temp && `${m.typical_temp}°C`}{m.typical_transport && ` • ${m.typical_transport}`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Material form */}
            {selectedSupplier && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', animation: 'slideUp 0.3s ease' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      2. Материал / Суровина
                    </label>
                    {autoFilled.materialName && <AutoBadge />}
                  </div>
                  <input type="text" value={currentMaterial.materialName}
                    onChange={e => setCurrentMaterial(p => ({ ...p, materialName: e.target.value }))}
                    placeholder="Име на материал"
                    style={{
                      ...inputBase(false), marginTop: '4px',
                      backgroundColor: autoFilled.materialName ? DS.color.okBg : DS.color.surfaceAlt,
                      borderColor: autoFilled.materialName ? DS.color.ok : DS.color.borderLight,
                    }} />
                </div>

                <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <label style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.graphiteLight, textTransform: 'uppercase' }}>Температура °C</label>
                      {autoFilled.temperature && <AutoBadge />}
                    </div>
                    <input type="number" value={currentMaterial.temperature}
                      onChange={e => setCurrentMaterial(p => ({ ...p, temperature: e.target.value }))}
                      placeholder="°C"
                      style={{
                        ...inputBase(false), marginTop: '4px',
                        backgroundColor: autoFilled.temperature ? DS.color.okBg : DS.color.surfaceAlt,
                        borderColor: autoFilled.temperature ? DS.color.ok : DS.color.borderLight,
                      }} />
                  </div>
                  <ControlSelect label={<>Транспорт{autoFilled.transportType && <AutoBadge />}</>}
                    value={currentMaterial.transportType} highlighted={autoFilled.transportType}
                    onChange={e => setCurrentMaterial(p => ({ ...p, transportType: e.target.value }))}>
                    <option value="">Избери...</option>
                    <option value="Хладилен">Хладилен</option>
                    <option value="Обикновен">Обикновен</option>
                    <option value="Замразен">Замразен</option>
                  </ControlSelect>
                </div>

                <div style={{
                  padding: '10px 14px', backgroundColor: DS.color.blueBg, border: `1px solid ${DS.color.blue}20`,
                  borderRadius: DS.radius, fontFamily: DS.font, fontSize: '12px', color: DS.color.blue,
                }}>
                  <strong>Попълни само:</strong> количество, партида и документ. Останалото е автоматично.
                </div>

                <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                  <ControlInput label="3. Количество" value={currentMaterial.quantity} placeholder="напр. 25 кг"
                    onChange={e => setCurrentMaterial(p => ({ ...p, quantity: e.target.value }))} />
                  <ControlInput label="4. Партиден №" value={currentMaterial.batchNumber} placeholder="напр. L-2026-045"
                    onChange={e => setCurrentMaterial(p => ({ ...p, batchNumber: e.target.value }))} />
                </div>

                {/* ─── Придружаващ документ ─── */}
                <div style={{
                  padding: '12px', backgroundColor: DS.color.surfaceAlt,
                  border: `1px solid ${DS.color.borderLight}`, borderRadius: DS.radius,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Icon name="fileText" size={14} color={DS.color.graphiteLight} />
                    <label style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.graphiteLight, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      5. Придружаващ документ
                    </label>
                  </div>
                  <input type="text" value={currentMaterial.documentNumber}
                    onChange={e => setCurrentMaterial(p => ({ ...p, documentNumber: e.target.value }))}
                    placeholder="Номер на фактура, CMR, ветеринарно свидетелство..."
                    style={{ ...inputBase(false) }} />
                  <div style={{ marginTop: '4px', fontFamily: DS.font, fontSize: '10px', color: DS.color.graphiteMuted }}>
                    Фактура, CMR, ветеринарно свидетелство, сертификат за качество и др.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                  <ControlInput label="Дата получаване" type="date" value={currentMaterial.receiptDate}
                    onChange={e => setCurrentMaterial(p => ({ ...p, receiptDate: e.target.value }))} />
                  <ControlInput label="Срок годност" type="date" value={currentMaterial.expiryDate}
                    onChange={e => setCurrentMaterial(p => ({ ...p, expiryDate: e.target.value }))} />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={resetMaterialForm} style={{
                    padding: '10px 16px', border: `1px solid ${DS.color.borderLight}`, borderRadius: DS.radius,
                    backgroundColor: 'transparent', color: DS.color.graphiteMed, fontFamily: DS.font, fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  }}>Изчисти</button>
                  <button onClick={handleAddMaterial} style={{
                    flex: 1, padding: '12px', border: 'none', borderRadius: DS.radius,
                    backgroundColor: DS.color.primary, color: 'white', fontFamily: DS.font, fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}>
                    <Icon name="plus" size={16} color="white" /> Добави материал
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══ MATERIALS LIST ═══ */}
        <div style={{
          backgroundColor: DS.color.surface, borderRadius: DS.radius, boxShadow: DS.shadow.sm,
          overflow: 'hidden', marginBottom: '16px', border: `1px solid ${DS.color.borderLight}`,
        }}>
          <SectionHeader icon="package" title={`Добавени материали (${materials.length})`} />

          {materials.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: DS.color.graphiteMuted }}>
              <Icon name="package" size={40} color={DS.color.sageMuted} style={{ margin: '0 auto 10px', display: 'block' }} />
              <p style={{ fontFamily: DS.font, fontSize: '14px', margin: 0 }}>Няма добавени материали</p>
              <p style={{ fontFamily: DS.font, fontSize: '12px', margin: '4px 0 0', color: DS.color.sage }}>Избери доставчик за да започнеш</p>
            </div>
          ) : (
            <div style={{ padding: '8px' }}>
              {materials.map((m, i) => (
                <div key={m.id} style={{
                  padding: '12px', marginBottom: '6px',
                  backgroundColor: DS.color.surfaceAlt, border: `1px solid ${DS.color.borderLight}`,
                  borderRadius: DS.radius, animation: 'slideUp 0.3s ease',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{
                      fontFamily: DS.font, fontSize: '11px', fontWeight: 700, color: DS.color.primary,
                      backgroundColor: DS.color.okBg, padding: '2px 8px', borderRadius: '8px',
                    }}>#{i + 1}</span>
                    <button onClick={() => handleDeleteMaterial(i)} style={{
                      padding: '4px 8px', border: 'none', borderRadius: DS.radius,
                      backgroundColor: DS.color.dangerBg, color: DS.color.danger,
                      fontFamily: DS.font, fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      <Icon name="trash" size={11} color={DS.color.danger} /> Изтрий
                    </button>
                  </div>
                  <div style={{ fontFamily: DS.font, fontSize: '14px', fontWeight: 700, color: DS.color.graphite, marginBottom: '4px' }}>
                    {m.materialName} • {m.quantity}
                  </div>
                  <div style={{ fontFamily: DS.font, fontSize: '12px', color: DS.color.graphiteMed, display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ padding: '1px 6px', backgroundColor: DS.color.bgWarm, borderRadius: '4px' }}>{m.supplierName}</span>
                    <span>Партида: {m.batchNumber}</span>
                    {m.documentNumber && (
                      <span style={{ padding: '1px 6px', backgroundColor: '#FEF3C7', borderRadius: '4px', color: '#92400E', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Icon name="fileText" size={10} color="#92400E" /> {m.documentNumber}
                      </span>
                    )}
                    {m.temperature && <span style={{ padding: '1px 6px', backgroundColor: DS.color.blueBg, borderRadius: '4px', color: DS.color.blue }}>{m.temperature}°C</span>}
                    {m.transportType && <span>{m.transportType}</span>}
                    {m.receiptDate && <span>Пол.: {new Date(m.receiptDate).toLocaleDateString('bg-BG')}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ STICKY SUBMIT BAR ═══ */}
      {materials.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90,
          backgroundColor: DS.color.surface, borderTop: `1px solid ${DS.color.borderLight}`,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', padding: '12px 16px',
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, fontFamily: DS.font, fontSize: '13px', fontWeight: 700, color: DS.color.graphite }}>
              {materials.length} материала
            </div>
            <button onClick={handleFinalize} disabled={localLoading}
              style={{
                padding: '12px 28px', border: 'none', borderRadius: DS.radius,
                backgroundColor: localLoading ? DS.color.graphiteMuted : DS.color.primary,
                color: 'white', fontFamily: DS.font, fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                animation: !localLoading ? 'ctrlBreathe 3s ease-in-out infinite' : 'none',
              }}>
              <Icon name="save" size={16} color="white" />
              {localLoading ? 'Запазване...' : 'Финализирай'}
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
              Имате {materials.length} незапазени материала. Какво искате?
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
              }}>Запази драфт</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ NEW SUPPLIER MODAL ═══ */}
      {showNewSupplierModal && (
        <div onClick={() => setShowNewSupplierModal(false)} style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(30,42,38,0.5)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 9999, padding: '16px',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: '500px', backgroundColor: DS.color.surface,
            borderRadius: '16px 16px 0 0', overflow: 'hidden', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
            maxHeight: '85vh', overflowY: 'auto',
          }}>
            <div style={{ backgroundColor: DS.color.primary, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: DS.font, fontSize: '16px', fontWeight: 700, color: 'white' }}>Нов доставчик</span>
              <button onClick={() => setShowNewSupplierModal(false)} style={{
                width: '32px', height: '32px', borderRadius: '50%', border: 'none',
                backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '18px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>×</button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <ControlInput label="Име на доставчик *" value={newSupplier.name} placeholder="напр. Кауфланд България ЕООД"
                onChange={e => setNewSupplier(p => ({ ...p, name: e.target.value }))} />
              <ControlInput label="Контакт (опционално)" value={newSupplier.contactInfo} placeholder="Телефон или email"
                onChange={e => setNewSupplier(p => ({ ...p, contactInfo: e.target.value }))} />

              <div style={{ borderTop: `1px solid ${DS.color.borderLight}`, paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontFamily: DS.font, fontSize: '11px', fontWeight: 600, color: DS.color.graphiteLight, textTransform: 'uppercase' }}>
                    Често доставяни материали
                  </label>
                  <button onClick={addSupplierMatRow} style={{
                    padding: '4px 10px', border: `1px solid ${DS.color.borderLight}`, borderRadius: DS.radius,
                    backgroundColor: 'transparent', fontFamily: DS.font, fontSize: '11px', fontWeight: 600,
                    color: DS.color.primary, cursor: 'pointer',
                  }}>+ Материал</button>
                </div>

                {newSupplier.materials.map((m, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px',
                    padding: '8px', backgroundColor: DS.color.surfaceAlt, borderRadius: DS.radius,
                  }}>
                    <input type="text" placeholder="Материал" value={m.name}
                      onChange={e => updateSupplierMat(i, 'name', e.target.value)}
                      style={{ ...inputBase(false), flex: 1, padding: '8px 10px' }} />
                    <input type="number" placeholder="°C" value={m.temp}
                      onChange={e => updateSupplierMat(i, 'temp', e.target.value)}
                      style={{ ...inputBase(false), width: '60px', padding: '8px', textAlign: 'center' }} />
                    <select value={m.transport} onChange={e => updateSupplierMat(i, 'transport', e.target.value)}
                      style={{ ...inputBase(false), width: '110px', padding: '8px' }}>
                      <option value="">Транспорт</option>
                      <option value="Хладилен">Хладилен</option>
                      <option value="Обикновен">Обикновен</option>
                      <option value="Замразен">Замразен</option>
                    </select>
                    <button onClick={() => removeSupplierMatRow(i)} style={{
                      width: '28px', height: '28px', border: 'none', borderRadius: DS.radius,
                      backgroundColor: DS.color.dangerBg, color: DS.color.danger, fontSize: '14px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>×</button>
                  </div>
                ))}
              </div>

              <div style={{
                padding: '10px 14px', backgroundColor: DS.color.blueBg, border: `1px solid ${DS.color.blue}20`,
                borderRadius: DS.radius, fontFamily: DS.font, fontSize: '12px', color: DS.color.blue,
              }}>
                Добавете материали за по-бързо попълване при следващите доставки.
              </div>
            </div>

            <div style={{
              padding: '16px 20px', borderTop: `1px solid ${DS.color.borderLight}`,
              display: 'flex', gap: '8px', justifyContent: 'flex-end',
            }}>
              <button onClick={() => setShowNewSupplierModal(false)} style={{
                padding: '10px 16px', border: `1px solid ${DS.color.borderLight}`, borderRadius: DS.radius,
                backgroundColor: 'transparent', color: DS.color.graphiteMed, fontFamily: DS.font, fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}>Отказ</button>
              <button onClick={handleSaveNewSupplier} disabled={localLoading} style={{
                padding: '10px 20px', border: 'none', borderRadius: DS.radius,
                backgroundColor: DS.color.primary, color: 'white', fontFamily: DS.font, fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              }}>
                {localLoading ? 'Запазване...' : 'Създай доставчик'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ FOOTER ═══ */}
      <div style={{
        textAlign: 'center', padding: '20px 16px 80px', fontFamily: DS.font, fontSize: '11px', color: DS.color.graphiteMuted,
      }}>
        Aladin Foods © {new Date().getFullYear()} • Входящ контрол на суровини
      </div>
    </div>
  );
};

export default IncomingMaterialsControl;