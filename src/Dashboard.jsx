// src/Dashboard.jsx
import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import UploadBoatOrders from './UploadBoatOrders';
import BoatOrders from './BoatOrders';
import AllOptions from './AllOptions';
import BoatOrderHeaders from './BoatOrderHeaders';
import TaskData from './TaskData'; // (Deprecated - now under Task Settings)
import Stations from './Stations';   // (Deprecated - now under Task Settings)
import Tasks from './Tasks';         // Main Tasks tab for employees
import UsersEmployees from './UsersEmployees'; // Users & Employees component
import BoatOrderSettings from './BoatOrderSettings'; // Boat Order Settings component
import TaskSettings from './TaskSettings';         // New Task Settings component
import ScheduleAdmin from './ScheduleAdmin';         // New Schedule Admin component

// Import icons from react-bootstrap-icons
import { 
  BsSpeedometer, 
  BsCardList, 
  BsListCheck, 
  BsCalendar3, 
  BsExclamationTriangle, 
  BsDatabaseLock,
  BsTools,
  BsCalendarCheck,
  BsPeopleFill,
  BsFileEarmarkSpreadsheet,
  BsListUl
} from 'react-icons/bs';
// Import toggle arrows from react-icons/fi (Feather icons)
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function Dashboard() {
  const [activeMainTab, setActiveMainTab] = useState('dashboard');
  const [activeAdminSubTab, setActiveAdminSubTab] = useState('taskSettings');

  // Sidebar state
  const [sidebarMinimized, setSidebarMinimized] = useState(true);
  const [keepSidebarOpen, setKeepSidebarOpen] = useState(false);
  const [tempExpanded, setTempExpanded] = useState(false);

  // Main tabs with icons (using react-bootstrap-icons)
  const mainTabs = [
    { key: 'dashboard', label: 'Dashboard', icon: <BsSpeedometer size={20} /> },
    { key: 'boatOrders', label: 'Boat Orders', icon: <BsCardList size={20} /> },
    { key: 'tasks', label: 'Tasks', icon: <BsListCheck size={20} /> },
    { key: 'schedule', label: 'Schedule', icon: <BsCalendar3 size={20} /> },
    { key: 'purchaseRequests', label: 'Purchase Requests', icon: <BsCardList size={20} /> },
    { key: 'concerns', label: 'Concerns', icon: <BsExclamationTriangle size={20} /> },
    { key: 'admin', label: 'Admin', icon: <BsDatabaseLock size={20} /> },
  ];

  // Admin sub-tabs with icons
  const adminSubTabs = [
    { key: 'taskSettings', label: 'Task Settings', icon: <BsTools size={18} /> },
    { key: 'scheduleAdmin', label: 'Schedule Admin', icon: <BsCalendarCheck size={18} /> },
    { key: 'employees', label: 'Users & Employees', icon: <BsPeopleFill size={18} /> },
    { key: 'boatOrderSettings', label: 'Boat Order Settings', icon: <BsFileEarmarkSpreadsheet size={18} /> },
    { key: 'allOptions', label: 'All Options', icon: <BsListUl size={18} /> },
  ];

  const renderContent = () => {
    if (activeMainTab === 'admin') {
      if (activeAdminSubTab === 'taskSettings') return <TaskSettings />;
      if (activeAdminSubTab === 'scheduleAdmin') return <ScheduleAdmin />;
      if (activeAdminSubTab === 'employees') return <UsersEmployees />;
      if (activeAdminSubTab === 'boatOrderSettings') return <BoatOrderSettings />;
      if (activeAdminSubTab === 'allOptions') return <AllOptions />;
      const adminTab = adminSubTabs.find(tab => tab.key === activeAdminSubTab);
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
    } else if (activeMainTab === 'purchaseRequests') {
      return (
        <div>
          <h2>Purchase Requests</h2>
          <p>Content for Purchase Requests page (to be built).</p>
        </div>
      );
    } else if (activeMainTab === 'concerns') {
      return (
        <div>
          <h2>Concerns</h2>
          <p>Content for Concerns page (to be built).</p>
        </div>
      );
    } else {
      const currentTab = mainTabs.find(tab => tab.key === activeMainTab);
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

  // Sidebar dimensions
  const expandedWidth = 200;
  const minimizedWidth = 60;

  // Fixed sidebar height below header
  const sidebarBaseStyle = {
    height: 'calc(100vh - 70px)',
    backgroundColor: '#fff',
    borderRight: '1px solid #ddd',
    transition: 'width 0.1s ease-out',
    overflow: 'hidden',
    position: 'relative',
  };

  // Compute sidebar width
  const computedWidth = keepSidebarOpen ? expandedWidth : (tempExpanded ? expandedWidth : minimizedWidth);
  const sidebarStyle = { ...sidebarBaseStyle, width: computedWidth };

  // List item styles (default dark grey text, active/hover blue)
  const listItemStyle = {
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    color: '#555',
    transition: 'color 0.1s ease-out, background-color 0.1s ease-out',
  };

  const activeItemStyle = {
    backgroundColor: '#f0f0f0',
    color: '#66b0ff',
  };

  const hoverItemStyle = {
    color: '#66b0ff',
  };

  // Toggle button fixed on the right edge of the sidebar container.
  const toggleButtonStyle = {
    position: 'absolute',
    top: '10px',
    right: '0px',
    cursor: 'pointer',
    zIndex: 20,
    backgroundColor: '#fff',
    borderLeft: '1px solid #ddd',
    padding: '0.2rem',
  };

  // Helper to determine if tab text should be shown
  const shouldShowText = computedWidth > minimizedWidth;

  return (
    <div className="dashboard">
      <header
        className="dashboard-header"
        style={{
          backgroundColor: '#007bff',
          padding: '1rem',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Replace header title with logo */}
        <img src="/src/AnchorPointFullLogo.png" alt="AnchorPoint Logo" style={{ height: '40px' }} />
        <div className="header-actions">
          <button onClick={handleSignOut} style={{ padding: '0.5rem 1rem' }}>
            Sign Out
          </button>
        </div>
      </header>
      <div className="dashboard-container" style={{ display: 'flex', paddingTop: '70px' }}>
        <aside
          className="dashboard-sidebar"
          style={sidebarStyle}
          onMouseEnter={() => { if (!keepSidebarOpen) setTempExpanded(true); }}
          onMouseLeave={() => { if (!keepSidebarOpen) setTempExpanded(false); }}
        >
          {/* Toggle Button always visible on right edge */}
          <div style={toggleButtonStyle} onClick={() => setKeepSidebarOpen(!keepSidebarOpen)}>
            {keepSidebarOpen ? <FiChevronRight color="#007bff" size={20} /> : <FiChevronLeft color="#007bff" size={20} />}
          </div>
          <nav style={{ marginTop: '2.5rem' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {mainTabs.map((tab) => (
                <li
                  key={tab.key}
                  style={{
                    ...listItemStyle,
                    ...(activeMainTab === tab.key ? activeItemStyle : {}),
                  }}
                  onClick={() => {
                    setActiveMainTab(tab.key);
                    if (tab.key === 'admin') setActiveAdminSubTab('taskSettings');
                  }}
                  onMouseOver={(e) => {
                    if (activeMainTab !== tab.key) {
                      e.currentTarget.style.color = hoverItemStyle.color;
                    }
                  }}
                  onMouseOut={(e) => {
                    if (activeMainTab !== tab.key) {
                      e.currentTarget.style.color = '#555';
                    }
                  }}
                >
                  <span style={{ marginRight: shouldShowText ? '0.5rem' : 0, display: 'flex', alignItems: 'center' }}>
                    {React.cloneElement(tab.icon, { color: activeMainTab === tab.key ? '#66b0ff' : '#888' })}
                  </span>
                  {shouldShowText && <span>{tab.label}</span>}
                </li>
              ))}
            </ul>
            {activeMainTab === 'admin' && (
              <ul style={{ listStyle: 'none', paddingLeft: shouldShowText ? '1rem' : 0, margin: 0 }}>
                {adminSubTabs.map((sub) => (
                  <li
                    key={sub.key}
                    style={{
                      ...listItemStyle,
                      ...(activeAdminSubTab === sub.key ? activeItemStyle : {}),
                    }}
                    onClick={() => setActiveAdminSubTab(sub.key)}
                    onMouseOver={(e) => {
                      if (activeAdminSubTab !== sub.key) {
                        e.currentTarget.style.color = hoverItemStyle.color;
                      }
                    }}
                    onMouseOut={(e) => {
                      if (activeAdminSubTab !== sub.key) {
                        e.currentTarget.style.color = '#555';
                      }
                    }}
                  >
                    <span style={{ marginRight: shouldShowText ? '0.5rem' : 0, display: 'flex', alignItems: 'center' }}>
                      {React.cloneElement(sub.icon, { color: activeAdminSubTab === sub.key ? '#66b0ff' : '#888' })}
                    </span>
                    {shouldShowText && <span>{sub.label}</span>}
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </aside>
        <main className="dashboard-content" style={{ flex: 1, padding: '1rem', backgroundColor: '#fafafa' }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
