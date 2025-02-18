// src/UsersEmployees.jsx
import React, { useState } from 'react';

function UsersEmployees() {
  const [activeTab, setActiveTab] = useState('employees');

  // Reorder tabs: Employees, Departments, User Accounts, Roles & Permissions
  const tabs = [
    { key: 'employees', label: 'Employees' },
    { key: 'departments', label: 'Departments' },
    { key: 'userAccounts', label: 'User Accounts' },
    { key: 'rolesPermissions', label: 'Roles & Permissions' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'employees':
        return (
          <div>
            <h3>Employees</h3>
            <p>Manage employee details here (to be built).</p>
          </div>
        );
      case 'departments':
        return (
          <div>
            <h3>Departments</h3>
            <p>Manage departments here (to be built).</p>
          </div>
        );
      case 'userAccounts':
        return (
          <div>
            <h3>User Accounts</h3>
            <p>Manage user account details here (to be built).</p>
          </div>
        );
      case 'rolesPermissions':
        return (
          <div>
            <h3>Roles &amp; Permissions</h3>
            <p>Manage roles and permissions here (to be built).</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      {/* Removed the page title */}
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

export default UsersEmployees;
