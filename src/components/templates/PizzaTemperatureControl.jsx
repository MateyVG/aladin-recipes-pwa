// src/components/templates/PizzaTemperatureControl.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Calendar, Thermometer, BarChart3, AlertCircle, Copy, Download, Zap, CheckCircle, RotateCcw, FileText } from 'lucide-react';

const PizzaTemperatureControl = ({ template, config, department, restaurantId, onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [bulkTemp, setBulkTemp] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [hasDraft, setHasDraft] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const inputRefs = useRef({});
  
  const pizzaTypes = config?.pizza_types || [
    'БАРБЕКЮ Beef', 'БАРБЕКЮ Chicken', 'РИВИЕРА', 'МАРГАРИТА /доматен сос/',
    'МАРГАРИТА /смес за бяла основа/', 'ПЕПЕРОНИ', 'ГОРСКА /шунка и гъби/ доматен сос',
    'КАРБОНАРА', 'ПОЛО', 'БИАНКА', 'КАПРИЧОЗА', 'АСОРТИ', 'ВЪЛЧА'
  ];

  const allTimeSlots = config?.time_slots || [
    '07:00-07:30', '07:30-08:00', '08:00-08:30', '08:30-09:00', '09:00-09:30',
    '09:30-10:00', '10:00-10:30', '10:30-11:00', '11:00-11:30', '11:30-12:00',
    '12:00-12:30', '12:30-13:00', '13:00-13:30', '13:30-14:00', '14:00-14:30',
    '14:30-15:00', '15:00-15:30', '15:30-16:00', '16:00-16:30', '16:30-17:00',
    '17:00-17:30', '17:30-18:00', '18:00-18:30', '18:30-19:00', '19:00-19:30',
    '19:30-20:00', '20:00-20:30', '20:30-21:00', '21:00-21:30', '21:30-22:00',
    '22:00-22:30', '22:30-23:00', '23:00-23:30', '23:30-00:00', '00:00-00:30', '00:30-01:00'
  ];

  const minTemp = config?.validation?.temp_min || 85;
  const maxTemp = config?.validation?.temp_max || 95;

  // 🔍 DEBUG: Log the configuration
  console.log('=== COMPONENT INITIALIZATION ===');
  console.log('Config object:', config);
  console.log('Pizza types:', pizzaTypes);
  console.log('Time slots count:', allTimeSlots.length);
  console.log('Temperature range:', minTemp, '-', maxTemp);

  const [temperatureData, setTemperatureData] = useState(() => {
    const initialData = {};
    pizzaTypes.forEach(pizza => {
      initialData[pizza] = {};
      allTimeSlots.forEach(slot => {
        initialData[pizza][slot] = '';
      });
    });
    return initialData;
  });

  const [pizzaCountData, setPizzaCountData] = useState(() => {
    const initialData = {};
    pizzaTypes.forEach(pizza => {
      initialData[pizza] = {};
      allTimeSlots.forEach(slot => {
        initialData[pizza][slot] = '';
      });
    });
    return initialData;
  });

  // Check if draft exists
  const checkForDraft = () => {
    const draftKey = `draft_${template.id}_${currentDate}`;
    const savedDraft = localStorage.getItem(draftKey);
    return savedDraft !== null;
  };

  // Load draft on mount
  useEffect(() => {
    const draftKey = `draft_${template.id}_${currentDate}`;
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft) {
      setHasDraft(true);
      try {
        const { temperatureData: tempData, pizzaCountData: countData, timestamp } = JSON.parse(savedDraft);
        const draftDate = new Date(timestamp);
        
        // Auto-load draft without asking
        setTemperatureData(tempData);
        setPizzaCountData(countData);
        setAutoSaveStatus(`Зареден драфт от ${draftDate.toLocaleString('bg-BG')}`);
        setTimeout(() => setAutoSaveStatus(''), 5000);
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  }, [template.id, currentDate]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [temperatureData, pizzaCountData]);

  // Check if there's any data entered
  const hasAnyData = () => {
    const hasTempData = pizzaTypes.some(pizza => 
      allTimeSlots.some(slot => 
        temperatureData[pizza]?.[slot] && temperatureData[pizza][slot] !== ''
      )
    );
    
    const hasCountData = pizzaTypes.some(pizza => 
      allTimeSlots.some(slot => 
        pizzaCountData[pizza]?.[slot] && pizzaCountData[pizza][slot] !== ''
      )
    );
    
    return hasTempData || hasCountData;
  };

  const saveDraft = () => {
    if (!hasAnyData()) return; // Don't save empty drafts
    
    const draftKey = `draft_${template.id}_${currentDate}`;
    localStorage.setItem(draftKey, JSON.stringify({
      temperatureData,
      pizzaCountData,
      timestamp: Date.now()
    }));
    setHasDraft(true);
    setAutoSaveStatus('✓ Автоматично запазено');
    setTimeout(() => setAutoSaveStatus(''), 2000);
  };

  // Validate and show warnings
  useEffect(() => {
    const newWarnings = [];
    
    pizzaTypes.forEach(pizza => {
      allTimeSlots.forEach(slot => {
        const hasCount = pizzaCountData[pizza]?.[slot] && pizzaCountData[pizza][slot] !== '';
        const hasTemp = temperatureData[pizza]?.[slot] && temperatureData[pizza][slot] !== '';
        
        if (hasCount && !hasTemp) {
          newWarnings.push(`${pizza} (${slot}): Въведен брой, но липсва температура`);
        }
        
        if (hasTemp && !hasCount) {
          newWarnings.push(`${pizza} (${slot}): Въведена температура, но липсва брой`);
        }
      });
    });
    
    setWarnings(newWarnings);
  }, [temperatureData, pizzaCountData]);

  const handleTemperatureChange = (pizza, timeSlot, value) => {
    console.log('🌡️ Temperature change:', { pizza, timeSlot, value });
    if (value === '' || (Number(value) >= minTemp && Number(value) <= maxTemp)) {
      setTemperatureData(prev => {
        console.log('Previous temperatureData:', prev);
        const newData = {
          ...prev,
          [pizza]: {
            ...prev[pizza],
            [timeSlot]: value
          }
        };
        console.log('New temperatureData:', newData);
        return newData;
      });
    }
  };

  const handlePizzaCountChange = (pizza, timeSlot, value) => {
    console.log('🍕 Pizza count change:', { pizza, timeSlot, value });
    if (value === '' || (Number(value) >= 0 && Number.isInteger(Number(value)))) {
      setPizzaCountData(prev => {
        console.log('Previous pizzaCountData:', prev);
        const newData = {
          ...prev,
          [pizza]: {
            ...prev[pizza],
            [timeSlot]: value
          }
        };
        console.log('New pizzaCountData:', newData);
        return newData;
      });
    }
  };

  const getTotalPizzasForType = (pizza) => {
    return Object.values(pizzaCountData[pizza] || {})
      .filter(count => count !== '')
      .reduce((sum, count) => sum + Number(count), 0);
  };

  const getTotalPizzasOverall = () => {
    return pizzaTypes.reduce((total, pizza) => total + getTotalPizzasForType(pizza), 0);
  };

  const isValidTemperature = (value) => {
    if (value === '') return true;
    const num = Number(value);
    return num >= minTemp && num <= maxTemp;
  };

  const getTemperatureColor = (temp) => {
    if (!temp || temp === '') return 'white';
    const num = Number(temp);
    if (num < minTemp) return '#fecaca';
    if (num >= minTemp && num < 88) return '#fed7aa';
    if (num >= 88 && num <= 92) return '#86efac';
    if (num > 92 && num <= maxTemp) return '#fde047';
    return '#fecaca';
  };

  const applySmartBulkTemperature = (pizza) => {
    if (!bulkTemp) {
      alert('Моля въведете температура за автоматично попълване');
      return;
    }
    
    const newData = { ...temperatureData };
    if (!newData[pizza]) newData[pizza] = {};
    
    let filledCount = 0;
    allTimeSlots.forEach(slot => {
      const hasCount = pizzaCountData[pizza]?.[slot] && pizzaCountData[pizza][slot] !== '';
      if (hasCount) {
        newData[pizza][slot] = bulkTemp;
        filledCount++;
      }
    });
    
    setTemperatureData(newData);
    
    if (filledCount > 0) {
      setAutoSaveStatus(`Попълнени ${filledCount} температури за ${pizza}`);
      setTimeout(() => setAutoSaveStatus(''), 3000);
    } else {
      alert('Няма въведени броеве пици за тази пица. Първо въведете брой пици.');
    }
  };

  const applySmartBulkTemperatureAll = () => {
    if (!bulkTemp) {
      alert('Моля въведете температура за автоматично попълване');
      return;
    }
    
    const newData = { ...temperatureData };
    let totalFilledCount = 0;
    
    pizzaTypes.forEach(pizza => {
      if (!newData[pizza]) newData[pizza] = {};
      
      allTimeSlots.forEach(slot => {
        const hasCount = pizzaCountData[pizza]?.[slot] && pizzaCountData[pizza][slot] !== '';
        if (hasCount) {
          newData[pizza][slot] = bulkTemp;
          totalFilledCount++;
        }
      });
    });
    
    setTemperatureData(newData);
    
    if (totalFilledCount > 0) {
      setAutoSaveStatus(`Попълнени ${totalFilledCount} температури общо`);
      setTimeout(() => setAutoSaveStatus(''), 3000);
      setBulkTemp('');
    } else {
      alert('Няма въведени броеве пици. Първо въведете брой пици.');
    }
  };

  const copyFromPreviousRow = (currentPizza) => {
    const currentIndex = pizzaTypes.indexOf(currentPizza);
    if (currentIndex === 0) {
      alert('Няма предишен ред за копиране');
      return;
    }
    
    const previousPizza = pizzaTypes[currentIndex - 1];
    
    setTemperatureData(prev => ({
      ...prev,
      [currentPizza]: { ...temperatureData[previousPizza] }
    }));
    
    setPizzaCountData(prev => ({
      ...prev,
      [currentPizza]: { ...pizzaCountData[previousPizza] }
    }));
    
    setAutoSaveStatus(`Копирани данни от ${previousPizza}`);
    setTimeout(() => setAutoSaveStatus(''), 2000);
  };

  const clearDraft = () => {
    if (window.confirm('Сигурни ли сте, че искате да изчистите текущия драфт и да започнете нов чек лист?')) {
      const emptyTempData = {};
      const emptyCountData = {};
      
      pizzaTypes.forEach(pizza => {
        emptyTempData[pizza] = {};
        emptyCountData[pizza] = {};
        allTimeSlots.forEach(slot => {
          emptyTempData[pizza][slot] = '';
          emptyCountData[pizza][slot] = '';
        });
      });
      
      setTemperatureData(emptyTempData);
      setPizzaCountData(emptyCountData);
      
      const draftKey = `draft_${template.id}_${currentDate}`;
      localStorage.removeItem(draftKey);
      setHasDraft(false);
      
      setAutoSaveStatus('Драфтът е изчистен. Започнете нов чек лист.');
      setTimeout(() => setAutoSaveStatus(''), 3000);
    }
  };

  const exportToCSV = () => {
    let csv = 'Вид пица,Общо бр.,' + allTimeSlots.join(',') + '\n';
    
    pizzaTypes.forEach(pizza => {
      const tempRow = [
        `"${pizza} (Температура)"`,
        '',
        ...allTimeSlots.map(slot => temperatureData[pizza]?.[slot] || '')
      ];
      csv += tempRow.join(',') + '\n';
      
      const countRow = [
        `"${pizza} (Брой)"`,
        getTotalPizzasForType(pizza),
        ...allTimeSlots.map(slot => pizzaCountData[pizza]?.[slot] || '')
      ];
      csv += countRow.join(',') + '\n';
    });
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pizza-temp-${currentDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleKeyDown = (e, pizza, slot, type) => {
    const pizzaIndex = pizzaTypes.indexOf(pizza);
    const slotIndex = allTimeSlots.indexOf(slot);
    
    if (e.key === 'Enter' || e.key === 'ArrowRight') {
      e.preventDefault();
      if (slotIndex < allTimeSlots.length - 1) {
        const nextSlot = allTimeSlots[slotIndex + 1];
        const ref = inputRefs.current[`${pizza}-${nextSlot}-${type}`];
        if (ref) ref.focus();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (pizzaIndex < pizzaTypes.length - 1) {
        const nextPizza = pizzaTypes[pizzaIndex + 1];
        const ref = inputRefs.current[`${nextPizza}-${slot}-${type}`];
        if (ref) ref.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (pizzaIndex > 0) {
        const prevPizza = pizzaTypes[pizzaIndex - 1];
        const ref = inputRefs.current[`${prevPizza}-${slot}-${type}`];
        if (ref) ref.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (slotIndex > 0) {
        const prevSlot = allTimeSlots[slotIndex - 1];
        const ref = inputRefs.current[`${pizza}-${prevSlot}-${type}`];
        if (ref) ref.focus();
      }
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

  const handleSubmit = async () => {
    if (!hasAnyData()) {
      alert('Моля попълнете поне едно поле преди да запазите чек листа.');
      return;
    }

    if (warnings.length > 0) {
      const confirmSubmit = window.confirm(
        `Имате ${warnings.length} предупреждения. Сигурни ли сте, че искате да запазите чек листа?`
      );
      if (!confirmSubmit) return;
    }

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data: submission, error: submissionError } = await supabase
        .from('checklist_submissions')
        .insert({
          template_id: template.id,
          restaurant_id: restaurantId,
          department_id: department.id,
          data: { 
            date: currentDate,
            temperatures: temperatureData,
            pizzaCounts: pizzaCountData,
            metadata: {
              total_pizzas: getTotalPizzasOverall()
            }
          },
          submitted_by: userData.user.id,
          submission_date: currentDate,
          synced: true
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      // Clear draft after successful submission
      const draftKey = `draft_${template.id}_${currentDate}`;
      localStorage.removeItem(draftKey);
      setHasDraft(false);

      alert('Чек листът е запазен успешно! Сега можете да започнете нов чек лист.');
      
      // Reset form for new checklist
      const emptyTempData = {};
      const emptyCountData = {};
      
      pizzaTypes.forEach(pizza => {
        emptyTempData[pizza] = {};
        emptyCountData[pizza] = {};
        allTimeSlots.forEach(slot => {
          emptyTempData[pizza][slot] = '';
          emptyCountData[pizza][slot] = '';
        });
      });
      
      setTemperatureData(emptyTempData);
      setPizzaCountData(emptyCountData);
      setWarnings([]);
      
      // Optionally go back or stay for new entry
      // onBack();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Грешка при запазване: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '20px' }}>
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
              <h3 style={{ margin: 0, color: '#1a5d33' }}>Имате незапазени данни</h3>
            </div>
            <p style={{ marginBottom: '20px', color: '#374151', lineHeight: '1.6' }}>
              Имате попълнени данни в чек листа. Какво искате да направите?
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
                  backgroundColor: '#1a5d33',
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

      <div style={{ maxWidth: '1800px', margin: '0 auto' }}>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '30px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button onClick={handleBackClick} style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
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
                Започни нов чек лист
              </button>
            )}
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #1a5d33, #2d7a4f)',
            padding: '30px',
            borderRadius: '8px',
            color: 'white',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>{template.name}</h1>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>{template.description}</p>
              </div>
              {hasDraft && (
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FileText style={{ width: '20px', height: '20px' }} />
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>Работите по драфт</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Дата:
              </label>
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            {autoSaveStatus && (
              <div style={{ 
                flex: '1 1 200px',
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

          {/* Smart Bulk Entry Mode */}
          <div style={{
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #bbf7d0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <Zap style={{ color: '#1a5d33', width: '20px', height: '20px' }} />
              <h4 style={{ margin: 0, color: '#1a5d33' }}>Интелигентно попълване на температура</h4>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Температура:
                </label>
                <input
                  type="number"
                  min={minTemp}
                  max={maxTemp}
                  value={bulkTemp}
                  onChange={(e) => setBulkTemp(e.target.value)}
                  placeholder={`${minTemp}-${maxTemp}°C`}
                  style={{
                    width: '120px',
                    padding: '10px',
                    border: '2px solid #1a5d33',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                />
              </div>
              
              <button
                onClick={applySmartBulkTemperatureAll}
                disabled={!bulkTemp}
                style={{
                  padding: '10px 20px',
                  backgroundColor: bulkTemp ? '#1a5d33' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: bulkTemp ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Zap style={{ width: '16px', height: '16px' }} />
                Попълни температури за всички пици
              </button>
              
              <div style={{ fontSize: '12px', color: '#374151', maxWidth: '400px', lineHeight: '1.5' }}>
                💡 Температурата ще се попълни <strong>само за слотовете където има въведен брой пици</strong>. 
                Кликнете бутона за глобално попълване или използвайте бутона до всяка пица.
              </div>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div style={{
            backgroundColor: '#fef3c7',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            border: '1px solid #fbbf24'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <AlertCircle style={{ color: '#d97706', width: '20px', height: '20px' }} />
              <h4 style={{ margin: 0, color: '#d97706' }}>Предупреждения ({warnings.length})</h4>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400e' }}>
              {warnings.slice(0, 5).map((warning, index) => (
                <li key={index} style={{ fontSize: '14px', marginBottom: '5px' }}>{warning}</li>
              ))}
              {warnings.length > 5 && (
                <li style={{ fontSize: '14px', fontStyle: 'italic' }}>
                  ... и още {warnings.length - 5} предупреждения
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Statistics */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <BarChart3 style={{ color: '#1a5d33', width: '24px', height: '24px' }} />
            <h3 style={{ margin: 0, color: '#1a5d33', fontSize: '20px' }}>
              Статистика на пиците
            </h3>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
          }}>
            {pizzaTypes.map((pizza, index) => (
              <div key={index} style={{
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                padding: '15px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a5d33',
                  minHeight: '32px'
                }}>
                  {pizza.length > 25 ? pizza.substring(0, 25) + '...' : pizza}
                </div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a5d33' }}>
                  {getTotalPizzasForType(pizza)}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>бр. пици</div>
              </div>
            ))}
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #1a5d33, #2d7a4f)',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white'
          }}>
            <span style={{ fontSize: '20px', fontWeight: '600' }}>ОБЩО ПИЦИ:</span>
            <span style={{ fontSize: '36px', fontWeight: 'bold' }}>{getTotalPizzasOverall()}</span>
          </div>
        </div>

        {/* Temperature Control Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a5d33, #2d7a4f)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            color: 'white'
          }}>
            <Thermometer style={{ width: '24px', height: '24px' }} />
            <h3 style={{ margin: 0, fontSize: '18px', textAlign: 'center' }}>
              ЧАС НА ИЗПИЧАНЕ / ТЕМПЕРАТУРА НА ИЗПЕЧЕНАТА ПИЦА (07:00 - 01:00)
            </h3>
          </div>

          <div style={{ overflowX: 'auto', maxHeight: '700px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr style={{
                  background: 'linear-gradient(135deg, #1a5d33, #2d7a4f)'
                }}>
                  <th style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '13px',
                    textAlign: 'left',
                    minWidth: '180px',
                    position: 'sticky',
                    left: 0,
                    backgroundColor: '#1a5d33',
                    zIndex: 11
                  }}>
                    ВИД ПИЦА
                  </th>
                  <th style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '13px',
                    textAlign: 'center',
                    minWidth: '70px'
                  }}>
                    ОБЩО
                  </th>
                  <th style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '13px',
                    textAlign: 'center',
                    minWidth: '100px'
                  }}>
                    ДЕЙСТВИЯ
                  </th>
                  {allTimeSlots.map((slot, index) => (
                    <th key={index} style={{
                      padding: '8px',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '11px',
                      textAlign: 'center',
                      minWidth: '70px',
                      borderLeft: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      {slot}
                    </th>
                  ))}
                </tr>
                <tr style={{ backgroundColor: '#f0f7f0' }}>
                  <td style={{
                    padding: '10px 12px',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#1a5d33',
                    position: 'sticky',
                    left: 0,
                    backgroundColor: '#f0f7f0',
                    zIndex: 9
                  }}>
                    ТЕМПЕРАТУРА / БРОЙ
                  </td>
                  <td style={{ padding: '10px', borderLeft: '1px solid #e5e7eb' }}></td>
                  <td style={{ padding: '10px', borderLeft: '1px solid #e5e7eb' }}></td>
                  {allTimeSlots.map((slot, index) => (
                    <td key={index} style={{
                      padding: '8px',
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#dc2626',
                      borderLeft: '1px solid #e5e7eb'
                    }}>
                      {minTemp}-{maxTemp}°C
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pizzaTypes.map((pizza, pizzaIndex) => (
                  <React.Fragment key={pizzaIndex}>
                    {/* Temperature Row */}
                    <tr style={{ backgroundColor: pizzaIndex % 2 === 0 ? 'white' : '#fafbfc' }}>
                      <td style={{
                        padding: '10px 12px',
                        fontWeight: '600',
                        fontSize: '13px',
                        borderBottom: '1px solid #e5e7eb',
                        position: 'sticky',
                        left: 0,
                        backgroundColor: pizzaIndex % 2 === 0 ? 'white' : '#fafbfc',
                        zIndex: 1
                      }}>
                        <div style={{ color: '#1a5d33', marginBottom: '4px' }}>{pizza}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>Температура °C</div>
                      </td>
                      <td style={{
                        padding: '8px',
                        textAlign: 'center',
                        borderBottom: '1px solid #e5e7eb',
                        borderLeft: '1px solid #e5e7eb',
                        background: 'linear-gradient(135deg, #1a5d33, #2d7a4f)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>
                        {getTotalPizzasForType(pizza)}
                      </td>
                      <td style={{
                        padding: '4px',
                        borderBottom: '1px solid #e5e7eb',
                        borderLeft: '1px solid #e5e7eb',
                        textAlign: 'center'
                      }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          {bulkTemp && (
                            <button
                              onClick={() => applySmartBulkTemperature(pizza)}
                              title="Попълни температура само за попълнените пици"
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#1a5d33',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Zap style={{ width: '12px', height: '12px' }} />
                              T°
                            </button>
                          )}
                          {pizzaIndex > 0 && (
                            <button
                              onClick={() => copyFromPreviousRow(pizza)}
                              title="Копирай от предишен ред"
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Copy style={{ width: '12px', height: '12px' }} />
                            </button>
                          )}
                        </div>
                      </td>
                      {allTimeSlots.map((slot, slotIndex) => (
                        <td key={slotIndex} style={{
                          padding: '4px',
                          borderBottom: '1px solid #e5e7eb',
                          borderLeft: '1px solid #e5e7eb'
                        }}>
                          <input
                            ref={(el) => inputRefs.current[`${pizza}-${slot}-temp`] = el}
                            type="number"
                            min={minTemp}
                            max={maxTemp}
                            value={temperatureData[pizza]?.[slot] || ''}
                            onChange={(e) => handleTemperatureChange(pizza, slot, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, pizza, slot, 'temp')}
                            style={{
                              width: '100%',
                              padding: '6px',
                              textAlign: 'center',
                              fontSize: '12px',
                              fontWeight: '600',
                              border: '2px solid',
                              borderRadius: '4px',
                              borderColor: !isValidTemperature(temperatureData[pizza]?.[slot]) ? '#dc2626' :
                                          temperatureData[pizza]?.[slot] ? '#1a5d33' : '#d1d5db',
                              backgroundColor: getTemperatureColor(temperatureData[pizza]?.[slot]),
                              color: !isValidTemperature(temperatureData[pizza]?.[slot]) ? '#dc2626' :
                                     temperatureData[pizza]?.[slot] ? '#1a5d33' : '#6b7280'
                            }}
                            placeholder="°C"
                          />
                        </td>
                      ))}
                    </tr>
                    {/* Pizza Count Row */}
                    <tr style={{ backgroundColor: pizzaIndex % 2 === 0 ? 'white' : '#fafbfc' }}>
                      <td style={{
                        padding: '10px 12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#6b7280',
                        borderBottom: '2px solid #e5e7eb',
                        position: 'sticky',
                        left: 0,
                        backgroundColor: pizzaIndex % 2 === 0 ? 'white' : '#fafbfc',
                        zIndex: 1
                      }}>
                        Брой пици
                      </td>
                      <td style={{
                        padding: '8px',
                        borderBottom: '2px solid #e5e7eb',
                        borderLeft: '1px solid #e5e7eb'
                      }}></td>
                      <td style={{
                        padding: '4px',
                        borderBottom: '2px solid #e5e7eb',
                        borderLeft: '1px solid #e5e7eb',
                        textAlign: 'center'
                      }}></td>
                      {allTimeSlots.map((slot, slotIndex) => (
                        <td key={slotIndex} style={{
                          padding: '4px',
                          borderBottom: '2px solid #e5e7eb',
                          borderLeft: '1px solid #e5e7eb'
                        }}>
                          <input
                            ref={(el) => inputRefs.current[`${pizza}-${slot}-count`] = el}
                            type="number"
                            min="0"
                            step="1"
                            value={pizzaCountData[pizza]?.[slot] || ''}
                            onChange={(e) => handlePizzaCountChange(pizza, slot, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, pizza, slot, 'count')}
                            style={{
                              width: '100%',
                              padding: '6px',
                              textAlign: 'center',
                              fontSize: '12px',
                              fontWeight: '600',
                              border: '2px solid',
                              borderRadius: '4px',
                              borderColor: pizzaCountData[pizza]?.[slot] ? '#3b82f6' : '#d1d5db',
                              backgroundColor: pizzaCountData[pizza]?.[slot] ? '#eff6ff' : 'white',
                              color: pizzaCountData[pizza]?.[slot] ? '#1d4ed8' : '#6b7280'
                            }}
                            placeholder="бр."
                          />
                        </td>
                      ))}
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
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
              Легенда и инструкции
            </h4>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: '2px solid #1a5d33',
                borderRadius: '4px',
                backgroundColor: '#86efac'
              }}></div>
              <span style={{ fontSize: '14px' }}>Оптимална температура (88-92°C)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: '2px solid #1a5d33',
                borderRadius: '4px',
                backgroundColor: '#fed7aa'
              }}></div>
              <span style={{ fontSize: '14px' }}>Ниска температура ({minTemp}-87°C)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: '2px solid #1a5d33',
                borderRadius: '4px',
                backgroundColor: '#fde047'
              }}></div>
              <span style={{ fontSize: '14px' }}>Висока температура (93-{maxTemp}°C)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: '2px solid #3b82f6',
                borderRadius: '4px',
                backgroundColor: '#eff6ff'
              }}></div>
              <span style={{ fontSize: '14px' }}>Брой пици</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: '2px solid #dc2626',
                borderRadius: '4px',
                backgroundColor: '#fecaca'
              }}></div>
              <span style={{ fontSize: '14px' }}>Невалидна температура</span>
            </div>
          </div>
          
          <div style={{
            padding: '15px',
            borderRadius: '8px',
            backgroundColor: '#f0fdf4',
            borderLeft: '4px solid #1a5d33',
            marginBottom: '15px'
          }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', lineHeight: '1.6', color: '#374151' }}>
              <strong style={{ color: '#1a5d33' }}>Работа с драфт:</strong> Данните се запазват автоматично на всеки 30 секунди. 
              Можете да излезете по всяко време и да продължите по-късно от същото място.
            </p>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', lineHeight: '1.6', color: '#374151' }}>
              <strong style={{ color: '#1a5d33' }}>Навигация:</strong> Използвайте клавишите със стрелки (↑↓←→) или Enter за преминаване между полетата.
            </p>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#374151' }}>
              <strong style={{ color: '#1a5d33' }}>Интелигентно попълване:</strong> Първо въведете брой пици, след това въведете температура и кликнете "Попълни температури". 
              Температурата ще се попълни само за слотовете с въведен брой пици.
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={exportToCSV}
              style={{
                padding: '10px 20px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Download style={{ width: '16px', height: '16px' }} />
              Експорт в CSV
            </button>
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
            {loading ? 'Запазване...' : 'Запази чек лист и започни нов'}
          </button>
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#6b7280' }}>
            След запазване, формата ще се изчисти и ще можете да започнете нов чек лист
          </p>
        </div>

      </div>
    </div>
  );
};

export default PizzaTemperatureControl;