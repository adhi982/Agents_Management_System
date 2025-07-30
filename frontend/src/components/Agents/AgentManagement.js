import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import agentService from '../../services/agentService';
import AgentForm from './AgentForm';
import AgentList from './AgentList';

const AgentManagement = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await agentService.getAllAgents();
      setAgents(response.agents);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (agentData) => {
    try {
      const response = await agentService.createAgent(agentData);
      setAgents([response.agent, ...agents]);
      setShowForm(false);
      setEditingAgent(null);
      toast.success('Agent created successfully!');
    } catch (error) {
      console.error('Error creating agent:', error);
      toast.error(error.response?.data?.message || 'Failed to create agent');
    }
  };

  const handleUpdateAgent = async (agentData) => {
    try {
      const response = await agentService.updateAgent(editingAgent._id, agentData);
      setAgents(agents.map(agent => 
        agent._id === editingAgent._id ? response.agent : agent
      ));
      setEditingAgent(null);
      setShowForm(false);
      toast.success('Agent updated successfully!');
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error(error.response?.data?.message || 'Failed to update agent');
    }
  };

  const handleDeleteAgent = async (agentId) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) {
      return;
    }

    try {
      await agentService.deleteAgent(agentId);
      setAgents(agents.filter(agent => agent._id !== agentId));
      toast.success('Agent deleted successfully!');
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error(error.response?.data?.message || 'Failed to delete agent');
    }
  };

  const handleEditAgent = (agent) => {
    setEditingAgent(agent);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingAgent(null);
  };

  const handleAddNewAgent = () => {
    setEditingAgent(null);
    setShowForm(true);
  }

  if (loading) {
    return <div className="loading">Loading agents...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Agents</h2>
        {!showForm && (
          <button
            className="btn btn-primary"
            onClick={handleAddNewAgent}
          >
            Add New Agent
          </button>
        )}
      </div>

      {showForm && (
        <div className="card mb-4">
          <AgentForm
            agent={editingAgent}
            onSubmit={editingAgent ? handleUpdateAgent : handleCreateAgent}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <div className="card">
        <AgentList
          agents={agents}
          onEdit={handleEditAgent}
          onDelete={handleDeleteAgent}
        />
      </div>
    </div>
  );
};

export default AgentManagement;
