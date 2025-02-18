// src/BoatOrderSettings.jsx
import React, { useState } from 'react';
import UploadBoatOrders from './UploadBoatOrders';
import BoatOrderHeaders from './BoatOrderHeaders';
import DoNotShowOptions from './DoNotShowOptions';

function BoatOrderSettings() {
  const [activeTab, setActiveTab] = useState('uploadBoatOrders');

  const tabs = [
    { key: 'uploadBoatOrders', label: 'Upload Boat Orders' },
    { key: 'boatOrderHeaders', label: 'Boat Order Headers' },
    { key: 'doNotShow', label: 'Do Not Show' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'uploadBoatOrders':
        return <UploadBoatOrders />;
      case 'boatOrderHeaders':
        return <BoatOrderHeaders />;
      case 'doNotShow':
        return <DoNotShowOptions />;
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

export default BoatOrderSettings;
