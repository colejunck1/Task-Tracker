// src/Dashboard.jsx
import React, { useState, useRef, useEffect } from 'react';
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

// Import icons from react-icons/bs and react-icons/fi
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
import { FiChevronLeft, FiChevronRight, FiBell } from 'react-icons/fi';

function Dashboard() {
  // Sidebar dimensions and header height
  const expandedWidth = 200;
  const minimizedWidth = 60;
  const headerHeight = 47;

  // Sidebar state
  const [keepSidebarOpen, setKeepSidebarOpen] = useState(false);
  const [tempExpanded, setTempExpanded] = useState(false);
  const computedSidebarWidth = keepSidebarOpen || tempExpanded ? expandedWidth : minimizedWidth;

  // Active tab state
  const [activeMainTab, setActiveMainTab] = useState('dashboard');
  const [activeAdminSubTab, setActiveAdminSubTab] = useState('taskSettings');

  // Profile dropdown state and ref
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  // Dummy current user data (replace with actual user info)
  const currentUser = {
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
  };

  const getInitials = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  };

  const profileName =
    currentUser.firstName && currentUser.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : currentUser.username;
  const profileInitials = getInitials(currentUser);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Define main tabs with icons
  const mainTabs = [
    { key: 'dashboard', label: 'Dashboard', icon: <BsSpeedometer size={20} /> },
    { key: 'boatOrders', label: 'Boat Orders', icon: <BsCardList size={20} /> },
    { key: 'tasks', label: 'Tasks', icon: <BsListCheck size={20} /> },
    { key: 'schedule', label: 'Schedule', icon: <BsCalendar3 size={20} /> },
    { key: 'purchaseRequests', label: 'Purchase Requests', icon: <BsCardList size={20} /> },
    { key: 'concerns', label: 'Concerns', icon: <BsExclamationTriangle size={20} /> },
    { key: 'admin', label: 'Admin', icon: <BsDatabaseLock size={20} /> },
  ];

  // Define admin sub-tabs with icons
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

  // Styles
  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: computedSidebarWidth,
    height: '100vh',
    backgroundColor: '#fff',
    borderRight: '1px solid #ddd',
    transition: 'width 0.1s ease-out',
    overflow: 'hidden',
    zIndex: 300,
  };

  const headerStyle = {
    position: 'fixed',
    top: 0,
    left: computedSidebarWidth,
    right: 0,
    height: `${headerHeight}px`,
    backgroundColor: '#007bff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.2rem 1rem',
    zIndex: 200,
    transition: 'left 0.1s ease-out',
  };

  const mainStyle = {
    marginTop: `${headerHeight}px`,
    marginLeft: computedSidebarWidth,
    padding: '1rem',
    backgroundColor: '#fafafa',
    transition: 'margin-left 0.1s ease-out',
    overflowX: 'hidden',
    width: `calc(100vw - ${computedSidebarWidth}px)`,
  };

  const listItemStyle = {
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    color: '#555',
    transition: 'color 0.1s, background-color 0.1s',
  };

  const activeItemStyle = {
    backgroundColor: '#f0f0f0',
    color: '#66b0ff',
  };

  const hoverItemStyle = {
    color: '#66b0ff',
  };

  const sidebarHeaderStyle = {
    padding: '0.5rem',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const logoSrc = computedSidebarWidth === expandedWidth ? '/AnchorPointFullLogo.svg' : '/AnchorPointIconLogo.svg';
  const logoStyle = {
    height: '30px',
    transition: 'height 0.1s ease-out',
  };

  const toggleButtonStyle = {
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    marginRight: '1rem',
  };

  const toggleButtonIcon = keepSidebarOpen ? <FiChevronLeft color="#fff" size={18} /> : <FiChevronRight color="#fff" size={18} />;

  const shouldShowText = computedSidebarWidth > minimizedWidth;

  const renderNavItems = (tabs) =>
    tabs.map((tab) => (
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
          if (activeMainTab !== tab.key) e.currentTarget.style.color = hoverItemStyle.color;
        }}
        onMouseOut={(e) => {
          if (activeMainTab !== tab.key) e.currentTarget.style.color = '#555';
        }}
      >
        <span style={{ marginRight: shouldShowText ? '0.5rem' : 0, display: 'flex', alignItems: 'center' }}>
          {React.cloneElement(tab.icon, { color: activeMainTab === tab.key ? '#66b0ff' : '#888' })}
        </span>
        {shouldShowText && <span>{tab.label}</span>}
      </li>
    ));

  const renderAdminNavItems = (tabs) =>
    tabs.map((sub) => (
      <li
        key={sub.key}
        style={{
          ...listItemStyle,
          ...(activeAdminSubTab === sub.key ? activeItemStyle : {}),
        }}
        onClick={() => setActiveAdminSubTab(sub.key)}
        onMouseOver={(e) => {
          if (activeAdminSubTab !== sub.key) e.currentTarget.style.color = hoverItemStyle.color;
        }}
        onMouseOut={(e) => {
          if (activeAdminSubTab !== sub.key) e.currentTarget.style.color = '#555';
        }}
      >
        <span style={{ marginRight: shouldShowText ? '0.5rem' : 0, display: 'flex', alignItems: 'center' }}>
          {React.cloneElement(sub.icon, { color: activeAdminSubTab === sub.key ? '#66b0ff' : '#888' })}
        </span>
        {shouldShowText && <span>{sub.label}</span>}
      </li>
    ));

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar" style={sidebarStyle}
        onMouseEnter={() => { if (!keepSidebarOpen) setTempExpanded(true); }}
        onMouseLeave={() => { if (!keepSidebarOpen) setTempExpanded(false); }}
      >
        <div style={sidebarHeaderStyle}>
          <img src={logoSrc} alt="Logo" style={logoStyle} />
        </div>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {renderNavItems(mainTabs)}
          </ul>
          {activeMainTab === 'admin' && (
            <ul style={{ listStyle: 'none', paddingLeft: shouldShowText ? '1rem' : 0, margin: 0 }}>
              {renderAdminNavItems(adminSubTabs)}
            </ul>
          )}
        </nav>
      </aside>
      <header className="dashboard-header" style={headerStyle}>
        <button style={toggleButtonStyle} onClick={() => setKeepSidebarOpen(!keepSidebarOpen)}>
          {toggleButtonIcon}
        </button>
      </header>
      {/* Fixed profile container in top-right with extra padding */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '2rem',
        zIndex: 400,
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }} ref={profileRef}>
        <FiBell color="#fff" size={20} style={{ cursor: 'pointer' }} />
        <div style={{ cursor: 'pointer' }} onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: '#66b0ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '0.9rem'
            }}>
              {profileInitials}
            </div>
            <span style={{ color: '#fff' }}>{profileName}</span>
          </div>
          {profileDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '40px',
              left: 0,
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
              minWidth: '150px'
            }}>
              <ul style={{ listStyle: 'none', margin: 0, padding: '0.5rem 0' }}>
                <li
                  style={{
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.1s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => {
                    // Handle My Profile action here
                    setProfileDropdownOpen(false);
                  }}
                >
                  My Profile
                </li>
                <li
                  style={{
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.1s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={handleSignOut}
                >
                  Sign Out
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <main className="dashboard-content" style={mainStyle}>
        {renderContent()}
      </main>
    </div>
  );
}

export default Dashboard;
