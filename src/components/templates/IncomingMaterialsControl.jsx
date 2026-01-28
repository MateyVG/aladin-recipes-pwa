// src/components/templates/IncomingMaterialsControl.jsx
import React, { useState, useEffect } from 'react';
import { Save, Download, Plus, Trash2, Package, Calendar, Building2, Thermometer, CheckSquare, Square } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const IncomingMaterialsControl = ({ template, department, restaurantId, onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [companyName, setCompanyName] = useState();
  const [objectName, setObjectName] = useState();
  const [manager, setManager] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [savedMaterialNames, setSavedMaterialNames] = useState([]);
  const [savedResponsibles, setSavedResponsibles] = useState([]);
  
  const [materials, setMaterials] = useState([
    {
      id: 1,
      receiptDate: '',
      materialName: '',
      batchNumber: '',
      supplier: '',
      quantity: '',
      document: '',
      useByDate: '',
      transportType: '',
      vehicleCleaned: '',
      temperature: '',
      packagingDefects: '',
      accepted: false,
      responsibleSignature: ''
    }
  ]);

  const addMaterial = () => {
    const newMaterial = {
      id: Date.now(),
      receiptDate: '',
      materialName: '',
      batchNumber: '',
      supplier: '',
      quantity: '',
      document: '',
      useByDate: '',
      transportType: '',
      vehicleCleaned: '',
      temperature: '',
      packagingDefects: '',
      accepted: false,
      responsibleSignature: ''
    };
    setMaterials([...materials, newMaterial]);
  };

  const removeMaterial = (id) => {
    if (materials.length > 1) {
      setMaterials(materials.filter(material => material.id !== id));
    }
  };

  const updateMaterial = (id, field, value) => {
    setMaterials(materials.map(material => 
      material.id === id ? { ...material, [field]: value } : material
    ));
    
    if (field === 'materialName' && value.trim() && !savedMaterialNames.includes(value.trim())) {
      setSavedMaterialNames([...savedMaterialNames, value.trim()]);
    }
    
    if (field === 'responsibleSignature' && value.trim() && !savedResponsibles.includes(value.trim())) {
      setSavedResponsibles([...savedResponsibles, value.trim()]);
    }
  };

  const exportData = () => {
    const data = {
      date: currentDate,
      companyName,
      objectName,
      manager,
      materials,
      savedMaterialNames,
      savedResponsibles,
      exportTime: new Date().toLocaleString('bg-BG')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incoming_materials_control_${currentDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveToSupabase = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const submissionData = {
        template_id: template.id,
        restaurant_id: restaurantId,
        department_id: department.id,
        data: {
          currentDate,
          companyName,
          objectName,
          manager,
          materials,
          savedMaterialNames,
          savedResponsibles
        },
        submitted_by: userData.user.id,
        submission_date: currentDate,
        synced: true
      };

      const { error } = await supabase
        .from('checklist_submissions')
        .insert(submissionData);

      if (error) throw error;

      alert('Данните са запазени успешно!');
      onBack();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Грешка при запазване: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load last submission for this template to get saved names
    const loadLastSubmission = async () => {
      try {
        const { data, error } = await supabase
          .from('checklist_submissions')
          .select('data')
          .eq('template_id', template.id)
          .eq('restaurant_id', restaurantId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data && !error) {
          if (data.data.savedMaterialNames) {
            setSavedMaterialNames(data.data.savedMaterialNames);
          }
          if (data.data.savedResponsibles) {
            setSavedResponsibles(data.data.savedResponsibles);
          }
        }
      } catch (error) {
        console.log('No previous data found');
      }
    };

    loadLastSubmission();
  }, [template.id, restaurantId]);

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#F4F6F8'}}>
      <div style={{maxWidth: '1600px', margin: '0 auto', padding: '24px'}}>
        
        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '20px',
            fontWeight: '600'
          }}
        >
          ← Назад
        </button>

        <div 
          style={{
            borderRadius: '12px',
            marginBottom: '32px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, #195E33, #2D7A4F)',
            border: '1px solid #E6F4EA'
          }}
        >
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
            <div style={{flex: 1}}>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '16px',
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  color: '#195E33'
                }}
                placeholder="Име на фирмата"
              />
              <input
                type="text"
                value={objectName}
                onChange={(e) => setObjectName(e.target.value)}
                style={{
                  fontSize: '18px',
                  marginBottom: '16px',
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  color: '#195E33'
                }}
                placeholder="Име на обекта"
              />
              <h2 style={{fontSize: '20px', fontWeight: 'bold', color: 'white', margin: 0}}>
                ДНЕВНИК ЗА ВХОДЯЩ КОНТРОЛ НА ОСНОВНИ СУРОВИНИ
              </h2>
            </div>
            <div style={{textAlign: 'right', color: 'white', marginLeft: '32px'}}>
              <div style={{backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '16px'}}>
                <p style={{fontWeight: 'bold', fontSize: '18px', margin: '0 0 8px 0'}}>КОД: ПРП 6.0.1</p>
                <p style={{opacity: 0.9, margin: '0 0 8px 0'}}>РЕДАКЦИЯ: 00</p>
                <p style={{fontWeight: '600', margin: 0}}>СТР. 1 ОТ 1</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '32px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb'}}>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <div style={{padding: '8px', borderRadius: '8px', backgroundColor: '#E6F4EA'}}>
                <Calendar style={{height: '20px', width: '20px', color: '#195E33'}} />
              </div>
              <div>
                <label style={{display: 'block', fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px'}}>Дата:</label>
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #E6F4EA',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <div style={{padding: '8px', borderRadius: '8px', backgroundColor: '#E6F4EA'}}>
                <Building2 style={{height: '20px', width: '20px', color: '#195E33'}} />
              </div>
              <div>
                <label style={{display: 'block', fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px'}}>Управител:</label>
                <input
                  type="text"
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #E6F4EA',
                    borderRadius: '8px',
                    fontSize: '14px',
                    minWidth: '200px'
                  }}
                  placeholder="Име и фамилия"
                />
              </div>
            </div>

            <div style={{display: 'flex', gap: '12px', marginLeft: 'auto'}}>
              <button
                onClick={addMaterial}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  backgroundColor: 'white',
                  color: '#195E33',
                  border: '1px solid #195E33',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <Package style={{height: '16px', width: '16px'}} />
                Добави суровина
              </button>
              <button
                onClick={saveToSupabase}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  backgroundColor: loading ? '#9ca3af' : '#195E33',
                  color: 'white',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                <Save style={{height: '16px', width: '16px'}} />
                {loading ? 'Запазване...' : 'Запази'}
              </button>
              <button
                onClick={exportData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  backgroundColor: '#195E33',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <Download style={{height: '16px', width: '16px'}} />
                Експорт
              </button>
            </div>
          </div>
        </div>

        <div style={{backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden'}}>
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead style={{backgroundColor: '#195E33'}}>
                <tr>
                  <th style={{padding: '16px', color: 'white', fontWeight: '600', fontSize: '13px', textAlign: 'center', minWidth: '120px', borderRight: '1px solid rgba(255,255,255,0.2)'}}>
                    Дата на приемане
                  </th>
                  <th style={{padding: '16px', color: 'white', fontWeight: '600', fontSize: '13px', textAlign: 'center', minWidth: '150px', borderRight: '1px solid rgba(255,255,255,0.2)'}}>
                    Наименование на суровината
                  </th>
                  <th style={{padding: '16px', color: 'white', fontWeight: '600', fontSize: '13px', textAlign: 'center', minWidth: '120px', borderRight: '1px solid rgba(255,255,255,0.2)'}}>
                    Номер на партида
                  </th>
                  <th style={{padding: '16px', color: 'white', fontWeight: '600', fontSize: '13px', textAlign: 'center', minWidth: '130px', borderRight: '1px solid rgba(255,255,255,0.2)'}}>
                    Доставчик (производител)
                  </th>
                  <th style={{padding: '16px', color: 'white', fontWeight: '600', fontSize: '13px', textAlign: 'center', minWidth: '100px', borderRight: '1px solid rgba(255,255,255,0.2)'}}>
                    Количество
                  </th>
                  <th style={{padding: '16px', color: 'white', fontWeight: '600', fontSize: '13px', textAlign: 'center', minWidth: '130px', borderRight: '1px solid rgba(255,255,255,0.2)'}}>
                    Придружаващ документ
                  </th>
                  <th style={{padding: '16px', color: 'white', fontWeight: '600', fontSize: '13px', textAlign: 'center', minWidth: '120px', borderRight: '1px solid rgba(255,255,255,0.2)'}}>
                    Да се използва преди
                  </th>
                  <th style={{padding: '16px', color: 'white', fontWeight: '600', fontSize: '13px', textAlign: 'center', minWidth: '120px', borderRight: '1px solid rgba(255,255,255,0.2)'}}>
                    Вид на използвания транспорт
                  </th>
                  <th style={{padding: '16px', color: 'white', fontWeight: '600', fontSize: '13px', textAlign: 'center', minWidth: '130px', borderRight: '1px solid rgba(255,255,255,0.2)'}}>
                    Почистено и подредено ли е превозното средство?
                  </th>
                  <th style={{padding: '16px', color: 'white', fontWeight: '600', fontSize: '13px', textAlign: 'center', minWidth: '120px', borderRight: '1px solid rgba(255,255,255,0.2)'}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'}}>
                      <Thermometer style={{height: '16px', width: '16px'}} />
                      Температура °С
                    </div>
                  </th>
                  <th style={{padding: '16px', color: 'white', fontWeight: '600', fontSize: '13px', textAlign: 'center', minWidth: '140px', borderRight: '1px solid rgba(255,255,255,0.2)'}}>
                    Недостатъци
                  </th>
                  <th style={{padding: '16px', color: 'white', fontWeight: '600', fontSize: '13px', textAlign: 'center', minWidth: '150px', borderRight: '1px solid rgba(255,255,255,0.2)'}}>
                    Отговорник подпис
                  </th>
                  <th style={{padding: '12px', color: 'white', fontWeight: '600', fontSize: '13px', textAlign: 'center', minWidth: '60px'}}>
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material, index) => (
                  <tr 
                    key={material.id} 
                    style={{backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'}}
                  >
                    <td style={{padding: '12px', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb'}}>
                      <input
                        type="date"
                        value={material.receiptDate}
                        onChange={(e) => updateMaterial(material.id, 'receiptDate', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #E6F4EA',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#374151'
                        }}
                      />
                    </td>
                    <td style={{padding: '12px', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb'}}>
                      <input
                        type="text"
                        value={material.materialName}
                        onChange={(e) => updateMaterial(material.id, 'materialName', e.target.value)}
                        list={`material-names-${material.id}`}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #E6F4EA',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#374151'
                        }}
                        placeholder="Наименование"
                      />
                      <datalist id={`material-names-${material.id}`}>
                        {savedMaterialNames.map((name, idx) => (
                          <option key={idx} value={name} />
                        ))}
                      </datalist>
                    </td>
                    <td style={{padding: '12px', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb'}}>
                      <input
                        type="text"
                        value={material.batchNumber}
                        onChange={(e) => updateMaterial(material.id, 'batchNumber', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #E6F4EA',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#374151'
                        }}
                        placeholder="№ партида"
                      />
                    </td>
                    <td style={{padding: '12px', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb'}}>
                      <input
                        type="text"
                        value={material.supplier}
                        onChange={(e) => updateMaterial(material.id, 'supplier', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #E6F4EA',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#374151'
                        }}
                        placeholder="Доставчик"
                      />
                    </td>
                    <td style={{padding: '12px', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb'}}>
                      <input
                        type="text"
                        value={material.quantity}
                        onChange={(e) => updateMaterial(material.id, 'quantity', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #E6F4EA',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#374151'
                        }}
                        placeholder="Количество"
                      />
                    </td>
                    <td style={{padding: '12px', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb'}}>
                      <input
                        type="text"
                        value={material.document}
                        onChange={(e) => updateMaterial(material.id, 'document', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #E6F4EA',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#374151'
                        }}
                        placeholder="Документ"
                      />
                    </td>
                    <td style={{padding: '12px', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb'}}>
                      <input
                        type="date"
                        value={material.useByDate}
                        onChange={(e) => updateMaterial(material.id, 'useByDate', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #E6F4EA',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#374151'
                        }}
                      />
                    </td>
                    <td style={{padding: '12px', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb'}}>
                      <select
                        value={material.transportType}
                        onChange={(e) => updateMaterial(material.id, 'transportType', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #E6F4EA',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#374151'
                        }}
                      >
                        <option value="">Избери</option>
                        <option value="Хладилен">Хладилен</option>
                        <option value="Обикновен">Обикновен</option>
                        <option value="Замразен">Замразен</option>
                      </select>
                    </td>
                    <td style={{padding: '12px', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb'}}>
                      <select
                        value={material.vehicleCleaned}
                        onChange={(e) => updateMaterial(material.id, 'vehicleCleaned', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #E6F4EA',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#374151'
                        }}
                      >
                        <option value="">Избери</option>
                        <option value="Да">Да</option>
                        <option value="Не">Не</option>
                      </select>
                    </td>
                    <td style={{padding: '12px', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb'}}>
                      <input
                        type="number"
                        value={material.temperature}
                        onChange={(e) => updateMaterial(material.id, 'temperature', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #E6F4EA',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#374151'
                        }}
                        placeholder="°C"
                      />
                    </td>
                    <td style={{padding: '12px', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb'}}>
                      <textarea
                        value={material.packagingDefects}
                        onChange={(e) => updateMaterial(material.id, 'packagingDefects', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #E6F4EA',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#374151',
                          resize: 'none'
                        }}
                        placeholder="Недостатъци"
                        rows="2"
                      />
                    </td>
                    <td style={{padding: '12px', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <button
                          onClick={() => updateMaterial(material.id, 'accepted', !material.accepted)}
                          style={{
                            padding: '4px',
                            borderRadius: '4px',
                            color: material.accepted ? '#195E33' : '#9CA3AF',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {material.accepted ? <CheckSquare style={{height: '20px', width: '20px'}} /> : <Square style={{height: '20px', width: '20px'}} />}
                        </button>
                        <input
                          type="text"
                          value={material.responsibleSignature}
                          onChange={(e) => updateMaterial(material.id, 'responsibleSignature', e.target.value)}
                          list={`responsible-names-${material.id}`}
                          style={{
                            flex: 1,
                            padding: '8px',
                            border: '1px solid #E6F4EA',
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: '#374151'
                          }}
                          placeholder="Име на отговорника"
                        />
                        <datalist id={`responsible-names-${material.id}`}>
                          {savedResponsibles.map((name, idx) => (
                            <option key={idx} value={name} />
                          ))}
                        </datalist>
                      </div>
                    </td>
                    <td style={{padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb'}}>
                      {materials.length > 1 && (
                        <button
                          onClick={() => removeMaterial(material.id)}
                          style={{
                            color: '#dc2626',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          title="Премахни запис"
                        >
                          <Trash2 style={{height: '16px', width: '16px'}} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{marginTop: '32px', backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#6b7280'}}>
            <span style={{fontWeight: '500'}}>Дата: <span style={{fontWeight: '600', color: '#195E33'}}>{currentDate}</span></span>
            <span style={{fontWeight: '500'}}>
              Утвърждавам: <span style={{fontWeight: '600', color: '#195E33'}}>{manager || '(Управител)'}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingMaterialsControl;