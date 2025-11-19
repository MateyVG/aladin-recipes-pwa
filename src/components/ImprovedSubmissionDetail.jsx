import React from 'react';

const ImprovedSubmissionDetail = ({ submission, onBack }) => {
  const data = submission.data || {};
  const config = submission.checklist_templates?.config || {};

  // ============================================
  // 🍕 PIZZA TEMPERATURE TABLE
  // ============================================
  const renderPizzaTable = () => {
    const pizzaTypes = config.pizza_types || [];
    const timeSlots = config.time_slots || [];
    
    if (pizzaTypes.length === 0) {
      return null;
    }

    const temperatures = data.temperatures || {};
    const pizzaCounts = data.pizzaCounts || {};

    return (
      <div style={{ marginTop: '30px', overflowX: 'auto' }}>
        <h3 style={{ marginBottom: '20px', color: '#1a5d33', fontSize: '18px' }}>
          🍕 Контрол на температура на пици
        </h3>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          border: '2px solid #1a5d33',
          fontSize: '10px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#1a5d33', color: 'white' }}>
              <th style={{ padding: '12px', border: '1px solid white', minWidth: '150px' }}>ВИД ПИЦА</th>
              <th style={{ padding: '12px', border: '1px solid white', minWidth: '60px' }}>ОБЩО БР.</th>
              {timeSlots.map((slot, idx) => (
                <th key={idx} style={{ padding: '8px 4px', border: '1px solid white', minWidth: '70px', fontSize: '9px' }}>
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pizzaTypes.map((pizza, pizzaIdx) => {
              const counts = pizzaCounts[pizza] || {};
              const total = Object.values(counts).reduce((sum, val) => sum + (isNaN(Number(val)) ? 0 : Number(val)), 0);

              return (
                <React.Fragment key={pizzaIdx}>
                  <tr style={{ backgroundColor: pizzaIdx % 2 === 0 ? 'white' : '#f9fafb' }}>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb', fontWeight: 'bold' }}>
                      {pizza}
                      <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: 'normal' }}>Температура °C</div>
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 'bold', color: '#1a5d33' }}>
                      {total || '-'}
                    </td>
                    {timeSlots.map((slot, slotIdx) => {
                      const temp = temperatures[pizza]?.[slot];
                      const numTemp = Number(temp);
                      let bgColor = 'white';
                      if (temp && !isNaN(numTemp)) {
                        if (numTemp < 85 || numTemp > 95) bgColor = '#fecaca';
                        else if (numTemp >= 85 && numTemp < 88) bgColor = '#fed7aa';
                        else if (numTemp >= 88 && numTemp <= 92) bgColor = '#86efac';
                        else if (numTemp > 92 && numTemp <= 95) bgColor = '#fde047';
                      }
                      return (
                        <td key={slotIdx} style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center', backgroundColor: bgColor, fontWeight: temp ? 'bold' : 'normal' }}>
                          {temp || '-'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr style={{ backgroundColor: pizzaIdx % 2 === 0 ? '#f3f4f6' : '#e5e7eb' }}>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb', fontSize: '9px', color: '#6b7280', fontStyle: 'italic' }}>
                      Брой пици
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}></td>
                    {timeSlots.map((slot, slotIdx) => (
                      <td key={slotIdx} style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center', fontSize: '9px' }}>
                        {pizzaCounts[pizza]?.[slot] || '-'}
                      </td>
                    ))}
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px', fontSize: '12px' }}>
          <strong>Легенда:</strong>
          <span style={{ marginLeft: '15px', padding: '4px 10px', backgroundColor: '#fecaca', borderRadius: '4px' }}>{'< 85°C или > 95°C'}</span>
          <span style={{ marginLeft: '8px', padding: '4px 10px', backgroundColor: '#fed7aa', borderRadius: '4px' }}>85-87°C</span>
          <span style={{ marginLeft: '8px', padding: '4px 10px', backgroundColor: '#86efac', borderRadius: '4px' }}>88-92°C (Оптимално)</span>
          <span style={{ marginLeft: '8px', padding: '4px 10px', backgroundColor: '#fde047', borderRadius: '4px' }}>93-95°C</span>
        </div>
      </div>
    );
  };

  // ============================================
  // 🐔 PRODUCTION SHEETS (Chicken, Doner, Meatballs)
  // ============================================
  const renderProduction = () => {
    if (!data.productions) return null;

    let productions = data.productions;
    
    // Check the structure of productions
    const isDirectArray = Array.isArray(productions) && productions.length > 0 && 
                          (productions[0].employee || productions[0].quantity || productions[0].notes);
    
    const isObjectWithSections = !Array.isArray(productions) && typeof productions === 'object';
    
    const isArrayWithObject = Array.isArray(productions) && productions.length === 1 && 
                              typeof productions[0] === 'object' && 
                              !productions[0].employee && !productions[0].quantity;

    // Handle different structures
    if (isDirectArray) {
      // Productions is directly an array of items
      return (
        <div style={{ marginTop: '30px' }}>
          {/* Basic Info */}
          {data.currentDate && (
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
              <strong>Дата:</strong> {new Date(data.currentDate).toLocaleDateString('bg-BG')}
              {data.manager && <span style={{ marginLeft: '30px' }}><strong>Управител:</strong> {data.manager}</span>}
            </div>
          )}

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#1a5d33' }}>
              📦 Производство
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #1a5d33', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1a5d33', color: 'white' }}>
                    <th style={{ padding: '12px', border: '1px solid white', textAlign: 'left' }}>№</th>
                    <th style={{ padding: '12px', border: '1px solid white', textAlign: 'left' }}>Служител</th>
                    <th style={{ padding: '12px', border: '1px solid white', textAlign: 'center' }}>Количество</th>
                    <th style={{ padding: '12px', border: '1px solid white', textAlign: 'left' }}>Бележки</th>
                  </tr>
                </thead>
                <tbody>
                  {productions.filter(item => item.employee || item.quantity || item.notes).map((item, idx) => (
                    <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                      <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 'bold' }}>{item.number || idx + 1}</td>
                      <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{item.employee || '-'}</td>
                      <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.quantity || '-'}</td>
                      <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{item.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
    
    if (isArrayWithObject) {
      // Unwrap single array element
      productions = productions[0];
    }
    
    if (isObjectWithSections || isArrayWithObject) {
      // Productions is an object with sections (file, bonfile, etc.)
      const sections = Object.keys(productions).filter(key => Array.isArray(productions[key]));

      // Bulgarian translations for section names
      const sectionNames = {
        'file': 'Филе',
        'bonfile': 'Бон Филе',
        'wings': 'Крилца',
        'legs': 'Бутчета',
        'doner': 'Дюнер',
        'meatballs': 'Кюфтета',
        'chicken': 'Пиле',
        'breast': 'Гърди',
        'thighs': 'Бедра'
      };

      return (
        <div style={{ marginTop: '30px' }}>
          {/* Basic Info */}
          {data.currentDate && (
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
              <strong>Дата:</strong> {new Date(data.currentDate).toLocaleDateString('bg-BG')}
              {data.manager && <span style={{ marginLeft: '30px' }}><strong>Управител:</strong> {data.manager}</span>}
            </div>
          )}

          {/* Production Tables */}
          {sections.map((section, idx) => {
            const sectionData = productions[section];
            
            if (!sectionData || sectionData.length === 0) return null;

            const sectionLabel = sectionNames[section.toLowerCase()] || section;

            return (
              <div key={idx} style={{ marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#1a5d33' }}>
                  📦 {sectionLabel}
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #1a5d33', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#1a5d33', color: 'white' }}>
                        <th style={{ padding: '12px', border: '1px solid white', textAlign: 'left' }}>№</th>
                        <th style={{ padding: '12px', border: '1px solid white', textAlign: 'left' }}>Служител</th>
                        <th style={{ padding: '12px', border: '1px solid white', textAlign: 'center' }}>Количество</th>
                        <th style={{ padding: '12px', border: '1px solid white', textAlign: 'left' }}>Бележки</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectionData.filter(item => item.employee || item.quantity || item.notes).map((item, itemIdx) => (
                        <tr key={itemIdx} style={{ backgroundColor: itemIdx % 2 === 0 ? 'white' : '#f9fafb' }}>
                          <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 'bold' }}>{itemIdx + 1}</td>
                          <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{item.employee || '-'}</td>
                          <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.quantity || '-'}</td>
                          <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{item.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  };

  // ============================================
  // 🍽️ PORTION AND DEFECT (Restaurant Inventory)
  // ============================================
  const renderPortionAndDefect = () => {
    if (!data.summary) return null;

    const summary = data.summary;
    const totals = data.totals || {};
    
    // Use allConsumption and allDefective arrays, filter only filled rows
    const allConsumption = (summary.allConsumption || []).filter(item => item.name && item.name.trim() !== '');
    const allDefective = (summary.allDefective || []).filter(item => item.name && item.name.trim() !== '');

    return (
      <div style={{ marginTop: '30px' }}>
        {/* Basic Info */}
        <div style={{ marginBottom: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          {data.date && (
            <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
              <strong>Дата:</strong> {new Date(data.date).toLocaleDateString('bg-BG')}
            </div>
          )}
          {data.shift && (
            <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
              <strong>Смяна:</strong> {data.shift}
            </div>
          )}
          {data.manager && (
            <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
              <strong>Управител:</strong> {data.manager}
            </div>
          )}
          {totals.inventory && (
            <div style={{ padding: '12px', backgroundColor: '#fff7ed', borderRadius: '8px', border: '1px solid #fb923c' }}>
              <strong>Обща стойност:</strong> {totals.inventory} лв.
            </div>
          )}
        </div>

        {/* Consumption Table */}
        {allConsumption.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#1a5d33' }}>
              🍽️ Консумация (Персонална храна)
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #1a5d33', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1a5d33', color: 'white' }}>
                    <th style={{ padding: '12px', border: '1px solid white', textAlign: 'left' }}>№</th>
                    <th style={{ padding: '12px', border: '1px solid white', textAlign: 'left' }}>Наименование</th>
                    <th style={{ padding: '12px', border: '1px solid white', textAlign: 'center' }}>Брой порции</th>
                    <th style={{ padding: '12px', border: '1px solid white', textAlign: 'right' }}>Цена (лв)</th>
                    <th style={{ padding: '12px', border: '1px solid white', textAlign: 'left' }}>Служител</th>
                  </tr>
                </thead>
                <tbody>
                  {allConsumption.map((item, idx) => (
                    <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                      <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                      <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{item.name || '-'}</td>
                      <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.portion || '-'}</td>
                      <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'right' }}>{item.price || '-'}</td>
                      <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{item.employeeName || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Defective Table */}
        {allDefective.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#dc2626' }}>
              ⚠️ Брак (Дефектни продукти)
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #dc2626', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#dc2626', color: 'white' }}>
                    <th style={{ padding: '12px', border: '1px solid white', textAlign: 'left' }}>№</th>
                    <th style={{ padding: '12px', border: '1px solid white', textAlign: 'left' }}>Наименование</th>
                    <th style={{ padding: '12px', border: '1px solid white', textAlign: 'center' }}>Количество</th>
                    <th style={{ padding: '12px', border: '1px solid white', textAlign: 'center' }}>Мярка</th>
                    <th style={{ padding: '12px', border: '1px solid white', textAlign: 'left' }}>Причина</th>
                    <th style={{ padding: '12px', border: '1px solid white', textAlign: 'left' }}>Бракувал</th>
                  </tr>
                </thead>
                <tbody>
                  {allDefective.map((item, idx) => (
                    <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#fef2f2' }}>
                      <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                      <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{item.name || '-'}</td>
                      <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.quantity || '-'}</td>
                      <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.unit || '-'}</td>
                      <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{item.reason || '-'}</td>
                      <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{item.brakedBy || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {allConsumption.length === 0 && allDefective.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            Няма записана консумация или брак
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // 📋 STANDARD FORMAT (header + rows)
  // ============================================
  const renderStandardFormat = () => {
    if (!data.rows || data.rows.length === 0) return null;

    return (
      <div style={{ marginTop: '30px' }}>
        {/* Header Section */}
        {data.header && Object.keys(data.header).length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#1a5d33' }}>
              📝 Основна информация
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {Object.entries(data.header).map(([key, value]) => (
                <div key={key} style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '600', textTransform: 'capitalize' }}>
                    {key.replace(/_/g, ' ')}:
                  </div>
                  <div style={{ fontSize: '14px', color: '#1a5d33', fontWeight: '600' }}>
                    {key === 'date' && value ? new Date(value).toLocaleDateString('bg-BG') : value || '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rows Table */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#1a5d33' }}>
            📊 Записи ({data.rows.length} {data.rows.length === 1 ? 'ред' : 'реда'})
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #1a5d33', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#1a5d33', color: 'white' }}>
                  {/* Dynamically generate headers from first row */}
                  {data.rows.length > 0 && Object.keys(data.rows[0]).filter(key => key !== 'id').map(key => (
                    <th key={key} style={{ padding: '10px 8px', border: '1px solid rgba(255,255,255,0.3)', textAlign: 'left', fontSize: '11px', fontWeight: '700', textTransform: 'capitalize' }}>
                      {key.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                    {Object.entries(row).filter(([key]) => key !== 'id').map(([key, value], cellIdx) => (
                      <td key={cellIdx} style={{ padding: '10px 8px', border: '1px solid #e5e7eb', fontSize: '12px' }}>
                        {value || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // 🛢️ OIL CHANGE CHECKLIST
  // ============================================
  const renderOilChangeRecords = () => {
    if (!data.records || data.records.length === 0) return null;

    const filledRecords = data.records.filter(r => r.date || r.shift || r.quantity || r.oilType || r.employee);

    if (filledRecords.length === 0) return null;

    return (
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#1a5d33' }}>
          🛢️ Смяна на олио
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #1a5d33', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#1a5d33', color: 'white' }}>
                <th style={{ padding: '12px', border: '1px solid white', textAlign: 'left' }}>№</th>
                <th style={{ padding: '12px', border: '1px solid white', textAlign: 'left' }}>Дата</th>
                <th style={{ padding: '12px', border: '1px solid white', textAlign: 'center' }}>Смяна</th>
                <th style={{ padding: '12px', border: '1px solid white', textAlign: 'center' }}>Количество (л)</th>
                <th style={{ padding: '12px', border: '1px solid white', textAlign: 'left' }}>Вид олио</th>
                <th style={{ padding: '12px', border: '1px solid white', textAlign: 'left' }}>Служител</th>
              </tr>
            </thead>
            <tbody>
              {filledRecords.map((record, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 'bold' }}>{record.id}</td>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{record.date ? new Date(record.date).toLocaleDateString('bg-BG') : '-'}</td>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{record.shift || '-'}</td>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{record.quantity || '-'}</td>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{record.oilType || '-'}</td>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{record.employee || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ============================================
  // 🌡️ REFRIGERATOR TEMPERATURE CONTROL
  // ============================================
  const renderRefrigeratorTemperature = () => {
    if (!data.rows || data.rows.length === 0) return null;

    // Support both 'columns' and 'customColumns'
    const columns = data.columns || data.customColumns || [];
    const filledRows = data.rows.filter(r => r.date || Object.keys(r.data || {}).length > 0 || r.checkedBy || r.corrective);

    if (filledRows.length === 0) return null;

    // If we have columns array, use it directly
    let allColumns = [];
    if (columns.length > 0) {
      allColumns = columns;
    } else {
      // Fallback to default columns if none provided
      const defaultColumns = [
        { key: 'walk_in_fridge', label: 'Walk-in хладилник', id: 'walk_in_fridge' },
        { key: 'chest_freezer', label: 'Хладилна витрина', id: 'chest_freezer' },
        { key: 'vertical_freezer', label: 'Вертикален фризер', id: 'vertical_freezer' }
      ];
      allColumns = defaultColumns;
    }

    // Check if data has time slots (8:00, 19:00)
    const hasTimeSlots = filledRows.some(row => {
      const dataKeys = Object.keys(row.data || {});
      return dataKeys.some(key => key.includes('_8') || key.includes('_19'));
    });

    return (
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#1a5d33' }}>
          🌡️ Контрол температура на витрини
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #1a5d33', fontSize: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#1a5d33', color: 'white' }}>
                <th style={{ padding: '10px', border: '1px solid white', textAlign: 'left', minWidth: '80px' }}>Дата</th>
                {hasTimeSlots && <th style={{ padding: '10px', border: '1px solid white', textAlign: 'center', minWidth: '60px' }}>Час</th>}
                {allColumns.map((col, idx) => (
                  <th key={idx} style={{ padding: '8px', border: '1px solid white', textAlign: 'center', minWidth: '80px' }}>
                    <div style={{ fontWeight: 'bold' }}>{col.name || col.label}</div>
                    {col.unit && <div style={{ fontSize: '9px', fontWeight: 'normal', marginTop: '2px' }}>({col.unit})</div>}
                    {col.temp && <div style={{ fontSize: '9px', fontWeight: 'normal', marginTop: '2px' }}>{col.temp}</div>}
                  </th>
                ))}
                <th style={{ padding: '10px', border: '1px solid white', textAlign: 'left', minWidth: '150px' }}>Коригиращи действия</th>
                <th style={{ padding: '10px', border: '1px solid white', textAlign: 'left', minWidth: '100px' }}>Проверил</th>
              </tr>
            </thead>
            <tbody>
              {filledRows.map((row, idx) => {
                if (hasTimeSlots) {
                  // Render two rows - one for 8:00 and one for 19:00
                  return (
                    <React.Fragment key={idx}>
                      <tr style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                        <td style={{ padding: '8px', border: '1px solid #e5e7eb' }} rowSpan={2}>{row.date ? new Date(row.date).toLocaleDateString('bg-BG') : '-'}</td>
                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 'bold' }}>8:00</td>
                        {allColumns.map((col, colIdx) => {
                          const colKey = col.id || col.key;
                          const value = row.data?.[`${colKey}_8`];
                          return (
                            <td key={colIdx} style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: value ? 'bold' : 'normal' }}>
                              {value || '-'}
                            </td>
                          );
                        })}
                        <td style={{ padding: '8px', border: '1px solid #e5e7eb' }} rowSpan={2}>{row.corrective || '-'}</td>
                        <td style={{ padding: '8px', border: '1px solid #e5e7eb' }} rowSpan={2}>{row.checkedBy || '-'}</td>
                      </tr>
                      <tr style={{ backgroundColor: idx % 2 === 0 ? '#f3f4f6' : '#e5e7eb' }}>
                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 'bold' }}>19:00</td>
                        {allColumns.map((col, colIdx) => {
                          const colKey = col.id || col.key;
                          const value = row.data?.[`${colKey}_19`];
                          return (
                            <td key={colIdx} style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: value ? 'bold' : 'normal' }}>
                              {value || '-'}
                            </td>
                          );
                        })}
                      </tr>
                    </React.Fragment>
                  );
                } else {
                  // Regular single row
                  return (
                    <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                      <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{row.date ? new Date(row.date).toLocaleDateString('bg-BG') : '-'}</td>
                      {allColumns.map((col, colIdx) => {
                        const colKey = col.id || col.key;
                        const value = row.data?.[colKey];
                        return (
                          <td key={colIdx} style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                            {value || '-'}
                          </td>
                        );
                      })}
                      <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{row.corrective || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{row.checkedBy || '-'}</td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ============================================
  // 📦 REFRIGERATOR STORAGE CONTROL
  // ============================================
  const renderRefrigeratorStorage = () => {
    if (!data.dateBlocks || data.dateBlocks.length === 0) return null;

    const customRefrigerators = data.customRefrigerators || [];
    const filledBlocks = data.dateBlocks.filter(block => block.date || Object.keys(block.readings || {}).length > 0);

    if (filledBlocks.length === 0) return null;

    const defaultRefrigerators = [
      { key: 'walk_in_cooler', label: 'Walk-in Cooler' },
      { key: 'reach_in_cooler', label: 'Reach-in Cooler' },
      { key: 'prep_cooler', label: 'Prep Cooler' }
    ];

    const allRefrigerators = [...defaultRefrigerators, ...customRefrigerators];

    return (
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#1a5d33' }}>
          📦 Контрол съхранение в хладилници
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #1a5d33', fontSize: '11px' }}>
            <thead>
              <tr style={{ backgroundColor: '#1a5d33', color: 'white' }}>
                <th style={{ padding: '10px', border: '1px solid white', textAlign: 'left' }}>Дата</th>
                {allRefrigerators.map((ref, idx) => (
                  <th key={idx} style={{ padding: '10px', border: '1px solid white', textAlign: 'center' }}>{ref.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filledBlocks.map((block, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                  <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{block.date ? new Date(block.date).toLocaleDateString('bg-BG') : '-'}</td>
                  {allRefrigerators.map((ref, refIdx) => {
                    const value = block.readings?.[ref.key];
                    return (
                      <td key={refIdx} style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                        {value || '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ============================================
  // 🧼 HYGIENE WORK CARD
  // ============================================
  const renderHygieneWorkCard = () => {
    if (!data.zones && !data.employees) return null;

    return (
      <div style={{ marginTop: '30px' }}>
        {/* Basic Info */}
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
          {data.currentDate && <div><strong>Дата:</strong> {new Date(data.currentDate).toLocaleDateString('bg-BG')}</div>}
          {data.hygieneType && <div style={{ marginTop: '8px' }}><strong>Тип хигиена:</strong> {data.hygieneType}</div>}
          {data.manager && <div style={{ marginTop: '8px' }}><strong>Управител:</strong> {data.manager}</div>}
        </div>

        {/* Employees */}
        {data.employees && data.employees.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#1a5d33' }}>
              👥 Служители
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #1a5d33', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1a5d33', color: 'white' }}>
                    <th style={{ padding: '12px', border: '1px solid white', textAlign: 'left' }}>№</th>
                    <th style={{ padding: '12px', border: '1px solid white', textAlign: 'left' }}>Име</th>
                  </tr>
                </thead>
                <tbody>
                  {data.employees.filter(e => e.trim()).map((emp, idx) => (
                    <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                      <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                      <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{emp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Zones with completion data */}
        {data.zones && data.zones.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#1a5d33' }}>
              🧼 Зони за почистване
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #1a5d33', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1a5d33', color: 'white' }}>
                    <th style={{ padding: '12px', border: '1px solid white', textAlign: 'left' }}>Зона</th>
                    <th style={{ padding: '12px', border: '1px solid white', textAlign: 'center' }}>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {data.zones.map((zone, idx) => {
                    const completed = data.completionData?.[zone] || false;
                    return (
                      <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                        <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{zone}</td>
                        <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '4px 12px', 
                            borderRadius: '12px', 
                            backgroundColor: completed ? '#86efac' : '#fecaca',
                            color: completed ? '#166534' : '#991b1b',
                            fontWeight: 'bold',
                            fontSize: '11px'
                          }}>
                            {completed ? '✓ Готово' : '✗ Не е готово'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // 🔄 FALLBACK - За непознати формати
  // ============================================
  const renderFallback = () => {
    const skipFields = ['savedEmployees', 'savedManagers', 'savedOilTypes', 'savedInspectors', 'protocolNumber'];
    
    const filteredData = Object.entries(data).filter(([key, value]) => {
      if (skipFields.includes(key)) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) return false;
      if (value === '' || value === null || value === undefined) return false;
      return true;
    });

    if (filteredData.length === 0) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          Няма данни за показване
        </div>
      );
    }

    return (
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#1a5d33' }}>
          📋 Данни от чек листа
        </h3>
        <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          {filteredData.map(([key, value]) => (
            <div key={key} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px', fontWeight: '600', textTransform: 'capitalize' }}>
                {key.replace(/_/g, ' ')}:
              </div>
              <div style={{ fontSize: '14px', color: '#1a5d33' }}>
                {typeof value === 'object' ? (
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12px' }}>
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) : (
                  String(value)
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ============================================
  // 🎯 INTELLIGENT FORMAT DETECTION
  // ============================================
  const isPizza = (data.temperatures || data.pizzaCounts) && config.pizza_types;
  const isProduction = data.productions;
  const isPortionAndDefect = data.summary && (data.summary.allConsumption || data.summary.allDefective);
  const isOilChange = data.records && Array.isArray(data.records) && !data.rows;
  // Refrigerator temp has rows with 'data' field inside each row
  const isRefrigeratorTemp = data.rows && data.rows.length > 0 && data.rows.some(r => r.data && typeof r.data === 'object') && (data.customColumns !== undefined || data.columns !== undefined);
  const isRefrigeratorStorage = data.dateBlocks && data.customRefrigerators !== undefined;
  const isHygieneCard = data.zones || (data.employees && data.completionData);
  // Standard format has rows with direct properties (name, position, etc), not nested 'data'
  const isStandard = data.rows && data.rows.length > 0 && !isRefrigeratorTemp;

  // ============================================
  // 🎨 MAIN RENDER
  // ============================================
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '20px' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* Back Button */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <button onClick={onBack} style={{ padding: '12px 24px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
            ← Назад към списъка
          </button>
        </div>

        {/* Main Content */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '40px' }}>
          
          {/* Header */}
          <div style={{ borderBottom: '3px solid #1a5d33', paddingBottom: '20px', marginBottom: '30px' }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#1a5d33', fontWeight: 'bold' }}>
              {submission.checklist_templates?.name || 'Чек лист'}
            </h1>
            {submission.checklist_templates?.description && (
              <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#6b7280' }}>
                {submission.checklist_templates.description}
              </p>
            )}
            
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
              <div style={{ padding: '12px 20px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
                <strong>Дата:</strong> {new Date(submission.submission_date).toLocaleDateString('bg-BG')}
              </div>
              <div style={{ padding: '12px 20px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
                <strong>Попълнил:</strong> {submission.profiles?.full_name || submission.profiles?.email}
              </div>
              <div style={{ padding: '12px 20px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
                <strong>Време:</strong> {new Date(submission.submitted_at).toLocaleTimeString('bg-BG')}
              </div>
            </div>
          </div>

          {/* Render appropriate format based on data structure */}
          {isPizza && renderPizzaTable()}
          {isStandard && renderStandardFormat()}
          {isProduction && renderProduction()}
          {isPortionAndDefect && renderPortionAndDefect()}
          {isOilChange && renderOilChangeRecords()}
          {isRefrigeratorTemp && renderRefrigeratorTemperature()}
          {isRefrigeratorStorage && renderRefrigeratorStorage()}
          {isHygieneCard && renderHygieneWorkCard()}
          {!isPizza && !isStandard && !isProduction && !isPortionAndDefect && !isOilChange && !isRefrigeratorTemp && !isRefrigeratorStorage && !isHygieneCard && renderFallback()}

          {/* Signature Section */}
          <div style={{ marginTop: '60px', paddingTop: '30px', borderTop: '2px solid #e5e7eb', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            <div>
              <div style={{ marginBottom: '40px', color: '#6b7280', fontSize: '14px' }}>Попълнил:</div>
              <div style={{ borderBottom: '2px solid #374151', paddingBottom: '8px', marginBottom: '8px', minHeight: '24px' }}>
                {submission.profiles?.full_name || submission.profiles?.email}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>Име и подпис</div>
            </div>
            <div>
              <div style={{ marginBottom: '40px', color: '#6b7280', fontSize: '14px' }}>Проверил:</div>
              <div style={{ borderBottom: '2px solid #374151', paddingBottom: '8px', marginBottom: '8px', minHeight: '24px' }}>&nbsp;</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>Име и подпис</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ImprovedSubmissionDetail;