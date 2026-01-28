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
  // 🐔 CHICKEN PRODUCTION SHEET
  // ============================================
  const renderChickenProduction = () => {
    if (!data.productions) return null;

    const productions = data.productions;
    
    // Check if it has sections (file, bonFile, wings, rice)
    const hasSections = !Array.isArray(productions) && typeof productions === 'object' &&
                        (productions.file || productions.bonFile || productions.wings || productions.rice);
    
    if (!hasSections) return null;

    const sectionNames = {
      'file': 'Филе',
      'bonFile': 'Бон Филе',
      'wings': 'Крилца',
      'rice': 'Ориз'
    };

    const sections = Object.keys(productions).filter(key => Array.isArray(productions[key]));

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

          // Filter only filled rows
          const filledData = sectionData.filter(item => 
            item.count || item.quantity || item.batchL || item.cookingTime || 
            item.displayTime || item.defect || item.employeeName
          );

          if (filledData.length === 0) return null;

          const sectionLabel = sectionNames[section] || section;

          return (
            <div key={idx} style={{ marginBottom: '30px' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#1a5d33' }}>
                📦 {sectionLabel}
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #1a5d33', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1a5d33', color: 'white' }}>
                      <th style={{ padding: '10px', border: '1px solid white', textAlign: 'center' }}>№</th>
                      {section !== 'rice' && <th style={{ padding: '10px', border: '1px solid white', textAlign: 'center' }}>Брой/Кол-во</th>}
                      {section === 'rice' && <th style={{ padding: '10px', border: '1px solid white', textAlign: 'center' }}>Количество</th>}
                      <th style={{ padding: '10px', border: '1px solid white', textAlign: 'center' }}>Партида</th>
                      {section !== 'rice' && <th style={{ padding: '10px', border: '1px solid white', textAlign: 'center' }}>Пържене (мин)</th>}
                      {section !== 'rice' && <th style={{ padding: '10px', border: '1px solid white', textAlign: 'center' }}>Температура</th>}
                      <th style={{ padding: '10px', border: '1px solid white', textAlign: 'center' }}>Час готвене</th>
                      <th style={{ padding: '10px', border: '1px solid white', textAlign: 'center' }}>Час витрина</th>
                      <th style={{ padding: '10px', border: '1px solid white', textAlign: 'left' }}>Дефект</th>
                      <th style={{ padding: '10px', border: '1px solid white', textAlign: 'left' }}>Служител</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filledData.map((item, itemIdx) => (
                      <tr key={itemIdx} style={{ backgroundColor: itemIdx % 2 === 0 ? 'white' : '#f9fafb' }}>
                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 'bold' }}>{item.number || itemIdx + 1}</td>
                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.count || item.quantity || '-'}</td>
                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.batchL || '-'}</td>
                        {section !== 'rice' && <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.fryDuration || '-'}</td>}
                        {section !== 'rice' && <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.fryTemperature || '-'}</td>}
                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.cookingTime || '-'}</td>
                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.displayTime || '-'}</td>
                        <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{item.defect || '-'}</td>
                        <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{item.employeeName || '-'}</td>
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
  };

  // ============================================
  // 🥙 DONER PRODUCTION SHEET
  // ============================================
  const renderDonerProduction = () => {
    if (!data.productions || !Array.isArray(data.productions)) return null;
    
    // Check if it's doner format (has deliveryDateTime, weight, finishDateTime)
    const isDoner = data.productions.some(p => 
      p.deliveryDateTime !== undefined || p.weight !== undefined || p.finishDateTime !== undefined
    );
    
    if (!isDoner) return null;

    const filledData = data.productions.filter(item => 
      item.deliveryDateTime || item.weight || item.usedBefore || 
      item.batchNumber || item.finishDateTime || item.employeeName
    );

    if (filledData.length === 0) return null;

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
            🥙 Производствен лист Дюнер
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #1a5d33', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#1a5d33', color: 'white' }}>
                  <th style={{ padding: '10px', border: '1px solid white', textAlign: 'center' }}>№</th>
                  <th style={{ padding: '10px', border: '1px solid white', textAlign: 'center' }}>Дата/час доставка</th>
                  <th style={{ padding: '10px', border: '1px solid white', textAlign: 'center' }}>Тегло (кг)</th>
                  <th style={{ padding: '10px', border: '1px solid white', textAlign: 'center' }}>Използва се до</th>
                  <th style={{ padding: '10px', border: '1px solid white', textAlign: 'center' }}>Партида №</th>
                  <th style={{ padding: '10px', border: '1px solid white', textAlign: 'center' }}>Дата/час приключване</th>
                  <th style={{ padding: '10px', border: '1px solid white', textAlign: 'left' }}>Служител</th>
                </tr>
              </thead>
              <tbody>
                {filledData.map((item, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                    <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 'bold' }}>{item.number || idx + 1}</td>
                    <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.deliveryDateTime || '-'}</td>
                    <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.weight || '-'}</td>
                    <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.usedBefore || '-'}</td>
                    <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.batchNumber || '-'}</td>
                    <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.finishDateTime || '-'}</td>
                    <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{item.employeeName || '-'}</td>
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
  // 🍖 CHICKEN MEATBALL PRODUCTION SHEET
  // ============================================
  const renderMeatballProduction = () => {
    if (!data.productions || !Array.isArray(data.productions)) return null;
    
    // Check if it's meatball format (has dateTime, type, quantity)
    const isMeatball = data.productions.some(p => 
      (p.dateTime !== undefined || p.type !== undefined) && 
      !p.deliveryDateTime && !p.weight // Not doner
    );
    
    if (!isMeatball) return null;

    const filledData = data.productions.filter(item => 
      item.dateTime || item.type || item.quantity || item.batchL || item.employeeName
    );

    if (filledData.length === 0) return null;

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
            🍖 Производствен лист за пилешко кюфте
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #1a5d33', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#1a5d33', color: 'white' }}>
                  <th style={{ padding: '10px', border: '1px solid white', textAlign: 'center' }}>№</th>
                  <th style={{ padding: '10px', border: '1px solid white', textAlign: 'center' }}>Дата/час</th>
                  <th style={{ padding: '10px', border: '1px solid white', textAlign: 'left' }}>Тип</th>
                  <th style={{ padding: '10px', border: '1px solid white', textAlign: 'center' }}>Количество</th>
                  <th style={{ padding: '10px', border: '1px solid white', textAlign: 'center' }}>Партида</th>
                  <th style={{ padding: '10px', border: '1px solid white', textAlign: 'left' }}>Служител</th>
                </tr>
              </thead>
              <tbody>
                {filledData.map((item, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                    <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 'bold' }}>{item.number || idx + 1}</td>
                    <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.dateTime || '-'}</td>
                    <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{item.type || '-'}</td>
                    <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.quantity || '-'}</td>
                    <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.batchL || '-'}</td>
                    <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{item.employeeName || '-'}</td>
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
  // 🛢️ OIL CHANGE CHECKLIST
  // ============================================
  const renderOilChangeRecords = () => {
    if (!data.records || data.records.length === 0) return null;

    // Check for nameSignature field (OilChangeChecklist format)
    const filledRecords = data.records.filter(r => 
      r.date || r.shift || r.quantity || r.oilType || r.nameSignature
    );

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
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{record.nameSignature || '-'}</td>
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

    // Get columns from customColumns
    const customColumns = data.customColumns || [];
    
    // Default columns
    const defaultColumns = [
      { id: 'hot_display', name: 'Топла витрина', temp: '≥ 63°C', unit: 'Пица' },
      { id: 'cold_pizza', name: 'Студена витрина', temp: '0°C÷4°C', unit: 'Пица' },
      { id: 'cold_doner', name: 'Студена витрина', temp: '0°C÷4°C', unit: 'Дюнер' },
      { id: 'hot_clean', name: 'Топла витрина', temp: '≥ 63°C', unit: 'Чикън' }
    ];

    const allColumns = [...defaultColumns, ...customColumns];

    const filledRows = data.rows.filter(r => 
      r.date || Object.keys(r.data || {}).length > 0 || r.checkedBy || r.corrective
    );

    if (filledRows.length === 0) return null;

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
                    <div style={{ fontWeight: 'bold' }}>{col.name}</div>
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
                          const value = row.data?.[`${col.id}_8`];
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
                          const value = row.data?.[`${col.id}_19`];
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
                  // Simple row without time slots
                  return (
                    <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                      <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{row.date ? new Date(row.date).toLocaleDateString('bg-BG') : '-'}</td>
                      {allColumns.map((col, colIdx) => {
                        const value = row.data?.[col.id];
                        return (
                          <td key={colIdx} style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: value ? 'bold' : 'normal' }}>
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
  // 🧊 REFRIGERATOR STORAGE CONTROL
  // ============================================
  // ============================================
  // 🧼 HYGIENE WORK CARD
  // ============================================
  const renderHygieneCard = () => {
    if (!data.zones && !data.customRefrigerators && !data.completionData) return null;

    const zones = data.zones || [];
    const customRefrigerators = data.customRefrigerators || [];
    const completionData = data.completionData || {};
    const employees = data.employees || [];

    // Check if there's any completion data
    const hasData = Object.keys(completionData).length > 0 || employees.length > 0;
    if (!hasData) return null;

    return (
      <div style={{ marginTop: '30px' }}>
        {/* Basic Info */}
        {(data.currentDate || data.manager || data.hygieneType) && (
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
            {data.currentDate && <div><strong>Дата:</strong> {new Date(data.currentDate).toLocaleDateString('bg-BG')}</div>}
            {data.manager && <div style={{ marginTop: '5px' }}><strong>Управител:</strong> {data.manager}</div>}
            {data.hygieneType && <div style={{ marginTop: '5px' }}><strong>Тип хигиенизиране:</strong> {data.hygieneType}</div>}
            {employees.length > 0 && (
              <div style={{ marginTop: '5px' }}>
                <strong>Служители:</strong> {employees.join(', ')}
              </div>
            )}
          </div>
        )}

        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#1a5d33' }}>
          🧼 Работна карта за хигиенизиране
        </h3>

        {/* Zones */}
        {zones.map((zone, zoneIdx) => {
          const hasZoneData = zone.areas?.some(area => {
            const key = `${zone.id}_${area.name}`;
            return completionData[`${key}_cleaning`] || 
                   completionData[`${key}_washing`] || 
                   completionData[`${key}_disinfection`];
          });

          if (!hasZoneData) return null;

          return (
            <div key={zoneIdx} style={{ marginBottom: '30px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#166534' }}>
                {zone.name}
              </h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #1a5d33', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1a5d33', color: 'white' }}>
                      <th style={{ padding: '8px', border: '1px solid white', textAlign: 'left' }}>Зона/Повърхност</th>
                      <th style={{ padding: '8px', border: '1px solid white', textAlign: 'center' }}>Почистване</th>
                      <th style={{ padding: '8px', border: '1px solid white', textAlign: 'center' }}>Измиване</th>
                      <th style={{ padding: '8px', border: '1px solid white', textAlign: 'center' }}>Дезинфекция</th>
                      <th style={{ padding: '8px', border: '1px solid white', textAlign: 'left' }}>Изпълнител</th>
                    </tr>
                  </thead>
                  <tbody>
                    {zone.areas?.map((area, areaIdx) => {
                      const key = `${zone.id}_${area.name}`;
                      const cleaning = completionData[`${key}_cleaning`];
                      const washing = completionData[`${key}_washing`];
                      const disinfection = completionData[`${key}_disinfection`];
                      const executor = completionData[`${key}_executor`];

                      if (!cleaning && !washing && !disinfection) return null;

                      return (
                        <tr key={areaIdx} style={{ backgroundColor: areaIdx % 2 === 0 ? 'white' : '#f9fafb' }}>
                          <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>{area.name}</td>
                          <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                            {cleaning ? '✅' : '⬜'}
                          </td>
                          <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                            {washing ? '✅' : '⬜'}
                          </td>
                          <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                            {disinfection ? '✅' : '⬜'}
                          </td>
                          <td style={{ padding: '8px', border: '1px solid #e5e7eb' }}>
                            {executor || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ============================================
  // 👔 CLOTHING AND HYGIENE CONTROL
  // ============================================
  const renderClothingHygieneControl = () => {
    // Check if this is clothing/hygiene control data
    if (!data.rows || !data.header) return null;
    
    const rows = data.rows || [];
    const header = data.header || {};
    const filledRows = rows.filter(r => r.name || r.position);
    
    if (filledRows.length === 0) return null;

    return (
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#1a5d33', fontWeight: '700' }}>
          👔 Контрол на работното облекло и хигиена на персонала
        </h3>
        
        {/* Header Info */}
        <div style={{ 
          marginBottom: '20px', 
          padding: '20px', 
          backgroundColor: '#f0fdf4',
          borderRadius: '12px',
          border: '2px solid #86efac',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ fontSize: '15px', fontWeight: '600' }}>
            📅 Дата: {header.date ? new Date(header.date).toLocaleDateString('bg-BG') : 'Неизвестна'}
          </div>
          {header.manager && (
            <div style={{ fontSize: '15px', fontWeight: '600' }}>
              👤 Мениджър: {header.manager}
            </div>
          )}
        </div>
        
        {/* Stats */}
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: '#eff6ff',
          borderRadius: '12px',
          border: '2px solid #93c5fd',
          fontSize: '15px',
          fontWeight: '700',
          color: '#1e40af'
        }}>
          📊 Общо проверени служители: {filledRows.length}
        </div>
        
        {/* Employees */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filledRows.map((row, idx) => {
            const hasIssues = 
              row.wounds !== 'none' || 
              row.jewelry !== 'none' || 
              row.work_clothing !== 'clean' || 
              row.personal_hygiene !== 'good' ||
              row.health_status !== 'good';
            
            return (
              <div key={row.id || idx} style={{
                padding: '25px',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '3px solid ' + (hasIssues ? '#f59e0b' : '#059669'),
                transition: 'all 0.3s'
              }}>
                {/* Employee Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '20px',
                  paddingBottom: '20px',
                  borderBottom: '3px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <span style={{ 
                      fontSize: '24px', 
                      fontWeight: '800',
                      color: '#1a5d33',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <span style={{
                        backgroundColor: '#1a5d33',
                        color: 'white',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px'
                      }}>
                        {row.number}
                      </span>
                      {row.name}
                    </span>
                    {row.position && (
                      <span style={{
                        padding: '8px 16px',
                        backgroundColor: '#e0e7ff',
                        color: '#3730a3',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: '700',
                        border: '2px solid #a5b4fc'
                      }}>
                        {row.position}
                      </span>
                    )}
                  </div>
                  {row.checked_by && (
                    <span style={{ 
                      fontSize: '15px', 
                      color: '#6b7280', 
                      fontWeight: '600',
                      backgroundColor: '#f3f4f6',
                      padding: '8px 16px',
                      borderRadius: '8px'
                    }}>
                      ✓ Проверил: {row.checked_by}
                    </span>
                  )}
                </div>
                
                {/* Status Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '15px',
                  marginBottom: row.corrective_actions ? '20px' : '0'
                }}>
                  {/* Work Clothing */}
                  <div style={{
                    padding: '20px',
                    backgroundColor: row.work_clothing === 'clean' ? '#d1fae5' : '#fee2e2',
                    borderRadius: '12px',
                    border: `3px solid ${row.work_clothing === 'clean' ? '#059669' : '#dc2626'}`,
                    transition: 'transform 0.2s',
                    cursor: 'default'
                  }}>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#6b7280', 
                      marginBottom: '8px', 
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      👔 Работно облекло
                    </div>
                    <div style={{ 
                      fontWeight: '800',
                      fontSize: '20px',
                      color: row.work_clothing === 'clean' ? '#065f46' : '#991b1b'
                    }}>
                      {row.work_clothing === 'clean' ? '✅ Чисто' : 
                       row.work_clothing === 'dirty' ? '❌ Мръсно' : 
                       row.work_clothing || '-'}
                    </div>
                  </div>
                  
                  {/* Personal Hygiene */}
                  <div style={{
                    padding: '20px',
                    backgroundColor: row.personal_hygiene === 'good' ? '#d1fae5' : '#fee2e2',
                    borderRadius: '12px',
                    border: `3px solid ${row.personal_hygiene === 'good' ? '#059669' : '#dc2626'}`,
                    transition: 'transform 0.2s',
                    cursor: 'default'
                  }}>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#6b7280', 
                      marginBottom: '8px', 
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      🧼 Лична хигиена
                    </div>
                    <div style={{ 
                      fontWeight: '800',
                      fontSize: '20px',
                      color: row.personal_hygiene === 'good' ? '#065f46' : '#991b1b'
                    }}>
                      {row.personal_hygiene === 'good' ? '✅ Добра' : 
                       row.personal_hygiene === 'poor' ? '❌ Лоша' : 
                       row.personal_hygiene || '-'}
                    </div>
                  </div>
                  
                  {/* Health Status */}
                  <div style={{
                    padding: '20px',
                    backgroundColor: row.health_status === 'good' ? '#d1fae5' : '#fee2e2',
                    borderRadius: '12px',
                    border: `3px solid ${row.health_status === 'good' ? '#059669' : '#dc2626'}`,
                    transition: 'transform 0.2s',
                    cursor: 'default'
                  }}>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#6b7280', 
                      marginBottom: '8px', 
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      🏥 Здравословно състояние
                    </div>
                    <div style={{ 
                      fontWeight: '800',
                      fontSize: '20px',
                      color: row.health_status === 'good' ? '#065f46' : '#991b1b'
                    }}>
                      {row.health_status === 'good' ? '✅ Добро' : 
                       row.health_status === 'sick' ? '❌ Болен' : 
                       row.health_status || '-'}
                    </div>
                  </div>
                  
                  {/* Wounds */}
                  <div style={{
                    padding: '20px',
                    backgroundColor: row.wounds === 'none' ? '#d1fae5' : '#fee2e2',
                    borderRadius: '12px',
                    border: `3px solid ${row.wounds === 'none' ? '#059669' : '#dc2626'}`,
                    transition: 'transform 0.2s',
                    cursor: 'default'
                  }}>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#6b7280', 
                      marginBottom: '8px', 
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      🩹 Рани/Порязвания
                    </div>
                    <div style={{ 
                      fontWeight: '800',
                      fontSize: '20px',
                      color: row.wounds === 'none' ? '#065f46' : '#991b1b'
                    }}>
                      {row.wounds === 'none' ? '✅ Няма' : 
                       row.wounds === 'minor' ? '⚠️ Леки' : 
                       row.wounds === 'major' ? '❌ Сериозни' : 
                       row.wounds || '-'}
                    </div>
                  </div>
                  
                  {/* Jewelry */}
                  <div style={{
                    padding: '20px',
                    backgroundColor: row.jewelry === 'none' ? '#d1fae5' : '#fee2e2',
                    borderRadius: '12px',
                    border: `3px solid ${row.jewelry === 'none' ? '#059669' : '#dc2626'}`,
                    transition: 'transform 0.2s',
                    cursor: 'default'
                  }}>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#6b7280', 
                      marginBottom: '8px', 
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      💍 Бижута
                    </div>
                    <div style={{ 
                      fontWeight: '800',
                      fontSize: '20px',
                      color: row.jewelry === 'none' ? '#065f46' : '#991b1b'
                    }}>
                      {row.jewelry === 'none' ? '✅ Няма' : 
                       row.jewelry === 'present' ? '❌ Има' : 
                       row.jewelry || '-'}
                    </div>
                  </div>
                </div>
                
                {/* Corrective Actions */}
                {row.corrective_actions && (
                  <div style={{
                    marginTop: '20px',
                    padding: '20px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '12px',
                    border: '3px solid #fbbf24'
                  }}>
                    <strong style={{ 
                      fontSize: '16px', 
                      color: '#92400e', 
                      display: 'block', 
                      marginBottom: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      📝 Коригиращи действия:
                    </strong>
                    <div style={{ 
                      fontSize: '15px', 
                      color: '#78350f', 
                      lineHeight: '1.8',
                      fontWeight: '500'
                    }}>
                      {row.corrective_actions}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    );
  };

  // ============================================
  // 🗄️ REFRIGERATOR STORAGE CONTROL
  // ============================================
  const renderRefrigeratorStorageControl = () => {
    if (!data.dateBlocks || data.dateBlocks.length === 0) return null;

    const dateBlocks = data.dateBlocks;
    const customRefrigerators = data.customRefrigerators || [];

    const filledBlocks = dateBlocks.filter(block => 
      block.date || Object.keys(block.readings || {}).length > 0
    );

    if (filledBlocks.length === 0) return null;

    // Default refrigerators
    const defaultRefrigerators = [
      { id: '1', name: '№ 1', temp: '0-4°C', description: 'Дюнер 1' },
      { id: '2', name: '№ 2', temp: '0-4°C', description: 'зеленчуци, сосове, месни продукти' },
      { id: '3', name: '№ 3', temp: '2-6°C', description: 'безалкохолни напитки, айран' },
      { id: '4', name: '№ 4', temp: '≤ -18°C', description: 'месни продукти' },
      { id: '5', name: '№ 5', temp: '0-4°C', description: 'месни, млечни, зеленчуци, тесто' },
      { id: '6', name: '№ 6', temp: '0-4°C', description: 'месни, млечни, зеленчуци, тесто' },
      { id: '7', name: '№ 7', temp: '≤ -18°C', description: 'месни продукти' },
      { id: '8', name: '№ 8', temp: '≤ -18°C', description: 'месни продукти, зеленчуци, тесто' }
    ];

    const allRefrigerators = [...defaultRefrigerators, ...customRefrigerators];
    const timeSlots = ['8h', '14h', '20h'];

    return (
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#1a5d33' }}>
          🗄️ Контрол на хладилно съхранение
        </h3>
        
        {filledBlocks.map((block, blockIdx) => (
          <div key={blockIdx} style={{ marginBottom: '30px' }}>
            {block.date && (
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#166534' }}>
                📅 {new Date(block.date).toLocaleDateString('bg-BG')}
              </h4>
            )}
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #1a5d33', fontSize: '10px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1a5d33', color: 'white' }}>
                    <th style={{ padding: '8px', border: '1px solid white', textAlign: 'left', minWidth: '120px' }}>Хладилник</th>
                    <th style={{ padding: '8px', border: '1px solid white', textAlign: 'left', minWidth: '150px' }}>Описание</th>
                    <th style={{ padding: '8px', border: '1px solid white', textAlign: 'center', minWidth: '80px' }}>Целева t°</th>
                    {timeSlots.map((slot, slotIdx) => (
                      <th key={slotIdx} style={{ padding: '8px', border: '1px solid white', textAlign: 'center', minWidth: '60px' }}>
                        {slot.replace('h', ':00')}
                      </th>
                    ))}
                    <th style={{ padding: '8px', border: '1px solid white', textAlign: 'left', minWidth: '100px' }}>Проверил</th>
                  </tr>
                </thead>
                <tbody>
                  {allRefrigerators.map((ref, refIdx) => {
                    // Check if this refrigerator has any data
                    const hasRefData = timeSlots.some(slot => 
                      block.readings?.[`ref_${ref.id}_${slot}`]
                    );

                    if (!hasRefData && !block.readings?.[`inspector_ref_${ref.id}`]) return null;

                    return (
                      <tr key={refIdx} style={{ backgroundColor: refIdx % 2 === 0 ? 'white' : '#f9fafb' }}>
                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', fontWeight: 'bold' }}>
                          {ref.name}
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', fontSize: '9px' }}>
                          {ref.description}
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center', fontSize: '9px' }}>
                          {ref.temp}
                        </td>
                        {timeSlots.map((slot, slotIdx) => {
                          const temp = block.readings?.[`ref_${ref.id}_${slot}`];
                          return (
                            <td key={slotIdx} style={{ 
                              padding: '8px', 
                              border: '1px solid #e5e7eb', 
                              textAlign: 'center',
                              fontWeight: temp ? 'bold' : 'normal'
                            }}>
                              {temp || '-'}
                            </td>
                          );
                        })}
                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', fontSize: '9px' }}>
                          {block.readings?.[`inspector_ref_${ref.id}`] || block.readings?.['inspector_name'] || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ============================================
  // 📋 GENERIC CHECKLIST (fallback)
  // ============================================
  const renderGenericChecklist = () => {
    // This handles any other checklist format
    if (!data.items || data.items.length === 0) return null;

    const filledItems = data.items.filter(item => 
      item.description || item.completed || item.notes
    );

    if (filledItems.length === 0) return null;

    return (
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#1a5d33' }}>
          📋 Чек лист
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #1a5d33', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#1a5d33', color: 'white' }}>
                <th style={{ padding: '12px', border: '1px solid white', textAlign: 'center' }}>№</th>
                <th style={{ padding: '12px', border: '1px solid white', textAlign: 'left' }}>Описание</th>
                <th style={{ padding: '12px', border: '1px solid white', textAlign: 'center' }}>Статус</th>
                <th style={{ padding: '12px', border: '1px solid white', textAlign: 'left' }}>Бележки</th>
              </tr>
            </thead>
            <tbody>
              {filledItems.map((item, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{item.description || '-'}</td>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    {item.completed ? '✅' : '⬜'}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>{item.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '30px',
          marginBottom: '30px'
        }}>
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

          <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#1a5d33' }}>
            {submission.checklist_templates?.name || 'Детайли за попълнен чек лист'}
          </h1>
          
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '14px', color: '#6b7280' }}>
            <div>
              <strong>Дата на попълване:</strong>{' '}
              {new Date(submission.submission_date).toLocaleDateString('bg-BG')}
            </div>
            <div>
              <strong>Час:</strong>{' '}
              {new Date(submission.submitted_at).toLocaleTimeString('bg-BG', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            {submission.profiles?.full_name && (
              <div>
                <strong>Попълнен от:</strong> {submission.profiles.full_name}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          padding: '30px'
        }}>
          
          {/* Try to render each type of content */}
          {renderPizzaTable()}
          {renderChickenProduction()}
          {renderDonerProduction()}
          {renderMeatballProduction()}
          {renderOilChangeRecords()}
          {renderRefrigeratorTemperature()}
          {renderRefrigeratorStorageControl()}
          {renderHygieneCard()}
          {renderClothingHygieneControl()}
          {renderPortionAndDefect()}
          {renderGenericChecklist()}

          {/* If nothing rendered, show empty state */}
          {!data.temperatures && 
           !data.productions && 
           !data.records && 
           !data.rows && 
           !data.dateBlocks &&
           !data.zones &&
           !data.completionData &&
           !data.items &&
           !data.summary && (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              color: '#6b7280',
              backgroundColor: '#f9fafb',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📋</div>
              <p style={{ fontSize: '16px', margin: 0 }}>
                Няма налични данни за показване
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImprovedSubmissionDetail;