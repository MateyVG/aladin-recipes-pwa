import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Calendar, Users, Droplet, AlertCircle, FileText } from 'lucide-react';

const OilChangeChecklist = ({ template = {}, config = {}, department = {}, restaurantId, onBack }) => {
  const [loading, setLoading] = useState(false);
  
  const [records, setRecords] = useState(Array.from({ length: 15 }, (_, i) => ({ 
    id: i + 1, 
    date: '', 
    shift: '',
    quantity: '',
    oilType: '',
    nameSignature: '',
    completed: false
  })));
  
  const [savedEmployees, setSavedEmployees] = useState([]);
  const [savedOilTypes, setSavedOilTypes] = useState([]);

  // Draft система
  const [hasDraft, setHasDraft] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [pendingExit, setPendingExit] = useState(false);

  const currentDate = new Date().toISOString().split('T')[0];

  // Проверка дали има въведени данни
  const hasAnyData = () => {
    return records.some(record => 
      record.date || 
      record.shift || 
      record.quantity || 
      record.oilType || 
      record.nameSignature || 
      record.completed
    );
  };

  // Запазване на драфт
  const saveDraft = () => {
    if (!hasAnyData()) return;

    const draftKey = `draft_${template.id}_${currentDate}`;
    const draftData = {
      records,
      savedEmployees,
      savedOilTypes,
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
        setRecords(draftData.records || records);
        setSavedEmployees(draftData.savedEmployees || []);
        setSavedOilTypes(draftData.savedOilTypes || []);
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
    setRecords(Array.from({ length: 15 }, (_, i) => ({ 
      id: i + 1, 
      date: '', 
      shift: '',
      quantity: '',
      oilType: '',
      nameSignature: '',
      completed: false
    })));
    
    setHasDraft(false);
    setAutoSaveStatus('Нов чек лист стартиран');
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
    } else {
      // Не запазваме драфт
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
  }, [records, savedEmployees, savedOilTypes, template.id, currentDate]);

  // Зареждане на запазени данни от предишни submissions
  useEffect(() => {
    const loadSavedData = async () => {
      if (!template?.id || !restaurantId) return;
      
      try {
        const { data, error } = await supabase
          .from('checklist_submissions')
          .select('data')
          .eq('template_id', template.id)
          .eq('restaurant_id', restaurantId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data?.data?.savedEmployees) {
          setSavedEmployees(prev => {
            const combined = [...new Set([...prev, ...data.data.savedEmployees])];
            return combined;
          });
        }
        if (data?.data?.savedOilTypes) {
          setSavedOilTypes(prev => {
            const combined = [...new Set([...prev, ...data.data.savedOilTypes])];
            return combined;
          });
        }
      } catch (error) {
        console.log('Няма предишни записи');
      }
    };

    loadSavedData();
  }, [template?.id, restaurantId]);

  const addRecord = () => {
    const newRecord = {
      id: Date.now(),
      date: '',
      shift: '',
      quantity: '',
      oilType: '',
      nameSignature: '',
      completed: false
    };
    setRecords([...records, newRecord]);
    
    setAutoSaveStatus('Добавен нов ред');
    setTimeout(() => setAutoSaveStatus(''), 2000);
  };

  const removeRecord = (id) => {
    if (records.length > 1) {
      setRecords(records.filter(record => record.id !== id));
      
      setAutoSaveStatus('Премахнат ред');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }
  };

  const updateRecord = (id, field, value) => {
    setRecords(records.map(record => 
      record.id === id ? { ...record, [field]: value } : record
    ));
    
    if (field === 'nameSignature' && value.trim() && !savedEmployees.includes(value.trim())) {
      setSavedEmployees([...savedEmployees, value.trim()]);
    }
    
    if (field === 'oilType' && value.trim() && !savedOilTypes.includes(value.trim())) {
      setSavedOilTypes([...savedOilTypes, value.trim()]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simulate supabase if not available
      if (typeof supabase === 'undefined') {
        console.log('Submission data:', {
          records,
          savedEmployees,
          savedOilTypes
        });
        
        // Изчистване на драфт и форма
        const draftKey = `draft_${template.id}_${currentDate}`;
        localStorage.removeItem(draftKey);
        setHasDraft(false);
        
        clearDraft();
        
        alert('Чек листът е запазен успешно! Сега можете да започнете нов чек лист.');
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      
      const submissionData = {
        template_id: template?.id,
        restaurant_id: restaurantId,
        department_id: department?.id,
        data: {
          records,
          savedEmployees,
          savedOilTypes
        },
        submitted_by: userData.user.id,
        submission_date: records[0]?.date || new Date().toISOString().split('T')[0],
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
      setRecords(Array.from({ length: 15 }, (_, i) => ({ 
        id: i + 1, 
        date: '', 
        shift: '',
        quantity: '',
        oilType: '',
        nameSignature: '',
        completed: false
      })));

      alert('Чек листът е запазен успешно! Сега можете да започнете нов чек лист.');
      
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
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', lineHeight: '1.4', margin: 0 }}>
              ЧЕК ЛИСТ ЗА ПОДМЯНА НА МАЗНИНАТА НА ФРИТЮРНИЦИТЕ
            </h2>
          </div>

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
              onClick={addRecord}
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
              Добави ред
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
                Започни нов чек лист
              </button>
            )}
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
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    minWidth: '120px'
                  }}>
                    Дата
                  </th>
                  <th style={{
                    padding: '16px',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    minWidth: '100px'
                  }}>
                    Смяна
                  </th>
                  <th style={{
                    padding: '16px',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    minWidth: '120px'
                  }}>
                    Количество
                  </th>
                  <th style={{
                    padding: '16px',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    minWidth: '150px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Droplet style={{ width: '16px', height: '16px' }} />
                      Вид фритюрник
                    </div>
                  </th>
                  <th style={{
                    padding: '16px',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    minWidth: '180px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Users style={{ width: '16px', height: '16px' }} />
                      Име Фамилия
                    </div>
                  </th>
                  <th style={{
                    padding: '16px',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    minWidth: '80px'
                  }}>
                    ✓
                  </th>
                  <th style={{
                    padding: '16px',
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    minWidth: '80px'
                  }}>
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => (
                  <tr key={record.id} style={{
                    backgroundColor: index % 2 === 0 ? 'white' : '#FAFBFC'
                  }}>
                    <td style={{ padding: '12px', borderRight: '1px solid #E6F4EA' }}>
                      <input
                        type="date"
                        value={record.date}
                        onChange={(e) => updateRecord(record.id, 'date', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px', borderRight: '1px solid #E6F4EA' }}>
                      <select
                        value={record.shift}
                        onChange={(e) => updateRecord(record.id, 'shift', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="">Избери</option>
                        <option value="Сутрешна">Сутрешна</option>
                        <option value="Дневна">Дневна</option>
                        <option value="Вечерна">Вечерна</option>
                        <option value="Нощна">Нощна</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px', borderRight: '1px solid #E6F4EA' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          step="0.1"
                          value={record.quantity}
                          onChange={(e) => updateRecord(record.id, 'quantity', e.target.value)}
                          placeholder="0.0"
                          style={{
                            flex: 1,
                            padding: '8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                        <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>л</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', borderRight: '1px solid #E6F4EA' }}>
                      <input
                        type="text"
                        value={record.oilType}
                        onChange={(e) => updateRecord(record.id, 'oilType', e.target.value)}
                        list={`oil-types-${record.id}`}
                        placeholder="Тип масло/мазнина"
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                      <datalist id={`oil-types-${record.id}`}>
                        {savedOilTypes.map((type, idx) => (
                          <option key={idx} value={type} />
                        ))}
                      </datalist>
                    </td>
                    <td style={{ padding: '12px', borderRight: '1px solid #E6F4EA' }}>
                      <input
                        type="text"
                        value={record.nameSignature}
                        onChange={(e) => updateRecord(record.id, 'nameSignature', e.target.value)}
                        list={`employees-${record.id}`}
                        placeholder="Име и фамилия"
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                      <datalist id={`employees-${record.id}`}>
                        {savedEmployees.map((name, idx) => (
                          <option key={idx} value={name} />
                        ))}
                      </datalist>
                    </td>
                    <td style={{ padding: '12px', borderRight: '1px solid #E6F4EA', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={record.completed}
                        onChange={(e) => updateRecord(record.id, 'completed', e.target.checked)}
                        style={{
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          accentColor: '#195E33'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {records.length > 1 && (
                        <button
                          onClick={() => removeRecord(record.id)}
                          style={{
                            color: '#dc2626',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '8px'
                          }}
                          title="Премахни ред"
                        >
                          <Trash2 style={{ width: '16px', height: '16px' }} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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
                <strong style={{ color: '#195E33' }}>Честота на смяна:</strong> Мазнината във фритюрниците трябва да се сменя редовно 
                според графика на обекта или при видими признаци на влошено качество.
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
                <strong style={{ color: '#195E33' }}>Документиране:</strong> Записвайте точната дата, смяна, количество и вид на използваната мазнина. 
                Всеки запис трябва да бъде маркиран с тикче от отговорния служител.
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
            {loading ? 'Запазване...' : 'Запази чек лист'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default OilChangeChecklist;