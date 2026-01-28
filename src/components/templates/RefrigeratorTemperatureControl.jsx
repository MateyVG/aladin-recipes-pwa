import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Plus, Trash2, Calendar, Thermometer, AlertCircle, FileText } from 'lucide-react';

const RefrigeratorTemperatureControl = ({ template = {}, config = {}, department = {}, restaurantId, onBack }) => {
  const [loading, setLoading] = useState(false);
  
  const [defaultColumns] = useState([
    { id: 'hot_display', name: 'Топла витрина', temp: '≥ 63°C', unit: 'Пица' },
    { id: 'cold_pizza', name: 'Студена витрина', temp: '0°C÷4°C', unit: 'Пица' },
    { id: 'cold_doner', name: 'Студена витрина', temp: '0°C÷4°C', unit: 'Дюнер' },
    { id: 'hot_clean', name: 'Топла витрина', temp: '≥ 63°C', unit: 'Чикън' }
  ]);
  
  const [customColumns, setCustomColumns] = useState([]);
  const [rows, setRows] = useState(Array.from({ length: 10 }, (_, i) => ({ 
    id: i, 
    date: '', 
    data: {},
    corrective: '',
    checkedBy: '',
    signed: false
  })));
  
  const [savedInspectors, setSavedInspectors] = useState([]);

  // Draft система
  const [hasDraft, setHasDraft] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [pendingExit, setPendingExit] = useState(false);

  const currentDate = new Date().toISOString().split('T')[0];

  const allColumns = [...defaultColumns, ...customColumns];

  // Проверка дали има въведени данни
  const hasAnyData = () => {
    // Проверка за custom колони
    if (customColumns.length > 0) return true;
    
    // Проверка за попълнени редове
    return rows.some(row => 
      row.date || 
      row.corrective || 
      row.checkedBy || 
      row.signed ||
      Object.keys(row.data).some(key => row.data[key])
    );
  };

  // Запазване на драфт
  const saveDraft = () => {
    if (!hasAnyData()) return;

    const draftKey = `draft_${template.id}_${currentDate}`;
    const draftData = {
      customColumns,
      rows,
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
        setCustomColumns(draftData.customColumns || []);
        setRows(draftData.rows || Array.from({ length: 10 }, (_, i) => ({ 
          id: i, 
          date: '', 
          data: {},
          corrective: '',
          checkedBy: '',
          signed: false
        })));
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
    setCustomColumns([]);
    setRows(Array.from({ length: 10 }, (_, i) => ({ 
      id: i, 
      date: '', 
      data: {},
      corrective: '',
      checkedBy: '',
      signed: false
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
  }, [customColumns, rows, savedInspectors, template.id, currentDate]);

  const addColumn = () => {
    const newColumn = {
      id: Date.now().toString(),
      name: 'Нова витрина',
      temp: '0°C÷4°C',
      unit: 'Продукт'
    };
    setCustomColumns([...customColumns, newColumn]);
    
    setAutoSaveStatus('Добавена нова колона');
    setTimeout(() => setAutoSaveStatus(''), 2000);
  };

  const removeColumn = (id) => {
    setCustomColumns(customColumns.filter(col => col.id !== id));
    const updatedRows = rows.map(row => {
      const newData = { ...row.data };
      delete newData[`${id}_8`];
      delete newData[`${id}_19`];
      return { ...row, data: newData };
    });
    setRows(updatedRows);
    
    setAutoSaveStatus('Премахната колона');
    setTimeout(() => setAutoSaveStatus(''), 2000);
  };

  const updateColumn = (id, field, value) => {
    setCustomColumns(customColumns.map(col => 
      col.id === id ? { ...col, [field]: value } : col
    ));
  };

  const addRow = () => {
    const newRow = {
      id: Date.now(),
      date: '',
      data: {},
      corrective: '',
      checkedBy: '',
      signed: false
    };
    setRows([...rows, newRow]);
    
    setAutoSaveStatus('Добавен нов ред');
    setTimeout(() => setAutoSaveStatus(''), 2000);
  };

  const removeRow = (id) => {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id));
      
      setAutoSaveStatus('Премахнат ред');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }
  };

  const updateRow = (id, field, value) => {
    setRows(rows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
    
    if (field === 'checkedBy' && value.trim() && !savedInspectors.includes(value.trim())) {
      setSavedInspectors([...savedInspectors, value.trim()]);
    }
  };

  const updateCellData = (rowId, columnId, timeSlot, value) => {
    const key = `${columnId}_${timeSlot}`;
    setRows(rows.map(row => 
      row.id === rowId ? { 
        ...row, 
        data: { ...row.data, [key]: value }
      } : row
    ));
  };

  const getCellData = (rowId, columnId, timeSlot) => {
    const row = rows.find(r => r.id === rowId);
    const key = `${columnId}_${timeSlot}`;
    return row?.data[key] || '';
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
          customColumns,
          rows,
          savedInspectors
        },
        submitted_by: userData.user.id,
        submission_date: rows.find(r => r.date)?.date || new Date().toISOString().split('T')[0],
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
      setCustomColumns([]);
      setRows(Array.from({ length: 10 }, (_, i) => ({ 
        id: i, 
        date: '', 
        data: {},
        corrective: '',
        checkedBy: '',
        signed: false
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '20px' }}>
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
                    backgroundColor: '#1a5d33',
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

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '30px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a5d33, #2d7a4f)',
            padding: '30px',
            borderRadius: '8px',
            color: 'white',
            marginBottom: '20px',
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
                color: '#1a5d33',
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

            <h1 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>
              Контрол на температурата на хладилни витрини
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
              Дневен запис на температурни измервания
            </p>
          </div>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button onClick={addColumn} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: 'white',
              color: '#1a5d33',
              border: '2px solid #1a5d33',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}>
              <Plus style={{ width: '16px', height: '16px' }} />
              Добави колона
            </button>
            
            <button onClick={addRow} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: 'white',
              color: '#1a5d33',
              border: '2px solid #1a5d33',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}>
              <Plus style={{ width: '16px', height: '16px' }} />
              Добави ред
            </button>

            {hasDraft && (
              <button
                onClick={clearDraft}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
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

        {/* Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #1a5d33, #2d7a4f)' }}>
                  <th rowSpan="3" style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '13px',
                    textAlign: 'center',
                    minWidth: '80px',
                    borderRight: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    Вид на витрината
                  </th>
                  {allColumns.map((column) => (
                    <th key={column.id} colSpan="2" style={{
                      padding: '12px',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '13px',
                      textAlign: 'center',
                      minWidth: '140px',
                      borderRight: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <div style={{ flex: 1 }}>
                          {customColumns.find(col => col.id === column.id) ? (
                            <input
                              type="text"
                              value={column.name}
                              onChange={(e) => updateColumn(column.id, 'name', e.target.value)}
                              style={{
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                textAlign: 'center',
                                fontWeight: '600',
                                width: '100%'
                              }}
                            />
                          ) : (
                            column.name
                          )}
                        </div>
                        {customColumns.find(col => col.id === column.id) && (
                          <button
                            onClick={() => removeColumn(column.id)}
                            style={{
                              color: '#fca5a5',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                          >
                            <Trash2 style={{ width: '16px', height: '16px' }} />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th rowSpan="3" style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '13px',
                    textAlign: 'center',
                    minWidth: '120px',
                    borderRight: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    Коректни действия
                  </th>
                  <th rowSpan="3" style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '13px',
                    textAlign: 'center',
                    minWidth: '120px',
                    borderRight: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    Проверил
                  </th>
                  <th rowSpan="3" style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '13px',
                    textAlign: 'center',
                    minWidth: '80px',
                    borderRight: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    Подпис
                  </th>
                  <th rowSpan="3" style={{
                    padding: '8px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '13px',
                    textAlign: 'center',
                    minWidth: '50px'
                  }}>
                    Действия
                  </th>
                </tr>
                <tr style={{ background: 'linear-gradient(135deg, #1a5d33, #2d7a4f)' }}>
                  {allColumns.map((column) => (
                    <th key={`${column.id}-temp`} colSpan="2" style={{
                      padding: '10px',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '12px',
                      textAlign: 'center',
                      borderRight: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      {customColumns.find(col => col.id === column.id) ? (
                        <input
                          type="text"
                          value={column.temp}
                          onChange={(e) => updateColumn(column.id, 'temp', e.target.value)}
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            padding: '6px',
                            borderRadius: '4px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            textAlign: 'center',
                            fontWeight: '600',
                            width: '100%'
                          }}
                        />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <Thermometer style={{ width: '14px', height: '14px' }} />
                          {column.temp}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
                <tr style={{ background: 'linear-gradient(135deg, #1a5d33, #2d7a4f)' }}>
                  {allColumns.map((column) => (
                    <th key={`${column.id}-unit`} colSpan="2" style={{
                      padding: '10px',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '12px',
                      textAlign: 'center',
                      borderRight: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      {customColumns.find(col => col.id === column.id) ? (
                        <input
                          type="text"
                          value={column.unit}
                          onChange={(e) => updateColumn(column.id, 'unit', e.target.value)}
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            padding: '6px',
                            borderRadius: '4px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            textAlign: 'center',
                            fontWeight: '600',
                            width: '100%'
                          }}
                        />
                      ) : (
                        column.unit
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: '#f0f7f0' }}>
                  <td style={{
                    padding: '10px',
                    fontWeight: '600',
                    color: '#1a5d33',
                    textAlign: 'center',
                    borderRight: '1px solid #e5e7eb'
                  }}>
                    Дата:
                  </td>
                  {allColumns.map((column) => (
                    <React.Fragment key={`${column.id}-times`}>
                      <td style={{
                        padding: '10px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#1a5d33',
                        borderRight: '1px solid #e5e7eb'
                      }}>
                        8ч
                      </td>
                      <td style={{
                        padding: '10px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#1a5d33',
                        borderRight: '1px solid #e5e7eb'
                      }}>
                        19ч
                      </td>
                    </React.Fragment>
                  ))}
                  <td style={{ borderRight: '1px solid #e5e7eb' }}></td>
                  <td style={{ borderRight: '1px solid #e5e7eb' }}></td>
                  <td style={{ borderRight: '1px solid #e5e7eb' }}></td>
                  <td></td>
                </tr>
                
                {rows.map((row, index) => (
                  <tr key={row.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#fafbfc' }}>
                    <td style={{ padding: '8px', borderRight: '1px solid #e5e7eb' }}>
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) => updateRow(row.id, 'date', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '13px'
                        }}
                      />
                    </td>
                    {allColumns.map((column) => (
                      <React.Fragment key={`${column.id}-${row.id}`}>
                        <td style={{ padding: '8px', borderRight: '1px solid #e5e7eb' }}>
                          <input
                            type="number"
                            value={getCellData(row.id, column.id, '8')}
                            onChange={(e) => updateCellData(row.id, column.id, '8', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '13px',
                              textAlign: 'center'
                            }}
                            placeholder="°C"
                          />
                        </td>
                        <td style={{ padding: '8px', borderRight: '1px solid #e5e7eb' }}>
                          <input
                            type="number"
                            value={getCellData(row.id, column.id, '19')}
                            onChange={(e) => updateCellData(row.id, column.id, '19', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '13px',
                              textAlign: 'center'
                            }}
                            placeholder="°C"
                          />
                        </td>
                      </React.Fragment>
                    ))}
                    <td style={{ padding: '8px', borderRight: '1px solid #e5e7eb' }}>
                      <input
                        type="text"
                        value={row.corrective}
                        onChange={(e) => updateRow(row.id, 'corrective', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '13px'
                        }}
                        placeholder="Действия"
                      />
                    </td>
                    <td style={{ padding: '8px', borderRight: '1px solid #e5e7eb' }}>
                      <input
                        type="text"
                        value={row.checkedBy}
                        onChange={(e) => updateRow(row.id, 'checkedBy', e.target.value)}
                        list={`inspectors-${row.id}`}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '13px'
                        }}
                        placeholder="Име"
                      />
                      <datalist id={`inspectors-${row.id}`}>
                        {savedInspectors.map((name, index) => (
                          <option key={index} value={name} />
                        ))}
                      </datalist>
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #e5e7eb' }}>
                      <input
                        type="checkbox"
                        checked={row.signed}
                        onChange={(e) => updateRow(row.id, 'signed', e.target.checked)}
                        style={{
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          accentColor: '#1a5d33'
                        }}
                      />
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      {rows.length > 1 && (
                        <button
                          onClick={() => removeRow(row.id)}
                          style={{
                            color: '#dc2626',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
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
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <AlertCircle style={{ color: '#1a5d33', width: '20px', height: '20px' }} />
            <h4 style={{ margin: 0, color: '#1a5d33', fontSize: '16px' }}>
              Инструкции за попълване
            </h4>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              padding: '15px',
              borderRadius: '8px',
              backgroundColor: '#f0fdf4',
              borderLeft: '4px solid #1a5d33'
            }}>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#374151' }}>
                <strong style={{ color: '#1a5d33' }}>Важно:</strong> Записвайте температурата на витрините два пъти дневно - в 8:00 ч и в 19:00 ч. 
                Топлите витрини трябва да поддържат температура ≥ 63°C, а студените витрини между 0°C и 4°C.
              </p>
            </div>
            <div style={{
              padding: '15px',
              borderRadius: '8px',
              backgroundColor: '#FEF3C7',
              borderLeft: '4px solid #F59E0B'
            }}>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#374151' }}>
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
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '20px',
          textAlign: 'center'
        }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '15px 40px',
              backgroundColor: loading ? '#9ca3af' : '#1a5d33',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px'
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

export default RefrigeratorTemperatureControl;