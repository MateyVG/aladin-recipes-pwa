
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Plus, Trash2, Package, Calculator, Users, AlertCircle, ClipboardList, FileText } from 'lucide-react';

const RestaurantInventoryForm = ({ template, config, department, restaurantId, onBack }) => {
  // ==========================================
  // MAIN STATE
  // ==========================================
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('');
  
  // Inventory items - НОВ формат с name, portion, employeeName
  const [inventoryItems, setInventoryItems] = useState(Array.from({ length: 8 }, (_, i) => ({ 
    id: i + 1, 
    name: '', 
    portion: '',
    price: '',
    employeeName: ''
  })));
  
  // Defective items - НОВ формат с reason и brakedBy
  const [defectiveItems, setDefectiveItems] = useState(Array.from({ length: 8 }, (_, i) => ({ 
    id: i + 1, 
    name: '', 
    quantity: '',
    unit: 'брой',
    reason: '',
    brakedBy: ''
  })));
  
  const [protocolNumber, setProtocolNumber] = useState('БРАК');
  const [manager, setManager] = useState('');
  const [shift2, setShift2] = useState('');
  
  const [savedManagers, setSavedManagers] = useState([]);
  const [savedEmployees, setSavedEmployees] = useState([]);

  // ==========================================
  // DRAFT СИСТЕМА STATE
  // ==========================================
  const [hasDraft, setHasDraft] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [pendingExit, setPendingExit] = useState(false);

  const currentDate = new Date().toISOString().split('T')[0];

  // ==========================================
  // DRAFT СИСТЕМА ФУНКЦИИ
  // ==========================================

  // Проверка дали има въведени данни
  const hasAnyData = () => {
    // Проверка за основни полета
    if (shift || manager || shift2 || protocolNumber !== 'БРАК') return true;
    
    // Проверка за inventory items
    const hasInventoryData = inventoryItems.some(item => 
      item.name || item.portion || item.price || item.employeeName
    );
    
    // Проверка за defective items
    const hasDefectiveData = defectiveItems.some(item => 
      item.name || item.quantity || item.reason || item.brakedBy
    );
    
    return hasInventoryData || hasDefectiveData;
  };

  // Запазване на драфт - УНИКАЛЕН ключ за всеки template и дата
  const saveDraft = () => {
    if (!hasAnyData()) return;

    const draftKey = `draft_${template.id}_${currentDate}`;
    const draftData = {
      date,
      shift,
      inventoryItems,
      defectiveItems,
      protocolNumber,
      manager,
      shift2,
      savedManagers,
      savedEmployees,
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
        setDate(draftData.date || new Date().toISOString().split('T')[0]);
        setShift(draftData.shift || '');
        setInventoryItems(draftData.inventoryItems || Array.from({ length: 8 }, (_, i) => ({ 
          id: i + 1, 
          name: '', 
          portion: '',
          price: '',
          employeeName: ''
        })));
        setDefectiveItems(draftData.defectiveItems || Array.from({ length: 8 }, (_, i) => ({ 
          id: i + 1, 
          name: '', 
          quantity: '',
          unit: 'брой',
          reason: '',
          brakedBy: ''
        })));
        setProtocolNumber(draftData.protocolNumber || 'БРАК');
        setManager(draftData.manager || '');
        setShift2(draftData.shift2 || '');
        setSavedManagers(draftData.savedManagers || []);
        setSavedEmployees(draftData.savedEmployees || []);
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
    setDate(new Date().toISOString().split('T')[0]);
    setShift('');
    setInventoryItems(Array.from({ length: 8 }, (_, i) => ({ 
      id: i + 1, 
      name: '', 
      portion: '',
      price: '',
      employeeName: ''
    })));
    setDefectiveItems(Array.from({ length: 8 }, (_, i) => ({ 
      id: i + 1, 
      name: '', 
      quantity: '',
      unit: 'брой',
      reason: '',
      brakedBy: ''
    })));
    setProtocolNumber('БРАК');
    setManager('');
    setShift2('');
    
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

  // ==========================================
  // USE EFFECTS ЗА DRAFT СИСТЕМА
  // ==========================================

  // Зареждане на драфт при mount
  useEffect(() => {
    checkForDraft();
  }, [template.id, currentDate]);

  // Auto-save interval - запазване на всеки 30 секунди
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasAnyData()) {
        saveDraft();
      }
    }, 30000); // 30 секунди

    return () => clearInterval(interval);
  }, [date, shift, inventoryItems, defectiveItems, protocolNumber, manager, shift2, savedManagers, savedEmployees, template.id, currentDate]);

  // ==========================================
  // INVENTORY ITEMS HANDLERS
  // ==========================================

  const addInventoryItem = () => {
    const newItem = {
      id: Date.now(),
      name: '',
      portion: '',
      price: '',
      employeeName: ''
    };
    setInventoryItems([...inventoryItems, newItem]);
    
    setAutoSaveStatus('Добавен нов ред инвентар');
    setTimeout(() => setAutoSaveStatus(''), 2000);
  };

  const removeInventoryItem = (id) => {
    if (inventoryItems.length > 1) {
      setInventoryItems(inventoryItems.filter(item => item.id !== id));
      
      setAutoSaveStatus('Премахнат ред инвентар');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }
  };

  const updateInventoryItem = (id, field, value) => {
    setInventoryItems(inventoryItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // ==========================================
  // DEFECTIVE ITEMS HANDLERS
  // ==========================================

  const addDefectiveItem = () => {
    const newItem = {
      id: Date.now(),
      name: '',
      quantity: '',
      unit: 'брой',
      reason: '',
      brakedBy: ''
    };
    setDefectiveItems([...defectiveItems, newItem]);
    
    setAutoSaveStatus('Добавен нов ред брак');
    setTimeout(() => setAutoSaveStatus(''), 2000);
  };

  const removeDefectiveItem = (id) => {
    if (defectiveItems.length > 1) {
      setDefectiveItems(defectiveItems.filter(item => item.id !== id));
      
      setAutoSaveStatus('Премахнат ред брак');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }
  };

  const updateDefectiveItem = (id, field, value) => {
    setDefectiveItems(defectiveItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // ==========================================
  // CALCULATION & SUMMARY FUNCTIONS
  // ==========================================

  const calculateTotalPrice = () => {
    return inventoryItems.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      return total + price;
    }, 0).toFixed(2);
  };

  const generateSummary = () => {
    // Обобщение за консумация
    const consumptionMap = {};
    inventoryItems.forEach(item => {
      if (item.name && item.portion) {
        const key = `${item.name}_${item.portion}`;
        if (!consumptionMap[key]) {
          consumptionMap[key] = {
            name: item.name,
            portion: item.portion,
            count: 0
          };
        }
        consumptionMap[key].count += 1;
      }
    });

    // Обобщение за брак
    const defectiveMap = {};
    defectiveItems.forEach(item => {
      if (item.name && item.quantity && item.unit) {
        const key = `${item.name}_${item.unit}`;
        if (!defectiveMap[key]) {
          defectiveMap[key] = {
            name: item.name,
            unit: item.unit,
            totalQuantity: 0
          };
        }
        defectiveMap[key].totalQuantity += parseFloat(item.quantity) || 0;
      }
    });

    return {
      consumption: Object.values(consumptionMap),
      defective: Object.values(defectiveMap),
      allConsumption: inventoryItems,
      allDefective: defectiveItems
    };
  };

  // ==========================================
  // SUBMIT HANDLER
  // ==========================================

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const submissionData = {
        template_id: template.id,
        restaurant_id: restaurantId,
        department_id: department.id,
        data: {
          date,
          shift,
          protocolNumber,
          manager,
          shift2,
          inventoryItems,
          defectiveItems,
          savedManagers,
          savedEmployees,
          totals: {
            inventory: calculateTotalPrice()
          },
          summary: generateSummary()
        },
        submitted_by: userData.user.id,
        submission_date: date,
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
      setDate(new Date().toISOString().split('T')[0]);
      setShift('');
      setInventoryItems(Array.from({ length: 8 }, (_, i) => ({ 
        id: i + 1, 
        name: '', 
        portion: '',
        price: '',
        employeeName: ''
      })));
      setDefectiveItems(Array.from({ length: 8 }, (_, i) => ({ 
        id: i + 1, 
        name: '', 
        quantity: '',
        unit: 'брой',
        reason: '',
        brakedBy: ''
      })));
      setProtocolNumber('БРАК');
      setManager('');
      setShift2('');

      alert('Чек листът е запазен успешно! Сега можете да започнете нов чек лист.');
      
      // НЕ извикваме onBack() - оставаме на страницата
    } catch (error) {
      console.error('Submit error:', error);
      alert('Грешка при запазване: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const summary = generateSummary();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* ==========================================
            BACK BUTTON
            ========================================== */}
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

        {/* ==========================================
            EXIT CONFIRMATION MODAL
            ========================================== */}
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

        {/* ==========================================
            HEADER С DRAFT И AUTO-SAVE ИНДИКАТОРИ
            ========================================== */}
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
              {template.name}
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
              {template.description}
            </p>
          </div>

          {/* ==========================================
              DATE, SHIFT И CONTROL BUTTONS
              ========================================== */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Дата:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              />
            </div>

            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Смяна:</label>
              <input
                type="text"
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                placeholder="..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto', flexWrap: 'wrap' }}>
              <button onClick={addInventoryItem} style={{
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
                Добави ред инвентар
              </button>
              
              <button onClick={addDefectiveItem} style={{
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
                Добави ред брак
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
        </div>

        {/* ==========================================
            MAIN INVENTORY TABLE - ПЕРСОНАЛНА ХРАНА
            ========================================== */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Package style={{ width: '24px', height: '24px', color: '#1a5d33' }} />
            <div>
              <h3 style={{ margin: 0, color: '#1a5d33', fontSize: '18px', fontWeight: 'bold' }}>
                ПЕРСОНАЛНА ХРАНА ЗА СЛУЖИТЕЛИ
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                Регистрация на консумираната храна от персонала с посочване на служител
              </p>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #1a5d33, #2d7a4f)' }}>
                  <th style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '13px',
                    textAlign: 'center',
                    minWidth: '250px',
                    borderRight: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    ИМЕ НА ХРАНАТА
                  </th>
                  <th style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '13px',
                    textAlign: 'center',
                    minWidth: '150px',
                    borderRight: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    ПОРЦИЯ
                  </th>
                  <th style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '13px',
                    textAlign: 'center',
                    minWidth: '120px',
                    borderRight: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    ЦЕНА
                  </th>
                  <th style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '13px',
                    textAlign: 'center',
                    minWidth: '200px',
                    borderRight: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Users style={{ width: '16px', height: '16px' }} />
                      ИМЕ НА СЛУЖИТЕЛЯ
                    </div>
                  </th>
                  <th style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '13px',
                    textAlign: 'center',
                    minWidth: '80px'
                  }}>
                    ДЕЙСТВИЯ
                  </th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.map((item, index) => (
                  <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#fafbfc' }}>
                    <td style={{ padding: '10px', borderRight: '1px solid #e5e7eb' }}>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateInventoryItem(item.id, 'name', e.target.value)}
                        placeholder="Наименование на храната"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '10px', borderRight: '1px solid #e5e7eb' }}>
                      <input
                        type="text"
                        value={item.portion}
                        onChange={(e) => updateInventoryItem(item.id, 'portion', e.target.value)}
                        placeholder="гр./бр./мл."
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '10px', borderRight: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateInventoryItem(item.id, 'price', e.target.value)}
                          placeholder="0.00"
                          style={{
                            flex: 1,
                            padding: '10px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                        <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>лв</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px', borderRight: '1px solid #e5e7eb' }}>
                      <input
                        type="text"
                        value={item.employeeName}
                        onChange={(e) => updateInventoryItem(item.id, 'employeeName', e.target.value)}
                        placeholder="Име и фамилия"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      {inventoryItems.length > 1 && (
                        <button
                          onClick={() => removeInventoryItem(item.id)}
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
                
                <tr style={{ backgroundColor: '#f0f7f0' }}>
                  <td colSpan="3" style={{
                    padding: '15px',
                    textAlign: 'right',
                    fontWeight: 'bold',
                    color: '#1a5d33',
                    borderRight: '1px solid #e5e7eb'
                  }}>
                    ОБЩО СТОЙНОСТ ПЕРСОНАЛНА ХРАНА:
                  </td>
                  <td style={{
                    padding: '15px',
                    fontWeight: 'bold',
                    color: '#1a5d33',
                    textAlign: 'center',
                    borderRight: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Calculator style={{ width: '18px', height: '18px' }} />
                      {calculateTotalPrice()} лв
                    </div>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* ...продължава от Part 2 */}

        {/* ==========================================
            BOTTOM SECTION - Manager, Protocol, Shift2
            ========================================== */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Мениджър:
              </label>
              <input
                type="text"
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                placeholder="Име на мениджър"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Номер на протокол:
              </label>
              <input
                type="text"
                value={protocolNumber}
                onChange={(e) => setProtocolNumber(e.target.value)}
                placeholder="Номер протокол"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Смяна 2:
              </label>
              <input
                type="text"
                value={shift2}
                onChange={(e) => setShift2(e.target.value)}
                placeholder="..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>

        {/* ==========================================
            DEFECTIVE ITEMS TABLE - БРАК
            ========================================== */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle style={{ width: '24px', height: '24px', color: '#dc2626' }} />
            <div>
              <h3 style={{ margin: 0, color: '#dc2626', fontSize: '18px', fontWeight: 'bold' }}>
                БРАК НА МАТЕРИАЛНИ ЗАПАСИ
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                Регистрация на дефектни продукти с причина и отговорно лице
              </p>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>
                  <th style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '13px',
                    textAlign: 'center',
                    minWidth: '250px',
                    borderRight: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    АРТИКУЛ
                  </th>
                  <th style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '13px',
                    textAlign: 'center',
                    minWidth: '120px',
                    borderRight: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    КОЛИЧЕСТВО
                  </th>
                  <th style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '13px',
                    textAlign: 'center',
                    minWidth: '100px',
                    borderRight: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    МЯРКА
                  </th>
                  <th style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '13px',
                    textAlign: 'center',
                    minWidth: '200px',
                    borderRight: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    ПРИЧИНА
                  </th>
                  <th style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '13px',
                    textAlign: 'center',
                    minWidth: '180px',
                    borderRight: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    БРАКУВАЛ
                  </th>
                  <th style={{
                    padding: '12px',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '13px',
                    textAlign: 'center',
                    minWidth: '80px'
                  }}>
                    ДЕЙСТВИЯ
                  </th>
                </tr>
              </thead>
              <tbody>
                {defectiveItems.map((item, index) => (
                  <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#fafbfc' }}>
                    <td style={{ padding: '10px', borderRight: '1px solid #e5e7eb' }}>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateDefectiveItem(item.id, 'name', e.target.value)}
                        placeholder="Наименование на артикула"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '10px', borderRight: '1px solid #e5e7eb' }}>
                      <input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateDefectiveItem(item.id, 'quantity', e.target.value)}
                        placeholder="0.00"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '10px', borderRight: '1px solid #e5e7eb' }}>
                      <select
                        value={item.unit}
                        onChange={(e) => updateDefectiveItem(item.id, 'unit', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="брой">брой</option>
                        <option value="кг">кг</option>
                        <option value="л">л</option>
                        <option value="гр">гр</option>
                        <option value="мл">мл</option>
                      </select>
                    </td>
                    <td style={{ padding: '10px', borderRight: '1px solid #e5e7eb' }}>
                      <input
                        type="text"
                        value={item.reason}
                        onChange={(e) => updateDefectiveItem(item.id, 'reason', e.target.value)}
                        placeholder="Причина за брак"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '10px', borderRight: '1px solid #e5e7eb' }}>
                      <input
                        type="text"
                        value={item.brakedBy}
                        onChange={(e) => updateDefectiveItem(item.id, 'brakedBy', e.target.value)}
                        placeholder="Име и фамилия"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      {defectiveItems.length > 1 && (
                        <button
                          onClick={() => removeDefectiveItem(item.id)}
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

        {/* ==========================================
            SUMMARY TABLE - Обобщение
            ========================================== */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '15px'
          }}>
            <ClipboardList style={{ color: '#1a5d33', width: '20px', height: '20px' }} />
            <h4 style={{ margin: 0, color: '#1a5d33', fontSize: '16px' }}>
              Обобщение
            </h4>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {/* Консумация обобщение */}
            {summary.consumption.length > 0 && (
              <div style={{
                padding: '15px',
                borderRadius: '8px',
                backgroundColor: '#f0fdf4',
                borderLeft: '4px solid #1a5d33'
              }}>
                <h5 style={{ margin: '0 0 12px 0', color: '#1a5d33', fontSize: '14px', fontWeight: '600' }}>
                  Консумация по артикули:
                </h5>
                {summary.consumption.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: idx < summary.consumption.length - 1 ? '1px solid #d1fae5' : 'none',
                    fontSize: '13px'
                  }}>
                    <span style={{ color: '#374151' }}>{item.name} ({item.portion})</span>
                    <span style={{ fontWeight: '600', color: '#1a5d33' }}>{item.count} бр</span>
                  </div>
                ))}
              </div>
            )}

            {/* Брак обобщение */}
            {summary.defective.length > 0 && (
              <div style={{
                padding: '15px',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                borderLeft: '4px solid #dc2626'
              }}>
                <h5 style={{ margin: '0 0 12px 0', color: '#dc2626', fontSize: '14px', fontWeight: '600' }}>
                  Брак по артикули:
                </h5>
                {summary.defective.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: idx < summary.defective.length - 1 ? '1px solid #fecaca' : 'none',
                    fontSize: '13px'
                  }}>
                    <span style={{ color: '#374151' }}>{item.name}</span>
                    <span style={{ fontWeight: '600', color: '#dc2626' }}>
                      {item.totalQuantity} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ==========================================
            ОБОБЩЕНИЕ ПО СЛУЖИТЕЛИ - Employee Summary
            ========================================== */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '15px'
          }}>
            <Users style={{ color: '#1a5d33', width: '20px', height: '20px' }} />
            <h4 style={{ margin: 0, color: '#1a5d33', fontSize: '16px' }}>
              Обобщение по служители
            </h4>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '16px'
          }}>
            {/* Персонална храна по служители */}
            {(() => {
              // Групиране на персонална храна по служители
              const employeeFoodMap = {};
              inventoryItems.forEach(item => {
                if (item.employeeName && item.employeeName.trim() && item.name) {
                  const empName = item.employeeName.trim();
                  if (!employeeFoodMap[empName]) {
                    employeeFoodMap[empName] = {
                      items: [],
                      totalPrice: 0
                    };
                  }
                  employeeFoodMap[empName].items.push({
                    name: item.name,
                    portion: item.portion,
                    price: parseFloat(item.price) || 0
                  });
                  employeeFoodMap[empName].totalPrice += parseFloat(item.price) || 0;
                }
              });

              return Object.keys(employeeFoodMap).length > 0 && (
                <div style={{
                  padding: '15px',
                  borderRadius: '8px',
                  backgroundColor: '#f0fdf4',
                  borderLeft: '4px solid #1a5d33'
                }}>
                  <h5 style={{ 
                    margin: '0 0 12px 0', 
                    color: '#1a5d33', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Package style={{ width: '16px', height: '16px' }} />
                    Персонална храна по служители:
                  </h5>
                  {Object.entries(employeeFoodMap).map(([empName, data], idx) => (
                    <div key={idx} style={{
                      marginBottom: '12px',
                      paddingBottom: '12px',
                      borderBottom: idx < Object.keys(employeeFoodMap).length - 1 ? '1px solid #d1fae5' : 'none'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        color: '#1a5d33',
                        fontSize: '13px',
                        marginBottom: '6px'
                      }}>
                        {empName}
                      </div>
                      {data.items.map((food, foodIdx) => (
                        <div key={foodIdx} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '3px 0 3px 12px',
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          <span>• {food.name} {food.portion && `(${food.portion})`}</span>
                          <span style={{ fontWeight: '500' }}>{food.price.toFixed(2)} лв</span>
                        </div>
                      ))}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '6px 0 0 12px',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#1a5d33',
                        borderTop: '1px solid #d1fae5',
                        marginTop: '4px'
                      }}>
                        <span>Общо:</span>
                        <span>{data.totalPrice.toFixed(2)} лв</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Брак по служители */}
            {(() => {
              // Групиране на брак по служители
              const employeeDefectiveMap = {};
              defectiveItems.forEach(item => {
                if (item.brakedBy && item.brakedBy.trim() && item.name) {
                  const empName = item.brakedBy.trim();
                  if (!employeeDefectiveMap[empName]) {
                    employeeDefectiveMap[empName] = {
                      items: []
                    };
                  }
                  employeeDefectiveMap[empName].items.push({
                    name: item.name,
                    quantity: parseFloat(item.quantity) || 0,
                    unit: item.unit,
                    reason: item.reason
                  });
                }
              });

              return Object.keys(employeeDefectiveMap).length > 0 && (
                <div style={{
                  padding: '15px',
                  borderRadius: '8px',
                  backgroundColor: '#fef2f2',
                  borderLeft: '4px solid #dc2626'
                }}>
                  <h5 style={{ 
                    margin: '0 0 12px 0', 
                    color: '#dc2626', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle style={{ width: '16px', height: '16px' }} />
                    Брак по служители:
                  </h5>
                  {Object.entries(employeeDefectiveMap).map(([empName, data], idx) => (
                    <div key={idx} style={{
                      marginBottom: '12px',
                      paddingBottom: '12px',
                      borderBottom: idx < Object.keys(employeeDefectiveMap).length - 1 ? '1px solid #fecaca' : 'none'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        color: '#dc2626',
                        fontSize: '13px',
                        marginBottom: '6px'
                      }}>
                        {empName}
                      </div>
                      {data.items.map((defect, defectIdx) => (
                        <div key={defectIdx} style={{
                          padding: '3px 0 3px 12px',
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span>• {defect.name}</span>
                            <span style={{ fontWeight: '500' }}>
                              {defect.quantity} {defect.unit}
                            </span>
                          </div>
                          {defect.reason && (
                            <div style={{ 
                              paddingLeft: '12px', 
                              fontSize: '11px', 
                              fontStyle: 'italic',
                              color: '#9ca3af'
                            }}>
                              Причина: {defect.reason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Ако няма данни за обобщение */}
          {(() => {
            const hasEmployeeFood = inventoryItems.some(item => 
              item.employeeName && item.employeeName.trim() && item.name
            );
            const hasEmployeeDefective = defectiveItems.some(item => 
              item.brakedBy && item.brakedBy.trim() && item.name
            );

            return !hasEmployeeFood && !hasEmployeeDefective && (
              <div style={{
                padding: '15px',
                borderRadius: '8px',
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
                fontSize: '13px',
                textAlign: 'center',
                fontStyle: 'italic',
                gridColumn: '1 / -1'
              }}>
                Няма данни за обобщение. Попълнете имената на служителите в таблиците по-горе.
              </div>
            );
          })()}
        </div>

        {/* ==========================================
            INSTRUCTIONS
            ========================================== */}
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
                <strong style={{ color: '#1a5d33' }}>Инвентаризация:</strong> Записвайте всички налични продукти с тяхното количество и цена. 
                В долната секция отбелязвайте проблеми, брак или причини за липси. Формулярът се попълва ежедневно по смени за точно проследяване на инвентара.
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

        {/* ==========================================
            SUBMIT BUTTON
            ========================================== */}
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
              gap: '10px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#145228';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 93, 51, 0.3)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#1a5d33';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
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

export default RestaurantInventoryForm;