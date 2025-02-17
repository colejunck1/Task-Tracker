// src/Dashboard.jsx
import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import UploadBoatOrders from './UploadBoatOrders';
import BoatOrders from './BoatOrders';
import AllOptions from './AllOptions';
import BoatOrderHeaders from './BoatOrderHeaders';
import DoNotShowOptions from './DoNotShowOptions';
import TaskData from './TaskData'; // Admin Task Data
import Stations from './Stations'; // Admin Stations sub-tab
import Tasks from './Tasks'; // Main Tasks tab for employees

function Dashboard() {
  const [activeMainTab, setActiveMainTab] = useState('dashboard');
  const [activeAdminSubTab, setActiveAdminSubTab] = useState('taskData');

  const mainTabs = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'boatOrders', label: 'Boat Orders' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'admin', label: 'Admin' },
  ];

  const adminSubTabs = [
    { key: 'taskData', label: 'Task Data' },
    { key: 'adminSchedule', label: 'Schedule' },
    { key: 'scheduleGroups', label: 'Schedule Groups' },
    { key: 'options', label: 'Options' },
    { key: 'employees', label: 'Employees' },
    { key: 'stations', label: 'Stations' },
    { key: 'uploadBoatOrders', label: 'Upload Boat Orders' },
    { key: 'allOptions', label: 'All Options' },
    { key: 'boatOrderHeaders', label: 'Boat Order Headers' },
    { key: 'doNotShow', label: 'Do Not Show' }
  ];

  const renderContent = () => {
    if (activeMainTab === 'admin') {
      if (activeAdminSubTab === 'taskData') {
        return <TaskData />;
      }
      if (activeAdminSubTab === 'stations') {
        return <Stations />;
      }
      if (activeAdminSubTab === 'uploadBoatOrders') {
        return <UploadBoatOrders />;
      }
      if (activeAdminSubTab === 'allOptions') {
        return <AllOptions />;
      }
      if (activeAdminSubTab === 'boatOrderHeaders') {
        return <BoatOrderHeaders />;
      }
      if (activeAdminSubTab === 'doNotShow') {
        return <DoNotShowOptions />;
      }
      const adminTab = adminSubTabs.find((tab) => tab.key === activeAdminSubTab);
      return (
        <div>
          <h2>{adminTab ? adminTab.label : 'Admin'}</h2>
          <p>Content for {adminTab ? adminTab.label : 'Admin'} page (to be built).</p>
        </div>
      );
    } else if (activeMainTab === 'boatOrders') {
      return <BoatOrders />;
    } else if (activeMainTab === 'tasks') {
      return <Tasks />;
    } else {
      const currentTab = mainTabs.find((tab) => tab.key === activeMainTab);
      return (
        <div>
          <h2>{currentTab ? currentTab.label : ''}</h2>
          <p>Content for {currentTab ? currentTab.label : ''} page (to be built).</p>
        </div>
      );
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-title">Task Tracker Dashboard</div>
        <div className="header-actions">
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      </header>
      <div className="dashboard-container">
        <aside className="dashboard-sidebar">
          <nav>
            <ul>
              {mainTabs.map((tab) => (
                <li
                  key={tab.key}
                  className={activeMainTab === tab.key ? 'active' : ''}
                  onClick={() => {
                    setActiveMainTab(tab.key);
                    if (tab.key === 'admin') {
                      setActiveAdminSubTab('taskData');
                    }
                  }}
                >
                  {tab.label}
                </li>
              ))}
            </ul>
            {activeMainTab === 'admin' && (
              <ul className="admin-submenu">
                {adminSubTabs.map((sub) => (
                  <li
                    key={sub.key}
                    className={activeAdminSubTab === sub.key ? 'active' : ''}
                    onClick={() => setActiveAdminSubTab(sub.key)}
                  >
                    {sub.label}
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </aside>
        <main className="dashboard-content">{renderContent()}</main>
      </div>
    </div>
  );
}

export default Dashboard;
