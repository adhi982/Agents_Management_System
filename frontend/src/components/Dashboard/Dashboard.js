import React, { useState } from 'react';
import AgentManagement from '../Agents/AgentManagement';
import FileUpload from '../Upload/FileUpload';
import DistributionView from '../Upload/DistributionView';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('agents');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'agents':
        return <AgentManagement />;
      case 'upload':
        return <FileUpload />;
      case 'distributions':
        return <DistributionView />;
      default:
        return <AgentManagement />;
    }
  };

  return (
    <div className="container">
      <header className="mb-4">
        <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Admin Dashboard</h1>
      </header>
      
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'agents' ? 'active' : ''}`}
          onClick={() => setActiveTab('agents')}
        >
          Agent Management
        </button>
        <button
          className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload & Distribute
        </button>
        <button
          className={`tab-button ${activeTab === 'distributions' ? 'active' : ''}`}
          onClick={() => setActiveTab('distributions')}
        >
          View Distributions
        </button>
      </div>

      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Dashboard;
