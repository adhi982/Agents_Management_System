import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const TeamManagement = () => {
  const { user } = useAuth();
  const [hierarchy, setHierarchy] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createType, setCreateType] = useState('manager'); // 'manager' or 'sub-agent'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobileNumber: ''
  });

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch hierarchy
      const hierarchyResponse = await axios.get('/api/users/hierarchy', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHierarchy(hierarchyResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching team data:', error);
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const endpoint = createType === 'manager' ? '/api/users/manager' : '/api/users/sub-agent';
      
      await axios.post(endpoint, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Reset form and refresh data
      setFormData({ name: '', email: '', password: '', mobileNumber: '' });
      setShowCreateForm(false);
      fetchTeamData();
      alert(`${createType === 'manager' ? 'Manager' : 'Sub-agent'} created successfully!`);
    } catch (error) {
      console.error('Error creating user:', error);
      alert(error.response?.data?.message || 'Error creating user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchTeamData();
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Error deleting user');
    }
  };

  const renderHierarchy = () => {
    if (user.role === 'admin') {
      return (
        <div className="hierarchy-view">
          <h4>Team Hierarchy</h4>
          <div className="admin-section">
            <div className="user-card admin-card">
              <h5>{hierarchy.admin?.name} (Admin)</h5>
              <p>{hierarchy.admin?.email}</p>
            </div>
            
            {hierarchy.managers?.map(manager => (
              <div key={manager._id} className="manager-section">
                <div className="user-card manager-card">
                  <h6>{manager.name} (Manager)</h6>
                  <p>{manager.email}</p>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteUser(manager._id)}
                  >
                    Delete
                  </button>
                </div>
                
                {manager.subAgents?.map(subAgent => (
                  <div key={subAgent._id} className="user-card sub-agent-card ml-3">
                    <span>{subAgent.name} (Sub-agent)</span>
                    <span>{subAgent.email}</span>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteUser(subAgent._id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ))}
            
            {hierarchy.directSubAgents?.map(subAgent => (
              <div key={subAgent._id} className="user-card sub-agent-card">
                <span>{subAgent.name} (Direct Sub-agent)</span>
                <span>{subAgent.email}</span>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteUser(subAgent._id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    } else if (user.role === 'manager') {
      return (
        <div className="hierarchy-view">
          <h4>My Team</h4>
          <div className="manager-section">
            <div className="user-card manager-card">
              <h5>{hierarchy.manager?.name} (Manager)</h5>
              <p>{hierarchy.manager?.email}</p>
            </div>
            
            {hierarchy.subAgents?.map(subAgent => (
              <div key={subAgent._id} className="user-card sub-agent-card">
                <span>{subAgent.name} (Sub-agent)</span>
                <span>{subAgent.email}</span>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteUser(subAgent._id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <div className="hierarchy-view">
          <h4>My Profile</h4>
          <div className="user-card sub-agent-card">
            <h5>{hierarchy.subAgent?.name} (Sub-agent)</h5>
            <p>{hierarchy.subAgent?.email}</p>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return <div>Loading team data...</div>;
  }

  return (
    <div className="team-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Team Management</h3>
        {(user.role === 'admin' || user.role === 'manager') && (
          <div className="btn-group">
            {user.role === 'admin' && (
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setCreateType('manager');
                  setShowCreateForm(true);
                }}
              >
                Add Manager
              </button>
            )}
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setCreateType('sub-agent');
                setShowCreateForm(true);
              }}
            >
              Add Sub-agent
            </button>
          </div>
        )}
      </div>

      {showCreateForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>Create New {createType === 'manager' ? 'Manager' : 'Sub-agent'}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateUser}>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                      minLength="6"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn-success me-2">
                  Create {createType === 'manager' ? 'Manager' : 'Sub-agent'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {renderHierarchy()}

      <style jsx>{`
        .hierarchy-view {
          margin-top: 20px;
        }
        .user-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          margin: 10px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .admin-card {
          background-color: #f8f9fa;
          border-color: #6c757d;
        }
        .manager-card {
          background-color: #e3f2fd;
          border-color: #2196f3;
          margin-left: 20px;
        }
        .sub-agent-card {
          background-color: #f3e5f5;
          border-color: #9c27b0;
          margin-left: 40px;
        }
        .manager-section {
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
};

export default TeamManagement;
