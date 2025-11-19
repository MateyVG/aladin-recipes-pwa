import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Plus, Trash2, ChefHat, CheckSquare, Square, Calendar, Building2, CheckCircle, RotateCcw, FileText, AlertCircle } from 'lucide-react';

const DonerProductionSheet = ({ template, config, department, restaurantId, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [manager, setManager] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [hasDraft, setHasDraft] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  const [savedEmployees, setSavedEmployees] = useState([]);
  
  const [productions, setProductions] = useState([
    {
      id: 1,
      number: 1,
      deliveryDateTime: '',
      weight: '',
      usedBefore: '',
      batchNumber: '',
      finishDateTime: '',
      employeeName: '',
      checked: false
    }
  ]);

  // Проверка дали има въведени данни
  const hasAnyData = () => {
    if (manager.trim()) return true;
    
    return productions.some(prod => 
      prod.deliveryDateTime || prod.weight || prod.usedBefore || 
      prod.batchNumber || prod.finishDateTime || prod.employeeName
    );
  };

  // Зареждане на драфт при старт
  useEffect(() => {
    const draftKey = `draft_${template.id}_${currentDate}`;
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft) {
      setHasDraft(true);
      try {
        const { productions: draftProductions, manager: draftManager, savedEmployees: draftEmployees, timestamp } = JSON.parse(savedDraft);
        const draftDate = new Date(timestamp);
        
        // Auto-load draft без да пита
        setProductions(draftProductions);
        setManager(draftManager || '');
        setSavedEmployees(draftEmployees || []);
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

      if (data?.data?.savedEmployees) {
        setSavedEmployees(data.data.savedEmployees);
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
  }, [productions, manager, savedEmployees]);

  const saveDraft = () => {
    if (!hasAnyData()) return; // Не запазва празни драфти
    
    const draftKey = `draft_${template.id}_${currentDate}`;
    localStorage.setItem(draftKey, JSON.stringify({
      productions,
      manager,
      savedEmployees,
      timestamp: Date.now()
    }));
    setHasDraft(true);
    setAutoSaveStatus('✓ Автоматично запазено');
    setTimeout(() => setAutoSaveStatus(''), 2000);
  };

  const clearDraft = () => {
    if (window.confirm('Сигурни ли сте, че искате да изчистите текущия драфт и да започнете нов производствен лист?')) {
      setProductions([
        {
          id: Date.now(),
          number: 1,
          deliveryDateTime: '',
          weight: '',
          usedBefore: '',
          batchNumber: '',
          finishDateTime: '',
          employeeName: '',
          checked: false
        }
      ]);
      setManager('');
      
      const draftKey = `draft_${template.id}_${currentDate}`;
      localStorage.removeItem(draftKey);
      setHasDraft(false);
      
      setAutoSaveStatus('Драфтът е изчистен. Започнете нов производствен лист.');
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

  const addProduction = () => {
    const newProduction = {
      id: Date.now(),
      number: productions.length + 1,
      deliveryDateTime: '',
      weight: '',
      usedBefore: '',
      batchNumber: '',
      finishDateTime: '',
      employeeName: '',
      checked: false
    };
    setProductions([...productions, newProduction]);
  };

  const removeProduction = (id) => {
    if (productions.length > 1) {
      const updatedProductions = productions.filter(prod => prod.id !== id);
      const renumberedProductions = updatedProductions.map((prod, index) => ({
        ...prod,
        number: index + 1
      }));
      setProductions(renumberedProductions);
    }
  };

  const updateProduction = (id, field, value) => {
    setProductions(productions.map(prod => 
      prod.id === id ? { ...prod, [field]: value } : prod
    ));
    
    if (field === 'employeeName' && value.trim() && !savedEmployees.includes(value.trim())) {
      setSavedEmployees([...savedEmployees, value.trim()]);
    }
  };

  const handleSubmit = async () => {
    if (!hasAnyData()) {
      alert('Моля попълнете поне едно поле преди да запазите производствения лист.');
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
          manager,
          productions,
          savedEmployees
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

      alert('Производственият лист е запазен успешно! Сега можете да започнете нов производствен лист.');
      
      // Рестартирай формата за нов запис
      setProductions([
        {
          id: Date.now(),
          number: 1,
          deliveryDateTime: '',
          weight: '',
          usedBefore: '',
          batchNumber: '',
          finishDateTime: '',
          employeeName: '',
          checked: false
        }
      ]);
      setManager('');
      
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
              Имате попълнени данни в производствения лист. Какво искате да направите?
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

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
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
              Започни нов производствен лист
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
          border: '1px solid #E6F4EA'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <ChefHat style={{ width: '48px', height: '48px', color: '#195E33' }} />
              </div>
              
              <div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: 'white',
                  margin: 0
                }}>
                  ПРОИЗВОДСТВЕН ЛИСТ<br/>ДЮНЕР
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
            </div>
            
            <div style={{
              textAlign: 'right',
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <p style={{ fontWeight: 'bold', fontSize: '16px', margin: '0 0 8px 0' }}>
                Код: ПРП 8.0.4
              </p>
              <p style={{ opacity: 0.9, margin: '0 0 8px 0' }}>Редакция: 00</p>
              <p style={{ fontWeight: '600', margin: 0 }}>Стр. 1 от 1</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: '#E6F4EA'
              }}>
                <Calendar style={{ width: '20px', height: '20px', color: '#195E33' }} />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Дата:
                </label>
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  style={{
                    padding: '10px',
                    border: '2px solid #E6F4EA',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: '#E6F4EA'
              }}>
                <Building2 style={{ width: '20px', height: '20px', color: '#195E33' }} />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Управител:
                </label>
                <input
                  type="text"
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  placeholder="Име и фамилия"
                  style={{
                    padding: '10px',
                    border: '2px solid #E6F4EA',
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
                fontWeight: '600'
              }}>
                <CheckCircle style={{ width: '16px', height: '16px' }} />
                {autoSaveStatus}
              </div>
            )}

            <div style={{ marginLeft: 'auto' }}>
              <button
                onClick={addProduction}
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
                Добави запис
              </button>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px 12px 0 0',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: 0, color: '#195E33', fontSize: '18px', fontWeight: 'bold' }}>
            Шиш за дюнер
          </h3>
        </div>

        {/* Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0 0 12px 12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#195E33' }}>
                <tr>
                  <th style={{
                    padding: '14px',
                    color: 'white',
                    fontWeight: '600',
                    textAlign: 'center',
                    minWidth: '60px',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '13px'
                  }}>
                    №
                  </th>
                  <th style={{
                    padding: '14px',
                    color: 'white',
                    fontWeight: '600',
                    textAlign: 'center',
                    minWidth: '160px',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '13px'
                  }}>
                    Дата, час на доставяне
                  </th>
                  <th style={{
                    padding: '14px',
                    color: 'white',
                    fontWeight: '600',
                    textAlign: 'center',
                    minWidth: '120px',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '13px'
                  }}>
                    тегло, кг
                  </th>
                  <th style={{
                    padding: '14px',
                    color: 'white',
                    fontWeight: '600',
                    textAlign: 'center',
                    minWidth: '140px',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '13px'
                  }}>
                    Използвай преди:
                  </th>
                  <th style={{
                    padding: '14px',
                    color: 'white',
                    fontWeight: '600',
                    textAlign: 'center',
                    minWidth: '120px',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '13px'
                  }}>
                    Партиден номер
                  </th>
                  <th style={{
                    padding: '14px',
                    color: 'white',
                    fontWeight: '600',
                    textAlign: 'center',
                    minWidth: '160px',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '13px'
                  }}>
                    Дата, час на приключване
                  </th>
                  <th style={{
                    padding: '14px',
                    color: 'white',
                    fontWeight: '600',
                    textAlign: 'center',
                    minWidth: '150px',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '13px'
                  }}>
                    Служител
                  </th>
                  <th style={{
                    padding: '14px',
                    color: 'white',
                    fontWeight: '600',
                    textAlign: 'center',
                    minWidth: '60px',
                    fontSize: '13px'
                  }}>
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {productions.map((production, index) => (
                  <tr 
                    key={production.id}
                    style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}
                  >
                    <td style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontWeight: '600',
                      borderRight: '1px solid #e5e7eb',
                      color: '#195E33'
                    }}>
                      {production.number}
                    </td>
                    <td style={{ padding: '12px', borderRight: '1px solid #e5e7eb' }}>
                      <input
                        type="datetime-local"
                        value={production.deliveryDateTime}
                        onChange={(e) => updateProduction(production.id, 'deliveryDateTime', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px', borderRight: '1px solid #e5e7eb' }}>
                      <input
                        type="number"
                        step="0.01"
                        value={production.weight}
                        onChange={(e) => updateProduction(production.id, 'weight', e.target.value)}
                        placeholder="кг"
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px', borderRight: '1px solid #e5e7eb' }}>
                      <input
                        type="datetime-local"
                        value={production.usedBefore}
                        onChange={(e) => updateProduction(production.id, 'usedBefore', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px', borderRight: '1px solid #e5e7eb' }}>
                      <input
                        type="text"
                        value={production.batchNumber}
                        onChange={(e) => updateProduction(production.id, 'batchNumber', e.target.value)}
                        placeholder="Партида"
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px', borderRight: '1px solid #e5e7eb' }}>
                      <input
                        type="datetime-local"
                        value={production.finishDateTime}
                        onChange={(e) => updateProduction(production.id, 'finishDateTime', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px', borderRight: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => updateProduction(production.id, 'checked', !production.checked)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: production.checked ? '#195E33' : '#9CA3AF'
                          }}
                        >
                          {production.checked ? 
                            <CheckSquare style={{ width: '20px', height: '20px' }} /> : 
                            <Square style={{ width: '20px', height: '20px' }} />
                          }
                        </button>
                        <input
                          type="text"
                          value={production.employeeName}
                          onChange={(e) => updateProduction(production.id, 'employeeName', e.target.value)}
                          list={`employee-names-${production.id}`}
                          placeholder="Име на служителя"
                          style={{
                            flex: 1,
                            padding: '8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                        <datalist id={`employee-names-${production.id}`}>
                          {savedEmployees.map((name, idx) => (
                            <option key={idx} value={name} />
                          ))}
                        </datalist>
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {productions.length > 1 && (
                        <button
                          onClick={() => removeProduction(production.id)}
                          style={{
                            color: '#dc2626',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          title="Премахни запис"
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

        {/* Footer */}
        <div style={{
          marginTop: '30px',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#6b7280'
          }}>
            <span style={{ fontWeight: '500' }}>
              Дата: <span style={{ fontWeight: '700', color: '#195E33' }}>{currentDate}</span>
            </span>
            <span style={{ fontWeight: '500' }}>
              Управител: <span style={{ fontWeight: '700', color: '#195E33' }}>
                {manager || '(Управител)'}
              </span>
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{
          marginTop: '30px',
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
            {loading ? 'Запазване...' : 'Запази производствен лист и започни нов'}
          </button>
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#6b7280' }}>
            След запазване, формата ще се изчисти и ще можете да започнете нов производствен лист
          </p>
        </div>

      </div>
    </div>
  );
};

export default DonerProductionSheet;