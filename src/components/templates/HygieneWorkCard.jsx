import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Plus, Trash2, CheckSquare, Square, Building2, Calendar, Users, ClipboardCheck, CheckCircle, RotateCcw, FileText, AlertCircle } from 'lucide-react';

const HygieneWorkCard = ({ template, config, department, restaurantId, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [hygieneType, setHygieneType] = useState('Т/ 2С / С / ПН / М');
  const [manager, setManager] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [hasDraft, setHasDraft] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  const [defaultZones] = useState([
    {
      id: '1',
      name: '1. Зона за подготовка',
      areas: [
        { name: 'Под,сифони', cleaning: 'Т', washing: 'Т', disinfection: '2С' },
        { name: 'Стени', cleaning: 'Т', washing: 'С', disinfection: 'ПН' },
        { name: 'Таван', cleaning: 'С', washing: 'С', disinfection: 'ПН' },
        { name: 'Врати', cleaning: 'Т', washing: 'Т', disinfection: 'ПН' },
        { name: 'Контактниповърхности', cleaning: 'Т', washing: '2С', disinfection: '2С' }
      ]
    },
    {
      id: '2',
      name: '2. Зона за готов продукт',
      areas: [
        { name: 'Под,сифони', cleaning: 'Т', washing: 'Т', disinfection: '2С' },
        { name: 'Стени', cleaning: 'Т', washing: 'С', disinfection: 'ПН' },
        { name: 'Таван', cleaning: 'С', washing: 'С', disinfection: 'ПН' },
        { name: 'Врати', cleaning: 'Т', washing: 'Т', disinfection: 'ПН' },
        { name: 'Контактни повърхности', cleaning: 'Т', washing: '2С', disinfection: '2С' }
      ]
    },
    {
      id: '3',
      name: '3. Склад',
      areas: [
        { name: 'Под,сифони', cleaning: 'Т', washing: 'Т', disinfection: '2С' },
        { name: 'Стени', cleaning: 'Т', washing: 'С', disinfection: 'ПН' },
        { name: 'Таван', cleaning: 'С', washing: 'С', disinfection: 'ПН' },
        { name: 'Врати', cleaning: 'Т', washing: 'Т', disinfection: 'ПН' },
        { name: 'Контактни повърхности', cleaning: 'Т', washing: '2С', disinfection: '2С' }
      ]
    },
    {
      id: '4',
      name: '4. Хладилна камера 1 (0° -4° С) - суровина',
      areas: [
        { name: 'Под', cleaning: 'Т', washing: 'Т', disinfection: '2С' },
        { name: 'Стени', cleaning: 'Т', washing: 'С', disinfection: 'ПН' },
        { name: 'Таван', cleaning: 'С', washing: 'С', disinfection: 'ПН' },
        { name: 'Врата', cleaning: 'Т', washing: 'Т', disinfection: 'ПН' },
        { name: 'Контактни повърхности и оборудване', cleaning: 'Т', washing: '2С', disinfection: '2С' }
      ]
    }
  ]);

  const [refrigerators] = useState([
    { id: '5', name: '5.Хладилник 2 - безалкохолни напитки, айрани', cleaning: 'Т', washing: 'Т', disinfection: 'ПН' },
    { id: '6', name: '6.Хладилник 3 – пица', cleaning: 'Т', washing: 'Т', disinfection: 'ПН' },
    { id: '7', name: '7.Хладилник 4 – дюнер', cleaning: 'Т', washing: 'Т', disinfection: 'ПН' },
    { id: '8', name: '8.Хладилник 5 – заготовки зеленчуци, сосове', cleaning: 'Т', washing: 'Т', disinfection: 'ПН' },
    { id: '9', name: '9.Хладилник 6 – месни продукти', cleaning: 'Т', washing: 'Т', disinfection: 'ПН' },
    { id: '10', name: '10.Хладилник 7 – месни продукти, зеленчуци', cleaning: 'Т', washing: 'Т', disinfection: 'ПН' },
    { id: '11', name: '11. Хладилник 8 – месни продукти, теста', cleaning: 'Т', washing: 'Т', disinfection: 'ПН' }
  ]);

  const [zones, setZones] = useState(defaultZones);
  const [customRefrigerators, setCustomRefrigerators] = useState([]);
  const [completionData, setCompletionData] = useState({});
  const [employees, setEmployees] = useState([]);
  const [newEmployeeName, setNewEmployeeName] = useState('');

  const allRefrigerators = [...refrigerators, ...customRefrigerators];

  // Проверка дали има въведени данни
  const hasAnyData = () => {
    if (manager.trim() || hygieneType !== 'Т/ 2С / С / ПН / М' || employees.length > 0) return true;
    if (zones.length > defaultZones.length || customRefrigerators.length > 0) return true;
    if (Object.keys(completionData).length > 0) return true;
    return false;
  };

  // Зареждане на драфт при старт
  useEffect(() => {
    const draftKey = `draft_${template.id}_${currentDate}`;
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft) {
      setHasDraft(true);
      try {
        const { 
          hygieneType: draftHygieneType,
          manager: draftManager,
          employees: draftEmployees,
          zones: draftZones,
          customRefrigerators: draftCustomRefrigerators,
          completionData: draftCompletionData,
          timestamp 
        } = JSON.parse(savedDraft);
        const draftDate = new Date(timestamp);
        
        // Auto-load draft без да пита
        setHygieneType(draftHygieneType || 'Т/ 2С / С / ПН / М');
        setManager(draftManager || '');
        setEmployees(draftEmployees || []);
        setZones(draftZones || defaultZones);
        setCustomRefrigerators(draftCustomRefrigerators || []);
        setCompletionData(draftCompletionData || {});
        setAutoSaveStatus(`Зареден драфт от ${draftDate.toLocaleString('bg-BG')}`);
        setTimeout(() => setAutoSaveStatus(''), 5000);
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    } else {
      // Зареждане на запазени служители от предишни submissions
      loadSavedEmployees();
    }
  }, [template.id, currentDate]);

  // Зареждане на запазени служители
  const loadSavedEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('checklist_submissions')
        .select('data')
        .eq('template_id', template.id)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data?.data?.employees) {
        setEmployees(data.data.employees);
      }
    } catch (error) {
      console.log('Няма предишни записи');
    }
  };

  // Auto-save draft на всеки 30 секунди
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [hygieneType, manager, employees, zones, customRefrigerators, completionData]);

  const saveDraft = () => {
    if (!hasAnyData()) return; // Не запазва празни драфти
    
    const draftKey = `draft_${template.id}_${currentDate}`;
    localStorage.setItem(draftKey, JSON.stringify({
      hygieneType,
      manager,
      employees,
      zones,
      customRefrigerators,
      completionData,
      timestamp: Date.now()
    }));
    setHasDraft(true);
    setAutoSaveStatus('✓ Автоматично запазено');
    setTimeout(() => setAutoSaveStatus(''), 2000);
  };

  const clearDraft = () => {
    if (window.confirm('Сигурни ли сте, че искате да изчистите текущия драфт и да започнете нова работна карта?')) {
      setHygieneType('Т/ 2С / С / ПН / М');
      setManager('');
      setEmployees([]);
      setZones(defaultZones);
      setCustomRefrigerators([]);
      setCompletionData({});
      
      const draftKey = `draft_${template.id}_${currentDate}`;
      localStorage.removeItem(draftKey);
      setHasDraft(false);
      
      setAutoSaveStatus('Драфтът е изчистен. Започнете нова работна карта.');
      setTimeout(() => setAutoSaveStatus(''), 3000);
    }
  };

  const handleBackClick = () => {
    if (hasAnyData()) {
      setShowExitConfirm(true);
    } else {
      onBack();
    }
  };

  const confirmExit = (saveAndExit) => {
    if (saveAndExit) {
      saveDraft();
      setAutoSaveStatus('Данните са запазени. Можете да продължите по-късно.');
      setTimeout(() => {
        onBack();
      }, 1500);
    } else {
      onBack();
    }
    setShowExitConfirm(false);
  };

  const addEmployee = () => {
    if (newEmployeeName.trim()) {
      setEmployees([...employees, { id: Date.now(), name: newEmployeeName.trim() }]);
      setNewEmployeeName('');
    }
  };

  const removeEmployee = (id) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const addCustomZone = () => {
    const newZone = {
      id: Date.now().toString(),
      name: `${zones.length + customRefrigerators.length + 1}. Нова зона`,
      areas: [
        { name: 'Под,сифони', cleaning: 'Т', washing: 'Т', disinfection: '2С' },
        { name: 'Стени', cleaning: 'Т', washing: 'С', disinfection: 'ПН' }
      ]
    };
    setZones([...zones, newZone]);
  };

  const addCustomRefrigerator = () => {
    const newRefrigerator = {
      id: Date.now().toString(),
      name: `${zones.length + allRefrigerators.length + 1}.Нов хладилник`,
      cleaning: 'Т',
      washing: 'Т',
      disinfection: 'ПН'
    };
    setCustomRefrigerators([...customRefrigerators, newRefrigerator]);
  };

  const removeCustomZone = (id) => {
    setZones(zones.filter(zone => !defaultZones.find(dz => dz.id === zone.id) && zone.id !== id));
  };

  const removeCustomRefrigerator = (id) => {
    setCustomRefrigerators(customRefrigerators.filter(ref => ref.id !== id));
  };

  const updateZoneName = (zoneId, newName) => {
    setZones(zones.map(zone => 
      zone.id === zoneId ? { ...zone, name: newName } : zone
    ));
  };

  const updateRefrigeratorName = (refId, newName) => {
    setCustomRefrigerators(customRefrigerators.map(ref => 
      ref.id === refId ? { ...ref, name: newName } : ref
    ));
  };

  const handleCompletionChange = (itemId, areaName, field, value) => {
    const key = `${itemId}_${areaName || 'main'}_${field}`;
    setCompletionData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const isCompleted = (itemId, areaName, field) => {
    const key = `${itemId}_${areaName || 'main'}_${field}`;
    return completionData[key] || false;
  };

  const getExecutor = (itemId, areaName) => {
    const key = `${itemId}_${areaName || 'main'}_executor`;
    return completionData[key] || '';
  };

  const setExecutor = (itemId, areaName, executor) => {
    const key = `${itemId}_${areaName || 'main'}_executor`;
    setCompletionData(prev => ({
      ...prev,
      [key]: executor
    }));
  };

  const handleSubmit = async () => {
    if (!hasAnyData()) {
      alert('Моля попълнете поне едно поле преди да запазите работната карта.');
      return;
    }

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const submissionData = {
        template_id: template.id,
        restaurant_id: restaurantId,
        department_id: department.id,
        data: {
          currentDate,
          hygieneType,
          manager,
          employees,
          zones,
          customRefrigerators,
          completionData
        },
        submitted_by: userData.user.id,
        submission_date: currentDate,
        synced: true
      };

      const { error } = await supabase
        .from('checklist_submissions')
        .insert(submissionData);

      if (error) throw error;

      // Изчисти драфт след успешно запазване
      const draftKey = `draft_${template.id}_${currentDate}`;
      localStorage.removeItem(draftKey);
      setHasDraft(false);

      alert('Работната карта е запазена успешно! Сега можете да започнете нова работна карта.');
      
      // Рестартирай формата за нов запис
      setHygieneType('Т/ 2С / С / ПН / М');
      setManager('');
      setEmployees([]);
      setZones(defaultZones);
      setCustomRefrigerators([]);
      setCompletionData({});
      
      // Остава на страницата за нов запис
    } catch (error) {
      console.error('Submit error:', error);
      alert('Грешка при запазване: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F4F6F8', padding: '20px' }}>
      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <AlertCircle style={{ color: '#d97706', width: '24px', height: '24px' }} />
              <h3 style={{ margin: 0, color: '#195E33' }}>Имате незапазени данни</h3>
            </div>
            <p style={{ marginBottom: '20px', color: '#374151', lineHeight: '1.6' }}>
              Имате попълнени данни в работната карта. Какво искате да направите?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowExitConfirm(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Отказ
              </button>
              <button
                onClick={() => confirmExit(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Изход без запазване
              </button>
              <button
                onClick={() => confirmExit(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#195E33',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Запази и излез
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={handleBackClick} style={{
            padding: '10px 20px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            ← Назад
          </button>

          {hasDraft && (
            <button onClick={clearDraft} style={{
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              <RotateCcw style={{ width: '16px', height: '16px' }} />
              Започни нова работна карта
            </button>
          )}
        </div>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #195E33, #2D7A4F)',
          borderRadius: '12px',
          marginBottom: '30px',
          padding: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ flex: 1, maxWidth: '800px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', lineHeight: '1.4', margin: 0 }}>
                РАБОТНА КАРТА ЗА ХИГИЕНИЗИРАНЕ НА ПРОИЗВОДСТВЕНИ ПОМЕЩЕНИЯ
              </h2>
              {hasDraft && (
                <div style={{
                  marginTop: '15px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FileText style={{ width: '20px', height: '20px' }} />
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>Работите по драфт</span>
                </div>
              )}
            </div>
            <div style={{
              textAlign: 'right',
              marginLeft: '32px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <p style={{ fontWeight: 'bold', fontSize: '18px', margin: '0 0 8px 0' }}>
                Код: ПРП 3.0.3
              </p>
              <p style={{ opacity: 0.8, margin: '0 0 8px 0' }}>Редакция: 00</p>
              <p style={{ fontWeight: '600', fontSize: '16px', margin: 0 }}>Стр. 1 от 1</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '24px',
          marginBottom: '30px',
          border: '1px solid #E6F4EA'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            marginBottom: autoSaveStatus ? '16px' : '0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calendar style={{ width: '20px', height: '20px', color: '#195E33' }} />
              <label style={{ fontWeight: '600', color: '#374151' }}>ДАТА:</label>
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                style={{
                  padding: '10px',
                  border: '2px solid #195E33',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ClipboardCheck style={{ width: '20px', height: '20px', color: '#195E33' }} />
              <label style={{ fontWeight: '600', color: '#374151' }}>ВИД ХИГИЕНИЗИРАНЕ:</label>
              <input
                type="text"
                value={hygieneType}
                onChange={(e) => setHygieneType(e.target.value)}
                style={{
                  padding: '10px',
                  border: '2px solid #195E33',
                  borderRadius: '8px',
                  fontSize: '14px',
                  minWidth: '150px'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Building2 style={{ width: '20px', height: '20px', color: '#195E33' }} />
              <label style={{ fontWeight: '600', color: '#374151' }}>Управител:</label>
              <input
                type="text"
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                placeholder="Име и фамилия"
                style={{
                  padding: '10px',
                  border: '2px solid #195E33',
                  borderRadius: '8px',
                  fontSize: '14px',
                  minWidth: '200px'
                }}
              />
            </div>
          </div>

          {autoSaveStatus && (
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#059669',
              fontSize: '14px',
              fontWeight: '600',
              marginTop: '16px'
            }}>
              <CheckCircle style={{ width: '16px', height: '16px' }} />
              {autoSaveStatus}
            </div>
          )}
        </div>

        {/* Employee Management */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '24px',
          marginBottom: '30px',
          border: '1px solid #E6F4EA'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Users style={{ width: '20px', height: '20px', color: '#195E33' }} />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#195E33' }}>
              Служители
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <input
              type="text"
              value={newEmployeeName}
              onChange={(e) => setNewEmployeeName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addEmployee()}
              placeholder="Име и фамилия на служител"
              style={{
                flex: 1,
                padding: '10px',
                border: '2px solid #195E33',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={addEmployee}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: 'white',
                color: '#195E33',
                border: '2px solid #195E33',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#195E33';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#195E33';
              }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              Добави
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {employees.map(employee => (
              <div key={employee.id} style={{
                padding: '10px 16px',
                borderRadius: '20px',
                backgroundColor: '#f9fafb',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: '1px solid #E6F4EA'
              }}>
                <span style={{ fontWeight: '600', color: '#195E33' }}>{employee.name}</span>
                <button
                  onClick={() => removeEmployee(employee.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <Trash2 style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '24px',
          marginBottom: '30px',
          border: '1px solid #E6F4EA'
        }}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#195E33' }}>
            Обозначения:
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            fontSize: '14px',
            color: '#374151'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontWeight: 'bold',
                fontSize: '16px',
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: '#E6F4EA',
                color: '#195E33'
              }}>Т</span>
              <span>текущо</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontWeight: 'bold',
                fontSize: '16px',
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: '#E6F4EA',
                color: '#195E33'
              }}>2С</span>
              <span>два пъти на смяна</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontWeight: 'bold',
                fontSize: '16px',
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: '#E6F4EA',
                color: '#195E33'
              }}>С</span>
              <span>еженеседмично</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontWeight: 'bold',
                fontSize: '16px',
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: '#E6F4EA',
                color: '#195E33'
              }}>ПН</span>
              <span>при необходимост</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontWeight: 'bold',
                fontSize: '16px',
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: '#E6F4EA',
                color: '#195E33'
              }}>М</span>
              <span>ежемесечно</span>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          marginBottom: '30px',
          border: '1px solid #E6F4EA'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #195E33, #2D7A4F)' }}>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontWeight: 'bold',
                    color: 'white',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '16px'
                  }}>
                    Помещение/обект
                  </th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: 'white',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '16px'
                  }}>
                    Почистване
                  </th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: 'white',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '16px'
                  }}>
                    Измиване
                  </th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: 'white',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '16px'
                  }}>
                    Дезинфекция
                  </th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: 'white',
                    fontSize: '16px'
                  }}>
                    Извършил (подпис)
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Zones */}
                {zones.map((zone, zoneIndex) => (
                  <React.Fragment key={zone.id}>
                    {/* Zone Header */}
                    <tr style={{ background: 'linear-gradient(135deg, #195E33, #2D7A4F)' }}>
                      <td colSpan="5" style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input
                            type="text"
                            value={zone.name}
                            onChange={(e) => updateZoneName(zone.id, e.target.value)}
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.1)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              fontWeight: 'bold',
                              flex: 1,
                              padding: '12px',
                              borderRadius: '8px',
                              fontSize: '16px',
                              color: 'white'
                            }}
                          />
                          {!defaultZones.find(dz => dz.id === zone.id) && (
                            <button
                              onClick={() => removeCustomZone(zone.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'rgba(255,100,100,0.9)',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 style={{ width: '20px', height: '20px' }} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {/* Zone Areas */}
                    {zone.areas.map((area, areaIndex) => (
                      <tr key={areaIndex} style={{
                        backgroundColor: areaIndex % 2 === 0 ? 'white' : '#FAFBFC'
                      }}>
                        <td style={{
                          padding: '16px',
                          borderRight: '1px solid #E6F4EA',
                          fontSize: '15px',
                          fontWeight: '500',
                          color: '#195E33'
                        }}>
                          {area.name}
                        </td>
                        <td style={{
                          padding: '16px',
                          textAlign: 'center',
                          borderRight: '1px solid #E6F4EA'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px'
                          }}>
                            <span style={{
                              fontWeight: 'bold',
                              fontSize: '16px',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              backgroundColor: '#E6F4EA',
                              color: '#195E33'
                            }}>
                              {area.cleaning}
                            </span>
                            <button
                              onClick={() => handleCompletionChange(zone.id, area.name, 'cleaning', !isCompleted(zone.id, area.name, 'cleaning'))}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: isCompleted(zone.id, area.name, 'cleaning') ? '#195E33' : '#9CA3AF'
                              }}
                            >
                              {isCompleted(zone.id, area.name, 'cleaning') ? 
                                <CheckSquare style={{ width: '24px', height: '24px' }} /> : 
                                <Square style={{ width: '24px', height: '24px' }} />
                              }
                            </button>
                          </div>
                        </td>
                        <td style={{
                          padding: '16px',
                          textAlign: 'center',
                          borderRight: '1px solid #E6F4EA'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px'
                          }}>
                            <span style={{
                              fontWeight: 'bold',
                              fontSize: '16px',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              backgroundColor: '#E6F4EA',
                              color: '#195E33'
                            }}>
                              {area.washing}
                            </span>
                            <button
                              onClick={() => handleCompletionChange(zone.id, area.name, 'washing', !isCompleted(zone.id, area.name, 'washing'))}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: isCompleted(zone.id, area.name, 'washing') ? '#195E33' : '#9CA3AF'
                              }}
                            >
                              {isCompleted(zone.id, area.name, 'washing') ? 
                                <CheckSquare style={{ width: '24px', height: '24px' }} /> : 
                                <Square style={{ width: '24px', height: '24px' }} />
                              }
                            </button>
                          </div>
                        </td>
                        <td style={{
                          padding: '16px',
                          textAlign: 'center',
                          borderRight: '1px solid #E6F4EA'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px'
                          }}>
                            <span style={{
                              fontWeight: 'bold',
                              fontSize: '16px',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              backgroundColor: '#E6F4EA',
                              color: '#195E33'
                            }}>
                              {area.disinfection}
                            </span>
                            <button
                              onClick={() => handleCompletionChange(zone.id, area.name, 'disinfection', !isCompleted(zone.id, area.name, 'disinfection'))}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: isCompleted(zone.id, area.name, 'disinfection') ? '#195E33' : '#9CA3AF'
                              }}
                            >
                              {isCompleted(zone.id, area.name, 'disinfection') ? 
                                <CheckSquare style={{ width: '24px', height: '24px' }} /> : 
                                <Square style={{ width: '24px', height: '24px' }} />
                              }
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <select
                            value={getExecutor(zone.id, area.name)}
                            onChange={(e) => setExecutor(zone.id, area.name, e.target.value)}
                            style={{
                              padding: '8px 12px',
                              border: '2px solid #195E33',
                              borderRadius: '8px',
                              fontWeight: '500',
                              color: '#195E33',
                              fontSize: '14px'
                            }}
                          >
                            <option value="">Избери</option>
                            {employees.map(emp => (
                              <option key={emp.id} value={emp.name}>{emp.name}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}

                {/* Refrigerators */}
                {allRefrigerators.map((ref, refIndex) => (
                  <tr key={ref.id} style={{
                    backgroundColor: refIndex % 2 === 0 ? 'white' : '#FAFBFC'
                  }}>
                    <td style={{
                      padding: '16px',
                      borderRight: '1px solid #E6F4EA'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                          type="text"
                          value={ref.name}
                          onChange={(e) => customRefrigerators.find(cr => cr.id === ref.id) && updateRefrigeratorName(ref.id, e.target.value)}
                          readOnly={!customRefrigerators.find(cr => cr.id === ref.id)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: '500',
                            color: '#195E33',
                            border: customRefrigerators.find(cr => cr.id === ref.id) ? '2px solid #195E33' : 'none',
                            backgroundColor: customRefrigerators.find(cr => cr.id === ref.id) ? 'white' : 'transparent'
                          }}
                        />
                        {customRefrigerators.find(cr => cr.id === ref.id) && (
                          <button
                            onClick={() => removeCustomRefrigerator(ref.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#dc2626',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 style={{ width: '16px', height: '16px' }} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{
                      padding: '16px',
                      textAlign: 'center',
                      borderRight: '1px solid #E6F4EA'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px'
                      }}>
                        <span style={{
                          fontWeight: 'bold',
                          fontSize: '16px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#E6F4EA',
                          color: '#195E33'
                        }}>
                          {ref.cleaning}
                        </span>
                        <button
                          onClick={() => handleCompletionChange(ref.id, null, 'cleaning', !isCompleted(ref.id, null, 'cleaning'))}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: isCompleted(ref.id, null, 'cleaning') ? '#195E33' : '#9CA3AF'
                          }}
                        >
                          {isCompleted(ref.id, null, 'cleaning') ? 
                            <CheckSquare style={{ width: '24px', height: '24px' }} /> : 
                            <Square style={{ width: '24px', height: '24px' }} />
                          }
                        </button>
                      </div>
                    </td>
                    <td style={{
                      padding: '16px',
                      textAlign: 'center',
                      borderRight: '1px solid #E6F4EA'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px'
                      }}>
                        <span style={{
                          fontWeight: 'bold',
                          fontSize: '16px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#E6F4EA',
                          color: '#195E33'
                        }}>
                          {ref.washing}
                        </span>
                        <button
                          onClick={() => handleCompletionChange(ref.id, null, 'washing', !isCompleted(ref.id, null, 'washing'))}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: isCompleted(ref.id, null, 'washing') ? '#195E33' : '#9CA3AF'
                          }}
                        >
                          {isCompleted(ref.id, null, 'washing') ? 
                            <CheckSquare style={{ width: '24px', height: '24px' }} /> : 
                            <Square style={{ width: '24px', height: '24px' }} />
                          }
                        </button>
                      </div>
                    </td>
                    <td style={{
                      padding: '16px',
                      textAlign: 'center',
                      borderRight: '1px solid #E6F4EA'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px'
                      }}>
                        <span style={{
                          fontWeight: 'bold',
                          fontSize: '16px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#E6F4EA',
                          color: '#195E33'
                        }}>
                          {ref.disinfection}
                        </span>
                        <button
                          onClick={() => handleCompletionChange(ref.id, null, 'disinfection', !isCompleted(ref.id, null, 'disinfection'))}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: isCompleted(ref.id, null, 'disinfection') ? '#195E33' : '#9CA3AF'
                          }}
                        >
                          {isCompleted(ref.id, null, 'disinfection') ? 
                            <CheckSquare style={{ width: '24px', height: '24px' }} /> : 
                            <Square style={{ width: '24px', height: '24px' }} />
                          }
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <select
                        value={getExecutor(ref.id, null)}
                        onChange={(e) => setExecutor(ref.id, null, e.target.value)}
                        style={{
                          padding: '8px 12px',
                          border: '2px solid #195E33',
                          borderRadius: '8px',
                          fontWeight: '500',
                          color: '#195E33',
                          fontSize: '14px'
                        }}
                      >
                        <option value="">Избери</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.name}>{emp.name}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add New Items */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '30px' }}>
          <button
            onClick={addCustomZone}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              backgroundColor: 'white',
              color: '#195E33',
              border: '2px solid #195E33',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#195E33';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = '#195E33';
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Добави зона
          </button>
          <button
            onClick={addCustomRefrigerator}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              backgroundColor: 'white',
              color: '#195E33',
              border: '2px solid #195E33',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#195E33';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = '#195E33';
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Добави хладилник
          </button>
        </div>

        {/* Footer */}
        <div style={{
          background: 'linear-gradient(135deg, #195E33, #2D7A4F)',
          borderRadius: '12px',
          padding: '24px',
          color: 'white',
          marginBottom: '30px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar style={{ width: '20px', height: '20px' }} />
              <span style={{ fontWeight: '600' }}>Дата: {currentDate}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 style={{ width: '20px', height: '20px' }} />
              <span style={{ fontWeight: '600' }}>
                Утвърждавам: {manager || '(Управител)'}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '16px 48px',
              backgroundColor: loading ? '#9ca3af' : '#195E33',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 12px rgba(25, 94, 51, 0.3)'
            }}
          >
            <Save style={{ width: '20px', height: '20px' }} />
            {loading ? 'Запазване...' : 'Запази работна карта и започни нова'}
          </button>
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#6b7280' }}>
            След запазване, формата ще се изчисти и ще можете да започнете нова работна карта
          </p>
        </div>

      </div>
    </div>
  );
};

export default HygieneWorkCard;