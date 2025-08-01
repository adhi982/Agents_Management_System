import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AgentManagement from '../Agents/AgentManagement';
import FileUpload from '../Upload/FileUpload';
import DistributionView from '../Upload/DistributionView';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('agents');
  const { user } = useAuth();

  const getDashboardTitle = () => {
    switch (user?.role) {
      case 'admin':
        return 'Admin Dashboard';
      case 'agent':
        return 'Agent Dashboard';
      case 'sub-agent':
        return 'Sub-Agent Dashboard';
      default:
        return 'Dashboard';
    }
  };

  const getDashboardTabs = () => {
    const tabs = [];
    
    // Admin and Agent can see agent/user management
    if (user?.role === 'admin' || user?.role === 'agent') {
      tabs.push({
        key: 'agents',
        label: user?.role === 'admin' ? 'Agent Management' : 'Sub-Agent Management',
        component: <AgentManagement />
      });
    }

    // Upload functionality for Admin and Agent
    if (user?.role === 'admin' || user?.role === 'agent') {
      tabs.push({
        key: 'upload',
        label: 'Upload & Distribute',
        component: <FileUpload />
      });
    }

    // Distributions view for all roles (filtered by backend)
    tabs.push({
      key: 'distributions',
      label: user?.role === 'sub-agent' ? 'My Tasks' : 'View Distributions',
      component: <DistributionView />
    });

    return tabs;
  };

  const tabs = getDashboardTabs();

  const renderTabContent = () => {
    const activeTabData = tabs.find(tab => tab.key === activeTab);
    return activeTabData ? activeTabData.component : tabs[0]?.component;
  };

  const getWelcomeMessage = () => {
    switch (user?.role) {
      case 'admin':
        return `Welcome, ${user?.name}! Manage your agents and organization.`;
      case 'agent':
        return `Welcome, ${user?.name}! Manage your sub-agents and assignments.`;
      case 'sub-agent':
        return `Welcome, ${user?.name}! View your assigned tasks and work.`;
      default:
        return `Welcome, ${user?.name || user?.email}!`;
    }
  };

  return (
    <div className="container">
      <header className="mb-4">
        <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>{getDashboardTitle()}</h1>
        <p className="text-muted">{getWelcomeMessage()}</p>
        <div className="badge badge-primary mb-3">
          Role: {user?.role?.toUpperCase()}
        </div>
      </header>
      
      <div className="dashboard-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {renderTabContent()}
      </div>

      <style>{`
        .dashboard-tabs {
          display: flex;
          border-bottom: 2px solid #e9ecef;
          margin-bottom: 20px;
        }
        .tab-button {
          background: none;
          border: none;
          padding: 12px 24px;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
          font-weight: 500;
        }
        .tab-button:hover {
          background-color: #f8f9fa;
        }
        .tab-button.active {
          border-bottom-color: #007bff;
          color: #007bff;
          background-color: #f8f9fa;
        }
        .badge {
          font-size: 0.75rem;
          padding: 4px 8px;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
