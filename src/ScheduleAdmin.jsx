// src/ScheduleAdmin.jsx
import React, { useState } from 'react';
import ScheduleDateView from './ScheduleDateView';
import CompanyHolidays from './CompanyHolidays';

function ScheduleGanttView() {
  return (
    <div>
      <h3>Schedule Gantt View</h3>
      <p>Display schedule data as a Gantt chart here (to be built).</p>
    </div>
  );
}

function ScheduleAdmin() {
  const [activeTab, setActiveTab] = useState('dateView');

  const tabs = [
    { key: 'dateView', label: 'Schedule Date View' },
    { key: 'ganttView', label: 'Schedule Gantt View' },
    { key: 'holidays', label: 'Company Holidays' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dateView':
        return <ScheduleDateView />;
      case 'ganttView':
        return <ScheduleGanttView />;
      case 'holidays':
        return <CompanyHolidays />;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div
        style={{
          paddingBottom: '1rem',
          borderBottom: '1px solid #ddd',
          marginBottom: '1rem',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.75rem 1rem',
              minHeight: '48px',
              border: 'none',
              background: activeTab === tab.key ? '#d3d3d3' : 'transparent',
              cursor: 'pointer',
              marginRight: '0.5rem',
              fontWeight: activeTab === tab.key ? 'bold' : 'normal',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{renderContent()}</div>
    </div>
  );
}

export default ScheduleAdmin;
