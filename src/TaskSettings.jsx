// src/TaskSettings.jsx
import React, { useState } from 'react';
import TaskData from './TaskData';
import Stations from './Stations';
import ScheduleGroups from './ScheduleGroups'; // Import the actual ScheduleGroups component

function TaskSettings() {
  const [activeTab, setActiveTab] = useState('taskData');

  const tabs = [
    { key: 'taskData', label: 'Task Data' },
    { key: 'stations', label: 'Stations' },
    { key: 'scheduleGroups', label: 'Schedule Groups' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'taskData':
        return <TaskData />;
      case 'stations':
        return <Stations />;
      case 'scheduleGroups':
        return <ScheduleGroups />;
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
          marginBottom: '1rem'
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
              fontWeight: activeTab === tab.key ? 'bold' : 'normal'
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

export default TaskSettings;
