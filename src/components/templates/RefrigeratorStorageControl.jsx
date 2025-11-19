import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Plus, Trash2, Calendar, Building2, Thermometer, AlertTriangle, AlertCircle, FileText } from 'lucide-react';

const RefrigeratorStorageControl = ({ template, config, department, restaurantId, onBack }) => {
  const [loading, setLoading] = useState(false);
  
  const [defaultRefrigerators] = useState([
    { id: '1', name: '№ 1', temp: '0-4°C', description: 'Дюнер 1', type: 'positive' },
    { id: '2', name: '№ 2', temp: '0-4°C', description: 'зеленчуци, сосове, месни продукти', type: 'positive' },
    { id: '3', name: '№ 3', temp: '2-6°C', description: 'безалкохолни напитки, айран', type: 'positive' },
    { id: '4', name: '№ 4', temp: '≤ -18°C', description: 'месни продукти', type: 'negative' },
    { id: '5', name: '№ 5', temp: '0-4°C', description: 'месни, млечни, зеленчуци, тесто', type: 'positive' },
    { id: '6', name: '№ 6', temp: '0-4°C', description: 'месни, млечни, зеленчуци, тесто', type: 'positive' },
    { id: '7', name: '№ 7', temp: '≤ -18°C', description: 'месни продукти', type: 'negative' },
    { id: '8', name: '№ 8', temp: '≤ -18°C', description: 'месни продукти, зеленчуци, тесто', type: 'negative' }
  ]);
  
  const [customRefrigerators, setCustomRefrigerators] = useState([]);
  const [dateBlocks, setDateBlocks] = useState([{ id: 1, date: '', readings: {} }]);
  const [savedInspectors, setSavedInspectors] = useState([]);

  // Draft система
  const [hasDraft, setHasDraft] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [pendingExit, setPendingExit] = useState(false);

  const currentDate = new Date().toISOString().split('T')[0];

  const allRefrigerators = [...defaultRefrigerators, ...customRefrigerators];
  const timeSlots = ['8h', '14h', '20h'];

  // Проверка дали има въведени данни
  const hasAnyData = () => {
    // Проверка за custom хладилници
    if (customRefrigerators.length > 0) return true;
    
    // Проверка за попълнени дати или отчитания
    return dateBlocks.some(block => 
      block.date || 
      Object.keys(block.readings).some(key => block.readings[key])
    );
  };

  // Запазване на драфт
  const saveDraft = () => {
    if (!hasAnyData()) return;

    const draftKey = `draft_${template.id}_${currentDate}`;
    const draftData = {
      customRefrigerators,
      dateBlocks,
      savedInspectors,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem(draftKey, JSON.stringify(draftData));
    setHasDraft(true);
    
    // Показване на статус
    setAutoSaveStatus('✓ Автоматично запазено');
    setTimeout(() => setAutoSaveStatus(''), 2000);
  };

  // Проверка за съществуващ драфт
  const checkForDraft = () => {
    const draftKey = `draft_${template.id}_${currentDate}`;
    const savedDraft = localStorage.getItem(draftKey);

    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setCustomRefrigerators(draftData.customRefrigerators || []);
        setDateBlocks(draftData.dateBlocks || [{ id: 1, date: '', readings: {} }]);
        setSavedInspectors(draftData.savedInspectors || []);
        setHasDraft(true);
      } catch (error) {
        console.error('Грешка при зареждане на драфт:', error);
        localStorage.removeItem(draftKey);
      }
    }
  };

  // Изчистване на драфт и форма
  const clearDraft = () => {
    const draftKey = `draft_${template.id}_${currentDate}`;
    localStorage.removeItem(draftKey);
    
    // Рестартиране на формата
    setCustomRefrigerators([]);
    setDateBlocks([{ id: 1, date: '', readings: {} }]);
    
    setHasDraft(false);
    setAutoSaveStatus('Нова контролна карта стартирана');
    setTimeout(() => setAutoSaveStatus(''), 2000);
  };

  // Обработка на натискане "Назад"
  const handleBackClick = () => {
    if (hasAnyData()) {
      setShowExitConfirm(true);
      setPendingExit(true);
    } else {
      if (onBack) onBack();
    }
  };

  // Потвърждение за излизане
  const confirmExit = (saveAndExit) => {
    if (saveAndExit) {
      saveDraft();
    }
    
    setShowExitConfirm(false);
    setPendingExit(false);
    
    if (onBack) onBack();
  };

  // Зареждане на драфт при mount
  useEffect(() => {
    checkForDraft();
  }, [template.id, currentDate]);

  // Auto-save interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasAnyData()) {
        saveDraft();
      }
    }, 30000); // 30 секунди

    return () => clearInterval(interval);
  }, [customRefrigerators, dateBlocks, savedInspectors, template.id, currentDate]);

  // Зареждане на запазени данни от предишни submissions
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const { data, error } = await supabase
          .from('checklist_submissions')
          .select('data')
          .eq('template_id', template.id)
          .eq('restaurant_id', restaurantId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data?.data?.savedInspectors) {
          setSavedInspectors(prev => {
            const combined = [...new Set([...prev, ...data.data.savedInspectors])];
            return combined;
          });
        }
      } catch (error) {
        console.log('Няма предишни записи');
      }
    };

    loadSavedData();
  }, [template.id, restaurantId]);

  const addRefrigerator = () => {
    const newRefrigerator = {
      id: Date.now().toString(),
      name: `№ ${allRefrigerators.length + 1}`,
      temp: '0-4°C',
      description: 'Нов хладилник',
      type: 'positive'
    };
    setCustomRefrigerators([...customRefrigerators, newRefrigerator]);
    
    setAutoSaveStatus('Добавен нов хладилник');
    setTimeout(() => setAutoSaveStatus(''), 2000);
  };

  const removeRefrigerator = (id) => {
    setCustomRefrigerators(customRefrigerators.filter(ref => ref.id !== id));
    const updatedDateBlocks = dateBlocks.map(block => {
      const newReadings = { ...block.readings };
      timeSlots.forEach(time => {
        delete newReadings[`${id}_${time}`];
      });
      return { ...block, readings: newReadings };
    });
    setDateBlocks(updatedDateBlocks);
    
    setAutoSaveStatus('Премахнат хладилник');
    setTimeout(() => setAutoSaveStatus(''), 2000);
  };

  const updateRefrigerator = (id, field, value) => {
    setCustomRefrigerators(customRefrigerators.map(ref => 
      ref.id === id ? { ...ref, [field]: value } : ref
    ));
  };

  const addDateBlock = () => {
    const newBlock = {
      id: Date.now(),
      date: '',
      readings: {}
    };
    setDateBlocks([...dateBlocks, newBlock]);
    
    setAutoSaveStatus('Добавена нова дата');
    setTimeout(() => setAutoSaveStatus(''), 2000);
  };

  const removeDateBlock = (id) => {
    if (dateBlocks.length > 1) {
      setDateBlocks(dateBlocks.filter(block => block.id !== id));
      
      setAutoSaveStatus('Премахната дата');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }
  };

  const updateDateBlock = (id, field, value) => {
    setDateBlocks(dateBlocks.map(block => 
      block.id === id ? { ...block, [field]: value } : block
    ));
  };

  const updateReading = (blockId, key, value) => {
    setDateBlocks(dateBlocks.map(block => 
      block.id === blockId ? { 
        ...block, 
        readings: { ...block.readings, [key]: value }
      } : block
    ));
    
    if (key === 'inspector_name' && value.trim() && !savedInspectors.includes(value.trim())) {
      setSavedInspectors([...savedInspectors, value.trim()]);
    }
  };

  const getReading = (blockId, key) => {
    const block = dateBlocks.find(b => b.id === blockId);
    return block?.readings[key] || '';
  };

  const getTemperatureStatus = (temp, targetTemp) => {
    if (!temp || !targetTemp) return 'normal';
    
    const tempValue = parseFloat(temp);
    if (isNaN(tempValue)) return 'normal';
    
    if (targetTemp.includes('≤ -18°C')) {
      return tempValue <= -18 ? 'normal' : 'warning';
    } else if (targetTemp.includes('0-4°C')) {
      return (tempValue >= 0 && tempValue <= 4) ? 'normal' : 'warning';
    } else if (targetTemp.includes('2-6°C')) {
      return (tempValue >= 2 && tempValue <= 6) ? 'normal' : 'warning';
    }
    
    return 'normal';
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const submissionData = {
        template_id: template.id,
        restaurant_id: restaurantId,
        department_id: department.id,
        data: {
          customRefrigerators,
          dateBlocks,
          savedInspectors
        },
        submitted_by: userData.user.id,
        submission_date: dateBlocks[0]?.date || new Date().toISOString().split('T')[0],
        synced: true
      };

      const { error } = await supabase
        .from('checklist_submissions')
        .insert(submissionData);

      if (error) throw error;

      // Изчистване на драфт и форма след успешно запазване
      const draftKey = `draft_${template.id}_${currentDate}`;
      localStorage.removeItem(draftKey);
      setHasDraft(false);
      
      // Рестартиране на формата
      setCustomRefrigerators([]);
      setDateBlocks([{ id: 1, date: '', readings: {} }]);

      alert('Контролната карта е запазена успешно! Сега можете да започнете нова контролна карта.');
      
      // НЕ извикваме onBack() - оставаме на страницата
    } catch (error) {
      console.error('Submit error:', error);
      alert('Грешка при запазване: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F4F6F8', padding: '20px' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        
        <button onClick={handleBackClick} style={{
          padding: '10px 20px',
          backgroundColor: '#6b7280',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '20px',
          fontWeight: '600'
        }}>
          ← Назад
        </button>

        {/* Exit Confirmation Modal */}
        {showExitConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <AlertCircle style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                  Имате незапазени данни
                </h3>
              </div>
              
              <p style={{ 
                marginBottom: '24px', 
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                Какво желаете да направите с въведените данни?
              </p>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <button
                  onClick={() => setShowExitConfirm(false)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '15px'
                  }}
                >
                  Отказ
                </button>
                
                <button
                  onClick={() => confirmExit(false)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '15px'
                  }}
                >
                  Изход без запазване
                </button>
                
                <button
                  onClick={() => confirmExit(true)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#195E33',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '15px'
                  }}
                >
                  Запази и излез
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #195E33, #2D7A4F)',
          borderRadius: '12px',
          marginBottom: '30px',
          padding: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          color: 'white',
          position: 'relative'
        }}>
          {/* Draft индикатор */}
          {hasDraft && (
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '8px 16px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              backdropFilter: 'blur(10px)'
            }}>
              <FileText style={{ width: '16px', height: '16px' }} />
              Работите по драфт
            </div>
          )}

          {/* Auto-save индикатор */}
          {autoSaveStatus && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: '#195E33',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              animation: 'fadeIn 0.3s ease-in'
            }}>
              {autoSaveStatus}
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', lineHeight: '1.4', margin: '0 0 16px 0' }}>
              КОНТРОЛНА КАРТА ХЛАДИЛНО СЪХРАНЕНИЕ
            </h2>
            <div style={{
              display: 'inline-block',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '12px 24px'
            }}>
              <p style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 4px 0' }}>
                Код: HCL 01
              </p>
              <p style={{ opacity: 0.8, margin: '0 0 4px 0', fontSize: '13px' }}>Редакция: 01</p>
              <p style={{ fontWeight: '600', fontSize: '13px', margin: 0 }}>Стр. 1 от 1</p>
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
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={addRefrigerator}
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
              Добави хладилник
            </button>
            
            <button
              onClick={addDateBlock}
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
              <Calendar style={{ width: '16px', height: '16px' }} />
              Добави дата
            </button>

            {hasDraft && (
              <button
                onClick={clearDraft}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: '#dc2626',
                  border: '2px solid #dc2626',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#dc2626';
                }}
              >
                <Trash2 style={{ width: '16px', height: '16px' }} />
                Започни нова контролна карта
              </button>
            )}
          </div>
        </div>

        {/* Main Tables */}
        {dateBlocks.map((block, blockIndex) => (
          <div key={block.id} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            marginBottom: '30px',
            border: '1px solid #E6F4EA'
          }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderBottom: '1px solid #E6F4EA'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Calendar style={{ width: '20px', height: '20px', color: '#195E33' }} />
                  <label style={{ fontWeight: '600', color: '#374151' }}>ДАТА:</label>
                  <input
                    type="date"
                    value={block.date}
                    onChange={(e) => updateDateBlock(block.id, 'date', e.target.value)}
                    style={{
                      padding: '10px',
                      border: '2px solid #195E33',
                      borderRadius: '8px'
                    }}
                  />
                </div>
                {dateBlocks.length > 1 && (
                  <button
                    onClick={() => removeDateBlock(block.id)}
                    style={{
                      marginLeft: 'auto',
                      color: '#dc2626',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '8px'
                    }}
                    title="Премахни дата"
                  >
                    <Trash2 style={{ width: '16px', height: '16px' }} />
                  </button>
                )}
              </div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #195E33, #2D7A4F)' }}>
                    <th rowSpan="2" style={{
                      padding: '16px',
                      color: 'white',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      borderRight: '1px solid rgba(255,255,255,0.2)',
                      minWidth: '100px'
                    }}>
                      № на хл. камера
                    </th>
                    {allRefrigerators.map((refrigerator) => (
                      <th key={refrigerator.id} colSpan="3" style={{
                        padding: '16px',
                        color: 'white',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        borderRight: '1px solid rgba(255,255,255,0.2)',
                        minWidth: '200px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                          <div style={{ flex: 1 }}>
                            {customRefrigerators.find(ref => ref.id === refrigerator.id) ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input
                                  type="text"
                                  value={refrigerator.name}
                                  onChange={(e) => updateRefrigerator(refrigerator.id, 'name', e.target.value)}
                                  style={{
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    padding: '8px',
                                    borderRadius: '6px',
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    width: '100%'
                                  }}
                                />
                                <select
                                  value={refrigerator.type}
                                  onChange={(e) => {
                                    const newType = e.target.value;
                                    const newTemp = newType === 'negative' ? '≤ -18°C' : '0-4°C';
                                    updateRefrigerator(refrigerator.id, 'type', newType);
                                    updateRefrigerator(refrigerator.id, 'temp', newTemp);
                                  }}
                                  style={{
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    padding: '8px',
                                    borderRadius: '6px',
                                    fontWeight: 'bold',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    width: '100%'
                                  }}
                                >
                                  <option value="positive" style={{ color: '#000' }}>Хладилна (+)</option>
                                  <option value="negative" style={{ color: '#000' }}>Минусова (-)</option>
                                </select>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div>{refrigerator.name}</div>
                                <div style={{ fontSize: '12px', opacity: 0.9 }}>
                                  {refrigerator.type === 'negative' ? 'Минусова' : 'Хладилна'}
                                </div>
                              </div>
                            )}
                          </div>
                          {customRefrigerators.find(ref => ref.id === refrigerator.id) && (
                            <button
                              onClick={() => removeRefrigerator(refrigerator.id)}
                              style={{
                                color: 'rgba(255,100,100,0.9)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 style={{ width: '16px', height: '16px' }} />
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                    <th rowSpan="2" style={{
                      padding: '16px',
                      color: 'white',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      borderRight: '1px solid rgba(255,255,255,0.2)',
                      minWidth: '120px'
                    }}>
                      КД и корекции
                    </th>
                    <th rowSpan="2" style={{
                      padding: '16px',
                      color: 'white',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      minWidth: '120px'
                    }}>
                      Проверил
                    </th>
                  </tr>
                  <tr style={{ background: 'linear-gradient(135deg, #195E33, #2D7A4F)' }}>
                    {allRefrigerators.map((refrigerator) => (
                      <th key={`${refrigerator.id}-temp`} colSpan="3" style={{
                        padding: '12px',
                        color: 'white',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        borderRight: '1px solid rgba(255,255,255,0.2)'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <Thermometer style={{ width: '16px', height: '16px' }} />
                            <span>ПОКАЗАНИЯ НА ТЕРМОМЕТЪР! °C</span>
                          </div>
                          <div style={{ fontSize: '13px' }}>
                            {customRefrigerators.find(ref => ref.id === refrigerator.id) ? (
                              <input
                                type="text"
                                value={refrigerator.temp}
                                onChange={(e) => updateRefrigerator(refrigerator.id, 'temp', e.target.value)}
                                placeholder="Температурен режим"
                                style={{
                                  backgroundColor: 'rgba(255,255,255,0.1)',
                                  color: 'white',
                                  padding: '8px',
                                  borderRadius: '6px',
                                  textAlign: 'center',
                                  fontWeight: 'bold',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  width: '100%'
                                }}
                              />
                            ) : (
                              <span style={{
                                padding: '4px 8px',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                borderRadius: '6px',
                                fontWeight: 'bold'
                              }}>
                                {refrigerator.temp}
                              </span>
                            )}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                  <tr style={{ background: 'linear-gradient(135deg, #195E33, #2D7A4F)' }}>
                    {allRefrigerators.map((refrigerator) => (
                      <th key={`${refrigerator.id}-desc`} colSpan="3" style={{
                        padding: '12px',
                        color: 'white',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        borderRight: '1px solid rgba(255,255,255,0.2)',
                        fontSize: '13px'
                      }}>
                        {customRefrigerators.find(ref => ref.id === refrigerator.id) ? (
                          <input
                            type="text"
                            value={refrigerator.description}
                            onChange={(e) => updateRefrigerator(refrigerator.id, 'description', e.target.value)}
                            placeholder="Описание"
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.1)',
                              color: 'white',
                              padding: '8px',
                              borderRadius: '6px',
                              textAlign: 'center',
                              border: '1px solid rgba(255,255,255,0.2)',
                              width: '100%'
                            }}
                          />
                        ) : (
                          refrigerator.description
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ backgroundColor: '#F0F7F0' }}>
                    <td style={{
                      padding: '12px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      color: '#195E33',
                      borderRight: '1px solid #E6F4EA'
                    }}>
                      Час на отчитане
                    </td>
                    {allRefrigerators.map((refrigerator) => (
                      <React.Fragment key={`${refrigerator.id}-times`}>
                        <td style={{
                          padding: '12px',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: '#195E33',
                          borderRight: '1px solid #E6F4EA'
                        }}>
                          8 h
                        </td>
                        <td style={{
                          padding: '12px',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: '#195E33',
                          borderRight: '1px solid #E6F4EA'
                        }}>
                          14h
                        </td>
                        <td style={{
                          padding: '12px',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: '#195E33',
                          borderRight: '1px solid #E6F4EA'
                        }}>
                          20h
                        </td>
                      </React.Fragment>
                    ))}
                    <td style={{ borderRight: '1px solid #E6F4EA' }}></td>
                    <td></td>
                  </tr>
                  
                  <tr>
                    <td style={{
                      padding: '12px',
                      borderRight: '1px solid #E6F4EA',
                      fontWeight: '500',
                      color: '#195E33'
                    }}>
                      Температура
                    </td>
                    {allRefrigerators.map((refrigerator) => (
                      <React.Fragment key={`${refrigerator.id}-${block.id}`}>
                        {timeSlots.map((timeSlot) => {
                          const reading = getReading(block.id, `${refrigerator.id}_${timeSlot}`);
                          const status = getTemperatureStatus(reading, refrigerator.temp);
                          
                          return (
                            <td key={`${refrigerator.id}-${timeSlot}-${block.id}`} style={{
                              padding: '12px',
                              borderRight: '1px solid #E6F4EA'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={reading}
                                  onChange={(e) => updateReading(block.id, `${refrigerator.id}_${timeSlot}`, e.target.value)}
                                  placeholder="°C"
                                  style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: status === 'warning' ? '2px solid #FB923C' : '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    textAlign: 'center',
                                    backgroundColor: status === 'warning' ? '#FFF7ED' : 'white',
                                    color: status === 'warning' ? '#C2410C' : '#374151'
                                  }}
                                />
                                {status === 'warning' && (
                                  <AlertTriangle style={{
                                    width: '16px',
                                    height: '16px',
                                    color: '#f97316'
                                  }} title="Температурата е извън нормата" />
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </React.Fragment>
                    ))}
                    <td style={{ padding: '12px', borderRight: '1px solid #E6F4EA' }}>
                      <textarea
                        value={getReading(block.id, 'corrective_actions')}
                        onChange={(e) => updateReading(block.id, 'corrective_actions', e.target.value)}
                        placeholder="Коректни действия"
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          resize: 'none'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                          type="text"
                          value={getReading(block.id, 'inspector_name')}
                          onChange={(e) => updateReading(block.id, 'inspector_name', e.target.value)}
                          list={`inspectors-${block.id}`}
                          placeholder="Име"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                        <input
                          type="text"
                          value={getReading(block.id, 'inspector_signature')}
                          onChange={(e) => updateReading(block.id, 'inspector_signature', e.target.value)}
                          placeholder="Подпис"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                        <datalist id={`inspectors-${block.id}`}>
                          {savedInspectors.map((name, index) => (
                            <option key={index} value={name} />
                          ))}
                        </datalist>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Instructions */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '24px',
          marginBottom: '30px',
          border: '1px solid #E6F4EA'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#195E33'
            }}></div>
            <h4 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              color: '#195E33'
            }}>
              Инструкции за попълване
            </h4>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: '#F0F7F0',
              borderLeft: '4px solid #195E33'
            }}>
              <p style={{
                margin: 0,
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#374151'
              }}>
                <strong style={{ color: '#195E33' }}>Честота на проверка:</strong> Температурата на хладилните камери се проверява 3 пъти дневно - в 8:00, 14:00 и 20:00 часа.
                Записвайте точните показания на термометрите.
              </p>
            </div>
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: '#F0F7F0',
              borderLeft: '4px solid #195E33'
            }}>
              <p style={{
                margin: 0,
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#374151'
              }}>
                <strong style={{ color: '#195E33' }}>При отклонения:</strong> Ако температурата е извън допустимите граници, предприемете незабавни коректни действия 
                и ги опишете в съответната колона. Известете отговорното лице.
              </p>
            </div>
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: '#FEF3C7',
              borderLeft: '4px solid #F59E0B'
            }}>
              <p style={{
                margin: 0,
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#374151'
              }}>
                <strong style={{ color: '#F59E0B' }}>Автоматично запазване:</strong> Вашата работа се запазва автоматично на всеки 30 секунди. 
                Можете спокойно да излезете и да продължите по-късно.
              </p>
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
            {loading ? 'Запазване...' : 'Запази контролна карта'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default RefrigeratorStorageControl;