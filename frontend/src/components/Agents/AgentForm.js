import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AgentForm = ({ agent, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || '',
        email: agent.email || '',
        mobileNumber: agent.mobileNumber || '',
        password: '', // Don't populate password for editing
        isActive: agent.isActive !== undefined ? agent.isActive : true
      });
    } else {
      // Reset form for new agent
      setFormData({
        name: '',
        email: '',
        mobileNumber: '',
        password: '',
        isActive: true
      });
    }
  }, [agent]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.mobileNumber) {
      toast.error('Please fill in all required fields');
      return false;
    }
    if (!agent && !formData.password) {
      toast.error('Password is required for new agents');
      return false;
    }
    if (formData.password && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const submitData = { ...formData };
      
      // Don't send empty password for updates
      if (agent && !submitData.password) {
        delete submitData.password;
      }
      
      await onSubmit(submitData);
    } catch (error) {
      // Error is handled by the parent component's toast message
      console.error('Form submission error:', error);
    }
    
    setLoading(false);
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
        {agent ? 'Edit Agent' : 'Add New Agent'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name" className="form-label">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter agent name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="mobileNumber" className="form-label">Mobile Number</label>
          <input
            type="tel"
            id="mobileNumber"
            name="mobileNumber"
            className="form-control"
            value={formData.mobileNumber}
            onChange={handleChange}
            placeholder="e.g., +1234567890"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password {agent ? '(Optional)' : ''}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            placeholder={agent ? "Leave blank to keep current password" : "Enter password"}
            minLength="6"
            required={!agent}
          />
        </div>

        {agent && (
          <div className="form-group">
            <label className="form-label d-flex align-items-center" style={{ gap: '0.5rem' }}>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                style={{ width: '1rem', height: '1rem' }}
              />
              Active Agent
            </label>
          </div>
        )}

        <div className="d-flex justify-content-end" style={{ gap: '0.75rem', marginTop: '1.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (agent ? 'Update Agent' : 'Create Agent')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgentForm;
