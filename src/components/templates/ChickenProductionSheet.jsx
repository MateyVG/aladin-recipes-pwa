import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Plus, Trash2, CheckSquare, Square, Calendar, Building2, CheckCircle, RotateCcw, FileText, AlertCircle } from 'lucide-react';

const ChickenProductionSheet = ({ template, config, department, restaurantId, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [manager, setManager] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [hasDraft, setHasDraft] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  const [savedEmployees, setSavedEmployees] = useState([]);
  
  const [productions, setProductions] = useState({
    file: [
      {
        id: 1,
        number: 1,
        count: '',
        batchL: '',
        fryDuration: '4,5 мин',
        fryTemperature: '340°F',
        cookingTime: '',
        displayTime: '',
        defect: '',
        employeeName: '',
        checked: false
      }
    ],
    bonFile: [
      {
        id: 1,
        number: 1,
        quantity: '',
        batchL: '',
        fryDuration: '2,5 мин',
        fryTemperature: '340°F',
        cookingTime: '',
        displayTime: '',
        defect: '',
        employeeName: '',
        checked: false
      }
    ],
    wings: [
      {
        id: 1,
        number: 1,
        quantity: '',
        batchL: '',
        fryDuration: '11,5 мин',
        fryTemperature: '345°F',
        cookingTime: '',
        displayTime: '',
        defect: '',
        employeeName: '',
        checked: false
      }
    ],
    rice: [
      {
        id: 1,
        number: 1,
        quantity: '',
        batchL: '',
        cookingTime: '',
        displayTime: '',
        defect: '',
        employeeName: '',
        checked: false
      }
    ]
  });

  // Проверка дали има въведени данни
  const hasAnyData = () => {
    if (manager.trim()) return true;
    
    return Object.values(productions).some(typeArray =>
      typeArray.some(prod => 
        prod.count || prod.quantity || prod.batchL || prod.cookingTime || 
        prod.displayTime || prod.defect || prod.employeeName
      )
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
      setProductions({
        file: [
          {
            id: Date.now(),
            number: 1,
            count: '',
            batchL: '',
            fryDuration: '4,5 мин',
            fryTemperature: '340°F',
            cookingTime: '',
            displayTime: '',
            defect: '',
            employeeName: '',
            checked: false
          }
        ],
        bonFile: [
          {
            id: Date.now() + 1,
            number: 1,
            quantity: '',
            batchL: '',
            fryDuration: '2,5 мин',
            fryTemperature: '340°F',
            cookingTime: '',
            displayTime: '',
            defect: '',
            employeeName: '',
            checked: false
          }
        ],
        wings: [
          {
            id: Date.now() + 2,
            number: 1,
            quantity: '',
            batchL: '',
            fryDuration: '11,5 мин',
            fryTemperature: '345°F',
            cookingTime: '',
            displayTime: '',
            defect: '',
            employeeName: '',
            checked: false
          }
        ],
        rice: [
          {
            id: Date.now() + 3,
            number: 1,
            quantity: '',
            batchL: '',
            cookingTime: '',
            displayTime: '',
            defect: '',
            employeeName: '',
            checked: false
          }
        ]
      });
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

  const addProduction = (type) => {
    const currentLength = productions[type].length;
    const newProduction = {
      id: Date.now(),
      number: currentLength + 1,
      count: type === 'file' ? '' : undefined,
      quantity: type !== 'file' ? '' : undefined,
      batchL: '',
      fryDuration: type === 'file' ? '4,5 мин' : type === 'bonFile' ? '2,5 мин' : type === 'wings' ? '11,5 мин' : undefined,
      fryTemperature: type === 'wings' ? '345°F' : type === 'rice' ? undefined : '340°F',
      cookingTime: '',
      displayTime: '',
      defect: '',
      employeeName: '',
      checked: false
    };
    
    setProductions(prev => ({
      ...prev,
      [type]: [...prev[type], newProduction]
    }));
  };

  const removeProduction = (type, id) => {
    if (productions[type].length > 1) {
      const updatedProductions = productions[type].filter(prod => prod.id !== id);
      const renumberedProductions = updatedProductions.map((prod, index) => ({
        ...prod,
        number: index + 1
      }));
      setProductions(prev => ({
        ...prev,
        [type]: renumberedProductions
      }));
    }
  };

  const updateProduction = (type, id, field, value) => {
    setProductions(prev => ({
      ...prev,
      [type]: prev[type].map(prod => 
        prod.id === id ? { ...prod, [field]: value } : prod
      )
    }));
    
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
      setProductions({
        file: [
          {
            id: Date.now(),
            number: 1,
            count: '',
            batchL: '',
            fryDuration: '4,5 мин',
            fryTemperature: '340°F',
            cookingTime: '',
            displayTime: '',
            defect: '',
            employeeName: '',
            checked: false
          }
        ],
        bonFile: [
          {
            id: Date.now() + 1,
            number: 1,
            quantity: '',
            batchL: '',
            fryDuration: '2,5 мин',
            fryTemperature: '340°F',
            cookingTime: '',
            displayTime: '',
            defect: '',
            employeeName: '',
            checked: false
          }
        ],
        wings: [
          {
            id: Date.now() + 2,
            number: 1,
            quantity: '',
            batchL: '',
            fryDuration: '11,5 мин',
            fryTemperature: '345°F',
            cookingTime: '',
            displayTime: '',
            defect: '',
            employeeName: '',
            checked: false
          }
        ],
        rice: [
          {
            id: Date.now() + 3,
            number: 1,
            quantity: '',
            batchL: '',
            cookingTime: '',
            displayTime: '',
            defect: '',
            employeeName: '',
            checked: false
          }
        ]
      });
      setManager('');
      
      // Остава на страницата за нов запис
    } catch (error) {
      console.error('Submit error:', error);
      alert('Грешка при запазване: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (type, title, productionsList) => {
    const isFile = type === 'file';
    const isRice = type === 'rice';
    const quantityLabel = isFile ? 'Бройка' : 'Количество,кг';
    
    return (
      <div style={{ marginBottom: '30px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px 12px 0 0',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, color: '#195E33', fontSize: '18px', fontWeight: 'bold' }}>
            {title}
          </h3>
          <button
            onClick={() => addProduction(type)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
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
            Добави
          </button>
        </div>

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
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    textAlign: 'center',
                    minWidth: '50px',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '13px'
                  }}>
                    №
                  </th>
                  <th style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    textAlign: 'center',
                    minWidth: '100px',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '13px'
                  }}>
                    {quantityLabel}
                  </th>
                  <th style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    textAlign: 'center',
                    minWidth: '80px',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '13px'
                  }}>
                    Парт. L
                  </th>
                  {!isRice && (
                    <>
                      <th style={{
                        padding: '12px',
                        color: 'white',
                        fontWeight: '600',
                        textAlign: 'center',
                        minWidth: '120px',
                        borderRight: '1px solid rgba(255,255,255,0.2)',
                        fontSize: '13px'
                      }}>
                        Продължит. пържене-{productionsList[0]?.fryDuration}
                      </th>
                      <th style={{
                        padding: '12px',
                        color: 'white',
                        fontWeight: '600',
                        textAlign: 'center',
                        minWidth: '120px',
                        borderRight: '1px solid rgba(255,255,255,0.2)',
                        fontSize: '13px'
                      }}>
                        Температура на пържене-{productionsList[0]?.fryTemperature}
                      </th>
                    </>
                  )}
                  <th style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    textAlign: 'center',
                    minWidth: '120px',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '13px'
                  }}>
                    Час на приготвяне
                  </th>
                  <th style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    textAlign: 'center',
                    minWidth: '120px',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '13px'
                  }}>
                    Час на срок на витрината
                  </th>
                  <th style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    textAlign: 'center',
                    minWidth: '100px',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '13px'
                  }}>
                    Брак
                  </th>
                  <th style={{
                    padding: '12px',
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
                    padding: '12px',
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
                {productionsList.map((production, index) => (
                  <tr 
                    key={production.id}
                    style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}
                  >
                    <td style={{
                      padding: '10px',
                      textAlign: 'center',
                      fontWeight: '600',
                      borderRight: '1px solid #e5e7eb',
                      color: '#195E33'
                    }}>
                      {production.number}
                    </td>
                    <td style={{ padding: '10px', borderRight: '1px solid #e5e7eb' }}>
                      <input
                        type={isFile ? "number" : "text"}
                        value={isFile ? production.count || '' : production.quantity || ''}
                        onChange={(e) => updateProduction(type, production.id, isFile ? 'count' : 'quantity', e.target.value)}
                        placeholder={isFile ? "бр." : "кг"}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '10px', borderRight: '1px solid #e5e7eb' }}>
                      <input
                        type="text"
                        value={production.batchL}
                        onChange={(e) => updateProduction(type, production.id, 'batchL', e.target.value)}
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
                    {!isRice && (
                      <>
                        <td style={{
                          padding: '10px',
                          textAlign: 'center',
                          borderRight: '1px solid #e5e7eb'
                        }}>
                          <span style={{ fontSize: '14px', fontWeight: '500', color: '#195E33' }}>
                            {production.fryDuration}
                          </span>
                        </td>
                        <td style={{
                          padding: '10px',
                          textAlign: 'center',
                          borderRight: '1px solid #e5e7eb'
                        }}>
                          <span style={{ fontSize: '14px', fontWeight: '500', color: '#195E33' }}>
                            {production.fryTemperature}
                          </span>
                        </td>
                      </>
                    )}
                    <td style={{ padding: '10px', borderRight: '1px solid #e5e7eb' }}>
                      <input
                        type="time"
                        value={production.cookingTime}
                        onChange={(e) => updateProduction(type, production.id, 'cookingTime', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '10px', borderRight: '1px solid #e5e7eb' }}>
                      <input
                        type="time"
                        value={production.displayTime}
                        onChange={(e) => updateProduction(type, production.id, 'displayTime', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '10px', borderRight: '1px solid #e5e7eb' }}>
                      <input
                        type="text"
                        value={production.defect}
                        onChange={(e) => updateProduction(type, production.id, 'defect', e.target.value)}
                        placeholder="Брак"
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '10px', borderRight: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => updateProduction(type, production.id, 'checked', !production.checked)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: production.checked ? '#195E33' : '#9CA3AF'
                          }}
                        >
                          {production.checked ? 
                            <CheckSquare style={{ width: '18px', height: '18px' }} /> : 
                            <Square style={{ width: '18px', height: '18px' }} />
                          }
                        </button>
                        <input
                          type="text"
                          value={production.employeeName}
                          onChange={(e) => updateProduction(type, production.id, 'employeeName', e.target.value)}
                          list={`employee-names-${type}-${production.id}`}
                          placeholder="Служител"
                          style={{
                            flex: 1,
                            padding: '8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                        <datalist id={`employee-names-${type}-${production.id}`}>
                          {savedEmployees.map((name, idx) => (
                            <option key={idx} value={name} />
                          ))}
                        </datalist>
                      </div>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      {productionsList.length > 1 && (
                        <button
                          onClick={() => removeProduction(type, production.id)}
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
      </div>
    );
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
          padding: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: 'white',
            margin: 0
          }}>
            ПРОИЗВОДСТВЕН ЛИСТ<br/>ЧИКЪН
          </h1>
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
          </div>
        </div>

        {/* Tables */}
        {renderTable('file', 'Филе', productions.file)}
        {renderTable('bonFile', 'Бон филе', productions.bonFile)}
        {renderTable('wings', 'Крилца', productions.wings)}
        {renderTable('rice', 'Ориз', productions.rice)}

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
              Утвърждавам: <span style={{ fontWeight: '700', color: '#195E33' }}>
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

export default ChickenProductionSheet;